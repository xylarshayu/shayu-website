import type { APIRoute } from 'astro';
import { asc, isNull } from 'drizzle-orm';
import { getDb } from '@db/index';
import { postTable } from '@db/schema';
import { cacheThis, CACHE_TAGS } from '@lib/utils';
import { SITE_URL } from '@lib/site';

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export const GET: APIRoute = async (context) => {
  const siteURL = context.site ?? SITE_URL;
  const db = getDb(context.locals.runtime.env.DB);
  const posts = await db
    .select({ slug: postTable.slug, date: postTable.date })
    .from(postTable)
    .where(isNull(postTable._deleted_at))
    .orderBy(asc(postTable.date));

  const entries = [
    { path: '/', lastmod: undefined },
    { path: '/info', lastmod: undefined },
    { path: '/search', lastmod: undefined },
    ...posts.map((post) => ({
      path: `/post/${post.slug}`,
      lastmod: post.date,
    })),
  ];

  const urls = entries.map(({ path, lastmod }) => `  <url>
    <loc>${escapeXml(new URL(path, siteURL).href)}</loc>${lastmod ? `
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
  </url>`).join('\n');

  const response = new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
  cacheThis(response, CACHE_TAGS.SITEMAP.TAG, 300, 86400);
  return response;
};
