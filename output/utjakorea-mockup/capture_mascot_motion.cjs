const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const outputDir = process.argv[2];
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4177/', { waitUntil: 'networkidle' });
  await page.locator('.mascot-wrap').waitFor({ state: 'visible' });
  await page.waitForTimeout(300);

  for (let index = 0; index < 40; index += 1) {
    const filename = `${outputDir}/frame-${String(index).padStart(3, '0')}.png`;
    await page.screenshot({
      path: filename,
      clip: { x: 22, y: 700, width: 1395, height: 350 },
    });
    await page.waitForTimeout(100);
  }

  await browser.close();
})();
