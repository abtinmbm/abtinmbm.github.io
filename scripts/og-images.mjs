// Capture the top of each page from the production preview at the share card size.
// Usage: node scripts/og-images.mjs [base URL] [page names, optional]
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://127.0.0.1:4322';
const only = process.argv.slice(3);
const pages = {
  home: '/',
  projects: '/projects/',
  tour: '/tour/',
  andon: '/projects/andon/',
  'image-stitcher': '/projects/image-stitcher/',
  lloyd: '/projects/lloyd/',
  'dose-coach': '/projects/dose-coach/',
  about: '/about/',
  resume: '/resume/',
  photography: '/photography/?view=contact-sheet',
  'not-found': '/404.html',
};

async function prepareHomeCard(page) {
  await page.addStyleTag({ content: `
    body { display: grid; align-content: center; padding: 0 48px; }
    .share-card { padding: 3px; }
    .share-titlebar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--fg); color: var(--panel); font: 400 16px var(--mono); }
    .share-titlebar svg { width: 20px; height: 20px; --fg: var(--accent); }
    .share-content { padding: 24px 26px; }
    .share-content h1 { font: 400 76px/1 var(--mono); letter-spacing: -0.03em; }
    .share-content p { margin-top: 8px; font-size: 22px; }
    .share-examples { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; margin-top: 22px; }
    .share-examples h2 { padding: 6px 8px; background: var(--desk); font: 400 16px var(--mono); }
    .share-examples :is(img, svg) { display: block; width: 100%; height: 218px; object-fit: contain; }
  ` });
  await page.evaluate(async () => {
    const brand = document.querySelector('.brand svg').cloneNode(true);
    const chart = document.querySelector('#andon .rp-chart').cloneNode(true);
    const map = document.createElement('img');
    const source = document.querySelector('#image-stitcher .hs-frame:last-child img');
    map.src = source.currentSrc || source.src;
    await map.decode();

    const card = document.createElement('main');
    card.className = 'share-card raised';
    card.innerHTML = `
      <div class="share-titlebar">AbtinOS</div>
      <div class="share-content">
        <h1></h1>
        <p>Computer Engineering · University of Waterloo</p>
        <div class="share-examples">
          <section class="sunken"><h2>Andon · fan fault replay</h2></section>
          <section class="sunken"><h2>Image Stitcher · simulated map</h2></section>
        </div>
      </div>`;
    card.querySelector('h1').textContent = document.querySelector('.brand').textContent.trim();
    card.querySelector('.share-titlebar').prepend(brand);
    const [andon, stitcher] = card.querySelectorAll('.share-examples section');
    andon.append(chart);
    stitcher.append(map);
    document.body.replaceChildren(card);
  });
}

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  for (const [name, path] of Object.entries(pages)) {
    if (only.length && !only.includes(name)) continue;
    const response = await page.goto(new URL(name === 'home' ? pages.projects : path, base).href);
    if (!response?.ok()) throw new Error(`Sharing image: could not load ${path}`);
    if (name === 'home') await prepareHomeCard(page);
    if (name === 'photography') {
      await page.locator('.sheet-open').waitFor();
      await page.locator('.sheet-open .thumb img').evaluateAll(async (images) => {
        await Promise.all(images.filter((image) => image.getBoundingClientRect().top < innerHeight).map((image) => image.decode()));
      });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/og/${name}.jpg`, quality: 86 });
    console.log(name);
  }
} finally {
  await browser.close();
}
