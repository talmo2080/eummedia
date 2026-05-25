import puppeteer from 'puppeteer';
import { preview } from 'vite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const BASE_URL = 'http://localhost:4173';

// Supabase — 환경변수에서 읽기
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function getUrls() {
  const staticUrls = [
    '/', '/about', '/subscribe',
    '/privacy', '/youth', '/login', '/signup',
    '/advertise', '/report', '/citizen-reporter', '/terms',
  ];

  // 기사 slug 목록
  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published');
  const articleUrls = (articles || []).map(a => `/article/${a.slug}`);

  // 채널 목록
  const { data: channels } = await supabase
    .from('channels')
    .select('english_slug');
  const channelUrls = (channels || []).map(c =>
    `/channel/${c.english_slug}`);

  return [...staticUrls, ...articleUrls, ...channelUrls];
}

async function savePage(browser, url) {
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle2', timeout: 30000 });
  const html = await page.content();

  const filePath = url === '/'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, url.slice(1), 'index.html');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ ${url}`);
  await page.close();
}

async function main() {
  // vite preview 서버 프로그래밍 방식 시작
  const server = await preview({
    preview: { port: 4173, strictPort: true },
  });

  const urls = await getUrls();
  console.log(`\n📄 총 ${urls.length}페이지 prerender 시작\n`);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (let i = 0; i < urls.length; i += 5) {
    const batch = urls.slice(i, i + 5);
    await Promise.all(batch.map(url => savePage(browser, url)));
  }

  await browser.close();
  server.httpServer.close();
  console.log('\n🎉 prerender 완료!');
}

main().catch(console.error);
