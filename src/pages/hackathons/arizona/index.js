import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@mui/material";
import Moment from "moment";

import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Stat,
  Arrow,
} from "../../../components/design/refined";

// Phoenix metro + Arizona detection — case-insensitive substring match.
const AZ_LOCATION_PATTERNS = [
  "arizona",
  "az ",
  " az",
  " az,",
  "asu",
  "tempe",
  "phoenix",
  "scottsdale",
  "mesa",
  "chandler",
  "gilbert",
  "glendale",
  "peoria",
  "polytechnic",
];
const isArizonaLocation = (loc) => {
  if (!loc) return false;
  const lower = loc.toLowerCase();
  return AZ_LOCATION_PATTERNS.some((p) => lower.includes(p));
};

const trackClick = (buttonName) => {
  trackEvent({ action: "click_arizona_hackathon", params: { button: buttonName } });
};

const formatEventDate = (startDate, endDate) => {
  const start = Moment(startDate);
  const end = Moment(endDate);

  if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
    return start.format("dddd, MMMM Do YYYY");
  }

  return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
};

// FAQ rendered as native <details> disclosures (scope convention, see /about/judges).
const FAQ_ITEMS = [
  {
    q: "When is the next ASU hackathon?",
    a: "The next major Opportunity Hack event in Arizona is the Fall 2026 flagship hackathon, scheduled for November 14-15, 2026 at Arizona State University in Tempe. Smaller events also happen at ASU Polytechnic and downtown Phoenix throughout the year. Check the upcoming events list above or at /hack for current registration windows.",
  },
  {
    q: "Is the hackathon only for ASU students?",
    a: "No. Opportunity Hack hackathons in Arizona are open to anyone — ASU students, students from other Arizona universities (UofA, NAU, GCU), high school students 16+, working developers, designers, and career-switchers. About a third of any given Arizona hackathon is non-ASU participants.",
  },
  {
    q: "What's the cost to attend a hackathon in Arizona?",
    a: "Free for hackers, mentors, judges, and nonprofits. Food and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, but most Arizona hackathons are local-friendly with parking on the ASU campus and easy light-rail access.",
  },
  {
    q: "Where exactly are Opportunity Hack hackathons held in Arizona?",
    a: "The flagship fall hackathon is at ASU's Tempe campus (1151 S Forest Ave, Tempe, AZ 85281). Past events have also been held at ASU Polytechnic in Mesa, the ASU SkySong center in Scottsdale, and downtown Phoenix venues partnered with local sponsors. Specific venue details are confirmed 4-6 weeks before each event.",
  },
  {
    q: "How can my Arizona-based company sponsor a hackathon?",
    a: "Sponsorship inquiries go to /sponsor. Tiers range from category-prize sponsorship to title sponsorship. Local Arizona companies often choose sponsorship that includes dedicated mentor or judge slots for their employees — it's a popular professional-development perk that also counts toward most corporate ESG and volunteer-time programs. We can also discuss custom Arizona-only event sponsorship at /hack/request.",
  },
  {
    q: "Can my nonprofit request a hackathon project if we're not in Phoenix?",
    a: "Yes — we work with nonprofits across Arizona (and beyond). Phoenix-metro nonprofits get priority because in-person stakeholder collaboration is easier, but we've worked with organizations in Tucson, Flagstaff, and statewide. Apply at /hack/request and note your location.",
  },
  {
    q: "Are there hackathons in Arizona for beginners?",
    a: "Opportunity Hack hackathons run with a roughly 1:3 mentor-to-hacker ratio specifically so beginners can ship working code. About a third of our Arizona participants are at their first hackathon. Senior engineers handle architecture and debugging while beginners contribute alongside.",
  },
  {
    q: "How does Opportunity Hack compare to other Arizona hackathons like Hack Arizona or Devils Invent?",
    a: "Hack Arizona (UofA) and Devils Invent (ASU's engineering-college hackathon) are excellent general-purpose student hackathons focused on innovation and competition. Opportunity Hack is specifically a hackathon for social good — every project builds for a real nonprofit, every project enters our Founding Engineer program for post-hackathon continuation. The audiences and missions complement each other; we encourage participating in all three.",
  },
];

const NONPROFIT_STEPS = [
  {
    n: "01",
    t: "Apply",
    body: (
      <>
        Submit your problem statement at{" "}
        <Link href="/hack/request" className="ohx-link">
          /hack/request
        </Link>
        . Any 501(c)(3) headquartered or operating in Arizona is eligible —
        we&apos;re partial to Phoenix-metro organizations because they&apos;re
        easiest to support post-hackathon, but statewide is fine.
      </>
    ),
  },
  {
    n: "02",
    t: "Get matched",
    body: "4-8 weeks before the next hackathon, we match your problem to a team of volunteer engineers — typically 3-5 hackers with mentors drawn from senior engineers at Arizona tech companies.",
  },
  {
    n: "03",
    t: "Build & continue",
    body: "The hackathon weekend produces a working prototype. The Founding Engineer program continues development for weeks afterward. Your nonprofit owns the code — no fees, no contracts.",
  },
];

const SECTION_PAD = {
  paddingTop: "clamp(48px, 7vh, 80px)",
  paddingBottom: "clamp(48px, 7vh, 80px)",
};
const BAND = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

const ArizonaHackathons = () => {
  const { hackathons: upcomingEvents, loading: loadingUpcoming } =
    useHackathonEvents("current");
  const { hackathons: pastEvents } = useHackathonEvents("previous");

  const upcomingAZ = (upcomingEvents || []).filter((e) =>
    isArizonaLocation(e.location)
  );

  const pastAZ = (pastEvents || []).filter((e) => isArizonaLocation(e.location));
  const pastAZSorted = [...pastAZ].sort(
    (a, b) => new Date(b.start_date) - new Date(a.start_date)
  );

  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <>
      <Head>
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 48px)",
          }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Local · Phoenix metro
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "15ch", animationDelay: "60ms" }}
          >
            Hackathons in <span className="ohx-italic">Arizona.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
          >
            Opportunity Hack at Arizona State University and across the Phoenix
            metro since 2015. A social-good hackathon where every project builds
            free software for a real nonprofit.
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
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("register_hero")}
            >
              Register for the next hackathon <Arrow />
            </Link>
            <Link
              href="/sponsor"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("sponsor_hero")}
            >
              Sponsor a local hackathon
            </Link>
          </div>

          <p
            className="ohx-muted rise"
            style={{
              marginTop: 20,
              fontSize: "0.95rem",
              animationDelay: "300ms",
              maxWidth: "70ch",
            }}
          >
            A Phoenix-area nonprofit that needs custom software?{" "}
            <Link href="/hack/request" className="ohx-link">
              Request a hackathon project <Arrow />
            </Link>{" "}
            and have volunteer developers build it for you — for free.
          </p>

          <hr className="ohx-rule" style={{ marginTop: 34 }} />
          <div
            className="rise"
            style={{
              marginTop: 26,
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(28px, 6vw, 64px)",
              animationDelay: "360ms",
            }}
          >
            <Stat value="2015" label="First AZ hackathon" />
            <Stat value="Free" label="For every participant" />
            <Stat value="ASU Tempe" label="Anchor venue" />
          </div>
        </section>

        {/* HERO PHOTO */}
        <div className="ohx-wrap" style={{ marginTop: 8, marginBottom: "clamp(28px, 5vh, 48px)" }}>
          <div
            className="rise"
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 8",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--line)",
              animationDelay: "420ms",
            }}
          >
            <Image
              src="https://cdn.ohack.dev/hackathons/2025_fall/photos/1781122622575_IMG_9623.JPG"
              alt="Participants at the Opportunity Hack Fall 2025 hackathon at Arizona State University in Tempe, Arizona"
              fill
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* UPCOMING */}
        <section id="upcoming" style={{ ...BAND, scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <Eyebrow>Upcoming</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>
              Hackathons in Arizona
            </h2>

            {loadingUpcoming ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
              >
                {[0, 1].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: "8px" }}
                  />
                ))}
              </div>
            ) : upcomingAZ.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
              >
                {upcomingAZ.map((event) => (
                  <div
                    key={event.event_id}
                    className="ohx-card"
                    style={{
                      padding: "24px 26px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3 className="ohx-display" style={{ fontSize: "1.3rem" }}>
                      {event.title}
                    </h3>
                    <p
                      className="ohx-faint"
                      style={{ margin: "10px 0 0", fontSize: "0.88rem" }}
                    >
                      {event.location}
                    </p>
                    <p
                      className="ohx-muted"
                      style={{ margin: "4px 0 0", fontSize: "0.92rem" }}
                    >
                      {formatEventDate(event.start_date, event.end_date)}
                    </p>
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: 20,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <Link
                        href={`/hack/${event.event_id}/hacker-application`}
                        className="ohx-btn ohx-btn--primary"
                        onClick={() => trackClick("register_event")}
                      >
                        Register
                      </Link>
                      <Link
                        href={`/hack/${event.event_id}`}
                        className="ohx-btn ohx-btn--ghost"
                        onClick={() => trackClick("event_details")}
                      >
                        Event details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="ohx-card"
                style={{ padding: "28px 28px", background: "var(--surface)" }}
              >
                <p className="ohx-muted" style={{ margin: 0, maxWidth: "70ch" }}>
                  <strong style={{ color: "var(--ink)" }}>
                    No Arizona hackathons currently on the calendar.
                  </strong>{" "}
                  The next confirmed Arizona event is the{" "}
                  <strong style={{ color: "var(--ink)" }}>
                    Fall 2026 flagship hackathon at ASU on November 14-15, 2026
                  </strong>
                  . Registration opens roughly 8 weeks in advance — check back in
                  September 2026 or{" "}
                  <Link href="/hack" className="ohx-link">
                    browse all upcoming events
                  </Link>{" "}
                  for online and out-of-state options in the meantime.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PAST */}
        <section className="ohx-wrap" style={SECTION_PAD}>
          <Eyebrow>Archive</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>
            Past hackathons in Arizona
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 28, maxWidth: "66ch" }}
          >
            Opportunity Hack has run hackathons in Arizona for over a decade —
            below are past events held across the state, by location and by year.
          </p>

          {pastAZSorted.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              }}
            >
              {pastAZSorted.slice(0, 12).map((event) => (
                <div
                  key={event.event_id}
                  className="ohx-card"
                  style={{ padding: "20px 22px" }}
                >
                  <span className="ohx-tag">
                    {Moment(event.start_date).format("YYYY")}
                  </span>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: "1.1rem", marginTop: 12 }}
                  >
                    {event.title}
                  </h3>
                  <p
                    className="ohx-faint"
                    style={{ margin: "8px 0 0", fontSize: "0.85rem" }}
                  >
                    {event.location}
                  </p>
                  <p
                    className="ohx-muted"
                    style={{ margin: "2px 0 0", fontSize: "0.85rem" }}
                  >
                    {formatEventDate(event.start_date, event.end_date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="ohx-faint" style={{ margin: 0 }}>
              Past Arizona event archive loading from the events database…
            </p>
          )}

          <div style={{ marginTop: 28 }}>
            <Link
              href="/hack"
              className="ohx-link"
              onClick={() => trackClick("view_all_past")}
            >
              View all past hackathons <Arrow />
            </Link>
          </div>
        </section>

        {/* WHY ASU TEMPE */}
        <section style={BAND}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <Eyebrow>The venue</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 18 }}>
              Why ASU Tempe is the anchor
            </h2>
            <div
              style={{
                display: "grid",
                gap: "clamp(28px, 5vw, 56px)",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                alignItems: "center",
              }}
            >
              <div>
                <p className="ohx-muted" style={{ marginTop: 0, lineHeight: 1.65 }}>
                  Arizona State University&apos;s Tempe campus has been
                  Opportunity Hack&apos;s primary venue since the program&apos;s
                  founding. ASU&apos;s Fulton Schools of Engineering — one of the
                  largest engineering schools in the US by enrollment — provides a
                  constant pipeline of student volunteers, and the
                  university&apos;s nonprofit partnerships in Maricopa County give
                  us a steady stream of real problem statements to build against.
                </p>
                <p className="ohx-muted" style={{ marginBottom: 0, lineHeight: 1.65 }}>
                  Tempe is also one of the more accessible hackathon venues in the
                  southwest: 15 minutes from Sky Harbor Airport, walking distance
                  from Mill Avenue, and connected to Phoenix and Mesa via light
                  rail. Local sponsors hire heavily from ASU and want recruiting
                  access; local nonprofits include campus-adjacent organizations
                  and Maricopa County programs serving Phoenix-area residents.
                </p>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                }}
              >
                <Image
                  src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
                  alt="Hackathon participants at Arizona State University Tempe campus during an Opportunity Hack social-good hackathon"
                  fill
                  sizes="(max-width: 700px) 100vw, 540px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FOR COMPANIES — navy accent band */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <p
              className="ohx-eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              For Arizona companies
            </p>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 16, maxWidth: "20ch" }}
            >
              Local sponsorship drives local impact
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: "68ch",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              A sponsorship dollar at OHack stays in the Phoenix metro: it funds a
              hackathon that builds free software for Arizona nonprofits, with
              mentor and judge slots staffed by local senior engineers — often
              from your own company. The work is concrete, the recipients are
              local, and the engineering hours are tracked and reportable. If your
              company has community-engagement programs, a volunteer-time policy,
              or recruiting interest in ASU graduates, sponsoring an Arizona
              hackathon hits all three at once.
            </p>
            <div
              style={{ marginTop: 28, display: "flex", gap: 14, flexWrap: "wrap" }}
            >
              <Link
                href="/sponsor"
                className="ohx-btn"
                style={{ background: "#fff", color: "var(--brand)" }}
                onClick={() => trackClick("view_sponsorship_tiers")}
              >
                View sponsorship tiers <Arrow />
              </Link>
              <Link
                href="/hack/request"
                className="ohx-btn ohx-btn--ghost"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
                onClick={() => trackClick("request_custom_hackathon")}
              >
                Request a custom hackathon
              </Link>
            </div>
          </div>
        </section>

        {/* FOR NONPROFITS */}
        <section className="ohx-wrap" style={SECTION_PAD}>
          <Eyebrow>For Arizona nonprofits</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>
            Request a hackathon project
          </h2>

          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {NONPROFIT_STEPS.map((step) => (
              <div
                key={step.n}
                className="ohx-card"
                style={{ padding: "24px 26px" }}
              >
                <span
                  className="ohx-display ohx-italic"
                  style={{ fontSize: "1.6rem" }}
                >
                  {step.n}
                </span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.2rem", marginTop: 8 }}
                >
                  {step.t}
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: "12px 0 0", fontSize: "0.95rem", lineHeight: 1.6 }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28 }}>
            <Link
              href="/hack/request"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("request_nonprofit_hackathon")}
            >
              Request a hackathon for your nonprofit <Arrow />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section style={BAND}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
              Frequently asked
            </h2>
            <div style={{ maxWidth: 860 }}>
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="ohx-card"
                  style={{
                    background: "var(--surface)",
                    padding: "18px 22px",
                    marginBottom: 12,
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      listStyle: "none",
                      fontFamily: "var(--display)",
                      fontWeight: 500,
                      fontSize: "1.08rem",
                      color: "var(--ink)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      alignItems: "baseline",
                    }}
                  >
                    {item.q}
                    <span className="ohx-faint" style={{ fontSize: "1.2rem" }}>
                      +
                    </span>
                  </summary>
                  <p
                    className="ohx-muted"
                    style={{ margin: "14px 0 0", lineHeight: 1.65 }}
                  >
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          className="ohx-wrap"
          style={{ ...SECTION_PAD, textAlign: "center" }}
        >
          <Eyebrow>Get involved</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 14, maxWidth: "20ch", marginInline: "auto" }}
          >
            Three ways to engage in Arizona
          </h2>
          <p
            className="ohx-muted"
            style={{
              margin: "0 auto 28px",
              maxWidth: "56ch",
            }}
          >
            Whether you&apos;re building, sponsoring, or seeking a free software
            project for your nonprofit — there&apos;s a path here.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("see_upcoming_final")}
            >
              See upcoming hackathons <Arrow />
            </Link>
            <Link
              href="/sponsor"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("sponsor_final")}
            >
              Sponsor an Arizona hackathon
            </Link>
            <Link
              href="/hack/request"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("request_nonprofit_final")}
            >
              Request a hackathon for your nonprofit
            </Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default ArizonaHackathons;

export const getStaticProps = async () => {
  const title =
    "Hackathons in Arizona — ASU & Phoenix | Opportunity Hack";
  const description =
    "Arizona's longest-running hackathon for social good, hosted at ASU in Tempe each fall. Past events at ASU Polytechnic, downtown Phoenix, and Scottsdale. Free to attend, open to all skill levels.";
  const canonicalUrl = "https://www.ohack.dev/hackathons/arizona";
  const ogImage = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

  return {
    props: {
      title,
      description,
      canonical: canonicalUrl,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        {
          name: "og:title",
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "author",
          property: "author",
          content: "Opportunity Hack",
          key: "author",
        },
        {
          name: "og:description",
          property: "og:description",
          content: description,
          key: "ogdescription",
        },
        {
          name: "image",
          property: "og:image",
          content: ogImage,
          key: "ognameimage",
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          name: "url",
          property: "url",
          content: canonicalUrl,
          key: "url",
        },
        {
          name: "og:url",
          property: "og:url",
          content: canonicalUrl,
          key: "ogurl",
        },
        { property: "og:type", content: "website", key: "ogtype" },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard",
        },
        {
          name: "twitter:site",
          property: "twitter:site",
          content: "@opportunityhack",
          key: "twittersite",
        },
        {
          name: "twitter:title",
          property: "twitter:title",
          content: title,
          key: "twittertitle",
        },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: description,
          key: "twitterdesc",
        },
        {
          name: "twitter:image",
          property: "twitter:image",
          content: ogImage,
          key: "twitterimage",
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content:
            "Hackathon participants at Arizona State University Tempe campus during an Opportunity Hack social-good hackathon",
          key: "twitterimagealt",
        },
        {
          name: "twitter:creator",
          property: "twitter:creator",
          content: "@opportunityhack",
          key: "twittercreator",
        },
        {
          name: "keywords",
          property: "keywords",
          content:
            "asu hackathon, phoenix hackathon, hack arizona, hackathons in arizona, tempe hackathon, hackathons near me phoenix, arizona hackathon, asu tempe hackathon, scottsdale hackathon",
          key: "keywords",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": canonicalUrl + "#webpage",
            url: canonicalUrl,
            name: title,
            description: description,
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            about: {
              "@type": "Place",
              name: "Arizona",
              address: {
                "@type": "PostalAddress",
                addressRegion: "AZ",
                addressCountry: "US",
              },
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.ohack.dev",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Hackathons",
                item: "https://www.ohack.dev/hack",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Arizona",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "Event",
            name: "Opportunity Hack Fall 2026 Hackathon at ASU",
            startDate: "2026-11-14T09:00:00-07:00",
            endDate: "2026-11-15T18:00:00-07:00",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: "Arizona State University, Tempe Campus",
              address: {
                "@type": "PostalAddress",
                streetAddress: "1151 S Forest Ave",
                addressLocality: "Tempe",
                addressRegion: "AZ",
                postalCode: "85281",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 33.4242,
                longitude: -111.9281,
              },
            },
            image: ogImage,
            description:
              "Annual social-good hackathon at Arizona State University.",
            organizer: {
              "@type": "Organization",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              url: "https://www.ohack.dev/hack",
              availability: "https://schema.org/InStock",
              validFrom: "2026-08-01",
            },
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "When is the next ASU hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The next major Opportunity Hack event in Arizona is the Fall 2026 flagship hackathon, scheduled for November 14-15, 2026 at Arizona State University in Tempe. Smaller events also happen at ASU Polytechnic and downtown Phoenix throughout the year. Check the upcoming events list above or at /hack for current registration windows.",
                },
              },
              {
                "@type": "Question",
                name: "Is the hackathon only for ASU students?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Opportunity Hack hackathons in Arizona are open to anyone — ASU students, students from other Arizona universities (UofA, NAU, GCU), high school students 16+, working developers, designers, and career-switchers. About a third of any given Arizona hackathon is non-ASU participants.",
                },
              },
              {
                "@type": "Question",
                name: "What's the cost to attend a hackathon in Arizona?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Free for hackers, mentors, judges, and nonprofits. Food and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, but most Arizona hackathons are local-friendly with parking on the ASU campus and easy light-rail access.",
                },
              },
              {
                "@type": "Question",
                name: "Where exactly are Opportunity Hack hackathons held in Arizona?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The flagship fall hackathon is at ASU's Tempe campus (1151 S Forest Ave, Tempe, AZ 85281). Past events have also been held at ASU Polytechnic in Mesa, the ASU SkySong center in Scottsdale, and downtown Phoenix venues partnered with local sponsors. Specific venue details are confirmed 4-6 weeks before each event.",
                },
              },
              {
                "@type": "Question",
                name: "How can my Arizona-based company sponsor a hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sponsorship inquiries go to /sponsor. Tiers range from category-prize sponsorship to title sponsorship. Local Arizona companies often choose sponsorship that includes dedicated mentor or judge slots for their employees — it's a popular professional-development perk that also counts toward most corporate ESG and volunteer-time programs. We can also discuss custom Arizona-only event sponsorship at /hack/request.",
                },
              },
              {
                "@type": "Question",
                name: "Can my nonprofit request a hackathon project if we're not in Phoenix?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — we work with nonprofits across Arizona (and beyond). Phoenix-metro nonprofits get priority because in-person stakeholder collaboration is easier, but we've worked with organizations in Tucson, Flagstaff, and statewide. Apply at /hack/request and note your location.",
                },
              },
              {
                "@type": "Question",
                name: "Are there hackathons in Arizona for beginners?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Opportunity Hack hackathons run with a roughly 1:3 mentor-to-hacker ratio specifically so beginners can ship working code. About a third of our Arizona participants are at their first hackathon. Senior engineers handle architecture and debugging while beginners contribute alongside.",
                },
              },
              {
                "@type": "Question",
                name: "How does Opportunity Hack compare to other Arizona hackathons like Hack Arizona or Devils Invent?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hack Arizona (UofA) and Devils Invent (ASU's engineering-college hackathon) are excellent general-purpose student hackathons focused on innovation and competition. Opportunity Hack is specifically a hackathon for social good — every project builds for a real nonprofit, every project enters our Founding Engineer program for post-hackathon continuation. The audiences and missions complement each other; we encourage participating in all three.",
                },
              },
            ],
          },
        ],
      },
    },
  };
};
