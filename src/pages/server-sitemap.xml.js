import { getServerSideSitemapLegacy } from 'next-sitemap';
import { buildSitemapFields } from '../lib/sitemapFields';

const BASE_URL = 'https://www.ohack.dev';
const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchOrNull(url, label) {
  try {
    return await fetchJson(url);
  } catch (e) {
    console.error(`[server-sitemap] ${label} fetch failed:`, e.message);
    return null;
  }
}

export async function getServerSideProps(ctx) {
  const now = new Date().toISOString();

  // Nonprofit pages are intentionally NOT fetched here — /nonprofit/[id] is
  // noindex (see next-sitemap.config.js exclude list).
  const [hackathons, news, portfolios, jobs] = await Promise.all([
    fetchOrNull(`${API_URL}/api/messages/hackathons`, 'hackathons'),
    fetchOrNull(`${API_URL}/api/messages/news?limit=200`, 'news'),
    fetchOrNull(`${API_URL}/api/users/portfolio/sitemap`, 'portfolios'),
    fetchOrNull(`${API_URL}/api/jobs`, 'jobs'),
  ]);

  const fields = buildSitemapFields({ hackathons, news, portfolios, jobs, baseUrl: BASE_URL, now });

  ctx.res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return getServerSideSitemapLegacy(ctx, fields);
}

// Default export required by Next.js but unused for XML routes
export default function SitemapIndex() {}
