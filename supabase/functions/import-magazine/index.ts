// =============================================================
// 이음미디어 - 매거진 RSS Import Edge Function (1차 MVP)
// -------------------------------------------------------------
// 목적: https://eummagazine.com/rss 의 41개 item을
//       public.articles 테이블에 upsert
//       (og:description 본문 평문 + JSON-LD summary + thumbnail)
// 위치: supabase/functions/import-magazine/index.ts
// 호출: POST https://<project>.supabase.co/functions/v1/import-magazine
// 인증: Authorization 헤더 필수 (Supabase 기본 verify_jwt=true)
// 권한: 함수 내부에서 service_role key로 supabase client → RLS 우회
// 트리거: 1차는 수동 POST. 2차에서 본문 HTML + 이미지 백업 추가 예정.
//
// 환경변수 (Edge Function Secrets):
//   SUPABASE_URL              (Supabase 자동 주입)
//   SUPABASE_SERVICE_ROLE_KEY (Supabase 자동 주입)
//   AUTHOR_UUID               (수동 — 봇 계정 UUID)
//   RSS_URL                   (선택 — default: eummagazine.com/rss)
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// -------------------------------------------------------------
// 환경변수 로드 (검증은 핸들러 STEP 0에서 처리)
// -------------------------------------------------------------
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')              ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const AUTHOR_UUID               = Deno.env.get('AUTHOR_UUID')               ?? ''
const RSS_URL                   = Deno.env.get('RSS_URL') ?? 'https://eummagazine.com/rss'

// -------------------------------------------------------------
// 실행 상수 (튜닝 시 수정)
// -------------------------------------------------------------
const FETCH_CONCURRENCY    = 5
const FETCH_BATCH_DELAY_MS = 300
const FETCH_TIMEOUT_MS     = 15_000

// -------------------------------------------------------------
// 타입 정의
// -------------------------------------------------------------
type RssItem = {
  title:     string
  link:      string
  thumbnail: string | null
  pubDate:   string
}

type ParsedLink = {
  boardId: number  // 15~21
  idx:     string  // 매거진 게시물 ID, 예: "171013458"
}

type ArticleRow = {
  channel_id:    string
  author_id:     string
  title:         string
  slug:          string
  summary:       string | null
  content:       string
  thumbnail_url: string | null
  status:        'published'
  published_at:  string | null
}

type ArticleMetadata = {
  ogDescription:     string | null
  jsonLdDescription: string | null
}

type ChunkOptions = {
  concurrency:           number
  delayBetweenBatchesMs: number
}

type ChunkResult<R> = {
  results: (R | null)[]
  errors:  Array<{ index: number; error: string }>
}

type ImportError = {
  link?:   string
  reason:  string
  detail?: unknown
}

type ImportResult = {
  ok:         boolean
  fetched:    number
  upserted:   number
  skipped:    number
  errors:     ImportError[]
  stepFailed: string | null
  durationMs: number
}

// =============================================================
// Helper 1) htmlDecode — 명명 11개 + 숫자 entity (10진/16진)
// =============================================================
const HTML_NAMED_ENTITIES: Record<string, string> = {
  'quot':   '"',
  'apos':   "'",
  'middot': '·',
  'mdash':  '—',
  'ndash':  '–',
  'lsquo':  '‘',
  'rsquo':  '’',
  'ldquo':  '“',
  'rdquo':  '”',
  'nbsp':   ' ',
  'hellip': '…',
  'lt':     '<',
  'gt':     '>',
  // 'amp'는 의도적 제외 — 별도 step 1에서 먼저 처리
}

function htmlDecode(s: string): string {
  if (!s) return s
  return s
    // 1) &amp; FIRST — 이중 인코딩(&amp;quot;) 대응
    .replace(/&amp;/g, '&')
    // 2) 16진 숫자 entity
    .replace(/&#x([0-9a-fA-F]+);/g, (raw, hex) => {
      const cp = parseInt(hex, 16)
      return Number.isFinite(cp) && cp >= 0 && cp <= 0x10FFFF
        ? String.fromCodePoint(cp) : raw
    })
    // 3) 10진 숫자 entity
    .replace(/&#(\d+);/g, (raw, dec) => {
      const cp = parseInt(dec, 10)
      return Number.isFinite(cp) && cp >= 0 && cp <= 0x10FFFF
        ? String.fromCodePoint(cp) : raw
    })
    // 4) 명명 entity
    .replace(
      /&(quot|apos|middot|mdash|ndash|lsquo|rsquo|ldquo|rdquo|nbsp|hellip|lt|gt);/g,
      (raw, name) => HTML_NAMED_ENTITIES[name] ?? raw,
    )
}

// =============================================================
// Helper 2) extractFromLink — RSS link → boardId, idx
// =============================================================
function extractFromLink(link: string): ParsedLink | null {
  if (!link) return null
  // /shop_view/?idx=N 같은 비-기사 URL은 매칭 실패 → null → skip
  const m = link.match(/\/(\d{2})\/\?idx=(\d+)/)
  if (!m) return null
  return {
    boardId: parseInt(m[1], 10),
    idx:     m[2],
  }
}

// =============================================================
// Helper 3) parsePubDate — RFC 822 → ISO 8601 (UTC)
// =============================================================
function parsePubDate(s: string): string | null {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

// =============================================================
// Helper 4) parseRssItems — RSS XML → RssItem[]
// =============================================================
function parseRssItems(xml: string): RssItem[] {
  if (!xml) return []
  const items: RssItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1]
    const title     = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '').trim()
    const link      = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '').trim()
    const pubDate   = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? '').trim()
    const thumbnail = block.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ?? null
    items.push({ title, link, thumbnail, pubDate })
  }
  return items
}

// =============================================================
// Helper 5) fetchArticlePage — UA + 15s timeout
// =============================================================
async function fetchArticlePage(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EumMediaImporter/1.0)',
      },
    })
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
    }
    return await resp.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

// =============================================================
// Helper 6) extractArticleMetadata — HTML → og + JSON-LD description
// =============================================================
function extractArticleMetadata(html: string): ArticleMetadata {
  // (a) og:description (HTML attribute - entity 인코딩 그대로 들어있음)
  const ogMatch = html.match(/property="og:description"\s+content="([^"]+)"/)
  const ogDescription = ogMatch ? htmlDecode(ogMatch[1]) : null

  // (b) NewsArticle JSON-LD의 description (페이지에 ld+json 여러 개)
  let jsonLdDescription: string | null = null
  const scriptRe = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g
  let scriptMatch: RegExpExecArray | null
  while ((scriptMatch = scriptRe.exec(html)) !== null) {
    const body = scriptMatch[1]
    // @type 띄어쓰기 변형 둘 다 체크
    if (!/"@type"\s*:\s*"NewsArticle"/.test(body)) continue
    // description capture (JSON 문자열 escape 처리 위함)
    const descMatch = body.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/)
    if (!descMatch) break
    try {
      // JSON 문자열 한 번 더 파싱 → \", \\, \uXXXX 디코드
      const decoded = JSON.parse('"' + descMatch[1] + '"') as string
      // 추가로 HTML entity 처리
      jsonLdDescription = htmlDecode(decoded)
    } catch {
      jsonLdDescription = null
    }
    break
  }

  return { ogDescription, jsonLdDescription }
}

// =============================================================
// Helper 7) processInChunks — 동시성 제어 청크 처리
// =============================================================
async function processInChunks<T, R>(
  items: T[],
  fn:    (item: T, idx: number) => Promise<R>,
  opts:  ChunkOptions,
): Promise<ChunkResult<R>> {
  const results: (R | null)[] = new Array(items.length).fill(null)
  const errors: Array<{ index: number; error: string }> = []

  for (let i = 0; i < items.length; i += opts.concurrency) {
    const batch = items.slice(i, i + opts.concurrency)
    await Promise.all(
      batch.map(async (item, j) => {
        const idx = i + j
        try {
          results[idx] = await fn(item, idx)
        } catch (e) {
          errors.push({
            index: idx,
            error: e instanceof Error ? e.message : String(e),
          })
        }
      }),
    )
    // 마지막 배치 뒤엔 대기하지 않음
    if (i + opts.concurrency < items.length) {
      await new Promise(resolve => setTimeout(resolve, opts.delayBetweenBatchesMs))
    }
  }
  return { results, errors }
}

// =============================================================
// 응답/에러 유틸
// =============================================================
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

// =============================================================
// 메인 핸들러 (Deno.serve, 6 STEP)
// =============================================================
Deno.serve(async (req: Request): Promise<Response> => {
  const startTime = Date.now()

  // 결과 객체 — 각 STEP에서 점진적으로 채움
  const result: ImportResult = {
    ok:         false,
    fetched:    0,
    upserted:   0,
    skipped:    0,
    errors:     [],
    stepFailed: null,
    durationMs: 0,
  }

  // 메서드 가드 (POST만 허용)
  if (req.method !== 'POST') {
    return jsonResponse(
      { ...result, errors: [{ reason: `Method ${req.method} not allowed` }] },
      405,
    )
  }

  // -----------------------------------------------------------
  // STEP 0: 환경변수 검증
  // -----------------------------------------------------------
  try {
    const missing: string[] = []
    if (!SUPABASE_URL)              missing.push('SUPABASE_URL')
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (!AUTHOR_UUID)               missing.push('AUTHOR_UUID')
    if (missing.length > 0) {
      throw new Error(`환경변수 누락: ${missing.join(', ')}`)
    }
  } catch (e) {
    result.stepFailed = 'STEP 0'
    result.errors.push({ reason: errMsg(e) })
    result.durationMs = Date.now() - startTime
    return jsonResponse(result, 500)
  }

  // service_role 클라이언트 (RLS 우회)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // -----------------------------------------------------------
  // STEP 1: RSS fetch
  // -----------------------------------------------------------
  let xml: string
  try {
    xml = await fetchArticlePage(RSS_URL)
  } catch (e) {
    result.stepFailed = 'STEP 1'
    result.errors.push({ reason: `RSS fetch 실패: ${errMsg(e)}` })
    result.durationMs = Date.now() - startTime
    return jsonResponse(result, 502)
  }

  // -----------------------------------------------------------
  // STEP 2: XML parse
  // -----------------------------------------------------------
  let items: RssItem[]
  try {
    items = parseRssItems(xml)
    if (items.length === 0) throw new Error('RSS에 <item> 0건')
    result.fetched = items.length
  } catch (e) {
    result.stepFailed = 'STEP 2'
    result.errors.push({ reason: errMsg(e) })
    result.durationMs = Date.now() - startTime
    return jsonResponse(result, 500)
  }

  // -----------------------------------------------------------
  // STEP 3: 채널 매핑 로드 (channels 테이블 SELECT)
  // -----------------------------------------------------------
  let channelMap: Map<number, string>
  try {
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, slug')
    if (error) throw error
    channelMap = new Map<number, string>()
    for (const row of channels ?? []) {
      const tail = String(row.slug).split('-').pop()
      const boardId = parseInt(tail ?? '', 10)
      if (Number.isFinite(boardId)) channelMap.set(boardId, String(row.id))
    }
    if (channelMap.size !== 7) {
      throw new Error(
        `channels 7행 기대, ${channelMap.size}행 발견 ` +
        `(boardIds: ${[...channelMap.keys()].sort().join(',')})`,
      )
    }
  } catch (e) {
    result.stepFailed = 'STEP 3'
    result.errors.push({ reason: errMsg(e) })
    result.durationMs = Date.now() - startTime
    return jsonResponse(result, 500)
  }

  // -----------------------------------------------------------
  // STEP 4a: pre-filter — link 디코드 + shop_view skip + boardId 매핑
  // -----------------------------------------------------------
  type Fetchable = {
    item:      RssItem
    parsed:    ParsedLink
    channelId: string
    cleanLink: string  // ① htmlDecode 적용된 link
  }
  const fetchable: Fetchable[] = []

  for (const item of items) {
    // ① link &amp; → & 디코드 (이후 모든 단계에서 cleanLink 사용)
    const cleanLink = htmlDecode(item.link)

    // ② shop_view 등 비-기사 URL → 정상 skip (errors엔 기록 안 함)
    const parsed = extractFromLink(cleanLink)
    if (!parsed) {
      result.skipped++
      continue
    }

    // ③ boardId 매핑 안 됨 (방어)
    const channelId = channelMap.get(parsed.boardId)
    if (!channelId) {
      result.skipped++
      result.errors.push({
        link:   cleanLink,
        reason: `unmapped boardId: ${parsed.boardId}`,
      })
      continue
    }

    fetchable.push({ item, parsed, channelId, cleanLink })
  }

  // -----------------------------------------------------------
  // STEP 4b: 페이지 fetch + 메타데이터 추출 (5 동시 + 300ms)
  // -----------------------------------------------------------
  type Fetched = { fet: Fetchable; metadata: ArticleMetadata }
  let pageResults: ChunkResult<Fetched>
  try {
    pageResults = await processInChunks<Fetchable, Fetched>(
      fetchable,
      async (f) => {
        const html = await fetchArticlePage(f.cleanLink)
        const metadata = extractArticleMetadata(html)
        return { fet: f, metadata }
      },
      { concurrency: FETCH_CONCURRENCY, delayBetweenBatchesMs: FETCH_BATCH_DELAY_MS },
    )
    // 청크 처리 중 발생한 fetch 실패를 result로 합침 + skipped 증가
    for (const err of pageResults.errors) {
      const fail = fetchable[err.index]
      result.skipped++
      result.errors.push({
        link:   fail?.cleanLink,
        reason: `page fetch 실패: ${err.error}`,
      })
    }
  } catch (e) {
    result.stepFailed = 'STEP 4b'
    result.errors.push({ reason: errMsg(e) })
    result.durationMs = Date.now() - startTime
    return jsonResponse(result, 500)
  }

  // -----------------------------------------------------------
  // STEP 4c: rows 변환 (성공한 fetch만 — null은 건너뜀)
  // -----------------------------------------------------------
  const rows: ArticleRow[] = []

  for (let i = 0; i < pageResults.results.length; i++) {
    const page = pageResults.results[i]

    // fetch 실패 (null) → 건너뜀 (errors엔 이미 STEP 4b에서 기록됨)
    if (!page) continue

    const f = page.fet
    try {
      // title 디코드 + 길이 제한 (DB check: 1~200자)
      let title = htmlDecode(f.item.title).trim()
      if (title.length === 0) {
        result.skipped++
        result.errors.push({ link: f.cleanLink, reason: 'title 비어있음' })
        continue
      }
      if (title.length > 200) title = title.slice(0, 197) + '...'

      // content = og:description (필수). 없으면 INSERT 제외
      const ogDesc = page.metadata.ogDescription
      if (!ogDesc) {
        result.skipped++
        result.errors.push({ link: f.cleanLink, reason: 'og:description 없음' })
        continue
      }

      // summary = JSON-LD description 첫 150자 (없으면 NULL)
      const summary = page.metadata.jsonLdDescription
        ? page.metadata.jsonLdDescription.slice(0, 150)
        : null

      // pubDate
      const publishedAt = parsePubDate(f.item.pubDate)

      rows.push({
        channel_id:    f.channelId,
        author_id:     AUTHOR_UUID,
        title,
        slug:          f.parsed.idx,
        summary,
        content:       ogDesc,
        thumbnail_url: f.item.thumbnail,
        status:        'published',
        published_at:  publishedAt,
      })
    } catch (e) {
      result.skipped++
      result.errors.push({ link: f.cleanLink, reason: `transform 실패: ${errMsg(e)}` })
    }
  }

  // -----------------------------------------------------------
  // STEP 5: articles upsert (한 번에)
  // -----------------------------------------------------------
  try {
    if (rows.length === 0) {
      result.ok = true
      result.upserted = 0
    } else {
      const { data, error } = await supabase
        .from('articles')
        .upsert(rows, {
          onConflict:       'channel_id,slug',
          ignoreDuplicates: false,
        })
        .select('id, slug')
      if (error) throw error
      result.upserted = data?.length ?? 0
      result.ok = true
    }
  } catch (e) {
    result.stepFailed = 'STEP 5'
    result.errors.push({ reason: `articles upsert 실패: ${errMsg(e)}` })
    result.durationMs = Date.now() - startTime
    return jsonResponse(result, 500)
  }

  // -----------------------------------------------------------
  // STEP 6: 최종 결과 반환
  // -----------------------------------------------------------
  result.durationMs = Date.now() - startTime
  return jsonResponse(result, 200)
})
