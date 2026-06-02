/* global process */
// =============================================================
// 이음미디어 - 광고문의 텔레그램 알림 + ad_inquiries 저장
// -------------------------------------------------------------
// 경로:    POST /api/ad-inquiry
// 입력:    { company, name, phone, email, package?, message? }
// 처리:
//   (1) Supabase service role 로 ad_inquiries insert (RLS 우회)
//   (2) 텔레그램 sendMessage 로 편집장 폰에 즉시 알림
//   - 텔레그램 실패해도 insert 성공이면 200 (알림은 부가)
//   - 둘 다 실패면 500
// 환경변수 (Vercel + 로컬 .env 양쪽 등록):
//   SUPABASE_URL (또는 VITE_SUPABASE_URL fallback)
//   SUPABASE_SERVICE_ROLE_KEY
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
// =============================================================

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 15 };

// 텔레그램 HTML 모드 이스케이프 (< > & 만 처리)
function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// KST 시각 표기
function nowKst() {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
}

async function readJsonBody(req) {
  // Vercel은 보통 req.body를 이미 파싱하지만, 안전하게 둘 다 처리
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve(null); }
    });
    req.on('error', () => resolve(null));
  });
}

export default async function handler(req, res) {
  // CORS / 메서드 가드
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = await readJsonBody(req);
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const company = String(body.company || '').trim();
  const name    = String(body.name    || '').trim();
  const phone   = String(body.phone   || '').trim();
  const email   = String(body.email   || '').trim();
  const pkg     = String(body.package || '').trim();
  const message = String(body.message || '').trim();

  // 필수값 검증
  const missing = [];
  if (!company) missing.push('company');
  if (!name)    missing.push('name');
  if (!phone)   missing.push('phone');
  if (!email)   missing.push('email');
  if (missing.length) {
    return res.status(400).json({ ok: false, error: 'Missing required fields', missing });
  }

  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tgToken        = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId       = process.env.TELEGRAM_CHAT_ID;

  // (1) Supabase insert — env 누락은 insertError로 기록하고 텔레그램 단계로 진입
  let insertOk = false;
  let insertError = null;
  if (!supabaseUrl || !serviceRoleKey) {
    insertError = `Supabase env missing (url:${!!supabaseUrl}, serviceKey:${!!serviceRoleKey})`;
    console.warn('[ad-inquiry]', insertError);
  } else {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase.from('ad_inquiries').insert({
        company, name, phone, email,
        package: pkg || null,
        message: message || null,
      });
      if (error) {
        insertError = error.message || String(error);
        console.error('[ad-inquiry] supabase insert error:', insertError);
      } else {
        insertOk = true;
      }
    } catch (err) {
      insertError = err?.message || String(err);
      console.error('[ad-inquiry] supabase exception:', insertError);
    }
  }

  // (2) 텔레그램 sendMessage
  let telegramOk = false;
  let telegramError = null;
  if (tgToken && tgChatId) {
    const text =
      '📢 <b>새 광고문의 도착!</b>\n' +
      '────────────\n' +
      `🏢 업체: ${escHtml(company)}\n` +
      `👤 담당: ${escHtml(name)}\n` +
      `📞 연락처: ${escHtml(phone)}\n` +
      `✉️ 이메일: ${escHtml(email)}\n` +
      `📦 상품: ${escHtml(pkg || '(미선택)')}\n` +
      `📝 내용: ${escHtml(message || '(없음)')}\n` +
      '────────────\n' +
      `⏰ ${escHtml(nowKst())} KST`;
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      if (tgRes.ok) {
        telegramOk = true;
      } else {
        const txt = await tgRes.text().catch(() => '');
        telegramError = `HTTP ${tgRes.status} ${txt.slice(0, 200)}`;
        console.error('[ad-inquiry] telegram error:', telegramError);
      }
    } catch (err) {
      telegramError = err?.message || String(err);
      console.error('[ad-inquiry] telegram exception:', telegramError);
    }
  } else {
    telegramError = 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미설정';
    console.warn('[ad-inquiry] telegram env missing — skipping notification');
  }

  // 응답
  if (insertOk) {
    // insert 성공 → 200 (텔레그램은 부가)
    return res.status(200).json({ ok: true, insertOk, telegramOk, telegramError });
  }
  if (telegramOk) {
    // insert는 실패했지만 알림은 갔음 → 207-style 부분 성공도 200으로
    return res.status(200).json({ ok: true, insertOk: false, telegramOk: true, insertError });
  }
  // 둘 다 실패
  return res.status(500).json({ ok: false, insertError, telegramError });
}
