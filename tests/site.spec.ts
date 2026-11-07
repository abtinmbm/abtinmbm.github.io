import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../src/data/projects';

const pages = ['/', '/projects/andon/', '/projects/image-stitcher/', '/projects/lloyd/', '/about/', '/resume/', '/photography/', '/404'];
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
  await expect(page.locator('.sky-labels a')).toHaveCount(projects.length);
  await expect(page.locator('.sky-labels a', { hasText: 'Andon' })).toHaveAttribute('href', '/projects/andon/');
  await expect(page.locator('.t-proj')).toHaveCount(projects.length);
});

test('star trails still show a sky without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.t-proj')).toHaveCount(projects.length);
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

test('the stitcher map grows with the slider and the keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/image-stitcher/');
  const range = page.locator('#grow-range');
  const on = page.locator('.grow-frame.on');
  await expect(on).toHaveAttribute('data-n', '20');
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await expect(on).toHaveAttribute('data-n', '40');
  await expect(range).toHaveAttribute('aria-valuetext', '40 photos');
  await page.keyboard.press('End');
  await expect(on).toHaveAttribute('data-n', '91');
  await expect(page.locator('.grow-frame[aria-hidden="true"]')).toHaveCount(4);
  await page.locator('.grow-ticks button', { hasText: '60' }).click();
  await expect(on).toHaveAttribute('data-n', '60');
});

test('the stitcher page shows the finished map without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/projects/image-stitcher/');
  await expect(page.locator('.grow-frame.on')).toHaveAttribute('data-n', '91');
  await expect(page.locator('.grow-ctl')).toBeHidden();
  await ctx.close();
});

test('every page has its own sharing image, and the sitemap lists the pages', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of pages.filter((p) => p !== '/404')) {
    await page.goto(path);
    const img = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(img).toBeTruthy();
    const res = await request.get(new URL(img!).pathname);
    expect(res.status(), img!).toBe(200);
    seen.add(img!);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://abtinmbm.github.io${path}`);
  }
  expect(seen.size).toBe(pages.length - 1);
  const map = await (await request.get('/sitemap.xml')).text();
  for (const path of pages.filter((p) => p !== '/404')) expect(map).toContain(`https://abtinmbm.github.io${path}<`);
  expect((await request.get('/robots.txt')).status()).toBe(200);
});

test('the photo viewer moves with the buttons, the keyboard and the film strip', async ({ page }) => {
  await page.goto('/photography/');
  const count = page.locator('.count b');
  await expect(count).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Previous photo' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect(count).toHaveText('2');
  await page.keyboard.press('ArrowRight');
  await expect(count).toHaveText('3');
  await page.locator('.thumb').nth(9).click();
  await expect(count).toHaveText('10');
  await expect(page.locator('.thumb').nth(9)).toHaveAttribute('aria-current', 'true');
  await expect(page).toHaveURL(/#p10$/);
  await page.keyboard.press('ArrowLeft');
  await expect(count).toHaveText('9');
});

test('the stitcher map builds itself once when it comes into view', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/projects/image-stitcher/');
  await page.locator('.grow-stack').scrollIntoViewIfNeeded();
  await expect(page.locator('.grow-frame.on')).toHaveAttribute('data-n', '91', { timeout: 6000 });
  await expect(page.locator('#grow-range')).toHaveAttribute('aria-valuetext', '91 photos');
});

test('the match pair switches between before and after with the keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/image-stitcher/');
  const fig = page.locator('[data-mp]');
  const after = page.locator('.mp-tabs button[data-k="2"]');
  await expect(page.locator('path.mp-l.k0')).toBeVisible();
  await expect(page.locator('path.mp-l.k2')).toBeHidden();
  await after.focus();
  await page.keyboard.press('Enter');
  await expect(fig).toHaveAttribute('data-k', '2');
  await expect(after).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('path.mp-l.k2')).toBeVisible();
  await expect(page.locator('path.mp-l.k0')).toBeHidden();
});

test('the arrival map shows every footprint when motion is reduced, and replays when allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/image-stitcher/');
  await expect(page.locator('.arr-p')).toHaveCount(91);
  await expect(page.locator('.arr-p.off')).toHaveCount(0);
  await expect(page.locator('.arr-play')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await page.locator('.arr').scrollIntoViewIfNeeded();
  await expect(page.locator('.arr-now')).toContainText('All 91 photos in', { timeout: 15000 });
  await expect(page.locator('.arr-p.off')).toHaveCount(0);
});

test('each spectrogram clip plays and stops from its button', async ({ page }) => {
  await page.goto('/projects/andon/');
  const [normal, fault] = await page.locator('[data-listen]').all();
  const btn = normal.locator('.spec-play');
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(normal).toHaveClass(/playing/);
  await expect(btn).toHaveAttribute('aria-label', /Stop/);
  await fault.locator('.spec-play').click();
  await expect(fault).toHaveClass(/playing/);
  await expect(normal).not.toHaveClass(/playing/);
  await fault.locator('.spec-play').click();
  await expect(fault).not.toHaveClass(/playing/);
});

test('the Lloyd run shows the finished swarm when motion is reduced, and replays when allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/lloyd/');
  await expect(page.locator('.ly-step')).toHaveText('Step 32 of 32');
  await expect(page.locator('.ly-map .ly-dot')).toHaveCount(10);
  await expect(page.locator('.ly-play')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const play = page.locator('.ly-play');
  await play.scrollIntoViewIfNeeded();
  await expect(page.locator('.ly-step')).toHaveText('Step 32 of 32', { timeout: 20000 });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.ly-step')).not.toHaveText('Step 32 of 32');
});

test('status badges read from the project list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#image-stitcher .badge')).toHaveText('In review');
  await expect(page.locator('#lloyd .badge')).toHaveText('In review');
});
