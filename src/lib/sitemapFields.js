/**
 * Pure builder for the `/server-sitemap.xml` field list.
 *
 * Each input is the RAW API response for that resource (or null/undefined
 * when the fetch failed) — never a pre-shaped array. Keeping this pure and
 * separate from the page lets it be unit-tested without a network mock.
 *
 * Shapes (verified against the backend):
 *   hackathons: { hackathons: [...] }
 *   news:       { text: [...], metadata }      <-- NOT { news: [...] }
 *   portfolios: { portfolios: [{ slug, ... }] }
 *   jobs:       { listings: [{ slug, ... }] }
 *
 * Nonprofit pages are intentionally NOT emitted here — /nonprofit/[id] is
 * noindex (see next-sitemap.config.js exclude list).
 */
export function buildSitemapFields({ hackathons, news, portfolios, jobs, baseUrl, now } = {}) {
  const fields = [];
  const nowIso = now || new Date().toISOString();

  const hackathonList = Array.isArray(hackathons?.hackathons) ? hackathons.hackathons : [];
  for (const h of hackathonList) {
    const id = h?.event_id || h?.id;
    if (id) {
      fields.push({ loc: `${baseUrl}/hack/${id}`, lastmod: nowIso, priority: "0.8", changefreq: "weekly" });
    }
  }

  const newsList = Array.isArray(news?.text) ? news.text : [];
  for (const n of newsList) {
    const id = n?.id || n?.slack_ts;
    if (!id) continue;

    let lastmod = nowIso;
    const publishedMs = n?.published_at ? Date.parse(n.published_at) : NaN;
    if (Number.isFinite(publishedMs)) {
      lastmod = new Date(publishedMs).toISOString();
    } else {
      const slackTsMs = n?.slack_ts ? parseFloat(n.slack_ts) * 1000 : NaN;
      if (Number.isFinite(slackTsMs)) {
        lastmod = new Date(slackTsMs).toISOString();
      }
    }

    fields.push({ loc: `${baseUrl}/blog/${id}`, lastmod, priority: "0.5", changefreq: "monthly" });
  }

  const portfolioList = Array.isArray(portfolios?.portfolios) ? portfolios.portfolios : [];
  for (const p of portfolioList) {
    if (p?.slug) {
      fields.push({ loc: `${baseUrl}/u/${p.slug}`, lastmod: nowIso, priority: "0.6", changefreq: "weekly" });
    }
  }

  const jobList = Array.isArray(jobs?.listings) ? jobs.listings : [];
  for (const l of jobList) {
    if (l?.slug) {
      fields.push({ loc: `${baseUrl}/jobs/${l.slug}`, lastmod: nowIso, priority: "0.8", changefreq: "weekly" });
    }
  }

  return fields;
}
