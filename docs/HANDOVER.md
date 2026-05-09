# 이음미디어 프로젝트 인수인계 (HANDOVER)

> 이 문서는 Claude Code 세션 간 컨텍스트 유지를 위한 살아있는 문서입니다.
> 세션 시작 시: 이 문서를 가장 먼저 읽으세요.
> 세션 종료 전: 반드시 이 문서를 업데이트하고 commit & push 하세요.

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

- [x] **Phase 1**: React 사이트 통일성 정리 + GitHub 첫 푸시
- [ ] **Phase 2**: Supabase DB 구축 + Edge Function (RSS 자동 import) ← 현재
- [ ] **Phase 3**: 매거진 30여 개 기사 마이그레이션
- [ ] **Phase 4**: 시민기자 시스템 (TipTap 에디터, 승인 워크플로우)
- [ ] **Phase 5**: 카카오 알림 자동화 + Vercel 배포
- [ ] **Phase 6**: eummedia.kr 도메인 연결 + SEO/AEO 최적화

## ✅ 완료된 작업 (Phase 1)

| 일자 | 커밋 | 내용 |
|---|---|---|
| 어제 | f92fc92 | About/Subscribe 깨진 파일 복구 |
| 어제 | 2f53033 | 5개 페이지 라우팅 추가 (App.jsx) |
| 어제 | e2de0f2 | Footer 3열 레이아웃 개편 |
| 어제 | 2f53033 | mailto 폼 자동 완료 처리 개선 (form/pending/submitted 3단계) |
| 어제 | 96ce101 | 푸터 통일성 정리 (5개 페이지 inline footer 제거) |
| 어제 | 96ce101 | 헤더 통일성 + dead style 청소 |
| 어제 | b55d8f2 | AdminDashboard 체크리스트 시니어 친화 리팩토링 |
| 어제 | 1fd592b | 다음 세션 인수인계 문서 (HANDOFF.md) 추가 |

### 최근 git log (--oneline -10)

```
1fd592b docs: 다음 세션 인수인계 문서 추가
b55d8f2 feat: AdminDashboard 시니어 친화 리팩토링 (헤더·푸터 정리 + 체크리스트 재설계)
96ce101 refactor: 헤더·푸터 통일성 정리 + dead style 청소 (4개 페이지)
e2de0f2 refactor: Footer 3열 레이아웃 개편
2f53033 feat: 광고·시민기자·제보·구독 페이지 추가 + 라우팅 + mailto 폼 흐름 개선
f92fc92 fix: About/Subscribe 깨진 파일 복구
d0cb71d 프로젝트8: 플로팅버튼 sticky, 주식위젯, 헤더7채널 완성
9ec2f55 프로젝트7: Header/Footer 공통 컴포넌트 완성
4bf9e97 관리자 페이지 완성 기사목록 기사작성 체크리스트
74a6fe6 회원가입 페이지 완성
```

## 🔄 진행 중 작업 (Phase 2)

### Supabase 셋업 진단 (완료)
- ✅ supabase-js v2.105.1 설치됨
- ✅ .env에 URL/ANON_KEY 설정됨
- ✅ src/lib/supabase.js 클라이언트 정상
- ✅ supabase/migrations/ 에 SQL 8개 준비됨 (users/channels/articles/comments/subscriptions/advertisements/reports/auth_trigger + 통합본)
- ⚠️ 코드에서 supabase 실제 호출 0건 (Login/Signup에 주석 처리만)
- ❓ Supabase 프로젝트 실제 작동 여부 — 사용자 대시보드 확인 대기 중
- 🚨 .env 가 .gitignore에 없음 (첫 커밋에 노출됨, anon key rotate 필요)

### 다음 즉시 할 일
1. Supabase 연결 테스트 (articles 테이블 SELECT)
2. 결과에 따라 Migration 적용 또는 Edge Function 구축
3. Edge Function으로 RSS 가져와 articles 테이블 캐싱

## 📝 결정된 사항

- **RSS 처리 방식**: Supabase Edge Function (옵션 B). C(빌드타임)는 시민기자 활성화 후 확장성 부족
- **commit 단위**: 의미 단위로 분리, 한국어 메시지
- **push 방식**: master 브랜치에 직접 push (PR 사용 안 함)
- **사용자 확인 절차**: 파일 수정/삭제 시 사용자 OK 받기 (특히 git 작업)

## 🚨 알려진 이슈

1. **.env 보안**: 첫 커밋(dc56c4e)에 .env 노출. anon key는 클라이언트 공개용이라 RLS 잘 설정되어 있으면 큰 위험 아님. 정리 필요:
   - .gitignore에 .env 추가
   - Supabase 대시보드에서 anon key rotate (사용자 작업)
   - .env.example 만들기
   - 이전 커밋 .env 흔적 정리 (선택)
2. **Header URL slug 한글**: /channel/이음매거진 → 추후 /channel/magazine 로 변경 권장 (SEO)
3. **inp/lbl 스타일 객체 중복**: 3개 파일에 반복, 추후 리팩토링

## 🛠️ 사용자 환경 주의사항

- **Windows PowerShell**: 파일 생성 시 UTF-16/CP949 저장 위험 → 항상 UTF-8 명시
- **node -e 명령어 함정**: 직접 실행 시 명령어 텍스트가 파일에 들어가는 사례 발생
- **권장**: Claude Code에서 모든 파일 작업 처리, 사용자에게 직접 PowerShell 명령 시키지 말 것
- **PR 만들지 말 것**: 사용자가 PR 워크플로우 익숙하지 않음

## 🤖 협업 규칙 (Claude Code ↔ 사용자)

1. **세션 시작**: 이 HANDOVER.md를 가장 먼저 읽고 현재 상태 요약 보고
2. **작업 진행**: 한 번에 하나의 의미 있는 단위만, 진단→계획→실행 순서
3. **권한 요청**: 파일 변경, git 작업, 패키지 설치 시 사용자 확인 필수
4. **작업 완료**: 결과 요약 + 다음 단계 제안
5. **세션 종료**: 이 HANDOVER.md 업데이트 + commit & push

## 📚 참조 문서

- 설계지침서: 0_이음미디어_설계지침서_v2.html (사용자 보유)
- 매거진 사이트: https://eummagazine.com/
- 카카오 채널: http://pf.kakao.com/_xmVHxen
