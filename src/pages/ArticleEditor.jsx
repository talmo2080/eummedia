import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const GREEN = '#1a6b3c'
const ORANGE = '#c45c0a'
const PURPLE = '#5c2d8a'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const CHANNELS = [
  '이음매거진', '이음피플', '이음로컬',
  '이음에듀', '이음트렌드', '이음보이스', '이음뷰',
]

// channel_id (UUID) → 한글 채널명 역매핑 — 이어쓰기 시 사용
const ID_TO_CHANNEL = {
  'd8306e54-ca06-4929-8d27-8419c3ffe838': '이음매거진',
  '0208677a-f569-4dc4-be76-6d9cb50272ca': '이음피플',
  'e4eef54f-edd2-4511-90ea-256ebfca1613': '이음로컬',
  'de1c5c18-ae09-4c2b-8525-ef02d6e17ec6': '이음에듀',
  'e41c0a6c-88dd-4098-b948-a7d64f4379c1': '이음트렌드',
  '18b19e3f-0053-4038-9c25-18de51c60bac': '이음보이스',
  'a9eb95f1-3ef9-4596-b53a-938523239367': '이음뷰',
}

const CHANNEL_ID_MAP = {
  '이음매거진': 'd8306e54-ca06-4929-8d27-8419c3ffe838',
  '이음피플':   '0208677a-f569-4dc4-be76-6d9cb50272ca',
  '이음로컬':   'e4eef54f-edd2-4511-90ea-256ebfca1613',
  '이음에듀':   'de1c5c18-ae09-4c2b-8525-ef02d6e17ec6',
  '이음트렌드': 'e41c0a6c-88dd-4098-b948-a7d64f4379c1',
  '이음보이스': '18b19e3f-0053-4038-9c25-18de51c60bac',
  '이음뷰':     'a9eb95f1-3ef9-4596-b53a-938523239367',
}

const GUIDE_CARDS = [
  {
    icon: '🔍',
    title: '제목이 검색을 결정합니다',
    bg: '#eef3fa',
    border: NAVY,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong style={{ color: RED }}>❌ 나쁜 예:</strong> "고양시에서 열린 행사"
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong style={{ color: GREEN }}>✅ 좋은 예:</strong> "고양시 일산 5월 도예 전시회, 무료 입장 가능"
        </p>
        <p style={{ margin: '0 0 8px 0' }}>→ 지역명 + 핵심단어 + 구체적 정보를 제목 앞쪽에!</p>
        <p style={{ margin: 0 }}>→ 30자 이내가 검색에서 잘리지 않아요.</p>
      </>
    ),
  },
  {
    icon: '✍️',
    title: '첫 문단이 가장 중요합니다',
    bg: '#eef7f2',
    border: GREEN,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>AI와 검색엔진은 첫 문단에서 기사 핵심을 파악해요.</p>
        <p style={{ margin: '0 0 12px 0' }}>다섯 가지를 첫 문단에 담으세요:</p>
        <p style={{ margin: 0, fontWeight: 600 }}>
          누가(Who) · 언제(When) · 어디서(Where) · 무엇을(What) · 왜(Why)
        </p>
      </>
    ),
  },
  {
    icon: '🏷️',
    title: '태그는 독자를 불러오는 문입니다',
    bg: '#fef6ee',
    border: ORANGE,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>태그 없이 발행 = 아무도 못 찾아요.</p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong>좋은 태그 예시:</strong> #고양시 #일산 #도예전시 #무료전시 #5월행사
        </p>
        <p style={{ margin: 0 }}>→ 지역명 필수 + 주제 키워드 3개 이상!</p>
      </>
    ),
  },
  {
    icon: '📸',
    title: '사진 한 장이 클릭을 만듭니다',
    bg: '#f4eefc',
    border: PURPLE,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>대표 이미지 없으면 기사 목록에서 눈에 띄지 않아요.</p>
        <p style={{ margin: '0 0 12px 0' }}>
          사진 설명(alt텍스트)에도 키워드를 넣으면 구글 이미지 검색에서도 노출돼요.
        </p>
        <p style={{ margin: 0 }}>
          <strong>예:</strong> "고양시 닥터리부트 두피케어 체험 행사"
        </p>
      </>
    ),
  },
]

const CHECK_DESC = {
  // 1단계 기사 기본 구조
  titleClear: '제목만 봐도 무슨 기사인지 단번에 알 수 있어야 합니다. 너무 길면 검색 화면에서 잘려 나갑니다.',
  leadParagraph: '누가, 언제, 어디서, 무엇을, 왜 했는지 첫 문단(3줄 이내)에 요약하세요. AI는 첫 문단에서 기사의 정체성을 파악합니다.',
  thumbnail: '기사 목록에 보일 이미지를 반드시 설정해야 합니다. 사진이 없으면 포털 검색 결과에서 외면당합니다.',
  contentLength: '텍스트가 너무 짧으면 구글과 네이버 검색 엔진이 \'정보가 부실한 글\'로 분류하여 노출을 제한합니다.',
  spelling: '포털 맞춤법 검사기를 활용해 문장을 다듬어 주세요. 오탈자가 없는 글이 이음미디어의 신뢰도를 만듭니다.',
  // 2단계 AI·검색 최적화
  channelCorrect: '이음피플, 이음로컬 등 기사 성격에 맞는 채널을 올바르게 선택해야 타겟 독자에게 정확히 배달됩니다.',
  tags: '지역명, 업체명, 핵심 주제(예: 고양시, 파크골프, 우울증 극복 등)를 태그로 입력해야 검색 연동이 시작됩니다.',
  titleKeyword: 'AI 검색은 제목 앞쪽에 키워드가 있는 글을 신뢰합니다. 가장 중요한 단어를 제목 맨 앞에 넣으세요.',
  summary: '기사 핵심을 80자 이내로 요약해 넣으세요. AI가 답변 출처를 긁어갈 때 최우선으로 읽는 영역입니다.',
  alt: '사진 설명란에 키워드를 넣어주세요. (예: "태리TV 유튜버 윤진희 이사 인터뷰 현장") 로봇이 사진을 텍스트로 인식하게 돕습니다.',
  // 3단계 최종 발행 준비
  fact: '기사에 사용된 날짜, 장소, 금액, 연도 등의 숫자가 정확한지 메모와 대조해 다시 확인합니다.',
  source: '인터뷰 대상자의 이름 오자는 언론사로서 가장 큰 실수입니다. 명함이나 녹취를 통해 한 번 더 확인하세요.',
  kakao: '발행 즉시 독자들에게 전송할 호기심 자극용 한 줄 카피와 기사 링크를 미리 작성해 둡니다.',
  instagram: '#이음미디어를 포함해 독자들이 인스타에서 검색할 법한 관련 해시태그를 5개 이상 조합해 둡니다.',
  editorReview: '이음미디어의 모든 기사는 발행 전 편집국장(정세연)에게 초안을 전송하고, 최종 확인을 거친 후 세상에 나갑니다.',
}

const inp = (extra = {}) => ({
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #d0d0d0',
  borderRadius: 8,
  fontSize: 18,
  fontFamily: SANS,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  lineHeight: 1.5,
  ...extra,
})

const lbl = {
  display: 'block',
  fontSize: 20,
  fontWeight: 700,
  color: NAVY,
  marginBottom: 12,
  lineHeight: 1.5,
}

const card = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: '28px',
  marginBottom: 20,
}

function ProgressBar({ label, current, max, color }) {
  const pct = max > 0 ? (current / max) * 100 : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 16, fontWeight: 600, color: '#3a3a3a', marginBottom: 8,
      }}>
        <span>{label}</span>
        <span>{current}/{max}</span>
      </div>
      <div style={{ background: '#e5e5e5', height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          transition: 'width 0.25s ease',
        }} />
      </div>
    </div>
  )
}

function CheckItem({ item, onToggle, showRedHighlight }) {
  const done = item.done
  const isAuto = item.isAuto
  // 자동 항목: 잠금(클릭 불가) + 옅은 녹색 배경
  // 수동 항목: 클릭 가능 + done이면 녹색, 아니면 흰색
  // 빨간 강조: showRedHighlight && !done (자동/수동 무관 — 미충족 모두 강조)
  const bgColor = done ? '#eef7f2' : (showRedHighlight ? '#fff5f5' : '#fff')
  const borderColor = showRedHighlight && !done
    ? '#e74c3c'
    : (done ? '#c4e4d2' : '#e5e5e5')
  const borderLeftWidth = showRedHighlight && !done ? 4 : 1
  return (
    <li
      onClick={() => !isAuto && onToggle(item.mkey)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '18px 20px', marginBottom: 10,
        borderRadius: 10,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderLeft: `${borderLeftWidth}px solid ${borderColor}`,
        cursor: isAuto ? 'default' : 'pointer',
        transition: 'all 0.15s',
        minHeight: 64, boxSizing: 'border-box',
        opacity: isAuto && !done ? 0.85 : 1,
      }}>
      <span style={{
        flexShrink: 0, width: 24, height: 24,
        border: `2px solid ${done ? GREEN : (showRedHighlight && !done ? '#e74c3c' : '#bbb')}`,
        background: done ? GREEN : '#fff',
        color: '#fff', fontSize: 16, lineHeight: '20px',
        textAlign: 'center', borderRadius: 4, marginTop: 2,
      }}>
        {done ? '✓' : ''}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 18, fontWeight: 600,
          color: done ? GREEN : (showRedHighlight && !done ? '#c0392b' : '#1a1a1a'),
          lineHeight: 1.5,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          {item.label}
          {isAuto && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#666',
              background: '#e8eef5', padding: '2px 8px', borderRadius: 12,
            }}>🔒 자동 체크</span>
          )}
        </div>
        {item.desc && (
          <div style={{ fontSize: 15, color: '#666', marginTop: 6, lineHeight: 1.6 }}>
            {item.desc}
          </div>
        )}
        {item.action && (
          <div onClick={(e) => e.stopPropagation()}>
            {item.action}
          </div>
        )}
      </div>
    </li>
  )
}

function formatNow() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid #e5e5e5',
      fontSize: 17,
    }}>
      <span style={{ width: 110, color: '#666', fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, color: '#1a1a1a' }}>{value}</span>
    </div>
  )
}

export default function ArticleEditor() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')   // 이어쓰기 모드 — /write?id=xxx
  const [viewMode, setViewMode] = useState('edit')
  const [savedAt, setSavedAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState(1)
  const [channel, setChannel] = useState('')
  const [title, setTitle] = useState('')
  const [reporter, setReporter] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [summary, setSummary] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [content, setContent] = useState('')
  const [inlineAdImage, setInlineAdImage] = useState('')
  const [inlineAdLink, setInlineAdLink] = useState('')
  const [inlineAdTitle, setInlineAdTitle] = useState('')
  const [inlineAdSubtitle, setInlineAdSubtitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [originalStatus, setOriginalStatus] = useState(null)
  const fileInputRef = useRef(null)
  const contentRef = useRef(null)

  // admin/publisher만 다른 기자 글 fetch + 발행본 그대로 저장 가능
  const isAdminOrPublisher = profile?.role === 'admin' || profile?.role === 'publisher'

  // 서식 5종 — 커서 위치에 태그 삽입 (선택 텍스트 있으면 감싸기, 없으면 기본 텍스트 자동 선택)
  const FORMAT_ACTIONS = [
    { label: '굵게',     icon: 'B',  title: '굵게 — 선택 텍스트 강조 (**텍스트**)',          before: '**',        after: '**',         defaultText: '굵게' },
    { label: '소제목',   icon: 'H',  title: '소제목 — 단락 머리 (## 소제목)',                before: '\n## ',     after: '\n',         defaultText: '소제목' },
    { label: '인용구',   icon: '"',  title: '인용구 — 출처·인터뷰 ([quote]...[/quote])',     before: '\n[quote]', after: '[/quote]\n', defaultText: '인용 내용' },
    { label: '강조박스', icon: '★', title: '강조박스 — 포인트 ([box]...[/box])',            before: '\n[box]',   after: '[/box]\n',   defaultText: '강조할 내용' },
    { label: '정보박스', icon: 'ℹ', title: '정보박스 — 보조 정보 ([info]...[/info])',       before: '\n[info]',  after: '[/info]\n',  defaultText: '정보 내용' },
  ]

  const insertOrWrap = (before, after, defaultText) => {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    const inner = selected || defaultText
    const snippet = before + inner + after
    const newContent = content.slice(0, start) + snippet + content.slice(end)
    setContent(newContent)
    // 커서 위치 갱신: 선택 텍스트가 있었으면 끝으로, 없었으면 defaultText 자동 선택
    setTimeout(() => {
      ta.focus()
      if (!selected) {
        ta.setSelectionRange(start + before.length, start + before.length + defaultText.length)
      } else {
        ta.setSelectionRange(start + snippet.length, start + snippet.length)
      }
    }, 0)
  }

  // 시민기자 수동 체크 7개 (자동 7개는 derive, editorReview 1개는 편집장 전용)
  const [manualChecks, setManualChecks] = useState({
    leadParagraph: false,
    spelling: false,
    titleKeyword: false,
    fact: false,
    source: false,
    kakao: false,
    instagram: false,
  })
  const toggleManual = (key) => setManualChecks(c => ({ ...c, [key]: !c[key] }))

  // 맞춤법 검사 — Anthropic API 직접 호출 (Claude Haiku)
  // ⚠️ 보안 위험: API 키가 클라 번들에 노출 (VITE_ANTHROPIC_API_KEY)
  // ⚠️ CORS 위험: Anthropic API는 브라우저 직접 호출 차단할 수 있음 (필요 시 dangerouslyAllowBrowser)
  const handleSpellCheck = async () => {
    if (isSpellChecking) return
    if (!content.trim()) {
      alert('본문을 먼저 입력해주세요.')
      return
    }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      alert('맞춤법 검사 키가 설정되지 않았습니다. (관리자에게 문의)')
      return
    }
    setIsSpellChecking(true)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `다음 글의 맞춤법과 오탈자를 검사해주세요.
오류가 없으면 "이상 없음"만,
오류가 있으면 번호 목록으로 수정 제안 3건 이내만 출력하세요.

글: ${content.slice(0, 800)}`,
          }],
        }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const errBody = await response.text()
        alert(`맞춤법 검사 실패 (${response.status}):\n${errBody.slice(0, 400)}`)
        return
      }
      const data = await response.json()
      const result = data?.content?.[0]?.text || ''
      if (!result) {
        alert('맞춤법 검사 응답 형식 오류')
        return
      }
      if (result.includes('이상 없음')) {
        alert('✅ 맞춤법 이상 없습니다')
      } else {
        alert(`⚠️ 맞춤법 수정 제안:\n${result}\n\n확인 후 수정해보세요`)
      }
      // 검사를 한 것 자체로 5번 spelling = true 처리
      setManualChecks(c => ({ ...c, spelling: true }))
    } catch (err) {
      if (err.name === 'AbortError') {
        alert('맞춤법 검사 시간 초과 (15초). 다시 시도해주세요.')
      } else {
        alert(`맞춤법 검사 중 오류: ${err.message || '알 수 없는 오류'}`)
      }
    } finally {
      clearTimeout(timer)
      setIsSpellChecking(false)
    }
  }

  // 이어쓰기 모드: /write?id=xxx 진입 시 기존 기사 fetch + 폼 복원
  //   · 시민기자(writer): 본인 글만 (author_id 필터)
  //   · 편집국장/발행인(admin/publisher): 모든 기사 (author_id 필터 제거)
  //   · profile 로드 전엔 fetch 보류 — admin이 author_id 필터로 잘못 막히는 것 방지
  useEffect(() => {
    if (!editId || !user || !profile) return
    let cancelled = false
    ;(async () => {
      let q = supabase
        .from('articles')
        .select('*')
        .eq('id', editId)
      if (!isAdminOrPublisher) q = q.eq('author_id', user.id)
      const { data, error } = await q.maybeSingle()
      if (cancelled) return
      if (error || !data) {
        alert('해당 기사를 불러올 수 없습니다.')
        navigate('/mypage')
        return
      }
      setTitle(data.title || '')
      setChannel(ID_TO_CHANNEL[data.channel_id] || '')
      setContent(data.content || '')
      setSummary(data.summary || '')
      setTags(Array.isArray(data.tags) ? data.tags : [])
      setThumbnailUrl(data.thumbnail_url || '')
      setImageAlt(data.image_alt || '')
      setVideoUrl(data.video_url || '')
      setReporter(data.author_name || '')
      setExternalUrl(data.external_url || '')
      setInlineAdImage(data.inline_ad_image || '')
      setInlineAdLink(data.inline_ad_link || '')
      setInlineAdTitle(data.inline_ad_title || '')
      setInlineAdSubtitle(data.inline_ad_subtitle || '')
      setOriginalStatus(data.status || null)
      // citizen_checks JSONB에서 수동 7개만 복원 (자동 7개는 derive)
      if (data.citizen_checks && typeof data.citizen_checks === 'object') {
        const manualKeys = ['leadParagraph', 'spelling', 'titleKeyword', 'fact', 'source', 'kakao', 'instagram']
        const restored = {}
        manualKeys.forEach(k => { if (data.citizen_checks[k]) restored[k] = true })
        setManualChecks(prev => ({ ...prev, ...restored }))
      }
    })()
    return () => { cancelled = true }
  }, [editId, user, profile, isAdminOrPublisher, navigate])

  const [showRedHighlight, setShowRedHighlight] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [isSpellChecking, setIsSpellChecking] = useState(false)

  // tags 안전 처리 — array/string 둘 다 대응 (fix: 빈 문자열 제외 + trim)
  const validTagsCount = Array.isArray(tags)
    ? tags.filter(t => typeof t === 'string' && t.trim()).length
    : (typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean).length
        : 0)

  // 탭1 입력값 기반 자동 체크 7개 derive (편집국장 영역 1개 제외 = 시민기자 14개 중 7개)
  // 보안: 아무 키나 눌러도 자동 체크되지 않게 길이 기준 강화 + 명시적 boolean 변환
  const autoChecks = {
    titleClear:     typeof title === 'string' && title.length >= 10 && title.length <= 30,
    thumbnail:      typeof thumbnailUrl === 'string' && thumbnailUrl.trim().length > 0,
    contentLength:  typeof content === 'string' && content.length >= 500,
    channelCorrect: typeof channel === 'string' && channel.trim().length > 0,
    tags:           validTagsCount >= 3,
    summary:        typeof summary === 'string' && summary.length >= 20,
    alt:            typeof imageAlt === 'string' && imageAlt.length >= 5,
  }
  // 시민기자 14개 합산 — 자동 7 + 수동 7
  const allChecks = { ...autoChecks, ...manualChecks }

  // 시민기자 14개 (15번 editorReview는 편집장 전용 — 별도 분리)
  const stage1 = [
    { label: '1. 제목의 명확성 (30자 이내)',        mkey: 'titleClear',     desc: CHECK_DESC.titleClear,     isAuto: true,  done: allChecks.titleClear },
    { label: '2. 두괄식 첫 문단 작성',              mkey: 'leadParagraph',  desc: CHECK_DESC.leadParagraph,  isAuto: false, done: allChecks.leadParagraph },
    { label: '3. 대표 이미지(썸네일) 설정',         mkey: 'thumbnail',      desc: CHECK_DESC.thumbnail,      isAuto: true,  done: allChecks.thumbnail },
    { label: '4. 본문 분량 확보 (500자 이상)',      mkey: 'contentLength',  desc: CHECK_DESC.contentLength,  isAuto: true,  done: allChecks.contentLength },
    { label: '5. 맞춤법 및 오탈자 최종 검사',       mkey: 'spelling',       desc: CHECK_DESC.spelling,       isAuto: false, done: allChecks.spelling,
      action: (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSpellCheck() }}
          disabled={isSpellChecking}
          style={{
            fontSize: 13, fontWeight: 700,
            padding: '8px 14px', marginTop: 10,
            background: isSpellChecking ? '#999' : '#1c4f8a', color: '#fff',
            border: 'none', borderRadius: 6,
            cursor: isSpellChecking ? 'not-allowed' : 'pointer',
            fontFamily: SANS,
          }}
        >
          {isSpellChecking ? '⏳ 검사 중...' : '🔍 검사하기'}
        </button>
      )
    },
  ]
  const stage2 = [
    { label: '6. 카테고리(채널)의 정확한 선택 [SEO]',  mkey: 'channelCorrect', desc: CHECK_DESC.channelCorrect, isAuto: true,  done: allChecks.channelCorrect },
    { label: '7. 태그(키워드) 3개 이상 입력 [SEO]',    mkey: 'tags',           desc: CHECK_DESC.tags,           isAuto: true,  done: allChecks.tags },
    { label: '8. 제목 내 핵심 키워드 전면 배치 [AI]',  mkey: 'titleKeyword',   desc: CHECK_DESC.titleKeyword,   isAuto: false, done: allChecks.titleKeyword },
    { label: '9. 메타 설명(기사 한 줄 요약) 입력 [AI]',mkey: 'summary',        desc: CHECK_DESC.summary,        isAuto: true,  done: allChecks.summary },
    { label: '10. 이미지 대체 텍스트(alt 태그) 입력 [SEO]', mkey: 'alt',        desc: CHECK_DESC.alt,            isAuto: true,  done: allChecks.alt },
  ]
  const stage3 = [
    { label: '11. 사실 관계(Fact) 최종 교차 검증',  mkey: 'fact',      desc: CHECK_DESC.fact,      isAuto: false, done: allChecks.fact },
    { label: '12. 취재원 이름 및 직함 확인',        mkey: 'source',    desc: CHECK_DESC.source,    isAuto: false, done: allChecks.source },
    { label: '13. 카카오톡 공유용 단문 메시지 준비',mkey: 'kakao',     desc: CHECK_DESC.kakao,     isAuto: false, done: allChecks.kakao },
    { label: '14. 인스타그램 홍보용 해시태그 세팅',  mkey: 'instagram', desc: CHECK_DESC.instagram, isAuto: false, done: allChecks.instagram },
  ]

  const allItems = [...stage1, ...stage2, ...stage3]
  const totalDone = allItems.filter(i => i.done).length
  const stage2Done = stage2.filter(i => i.done).length
  // 통과 기준: 자동 항목 7개 중 4개 이상 충족 (제목/본문/채널/태그/요약/썸네일/alt)
  const autoCheckedCount = Object.values(autoChecks).filter(Boolean).length
  const canSubmit = autoCheckedCount >= 4
  const canDraft = !!title.trim()      // 임시저장은 제목만 있으면 가능

  // 태그 등록 헬퍼 — Enter + onBlur + 저장 시 백업 흡수에서 공용 사용
  const commitTagInput = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (!t) { setTagInput(''); return }
    if (!tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }
  const handleTagKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitTagInput()
    }
  }
  const handleTagBlur = () => {
    commitTagInput()
  }
  const removeTag = (t) => setTags(tags.filter(x => x !== t))

  // 파일 선택 버튼 클릭 → 숨겨진 input 트리거
  const openFilePicker = () => {
    if (uploading) return
    fileInputRef.current?.click()
  }

  // 실제 업로드 — Supabase Storage `article-images` 버킷 (사용자 폴더 user.id/...)
  // 원본 그대로 저장 (변형 X), 10MB 안전장치
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!user) { alert('로그인이 필요합니다.'); return }

    // 1. 확장자 체크 (이미지만)
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      e.target.value = ''
      return
    }

    // 2. 용량 체크 (10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert(`이미지가 너무 큽니다 (${(file.size/1024/1024).toFixed(1)}MB).\n원본 품질 유지를 위해 10MB 이하로 부탁드립니다.\n휴대폰 사진은 일반적으로 3-5MB입니다.`)
      e.target.value = ''
      return
    }

    // 3. 업로드 (원본 그대로)
    setUploading(true)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('article-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(path)

      setThumbnailUrl(publicUrl)
    } catch (err) {
      console.error('upload error:', err)
      alert(`업로드 실패: ${err.message || '알 수 없는 오류'}`)
    } finally {
      setUploading(false)
      e.target.value = ''  // 같은 파일 다시 선택 가능
    }
  }

  // slug 생성 — crypto.randomUUID()는 secure context(HTTPS/localhost) 전용 → LAN HTTP에서 throw
  // Math.random 기반 fallback (안전)
  const generateSlug = () => `article-${Math.random().toString(36).slice(2, 10)}`

  const buildPayload = (status) => {
    // 저장 직전 백업 — tagInput에 미등록 텍스트가 남아 있으면 tags에 흡수
    // (Enter도 안 누르고 input blur 이벤트도 못 받았을 때 마지막 안전망)
    const pending = tagInput.trim().replace(/^#/, '')
    const mergedTags = pending && !tags.includes(pending) ? [...tags, pending] : tags
    const payload = {
      channel_id: CHANNEL_ID_MAP[channel] || null,
      title: title.trim(),
      summary: summary.trim() || null,
      content: content || null,
      status,
      thumbnail_url: thumbnailUrl.trim() || null,
      tags: mergedTags.length > 0 ? mergedTags : null,
      video_url: videoUrl.trim() || null,
      author_name: (reporter || profile?.nickname || '').trim() || null,
      image_alt: imageAlt.trim() || null,
      external_url: externalUrl.trim() || null,
      inline_ad_image: inlineAdImage.trim() || null,
      inline_ad_link: inlineAdLink.trim() || null,
      inline_ad_title: inlineAdTitle.trim() || null,
      inline_ad_subtitle: inlineAdSubtitle.trim() || null,
      // 시민기자 체크 — submitted 시 14개 결과 + 점수 저장 (draft 시도 무해)
      citizen_checks: allChecks,
      citizen_complete: totalDone,
    }
    // 신규 작성 시에만 author_id + slug 설정.
    // editId 모드(기존 수정)면 둘 다 미포함 → DB의 기존 값 보존 (원래 기자·URL 유지).
    if (!editId) {
      payload.author_id = user.id
      payload.slug = generateSlug()
    }
    return payload
  }

  const handleDraft = async () => {
    if (submitting) return
    if (!title.trim()) { alert('제목을 입력해주세요.'); return }
    if (!user) { alert('로그인이 필요합니다.'); return }
    setSubmitting(true)
    try {
      const payload = buildPayload('draft')
      let error
      if (editId) {
        let q = supabase.from('articles')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editId)
        if (!isAdminOrPublisher) q = q.eq('author_id', user.id)
        ;({ error } = await q)
      } else {
        ;({ error } = await supabase.from('articles').insert(payload))
      }
      if (error) { alert(`임시저장 실패: ${error.message}`); return }
      setSavedAt(formatNow())
      setViewMode('draftSuccess')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('[handleDraft] catch:', err)
      alert(`임시저장 중 오류: ${err?.message || err}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!user) { alert('로그인이 필요합니다.'); return }
    if (!CHANNEL_ID_MAP[channel]) { alert('채널을 선택해주세요.'); return }
    if (!canSubmit) {
      setShowRedHighlight(true)
      setActiveTab(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      alert(`자동 항목 ${autoCheckedCount}/7 채워졌습니다.\n자동 항목 4개 이상이 완료되면 편집국장에게 전달할 수 있어요.\n(나머지는 편집국장이 검토하며 채웁니다)`)
      return
    }
    setSubmitting(true)
    try {
      const payload = buildPayload('submitted')
      let error
      if (editId) {
        let q = supabase.from('articles')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editId)
        if (!isAdminOrPublisher) q = q.eq('author_id', user.id)
        ;({ error } = await q)
      } else {
        ;({ error } = await supabase.from('articles').insert(payload))
      }
      if (error) { alert(`편집국장 전송 실패: ${error.message}`); return }
      setSavedAt(formatNow())
      setViewMode('submitSuccess')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('[handleSubmit] catch:', err)
      alert(`편집국장 전송 중 오류: ${err?.message || err}`)
    } finally {
      setSubmitting(false)
    }
  }

  // ━━ 발행본 그대로 저장 (편집국장/발행인 전용 — 발행 기사 수정) ━━
  // status='published' 유지, published_at·slug·author_id 모두 보존, updated_at만 갱신
  const handlePublishUpdate = async () => {
    if (submitting) return
    if (!user || !editId) return
    setSubmitting(true)
    try {
      const payload = buildPayload('published')
      let q = supabase.from('articles')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editId)
      if (!isAdminOrPublisher) q = q.eq('author_id', user.id)
      const { error } = await q
      if (error) { alert(`발행본 저장 실패: ${error.message}`); return }
      setSavedAt(formatNow())
      setViewMode('publishUpdateSuccess')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('[handlePublishUpdate] catch:', err)
      alert(`발행본 저장 중 오류: ${err?.message || err}`)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setChannel(''); setTitle(''); setReporter(''); setTagInput(''); setTags([])
    setSummary(''); setThumbnailUrl(''); setImageAlt(''); setVideoUrl(''); setContent('')
    setExternalUrl(''); setInlineAdImage(''); setInlineAdLink(''); setInlineAdTitle(''); setInlineAdSubtitle('')
    setOriginalStatus(null)
    setManualChecks({
      leadParagraph: false, spelling: false, titleKeyword: false,
      fact: false, source: false, kakao: false, instagram: false,
    })
    setShowRedHighlight(false)
    setActiveTab(1)
    setViewMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const continueEditing = () => {
    setViewMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const switchTab = (n) => {
    setActiveTab(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const TABS = [
    { num: 1, icon: '✍️', label: '기사 작성' },
    { num: 2, icon: '✅', label: '발행 체크리스트' },
  ]

  // ━━ 임시저장 완료 화면 ━━
  if (viewMode === 'draftSuccess') {
    return (
      <div style={{ background: '#f9f8f6', minHeight: '100vh', padding: '80px 24px', fontFamily: SANS }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', background: '#fff',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '48px', textAlign: 'center', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 700,
            color: NAVY, margin: '0 0 10px 0', lineHeight: 1.4,
          }}>
            임시저장 완료!
          </h1>
          <p style={{ fontSize: 18, color: '#666', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            언제든지 이어서 작성할 수 있습니다.
          </p>

          <div style={{
            background: '#f8f9fa', borderRadius: 12,
            padding: 24, marginBottom: 24, textAlign: 'left',
          }}>
            <InfoRow label="기사 제목" value={title || '(제목 없음)'} />
            <InfoRow label="채널" value={channel || '(미선택)'} />
            <InfoRow label="저장 시각" value={savedAt} />
            <InfoRow label="완성도" value={`${totalDone}/14 체크 완료`} last />
          </div>

          <p style={{ fontSize: 18, color: '#888', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            임시저장된 기사는 편집국장 전송 전까지 수정할 수 있습니다.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={continueEditing} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              ✍️ 이어서 작성하기
            </button>
            <button onClick={() => navigate('/')} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              🏠 홈으로 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ━━ 편집국장 전달 완료 화면 ━━
  if (viewMode === 'submitSuccess') {
    return (
      <div style={{ background: '#f9f8f6', minHeight: '100vh', padding: '80px 24px', fontFamily: SANS }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', background: '#fff',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '48px', textAlign: 'center', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 700,
            color: NAVY, margin: '0 0 10px 0', lineHeight: 1.4,
          }}>
            편집국장에게 전달됐습니다!
          </h1>
          <p style={{ fontSize: 18, color: '#666', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            정세연 편집국장이 검토 후 연락드립니다.
          </p>

          <div style={{
            background: '#eef7f2', borderRadius: 12,
            padding: 24, marginBottom: 24, textAlign: 'left',
          }}>
            <InfoRow label="기사 제목" value={title} />
            <InfoRow label="채널" value={channel} />
            <InfoRow label="기자 이름" value={reporter} />
            <InfoRow label="전달 시각" value={savedAt} />
            <InfoRow label="시민기자 체크" value={`${totalDone}/14 ✅ 완료`} last />
          </div>

          <div style={{
            background: '#eef3fa', borderRadius: 8,
            padding: 20, marginBottom: 32, textAlign: 'left',
            fontSize: 18, lineHeight: 1.85,
          }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 12 }}>
              📋 다음 단계 안내
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 24px', color: '#3a3a3a' }}>
              <li style={{ marginBottom: 6 }}>편집국장 검토 후 카카오톡으로 연락드립니다.</li>
              <li style={{ marginBottom: 6 }}>수정 요청이 있을 수 있습니다.</li>
              <li style={{ marginBottom: 6 }}>최종 승인 후 이음미디어에 발행됩니다.</li>
              <li>발행 즉시 카카오·인스타에 공유해주세요!</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={resetForm} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              ✍️ 새 기사 작성하기
            </button>
            <button onClick={() => navigate('/')} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              🏠 홈으로 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ━━ 발행본 저장 완료 화면 (편집국장 전용) ━━
  if (viewMode === 'publishUpdateSuccess') {
    return (
      <div style={{ background: '#f9f8f6', minHeight: '100vh', padding: '80px 24px', fontFamily: SANS }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', background: '#fff',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '48px', textAlign: 'center', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 700,
            color: NAVY, margin: '0 0 10px 0', lineHeight: 1.4,
          }}>
            발행본이 즉시 반영되었습니다
          </h1>
          <p style={{ fontSize: 18, color: '#666', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            발행 시간(published_at)·URL(slug)·작성자(author)는 그대로 유지되었습니다.
          </p>

          <div style={{
            background: '#eef3fa', borderRadius: 12,
            padding: 24, marginBottom: 24, textAlign: 'left',
          }}>
            <InfoRow label="기사 제목" value={title} />
            <InfoRow label="채널" value={channel} />
            <InfoRow label="저장 시각" value={savedAt} last />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={continueEditing} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              ✍️ 더 수정하기
            </button>
            <button onClick={() => navigate('/admin')} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              🏠 관리자로 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ━━ 기본 화면 (edit) ━━
  return (
    <div style={{ background: '#f9f8f6', fontFamily: SANS, minHeight: '100vh' }}>
      {/* 탭 영역 (상단 고정) */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => {
            const active = activeTab === t.num
            return (
              <button key={t.num} type="button" onClick={() => switchTab(t.num)}
                style={{
                  flex: 1, height: 56, fontSize: 18, fontWeight: 700,
                  fontFamily: SANS,
                  background: active ? NAVY : '#f0f0f0',
                  color: active ? '#fff' : '#888',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* 진행률 바 영역 (탭 아래, 항상 표시) */}
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          padding: '16px 24px', display: 'flex', gap: 32, flexWrap: 'wrap',
        }}>
          <ProgressBar label="기사 완성도" current={totalDone} max={14} color={NAVY} />
          <ProgressBar label="검색 노출 최적화" current={stage2Done} max={5} color={BLUE} />
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* 이어쓰기 안내 배너 */}
        {editId && (
          <div style={{
            background: '#fffbeb', borderLeft: '4px solid #f59e0b',
            padding: '12px 16px', marginBottom: 16, borderRadius: 8,
            fontSize: 15, color: '#92400e',
          }}>
            💾 임시저장한 기사를 이어서 작성합니다.
          </div>
        )}

        {/* ━━ 탭 1: 기사 작성 ━━ */}
        {activeTab === 1 && (
          <div>
            {/* 1. 채널 선택 */}
            <div style={card}>
              <label style={lbl}>
                채널 선택 <span style={{ color: RED }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {CHANNELS.map(c => {
                  const sel = channel === c
                  return (
                    <button key={c} type="button" onClick={() => setChannel(c)}
                      style={{
                        height: 48, padding: '0 18px', fontSize: 17,
                        fontFamily: SANS, fontWeight: 600,
                        background: sel ? NAVY : '#fff',
                        color: sel ? '#fff' : '#3a3a3a',
                        border: `1px solid ${sel ? NAVY : '#d0d0d0'}`,
                        borderRadius: 8,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. 제목 */}
            <div style={card}>
              <label style={lbl}>
                기사 제목 <span style={{ color: RED }}>*</span>
              </label>
              <input style={inp({ height: 56, fontSize: 20 })}
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="제목 입력 (30자 이내 권장)" />
              <div style={{
                textAlign: 'right', fontSize: 18, fontWeight: 600,
                color: title.length > 30 ? RED : '#888', marginTop: 8,
              }}>
                {title.length}자{title.length > 30 ? ' (30자 권장)' : ''}
              </div>
            </div>

            {/* 3. 기자 이름 */}
            <div style={card}>
              <label style={lbl}>
                기자 이름 <span style={{ color: RED }}>*</span>
              </label>
              <input style={inp({ height: 52 })}
                value={reporter || profile?.nickname || ''} onChange={e => setReporter(e.target.value)}
                placeholder="이름을 입력하세요" />
            </div>

            {/* 4. 태그 */}
            <div style={card}>
              <label style={lbl}>태그</label>
              <input style={inp({ height: 52 })}
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={handleTagBlur}
                placeholder="입력 후 Enter — 예: 고양시, 두피케어" />
              <div style={{
                fontSize: 18, fontWeight: 600,
                color: tags.length >= 3 ? GREEN : '#888', marginTop: 12,
              }}>
                {tags.length}개{tags.length >= 3 ? ' ✓' : ' (3개 이상 권장)'}
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {tags.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px', background: '#e8eef5', color: NAVY,
                      fontSize: 16, fontWeight: 600, borderRadius: 20,
                    }}>
                      #{t}
                      <button onClick={() => removeTag(t)} style={{
                        background: 'transparent', border: 'none', color: '#666',
                        cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1,
                      }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 5. 기사 요약 */}
            <div style={card}>
              <label style={lbl}>기사 요약</label>
              <textarea style={inp({ height: 96, resize: 'none' })}
                value={summary} onChange={e => setSummary(e.target.value)}
                placeholder="80자 이내 핵심 요약 — 검색 결과에 노출됩니다" />
              <div style={{
                textAlign: 'right', fontSize: 18, fontWeight: 600,
                color: summary.length > 80 ? RED : '#888', marginTop: 8,
              }}>
                {summary.length}자{summary.length > 80 ? ' (80자 권장)' : ''}
              </div>
            </div>

            {/* 6. 원문 URL (선택) — 옛 이음매거진 등 외부 원본 글이 있을 때만 입력 */}
            <div style={card}>
              <label style={lbl}>
                원문 URL <span style={{ color: '#888', fontWeight: 500, fontSize: 16 }}>(선택)</span>
              </label>
              <input style={inp()}
                value={externalUrl} onChange={e => setExternalUrl(e.target.value)}
                placeholder="예: https://eummagazine.com/..." />
              <div style={{ fontSize: 16, color: '#666', marginTop: 10, lineHeight: 1.7 }}>
                옛 이음매거진 등 외부에 원본 글이 있을 때만 입력해 주세요.<br />
                비워두면 기사 페이지에 '원문 보기' 버튼이 표시되지 않습니다.
              </div>
            </div>

            {/* 7. 대표 이미지 */}
            <div style={card}>
              <label style={lbl}>대표 이미지</label>

              {/* 안내 문구 */}
              <div style={{
                background: '#f5f9ff', border: `1px solid ${BLUE}`, borderRadius: 8,
                padding: '12px 14px', marginBottom: 14,
                fontSize: 15, lineHeight: 1.6, color: '#333',
              }}>
                📷 휴대폰 사진을 그대로 올려주세요 (10MB 이하).<br/>
                원본 품질을 유지합니다.<br/><br/>
                💡 권장 사이즈: 16:9 가로형 (예: 1200×675)<br/>
                휴대폰 가로 촬영 사진이 가장 잘 어울려요.
              </div>

              {/* 미리보기 */}
              {thumbnailUrl && (
                <div style={{ marginBottom: 14 }}>
                  <img src={thumbnailUrl} alt="대표 이미지 미리보기"
                    style={{
                      width: '100%', maxHeight: 320, objectFit: 'cover',
                      borderRadius: 8, border: '1px solid #ddd',
                      display: 'block',
                    }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              )}

              {/* URL 직접 입력 (기존) */}
              <input style={inp({ marginBottom: 12 })}
                value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="이미지 URL을 입력하세요 (https://...)" />

              {/* 숨겨진 file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* 큰 파일 선택 버튼 (70대+ 페르소나 대응) */}
              <button type="button" onClick={openFilePicker} disabled={uploading}
                style={{
                  width: '100%', minHeight: 60, fontSize: 19, fontWeight: 700,
                  background: uploading ? '#f0f0f0' : '#fff',
                  color: uploading ? '#888' : NAVY,
                  border: `2px solid ${uploading ? '#ccc' : NAVY}`, borderRadius: 8,
                  cursor: uploading ? 'wait' : 'pointer',
                  fontFamily: SANS, marginBottom: 12,
                }}>
                {uploading
                  ? '⏳ 업로드 중...'
                  : (thumbnailUrl ? '🔄 다시 선택' : '📁 사진 직접 올리기')}
              </button>

              <input style={inp()}
                value={imageAlt} onChange={e => setImageAlt(e.target.value)}
                placeholder="사진 설명 — 예: 고양시 닥터리부트 두피케어 체험" />
            </div>

            {/* 7. 영상 URL (선택) */}
            <div style={card}>
              <label style={lbl}>
                영상 URL <span style={{ color: '#888', fontWeight: 500, fontSize: 16 }}>(선택)</span>
              </label>
              <input style={inp()}
                value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="예: https://www.youtube.com/watch?v=..." />
              <div style={{ fontSize: 16, color: '#666', marginTop: 10, lineHeight: 1.7 }}>
                영상이 있으면 <strong>YouTube 링크</strong>를 넣어주세요.<br />
                사진만 있는 기사는 비워두셔도 됩니다.
              </div>
            </div>

            {/* 8. 본문 */}
            <div style={card}>
              <label style={lbl}>
                본문 <span style={{ color: RED }}>*</span>
              </label>
              {/* 서식 툴바 — 70대+ 친화 큰 버튼 (44px 이상). 선택 텍스트 있으면 감싸기, 없으면 기본 텍스트 자동 선택 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {FORMAT_ACTIONS.map(action => (
                  <button key={action.label} type="button"
                    onClick={() => insertOrWrap(action.before, action.after, action.defaultText)}
                    title={action.title}
                    style={{
                      minWidth: 44, minHeight: 44, padding: '8px 14px',
                      background: '#fff', color: NAVY,
                      border: `1.5px solid ${NAVY}`, borderRadius: 6,
                      fontSize: 16, fontWeight: 700,
                      cursor: 'pointer', fontFamily: SANS,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                    <span style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
              <textarea ref={contentRef} style={inp({
                height: 600, resize: 'vertical', lineHeight: 1.9,
              })}
                value={content} onChange={e => setContent(e.target.value)}
                placeholder={'기사 본문을 입력하세요 (500자 이상 권장)\n\n서식: **굵게** / ## 소제목 / [quote]인용[/quote] / [box]강조[/box] / [info]정보[/info] / --- 구분선'} />
              <div style={{
                textAlign: 'right', fontSize: 18, fontWeight: 700,
                color: content.length >= 500 ? GREEN : RED, marginTop: 8,
              }}>
                {content.length}자
                {content.length >= 500 ? ' ✓ (500자 이상)' : ' (500자 이상 필요)'}
              </div>
            </div>

            {/* 9. 본문 중간 배너 (선택) — 광고/협찬. 제목 있으면 배너 표시, 이미지 있으면 이미지형 자동 분기 */}
            <div style={card}>
              <label style={lbl}>
                본문 중간 배너 <span style={{ color: '#888', fontWeight: 500, fontSize: 16 }}>(선택)</span>
              </label>
              <div style={{ fontSize: 16, color: '#666', marginBottom: 14, lineHeight: 1.7 }}>
                기사 본문 중간에 표시될 광고/협찬 카드입니다.<br />
                <strong>제목</strong>이 있어야 표시되며, <strong>이미지 URL</strong>이 있으면 이미지형 배너로 자동 분기됩니다.<br />
                전부 비워두면 배너가 표시되지 않습니다.
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>배너 이미지 URL</label>
                <input style={inp()}
                  value={inlineAdImage} onChange={e => setInlineAdImage(e.target.value)}
                  placeholder="https://... (비워두면 텍스트형 배너)" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>클릭 시 이동 링크</label>
                <input style={inp()}
                  value={inlineAdLink} onChange={e => setInlineAdLink(e.target.value)}
                  placeholder="https://..." />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>배너 제목</label>
                <input style={inp()}
                  value={inlineAdTitle} onChange={e => setInlineAdTitle(e.target.value)}
                  placeholder="예: 닥터리부트 두피관리센터" />
              </div>

              <div>
                <label style={lbl}>배너 부제</label>
                <input style={inp()}
                  value={inlineAdSubtitle} onChange={e => setInlineAdSubtitle(e.target.value)}
                  placeholder='예: "고객의 마지막 희망이 되고픈 두피전문가"' />
              </div>
            </div>

            {/* 10. 하단 버튼 — 발행본 수정 모드(편집국장)인지에 따라 액션 버튼 분기 */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={handleDraft} disabled={!canDraft} style={{
                flex: 1, height: 56, fontSize: 18, fontWeight: 700,
                background: canDraft ? '#555' : '#ccc',
                color: canDraft ? '#fff' : '#888',
                border: 'none', borderRadius: 8,
                cursor: canDraft ? 'pointer' : 'not-allowed',
                fontFamily: SANS,
              }}>
                💾 임시저장
              </button>
              {editId && isAdminOrPublisher && originalStatus === 'published' ? (
                <button onClick={handlePublishUpdate} disabled={submitting}
                  style={{
                    flex: 2, height: 56, fontSize: 18, fontWeight: 700,
                    background: submitting ? '#ccc' : NAVY,
                    color: submitting ? '#888' : '#fff',
                    border: 'none', borderRadius: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: SANS,
                  }}>
                  📰 발행본으로 저장
                </button>
              ) : (
                <button onClick={handleSubmit}
                  style={{
                    flex: 2, height: 56, fontSize: 18, fontWeight: 700,
                    background: canSubmit ? NAVY : '#ccc',
                    color: canSubmit ? '#fff' : '#888',
                    border: 'none', borderRadius: 8,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    fontFamily: SANS,
                  }}>
                  📩 편집국장에게 보내기 ({totalDone}/14)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ━━ 탭 2: 발행 체크리스트 ━━ */}
        {activeTab === 2 && (
          <div>
            {/* 상단 안내 영역 */}
            <div style={card}>
              <h1 style={{
                fontFamily: SERIF, fontSize: 24, fontWeight: 700,
                color: NAVY, margin: '0 0 12px 0', lineHeight: 1.4,
              }}>
                🚀 노출깡패 기사 발행 체크리스트
              </h1>
              <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.8, margin: 0 }}>
                시민기자가 채울 14가지(자동 7 + 수동 7).<br />
                <strong>자동 항목 4개 이상</strong>이 완료되면 편집국장에게 전달할 수 있어요.<br />
                나머지는 편집국장이 검토하면서 마저 채웁니다.
              </p>
            </div>

            {/* 1단계 */}
            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                color: NAVY, marginTop: 0, marginBottom: 16, lineHeight: 1.4,
              }}>
                🟦 1단계 기사 기본 구조
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stage1.map((it, i) => <CheckItem key={i} item={it} onToggle={toggleManual} showRedHighlight={showRedHighlight} />)}
              </ul>
            </div>

            {/* 2단계 */}
            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                color: NAVY, marginTop: 0, marginBottom: 16, lineHeight: 1.4,
              }}>
                🟩 2단계 AI·검색 최적화
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stage2.map((it, i) => <CheckItem key={i} item={it} onToggle={toggleManual} showRedHighlight={showRedHighlight} />)}
              </ul>
            </div>

            {/* 3단계 */}
            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                color: NAVY, marginTop: 0, marginBottom: 16, lineHeight: 1.4,
              }}>
                🟥 3단계 최종 발행 준비
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stage3.map((it, i) => <CheckItem key={i} item={it} onToggle={toggleManual} showRedHighlight={showRedHighlight} />)}
              </ul>
            </div>

            {/* 실수 방지 TOP 5 */}
            <div style={{
              background: '#fff8f0',
              borderLeft: `4px solid ${ORANGE}`,
              borderRadius: 12,
              padding: '28px',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{
                fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                color: NAVY, margin: '0 0 18px 0', lineHeight: 1.4,
              }}>
                📚 시니어 기자가 자주 놓치는 실수 TOP 5
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16, lineHeight: 1.85, color: '#1a1a1a' }}>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>1️⃣ 태그 입력 누락</strong><br />
                  태그가 없으면 검색 로봇이 기사를 찾아내지 못해 고립됩니다.
                </li>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>2️⃣ 대표 이미지 누락</strong><br />
                  썸네일이 없는 기사는 클릭률이 저하됩니다.
                </li>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>3️⃣ 메타 설명 비워두기</strong><br />
                  AI가 어색한 문장을 멋대로 긁어가지 않도록 직접 요약문을 작성하세요.
                </li>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>4️⃣ 독단적 즉시 발행</strong><br />
                  편집국장과의 데스크 과정을 거치지 않은 글은 언론사의 공신력을 해칠 수 있습니다.
                </li>
                <li>
                  <strong style={{ color: NAVY, fontSize: 17 }}>5️⃣ SNS 공유 방치</strong><br />
                  좋은 기사를 쓰고도 알리지 않으면 노출 확장 속도가 느려집니다.<br />
                  발행 즉시 이음의 네트워크로 공유하세요.
                </li>
              </ul>
            </div>

            {/* 하단 서명 영역 */}
            <div style={{
              fontSize: 18, color: '#555',
              padding: '24px 0 24px',
              borderTop: '1px solid #e0e0e0',
              marginTop: 16,
            }}>
              인터뷰 이음미디어 에디터: _______________
            </div>

            {/* ━━ 글쓰기 가이드 — 탭2 하단 토글로 통합 (기존 탭3 → 접기/펼치기) ━━ */}
            <button
              type="button"
              onClick={() => setShowGuide(s => !s)}
              style={{
                width: '100%', padding: '16px 20px', marginTop: 16, marginBottom: 12,
                background: '#fff', border: `2px solid ${NAVY}`, borderRadius: 10,
                color: NAVY, fontSize: 18, fontWeight: 700, fontFamily: SANS,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              📖 글쓰기 가이드 {showGuide ? '접기 ▲' : '보기 ▼'}
            </button>

            {showGuide && (
              <div style={{ marginTop: 4 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2 style={{
                    fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                    color: NAVY, margin: '0 0 8px 0', lineHeight: 1.4,
                  }}>
                    노출 잘 되는 기사 쓰는 법
                  </h2>
                  <p style={{ fontSize: 16, color: '#666', margin: 0, lineHeight: 1.6 }}>
                    이 4가지만 지키면 구글·네이버·카카오에서 찾아옵니다
                  </p>
                </div>

                {GUIDE_CARDS.map((g, i) => (
                  <div key={i} style={{
                    background: g.bg,
                    borderLeft: `4px solid ${g.border}`,
                    borderRadius: 12,
                    padding: '24px 28px', marginBottom: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <h3 style={{
                      fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                      color: NAVY, margin: '0 0 14px 0', lineHeight: 1.4,
                    }}>
                      {g.icon} {g.title}
                    </h3>
                    <div style={{ fontSize: 17, color: '#1a1a1a', lineHeight: 1.85 }}>
                      {g.body}
                    </div>
                  </div>
                ))}

                <div style={{
                  background: NAVY, color: '#fff',
                  borderRadius: 12, padding: 24, marginTop: 12,
                  textAlign: 'center', fontSize: 17, lineHeight: 1.85,
                }}>
                  💡 좋은 기사 한 편이 이음미디어를 알립니다.<br />
                  시민기자님의 글이 세상을 잇습니다. 🌿
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
