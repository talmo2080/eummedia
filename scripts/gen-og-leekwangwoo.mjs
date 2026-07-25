import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/leekwangwoo-og.jpg');
const PHOTO = path.resolve(__dirname, '../public/pium/profile/leekwangwoo/02-hero-photo.jpg');

const photoB64 = fs.readFileSync(PHOTO).toString('base64');
const photoSrc = `data:image/jpeg;base64,${photoB64}`;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1200px; height:630px; overflow:hidden; font-family: 'Malgun Gothic', sans-serif; }
.card {
  width:1200px; height:630px;
  background:#1a2535;
  display:flex;
  position:relative;
}
.left {
  width:520px; flex-shrink:0;
  background:#142030;
  display:flex; align-items:center; justify-content:center;
}
.ring {
  width:360px; height:360px;
  border-radius:50%;
  border:5px solid #4a8c6e;
  overflow:hidden;
}
.ring img { width:100%; height:100%; object-fit:cover; }
.right {
  flex:1;
  padding:56px 48px 44px 40px;
  display:flex; flex-direction:column; justify-content:space-between;
}
.logo { font-size:18px; color:#7aaa8a; letter-spacing:2px; font-weight:500; margin-bottom:8px; }
.name { font-size:64px; font-weight:700; color:#ffffff; line-height:1.05; }
.name-en { font-size:22px; color:#8ab5a0; margin-top:6px; }
.divider { width:60px; height:3px; background:#4a8c6e; margin:20px 0; }
.title { font-size:24px; color:#c8ddd4; line-height:1.6; }
.tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
.tag {
  font-size:16px; padding:6px 16px;
  border-radius:20px;
  border:1.5px solid #3a6e56;
  color:#7aaa8a;
}
.footer { display:flex; align-items:center; justify-content:space-between; }
.pium { font-size:18px; color:#4a7a62; }
.contact { font-size:18px; color:#5a8a72; }
.bar { position:absolute; bottom:0; left:0; right:0; height:6px; background:#4a8c6e; }
</style>
</head>
<body>
<div class="card">
  <div class="left">
    <div class="ring">
      <img src="${photoSrc}" alt="이광우">
    </div>
  </div>
  <div class="right">
    <div>
      <div class="logo">PIUM · 이음미디어</div>
      <div class="name">이광우</div>
      <div class="name-en">Lee Kwangwoo</div>
      <div class="divider"></div>
      <div class="title">힐링숲라파 대표<br>건강경영 · 힐링경영 전문가</div>
      <div class="tags">
        <span class="tag">힐링경영</span>
        <span class="tag">족욕 · 이완</span>
        <span class="tag">강의 · 섭외</span>
        <span class="tag">출장 힐링</span>
      </div>
    </div>
    <div class="footer">
      <span class="pium">피움 전문가 프로필</span>
      <span class="contact">010-5069-0314</span>
    </div>
  </div>
  <div class="bar"></div>
</div>
</body>
</html>`;

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: OUT, type: 'jpeg', quality: 92 });
await browser.close();
console.log('✅ 저장 완료:', OUT);
