import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/choiilrye-og.jpg');
const PHOTO = path.resolve(__dirname, '../public/pium-app/choiilrye/hero.jpg');

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
  background:#1e1730;
  display:flex;
  position:relative;
}
.left {
  width:520px; flex-shrink:0;
  background:#160e28;
  display:flex; align-items:center; justify-content:center;
}
.ring {
  width:360px; height:360px;
  border-radius:50%;
  border:5px solid #c8a04a;
  overflow:hidden;
}
.ring img { width:100%; height:100%; object-fit:cover; object-position:center top; }
.right {
  flex:1;
  padding:56px 48px 44px 40px;
  display:flex; flex-direction:column; justify-content:space-between;
}
.logo { font-size:18px; color:#c8a04a; letter-spacing:2px; font-weight:500; margin-bottom:8px; }
.name { font-size:64px; font-weight:700; color:#ffffff; line-height:1.05; }
.name-en { font-size:22px; color:#b09060; margin-top:6px; }
.divider { width:60px; height:3px; background:#c8a04a; margin:20px 0; }
.title { font-size:24px; color:#d8cce8; line-height:1.6; }
.tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
.tag {
  font-size:16px; padding:6px 16px;
  border-radius:20px;
  border:1.5px solid #8a6a30;
  color:#c8a04a;
}
.footer { display:flex; align-items:center; justify-content:space-between; }
.pium { font-size:18px; color:#8a6a30; }
.contact { font-size:18px; color:#a08050; }
.bar { position:absolute; bottom:0; left:0; right:0; height:6px; background:#c8a04a; }
</style>
</head>
<body>
<div class="card">
  <div class="left">
    <div class="ring">
      <img src="${photoSrc}" alt="최일례">
    </div>
  </div>
  <div class="right">
    <div>
      <div class="logo">PIUM · 이음미디어</div>
      <div class="name">최일례</div>
      <div class="name-en">Choi Il Rye</div>
      <div class="divider"></div>
      <div class="title">이음미디어 대표<br>책쓰기 전임교수 · 소통공감박사</div>
      <div class="tags">
        <span class="tag">책쓰기 강의</span>
        <span class="tag">AI 디지털</span>
        <span class="tag">스피치</span>
        <span class="tag">시니어 교육</span>
      </div>
    </div>
    <div class="footer">
      <span class="pium">피움 전문가 프로필</span>
      <span class="contact">010-8502-1960</span>
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
