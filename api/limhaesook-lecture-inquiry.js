/* global process */
// =============================================================
// 임해숙 강의 문의 — 텔레그램 알림 + lecture_inquiries 저장
// POST /api/limhaesook-lecture-inquiry
// 알림 수신: 임해숙님 개인 chat_id (TELEGRAM_LHS_CHAT_ID)
//           env 누락 시 TELEGRAM_CHAT_ID(세연님)로 폴백
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

  const name    = String(body.name    || '').trim();
  const phone   = String(body.phone   || '').trim();
  const message = String(body.message || '').trim();
  // 기관·단체 / 희망 주제 — lecture_inquiries.org · topics (둘 다 text 열) 에 저장하고 알림에도 담는다
  const org      = String(body.org   || '').trim().slice(0, 80);
  const topicRaw = String(body.topic || '').trim().slice(0, 60);
  const topic    = topicRaw || '선택 안 함';

  if (!name || !phone || !message) {
    return res.status(400).json({ ok: false, error: '이름, 연락처, 문의 내용을 모두 입력해 주세요.' });
  }

  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tgToken        = process.env.TELEGRAM_BOT_TOKEN;
  // 임해숙님 개인 chat_id 우선, 없으면 세연님(안전장치)
  const tgChatId = (process.env.TELEGRAM_LHS_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '')
    .replace(/^﻿/, '').trim();

  // (1) Supabase insert
  let insertOk = false;
  let insertError = null;
  if (!supabaseUrl || !serviceRoleKey) {
    insertError = 'Supabase env missing';
    console.warn('[limhaesook-lecture-inquiry]', insertError);
  } else {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase.from('lecture_inquiries').insert({
        speaker:      '임해숙',
        name,
        phone,
        email:        '',
        org,                       // text · NOT NULL — 비어 있으면 '' 로 저장
        lecture_type: '강의·상담 문의',
        topics:       topicRaw || null,   // text · NULL 허용 — 선택하지 않으면 null
        datetime:     '',
        headcount:    0,
        duration:     0,
        location:     '',
        note:         message,
      });
      if (error) {
        insertError = error.message || String(error);
        console.error('[limhaesook-lecture-inquiry] supabase error:', insertError);
      } else {
        insertOk = true;
      }
    } catch (err) {
      insertError = err?.message || String(err);
      console.error('[limhaesook-lecture-inquiry] exception:', insertError);
    }
  }

  // (2) 텔레그램 알림 → 임해숙님 개인
  let telegramOk = false;
  let telegramError = null;
  if (tgToken && tgChatId) {
    const text =
      '🌿 <b>임해숙님, 문의가 도착했습니다!</b>\n' +
      '────────────\n' +
      `👤 이름: ${escHtml(name)}\n` +
      `📞 연락처: ${escHtml(phone)}\n` +
      `🏢 기관·단체: ${escHtml(org || '입력 안 함')}\n` +
      `🗂 희망 주제: ${escHtml(topic)}\n` +
      `📝 문의 내용:\n${escHtml(message)}\n` +
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
        console.error('[limhaesook-lecture-inquiry] telegram error:', telegramError);
      }
    } catch (err) {
      telegramError = err?.message || String(err);
      console.error('[limhaesook-lecture-inquiry] telegram exception:', telegramError);
    }
  } else {
    telegramError = 'TELEGRAM env missing';
    console.warn('[limhaesook-lecture-inquiry] telegram env missing');
  }

  if (insertOk) return res.status(200).json({ ok: true, insertOk, telegramOk });
  if (telegramOk) return res.status(200).json({ ok: true, insertOk: false, telegramOk: true, insertError });
  return res.status(500).json({ ok: false, insertError, telegramError });
}
