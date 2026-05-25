/* eslint-disable no-console */
/* global process */
// scripts/gen-sitemap.js
// 빌드 전(prebuild) 실행 — Supabase에서 published 기사·채널을 가져와
// public/sitemap.xml 정적 파일을 생성한다.
//
// 실행: node scripts/gen-sitemap.js
//
// 환경변수 (.env): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
//   별도 패키지 없이 fetch 직접 호출 — Node 18+ 내장 fetch 사용.

import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://eummedia.kr';
const OUT_PATH = path.resolve('public/sitemap.xml');

// ───────── .env 로더 (dotenv 없이 직접 파싱) ─────────
function loadEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) return;
  const txt = fs.readFileSync(envPath, 'utf8');
  txt.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}
loadEnv();

// ───────── 정적 페이지 (공개) ─────────
const STATIC_PAGES = [
  { loc: '/',                  priority: 1.0, changefreq: 'daily'   },
  { loc: '/about',             priority: 0.6, changefreq: 'yearly'  },
  { loc: '/advertise',         priority: 0.5, changefreq: 'monthly' },
  { loc: '/report',            priority: 0.5, changefreq: 'monthly' },
  { loc: '/citizen-reporter',  priority: 0.6, changefreq: 'monthly' },
  { loc: '/subscribe',         priority: 0.5, changefreq: 'monthly' },
  { loc: '/terms',             priority: 0.3, changefreq: 'yearly'  },
  { loc: '/privacy',           priority: 0.3, changefreq: 'yearly'  },
  { loc: '/youth',             priority: 0.3, changefreq: 'yearly'  },
];

// ───────── 채널 (NAV_CHANNELS 영문 slug 7개) ─────────
const CHANNELS = [
  'magazine', 'local', 'edu', 'people', 'trend', 'voice', 'view',
];

// ───────── 기사 fetch ─────────
async function fetchArticles() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수 누락');
  }
  // PostgREST 직접 호출 (limit 큼 — 수만 건도 한 번에)
  const endpoint = `${url}/rest/v1/articles?select=slug,published_at,updated_at&status=eq.published&order=published_at.desc&limit=10000`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase articles fetch 실패: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ───────── XML escape ─────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ───────── ISO 날짜만 (YYYY-MM-DD) ─────────
function isoDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

// ───────── URL entry 빌더 ─────────
function urlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = [`    <loc>${esc(SITE_URL + loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority !== undefined) parts.push(`    <priority>${priority.toFixed(1)}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

// ───────── 메인 ─────────
async function main() {
  console.log('[gen-sitemap] 시작...');

  const articles = await fetchArticles();
  console.log(`[gen-sitemap] 기사 fetch: ${articles.length}건`);

  const today = isoDate(new Date().toISOString());
  const entries = [];

  // 정적 페이지
  for (const p of STATIC_PAGES) {
    entries.push(urlEntry({ ...p, lastmod: today }));
  }
  // 채널
  for (const slug of CHANNELS) {
    entries.push(urlEntry({
      loc: `/channel/${slug}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.7,
    }));
  }
  // 기사 (lastmod = updated_at > published_at)
  for (const a of articles) {
    entries.push(urlEntry({
      loc: `/article/${a.slug}`,
      lastmod: isoDate(a.updated_at || a.published_at),
      changefreq: 'weekly',
      priority: 0.8,
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, xml, 'utf8');

  console.log(`[gen-sitemap] 완료 → ${OUT_PATH}`);
  console.log(`[gen-sitemap] 총 ${entries.length}개 URL (정적 ${STATIC_PAGES.length} + 채널 ${CHANNELS.length} + 기사 ${articles.length})`);
}

main().catch((err) => {
  console.error('[gen-sitemap] 실패:', err.message);
  process.exit(1);
});
