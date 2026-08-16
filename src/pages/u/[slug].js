import React from "react";
import PublicProfile from "../../components/Profile/PublicProfile";
import { buildPortfolioServerSideProps } from "../../lib/portfolioPage";

/**
 * /u/<slug> — canonical vanity URL for a public portfolio.
 *
 * Server-rendered so crawlers and social scrapers see the full page (the old
 * profile page was ssr:false and served a "Loading profile…" shell). Meta
 * (title/canonical/openGraphData/structuredData) flows through _app.js.
 * Aliases and db-ids 307 to the canonical slug; profiles without a slug 307
 * to /profile/<id>.
 */
export default function VanityPortfolioPage({ userid, profile }) {
  return <PublicProfile userid={userid} initialData={profile} />;
}

export async function getServerSideProps({ params, res }) {
  return buildPortfolioServerSideProps({
    param: (params?.slug || "").toLowerCase(),
    res,
    route: "u",
  });
}
