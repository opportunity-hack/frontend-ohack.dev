/**
 * Shared getServerSideProps builder for the two portfolio routes:
 *   /u/[slug]           — canonical vanity URL (indexable when opted in)
 *   /profile/[userid]   — legacy db-id URL (always noindex; redirects to /u/
 *                         when the profile is public and has a slug)
 *
 * The backend endpoint accepts either a db id or a slug and returns the
 * privacy-filtered portfolio payload including `id`, `profile_slug`, and
 * `profile_visibility`.
 */
import {
  SITE_URL,
  buildTitle,
  buildProfileOpenGraph,
  buildPersonJsonLd,
} from "./portfolioMeta";

// Returns the profile, or null on a genuine 404. Throws on any other
// upstream failure (429/5xx/network) — callers decide whether that is fatal.
async function fetchPortfolio(param) {
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  if (!apiBase || !param) return null;
  const res = await fetch(
    `${apiBase}/api/users/${encodeURIComponent(param)}/profile/public`,
    {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Upstream ${res.status} for portfolio ${param}`);
  return await res.json();
}

export async function buildPortfolioServerSideProps({ param, res, route }) {
  let profile;
  try {
    profile = await fetchPortfolio(param);
  } catch (err) {
    // /u/<slug>: a backend blip must render the 500 page, never a 404 (a
    // cached/crawled 404 would drop a live portfolio). /profile/<id> keeps
    // rendering without SSR data so the client-side fetch can recover.
    if (route === "u") throw err;
    profile = null;
  }

  if (res) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );
  }

  if (route === "u") {
    // /u/ only serves canonical slugs.
    if (!profile) return { notFound: true };
    if (!profile.profile_slug) {
      // No slug claimed (e.g. someone typed /u/<db-id>) — send to the id URL.
      const id = profile.id || param;
      return { redirect: { destination: `/profile/${id}`, permanent: false } };
    }
    if (profile.profile_slug !== param) {
      // Alias or differently-cased slug — canonicalize.
      return { redirect: { destination: `/u/${profile.profile_slug}`, permanent: false } };
    }
  }

  if (route === "profile" && profile?.profile_slug && profile?.profile_visibility === "public") {
    // Public portfolios live at their vanity URL. Private profiles are NOT
    // redirected — a db-id link must not leak the user's chosen slug.
    return { redirect: { destination: `/u/${profile.profile_slug}`, permanent: false } };
  }

  const canonical =
    route === "u"
      ? `${SITE_URL}/u/${param}`
      : profile?.profile_slug && profile?.profile_visibility === "public"
        ? `${SITE_URL}/u/${profile.profile_slug}`
        : `${SITE_URL}/profile/${param}`;

  const openGraphData = buildProfileOpenGraph(profile, canonical);
  if (route === "profile") {
    // The db-id route is never indexed (public ones redirect to /u/ above).
    const robots = openGraphData.find((t) => t.key === "robots");
    if (robots) robots.content = "noindex, nofollow";
  }

  const personJsonLd = buildPersonJsonLd(profile, canonical);

  return {
    props: {
      param,
      userid: profile?.id || param,
      profile,
      title: buildTitle(profile),
      canonical,
      openGraphData,
      ...(personJsonLd ? { structuredData: personJsonLd } : {}),
    },
  };
}
