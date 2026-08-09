/* global process */
// =============================================================
// 이음미디어 아침 점검 — 매일 KST 08:00 (Vercel Cron 발동)
// GET /api/daily-health-check  (Vercel Cron이 GET으로 호출)
//
// 로직:
//   1) Vercel Cron이 보낸 Authorization: Bearer <CRON_SECRET> 검증
//   2) https://www.eummedia.kr 홈 응답(200) 확인
//   3) 텔레그램 봇으로 세연(TELEGRAM_CHAT_ID)에게 요약 메시지 전송
//
// 재사용: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID (기존 문의 알림과 동일)
// 신규:   CRON_SECRET (Vercel 대시보드에 별도 등록 필요)
// =============================================================

export const config = { maxDuration: 15 };

function todayKst() {
  return new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // (1) Vercel Cron 인증 — 외부 무단 호출 차단
  //     Vercel Cron은 요청 시 Authorization: Bearer <CRON_SECRET> 헤더를 자동으로 붙임.
  //     로컬 테스트 시엔 이 함수를 직접 import해서 호출하거나, 헤더에 같은 값 넣어 호출.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[daily-health-check] CRON_SECRET env 없음 — 함수 실행 중단');
    return res.status(500).json({ ok: false, error: 'CRON_SECRET not configured' });
  }
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  // (2) 홈페이지 상태 확인
  let siteStatus = '⚠️ 확인 필요';
  let siteDetail = '';
  const t0 = Date.now();
  try {
    const r = await fetch('https://www.eummedia.kr', {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    const elapsed = Date.now() - t0;
    if (r.ok) {
      siteStatus = '✅ 정상';
      siteDetail = `HTTP ${r.status} · ${elapsed}ms`;
    } else {
      siteStatus = '⚠️ 확인 필요';
      siteDetail = `HTTP ${r.status} · ${elapsed}ms`;
    }
  } catch (err) {
    siteStatus = '⚠️ 확인 필요';
    siteDetail = `요청 실패 · ${err?.message || err}`;
  }

  // (3) 메시지 작성 — 순수 텍스트 + 이모지 (마크다운 특수문자 안 씀)
  const text =
    `📅 ${todayKst()}\n` +
    `\n` +
    `이음미디어 아침 점검\n` +
    `────────────\n` +
    `홈페이지 ${siteStatus}\n` +
    `${siteDetail}\n` +
    `\n` +
    `📊 사용량 직접 확인\n` +
    `Anthropic: https://console.anthropic.com/settings/billing\n` +
    `Supabase: https://supabase.com/dashboard/project/avbsniuthpcejjcdeiyw/settings/billing\n` +
    `Vercel: https://vercel.com/dashboard`;

  // (4) 텔레그램 전송
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (!tgToken || !tgChatId) {
    console.error('[daily-health-check] TELEGRAM env 누락');
    return res.status(500).json({ ok: false, error: 'TELEGRAM env missing', siteStatus, siteDetail });
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgChatId,
        text,
        // parse_mode 지정 안 함 → 순수 텍스트로 전송 (세연 지시)
        disable_web_page_preview: true,
      }),
    });
    if (!tgRes.ok) {
      const errTxt = await tgRes.text().catch(() => '');
      console.error('[daily-health-check] telegram error:', tgRes.status, errTxt.slice(0, 200));
      return res.status(500).json({ ok: false, telegramError: `HTTP ${tgRes.status}`, siteStatus, siteDetail });
    }
    return res.status(200).json({ ok: true, siteStatus, siteDetail, telegramOk: true });
  } catch (err) {
    console.error('[daily-health-check] telegram exception:', err?.message || err);
    return res.status(500).json({ ok: false, telegramError: err?.message || String(err), siteStatus, siteDetail });
  }
}
