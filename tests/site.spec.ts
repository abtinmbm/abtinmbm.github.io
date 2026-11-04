import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/projects/andon/', '/projects/image-stitcher/', '/about/', '/resume/', '/photography/', '/404'];
const widths = [320, 390, 768, 1280, 1920];

for (const path of pages) {
  test(`${path} loads without console errors and passes axe`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  for (const w of widths) {
    test(`${path} has no horizontal overflow at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(path, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test(`${path} can be worked through with the keyboard`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const links = await page.locator('a[href]:visible').count();
    const seen = new Set<string>();
    for (let i = 0; i < links + 2; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return '';
        const style = getComputedStyle(el);
        return `${el.tagName}|${el.getAttribute('href')}|${style.outlineStyle !== 'none' || style.textDecorationThickness !== 'auto'}`;
      });
      if (tag) seen.add(tag);
    }
    expect(seen.size).toBeGreaterThan(3);
  });
}

test('star trails draw one labelled trail per recent project', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.sky-labels a')).toHaveCount(4);
  await expect(page.locator('.sky-labels a', { hasText: 'Andon' })).toHaveAttribute('href', '/projects/andon/');
  await expect(page.locator('.t-proj')).toHaveCount(4);
});

test('star trails still show a sky without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.t-proj')).toHaveCount(4);
  await expect(page.locator('#work a[href="/projects/andon/"]')).toBeVisible();
  await ctx.close();
});

test('the Andon replay plays when motion is allowed and can be paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/projects/andon/');
  const fig = page.locator('[data-replay]');
  await fig.scrollIntoViewIfNeeded();
  const now = fig.locator('.rp-now');
  const first = await now.textContent();
  await page.waitForTimeout(800);
  expect(await now.textContent()).not.toBe(first);
  await fig.getByRole('button', { name: 'Pause replay' }).click();
  const paused = await now.textContent();
  await page.waitForTimeout(500);
  expect(await now.textContent()).toBe(paused);
});
