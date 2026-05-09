# 이음미디어 프로젝트 인수인계 (HANDOVER)

> 이 문서는 Claude Code 세션 간 컨텍스트 유지를 위한 살아있는 문서입니다.
> 세션 시작 시: 이 문서를 가장 먼저 읽으세요.
> 세션 종료 전: 반드시 이 문서를 업데이트하고 commit & push 하세요.
>
> **마지막 작업: 2026-05-09** — .env 보안 정리 + Supabase 연결 검증 + Migration 적용 발견

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
- [ ] **Phase 3**: 매거진 30여 개 기사 마이그레이션 ← **다음**
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

### 다음 즉시 할 일 → Phase 3 시작

1. **매거진 RSS 전략 확정**
   - eummagazine.com 의 RSS URL 확인 (전체 / 카테고리별)
   - Edge Function 트리거 방식 (cron / 수동 / Webhook)
2. **articles 스키마 ↔ 매거진 데이터 매핑 정리**
   - `supabase/migrations/20260430000003_create_articles.sql` 컬럼 ↔ RSS 필드
3. **첫 Edge Function 구현 + 배포**
   - 위치: `supabase/functions/import-magazine/index.ts` (Deno)
   - 역할: 매거진 RSS 읽어 `articles` 테이블에 upsert
4. **React 측 articles 표시 연결**
   - Home / ChannelList / ArticleDetail 의 mock 데이터를 supabase 호출로 교체

## 📝 결정된 사항

- **RSS 처리 방식**: Supabase Edge Function (옵션 B). C(빌드타임)는 시민기자 활성화 후 확장성 부족
- **commit 단위**: 의미 단위로 분리, 한국어 메시지
- **push 방식**: master 브랜치에 직접 push (PR 사용 안 함)
- **사용자 확인 절차**: 파일 수정/삭제 시 사용자 OK 받기 (특히 git 작업)
- **anon key rotate 생략 결정** (2026-05-09): 첫 커밋 노출 내용이 한글 placeholder뿐임을 `git show`로 확인 → rotate 작업 불필요

## 🚨 알려진 이슈

1. ~~**.env 보안 (anon key 노출 우려)**~~ — ✅ **해결됨 (2026-05-09)** — .gitignore 처리, .env.example 생성, 첫 커밋 점검 결과 실제 키 노출 없음 확인.
2. **Header URL slug 한글**: `/channel/이음매거진` → 추후 `/channel/magazine` 로 변경 권장 (SEO)
3. **inp/lbl 스타일 객체 중복**: 3개 파일에 반복, 추후 리팩토링
4. **나머지 6개 테이블 적용 여부 미확인** (2026-05-09 신규):
   - 확인된 것: `articles` 만 (anon SELECT로 검증)
   - 미확인: users, channels, comments, subscriptions, advertisements, reports
   - Phase 3 진행 중 필요한 테이블이 나타나면 그때 점검 (전수 점검은 보류)
5. **PAT 미발급** (2026-05-09 신규):
   - Supabase MCP의 `list_tables`, `get_advisors` 등 관리자 권한 도구 사용 불가
   - 필요해지면 https://supabase.com/dashboard/account/tokens 에서 발급 안내
6. **`.env.old` 백업 파일 로컬에 존재** — `.gitignore`로 추적 안 됨. 한글 placeholder만 들어있어 보안 위험 없음. Phase 3 진입 전 삭제 권장.

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
