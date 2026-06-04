/* global process */
// =============================================================
// 이음미디어 - 발행 시 자동 재배포 트리거 (Vercel Deploy Hook)
// -------------------------------------------------------------
// 경로:    POST /api/trigger-deploy
// 인증:    Authorization: Bearer <Supabase access token>
//          → service role로 token → user → users.role 검증
//          → role in ('admin','publisher') + is_active 만 통과
// 처리:    process.env.VERCEL_DEPLOY_HOOK_URL 로 POST → Vercel 재배포 트리거
//          (Hook URL은 응답에 절대 노출 X)
// 환경변수 (Vercel + 로컬 .env):
//   SUPABASE_URL (또는 VITE_SUPABASE_URL fallback)
//   SUPABASE_SERVICE_ROLE_KEY  — 토큰 검증용
//   VERCEL_DEPLOY_HOOK_URL     — Vercel 대시보드 → Settings → Git → Deploy Hooks
//   DEPLOY_TRIGGER_SECRET      — env 존재 자체가 잠금 (값 자체는 검증에 쓰지 않음 — 클라 노출 방지)
// =============================================================

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // env 검증 (DEPLOY_TRIGGER_SECRET 존재가 함수 활성 잠금 — 미설정 시 502)
  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hookUrl        = process.env.VERCEL_DEPLOY_HOOK_URL;
  const triggerSecret  = process.env.DEPLOY_TRIGGER_SECRET;
  if (!supabaseUrl || !serviceRoleKey || !hookUrl || !triggerSecret) {
    console.error('[trigger-deploy] env missing', {
      url: !!supabaseUrl, serviceKey: !!serviceRoleKey,
      hook: !!hookUrl, secret: !!triggerSecret,
    });
    return res.status(502).json({ ok: false, error: 'Server misconfigured' });
  }

  // Authorization 헤더 추출
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(authHeader));
  if (!m) {
    return res.status(401).json({ ok: false, error: 'Missing bearer token' });
  }
  const token = m[1].trim();
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Empty bearer token' });
  }

  // service role로 token → user → role 검증
  let userId;
  try {
    const supaAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: ue } = await supaAdmin.auth.getUser(token);
    if (ue || !userData?.user) {
      return res.status(401).json({ ok: false, error: 'Invalid token' });
    }
    userId = userData.user.id;
    const { data: profile, error: pe } = await supaAdmin
      .from('users')
      .select('role, is_active')
      .eq('id', userId)
      .single();
    if (pe || !profile) {
      return res.status(403).json({ ok: false, error: 'Profile not found' });
    }
    if (!profile.is_active) {
      return res.status(403).json({ ok: false, error: 'Inactive account' });
    }
    if (!['admin', 'publisher'].includes(profile.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden: admin/publisher only' });
    }
  } catch (err) {
    console.error('[trigger-deploy] auth verify exception:', err?.message || err);
    return res.status(500).json({ ok: false, error: 'Auth verify failed' });
  }

  // Vercel Deploy Hook 호출
  try {
    const hookRes = await fetch(hookUrl, { method: 'POST' });
    if (hookRes.ok) {
      console.log(`[trigger-deploy] deploy triggered by user ${userId}`);
      return res.status(200).json({ ok: true });
    }
    const txt = await hookRes.text().catch(() => '');
    console.error('[trigger-deploy] hook error:', hookRes.status, txt.slice(0, 200));
    return res.status(502).json({ ok: false, error: `Hook responded ${hookRes.status}` });
  } catch (err) {
    console.error('[trigger-deploy] hook exception:', err?.message || err);
    return res.status(502).json({ ok: false, error: 'Hook fetch failed' });
  }
}
