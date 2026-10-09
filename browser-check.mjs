import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = dirname(fileURLToPath(import.meta.url));
const screenshots = process.argv.includes('--screenshots');
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (error) => errors.push(error.message));
if (screenshots) mkdirSync(resolve(root, 'previews'), { recursive: true });

async function assertReadableText() {
  const smallText = await page.evaluate(() => [...document.querySelectorAll('body *')].flatMap((element) => {
    if (!element.getClientRects().length || element.closest('svg, [aria-hidden="true"]')) return [];
    const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const isControl = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'].includes(element.tagName);
    if (!hasText && !isControl) return [];
    const minimum = element.tagName === 'P' || isControl ? 16 : 14;
    const size = parseFloat(getComputedStyle(element).fontSize);
    return size < minimum ? [{ text: element.textContent.trim().slice(0, 60), size, minimum }] : [];
  }));
  assert.deepEqual(smallText, [], 'Body text and controls >= 16px; secondary text >= 14px');
}

try {
  for (const name of ['moc', 'volt', 'nep', 'index']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`http://127.0.0.1:4177/${name}.html`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('h1').waitFor({ state: 'visible' });
    await page.evaluate(async () => {
      for (const image of document.images) {
        image.loading = 'eager';
        await image.decode();
      }
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: desktop overflow`);
    await assertReadableText();
    const wrongRatios = await page.evaluate(() => [...document.images].filter((image) => {
      const ratio = getComputedStyle(image).aspectRatio;
      if (ratio.startsWith('auto')) return false;
      const [width, height = 1] = ratio.split('/').map(Number);
      const rect = image.getBoundingClientRect();
      return Math.abs(rect.width / rect.height - width / height) > 0.02;
    }).map((image) => image.getAttribute('src')));
    assert.deepEqual(wrongRatios, [], `${name}: images keep their designed aspect ratios`);
    if (screenshots) {
      await page.screenshot({ path: resolve(root, `previews/${name}-desktop.png`) });
      if (name !== 'index') {
        await page.screenshot({ path: resolve(root, `assets/${name}-preview.png`) });
      }
    }
    if (name !== 'index') {
      await page.locator('[data-inquiry]').first().click();
      const dialog = page.locator('dialog:has(form)');
      assert.equal(await dialog.evaluate((element) => element.open), true);
      await assertReadableText();
      await dialog.getByLabel('Tên của bạn').fill('An <script>');
      await dialog.getByLabel('Email', { exact: true }).fill('an@example.com');
      await dialog.getByLabel('Bạn cần chúng tôi giúp gì?').fill('Tôi muốn tìm hiểu thêm.');
      await dialog.locator('form').evaluate((form) => { form.requestSubmit(); });
      assert.match(await dialog.locator('[role="status"]').innerText(), /chưa được gửi/);
      assert.equal(await dialog.locator('[role="status"] script').count(), 0, 'user text must remain plain text');
      await page.keyboard.press('Escape');
      assert.equal(await dialog.evaluate((element) => element.open), false);
      assert.equal(await page.locator('[data-inquiry]').first().evaluate((element) => element === document.activeElement), true, 'dialog returns focus');
    }
    if (name === 'moc') {
      await page.locator('[data-filter="seat"]').click();
      assert.equal(await page.locator('[data-category]:visible').count(), 1);
      assert.equal(await page.locator('[data-filter="seat"]').getAttribute('aria-pressed'), 'true');
      await page.locator('[data-filter="all"]').click();
      assert.equal(await page.locator('[data-category]:visible').count(), 3);
    }
    if (name === 'volt') {
      await page.locator('[data-case="case-luma"]').click();
      assert.equal(await page.locator('#case-dialog').evaluate((element) => element.open), true);
      assert.match(await page.locator('#case-dialog').innerText(), /Luma/);
      await page.keyboard.press('Escape');
      await page.locator('.service-list details').nth(1).locator('summary').click();
      assert.equal(await page.locator('.service-list details').nth(1).evaluate((element) => element.open), true);
    }
    for (const width of [1280, 1024, 820, 768, 390, 360, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`http://127.0.0.1:4177/${name}.html`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: ${width}px overflow`);
      await assertReadableText();
      if (screenshots && width === 390 && name !== 'index') {
        await page.screenshot({ path: resolve(root, `previews/${name}-mobile-hero.png`) });
      }
      if (name !== 'index' && await page.locator('.menu-toggle').isVisible()) {
        await page.locator('.menu-toggle').click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
        await assertReadableText();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
        await page.locator('.menu-toggle').click();
        await page.locator('.nav-links a').first().click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      }
      if (screenshots && width === 390) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.evaluate(() => {
          document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
          window.scrollTo(0, 0);
        });
        await page.screenshot({ path: resolve(root, `previews/${name}-mobile.png`), fullPage: true });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const movingElements = await page.evaluate(() => [...document.querySelectorAll('*')].filter((element) => getComputedStyle(element).animationName !== 'none').length);
    assert.equal(movingElements, 0, `${name}: reduced motion disables animations`);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    console.log(`PASS ${name}: readable typography, desktop/tablet/mobile, reduced motion${name !== 'index' ? ', menu and form' : ''}`);
  }
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log('PASS all browser checks; no uncaught JavaScript errors');
} finally {
  await browser.close();
}
