// Sharing images: the hero of each page, taken at 1562x820 from the built site and
// scaled to 1200x630, the size link previews use. Things that only make sense on a live
// page (link underlines, "click a name", content below the hero) are hidden first.
// Run with the preview server up: npm run build && npm run preview, then
// node scripts/og-images.mjs [base URL]. Writes public/og/<name>.jpg.
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://localhost:4322';
const W = 1562, H = 820;

const common = `
  .site-head nav, .skip { display: none !important; }
  a { text-decoration: none !important; }
  .site-foot { display: none !important; }
`;
// The project hero fills the image; everything after it is hidden.
const projectHero = `
  .top { min-height: ${H}px !important; }
  .proj > :not(.top) { display: none !important; }
`;

const pages = {
  home: { path: '/', css: '#main > :not(.hero) { display: none !important; }' },
  andon: { path: '/projects/andon/', css: projectHero },
  'image-stitcher': {
    path: '/projects/image-stitcher/',
    css: projectHero + `
      .top-text { max-width: 54%; margin-left: 0; }
      .top h1 { font-size: 104px !important; }
      .top .status { display: none !important; }
      .og-map { position: absolute; z-index: 2; right: 48px; top: 50%; width: 40%; transform: translateY(-50%); }`,
    // Put the 20-photo stage on the right: its stepped edges show what stitching is.
    async prepare(page) {
      await page.evaluate(() => {
        const src = document.querySelector('.grow-frame[data-n="20"] img').currentSrc;
        const img = Object.assign(document.createElement('img'), { src, className: 'og-map', alt: '' });
        document.querySelector('.top').append(img);
        return img.decode();
      });
    },
  },
  about: {
    path: '/about/',
    css: `
      .about { padding-top: 120px !important; padding-bottom: 0 !important; }
      .main > :not(h1):not(.lead) { display: none !important; }
      .side :is(picture, img) { max-height: 640px; width: auto !important; }
      .about-photo img { aspect-ratio: 4 / 5; height: 640px !important; }`,
  },
  resume: {
    path: '/resume/',
    css: `.cv section:nth-of-type(n+2) { display: none !important; } .cv { padding-top: 140px !important; }`,
  },
  photography: { path: '/photography/', css: '.end { display: none !important; }' },
};

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
for (const [name, { path, css, prepare }] of Object.entries(pages)) {
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: common + css });
  if (prepare) await prepare(page);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  const png = await page.screenshot();
  await sharp(png).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/og/${name}.jpg`);
  await page.close();
  console.log(name);
}
await browser.close();
