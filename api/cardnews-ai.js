/* global process */
// Vercel 서버리스 함수 — Anthropic API 프록시 (카드뉴스 5장 자동 생성)
// 환경변수: ANTHROPIC_API_KEY (Vercel 대시보드 + 로컬 .env)
// 클라이언트 노출 차단 — VITE_ prefix 없이 서버에서만 사용

export const config = { maxDuration: 60 };  // Pro plan: 60s, Hobby plan: 10s 무시됨

export default async function handler(req, res) {
  console.log('[cardnews-ai] handler 진입, method=', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, title } = req.body || {};
  console.log('[cardnews-ai] body 수신, content len=', content?.length || 0, 'title=', title?.slice(0, 40));

  if (!content) {
    return res.status(400).json({ error: '기사 내용이 없습니다' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('[cardnews-ai] API 키 상태: 존재=', !!apiKey, 'len=', apiKey?.length || 0);

  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY 환경변수 미설정');
    return res.status(500).json({ error: 'API 키 설정 누락 (서버)' });
  }

  try {
    console.log('[cardnews-ai] Anthropic API 호출 시작...');
    const t0 = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `다음 기사를 카드뉴스 5장으로 요약해줘.

기사 제목: ${title || '(제목 없음)'}
기사 내용: ${content}

5장 구조:
- 1장(표지): 카드뉴스 전체 핵심 제목 (15자 이내)
- 2장(핵심1): 주요 내용 첫 번째 (제목 10자 + 내용 40자 이내)
- 3장(핵심2): 주요 내용 두 번째 (제목 10자 + 내용 40자 이내)
- 4장(핵심3): 주요 내용 세 번째 (제목 10자 + 내용 40자 이내)
- 5장(마무리): 핵심 메시지 또는 행동 촉구 (30자 이내)

시니어 독자가 쉽게 이해할 수 있게 쉬운 말로.

반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이):
[
  {"order":1,"type":"cover","title":"표지 제목","text":""},
  {"order":2,"type":"main","title":"핵심1 제목","text":"핵심1 내용"},
  {"order":3,"type":"main","title":"핵심2 제목","text":"핵심2 내용"},
  {"order":4,"type":"main","title":"핵심3 제목","text":"핵심3 내용"},
  {"order":5,"type":"ending","title":"","text":"마무리 메시지"}
]`,
          },
        ],
      }),
    });

    const dt = Date.now() - t0;
    console.log('[cardnews-ai] Anthropic 응답 도착:', response.status, `${dt}ms`);

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API 오류:', response.status, errBody);
      return res.status(502).json({
        error: `Anthropic API 오류 (${response.status})`,
        detail: errBody.slice(0, 1000),
      });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;
    console.log('[cardnews-ai] 응답 파싱 OK, text len=', text?.length || 0);
    if (!text) {
      return res.status(502).json({
        error: 'AI 응답 형식 오류',
        detail: JSON.stringify(data).slice(0, 500),
      });
    }

    // JSON 파싱 (마크다운 펜스 제거 + 앞뒤 공백)
    const clean = text.replace(/```json|```/g, '').trim();
    let slides;
    try {
      slides = JSON.parse(clean);
    } catch {
      console.error('JSON 파싱 실패:', clean);
      return res.status(502).json({ error: 'AI 응답 JSON 파싱 실패' });
    }

    if (!Array.isArray(slides) || slides.length !== 5) {
      return res.status(502).json({ error: 'AI 응답 형식 불일치 (5장 아님)' });
    }

    return res.status(200).json({ slides });
  } catch (error) {
    console.error('AI 생성 오류:', error);
    return res.status(500).json({ error: 'AI 요약 생성 실패' });
  }
}
