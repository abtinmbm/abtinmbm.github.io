import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { featured } from '../src/data/projects';

const pages = ['/', '/tour/', '/projects/', '/projects/andon/', '/projects/image-stitcher/', '/projects/lloyd/', '/projects/dose-coach/', '/about/', '/resume/', '/photography/', '/404'];
const widths = [320, 390, 768, 1280, 1920];

for (const path of pages) {
  test(`${path} loads without console errors and passes axe`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(path, { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('#boot')).toBeHidden();
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  for (const w of widths) {
    test(`${path} has no horizontal overflow at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test(`${path} can be worked through with the keyboard`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
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

test('taskbar tabs restore and focus Featured windows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/');
  const taskbar = page.getByRole('navigation', { name: 'Project windows' });
  await expect(taskbar.getByRole('link')).toHaveCount(featured().length);
  const andon = page.locator('#andon[data-win]');
  const toggle = andon.locator('[data-min]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const tab = taskbar.getByRole('link', { name: 'Andon' });
  await tab.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toBeFocused();
  await expect(tab).toHaveAttribute('aria-current', 'location');
});

test('the narrow taskbar fits its shortcuts and clock and the pixel face toggles with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.clock.setFixedTime(new Date('2026-01-01T17:59:00Z'));
  await page.goto('/');
  const bar = page.locator('.taskbar');
  const clock = bar.locator('time');
  await expect(clock).toHaveText(/12:59/);
  await expect(bar.getByRole('link', { name: 'Photos' })).toHaveCount(0);
  await expect(bar.getByRole('link', { name: 'Resume PDF' })).toHaveAttribute('href', /\.pdf$/);
  const face = bar.getByRole('button', { name: 'Surprise the pixel face' });
  await expect(face).toHaveAttribute('aria-pressed', 'false');
  await face.press('Space');
  await expect(face).toHaveAttribute('aria-pressed', 'true');
  await expect(face.locator('.gasp')).toBeVisible();
  await face.press('Space');
  await expect(face.locator('.smile')).toBeVisible();
  expect(await bar.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(320);
});

test('the desktop and Featured projects are readable without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Featured projects' }).getByRole('link')).toHaveCount(featured().length);
  await page.getByRole('link', { name: 'See projects' }).click();
  await expect(page.getByRole('link', { name: 'Read about Andon' })).toBeVisible();
  await expect(page.locator('#andon [data-min]')).toBeHidden();
  await ctx.close();
});

test('the boot fades into the desktop once, and following a page link uses a view transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', (event) => {
      if (event.viewTransition) document.documentElement.dataset.pageTransition = 'active';
    });
  });
  const start = new Date();
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
  await page.goto('/');

  const boot = page.locator('#boot');
  await expect(boot).toBeVisible();
  await page.clock.runFor(1250);
  await expect(boot).not.toHaveClass(/out/);
  await page.clock.runFor(750);
  await expect(boot).toHaveClass(/out/);
  await page.clock.runFor(250);
  await expect(boot).toHaveCount(0);
  await page.clock.resume();

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-page-transition', 'active');
  await expect(boot).toHaveCount(0);
});

test('WARG windows share the same rows and the Projects map has a keyboard slider', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/');
  await page.evaluate(() => document.fonts.ready);
  const range = page.getByRole('slider', { name: 'Photos in the simulated map' });
  await range.focus();
  await page.keyboard.press('End');
  await expect(range).toHaveAttribute('aria-valuetext', '91 of 91 photos');
  await expect(page.locator('.hs-frame.on img')).toHaveAttribute('alt', /91 of 91/);
  for (const selector of ['.h', '.read', '.meta', '.links']) {
    const [left, right] = await page.locator(`.w-body ${selector}`).evaluateAll((items) => items.map((item) => item.getBoundingClientRect().top));
    expect(Math.abs(left - right)).toBeLessThan(1);
  }
});

test('the Projects taskbar follows hover and selection when both WARG windows are visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/');
  const stitcher = page.locator('[data-tab="image-stitcher"]');
  const lloyd = page.locator('[data-tab="lloyd"]');
  const highlighted = page.locator('[data-tab].in-view');

  await stitcher.click();
  await expect(stitcher).toHaveAttribute('aria-current', 'location');
  await expect(highlighted).toHaveAttribute('data-tab', 'image-stitcher');
  await page.locator('#lloyd > .tb .t').hover();
  await expect(highlighted).toHaveAttribute('data-tab', 'lloyd');
  await page.locator('#image-stitcher > .tb .t').hover();
  await expect(highlighted).toHaveAttribute('data-tab', 'image-stitcher');

  await lloyd.click();
  await expect(lloyd).toHaveAttribute('aria-current', 'location');
  await expect(highlighted).toHaveAttribute('data-tab', 'lloyd');
  await stitcher.click();
  await expect(highlighted).toHaveAttribute('data-tab', 'image-stitcher');
});

test('Home features the projects and hands off to the Projects tab with the demos and Archive', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Featured projects' }).getByRole('link')).toHaveCount(featured().length);
  await expect(page.getByText(/WARG.*Autonomy subteam.*UW Formula Electric firmware subteam/)).toBeVisible();
  const mainNav = page.getByRole('navigation', { name: 'Main' });
  await expect(mainNav.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects/');
  await page.getByRole('link', { name: 'See projects' }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(mainNav.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'WARG' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Earlier projects' })).toBeVisible();
  await mainNav.getByRole('link', { name: 'About' }).click();
  await expect(page.getByText(/WARG.*Autonomy subteam.*UW Formula Electric firmware subteam/)).toBeVisible();
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

test('the demo tour follows Featured order and silences Andon when leaving the slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('link', { name: 'Take the demo tour' }).click();
  const audio = page.locator('[data-replay] audio');
  const sound = page.getByRole('button', { name: 'Sound', exact: true });
  const next = page.getByRole('button', { name: 'Next demo' });
  await expect(page.getByRole('heading', { name: 'Can a fan tell you it’s failing?' })).toBeVisible();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect(audio).toHaveJSProperty('muted', true);
  await expect(audio).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Jump to fault' }).click();
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await expect(audio).toHaveJSProperty('paused', false);
  await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(115);
  const range = page.getByRole('slider', { name: 'Replay time' });
  await expect.poll(async () => {
    const playhead = await range.evaluate((el: HTMLInputElement) => el.valueAsNumber);
    const playback = await audio.evaluate((el: HTMLAudioElement) => el.currentTime);
    return Math.abs(playhead - playback);
  }).toBeLessThan(0.5);
  await next.click();
  await expect(audio).toHaveJSProperty('paused', true);
  await expect(page.getByRole('heading', { name: 'How do scattered photos become one map?' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { name: 'How do drones spread out evenly?' })).toBeVisible();
  await next.click();
  await expect(page.getByRole('heading', { name: 'Can a wrist sensor coach a curl?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Finish tour' })).toBeFocused();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/#demo-lloyd$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'How do drones spread out evenly?' })).toBeVisible();
});

test('the demo tour shows each project and its full write-up link without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/tour/');
    for (const project of featured()) {
      await expect(page.getByRole('link', { name: `Read about ${project.name}` })).toBeVisible();
    }
  } finally {
    await context.close();
  }
});

for (const path of ['/tour/', '/projects/andon/']) {
  test(`${path} can seek with sound on and preserves sound on pause and resume`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const replay = page.locator('[data-replay]');
    const sound = replay.getByRole('button', { name: 'Sound', exact: true });
    const audio = replay.locator('audio');
    const position = () => audio.evaluate((el: HTMLAudioElement) => el.currentTime);
    const timeline = replay.getByRole('slider', { name: 'Replay time' });

    await sound.click();
    await expect(audio).toHaveJSProperty('paused', false);
    await timeline.focus();
    await page.keyboard.press('Home');
    await expect.poll(position).toBeLessThan(5);
    await replay.getByRole('button', { name: 'Jump to fault' }).click();
    await expect.poll(position).toBeGreaterThan(115);
    await expect.poll(() => timeline.evaluate((el: HTMLInputElement) => el.valueAsNumber)).toBeGreaterThan(115);

    await timeline.scrollIntoViewIfNeeded();
    const bounds = (await timeline.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * 0.75, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * 0.4, bounds.y + bounds.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect.poll(position).toBeLessThan(70);
    await expect.poll(position).toBeGreaterThan(50);

    await replay.getByRole('button', { name: 'Pause replay' }).click();
    await expect(audio).toHaveJSProperty('paused', true);
    await expect(sound).toHaveAttribute('aria-pressed', 'true');
    await replay.getByRole('button', { name: 'Play replay' }).click();
    await expect(audio).toHaveJSProperty('paused', false);
    await expect(audio).toHaveJSProperty('muted', false);
    await expect.poll(position).toBeGreaterThan(50);
  });
}

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

test('sharing images load and the sitemap lists every content page', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    const img = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(img).toBeTruthy();
    const res = await request.get(new URL(img!).pathname);
    expect(res.status(), img!).toBe(200);
    seen.add(img!);
    if (path !== '/404') await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://abtinmbm.github.io${path}`);
  }
  expect(seen.size).toBe(pages.length);
  const map = await (await request.get('/sitemap.xml')).text();
  for (const path of pages.filter((p) => p !== '/404')) expect(map).toContain(`https://abtinmbm.github.io${path}<`);
  expect((await request.get('/robots.txt')).status()).toBe(200);
});

test('the photo viewer moves with the buttons, the keyboard and the film strip', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/photography/');
  const centreOffset = await page.locator('.photo-window').evaluate((viewer) => {
    const { left, width } = viewer.getBoundingClientRect();
    return left + (width - document.documentElement.clientWidth) / 2;
  });
  expect(centreOffset).toBeCloseTo(0, 0);
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

test('the contact sheet opens photos in the viewer and restores a linked selection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/photography/');
  const toggle = page.getByRole('button', { name: 'Contact sheet' });
  const viewer = page.locator('.track');
  const grid = page.getByRole('navigation', { name: 'All photos' });

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(viewer).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
  await grid.getByRole('link', { name: /^Photo 01:/ }).press('Enter');
  await expect(viewer).toBeFocused();
  await expect(page).toHaveURL(/\/photography\/#p1$/);

  await page.goto('/photography/?view=contact-sheet#p10');
  const photo = grid.getByRole('link', { name: /^Photo 10:/ });
  await expect(photo).toHaveAttribute('aria-current', 'true');
  await photo.click();
  await expect(page.locator('.count b')).toHaveText('10');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page).toHaveURL(/\/photography\/#p10$/);
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
  await page.goto('/projects/');
  const stitcher = featured().find((project) => project.slug === 'image-stitcher')!;
  const lloyd = featured().find((project) => project.slug === 'lloyd')!;
  await expect(page.locator('#image-stitcher .meta')).toContainText(new RegExp(stitcher.status, 'i'));
  await expect(page.locator('#lloyd .meta')).toContainText(new RegExp(lloyd.status, 'i'));
});
