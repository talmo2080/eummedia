/* global process */
// =============================================================
// 이음미디어 - 맞춤법 검사 프록시 (Vercel 서버리스)
// -------------------------------------------------------------
// 경로:    POST /api/spellcheck-ai
// 입력:    { content: "검사할 본문" }
// 응답:    { text: "이상 없음" 또는 "1. ... 2. ..." 수정 제안 }
//
// 환경변수 (둘 중 하나 등록 — 우선순위: SPELLCHECK 키 > API 키):
//   ANTHROPIC_SPELLCHECK_KEY   — 분리 운용 (권장)
//   ANTHROPIC_API_KEY          — 카드뉴스와 공용 키 fallback
//
// 보안:    클라이언트에 API 키 노출 X (process.env로만 접근)
//          기존 VITE_ANTHROPIC_API_KEY (클라 직접 호출) 패턴 폐기
// =============================================================

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body || {};
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: '본문이 없습니다' });
  }

  // 키 우선순위: 전용 키 > 공용 키
  const apiKey = process.env.ANTHROPIC_SPELLCHECK_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[spellcheck-ai] env 미설정: ANTHROPIC_SPELLCHECK_KEY / ANTHROPIC_API_KEY 둘 다 없음');
    return res.status(500).json({ error: 'API 키 설정 누락 (서버)' });
  }

  // Anthropic 호출 — 15초 timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const t0 = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `다음 글의 맞춤법과 오탈자를 검사해주세요.
오류가 없으면 "이상 없음"만,
오류가 있으면 번호 목록으로 수정 제안 3건 이내만 출력하세요.

글: ${String(content).slice(0, 800)}`,
        }],
      }),
      signal: controller.signal,
    });

    const dt = Date.now() - t0;
    console.log('[spellcheck-ai] Anthropic 응답:', response.status, `${dt}ms`);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('[spellcheck-ai] Anthropic 오류:', response.status, errBody.slice(0, 200));
      return res.status(502).json({
        error: `Anthropic API 오류 (${response.status})`,
        detail: errBody.slice(0, 400),
      });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || '';
    if (!text) {
      return res.status(502).json({ error: '응답 형식 오류 (빈 text)' });
    }
    return res.status(200).json({ text });
  } catch (err) {
    if (err?.name === 'AbortError') {
      console.warn('[spellcheck-ai] 15초 timeout');
      return res.status(504).json({ error: '맞춤법 검사 시간 초과 (15초)' });
    }
    console.error('[spellcheck-ai] catch:', err?.name, err?.message);
    return res.status(500).json({ error: err?.message || '맞춤법 검사 실패' });
  } finally {
    clearTimeout(timer);
  }
}
