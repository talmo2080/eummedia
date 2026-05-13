# 이음미디어 프로젝트 인수인계 (HANDOVER)

> 이 문서는 Claude Code 세션 간 컨텍스트 유지를 위한 살아있는 문서입니다.
> 세션 시작 시: 이 문서를 가장 먼저 읽으세요.
> 세션 종료 전: 반드시 이 문서를 업데이트하고 commit & push 하세요.
>
> **마지막 작업: 2026-05-14** — P-03 항목 C **단계 1·2 통합 완성** (is_featured 마이그레이션 실행 + ChannelList Supabase 전환 + 7채널 dev 검증 통과) + **협업 구조 시스템 첫 실제 작동 검증** (옵스 박제 파일 4개 첨부 → 5분 따라잡음). **P-03 진행도 50% → 70%**. **다음 시작점: 항목 C 단계 3 (UI 인터랙션 + CHANNEL_META 영문 키 재구성 + 7채널 설명문 카피)** — 자세한 가이드는 `docs/session-handoff-2026-05-14.md` + 설계안 `docs/design-proposals/2026-05-13-channel-list-feature.md`

## 🎯 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | 이음미디어 (eummedia.kr) |
| 정체성 | 시민기자 50명 기반 인터넷신문, 매일 업데이트 |
| 발행인 | 성창운 (봉숭아학당 총장) |
| 편집국장 | 정세연 (사용자, 비개발자) |
| 기술 스택 | React + Vite + Supabase |
| GitHub | talmo2080/eummedia (master 브랜치) |
| 로컬 경로 | C:\Users\OWNER\eum-media |
| 도메인 | eummedia.kr (가비아, 미연결) |
| 사용자 환경 | Windows + PowerShell + Claude Code Desktop |

## 🌟 이음미디어 정체성 (편집인 박제)

> 2026-05-12 P-03 작업 중 세연님(편집국장)이 등록증 기준으로 명문화한 매체 정체성. 모든 페이지 카피·채널 정의·운영 방식의 법적 기준.

### 📣 대표 슬로건 (전면)
> **"이음미디어는 세상과 당신을 잇고, 당신의 성공이 우리의 뉴스입니다."**

### 📰 부 슬로건 (편집 철학)
> **"이음미디어는 정보를 모으는 곳이 아니라 정보를 거르는 곳입니다."**

### 🧭 채널 배치 철학
**매거진 → 피플 → 로컬 → 에듀 → 뷰 → 트렌드 → 보이스**

> "AI 시대 감성 저널리즘 — 사람으로 시작해 사람으로 이어지는 구조"

- 1번 자리 **이음매거진** = 매체의 얼굴, 고정
- 의미 흐름: 매거진(정체성) → 피플(사람·공감) → 로컬(현장) → 에듀(지식) → 뷰(통찰) → 트렌드(흐름) → 보이스(연결)
- **적용 완료 (2026-05-12)**: `Header.jsx`, `About.jsx` 채널 메뉴/카드 (B/B+ 항목)
- **적용 예정 (항목 D)**: `ChannelList.jsx`의 `CHANNELS` 배열. 명제: *"잡지의 표지 목차와 본문 색인이 다른 순서면 독자가 혼란해진다."*

### 📜 법적 정체성 (서울시 인터넷신문사업 등록증)

> 2026년 4월 27일 서울특별시장 직인으로 정식 등록된 인터넷신문 매체. 모든 카피·채널 정의·운영 방식의 법적 기준선.

| 항목 | 내용 |
|---|---|
| 등록번호 | 서울,아56526 |
| 제호 | 이음미디어 |
| 종별/간별 | **인터넷신문** ⚠️ 일간·주간 비해당 — **발행 주기 자유** |
| 홈페이지 | eummedia.kr |
| 발행소 | 서울특별시 관악구 남부순환로 1699, 2층 |
| 전화 | 02-6956-0339 |
| 발행인 | 주식회사 봉숭아학당문화혁신학교 성창운 |
| 편집인 | 정세연 |
| 보급지역 | 전국 |
| 유가/무가 | 무가 |
| 등록일 | 2026-04-27 |

**발행 목적 (원문)**:
> 시니어 및 소상공인 등 평범한 이웃의 이야기를 조명하고, 문화, 예술 정보, 지역 골목상권 소식, 평생학습 및 AI, 디지털교육 정보를 제공하여 지역 사회 연결 및 건전한 여론 형성에 기여하는 것

**발행 내용 — 채널 7개 법적 정의 (원문)**:
- **이음매거진**: 문화, 예술 전시 및 공연 리뷰
- **이음로컬**: 지역 소상공인 및 골목 상권 탐방
- **이음에듀**: 교육 강좌 및 평생학습 트렌드
- **이음피플**: 중장년·시니어 및 시민기자 스토리
- **이음트렌드**: AI 도구 및 디지털 트렌드
- **이음보이스**: 방송 스피치 칼럼
- **이음뷰**: 사회·경제·시사에 대한 독자적 관점의 해설

### 🌊 운영 리듬 (모델 D 확정 — 2026-05-12)

> **이음미디어는 두 가지 리듬으로 운영한다.**
> 사이트는 매일의 강 — 새 이야기가 흐른다.
> 카카오는 주말의 큐레이션 — 매주 토요일 아침, 편집국장이 고른 한 주의 핵심 5건.

- **사이트(eummedia.kr)**: 매일의 강 — 새 이야기가 흐름
- **카카오 채널**: 주말의 큐레이션 — 매주 토요일 아침 핵심 5건
- **다음 세션 작업**: Subscribe 페이지 전체 모델 D 카피 적용 + About:325 CTA 정리 + 등록증 이미지 보관

### ⚠️ 다음 세션 카피 잔여 작업

| 위치 | 현 표현 | 처리 방향 |
|---|---|---|
| `Subscribe.jsx:25` | `'매주 토요일 받기'` + 카카오 5건 안내 | 모델 D 카피 적용 (사이트 매일·카카오 주말 명확 분리) |
| `Subscribe.jsx:62` | `매주 토요일 아침, 편집국장이 직접 고른 핵심 기사 5건` | 표현 유지 가능 (운영 약속과 부합) — 모델 D 박제 표현 도입 검토 |
| `Subscribe.jsx:281` | `주간 뉴스레터 발송, 시민기자 모집·구독 관련 안내` | 개인정보처리방침 영역 — 컨텍스트 정독 후 처리 |
| `About.jsx:325` | (CTA) `매주 토요일 카카오톡으로` | 모델 D 표현으로 정리 |
| `Footer.jsx:75` | `등록번호: 서울,아56526` | ✅ 등록증 실물(2026-05-13 확인)과 일치 — 정정 불필요 |
| `docs/legal/` 등록증 이미지 | 미보관 | 세연님 경로 안내 후 복사 |

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
- [x] **Phase 3 구현 C-1 (P-01)**: Home.jsx mock → Supabase 전체 교체 + 로딩/에러 UI + 푸터 등록번호 (2026-05-10) ✅
- [ ] **Phase 3 구현 C-3 (P-02)**: ArticleDetail.jsx mock → Supabase ← **다음 시작점** (기사 상세, HERO/카드 클릭 정상화)
- [ ] **Phase 3 구현 C-2**: ChannelList.jsx + Header.jsx URL slug 영문 정정
- [ ] **🎯 정식 발행 목표**: **2~3주 내** (P-02 + C-2 + Phase 3-D + 최소 다듬기 후 가비아 도메인 연결)
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

## ✅ 오늘 완료 (2026-05-09 후반부)

- **Phase 3-B 검증 SQL 5개 100% 통과**
  - 39건 정확, 7채널 분포 정확, NULL 0개, content 평균 2,355자
- **english_slug 마이그레이션 성공**
  - `magazine, local, edu, people, trend, voice, view`
- **STEP 4-A HERO 연동 성공** (commit `92fbcb9`)
  - 화면 검증: "손으로 읽는 예술 — 도자사용전 《만지면 이해되는 것들》" (이음트렌드, 2026.05.09) 정상 표시
  - DB 검증 [3]번 쿼리 결과와 정확히 일치
  - mock HERO 상수 제거, useState/useEffect로 Supabase fetch
  - cancelled 플래그(StrictMode 안전), WebkitLineClamp 2줄(title/summary)
- **`.gitignore` 정리** (commit `6bcb10d`)
  - `test-*.js` 패턴 추적 제외 (검증용 스크립트 보존)

## ✅ 오늘 완료 (2026-05-10) — C-1 (P-01) 완성

총 4 commit, Home.jsx mock → Supabase 전체 교체 + 로딩/에러 UI + 푸터 등록번호 정식 표기.

| 단계 | commit | 내용 | 결과 |
|---|---|---|---|
| STEP 4-B | `a02a932` | ARTICLES 6건 통합 쿼리 (`.limit(7)`) + formatDate helper (YYYY.MM.DD) + views 제거 + WebkitLineClamp 2줄 | ✅ |
| 푸터 | `e0e9452` | 인터넷신문 등록번호 정식 표기 (서울,아56526) + 책임자 정보 (발행인/편집인/대표) + fontSize 14px (시니어 친화) | ✅ |
| STEP 4-C | `e6a76c6` | POPULAR 5건 분리 쿼리 (`.range(7, 11)`) + 라벨 "인기 기사" → "추천 기사" (편집인 추천 의미) | ✅ |
| STEP 4-D | `991588d` | 로딩 placeholder 통합 (HERO + ARTICLES 6 + POPULAR 5) + 통합 `error` state + 에러 배너 (`role="alert"`) + `aria-busy` 접근성 | ✅ |

### 🏆 마일스톤
- 🎊 **인터넷신문 등록번호 정식 발급**: `서울,아56526` (등록증 발급 완료 — 발행 인프라 확보)
- 🎯 **C-1 메인 홈페이지 완성**: 실제 매거진 39건 중 12건이 HERO/ARTICLES/POPULAR 3개 영역에 살아남
- 🌟 **발행인 성창운 회장 기사**가 추천기사 1번 자리에 자동 배치 (편집인 의도 ↔ 시스템 정렬 합치)
- 📐 **CLS(레이아웃 점프) 0** — 스켈레톤이 실카드와 동일 박스 크기

### 📌 5가지 원칙 (재확인)
- **분리 쿼리** 패턴 (HERO+ARTICLES 통합 / POPULAR 별도) — 의미적 단일 책임
- **데이터 길이/null 기반 로딩 판단** — `loading` state 추가 안 함, 4-A 일관성
- **통합 `error` state + 페이지 상단 배너** — 시니어 친화 메시지
- **"한 commit = 한 작업"** — 푸터 작업도 4-B와 별도 분리
- **사용자(정세연) OK 받기 후 적용** — 매 단계 진단→계획→실행

## ✅ 오늘 완료 (2026-05-12) — P-03 A/B/B+ + 이음미디어 정체성 박제

> 세연님이 "광고 사진 보류 · 큰 그림 먼저" 결단으로 P-03을 본격 시작한 날. 동시에 서울시 인터넷신문사업 등록증(2026-04-27 발급) 기준으로 매체 정체성을 코드/문서 양면에 박제한 **편집인의 날**.

### 📦 적용 완료 (commit 일괄)

**코드 (6 파일)**:
- `src/App.jsx` — 라우트 `/channel/:channelId` → `/channel/:englishSlug` + `/channel` → `/` 안전망 리다이렉트 추가 (Navigate import 포함)
- `src/pages/ChannelList.jsx` — `useParams() channelName` → `englishSlug` (라인 40, 42)
- `src/components/Header.jsx` — 7개 메뉴 path 죽은 매핑(politics/economy/...) → 영문 slug(magazine/people/...), 자리 재정렬 (편집인 결정 순서)
- `src/pages/About.jsx` — ① 채널 카드 7개 path/자리 정정 (B+) / ② 히어로 제목 "주간인터넷신문" → "이음미디어" / ③ 히어로 본문 대표 슬로건 + "매일 새 이야기" / ④ 편집 5대 원칙 머리에 부 슬로건 인용 박스
- `src/components/Footer.jsx` — 슬로건 "주간인터넷신문" → "인터넷신문"
- `docs/HANDOVER.md` — 정체성 섹션 신설 (대표/부 슬로건 + 채널 배치 철학 + 법적 정체성 + 운영 리듬 모델 D + 다음 세션 카피 잔여 작업 표)

**문서 (1 신규)**:
- `docs/legal/README.md` — 등록증 보관 폴더 + 안내 (이미지는 다음 세션 보관)

### 🎯 핵심 결정 박제

| 결정 | 내용 |
|---|---|
| URL 슬러그 | AI 시대 SEO/AEO 위해 **영어 slug 7개** 채택 (magazine/people/local/edu/view/trend/voice). 한글 URL은 `%EC%9D%B4...`로 깨져 AI 못 읽음 |
| 채널 순서 | **매거진 → 피플 → 로컬 → 에듀 → 뷰 → 트렌드 → 보이스** (세연님 27년 매거진 본능, AI 시대 감성 저널리즘) |
| 운영 모델 D | **사이트 매일의 강 + 카카오 주말의 큐레이션 (토요일 5건)** |
| 법적 정체성 | **인터넷신문** (등록증 기준, 일간·주간 비해당 → 발행 주기 자유) |
| 5-A 교훈 적용 | 라우트–컴포넌트–DB 3중 단어 통일 (`englishSlug`로 모두) |

### 🏆 마일스톤

- 🎊 **서울시 인터넷신문사업 등록증 정식 발급** (2026-04-27, 서울,아56526) — 매체 법적 정체성 확보. 이음미디어는 이제 가상의 프로젝트가 아닌 **서울시가 인정한 인터넷신문**
- 🎯 **메뉴가 장식에서 기능으로** — Header 7개 죽은 path(politics/economy/...) 사고 완전 봉합
- 📜 **About 죽은 path 7개 부수 발견 + 즉시 봉합** — 창간 직후 새 독자 첫인상 사고 사전 방지
- 🌿 **편집 5대 원칙의 머리에 부 슬로건** — *"이음미디어는 정보를 모으지 않고, 정보를 거릅니다"* 가 원칙들의 시작점이 되는 매거진 구조

### 📌 다음 세션 작업 큐 (우선순위 순)

1. **등록증 이미지 보관** — 세연님이 경로 안내 → `docs/legal/eummedia_registration_2026-04-27.jpg` 복사
2. **등록번호 표기 일관성 — 해소 박제** ✅ 2026-05-13 등록증 실물 확인 결과 `서울,아56526`(한글 '아') 확정. Footer.jsx:75 / HANDOVER.md / session-handoff-2026-05-12.md 일괄 정정 완료. 5/12 박제 오류(OCR 오독으로 '상' 기재)는 5/13 정정 (commit 기록으로 남김)
3. **Subscribe.jsx 모델 D 카피 일괄 적용**:
   - 라인 25, 62 표현 정정
   - `About.jsx:325` CTA 같이 처리
   - 세연님 확정 카피: *"이음미디어는 매일 새 이야기로 업데이트됩니다. 매주 토요일 오전, 편집국장이 고른 한 주의 핵심 5건을 카카오톡으로 보내드립니다."*
4. **Subscribe.jsx:281** — 개인정보처리방침 영역. 컨텍스트 정독 후 처리
5. **항목 C (데이터 쿼리 패턴)** — `ChannelList.jsx`의 DUMMY → Supabase 교체. P-03 본격 재개. `channels.english_slug` 룩업 → `channel_id` → `articles` 2단/조인 쿼리 설계
6. **항목 D (UI 카드 + ChannelList CHANNELS 순서 일치)** — *"잡지의 표지 목차와 본문 색인이 다른 순서면 독자가 혼란해진다"* 명제 박제 작업 자리
7. **항목 E (로딩/에러 UI)** — Home/ArticleDetail 패턴 재사용
8. **항목 F (빈 채널 처리)** — 메시지 이미 구현됨("아직 기사가 없습니다 📬"), 세연님 27년 매거진 감각으로 최종 문구 결정

### ⚠️ 협업 원칙 — 어제 사고(ArticleDetail) + 오늘 교훈 박제

**절대 금지 3개**:
1. **옵스 검증 없이 코드 적용** — 설계안 → 옵스 → 세연 OK → 적용
2. **세연 OK 없이 commit** — 적용 후도 commit은 별도 OK
3. **세션 마감 때 "다음 세션을 위해 미리" 우선순위 작업 파일에 손대기** (코드/폴더/파일 모두) — 어제 사고의 원흉

**"미리 해두면 좋을 거" 선의 = 금지**. 대신 → "제가 이건 먼저 해두면 도움 될까요?" → OK 받고 진행.

**오늘 클론이 학습한 메타인지** (다음 세션이 이어받을 것):
- `modified` 파일 발견 시 → **즉시 빨간 깃발**. "이 변경의 출처와 검증 이력을 확인해야 합니다"가 첫 보고
- 동일 메시지 두 번 받았을 때 → **추측 금지, 멈춰 보고**
- 부수 발견(예: About 죽은 path) → **임의 처리 없이 옵션 균형 제시 + 세연님 결정**
- 명명 결정 시 → **DB 컬럼명과 1:1 매칭**이 5-A 재발 방지 최강 (`:englishSlug` ↔ `channels.english_slug`)

### 🎙️ 세연님 음성 입력 오타 패턴 (문맥 추론용)

세연님이 카톡 음성 입력으로 보내는 메시지에 자주 보이는 단어 매핑:
- **옵스** → 없어요/오프스/엡스
- **클론** → 클로니/크론
- **이음** → 이움/이엄
- **채널** → 체널/재널
- **슬러그** → 스럭/슬락

문맥상 명확하면 추론으로 진행, 모호하면 한 번 더 확인.

## ✅ 오늘 완료 (2026-05-13) — 협업 구조 박제 + 등록증 OCR 사고 정정 + 항목 C 설계안 1.0

> 세연님이 새 채팅창에서 옵스에게 박제 파일을 직접 첨부하는 협업 패턴을 처음 시도한 날. 동시에 5/12 박제의 등록번호 OCR 오독이 발견·정정된 **편집인의 메타인지 박제일**.

### 📦 적용 완료

**박제 정정 (commit `4e7345b`)**:
- `docs/HANDOVER.md` (4 곳): 라인 49 / 91 / 240 / 248 — `서울·상56526` → `서울,아56526` (라인 91·248은 해소 박제 항목으로 재작성)
- `docs/session-handoff-2026-05-12.md`: 원문 보존 + 끝부분에 `⚠️ 2026-05-13 정정 메모 (사후 박제)` 박스 추가
- (5/10 핸드오프 4건 + `Footer.jsx:75`는 처음부터 '아'로 정확 — 정정 불필요)

**박제 신규 (오늘 commit 예정)**:
- `docs/session-handoff-2026-05-13.md` — 오늘 세션 인계
- `docs/design-proposals/2026-05-13-channel-list-feature.md` — 항목 C 설계안 1.0
- `docs/HANDOVER.md` — 본 섹션 + 머리 마지막 작업 갱신 + 작업 큐 갱신

### 🌟 큰 발견 — 협업 구조 핵심 영구 박제

**"옵스에게 박제 파일을 직접 줘야 한다"**

옵스(Claude.ai)는 새 채팅창마다 백지 상태. 다음 3개 파일이 협업의 다리:

1. `docs/HANDOVER.md` — 전체 맥락
2. 가장 최신 `docs/session-handoff-YYYY-MM-DD.md` — 직전 세션 결정·사고·메타인지
3. `0_이음미디어_설계지침서_v2.html` — 봉숭아학당 설계도 95% 방법론 원본

세연님 매 새 채팅창 루틴: 위 3개를 옵스에 첨부 → 큰 그림 의논 가능. 이 다리 없으면 옵스 협업 효율 0.

### 🎯 P-03 항목 C 설계안 1.0 — 의논 진행 박제

| 항목 | 결정 |
|---|---|
| **C-1** | "편집국장의 픽" (편집인 수동) — `articles.is_featured` 컬럼, 채널당 1건만 true (Partial Unique Index) |
| **C-2** | 채널별 분리 쿼리 (5/10 결정) |
| **C-3** | 픽 1건 + 최신 N건 별도 fetch |
| **C-4** | 페이지네이션 — 클라이언트 측 "더 보기" 9건 단위 유지 |
| **C-5** | SPONSORED 배지 — P-03 제외, 별도 사이클 |
| **C-6** | `status='published'` 필터 (RLS 기본) |
| 파일명 | `ChannelList.jsx` 그대로 (rename 안 함) |
| 마이그레이션 | Supabase 대시보드 SQL Editor 직접 실행 + `supabase/migrations/`에 영구 박제 |

세부 설계: `docs/design-proposals/2026-05-13-channel-list-feature.md` 참조.

### 🔥 오늘 사고 메타인지 박제 — 옵스 한 시간 안 3가지 실수 + 클론 빨간 깃발 4개

| # | 옵스 실수 | 클론 빨간 깃발 |
|---|---|---|
| 1 | C-1 세연 확정 안 됐는데 묵시 OK 가정 | "어떤 안인지 명시 필요" |
| 2 | 파일명 임의 변경 (`ChannelList.jsx` → `ChannelPage.jsx`) | "실제 repo는 List만. 호칭 의도인지 rename 의도인지" |
| 3 | SPONSORED 배지를 광고 보류 결단(5/12)과 따로 분류 | "광고 사진 보류와 의미 충돌 가능성" |
| (+) | PAT 권한 상태 미확인 | "시도하면 사용량 소비. 시도 전 확인" |

**교훈**:
- **박제 본다고 만능 아님** — 옵스가 박제 파일을 받고도 한 시간 안에 3가지 실수
- **클론의 빨간 깃발이 진짜 보호막** — 옵스 검증과 클론 실행 사이에 끼어든 "추측 없이 멈춰 보고"가 4건 모두를 사고 전에 잡음
- 다음 세션 클론: 옵스 메시지가 박제 기반이라도 의심 + 결정 영역과 추측 영역을 분명히 가르기

### 🎙️ 메타인지 6종 (5/12 박제 4종 + 5/13 신규 2종)

1. `modified` 파일은 첫 보고 1순위 빨간 깃발
2. 동일 메시지(또는 끊긴 메시지) 받았을 때 → 추측 금지, 멈춰 보고
3. 부수 발견 → 임의 처리 없이 옵션 균형 제시 + 세연님 결정
4. 선의로 미리 손대기 = 금지
5. **5/13 신규**: 옵스가 박제 본다고 만능 아님. 클론의 빨간 깃발이 진짜 보호막. 옵스 메시지도 의심
6. **5/13 신규**: 법적 1차 자료는 이미지 자체를 보관하고 의심나면 재확인. OCR / 사람 눈 모두 한글 시각 유사 음절(아·상 등)을 헷갈릴 수 있음

### ⚠️ 부수 미해결 — 등록증 이미지 보관 (시스템 한계)

Claude Code Desktop이 채팅 첨부 이미지를 모델 입력으로만 base64 휘발성 전달 → 디스크 바이너리 흔적 없음. 클립보드도 빈 상태. 클론 Write 도구는 텍스트 전용. 표기 정정은 완료되었으므로 이미지 보관은 별도 사이클.

### 📌 다음 세션 작업 큐 (우선순위 순, 5/13 갱신)

1. ✅ **항목 C 단계 1 실행 완료** — 5/14: is_featured 마이그레이션 실행 완료 (39 false / 0 true / 컬럼 OK / Partial Unique Index OK). SQL 박제: `supabase/migrations/20260514000001_add_is_featured.sql` (commit `f1623bc`).
2. ✅ **항목 C 단계 2 적용 완료** — 5/14: ChannelList Supabase 전환 완료, 7채널 dev 검증 통과 (매거진/피플/로컬 4건, 에듀 3건, 뷰 5건, 보이스 7건, 트렌드 9→12 페이지네이션). 분리 쿼리 3단 + cancelled cleanup + OFFSET 페이지네이션 + 안전 가드 2줄. commit `71d3607`. **부수 발견 박제**: 7채널 모두 배너 설명문이 "이음미디어의 모든 채널 콘텐츠"로 잘못 표시 (CHANNEL_META 한글 키 / activeChannel 영문 slug 불일치) → 단계 3 묶음. 매거진 카피 세연 결정: **"라이프스타일 전문 콘텐츠"**. 나머지 6채널 카피 미정. 다음 시작점은 단계 3 (UI 인터랙션 + CHANNEL_META 영문 키 재구성).
3. **항목 C 단계 3** — UI 인터랙션 사이클 (세부 분할 — 5/14 갱신):
   - ✅ **3-1**: 7채널 설명문 정세연 편집국장 카피 적용 완료 (5/14). 룩업 fallback 체인 3단 보완 (commit `d8cc7e5`). 부수 효과: 카드 색상/아이콘 채널별 정상화. CHANNEL_META 한글 키 구조 그대로 유지.
   - **3-2**: 카드 footer 정리 (`✍ ` `👁 ` 빈 아이콘 — 단계 2 안전 가드 후 빈 영역으로 남음)
   - **3-3**: "전체" 탭 처리 (현재 클릭 시 `/channel` → 홈 리다이렉트)
   - ✅ **3-4**: 채널 탭 클릭 정상화 + CHANNELS 순서 5/12 박제 적용 완료 (5/14, commit `163f659`). SLUG_BY_NAME 매핑 dict (7건, DB english_slug와 1:1) + switchChannel navigate 정정 + CHANNELS 배열 5/12 박제 순서(매거진→피플→로컬→에듀→뷰→트렌드→보이스) — 5/10 박제 "잡지 목차 = 본문 색인 일치" 원칙 실현. **P-03 진행도 75% → 80%**.
   - ✅ **3-5**: error 통합 배너 + 다시 시도 버튼 박제 완료 (5/14, commit `c8a37e2`). Home.jsx 5/10 박제 패턴 일관성 + retry 버튼 신규 패턴 (ChannelList부터, P-02 등에 향후 자연 전파). retryCount state + useEffect 재트리거. role="alert" 접근성. 검증: `/channel/nonexistent`로 잘못된 slug 진입 → 배너 → 다시 시도 → 정상 URL 변경 시 자동 사라짐 3단계 통과. **P-03 진행도 80% → 85%**.
   - **3-6**: CHANNEL_META 영문 키 재구성 (3-4 SLUG_BY_NAME dict 활용 경로 가능)
4. **항목 C 단계 4** — dev 캡처 검증 (7채널 진입 / 픽 분기 / 빈 채널 / 검색 / 페이지네이션)
5. **등록증 이미지 보관** — 세연님 원본 파일 경로 안내 후 `docs/legal/seoul-a56526-registration-2026-04-27.jpg`로 복사
6. **Subscribe 모델 D 카피 일괄 적용** (5/12부터 이연) — `Subscribe.jsx:25, 62` + `About.jsx:325`
7. **Subscribe.jsx:281** 개인정보처리방침 영역 컨텍스트 정독 후 처리
8. **항목 C 별도 사이클** — SPONSORED 배지 (is_sponsored 컬럼 + AdminDashboard 픽 선정 UI)

## 🚀 다음 세션 시작점: P-02 (`ArticleDetail.jsx` 기사 상세)

> 자세한 가이드는 `docs/session-handoff-2026-05-10.md` 참고.

요지:
- C-1에서 HERO/ARTICLES/POPULAR 카드 클릭 시 `/article/${slug}` 라우팅까지는 작동하지만 ArticleDetail이 아직 mock이라 다른 기사가 표시됨
- P-02 작업: `supabase.from('articles').select('*, channels(name, slug, english_slug)').eq('slug', slug).single()` → 본문 placeholder + "[원문 보기]" 외부 URL 재구성 (HANDOVER 결정사항 참고)
- 작업 흐름은 P-01과 동일: 작은 단위, 옵스 검증, 사용자 OK 후 commit/push

### 🎯 정식 발행 목표 — 2~3주 내
- **남은 핵심 작업**: P-02 (ArticleDetail) → C-2 (Header/ChannelList URL slug) → Phase 3-D ("지금 import" 버튼) → 최소 다듬기 → 가비아 도메인 연결
- C-2 영문 slug 정정과 Phase 3-D 수동 import 버튼은 작업량 가벼움
- 가장 큰 단위는 P-02 (기사 본문 표시 정책 결정 포함)

## ⚠️ 알려진 이슈 (의도된 것 — 다음 세션 무시 OK)

- **HERO 카드 클릭 → 다른 기사 표시**
  - 원인: ArticleDetail.jsx가 아직 mock이라 slug `171203804` 못 찾고 mock fallback
  - HERO 카드 자체와 `/article/${slug}` 라우팅은 정상 작동
  - C-3에서 ArticleDetail 교체 시 자동 해결
- **콘솔 `Uncaught (in promise)` 3개**
  - 출처: 브라우저 확장(Grabbit, Linkify) — `content.js`, `(index):1`
  - Supabase 호출과 무관, 무시 가능

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

## ✅ C-1 진행 기록 (STEP 4-A → 4-D, 박제용 참고)

> **모두 완료** — STEP 4-B/4-C/4-D 적용 + commit + 화면 검증 통과. 이하 섹션은 진행 시점 설계 기록 (히스토리: commit `a02a932`/`e6a76c6`/`991588d`).

### 결정 필요한 3가지 (다음 세션 시작 시 옵스/정세연 결정) — ✅ 모두 채택됨

1. **쿼리 구조**
   - 옵션 A: 통합 `.limit(7)` — `setHeroArticle(data[0])` + `setArticles(data.slice(1))` (네트워크 1회)
   - 옵션 B: 별도 `.range(1, 6)` — 4-A 코드 변경 없이 ARTICLES 쿼리만 추가 (네트워크 +1회)
   - 클론(이번 세션 Claude) 권장: **옵션 A** (의미적 단일 책임 — "최신 기사 묶음 fetch")
2. **날짜 포맷**
   - `formatDate` helper 추가 (YYYY.MM.DD, mock 일관성 — 예: `2026.05.08`)
   - 또는 `toLocaleDateString('ko-KR')` 그대로 사용 (예: "2026. 5. 8.")
   - 클론 권장: **helper 추가** (mock 일관성)
3. **views 라벨 제거**
   - 카드에서 `👁 1,234` 라벨 완전히 빼기
   - 컬럼 없음 SQL 결과로 확정 (`SELECT column_name FROM information_schema.columns WHERE table_name='articles'`에 views 없음)
   - 클론 권장: **제거** (4-D에서 다른 메타 추가 검토)

### 옵션 A 기준 설계 미리보기 (다음 세션 그대로 진행 가능)

```jsx
// 변경 1: useState 두 개로
const [heroArticle, setHeroArticle] = useState(null);
const [articles, setArticles] = useState([]);   // ← 신규

// 변경 2: useEffect의 limit(1) → limit(7) + 분배
useEffect(() => {
  let cancelled = false;
  (async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, summary, thumbnail_url, published_at, channels(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(7);                                 // ← 1 → 7
    if (cancelled) return;
    if (error) { console.error('[HERO+ARTICLES] supabase error:', error); return; }
    setHeroArticle(data?.[0] ?? null);
    setArticles(data?.slice(1) ?? []);           // ← 추가
  })();
  return () => { cancelled = true; };
}, []);
```

**JSX ARTICLES 영역 교체** (현재 `ARTICLES.map` → `articles.map`):

```jsx
{articles.map(a => (
  <Link key={a.slug} to={"/article/" + a.slug}
    style={{ textDecoration:"none", background:"#fff", border:"1px solid #e8e8e8", display:"block" }}>
    <img src={a.thumbnail_url} alt={a.title} style={{ width:"100%", height:"170px", objectFit:"cover", display:"block" }} />
    <div style={{ padding:"14px" }}>
      <div style={{ fontSize:"10px", color: CC[a.channels?.name] || "#0d2d52", fontWeight:"700", marginBottom:"6px" }}>{a.channels?.name}</div>
      <div style={{ fontSize:"14px", fontWeight:"600", color:"#1a1a1a", lineHeight:"1.5", marginBottom:"8px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.title}</div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:"#9a9a9a" }}>
        <span>{formatDate(a.published_at)}</span>
      </div>
    </div>
  </Link>
))}
```

`formatDate` helper (Home.jsx 상단 또는 컴포넌트 외부):
```js
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
```

설계 메모:
- `key={a.slug}` (slug는 unique, 매거진 idx 숫자 안정 키)
- 라우팅 `/article/${slug}` 일관성 (4-A와 동일)
- 채널 색상 `CC[a.channels?.name]` — Home.jsx 상단 mock CC 객체 그대로 활용 (사용자 OK 결정 (2))
- 클램프 추가 — title에 `WebkitLineClamp:2` (4-A 일관성). summary는 카드에 안 보여주므로 제외
- views 제거 — 컬럼 없음 확정. 빈자리 디자인은 4-D에서

### 화면 변화 예측 (4-B 적용 후)

| 영역 | 변화 |
|---|---|
| HERO | 그대로 (4-A 검증 끝) |
| ARTICLES 그리드 6건 | 🔴 mock → 실제 매거진 기사 (HERO 다음 6건, 최신순) |
| 카드 표시 | 채널 색상 / 제목(2줄 클램프) / 날짜(YYYY.MM.DD). 조회수 라벨 사라짐 |
| 사이드바 POPULAR | 그대로 mock (4-C에서) |

### CC 매핑 검증 결과 (다음 세션 참고)

- 7채널 모두 CC에 있음 ✅
  - 매거진(#0d2d52), 에듀(#1a6b3c), 피플(#5c2d8a), 트렌드(#c45c0a), 보이스(#1c4f8a), 뷰(#8a6a00), 로컬(#1a6b3c)
- 잉여 매핑: `이음뉴스` (실제 7채널에 없음) — 무해, 정리는 다음 차수

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

## 📨 다음 세션 시작 메시지 템플릿

세연님이 카톡 또는 채팅으로 그대로 붙여넣을 수 있는 메시지:

---

> 안녕 클론, 이음미디어 작업 이어서 하자.
>
> `docs/HANDOVER.md` 와 `docs/session-handoff-2026-05-12.md` 먼저 읽고 따라잡아줘.
>
> 어제 5/12 P-03 항목 A/B/B+ 완성 + 이음미디어 정체성 4종 박제 + 카피 정정. 오늘은 작업 큐 1번(등록증 이미지)부터 순서대로 갈 계획.
>
> 옵스(Claude.ai)와 의논해서 지시하고, 한 단계씩 설계안 보고 → 세연님 OK 후 적용으로 가자. 어제 박제한 원칙 3가지(검증 없이 적용 금지, OK 없이 commit 금지, 다음 세션 위해 미리 손대기 금지) 꼭 지켜줘.

---

⚠️ 다음 세션 클론이 먼저 확인할 것:
1. `git status` — modified 파일 0건이어야 정상 (1건이라도 있으면 즉시 빨간 깃발)
2. `git log --oneline -5` — 마지막 commit이 세션 마감 commit인지
3. dev 서버 띄우거나 세연님 환경 dev 상태 확인
