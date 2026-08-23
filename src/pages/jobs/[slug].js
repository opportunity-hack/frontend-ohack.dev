import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";
import { useAuthInfo, useRedirectFunctions } from "@propelauth/react";
import ReactMarkdown from "react-markdown";

import ReCaptchaProvider from "../../components/ReCaptchaProvider";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { RefinedRoot, Eyebrow, Stat, Arrow } from "../../components/design/refined";
import { eventMarkdownSx } from "../../components/ApplicationForm/refinedStyles";
import ShareRow from "../../components/Jobs/ShareRow";

const JobApplicationForm = dynamic(
  () => import("../../components/Jobs/JobApplicationForm"),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: 320 }} />,
  },
);

const OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

const LOCATION_LABELS = {
  remote: "Remote",
  phoenix_in_person: "Phoenix, AZ",
  hybrid: "Remote-friendly",
};

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "22px 20px",
};

// The apply section's auth gate. The whole app is wrapped in AuthProvider
// (_app.js), so useAuthInfo works here without a page-level RequiredAuthProvider
// — which would hide the public listing content from crawlers and sharers.
const ApplySection = ({ listing }) => {
  const { loading, isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: "var(--brand)" }} />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ ...cardStyle, padding: "30px 28px", maxWidth: 640 }}>
        <h3
          style={{
            fontFamily: "var(--display)",
            fontSize: 24,
            fontWeight: 500,
            margin: "0 0 10px",
          }}
        >
          Log in to apply
        </h3>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 20, lineHeight: 1.65 }}>
          Applying takes an ohack.dev account (free — most people use Google).
          Your draft autosaves, and your resume and video uploads are tied to
          your account so only our review team can act on them.
        </p>
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          style={{ cursor: "pointer" }}
          onClick={() => {
            trackEvent({
              action: "job_app_login_click",
              params: { event_label: listing.slug, page: "job_detail" },
            });
            redirectToLoginPage({
              postLoginRedirectUrl: `${window.location.origin}/jobs/${listing.slug}#apply`,
            });
          }}
        >
          Log in / create account <Arrow />
        </button>
      </div>
    );
  }

  return <JobApplicationForm listing={listing} />;
};

const JobDetailPage = ({ listing }) => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const isClosed = listing.status === "closed";
  const canonical = `https://www.ohack.dev/jobs/${listing.slug}`;
  const locationShort = LOCATION_LABELS[listing.location_type] || "Remote";

  return (
    <>
      <Head>
        <meta name="robots" content="index, follow" />
      </Head>

      <RefinedRoot>
        {/* ---------------- MASTHEAD ---------------- */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: "clamp(104px, 13vh, 148px)", paddingBottom: "clamp(24px, 4vh, 40px)" }}
        >
          <div className="rise">
            <p style={{ margin: "0 0 18px" }}>
              <Link href="/jobs" className="ohx-link">
                ← All volunteer roles
              </Link>
            </p>
            <Eyebrow>Volunteer role · Opportunity Hack</Eyebrow>
            <h1 className="ohx-display" style={{ maxWidth: "20ch", marginTop: 10 }}>
              {listing.title}
            </h1>
            <p className="ohx-lead" style={{ marginTop: 16, maxWidth: "58ch" }}>
              {listing.summary}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 14,
                marginTop: 28,
                maxWidth: 620,
              }}
            >
              <div style={cardStyle}>
                <Stat value={listing.hours_per_week_label || "—"} label="hours / week" />
              </div>
              <div style={cardStyle}>
                <Stat value={locationShort} label={listing.location_label || "location"} />
              </div>
              <div style={cardStyle}>
                <Stat value="Unpaid" label="volunteer · real references" />
              </div>
            </div>

            {isClosed ? (
              <div
                style={{
                  ...cardStyle,
                  marginTop: 28,
                  maxWidth: 640,
                  background: "var(--surface-2)",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>
                  This role is no longer accepting applications.
                </p>
                <p className="ohx-muted" style={{ margin: "8px 0 14px" }}>
                  Thanks for your interest — check the other open roles, or join
                  our Slack to hear about the next one first.
                </p>
                <Link className="ohx-btn ohx-btn--ghost" href="/jobs">
                  See open roles
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28 }}>
                <a
                  className="ohx-btn ohx-btn--primary"
                  href="#apply"
                  onClick={() =>
                    trackEvent({
                      action: "click_job_detail",
                      params: { event_label: listing.slug, button: "hero_apply" },
                    })
                  }
                >
                  Apply for this role <Arrow />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ---------------- DESCRIPTION ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(24px, 4vh, 40px)", paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Box sx={{ ...eventMarkdownSx, mt: 0, maxWidth: "70ch", fontSize: 17 }}>
            <ReactMarkdown>{listing.description_markdown || ""}</ReactMarkdown>
          </Box>

          <p className="ohx-muted" style={{ marginTop: 28, maxWidth: "70ch" }}>
            Commitment: <strong style={{ color: "var(--ink)" }}>{listing.duration_ask}</strong>
          </p>
        </section>

        {/* ---------------- HOW APPLYING WORKS + SHARE ---------------- */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 64px)", paddingBottom: "clamp(40px, 6vh, 64px)" }}>
            <Eyebrow>Before you start</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
              The application takes ~30 minutes — <span className="ohx-italic">on purpose.</span>
            </h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "58ch" }}>
              It includes a role-specific work sample and a two-minute video
              answering prompts on camera. That&apos;s our filter for AI-written
              and copy-paste applications — and your preview of the actual job.
              Phone camera is perfect.
            </p>
            <ShareRow
              heading="Know someone perfect for this? Send it their way:"
              url={canonical}
              title={listing.title}
              slug={listing.slug}
            />
          </div>
        </section>

        {/* ---------------- APPLY ---------------- */}
        {!isClosed && (
          <section
            id="apply"
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(40px, 6vh, 64px)",
              paddingBottom: "clamp(56px, 9vh, 104px)",
              scrollMarginTop: 96,
            }}
          >
            <Eyebrow>Apply</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
              Your first task starts here.
            </h2>
            <div style={{ maxWidth: 860 }}>
              <ApplySection listing={listing} />
            </div>
          </section>
        )}
      </RefinedRoot>
    </>
  );
};

export default function JobDetailPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <JobDetailPage {...props} />
    </ReCaptchaProvider>
  );
}

export async function getStaticPaths() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/jobs`);
    const data = res.ok ? await res.json() : { listings: [] };
    return {
      paths: (data.listings || []).map((l) => ({ params: { slug: l.slug } })),
      fallback: "blocking",
    };
  } catch (e) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/jobs/${params.slug}`,
  );
  if (res.status === 404) {
    return { notFound: true, revalidate: 60 };
  }
  if (!res.ok) {
    // Rethrow so ISR keeps the last good version on backend blips
    throw new Error(`GET /api/jobs/${params.slug} failed: ${res.status}`);
  }
  const listing = await res.json();
  if (!listing || !listing.slug) {
    return { notFound: true, revalidate: 60 };
  }

  const canonical = `https://www.ohack.dev/jobs/${listing.slug}`;
  const title = `${listing.title} — Volunteer at Opportunity Hack`;
  const description = listing.summary || "";
  const isPhoenix = listing.location_type === "phoenix_in_person";

  const jobPosting = {
    "@type": "JobPosting",
    title: listing.title,
    description: `<p>${listing.summary}</p>\n${listing.description_markdown || ""}`,
    employmentType: "VOLUNTEER",
    directApply: true,
    hiringOrganization: {
      "@type": "Organization",
      name: "Opportunity Hack",
      sameAs: "https://www.ohack.dev",
      logo: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
    },
    ...(isPhoenix
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Tempe",
              addressRegion: "AZ",
              addressCountry: "US",
            },
          },
        }
      : {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            name: "United States",
          },
        }),
  };
  // Next.js props must be JSON-serializable — never assign undefined
  const datePosted = (listing.posted_at || "").slice(0, 10);
  if (datePosted) jobPosting.datePosted = datePosted;
  if (listing.valid_through) jobPosting.validThrough = listing.valid_through;

  return {
    props: {
      listing,
      title,
      description,
      canonical,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "description", property: "description", content: description, key: "description" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: OG_IMAGE, key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: canonical, key: "url" },
        { name: "og:url", property: "og:url", content: canonical, key: "ogurl" },
        { property: "og:type", content: "website", key: "ogtype" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: OG_IMAGE, key: "twitterimage" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          jobPosting,
          {
            "@type": "WebPage",
            "@id": canonical + "#webpage",
            url: canonical,
            name: title,
            description,
            isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "Volunteer Jobs", item: "https://www.ohack.dev/jobs" },
              { "@type": "ListItem", position: 3, name: listing.title, item: canonical },
            ],
          },
        ],
      },
    },
    revalidate: 300,
  };
}
