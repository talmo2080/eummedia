# 항목 C 설계안 1.0 — `ChannelList.jsx` mock → Supabase + 편집국장의 픽

> **작성일**: 2026-05-13
> **작성자**: 클론 (Claude Code) — 옵스(Claude.ai) 검증 통과
> **상태**: 세연님 최종 OK 대기 중 (5/14 이상 적용 예정)
> **범위**: 단계 1 (`is_featured` 마이그레이션 SQL) + 단계 2 (`ChannelList.jsx` 쿼리 구조)

---

## 📍 메타 결정 (5/13 의논 박제)

| 항목 | 결정 |
|---|---|
| C-1 명칭 | **"편집국장의 픽"** (편집인 수동 선정) |
| 채택 방식 | `articles.is_featured` 컬럼 추가 |
| 채널당 픽 개수 | **1건만** true (Partial Unique Index 제약) |
| ChannelList.jsx 파일명 | **그대로 유지** (rename 안 함, 파일명만 List이고 역할은 채널 페이지) |
| SPONSORED 배지 | P-03 항목 C 사이클에서 제외, 별도 사이클 |
| 페이지네이션 | **클라이언트 측 "더 보기" 9건 단위** 유지 (현 패턴) |
| Supabase PAT | 본 사이클 시도 안 함 (사용량 절약) |
| 마이그레이션 실행 | 옵스 검증 후 세연님 OK 받고 Supabase 대시보드에서 직접 실행 |

---

## ① 단계 1 — Supabase 마이그레이션 SQL

```sql
-- =========================================================================
-- Migration: articles.is_featured 컬럼 추가 + 채널당 1건만 true 제약
-- 작성: 2026-05-13 / 검증 대기 (옵스 → 세연 OK → 실행)
-- =========================================================================

BEGIN;

-- 1) 컬럼 추가 (NOT NULL + DEFAULT false → 기존 39건 자동으로 false)
ALTER TABLE articles
ADD COLUMN is_featured boolean NOT NULL DEFAULT false;

-- 2) "채널당 1건만 true" Partial Unique Index
--    - is_featured = true 행만 인덱스에 포함
--    - 같은 channel_id로 두 번째 true 시도 시 DB가 23505로 거절
CREATE UNIQUE INDEX articles_one_featured_per_channel
ON articles (channel_id)
WHERE is_featured = true;

COMMIT;

-- 사후 검증 SQL (옵스 눈으로 확인) -----------------------------------------
-- SELECT count(*) FROM articles WHERE is_featured = false;  -- 기대: 39
-- SELECT count(*) FROM articles WHERE is_featured = true;   -- 기대: 0
-- \d articles                                                -- is_featured 컬럼 보임
-- \di articles_one_featured_per_channel                      -- Partial index 보임
```

### 제약 동작

- 처음 픽 INSERT: ✅ 통과
- 같은 채널에 두 번째 픽 INSERT: ❌ `duplicate key value violates unique constraint`
- 픽 교체 패턴 (UI 단계 3에서 설계): 트랜잭션으로 (기존 false → 새 true) — RPC 함수 또는 두 UPDATE 묶음

### 실행 방법 (5/13 의논 채택)

- **(가) + (다) 조합** — `supabase/migrations/` 폴더에 `.sql` 파일로 영구 박제 + Supabase 대시보드 SQL Editor에서 직접 실행

---

## ② 단계 2 — `ChannelList.jsx` 쿼리 구조 (5/10 분리 쿼리 패턴)

### 2-1 쿼리 3단 (의미적 단일 책임)

```js
// englishSlug → channel 정보 + ID 룩업 ─────────────────────────────────
const { data: channel, error: chErr } = await supabase
  .from('channels')
  .select('id, name, english_slug')
  .eq('english_slug', englishSlug)
  .maybeSingle();

if (chErr || !channel) { /* 에러 / 404 분기 */ }

// 편집국장의 픽 (채널당 1건, is_featured = true) ─────────────────────────
const { data: featured } = await supabase
  .from('articles')
  .select('slug, title, summary, thumbnail_url, published_at')
  .eq('status', 'published')
  .eq('channel_id', channel.id)
  .eq('is_featured', true)
  .maybeSingle();   // 0건 또는 1건 — Partial Unique Index가 ≥2건 보장

// 최신 N건 (픽 제외) ────────────────────────────────────────────────────
const { data: latest } = await supabase
  .from('articles')
  .select('slug, title, summary, thumbnail_url, published_at')
  .eq('status', 'published')
  .eq('channel_id', channel.id)
  .eq('is_featured', false)
  .order('published_at', { ascending: false })
  .limit(PAGE_SIZE);  // 현재 9
```

### 2-2 5/10 결정 적용 메모

| 5/10 결정 | 본 설계 적용 |
|---|---|
| 분리 쿼리 패턴 (의미적 단일 책임) | ✅ featured / latest 별도 쿼리 |
| 데이터 길이/null 기반 로딩 판단 | ✅ `loading` state 빼고 `channel == null && featured == null && latest == null`으로 판단 |
| 통합 `error` state + 상단 배너 | ✅ Home.jsx 패턴 그대로 (단계 3에서 구현) |
| views 라벨 제거 | ✅ articles 테이블에 views 컬럼 없음 — 카드 메타 재설계 (단계 3) |
| 한 commit = 한 작업 | 단계 1 (SQL) / 단계 2 (쿼리) / 단계 3 (UI) / 단계 4 (검증) 각각 별 commit |

### 2-3 State 재설계 (Home.jsx 일관성)

```js
// 현재 (mock 기반)
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(true);

// 신규 (Supabase 기반)
const [channel, setChannel] = useState(null);     // 채널 메타
const [featured, setFeatured] = useState(null);   // 픽 0~1건
const [latest, setLatest] = useState([]);         // 최신 N건
const [error, setError] = useState(null);         // 통합 에러
```

`loading` state 제거 — Home.jsx 4-A 일관성. 스켈레톤은 `channel == null` 분기.

### 2-4 라우트 안전망 (이미 적용된 5/12 작업 활용)

`App.jsx`에 `/channel → /` 리다이렉트 안전망 이미 있음. 따라서 ChannelList 진입 시 `englishSlug`는 **항상 존재** 가정 가능. "전체" 탭은 UI 처리 영역으로 분리 (단계 3).

---

## ③ 옵스 검증 영역 — PAT 통해 사전 확인 요청

1. `articles` 테이블 컬럼 실제 목록 (현 채택 쿼리의 `select` 컬럼 모두 존재 검증)
2. `is_featured` 컬럼이 이미 존재하지 않는지 (중복 ALTER 방지)
3. `channels` 테이블 7행 `english_slug` 매핑 확인
4. RLS: anon이 `is_featured` 컬럼 SELECT 가능한지 (`status='published'` 정책만 있으면 자동 OK)

---

## ④ 부수 발견 4건 (설계 영향 — 결정 박제)

### [부-1] 현 UI: featured는 "전체" 탭에서만 표시

ChannelList.jsx 라인 68:
```js
const featured = !searchQuery && activeChannel === "전체" ? filtered.find(a => a.is_featured) : null;
```

현 UI는 "전체" 탭에서만 추천기사 박스 노출. C-1은 **채널당 1건**의 픽 → 의미 충돌.

**채택**: 옵션 **(a)** — 각 채널 페이지에 픽 노출 (C-1 의도 충실). "전체" 탭의 픽 처리는 별도 사이클.

### [부-2] 페이지네이션 — 현재 클라이언트 측

5/13 의논 채택: **현재 패턴 유지** — 클라이언트 측 `.slice(0, page * 9)` "더 보기" 버튼. UX 변화 0, 향후 채널 기사 100+ 늘면 서버 측으로 전환.

### [부-3] `is_sponsored` 분기 코드 처리

DUMMY와 ArticleCard에 `article.is_sponsored` 의존 코드 있음. 본 사이클에서 SPONSORED 컬럼 추가 X.

**채택**: 옵션 **(a)** — Supabase fetch 결과는 `is_sponsored` 필드 없음 → `article.is_sponsored` undefined → AD 배지 자동 안 보임. 코드는 그대로 (별도 사이클에서 컬럼 추가 시 자연 작동).

### [부-4] `views` / `author` / `tags` 카드 메타 표시 분기

DUMMY의 카드 footer에 `views`, `author`, `tags` 표시. articles 테이블에 사실상 없음 또는 동일값.

**채택**: 옵션 **(c)** — 본 설계안은 쿼리 구조까지만. UI 메타 재설계는 단계 3 사이클에서 일괄 정리.

---

## ⑤ 다음 단계 (이번 설계안 범위 밖)

| 단계 | 내용 | 사이클 |
|---|---|---|
| 단계 1 실행 | Supabase 대시보드에서 SQL 실행 + `supabase/migrations/` 박제 | 5/14 |
| 단계 2 적용 | ChannelList.jsx 쿼리 교체 commit | 단계 1 후 |
| 단계 3 | UI 인터랙션 — featured 위치 변경 / `loading` state 제거 / error 배너 / 카드 메타 재설계 / "전체" 탭 처리 | 단계 2 후 |
| 단계 4 | dev 캡처 검증 — 7채널 각각 진입 / 픽 0건/1건 분기 / 빈 채널 메시지 / 검색 / 페이지네이션 | 단계 3 후 |
| 별도 사이클 | SPONSORED 배지 자동 노출 (C-5) / is_sponsored 컬럼 추가 / AdminDashboard 픽 선정 UI | P-03 이후 |

---

## ⑥ 옵스 검증 결과 (5/13)

- ✅ SQL 1.0 적절성 — Partial Unique Index 채택 OK
- ✅ 부수 발견 [부-1]~[부-4] 옵션 결정 모두 채택
- ✅ 마이그레이션 실행 방법 (가)+(다) 조합 채택
- ⏳ ③ 옵스 검증 영역 4가지 — PAT 시도 안 함 결정에 따라 옵스가 5/14에 시도

---

## 🌿 다음 클론에게 (5/14 이상)

본 설계안 1.0은 옵스 검증 통과 + 세연님 최종 OK 대기 상태입니다. 세션 시작 시:

1. `docs/HANDOVER.md` + 가장 최신 `session-handoff-YYYY-MM-DD.md` 먼저 읽기
2. 본 설계안을 다시 보고 — 세연님이 OK 주시면 단계 1부터 진행
3. 단계 1 실행 전 `git status` 깨끗한지 확인 (5/12 박제 원칙)
4. SQL 파일을 먼저 `supabase/migrations/YYYYMMDD_add_is_featured.sql`로 박제 후 대시보드 실행
5. 한 commit = 한 작업 원칙 충실하게 (단계 1 commit / 단계 2 commit / 단계 3 commit / 단계 4 commit)
