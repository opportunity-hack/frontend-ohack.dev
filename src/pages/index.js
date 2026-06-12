import React, { Fragment, useEffect, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Box, Skeleton } from "@mui/material";
import { useAuthInfo } from "@propelauth/react";
import { format, getYear } from "date-fns";

import useHackathonEvents from "../hooks/use-hackathon-events";
import { useEnv } from "../context/env.context";
import { parseLocalDate, isValidDate } from "../lib/dateUtils";
import * as ga from "../lib/ga";
import { sponsors } from "../data/sponsorData";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Stat,
  Arrow,
} from "../components/design/refined";

// Newsletter form is kept (it's a real conversion surface) but rendered inside
// a calm band rather than competing with the hero.
const LeadForm = dynamic(() => import("../components/LeadForm/LeadForm"), {
  ssr: true,
  loading: () => <Box sx={{ minHeight: 120 }} />,
});

const HERO_STATS = [
  { value: "3,000+", label: "Developers" },
  { value: "200+", label: "Nonprofits" },
  { value: "Since 2013", label: "12 years" },
];

// --- A single, quiet upcoming-event card (no progress rings, no chip wall) ---
function EventCardRefined({ event, delay = 0 }) {
  const { title, description, event_id, type, location, start_date, end_date, nonprofits } = event;

  let dateLabel = null;
  if (isValidDate(start_date) && isValidDate(end_date)) {
    const sameYear = getYear(parseLocalDate(start_date)) === getYear(parseLocalDate(end_date));
    dateLabel = `${format(parseLocalDate(start_date), "MMM d")} – ${format(
      parseLocalDate(end_date),
      sameYear ? "MMM d, yyyy" : "MMM d, yyyy"
    )}`;
  }

  return (
    <Link
      href={`/hack/${event_id}`}
      className="ohx-card rise"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "26px 26px 24px",
        textDecoration: "none",
        color: "inherit",
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        {dateLabel && <span className="ohx-eyebrow">{dateLabel}</span>}
        {type && <span className="ohx-tag">{type}</span>}
      </div>
      <h3 className="ohx-display" style={{ fontSize: "1.4rem" }}>
        {title}
      </h3>
      {description && (
        <p
          className="ohx-muted"
          style={{
            margin: 0,
            fontSize: "0.98rem",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      )}
      <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span className="ohx-faint" style={{ fontSize: "0.85rem" }}>
          {location || "Location TBA"}
          {nonprofits?.length ? ` · ${nonprofits.length} nonprofit${nonprofits.length === 1 ? "" : "s"}` : ""}
        </span>
        <span className="ohx-link" style={{ fontSize: "0.92rem" }}>
          Details <Arrow />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { isLoggedIn } = useAuthInfo();
  const { slackSignupUrl } = useEnv();
  const { hackathons, loading } = useHackathonEvents("current");

  useEffect(() => {
    ga.initFacebookPixel();
    ga.trackContentEngagement(
      "home_page",
      "hero_banner",
      ga.EventAction.VIEW,
      { has_feature_enabled: false }
    );
  }, []);

  const track = useCallback((id, text, params = {}) => {
    ga.trackStructuredEvent(ga.EventCategory.NAVIGATION, ga.EventAction.CLICK, id, null, {
      button_text: text,
      ...params,
    });
  }, []);

  const joinSlack = useCallback(() => {
    track("slack_signup_button", "Join our Slack");
    ga.trackJourneyStep("volunteer", "join_slack", { source: "hero" });
    if (slackSignupUrl) window.open(slackSignupUrl, "_blank", "noopener noreferrer");
  }, [slackSignupUrl, track]);

  const topSponsors = sponsors.slice(0, 8);

  return (
    <Fragment>
      <Head>
        <title>
          Opportunity Hack — Hackathons Where Developers Build Free Software for Nonprofits
        </title>
        <meta
          name="description"
          content="Since 2013, Opportunity Hack has connected 3,000+ developers with 200+ nonprofits to build free software for social good. Join our annual hackathon at ASU."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* ---------------- HERO ---------------- */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: "clamp(104px, 14vh, 168px)", paddingBottom: "clamp(40px, 7vh, 80px)" }}
        >
          <Eyebrow style={{ animationDelay: "0ms" }}>
            <span className="rise" style={{ display: "inline-block", animationDelay: "0ms" }}>
              Opportunity Hack · since 2013
            </span>
          </Eyebrow>

          <h1 className="ohx-display rise" style={{ marginTop: 20, maxWidth: "16ch", animationDelay: "60ms" }}>
            Free software for nonprofits,{" "}
            <span className="ohx-italic">built by developers.</span>
          </h1>

          <p className="ohx-lead rise" style={{ marginTop: 26, animationDelay: "160ms" }}>
            Each year, thousands of engineers, designers, and students team up to ship
            real tools that nonprofits actually use — at our hackathons and all year round.
          </p>

          <div
            className="rise"
            style={{ marginTop: 34, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "240ms" }}
          >
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--primary"
              onClick={() => track("view_events_button", "See upcoming events", { destination: "hack" })}
            >
              See upcoming events <Arrow />
            </Link>
            <button type="button" className="ohx-btn ohx-btn--ghost" onClick={joinSlack}>
              Join our Slack
            </button>
          </div>

          <hr className="ohx-rule rise" style={{ marginTop: 56, animationDelay: "320ms" }} />

          <div
            className="rise"
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(32px, 6vw, 72px)",
              animationDelay: "380ms",
            }}
          >
            {HERO_STATS.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </section>

        {/* ---------------- UPCOMING EVENTS ---------------- */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(48px, 8vh, 96px)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div>
              <Eyebrow>What&apos;s next</Eyebrow>
              <h2 className="ohx-display" style={{ marginTop: 8 }}>
                Upcoming events
              </h2>
            </div>
            <Link href="/hack" className="ohx-link" style={{ paddingBottom: 6 }}>
              All hackathons <Arrow />
            </Link>
          </div>

          {/* min-height reserves space so the async fetch doesn't shift layout */}
          <Box sx={{ minHeight: { xs: 0, md: 230 } }}>
            {loading ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {[0, 1].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={210}
                    sx={{ borderRadius: "8px", bgcolor: "rgba(22,24,29,0.05)" }}
                  />
                ))}
              </div>
            ) : hackathons && hackathons.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {hackathons.map((event, i) => (
                  <EventCardRefined key={event.event_id || event.id} event={event} delay={i * 80} />
                ))}
              </div>
            ) : (
              <div
                className="ohx-card"
                style={{ padding: "40px 28px", textAlign: "center" }}
              >
                <p className="ohx-muted" style={{ margin: 0 }}>
                  No events on the calendar right now.
                </p>
                <Link href="/hack" className="ohx-link" style={{ marginTop: 12 }}>
                  Browse past hackathons <Arrow />
                </Link>
              </div>
            )}
          </Box>
        </section>

        {/* ---------------- TWO PATHS (replaces the scattered CTAs) ---------------- */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
            <Eyebrow>Get involved</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 36 }}>
              Two ways in
            </h2>
            <div
              style={{
                display: "grid",
                gap: "clamp(28px, 5vw, 64px)",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              <div>
                <h3 className="ohx-display">For developers &amp; volunteers</h3>
                <p className="ohx-muted" style={{ marginTop: 10, maxWidth: "42ch" }}>
                  Sharpen your craft on software that matters. Pick a project, join a
                  team, and ship something a nonprofit will rely on for years.
                </p>
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 24 }}>
                  <Link href="/projects" className="ohx-link" onClick={() => track("all_projects_button", "Browse projects")}>
                    Browse projects <Arrow />
                  </Link>
                  <button type="button" className="ohx-link" style={{ background: "none", border: 0, cursor: "pointer", font: "inherit", padding: 0 }} onClick={joinSlack}>
                    Join our Slack <Arrow />
                  </button>
                  <Link href="/hackathon-for-social-good" className="ohx-link">
                    About our hackathons <Arrow />
                  </Link>
                  <Link href="/hackathons/arizona" className="ohx-link">
                    Arizona events <Arrow />
                  </Link>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <h3 className="ohx-display">For nonprofits</h3>
                <p className="ohx-muted" style={{ marginTop: 10, maxWidth: "42ch" }}>
                  Have a problem technology could solve? Tell us about it. We&apos;ll
                  match it with a team of builders — at no cost to your organization.
                </p>
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 24 }}>
                  <Link
                    href="/nonprofits/apply"
                    className="ohx-link"
                    onClick={() => track("nonprofit_apply_button", "Submit a project")}
                  >
                    Submit a project <Arrow />
                  </Link>
                  <Link href="/coding-for-nonprofits" className="ohx-link">
                    How it works <Arrow />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- NEWSLETTER ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(40px, 6vh, 72px)" }}>
          <div className="ohx-narrow" style={{ marginInline: "auto", textAlign: "center" }}>
            <Eyebrow>Stay in the loop</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>
              A little inbox inspiration
            </h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 24 }}>
              Occasional updates on upcoming events, project wins, and ways to help.
            </p>
            <LeadForm bare />
          </div>
        </section>

        {/* ---------------- SPONSORS (quiet, desaturated) ---------------- */}
        <section
          className="ohx-wrap ohx-sponsors"
          style={{ paddingTop: 8, paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}
        >
          <Eyebrow>Made possible by</Eyebrow>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(28px, 5vw, 56px)",
            }}
          >
            {topSponsors.map((s) => (
              <Image
                key={s.name}
                src={s.logo}
                alt={s.name}
                width={96}
                height={40}
                style={{ width: "auto", height: 36, objectFit: "contain" }}
              />
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link href="/sponsor" className="ohx-link">
              Become a sponsor <Arrow />
            </Link>
          </div>
        </section>
      </RefinedRoot>
    </Fragment>
  );
}

export async function getStaticProps() {
  const title =
    "Opportunity Hack — Hackathons Where Developers Build Free Software for Nonprofits";
  const metaDescription =
    "Since 2013, Opportunity Hack has connected 3,000+ developers with 200+ nonprofits to build free software for social good. Join our annual hackathon at ASU.";

  return {
    props: {
      title,
      openGraphData: [
        { name: "title", content: title, key: "title" },
        { property: "og:title", content: title, key: "ogtitle" },
        { name: "description", content: metaDescription, key: "desc" },
        { property: "og:description", content: metaDescription, key: "ogdesc" },
        { property: "og:type", content: "website", key: "website" },
        {
          property: "og:image",
          content: "https://i.imgur.com/xYrA32J.png",
          key: "ogimage",
        },
        {
          property: "twitter:image",
          content: "https://i.imgur.com/xYrA32J.png",
          key: "twitterimage",
        },
        {
          property: "og:site_name",
          content: "Opportunity Hack Developer Portal",
          key: "ogsitename",
        },
        {
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard",
        },
        {
          property: "twitter:domain",
          content: "ohack.dev",
          key: "twitterdomain",
        },
      ],
    },
  };
}
