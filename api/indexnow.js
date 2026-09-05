// =============================================================
// 이음미디어 - IndexNow API 프록시 (Vercel Serverless)
// -------------------------------------------------------------
// 경로:    POST /api/indexnow
// 입력:    { urls: string[] }  (기사 절대 URL, 최대 10000)
// 출력:    { ok: boolean, status: number, statusText, engineResponse }
// 처리:
//   IndexNow 글로벌 엔드포인트(api.indexnow.org)로 forward.
//   글로벌 엔드포인트는 참여 엔진(Bing·Naver·Yandex·Seznam 등)에
//   자동으로 전파. 네이버가 자체 색인·서치어드바이저에 반영.
//
// CORS 문제:
//   IndexNow는 Access-Control-Allow-Origin을 주지 않아 브라우저 fetch로는
//   응답을 읽을 수 없음(opaque). 서버리스에서 대신 호출해 실제 응답 코드를
//   확인·전달하기 위한 프록시.
//
// 응답 코드 의미 (IndexNow 명세):
//   200  OK — URL 수신 완료
//   202  Accepted — 수신, 키 검증 대기
//   400  Bad Request
//   403  Forbidden — 키 검증 실패 (파일 못 찾거나 내용 불일치)
//   422  Unprocessable — URL 호스트 불일치·키 스키마 오류
//   429  Too Many Requests
//
// 키 파일:
//   https://www.eummedia.kr/{KEY}.txt — public/ 에 배치되어 있어야 함
//   파일 내용은 KEY 문자열 그대로.
// =============================================================

export const config = { maxDuration: 10 };

const KEY = 'dfeaa3c5da6fcc915277f769de0a26ec';
const HOST = 'www.eummedia.kr';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_URL = 'https://api.indexnow.org/indexnow';

function badReq(res, msg) { return res.status(400).json({ ok: false, error: msg }); }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const urls = Array.isArray(body.urls) ? body.urls : [];
  if (urls.length === 0) return badReq(res, 'urls (array of absolute URLs) required');
  if (urls.length > 10000) return badReq(res, 'max 10000 urls per request');

  // 모든 URL은 지정된 host에 속해야 함 (IndexNow 422 방지)
  const invalid = urls.filter(u => {
    try {
      const parsed = new URL(u);
      return parsed.host !== HOST;
    } catch {
      return true;
    }
  });
  if (invalid.length > 0) {
    return badReq(res, `invalid URLs (host must be ${HOST}): ${invalid.slice(0, 3).join(', ')}`);
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  try {
    const r = await fetch(INDEXNOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'User-Agent': 'eummedia-indexnow/1.0',
      },
      body: JSON.stringify(payload),
    });
    const text = await r.text().catch(() => '');
    return res.status(200).json({
      ok: r.status === 200 || r.status === 202,
      status: r.status,
      statusText: r.statusText,
      engineResponse: text.slice(0, 500),
      submittedCount: urls.length,
      keyLocation: KEY_LOCATION,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e?.message || String(e),
    });
  }
}
