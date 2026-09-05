// =============================================================
// 이음미디어 - IndexNow 클라이언트 (Vercel /api/indexnow 호출)
// -------------------------------------------------------------
// 발행/수정 직후 기사 URL을 IndexNow 글로벌 엔드포인트로 알림.
// api.indexnow.org 는 참여 엔진(Bing·Naver·Yandex 등)에 자동 전파.
//
// 반환:
//   { ok: boolean, status?: number, statusText?, engineResponse?, error? }
//   ok:true  → HTTP 200 또는 202 (URL 수신 성공)
//   ok:false → 요청 실패 or 엔드포인트가 다른 상태 코드 반환
// =============================================================

export async function submitIndexNow(urls) {
  const list = Array.isArray(urls) ? urls.filter(Boolean) : [];
  if (list.length === 0) return { ok: false, error: 'urls empty' };

  try {
    const r = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: list }),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return { ok: false, status: r.status, error: text.slice(0, 300) || 'proxy error' };
    }
    return await r.json();
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
