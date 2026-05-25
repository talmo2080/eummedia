// 발행사 중앙 상수 — 매체 메타정보 단일 출처
//
// 사용 (예정):
//   import { SITE_INFO } from '../lib/siteInfo'
//   <span>발행인: {SITE_INFO.publisher}</span>
//
// 이번 commit엔 import 없음. 후속 작업에서 Footer/About/YouthPolicy 등
// 하드코딩된 발행인·등록번호·이메일을 이 상수로 교체할 예정.
// JSON-LD Schema는 index.html에 정적으로 박혀 있으므로 이 상수와 별개 (수동 동기 필요).

export const SITE_INFO = {
  name: '이음미디어',
  url: 'https://eummedia.kr',
  logo: 'https://eummedia.kr/og-image.png',
  publisher: '성창운',
  editor: '정세연',
  regNumber: '서울 아56526',
  email: 'press@eummedia.kr',
  description: '시니어와 소상공인, 이웃의 이야기를 조명하는 인터넷신문',
};
