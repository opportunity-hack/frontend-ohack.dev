import React from "react";
import PublicProfile from "../../components/Profile/PublicProfile";
import { buildPortfolioServerSideProps } from "../../lib/portfolioPage";

/**
 * /profile/<db-id> — legacy public profile URL. Keeps working forever, but:
 *   - public portfolios with a slug 307 to their canonical /u/<slug> URL
 *   - this route always emits noindex (the /u/ route is the indexable one)
 *
 * Server-rendered (was ssr:false — crawlers used to see a loading shell).
 */
export default function PublicProfilePage({ userid, profile }) {
  return <PublicProfile userid={userid} initialData={profile} />;
}

export async function getServerSideProps({ params, res }) {
  return buildPortfolioServerSideProps({
    param: params?.userid || "",
    res,
    route: "profile",
  });
}
