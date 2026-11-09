const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  const desktop = path.resolve('.impeccable/review/desktop.png');
  await page.screenshot({ path: desktop, fullPage: true });

  await page.getByRole('button', { name: /INSPECTOR Transform/ }).click();
  await page.getByRole('button', { name: '디버그 출력과 애니메이션', exact: true }).click();
  if (await page.locator('#next-lesson').isDisabled()) throw new Error('Next lesson remained disabled');
  if ((await page.locator('#progress-label').innerText()) !== '1 / 9 완료') throw new Error('Progress did not update');

  await page.goto('http://127.0.0.1:4173/#signals', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Timer.timeout', exact: true }).click();
  await page.getByRole('button', { name: 'Player._on_cooldown_finished', exact: true }).click();
  if (!(await page.locator('#practice-state').innerText()).includes('완료')) throw new Error('Signal practice did not complete');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/#nodes', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  if (bodyWidth > 390) throw new Error(`Horizontal overflow: ${bodyWidth}px`);
  const mobile = path.resolve('.impeccable/review/mobile.png');
  await page.screenshot({ path: mobile, fullPage: true });
  console.log(JSON.stringify({ desktop, mobile, bodyWidth, status: 'ok' }));
  await browser.close();
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
