/* global process */
// =============================================================
// 이음미디어 - 최근 발행 기사 라이브 검증 (Vercel Cron 10분마다)
// GET /api/publish-check  (Vercel Cron이 GET으로 호출)
//
// 로직:
//   1) Cron 인증 (Authorization: Bearer <CRON_SECRET>)
//   2) 최근 1시간 이내 published + deploy_alert_sent=false 기사 조회
//   3) 각 기사의 라이브 URL을 fetch → 200이 아니면 텔레그램 알림
//   4) 알림 보낸 기사는 deploy_alert_sent=true 로 업데이트 (중복 알림 방지)
//
// 배경(2026-08-09): 한기식대표 국토종주 기사가 발행 후 404 상태였는데
// 발행 버튼은 성공(200) 반환 → 세연 인지 지연. 재발 방지 자동 감시.
// =============================================================

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

const SITE_URL = 'https://www.eummedia.kr';
const RECENT_WINDOW_MS = 60 * 60 * 1000;   // 1시간
const FETCH_TIMEOUT_MS = 8000;

function todayKst() {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

async function sendTelegram(tgToken, tgChatId, text) {
  const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: tgChatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok && body.ok, status: r.status, body };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // (1) Cron 인증
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[publish-check] CRON_SECRET env 없음');
    return res.status(500).json({ ok: false, error: 'CRON_SECRET not configured' });
  }
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  // env 준비
  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tgToken        = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId       = process.env.TELEGRAM_CHAT_ID;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ ok: false, error: 'Supabase env missing' });
  }
  if (!tgToken || !tgChatId) {
    return res.status(500).json({ ok: false, error: 'Telegram env missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // (2) 최근 1시간 이내 published + 알림 미발송 기사 조회
  const cutoff = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
  const { data: candidates, error: qErr } = await supabase
    .from('articles')
    .select('id, slug, title, published_at')
    .eq('status', 'published')
    .eq('deploy_alert_sent', false)
    .gte('published_at', cutoff)
    .order('published_at', { ascending: true });

  if (qErr) {
    console.error('[publish-check] query error:', qErr);
    return res.status(500).json({ ok: false, error: qErr.message });
  }

  if (!candidates || candidates.length === 0) {
    return res.status(200).json({ ok: true, checked: 0, alerted: 0, note: '최근 1시간 이내 검증 대상 없음' });
  }

  // (3) 각 slug 라이브 상태 확인 + 404면 알림
  const results = [];
  for (const a of candidates) {
    const liveUrl = `${SITE_URL}/article/${encodeURIComponent(a.slug)}`;
    let status = 0;
    let liveError = null;
    try {
      const r = await fetch(liveUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      status = r.status;
    } catch (err) {
      liveError = err?.message || String(err);
    }

    if (status === 200) {
      results.push({ slug: a.slug, status, alerted: false });
      continue;
    }

    // (4) 텔레그램 알림 + 플래그 업데이트
    const text =
      `⚠️ 기사 배포 확인 필요\n` +
      `\n` +
      `제목: ${a.title}\n` +
      `slug: ${a.slug}\n` +
      `발행: ${a.published_at}\n` +
      `상태: HTTP ${status || 'ERR'}${liveError ? ` (${liveError})` : ''}\n` +
      `URL: ${liveUrl}\n` +
      `\n` +
      `이 기사가 발행 후 정상 노출되지 않고 있어요.\n` +
      `관리자 페이지에서 이 기사를 열고 '발행본으로 저장'을 한 번 더 눌러주세요.\n` +
      `\n` +
      `⏰ ${todayKst()} KST`;

    const tg = await sendTelegram(tgToken, tgChatId, text);
    if (tg.ok) {
      // 알림 성공 시에만 플래그 세팅 (텔레그램 실패면 다음 사이클 재시도)
      const { error: uErr } = await supabase
        .from('articles')
        .update({ deploy_alert_sent: true })
        .eq('id', a.id);
      if (uErr) console.error('[publish-check] flag update error:', a.slug, uErr);
      results.push({ slug: a.slug, status, alerted: true });
    } else {
      console.error('[publish-check] telegram fail:', a.slug, tg.status, JSON.stringify(tg.body).slice(0, 200));
      results.push({ slug: a.slug, status, alerted: false, tgError: tg.status });
    }
  }

  const alertedCount = results.filter(r => r.alerted).length;
  return res.status(200).json({
    ok: true,
    checked: results.length,
    alerted: alertedCount,
    results,
  });
}
