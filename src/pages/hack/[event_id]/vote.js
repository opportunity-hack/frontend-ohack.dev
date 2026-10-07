import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Skeleton } from "@mui/material";
import { RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import { Shell } from "../../../components/Teams/RefinedTeamShell";

// The whole voting experience is client-only: it always needs a logged-in
// hacker's own slate (never anything worth pre-rendering for crawlers), and
// the page is noindex anyway — see manageteam.js for the same
// RequiredAuthProvider + SSR-guarded-redirect shell this mirrors.
const PeerVotePage = dynamic(
  () => import("../../../components/PeerVote/PeerVotePage"),
  {
    ssr: false,
    loading: () => (
      <Shell>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      </Shell>
    ),
  },
);

export default function HackersChoiceVotePage() {
  const router = useRouter();
  const { event_id } = router.query;

  // Same SSR `window` guard as manageteam.js (L1044-1047): `window` doesn't
  // exist during server render, so `currentUrl` only resolves client-side.
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/vote`
      : null;

  return (
    <>
      <Head>
        <title>Hackers&apos; Choice vote | Opportunity Hack</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={
              currentUrl ||
              (typeof window !== "undefined" ? window.location.href : undefined)
            }
          />
        }
      >
        <PeerVotePage />
      </RequiredAuthProvider>
    </>
  );
}
