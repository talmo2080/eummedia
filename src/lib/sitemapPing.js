// =============================================================
// 이음미디어 - sitemap ping (구글 · 네이버)
// -------------------------------------------------------------
// 기사 발행/수정 직후 두 검색엔진에 sitemap 갱신 신호 전송.
//
// 한계 (라이브 동작 전 알림):
//  - 구글: 2023-06-26부터 /ping endpoint deprecated. 응답은 200이나 색인 효과 사실상 0.
//  - 네이버: 비공식 endpoint (서치어드바이저 공식 문서엔 없음). 효과 보장 X.
//  - CORS: 두 endpoint 모두 Access-Control-Allow-Origin 헤더 미제공.
//    → mode:'no-cors'로 요청은 전송되지만 응답 검증 불가 (opaque response).
//
// 사용 패턴 (fire-and-forget):
//   pingSitemap()   // await 없이 호출, 본 작업(발행) 동선 안 막음
// =============================================================

const SITEMAP_URL = 'https://www.eummedia.kr/sitemap.xml';

export function pingSitemap() {
  const encoded = encodeURIComponent(SITEMAP_URL);
  const targets = [
    { name: 'google', url: `https://www.google.com/ping?sitemap=${encoded}` },
    { name: 'naver',  url: `https://searchadvisor.naver.com/ping?sitemap=${encoded}` },
  ];
  // Promise.allSettled — 한쪽 실패해도 다른쪽 시도. 응답 못 읽어도 요청은 전송됨.
  return Promise.allSettled(
    targets.map(t =>
      fetch(t.url, { method: 'GET', mode: 'no-cors' })
        .catch(err => {
          console.warn(`[sitemap-ping] ${t.name} fail:`, err?.message || err);
        })
    )
  );
}
