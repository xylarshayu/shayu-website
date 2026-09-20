import type { APIRoute } from 'astro';
import { SITE_URL } from '@lib/site';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('/sitemap.xml', site ?? SITE_URL);
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /login/\n\nSitemap: ${sitemapURL.href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
