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

async function fetchPortfolio(param) {
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  if (!apiBase || !param) return null;
  try {
    const res = await fetch(
      `${apiBase}/api/users/${encodeURIComponent(param)}/profile/public`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function buildPortfolioServerSideProps({ param, res, route }) {
  const profile = await fetchPortfolio(param);

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
