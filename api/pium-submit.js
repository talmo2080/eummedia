/* global process */
// =============================================================
// 피움 — 앱 등록 신청 처리
// POST /api/pium-submit
// 처리:
//   (1) apps 테이블 INSERT  (service role)
//   (2) public.users.pium_role → 'maker' UPDATE
//   (3) 텔레그램 알림
// =============================================================

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 20 };

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', c => { data += c; });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

const CATEGORY_LABELS = {
  health_beauty: '🏥 건강·뷰티',
  small_biz:     '🏪 소상공인·창업',
  education:     '📚 교육·학습',
  ai_tool:       '🤖 AI 활용',
  productivity:  '🛠️ 업무·생산성',
  lifestyle:     '🌿 생활·편의',
  hobby:         '🎨 취미·창작',
  community:     '🏘️ 지역·커뮤니티',
  media:         '📰 정보·미디어',
  expert_tool:   '💼 전문가 도구',
};

const COMPLETENESS_LABELS = {
  seed:   '🌱 씨앗',
  sprout: '🌿 새싹',
  bloom:  '🌸 활짝',
};

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

  const {
    maker_id, title, tagline, app_url, thumbnail_url,
    is_free, price_model, price,
    description, how_to_use, target_user,
    category, completeness, article_url, slug: clientSlug, nickname,
  } = body;

  // slug: 클라이언트 값 우선, 없으면 서버에서 생성
  function makeSlug(t) {
    const ascii = String(t ?? '').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/\s+/g, '-').slice(0, 24);
    const base  = ascii || 'pium-app';
    const rand  = Math.random().toString(36).slice(2, 6);
    return `${base}-${rand}`;
  }
  const slug = clientSlug || makeSlug(title);

  if (!maker_id || !title || !app_url || !thumbnail_url || !category || !completeness) {
    return res.status(400).json({ ok: false, error: '필수 항목이 누락됐습니다.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tgToken     = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId    = process.env.TELEGRAM_CHAT_ID;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ ok: false, error: 'Supabase 환경변수 누락' });
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // (1) apps INSERT
  const { error: insertError } = await sb.from('apps').insert({
    maker_id,
    title:              title.trim(),
    summary:            tagline?.trim() || '',
    app_url:            app_url.trim(),
    thumbnail_url,
    price_model:        price_model ?? (is_free === 'true' ? 'free' : 'paid'),
    price:              typeof price === 'number' ? price : (parseInt(price, 10) || 0),
    features:           description?.trim() || '',
    how_to_use:         how_to_use?.trim() || '',
    target_users:       target_user?.trim() || null,
    category,
    completeness,
    story_article_url:  article_url?.trim() || null,
    slug,
    status:             'submitted',
  });

  if (insertError) {
    console.error('[pium-submit] insert error:', insertError.message);
    return res.status(500).json({ ok: false, error: insertError.message });
  }

  // (2) pium_role → maker
  await sb.from('users').update({ pium_role: 'maker' }).eq('id', maker_id);

  // (3) 텔레그램
  if (tgToken && tgChatId) {
    const text =
      '🌱 <b>새 앱 등록 신청!</b>\n' +
      `앱이름: ${escHtml(title)}\n` +
      `메이커: ${escHtml(nickname ?? '알 수 없음')}\n` +
      `카테고리: ${escHtml(CATEGORY_LABELS[category] ?? category)}\n` +
      `완성도: ${escHtml(COMPLETENESS_LABELS[completeness] ?? completeness)}\n` +
      `앱링크: ${escHtml(app_url)}\n` +
      '👉 검수 후 승인해주세요';
    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    }).catch(err => console.warn('[pium-submit] telegram error:', err?.message));
  }

  return res.status(200).json({ ok: true });
}
