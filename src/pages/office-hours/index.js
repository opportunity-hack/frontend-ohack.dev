import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  CalendarMonthRounded,
  ForumRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import { initFacebookPixel } from "../../lib/ga";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Arrow,
} from "../../components/design/refined";

const SLACK_HUDDLE_URL =
  "https://opportunity-hack.slack.com/archives/C1Q6YHXQU";
const CAL_EMBED_SRC =
  "https://calendar.google.com/calendar/embed?src=c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com";
const CAL_ICAL_URL =
  "https://calendar.google.com/calendar/ical/c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com/public/basic.ics";

const WHAT_TO_EXPECT = [
  {
    title: "Get unstuck, fast",
    desc: "Bring a bug, a design question, or a blank screen. We'll work through it with you live.",
  },
  {
    title: "All experience levels",
    desc: "Students, bootcamp grads, and seasoned engineers all drop in. No question is too basic.",
  },
  {
    title: "Real nonprofit projects",
    desc: "Guidance on the actual code you're writing for the nonprofits we support.",
  },
];

export default function OfficeHoursPage({ title, openGraphData, structuredData }) {
  // Instagram embed genuinely needs the client; keep it lazy + SSR-off.
  const InstagramEmbed = dynamic(
    () => import("react-social-media-embed").then((mod) => mod.InstagramEmbed),
    { ssr: false }
  );

  useEffect(() => {
    // Idempotent shared helper (see CLAUDE.md CWV rule) — never call
    // ReactPixel.init directly.
    initFacebookPixel();
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        {openGraphData.map((og) => (
          <meta key={og.key} {...og} />
        ))}
        <link rel="canonical" href="https://www.ohack.dev/office-hours" />
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        )}
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 44px)",
          }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Free developer office hours
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}
          >
            Get unstuck on your{" "}
            <span className="ohx-italic">nonprofit project.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}
          >
            Every Friday we open a Slack huddle in{" "}
            <strong>#general</strong> for anyone writing code for the nonprofits
            we support. Drop in for guidance, a second pair of eyes, or just to
            think out loud.
          </p>
          <div
            className="rise"
            style={{
              marginTop: 30,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              animationDelay: "230ms",
            }}
          >
            <a
              href={SLACK_HUDDLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn ohx-btn--primary"
            >
              Join the Slack huddle <Arrow />
            </a>
            <a
              href="https://slack.com/features/huddles"
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn ohx-btn--ghost"
            >
              <HelpOutlineRounded fontSize="small" /> What's a Slack huddle?
            </a>
          </div>
          <hr
            className="ohx-rule rise"
            style={{ marginTop: 44, animationDelay: "320ms" }}
          />
          <p
            className="ohx-muted rise"
            style={{
              marginTop: 22,
              animationDelay: "380ms",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CalendarMonthRounded fontSize="small" style={{ color: "var(--accent)" }} />
            Every Friday, 12–1pm PT
          </p>
        </section>

        {/* WHAT TO EXPECT */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(48px, 7vh, 80px)",
              paddingBottom: "clamp(48px, 7vh, 80px)",
            }}
          >
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
              Show up with anything.
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}
            >
              Most of our volunteers are working professionals, so we host during
              the Friday lunch break — informal, friendly, and useful.
            </p>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {WHAT_TO_EXPECT.map((item) => (
                <div
                  key={item.title}
                  className="ohx-card"
                  style={{ padding: 24, background: "var(--surface)" }}
                >
                  <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>
                    {item.title}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "8px 0 0",
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCHEDULE */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(48px, 7vh, 80px)",
            paddingBottom: "clamp(40px, 6vh, 64px)",
          }}
        >
          <Eyebrow>The schedule</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
            Add it to your calendar.
          </h2>

          <div
            className="ohx-card"
            style={{ padding: 8, overflow: "hidden", lineHeight: 0 }}
          >
            <div
              style={{
                width: "100%",
                height: "clamp(460px, 60vh, 600px)",
                position: "relative",
              }}
            >
              <iframe
                title="Opportunity Hack office hours calendar"
                src={CAL_EMBED_SRC}
                style={{
                  border: 0,
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  borderRadius: 6,
                }}
                loading="lazy"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <a
              href={CAL_ICAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn ohx-btn--ghost"
            >
              <CalendarMonthRounded fontSize="small" /> Subscribe (iCal)
            </a>
            <a
              href={SLACK_HUDDLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn ohx-btn--ghost"
            >
              <ForumRounded fontSize="small" /> Open #general in Slack
            </a>
          </div>

          <p className="ohx-muted" style={{ marginTop: 22, maxWidth: "60ch" }}>
            Can't make the scheduled time? Reach out in the Slack channel and
            we'll do our best to find a slot that works for you.
          </p>
        </section>

        {/* SOCIAL PROOF */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(48px, 7vh, 80px)",
              paddingBottom: "clamp(48px, 7vh, 80px)",
            }}
          >
            <Eyebrow>From the community</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
              See what it's like.
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                maxWidth: 500,
                margin: "0 auto",
                minHeight: 500,
              }}
            >
              <InstagramEmbed
                url="https://www.instagram.com/p/CqFz5PWB9Og/"
                width="100%"
              />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(44px, 6vh, 72px)",
              paddingBottom: "clamp(44px, 6vh, 72px)",
              textAlign: "center",
            }}
          >
            <h2 className="ohx-display" style={{ color: "#fff" }}>
              Ready to make an impact?
            </h2>
            <p
              style={{
                margin: "14px auto 28px",
                maxWidth: "48ch",
                color: "rgba(255,255,255,0.85)",
                fontSize: "1.05rem",
              }}
            >
              Join the community, then drop into office hours any Friday. We'd
              love to help you ship something that matters.
            </p>
            <a
              href={SLACK_HUDDLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn"
              style={{ background: "#fff", color: "var(--brand)" }}
            >
              Join us on Slack <Arrow />
            </a>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}

export const getStaticProps = async ({ params = {} } = {}) => {
  const title =
    "Code for Social Good: Free Developer Office Hours | Opportunity Hack";
  const metaDescription =
    "Join our free weekly developer office hours to code for social good. Get mentorship, improve your coding skills, and help nonprofits. Perfect for students, bootcamp graduates, and experienced developers looking to make a social impact through technology.";
  const image = "https://cdn.ohack.dev/ohack.dev/officehours.webp";

  // Schema.org structured data for events
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Schedule",
    scheduleTimezone: "America/Phoenix",
    eventSchedule: {
      "@type": "Schedule",
      byDay: ["Friday"],
      startTime: "12:00",
      endTime: "15:00",
      repeatFrequency: "P1W",
      scheduleTimezone: "America/Phoenix",
    },
    subEvent: {
      "@type": "Event",
      name: "Opportunity Hack Developer Office Hours",
      description:
        "Free mentorship and guidance for developers working on nonprofit projects",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      organizer: {
        "@type": "Organization",
        name: "Opportunity Hack",
        url: "https://www.ohack.dev",
      },
    },
  };

  return {
    props: {
      title,
      openGraphData: [
        { name: "title", content: title, key: "title" },
        { property: "og:title", content: title, key: "ogtitle" },
        { name: "description", content: metaDescription, key: "desc" },
        { property: "og:description", content: metaDescription, key: "ogdesc" },
        { property: "og:type", content: "website", key: "website" },
        { property: "og:image", content: image, key: "ogimage" },
        { property: "twitter:image", content: image, key: "twitterimage" },
        { property: "og:site_name", content: "Opportunity Hack Developer Portal", key: "ogsitename" },
        { property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { property: "twitter:domain", content: "ohack.dev", key: "twitterdomain" },
        { property: "twitter:label1", value: "Free Developer Office Hours", key: "twitterlabel1" },
        { property: "twitter:data1", value: "Every Friday - Learn, Code, Make Impact", key: "twitterdata1" },
        { name: "keywords", content: "code for social good, developer mentorship, nonprofit coding, tech volunteering, learn to code, social impact coding, free developer help, programming mentorship, tech for good, coding office hours", key: "keywords" },
        { name: "author", content: "Opportunity Hack", key: "author" },
        { property: "article:publisher", content: "https://www.linkedin.com/company/opportunity-hack", key: "publisher" },
        { property: "og:locale", content: "en_US", key: "locale" },
        { name: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
        { name: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { property: "og:url", content: "https://www.ohack.dev/office-hours", key: "ogurl" },
        { property: "og:image:alt", content: "Opportunity Hack Developer Office Hours - Code for Social Good", key: "ogimagealt" },
      ],
      structuredData: JSON.stringify(structuredData),
    },
  };
};
