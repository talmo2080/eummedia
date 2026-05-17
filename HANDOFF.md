# 이음미디어 개발 인수인계

> 마지막 작업: 2026-05-08
> 마지막 push: master b55d8f2

## 한 줄 요약

7개 페이지(About/Subscribe/Advertise/CitizenReporter/Report 신규 + ChannelList/ArticleDetail/Login/Signup/AdminDashboard 정리)의 헤더·푸터 통일성을 마무리하고, AdminDashboard의 발행 전 체크리스트를 시니어 친화 풀-에듀케이션 모드로 재설계했습니다.

## 이번 세션의 5개 커밋

```
b55d8f2 feat: AdminDashboard 시니어 친화 리팩토링 (헤더·푸터 정리 + 체크리스트 재설계)
96ce101 refactor: 헤더·푸터 통일성 정리 + dead style 청소 (4개 페이지)
e2de0f2 refactor: Footer 3열 레이아웃 개편
2f53033 feat: 광고·시민기자·제보·구독 페이지 추가 + 라우팅 + mailto 폼 흐름 개선
f92fc92 fix: About/Subscribe 깨진 파일 복구
```

자세한 내용은 `git log -5` 또는 GitHub https://github.com/talmo2080/eummedia/commits/master 참고.

## 현재 페이지 상태

| URL | 컴포넌트 | 상태 |
|---|---|---|
| `/` | Home | OK (변경 없음, 주식위젯 정상) |
| `/about` | About | 신규 — Hero/Mission/4가치/7채널/5원칙/People/CTA |
| `/subscribe` | Subscribe | 신규 — 카카오 채널 추가 + 7채널 미리보기 + 정보통신망법 §22 |
| `/advertise` | Advertise | 신규 — 3단계 광고 패키지 + mailto 폼(3단계 흐름) |
| `/citizen-reporter` | CitizenReporter | 신규 — 시민기자 5단계 로드맵 + mailto 폼 |
| `/report` | Report | 신규 — 6가지 제보 유형 + 익명 제보 + mailto 폼 |
| `/channel/:channelId` | ChannelList | 헤더·푸터 정리 완료 |
| `/article/:id` | ArticleDetail | 헤더·푸터 정리 완료, 옛날 주소 제거됨 |
| `/login` | Login | 헤더·푸터 정리 완료 |
| `/signup` | Signup | 헤더·푸터 정리 완료 |
| `/admin` | AdminDashboard | 헤더·푸터 정리 + 체크리스트 시니어 친화 재설계 |

공통 Header/Footer는 App.jsx에서 전역으로 1번만 렌더링됩니다.

## 발행 전 체크리스트 (AdminDashboard)

3단계 × 5개 = 총 15개 항목, 각 항목마다 부연설명·예시·실시간 미리보기·AI 검토를 표시.

- **STEP 1 (파랑)**: 기사의 얼굴 만들기 — c1~c5 (제목·5W·이미지·본문 500자·맞춤법)
- **STEP 2 (초록)**: AI·검색에 잘 노출되게 — c6~c10 (채널·태그·키워드·메타·alt) [SEO/AI 배지]
- **STEP 3 (빨강)**: 발행 마지막 점검 — c11~c15 (사실·취재원·카톡·인스타·편집국장 승인)

자동 체크: c1, c4, c6, c7, c9 (폼 입력 따라 자동 갱신)
수동 체크: 나머지 10개 (클릭 토글)
진행률: 5점 품질 점수 합산 (75점 만점, 2개 게이지: 전체 완성도 / AI·SEO 최적화)

## 다음 세션 시작할 때 체크할 것

1. **dev 서버**: 백그라운드로 떠 있을 수 있음 (작업 종료 후 종료 안 함). 새로 시작하려면 `npm run dev`.
2. **Git 상태**: `git status` → 깨끗한 상태로 시작. 원격과 동기화됨.
3. **Vite 의존성**: 한번 `npm install` 실행해서 최신화 권장 (오래 안 켜면 lockfile drift 가능).

## 알려진 이슈 / 미완 작업

### 빌드 자체에는 영향 없는 콘솔 경고
- React가 가끔 `borderColor` shorthand vs longhand 충돌 경고를 출력 (Header.jsx 호버 효과). 기능은 정상.

### 다음 단계로 자연스럽게 이어질 작업

1. **이미지 업로드**: AdminDashboard의 `<input type="file">` 영역이 자리표시자 상태. Supabase Storage 또는 워드프레스 미디어 라이브러리 연동 필요.
2. **워드프레스 연동**: 체크리스트의 AI 검토 결과(`🤖`)는 현재 휴리스틱 기반. 향후 Claude API + 워드프레스 REST API로 진짜 AI 분석 가능.
3. **mailto 외 백엔드 폼 처리**: 3개 폼(광고/시민기자/제보)이 mailto 방식. 안정성 위해 Supabase에 저장 → 이메일 전송 백엔드 함수가 더 견고함.
4. **인스타그램·카카오톡 SDK 연동**: c13(카톡 공유), c14(인스타 해시태그)는 현재 자동 텍스트 생성만. 실제 공유 SDK 연동 시 클릭 한번으로 가능.
5. **체크리스트 항목별 부연설명 톤 검증**: 시니어 기자들이 실제로 읽어보고 어색한 부분이 있는지 사용자 테스트.
6. **About 페이지 채널 URL 정리**: 채널 path가 `/channel/politics`, `/channel/economy` 등 영문 slug인데 채널 이름과 의미 불일치. 향후 `/channel/magazine`, `/channel/local` 등으로 정리 권장.
7. **Home 페이지 채널 path 통일**: 현재 한글 slug 사용(`/channel/이음매거진`). ArticleDetail의 RELATED 링크 등도 한글 slug. 위 항목과 함께 통일 필요.

## 7채널 ID 매핑 (참고)

현재 코드베이스에 사용되는 채널 식별자가 일관되지 않음. 향후 통일 시 참고:

| 채널 이름 | Header.jsx (path) | Home.jsx | ChannelList | ArticleDetail |
|---|---|---|---|---|
| 이음매거진 | /channel/politics | /channel/이음매거진 | 이음매거진 (한글) | /이음매거진 |
| 이음로컬 | /channel/economy | (한글) | (한글) | (한글) |
| 이음에듀 | /channel/society | (한글) | (한글) | (한글) |
| 이음피플 | /channel/culture | (한글) | (한글) | (한글) |
| 이음트렌드 | /channel/health | (한글) | (한글) | (한글) |
| 이음보이스 | /channel/life | (한글) | (한글) | (한글) |
| 이음뷰 | /channel/opinion | (한글) | (한글) | (한글) |

## 외부 자원

- GitHub: https://github.com/talmo2080/eummedia
- 도메인: eummedia.kr
- 카카오 채널: http://pf.kakao.com/_xmVHxen
- 이메일: press@eummedia.kr
- 발행인: 성창운 / 편집국장: 정세연 (사용자)
- 등록번호: 서울, 아56526
- 주소: 서울특별시 관악구 남부순환로 1699 2층

## 참고 자료

- 발행 체크리스트 원본 디자인: `C:\Users\OWNER\Desktop\앱개발도구 및 개발목록파일\이음미디어 온라인신문\8.기사발행 체크리스트.html`
- 위 HTML을 참고해 AdminDashboard 체크리스트를 React로 재구현했습니다.
