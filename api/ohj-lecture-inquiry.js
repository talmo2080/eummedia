/* global process */
// =============================================================
// 오행자 교수 강의 문의 — 텔레그램 알림 + lecture_inquiries 저장
// POST /api/ohj-lecture-inquiry
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
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
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
  const org         = String(body.org         || '').trim();
  const phone       = String(body.phone       || '').trim();
  const email       = String(body.email       || '').trim();
  const lectureType = String(body.lectureType || '').trim();
  const topics      = Array.isArray(body.topics) ? body.topics.join(', ') : String(body.topics || '');
  const datetime    = String(body.datetime    || '').trim();
  const headcount   = String(body.headcount   || '').trim();
  const duration    = String(body.duration    || '').trim();
  const location    = String(body.location    || '').trim();
  const note        = String(body.note        || '').trim();

  const missing = [];
  if (!name) missing.push('name');
  if (!org)  missing.push('org');
  if (!phone) missing.push('phone');
  if (!lectureType) missing.push('lectureType');
  if (missing.length) {
    return res.status(400).json({ ok: false, error: 'Missing required fields', missing });
  }

  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tgToken        = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId       = process.env.TELEGRAM_CHAT_ID;

  // (1) Supabase insert
  let insertOk = false;
  let insertError = null;
  if (!supabaseUrl || !serviceRoleKey) {
    insertError = 'Supabase env missing';
    console.warn('[ohj-lecture-inquiry]', insertError);
  } else {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase.from('lecture_inquiries').insert({
        speaker: '오행자',
        name, org, phone,
        email: email || null,
        lecture_type: lectureType,
        topics: topics || null,
        datetime: datetime || null,
        headcount: headcount || null,
        duration: duration || null,
        location: location || null,
        note: note || null,
      });
      if (error) {
        insertError = error.message || String(error);
        console.error('[ohj-lecture-inquiry] supabase error:', insertError);
      } else {
        insertOk = true;
      }
    } catch (err) {
      insertError = err?.message || String(err);
      console.error('[ohj-lecture-inquiry] exception:', insertError);
    }
  }

  // (2) 텔레그램 알림
  let telegramOk = false;
  let telegramError = null;
  if (tgToken && tgChatId) {
    const text =
      '😄 <b>오행자 교수 강의 문의!</b>\n' +
      '────────────\n' +
      `👤 신청자: ${escHtml(name)}\n` +
      `🏢 소속: ${escHtml(org)}\n` +
      `📞 연락처: ${escHtml(phone)}\n` +
      `✉️ 이메일: ${escHtml(email || '(미입력)')}\n` +
      `📋 강의 유형: ${escHtml(lectureType)}\n` +
      `🎯 희망 주제: ${escHtml(topics || '(미선택)')}\n` +
      `📅 희망 일시: ${escHtml(datetime || '(미입력)')}\n` +
      `👥 예상 인원: ${escHtml(headcount || '(미입력)')}\n` +
      `⏱ 강의 시간: ${escHtml(duration || '(미입력)')}\n` +
      `📍 장소: ${escHtml(location || '(미입력)')}\n` +
      `📝 추가 요청: ${escHtml(note || '(없음)')}\n` +
      '────────────\n' +
      `⏰ ${escHtml(nowKst())} KST`;
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId, text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      if (tgRes.ok) {
        telegramOk = true;
      } else {
        const txt = await tgRes.text().catch(() => '');
        telegramError = `HTTP ${tgRes.status} ${txt.slice(0, 200)}`;
        console.error('[ohj-lecture-inquiry] telegram error:', telegramError);
      }
    } catch (err) {
      telegramError = err?.message || String(err);
      console.error('[ohj-lecture-inquiry] telegram exception:', telegramError);
    }
  } else {
    telegramError = 'TELEGRAM env missing';
    console.warn('[ohj-lecture-inquiry] telegram env missing');
  }

  if (insertOk) return res.status(200).json({ ok: true, insertOk, telegramOk });
  if (telegramOk) return res.status(200).json({ ok: true, insertOk: false, telegramOk: true, insertError });
  return res.status(500).json({ ok: false, insertError, telegramError });
}
