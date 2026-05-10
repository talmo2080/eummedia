# 이음미디어 프로젝트 인수인계 (HANDOVER)

> 이 문서는 Claude Code 세션 간 컨텍스트 유지를 위한 살아있는 문서입니다.
> 세션 시작 시: 이 문서를 가장 먼저 읽으세요.
> 세션 종료 전: 반드시 이 문서를 업데이트하고 commit & push 하세요.
>
> **마지막 작업: 2026-05-09** — Phase 3-B 종료 (39건 import 성공) + `channels.english_slug` 마이그레이션 완료. **다음 시작점: C-1 Home.jsx**

## 🎯 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | 이음미디어 (eummedia.kr) |
| 정체성 | 시민기자 50명 기반 주간 인터넷신문 |
| 발행인 | 성창운 (봉숭아학당 총장) |
| 편집국장 | 정세연 (사용자, 비개발자) |
| 기술 스택 | React + Vite + Supabase |
| GitHub | talmo2080/eummedia (master 브랜치) |
| 로컬 경로 | C:\Users\OWNER\eum-media |
| 도메인 | eummedia.kr (가비아, 미연결) |
| 사용자 환경 | Windows + PowerShell + Claude Code Desktop |

## 👤 사용자 페르소나 (정세연)

- **본업**: 닥터리부트 두피관리센터 운영 (일산, 27년차)
- **부업**: 이음매거진 편집국장
- **개발 경험**: 비개발자, 웹개발 도전 중
- **봉숭아학당 강의 수강**: 최규문 교수 "설계도가 95%" 방법론
- **선호 사항**: 친절한 부연설명, 단계별 진행, 결정 전 확인

## 🎨 디자인 철학

- **타겟 사용자**: 시니어 + 아마추어 시민기자
- **톤**: 친절하고 따뜻함 (간결함보다 친절함 우선)
- **분량 원칙**: "다소 많더라도 필요한 건 다 넣기"
- **참조 디자인**: Le Temps (스위스 신문) 정통 매거진 스타일
- **색상 시스템**:
  - Primary: #0d2d52 (네이비)
  - Accent: #1c4f8a (포인트 블루)
  - Highlight: #c0392b (강조 레드, 로고 "음" 글자)
  - Sub: #f0a882 (구독 페이지 등)
- **타이포**: Noto Serif KR (제목) + Noto Sans KR (본문)
- **레이아웃**: max-width 1200px, padding 32px, 반응형 900px 기준

## 📂 7개 채널 구조 (확정)

| 채널명 | 색상 | 카테고리 | 매거진 매핑 |
|---|---|---|---|
| 이음매거진 | #0d2d52 | 메인 기획기사 | eummagazine.com/21 |
| 이음로컬 | #1a5276 | 지역·비즈니스 | eummagazine.com/16 (성공) |
| 이음에듀 | #1a6b3c | 교육·강의·통찰 | eummagazine.com/17 (지혜) |
| 이음피플 | #7b2d2d | 인터뷰·인물 | eummagazine.com/15 (봉당) |
| 이음트렌드 | #5b2d7b | 문화·예술 | eummagazine.com/18 (예술) |
| 이음보이스 | #7b5b2d | 시사·오디오 | eummagazine.com/19 (세상) |
| 이음뷰 | #2d6b6b | 뷰티·헬스·웰니스 | eummagazine.com/20 (웃음) |

## 🗺️ 전체 로드맵

- [x] **Phase 1**: React 사이트 통일성 정리 + GitHub 첫 푸시 (2026-05-08)
- [x] **Phase 2-A**: .env 보안 정리 + Supabase 연결 검증 (2026-05-09)
- [ ] **Phase 2-B**: 나머지 6개 테이블 점검 + Edge Function 설계 (필요 시)
- [x] **Phase 3 설계**: RSS 구조 조사 + 매핑/변환/Edge Function 의사코드 (2026-05-09)
- [x] **Phase 3 사전작업 A-1**: 봇 계정(이음매거진) 생성 + public.users 등록 (2026-05-09)
- [x] **Phase 3 사전작업 A-2**: 7개 채널 INSERT 완료 (2026-05-09)
- [x] **Phase 3 사전작업 A-3**: service_role key 위치 확인 (2026-05-09) — **사전작업 A 100% 완료** ✅
- [x] **Phase 3 구현 B**: Edge Function `import-magazine` 배포 + 1회 호출 → **39건 import 성공** (12.4초) (2026-05-09) ✅
- [x] **URL slug 영문 마이그레이션**: `channels.english_slug` 컬럼 추가 + 7행 매핑 + NOT NULL/UNIQUE 적용 (2026-05-09) ✅
- [ ] **Phase 3 구현 C**: React mock → Supabase 교체 (Home → ChannelList → ArticleDetail) ← **다음 (C-1 Home.jsx부터)**
- [ ] **Phase 3 구현 D**: AdminDashboard "지금 import" 버튼 (자동 동기화 대신 수동 트리거)
- [ ] **Phase 3 보강(스테이지 2)**: HTML 본문 + 이미지 Supabase Storage 백업 (매거진 폐쇄 6개월 전)
- [ ] **Phase 4**: 시민기자 시스템 (TipTap 에디터, 승인 워크플로우)
- [ ] **Phase 5**: 카카오 알림 자동화 + Vercel 배포
- [ ] **Phase 6**: eummedia.kr 도메인 연결 + SEO/AEO 최적화

## ✅ 완료된 작업 (Phase 1 — 2026-05-08)

| 커밋 | 내용 |
|---|---|
| f92fc92 | About/Subscribe 깨진 파일 복구 |
| 2f53033 | 5개 페이지 라우팅 추가 + mailto 폼 3단계(form/pending/submitted) 흐름 |
| e2de0f2 | Footer 3열 레이아웃 개편 |
| 96ce101 | 헤더·푸터 통일성 정리 + dead style 청소 |
| b55d8f2 | AdminDashboard 체크리스트 시니어 친화 리팩토링 |
| 1fd592b | 첫 인수인계 문서(HANDOFF.md) 추가 |

> 최근 commit 목록은 `git log --oneline -15`로 확인.

## ✅ 완료된 작업 (이번 세션 — 2026-05-09)

| 단계 | 커밋 | 내용 | 결과 |
|---|---|---|---|
| 0 | 2442c5d | 인수인계 문서를 docs/HANDOVER.md 로 이전 | ✅ |
| 1 | 6bfb44d | `.env` 보안 정리 — `.gitignore` 패턴(`.env*`+`!.env.example`), `.env.example` 생성, `.env` 추적 해제 | ✅ |
| 2 | (no commit) | 첫 .env 노출 점검 (`git show dc56c4e:.env`) | ✅ ANON_KEY 12자 한글 placeholder만 — **rotate 불필요** |
| 3 | (no commit) | `.env` UTF-8 재작성, 사용자가 실제 anon key 붙여넣기 | ✅ 208자 정상 JWT |
| 4 | (no commit) | `node test-supabase.js` 실행 → `articles` 테이블 SELECT | ✅ status 200, 1.1초, 0 row |
| 5 | (이 커밋) | HANDOVER 갱신 — 이번 세션 진전 반영 | ✅ |

### 🆕 중요 발견

- **Migration SQL이 이미 적용된 상태**. 이전 HANDOVER에는 "Migration 적용 또는 Edge Function 구축"이 다음 할 일로 적혀 있었지만, 검증 결과 `articles` 테이블이 이미 존재하고 RLS도 anon read를 허용함. 누군가(이전 세션에서 사용자 직접?) Supabase 대시보드 SQL Editor 또는 CLI로 적용한 것으로 추정됨.
- 다만 `articles` 외 나머지 6개 테이블의 적용 여부는 미확인.

## 🔄 진행 중 작업 (Phase 2 → Phase 3 진입 준비)

### Supabase 셋업 — 최신 상태 (2026-05-09)

- ✅ supabase-js v2.105.1 설치됨
- ✅ `.env` 정상 (UTF-8 ASCII, ANON_KEY 208자 정상 JWT)
- ✅ `src/lib/supabase.js` 클라이언트 정상
- ✅ `supabase/migrations/` 에 SQL 8개 준비됨 (users/channels/articles/comments/subscriptions/advertisements/reports/auth_trigger + 통합본)
- ✅ **`articles` 테이블 실제 존재 확인** (anon SELECT 200 OK, 0 row)
- ✅ **`articles`에 RLS anon read 허용 정책 적용 상태**
- ✅ **.env 보안 정리 완료** — 첫 커밋(dc56c4e) 노출 내용은 한글 placeholder뿐, 실제 키 GitHub 노출 0건
- ⚠️ React 코드에서 supabase 실제 호출 0건 (Login/Signup에 주석 처리만, 변함 없음)
- ❓ 나머지 6개 테이블(users/channels/comments/subscriptions/advertisements/reports) 적용 여부 미확인
- ❓ Personal Access Token(PAT) 미발급 → MCP `list_tables`, `get_advisors` 등 관리자 도구 사용 불가

### 다음 즉시 할 일 → Phase 3-C 시작 (C-1 Home.jsx부터)

> 🟢 **사전 준비 100% 끝.** Edge Function 배포됨, articles 39건 import됨, channels.english_slug 마이그레이션됨, Edge Function 소스 git에 보관됨.
> 다음 세션은 곧바로 C-1 들어갈 수 있음.

1. **C-1: `src/pages/Home.jsx` mock → Supabase 교체** ← **다음 세션 시작점**
   - 현재 상태: mock 데이터 사용 중 (Header 채널 메뉴는 `politics/economy` 등 죽은 path)
   - 작업:
     - `import { supabase } from '../lib/supabase'`
     - `supabase.from('articles').select('id, title, summary, thumbnail_url, slug, published_at, channels(name, english_slug)').eq('status','published').order('published_at',{ascending:false}).limit(N)`
     - 카드 클릭 시 `/article/${article.slug}` 또는 `/channel/${channel.english_slug}/${article.slug}` 패턴
   - 채널 색상은 ChannelList.jsx의 `CHANNEL_META`(채널명 → 색/아이콘) 그대로 활용 가능 — articles의 `channels.name`을 키로 사용
2. **C-2: `src/pages/ChannelList.jsx` + `Header.jsx` 동시 정정**
   - URL 파라미터를 한글 → `english_slug` 로 변경 (`/channel/magazine` 등)
   - ChannelList: `useParams().englishSlug`로 `channels.english_slug` 룩업 → channel_id 얻기 → `articles.eq('channel_id', id)`
   - Header.jsx 7개 path를 영문 slug로 일괄 정정:
     - `politics → magazine` / `economy → local` / `society → edu` / `culture → people` / `health → trend` / `life → voice` / `opinion → view`
3. **C-3: `src/pages/ArticleDetail.jsx` mock → Supabase**
   - `supabase.from('articles').select('*, channels(name, slug, english_slug)').eq('slug', slug).single()`
   - 외부 URL 재구성: `https://eummagazine.com/${channel.slug.split('-').pop()}/?idx=${article.slug}&bmode=view`
   - "[원문 보기]" 새 탭 링크 (스테이지 1 정책 — 스테이지 2에서 본문 직접 표시로 교체)
4. **D: AdminDashboard "지금 import" 버튼**
   - 위치: `src/pages/AdminDashboard.jsx`
   - 함수 호출: `await fetch('https://avbsniuthpcejjcdeiyw.supabase.co/functions/v1/import-magazine', { method:'POST', headers:{ Authorization:`Bearer ${anon키}` }})`
   - 응답 JSON에서 `upserted/skipped/durationMs` 표시
   - 매거진 신규 발행 시 편집국장이 클릭 1회 → 동기화

### 🗂 다음 세션이 알면 좋은 것 (C-1 시작용 빠른 참조)

| 항목 | 값 |
|---|---|
| articles 행 수 | **39** (`status='published'` 모두) |
| 가장 최근 기사 published_at | `2026-05-08T23:15:40+00:00` (UTC) |
| content 평균 길이 | 약 2,355자 (og:description 풍부) |
| summary 평균 길이 | 약 150자 (NULL 0건) |
| thumbnail_url | 모든 행 채워짐 (cdn.imweb.me) — 6개월 후 폐쇄 위험 |
| channels.english_slug | `magazine, local, edu, people, trend, voice, view` |
| supabase-js | v2.105.1 (`src/lib/supabase.js` 정상) |
| anon SELECT 정책 | articles `status='published'` 허용 / channels `is_active=true` 허용 (이미 검증됨) |

### 🎯 다음 세션 시작 명령어 (정세연님 메모용)

> "안녕! docs/HANDOVER.md 를 읽고 현재 상태 파악해줘. 다음 즉시 할 일의 1번(C-1 Home.jsx)부터 시작할 준비 됐는지 확인하고, 시작 전에 나에게 OK 받기."

## 📝 결정된 사항

- **RSS 처리 방식**: Supabase Edge Function (옵션 B). C(빌드타임)는 시민기자 활성화 후 확장성 부족
- **commit 단위**: 의미 단위로 분리, 한국어 메시지
- **push 방식**: master 브랜치에 직접 push (PR 사용 안 함)
- **사용자 확인 절차**: 파일 수정/삭제 시 사용자 OK 받기 (특히 git 작업)
- **anon key rotate 생략 결정** (2026-05-09): 첫 커밋 노출 내용이 한글 placeholder뿐임을 `git show`로 확인 → rotate 작업 불필요
- **봇 계정 식별자 확정** (Phase 3 import author, 2026-05-09):
  - id = `fd1adda6-d3ed-42d5-b0ed-540dde82776b` (Edge Function의 `AUTHOR_UUID`로 사용)
  - email = `bot@eummedia.kr` / nickname = `이음매거진` / role = `admin` / is_active = true
- **slug 규약 1차 확정** (2026-05-09): `articles.slug = idx 숫자` / `channels.slug = 'name-boardId'` (예: `magazine-21`). 외부 URL은 React에서 재구성. board_id 컬럼 추가는 2차 작업
- **content NOT NULL 회피** (2026-05-09): placeholder Markdown + 원문 링크 저장 (시니어 친화 톤). 2차에서 본문 크롤링으로 채움
- **Edge Function 인증** (2026-05-09): service_role key 필요 (anon은 RLS에 막힘). 1차 트리거는 수동 HTTP POST
- **service_role key 위치** (2026-05-09): Supabase 대시보드 → ⚙️ Project Settings → API Keys → "Legacy anon, service_role API keys" 탭 → service_role 옆 `Reveal` 버튼. URL: `/dashboard/project/avbsniuthpcejjcdeiyw/settings/api-keys`
- **service_role key 노출 정책** (2026-05-09): 채팅·코드·git에 절대 노출 금지. Edge Function의 환경변수(`SUPABASE_SERVICE_ROLE_KEY`)에만 보관 (`supabase secrets set` 또는 대시보드의 Edge Functions → Secrets)
- **import-magazine 1차 실행 결과 확정** (2026-05-09): RSS 41건 → upserted 39건 / skipped 2건(shop_view) / errors 0건 / durationMs 12,423ms. 채널별 분포: 이음트렌드 12, 이음보이스 7, 이음뷰 5, 이음로컬 4, 이음매거진 4, 이음피플 4, 이음에듀 3
- **URL slug 영문 신설 결정** (2026-05-09): React 라우팅용 영문 slug = `magazine / local / edu / people / trend / voice / view`. channels 테이블에 `english_slug text NOT NULL UNIQUE` 컬럼 추가 (기존 `slug='name-boardId'`는 그대로 유지 — Edge Function 호환). 이전 Header.jsx의 politics/economy 같은 죽은 path는 C 단계에서 정정
- **자동 동기화 정책 결정** (2026-05-09): pg_cron/외부 cron 대신 **AdminDashboard "지금 import" 버튼** (Phase 3-D). 매거진 6개월 후 폐쇄 + 봉숭아학당 "손맛 검증" 철학 부합. 향후 재발행 잦아지면 cron 도입
- **`channels.english_slug` 마이그레이션 실행 완료** (2026-05-09): 컬럼 추가 + 7행 매핑(`magazine/local/edu/people/trend/voice/view`) + NOT NULL + UNIQUE 적용 검증. 기존 `slug` 컬럼 무손상(`^[a-z]+-\d{2}$` 정규식 검증=7), articles 39건 무영향. **앞으로 React URL 라우팅은 `english_slug`만 사용**, Edge Function은 기존 `slug` 그대로 사용
- **import 데이터 품질 통계** (2026-05-09): articles 39건, NULL 0건, content 평균 2,355자 (og:description 풍부함 확인). 채널별 분포: 이음트렌드 12, 이음보이스 7, 이음뷰 5, 이음로컬/피플/매거진 각 4, 이음에듀 3

## 🚨 알려진 이슈

1. ~~**.env 보안 (anon key 노출 우려)**~~ — ✅ **해결됨 (2026-05-09)** — .gitignore 처리, .env.example 생성, 첫 커밋 점검 결과 실제 키 노출 없음 확인.
2. ~~**Header URL slug 한글 + DB 매핑 부재**~~ — 🟢 **DB 마이그레이션 완료, React 정정만 남음 (2026-05-09)**:
   - DB: `channels.english_slug` 컬럼 추가됨, 7행 매핑 완료 (`magazine/local/edu/people/trend/voice/view`)
   - React 잔여 작업 (C-2에서 처리):
     - `src/components/Header.jsx`의 7개 path를 영문 slug로 정정 (현재 `/channel/politics` 등 죽은 링크)
     - `src/pages/ChannelList.jsx`의 한글 channelName 사용 → english_slug로 변경
     - `src/pages/Home.jsx` / `ArticleDetail.jsx`의 채널 링크도 모두 english_slug 패턴으로
3. **inp/lbl 스타일 객체 중복**: 3개 파일에 반복, 추후 리팩토링
4. **나머지 6개 테이블 적용 여부 미확인** (2026-05-09 신규):
   - 확인된 것: `articles` 만 (anon SELECT로 검증)
   - 미확인: users, channels, comments, subscriptions, advertisements, reports
   - Phase 3 진행 중 필요한 테이블이 나타나면 그때 점검 (전수 점검은 보류)
5. **PAT 미발급** (2026-05-09 신규):
   - Supabase MCP의 `list_tables`, `get_advisors` 등 관리자 권한 도구 사용 불가
   - 필요해지면 https://supabase.com/dashboard/account/tokens 에서 발급 안내
6. **`.env.old` 백업 파일 로컬에 존재** — `.gitignore`로 추적 안 됨. 한글 placeholder만 들어있어 보안 위험 없음. Phase 3 진입 전 삭제 권장.
7. **auth_trigger 자동 작동 안 한 사례 발견** (2026-05-09 신규):
   - `bot@eummedia.kr` 봇 계정을 대시보드에서 생성했지만 `public.users` 행이 **자동 생성되지 않음** (total_users=0 직접 SELECT로 확인)
   - `on_auth_user_created` 트리거 자체는 등록되어 있음을 확인
   - 추정 원인: 봇 계정 생성이 트리거 등록보다 먼저였거나, 트리거 실행 시 다른 제약/레이스에 걸렸을 가능성. 확정 못 함
   - 해결: `public.users`에 수동 INSERT (id=`fd1adda6-d3ed-42d5-b0ed-540dde82776b`, nickname=`이음매거진`, role=`admin`, is_active=true) → 1행 정상 생성
8. ~~**A-2(7채널 INSERT) 진행 시 트리거/FK 의존성 점검 필요**~~ — ✅ **해결됨 (2026-05-09)**:
   - 7채널 INSERT가 트리거/FK 의존성 문제 없이 1회에 깔끔히 성공 (`count(*)=7` 확인)
   - A-1의 `auth_trigger` 사례와는 달리 `channels` INSERT는 자동 트리거 의존성이 없음 (참고 기록)
9. **Supabase 키 시스템 세대 교체 진행 중** (2026-05-09 신규):
   - Legacy: `anon` + `service_role` ← 본 프로젝트 현재 사용
   - 신 시스템: `Publishable` + `Secret`
   - 대시보드 화면 하단에 "Disable legacy API keys" 권장 알림 존재 (즉시 강제 아님)
   - **Phase 3 (현재)**: Legacy 그대로 사용. 변경 비용 0
   - **Phase 5 (Vercel 배포 시)**: 신 시스템 마이그레이션 검토 — 그 시점 Supabase 권장 정책 재확인

## 🛠️ 사용자 환경 주의사항

- **Windows PowerShell**: 파일 생성 시 UTF-16/CP949 저장 위험 → 항상 UTF-8 명시
- **메모장(Notepad)으로 .env 같은 긴 한 줄 파일 열지 말 것** (2026-05-09 교훈):
  - JWT 등 긴 값은 화면 밖으로 늘어져 "줄이 사라진 것"처럼 보일 수 있음
  - 실제 디스크는 멀쩡한데 사용자가 손상으로 오해 → 멀쩡한 키를 지우는 사고 위험
  - **권장**: VSCode 또는 Claude Code Desktop 내장 편집기 사용
  - .env 정정 시 VSCode Ctrl+H "찾기-바꾸기"가 가장 안전 (PASTE_YOUR_KEY_HERE 같은 토큰 패턴 사용)
- **node -e 명령어 함정**: 직접 실행 시 명령어 텍스트가 파일에 들어가는 사례 발생
- **권장**: Claude Code에서 모든 파일 작업 처리, 사용자에게 직접 PowerShell 명령 시키지 말 것
- **PR 만들지 말 것**: 사용자가 PR 워크플로우 익숙하지 않음

## 🤖 협업 규칙 (Claude Code ↔ 사용자)

1. **세션 시작**: 이 HANDOVER.md를 가장 먼저 읽고 현재 상태 요약 보고
2. **작업 진행**: 한 번에 하나의 의미 있는 단위만, 진단→계획→실행 순서
3. **권한 요청**: 파일 변경, git 작업, 패키지 설치 시 사용자 확인 필수
4. **작업 완료**: 결과 요약 + 다음 단계 제안
5. **세션 종료**: 이 HANDOVER.md 업데이트 + commit & push
6. **추측 금지**: 막히는 부분 발생 시 추측 말고 즉시 멈춰서 사용자에게 보고

## 📚 참조 문서

- 설계지침서: 0_이음미디어_설계지침서_v2.html (사용자 보유)
- 매거진 사이트: https://eummagazine.com/
- 카카오 채널: http://pf.kakao.com/_xmVHxen
