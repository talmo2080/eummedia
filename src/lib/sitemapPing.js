// =============================================================
// 이음미디어 - sitemap ping (네이버)
// -------------------------------------------------------------
// 기사 발행/수정 직후 네이버 서치어드바이저에 sitemap 갱신 신호 전송.
//
// 실측 (2026-09-03):
//  - 구글 /ping: HTTP 404 + "Sitemaps ping is deprecated" (2023-06-26 폐기)
//    → 코드에서 제거. 대신 세연이 서치콘솔에서 수동 URL 색인 요청 필요.
//  - 네이버 /ping: 현재 HTTP 404 응답이나, 사이트별 결과가 달라
//    지시서에 따라 fire-and-forget으로 유지 (부담 없고 이력 남길 수 있음).
//    ※ 확정 노출은 네이버 서치어드바이저 대시보드에서 수동 요청 권장.
//  - CORS: no-cors 요청이라 응답 상태 확인 불가 (opaque response).
//
// 사용 패턴 (fire-and-forget):
//   pingSitemap()   // await 없이 호출, 본 작업(발행) 동선 안 막음
// =============================================================

const SITEMAP_URL = 'https://www.eummedia.kr/sitemap.xml';

export function pingSitemap() {
  const encoded = encodeURIComponent(SITEMAP_URL);
  const targets = [
    { name: 'naver', url: `https://searchadvisor.naver.com/ping?sitemap=${encoded}` },
  ];
  return Promise.allSettled(
    targets.map(t =>
      fetch(t.url, { method: 'GET', mode: 'no-cors' })
        .catch(err => {
          console.warn(`[sitemap-ping] ${t.name} fail:`, err?.message || err);
        })
    )
  );
}
