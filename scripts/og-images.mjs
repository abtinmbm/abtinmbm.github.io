// Sharing images: the top of each page, taken at 1562x820 from the built site and
// scaled to 1200x630, the size link previews use.
// Run with the preview server up: npm run build && npm run preview, then
// node scripts/og-images.mjs [base URL]. Writes public/og/<name>.jpg.
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://localhost:4322';
const pages = {
  home: '/',
  andon: '/projects/andon/',
  'image-stitcher': '/projects/image-stitcher/',
  about: '/about/',
  resume: '/resume/',
  photography: '/photography/',
};

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1562, height: 820 }, reducedMotion: 'reduce' });
for (const [name, path] of Object.entries(pages)) {
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  // The menu is noise at thumbnail size; the name stays.
  await page.addStyleTag({ content: '.site-head nav { display: none !important; }' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot();
  await sharp(png).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/og/${name}.jpg`);
  await page.close();
  console.log(name);
}
await browser.close();
