import React from "react";
import Head from "next/head";
import Link from "next/link";
import { RefinedRoot } from "../components/design/refined";

// Static server-error page (Next renders it for getStaticProps/getServerSideProps
// throws and other SSR failures). Deliberately no data fetching, no auth and
// no router use so it can never fail itself; noindex so a transient outage
// is never indexed. Client-side render errors go to components/ErrorBoundary.
export default function Custom500() {
  return (
    <RefinedRoot>
      <Head>
        <title>Something went wrong · Opportunity Hack</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(64px, 12vh, 120px)",
          paddingBottom: "clamp(64px, 12vh, 120px)",
          textAlign: "center",
        }}
      >
        <p className="ohx-eyebrow">Error 500</p>
        <h1 className="ohx-display" style={{ marginBottom: 16 }}>
          Something went wrong.
        </h1>
        <p className="ohx-lead" style={{ marginInline: "auto", marginBottom: 32 }}>
          Our servers had a hiccup. Please try again in a minute.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="" className="ohx-btn ohx-btn--primary">
            Reload this page
          </a>
          <Link href="/" className="ohx-btn ohx-btn--ghost">
            Go to the homepage
          </Link>
        </div>
      </section>
    </RefinedRoot>
  );
}
