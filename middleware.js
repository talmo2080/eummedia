// =============================================================
// Vercel Edge Middleware — 기사 slug 변경 시 옛 URL을 새 URL로 301 리다이렉트
//
// 매치: /article/:slug 요청만 (matcher config 참고)
// 로직:
//   1) Supabase slug_history 테이블에서 요청 slug를 old_slug로 조회
//   2) 매치되면 → 새 slug 획득 → 301 Permanent Redirect
//   3) 매치 없으면 → next() (Vercel이 정적 prerender 파일 서빙 or 404)
//
// 성능:
//   · 매 /article/* 요청마다 Supabase REST 1회 조회 (통상 20~50ms)
//   · 정상 slug 접속은 조회 1회 후 pass. 부담 크지 않음.
//   · 향후 Edge Config 캐싱으로 최적화 가능 (지금은 심플하게).
//
// 안전:
//   · env 누락 시 조용히 skip (사이트 다운 방지)
//   · Supabase 실패 시에도 조용히 skip (fallback = 404)
//   · slug_history에 self-referential 데이터가 있어도 skip (newSlug === slug)
// =============================================================

export const config = {
  matcher: '/article/:path*',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const rawSlug = url.pathname.slice('/article/'.length);
  if (!rawSlug) return;

  let slug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return;
  }

  const supaUrl = process.env.VITE_SUPABASE_URL;
  const anon    = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supaUrl || !anon) return;

  try {
    // slug_history.old_slug 매치 시 articles.slug 조인해 새 slug 획득
    const endpoint = `${supaUrl}/rest/v1/slug_history?old_slug=eq.${encodeURIComponent(slug)}&select=articles(slug)&limit=1`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
    });
    if (!res.ok) return;

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return;

    const newSlug = rows[0]?.articles?.slug;
    if (!newSlug || newSlug === slug) return;

    const target = `${url.origin}/article/${encodeURIComponent(newSlug)}${url.search}`;
    return Response.redirect(target, 301);
  } catch {
    // 네트워크·파싱 오류는 조용히 삼키고 pass (사이트 정상 동작 보장)
  }
}
