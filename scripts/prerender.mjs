import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import puppeteerDefault from 'puppeteer';
import { preview } from 'vite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://eummedia.kr';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_OG_DESC = '시니어와 소상공인, 이웃의 이야기를 조명하는 인터넷신문';

// Supabase — 환경변수에서 읽기
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// HTML escape — meta content/title 값의 특수문자 처리
function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 기사 페이지의 <title> + og/twitter/description 메타를 기사별 값으로 교체
function applyArticleMeta(html, article, url) {
  const title = `${article.title} | 이음미디어`;
  const desc = (article.summary && article.summary.trim()) || DEFAULT_OG_DESC;
  const image = article.thumbnail_url || DEFAULT_OG_IMAGE;
  const fullUrl = `${SITE_URL}${url}`;

  const t = escHtml(title);
  const d = escHtml(desc);
  const i = escHtml(image);
  const u = escHtml(fullUrl);

  return html
    .replace(/(<title>)[^<]*(<\/title>)/, `$1${t}$2`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${i}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${i}$2`);
}

async function getUrls() {
  const staticUrls = [
    '/', '/about', '/subscribe',
    '/privacy', '/youth', '/login', '/signup',
    '/advertise', '/report', '/citizen-reporter', '/terms',
  ];

  // 기사 — slug + OG 후처리에 필요한 필드 함께 fetch
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, summary, thumbnail_url')
    .eq('status', 'published');
  const articleUrls = (articles || []).map(a => `/article/${a.slug}`);
  // slug → article Map (savePage에서 OG 메타 교체에 사용)
  const articlesMap = new Map((articles || []).map(a => [a.slug, a]));

  // 채널 목록
  const { data: channels } = await supabase
    .from('channels')
    .select('english_slug');
  const channelUrls = (channels || []).map(c =>
    `/channel/${c.english_slug}`);

  return {
    urls: [...staticUrls, ...articleUrls, ...channelUrls],
    articlesMap,
  };
}

async function savePage(browser, url, baseUrl, articlesMap) {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle2', timeout: 30000 });
  let html = await page.content();

  // 기사 페이지면 <title>·OG·Twitter·description 메타를 기사별 값으로 교체
  if (url.startsWith('/article/')) {
    const slug = url.slice('/article/'.length);
    const article = articlesMap.get(slug);
    if (article) html = applyArticleMeta(html, article, url);
  }

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
    preview: { port: 4173, strictPort: false },
  });
  const actualPort = server.config.preview.port;
  const resolvedBase = `http://localhost:${actualPort}`;

  let browser;
  try {
    const { urls, articlesMap } = await getUrls();
    console.log(`\n📄 총 ${urls.length}페이지 prerender 시작\n`);

    const isVercel = process.env.VERCEL === '1';
    browser = await puppeteer.launch({
      args: isVercel
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: isVercel
        ? await chromium.executablePath()
        : await puppeteerDefault.executablePath(),
      headless: isVercel ? chromium.headless : true,
    });

    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5);
      await Promise.all(batch.map(url => savePage(browser, url, resolvedBase, articlesMap)));
    }
    console.log('\n🎉 prerender 완료!');
  } finally {
    if (browser) await browser.close();
    server.httpServer.close();
  }
}

main().catch(console.error);
