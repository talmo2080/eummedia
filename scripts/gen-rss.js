/* eslint-disable no-console */
/* global process */
// scripts/gen-rss.js
// 빌드 전(prebuild) 실행 — Supabase에서 published 기사 최신 30건을 가져와
// public/rss.xml 정적 RSS 2.0 피드를 생성한다.
//
// 실행: node scripts/gen-rss.js
//
// 환경변수 (.env): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
//   별도 패키지 없이 fetch 직접 호출 — Node 18+ 내장 fetch 사용.

import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://www.eummedia.kr';
const FEED_URL = `${SITE_URL}/rss.xml`;
const OUT_PATH = path.resolve('public/rss.xml');
const FEED_LIMIT = 30;

const CHANNEL = {
  title: '이음미디어',
  link: SITE_URL,
  description: '시니어와 소상공인, 이웃의 이야기를 조명하는 인터넷신문 이음미디어',
  language: 'ko',
};

// ───────── .env 로더 (gen-sitemap.js와 동일 패턴) ─────────
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

// ───────── 기사 fetch ─────────
async function fetchArticles() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수 누락');
  }
  const endpoint = `${url}/rest/v1/articles?select=slug,title,summary,published_at&status=eq.published&order=published_at.desc&limit=${FEED_LIMIT}`;
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
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ───────── RFC 822 날짜 (RSS pubDate 표준) ─────────
function rfc822(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // toUTCString()은 RFC 1123/2822 호환 — RSS reader가 모두 인식.
  // 예: "Sun, 25 May 2026 06:00:00 GMT"
  return d.toUTCString();
}

// ───────── item XML 빌더 ─────────
function itemXml({ slug, title, summary, published_at }) {
  const link = `${SITE_URL}/article/${slug}`;
  return [
    '    <item>',
    `      <title>${esc(title)}</title>`,
    `      <link>${esc(link)}</link>`,
    `      <description>${esc(summary)}</description>`,
    `      <pubDate>${rfc822(published_at)}</pubDate>`,
    `      <guid>${esc(link)}</guid>`,
    '    </item>',
  ].join('\n');
}

// ───────── 메인 ─────────
async function main() {
  console.log('[gen-rss] 시작...');

  const articles = await fetchArticles();
  console.log(`[gen-rss] 기사 fetch: ${articles.length}건`);

  const items = articles.map(itemXml).join('\n');
  const buildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(CHANNEL.title)}</title>
    <link>${esc(CHANNEL.link)}</link>
    <description>${esc(CHANNEL.description)}</description>
    <language>${esc(CHANNEL.language)}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${esc(FEED_URL)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, xml, 'utf8');

  console.log(`[gen-rss] 완료 → ${OUT_PATH}`);
  console.log(`[gen-rss] 총 ${articles.length}개 item (최신 ${FEED_LIMIT}건 한도)`);
}

main().catch((err) => {
  console.error('[gen-rss] 실패:', err.message);
  process.exit(1);
});
