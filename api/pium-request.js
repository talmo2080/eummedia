/* global process */
// =============================================================
// 피움앱 - 제작 문의 저장 + 텔레그램 알림
// -------------------------------------------------------------
// 경로:    POST /api/pium-request
// 입력:    { name, contact, description }
// 처리:
//   (1) Supabase service role 로 app_requests insert
//   (2) 텔레그램 sendMessage 로 즉시 알림
// 환경변수 (Vercel + 로컬 .env 양쪽 등록):
//   SUPABASE_URL (또는 VITE_SUPABASE_URL fallback)
//   SUPABASE_SERVICE_ROLE_KEY
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
// =============================================================

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 15 };

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function nowKst() {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
}

async function readJsonBody(req) {
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
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = await readJsonBody(req);
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const name        = String(body.name        || '').trim();
  const contact     = String(body.contact     || '').trim();
  const description = String(body.description || '').trim();

  if (!name || !contact || !description) {
    return res.status(400).json({ ok: false, error: '이름, 연락처, 내용을 모두 입력해 주세요.' });
  }

  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tgToken        = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId       = process.env.TELEGRAM_CHAT_ID;

  // (1) Supabase insert
  let insertOk = false;
  let insertError = null;
  if (!supabaseUrl || !serviceRoleKey) {
    insertError = `Supabase env missing (url:${!!supabaseUrl}, serviceKey:${!!serviceRoleKey})`;
    console.warn('[pium-request]', insertError);
  } else {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase.from('app_requests').insert({ name, contact, description });
      if (error) {
        insertError = error.message || String(error);
        console.error('[pium-request] supabase insert error:', insertError);
      } else {
        insertOk = true;
      }
    } catch (err) {
      insertError = err?.message || String(err);
      console.error('[pium-request] supabase exception:', insertError);
    }
  }

  // (2) 텔레그램 sendMessage
  let telegramOk = false;
  let telegramError = null;
  if (tgToken && tgChatId) {
    const text =
      '🌱 <b>피움앱 제작 문의 도착!</b>\n' +
      '────────────\n' +
      `👤 이름: ${escHtml(name)}\n` +
      `📞 연락처: ${escHtml(contact)}\n` +
      `📝 내용:\n${escHtml(description)}\n` +
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
        console.error('[pium-request] telegram error:', telegramError);
      }
    } catch (err) {
      telegramError = err?.message || String(err);
      console.error('[pium-request] telegram exception:', telegramError);
    }
  } else {
    telegramError = 'TELEGRAM 환경변수 미설정';
    console.warn('[pium-request] telegram env missing');
  }

  if (insertOk) {
    return res.status(200).json({ ok: true, insertOk, telegramOk, telegramError });
  }
  if (telegramOk) {
    return res.status(200).json({ ok: true, insertOk: false, telegramOk: true, insertError });
  }
  return res.status(500).json({ ok: false, insertError, telegramError });
}
