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
const SITE_URL = 'https://www.eummedia.kr';
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

// NewsArticle JSON-LD 생성 — Schema.org 기사 스키마
// (검색엔진 — 특히 네이버·구글 뉴스 — 이 기사 메타데이터를 정확히 파싱하도록 함)
function buildNewsArticleJsonLd(article, fullUrl) {
  const headline = article.title || '';
  const description = (article.summary && article.summary.trim()) || DEFAULT_OG_DESC;
  const image = article.thumbnail_url || DEFAULT_OG_IMAGE;
  const datePublished = article.published_at || '';
  const dateModified  = article.updated_at  || article.published_at || '';
  const authorName = article.users?.nickname || '이음미디어 편집부';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    image: [image],
    datePublished,
    dateModified,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: '이음미디어',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
      },
    },
    description,
    mainEntityOfPage: fullUrl,
  };
  // JSON.stringify의 자체 escape는 </script>, <, > 위험을 해소하지 못함 — 추가 처리
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return `<script type="application/ld+json">${json}</script>`;
}

// 피움앱 프로필 페이지 OG 메타 데이터
const PIUM_APP_PROFILES = {
  '/pium-app/sungchangwoon': {
    title: '성창운 · 봉숭아학당문화혁신학교 총장 | 이음미디어',
    desc: '웃음레크·힐링 스피치·사상체질 소통 강의 전문가. 강의·섭외 문의 010-9893-0330',
    image: `${SITE_URL}/sungchangwoon-og.jpg`,
  },
};

// 피움앱 프로필 페이지의 <title> + og/twitter/description 메타를 프로필별 값으로 교체
function applyPiumAppMeta(html, profile, url) {
  const fullUrl = `${SITE_URL}${url}`;
  const t = escHtml(profile.title);
  const d = escHtml(profile.desc);
  const i = escHtml(profile.image);
  const u = escHtml(fullUrl);

  return html
    .replace(/(<title>)[^<]*(<\/title>)/, `$1${t}$2`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1profile$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${i}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${i}$2`);
}

// 기사 페이지의 <title> + og/twitter/description 메타를 기사별 값으로 교체
// + NewsArticle JSON-LD 를 </head> 직전에 삽입
function applyArticleMeta(html, article, url) {
  const title = `${article.title} | 이음미디어`;
  const desc = (article.summary && article.summary.trim()) || DEFAULT_OG_DESC;
  const image = article.thumbnail_url || DEFAULT_OG_IMAGE;
  const fullUrl = `${SITE_URL}${url}`;

  const t = escHtml(title);
  const d = escHtml(desc);
  const i = escHtml(image);
  const u = escHtml(fullUrl);

  const newsJsonLd = buildNewsArticleJsonLd(article, fullUrl);

  return html
    .replace(/(<title>)[^<]*(<\/title>)/, `$1${t}$2`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${i}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${i}$2`)
    // NewsArticle JSON-LD — </head> 직전에 삽입 (기존 Organization/WebSite JSON-LD와 공존)
    .replace(/<\/head>/, `  ${newsJsonLd}\n  </head>`);
}

async function getUrls() {
  const staticUrls = [
    '/', '/about', '/subscribe',
    '/privacy', '/youth', '/login', '/signup',
    '/advertise', '/report', '/citizen-reporter', '/terms',
    '/videos',
    // 피움앱 프로필 페이지
    ...Object.keys(PIUM_APP_PROFILES),
  ];

  // 기사 — slug + OG/JSON-LD 후처리에 필요한 필드 함께 fetch
  // (NewsArticle JSON-LD에 published_at, updated_at, 기자명 필요)
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, summary, thumbnail_url, published_at, updated_at, users(nickname)')
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
  // 피움앱 프로필 페이지면 프로필별 OG 메타 교체
  if (url.startsWith('/pium-app/')) {
    const profile = PIUM_APP_PROFILES[url];
    if (profile) html = applyPiumAppMeta(html, profile, url);
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
