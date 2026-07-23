import { getServerSideSitemapLegacy } from 'next-sitemap';

const BASE_URL = 'https://www.ohack.dev';
const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export async function getServerSideProps(ctx) {
  const fields = [];
  const now = new Date().toISOString();

  // Hackathon event pages
  try {
    const data = await fetchJson(`${API_URL}/api/messages/hackathons`);
    const hackathons = data.hackathons || data || [];
    for (const h of hackathons) {
      const id = h.event_id || h.id;
      if (id) fields.push({ loc: `${BASE_URL}/hack/${id}`, lastmod: now, priority: '0.8', changefreq: 'weekly' });
    }
  } catch (e) {
    console.error('[server-sitemap] hackathons fetch failed:', e.message);
  }

  // Nonprofit pages
  try {
    const data = await fetchJson(`${API_URL}/api/messages/npos`);
    const npos = data.nonprofits || data || [];
    for (const n of npos) {
      const id = n.id || n.nonprofit_id;
      if (id) fields.push({ loc: `${BASE_URL}/nonprofit/${id}`, lastmod: now, priority: '0.6', changefreq: 'monthly' });
    }
  } catch (e) {
    console.error('[server-sitemap] npos fetch failed:', e.message);
  }

  // Blog / news pages
  try {
    const data = await fetchJson(`${API_URL}/api/messages/news?limit=200`);
    const news = data.news || data || [];
    for (const n of news) {
      const id = n.id || n.slack_ts;
      if (!id) continue;
      const ts = n.slack_ts ? parseFloat(n.slack_ts) * 1000 : null;
      const lastmod = ts && !isNaN(ts) ? new Date(ts).toISOString() : now;
      fields.push({ loc: `${BASE_URL}/blog/${id}`, lastmod, priority: '0.5', changefreq: 'monthly' });
    }
  } catch (e) {
    console.error('[server-sitemap] news fetch failed:', e.message);
  }

  ctx.res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return getServerSideSitemapLegacy(ctx, fields);
}

// Default export required by Next.js but unused for XML routes
export default function SitemapIndex() {}
