// The sitemap, listing every page except the 404.
import type { APIRoute } from 'astro';

const paths = ['/', '/tour/', '/projects/andon/', '/projects/image-stitcher/', '/projects/lloyd/', '/projects/dose-coach/', '/about/', '/resume/', '/photography/'];

export const GET: APIRoute = ({ site }) => {
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
