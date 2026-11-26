// Capture the top of each page from the production preview at the share card size.
// Usage: node scripts/og-images.mjs [base URL] [page names, optional]
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://127.0.0.1:4322';
const only = process.argv.slice(3);
const pages = {
  home: '/',
  tour: '/tour/',
  andon: '/projects/andon/',
  'image-stitcher': '/projects/image-stitcher/',
  lloyd: '/projects/lloyd/',
  'dose-coach': '/projects/dose-coach/',
  about: '/about/',
  resume: '/resume/',
  photography: '/photography/',
};

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  for (const [name, path] of Object.entries(pages)) {
    if (only.length && !only.includes(name)) continue;
    const response = await page.goto(new URL(path, base).href);
    if (!response?.ok()) throw new Error(`Sharing image: could not load ${path}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/og/${name}.jpg`, quality: 86 });
    console.log(name);
  }
} finally {
  await browser.close();
}
