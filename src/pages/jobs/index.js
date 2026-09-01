import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { RefinedRoot, Eyebrow, Stat, Arrow } from "../../components/design/refined";

const CANONICAL = "https://www.ohack.dev/jobs";
const OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

const trackClick = (button) => {
  trackEvent({ action: "click_jobs", params: { button } });
};

const LOCATION_LABELS = {
  remote: "Remote",
  phoenix_in_person: "Phoenix, AZ · on-site",
  hybrid: "Remote-friendly",
};

// Single source of truth: rendered as <details> accordions AND emitted as
// FAQPage JSON-LD (recruit-tech-talent pattern).
const FAQ_ITEMS = [
  {
    q: "Are these paid positions?",
    a: "No — every role at Opportunity Hack is a volunteer position, including the people who run it. We're a 501(c)(3) nonprofit with very limited funds. What you get instead is real, verifiable experience: a leadership title backed by shipped work, Hearts toward certificates, and LinkedIn recommendations and references from people who watched you deliver.",
  },
  {
    q: "Can Opportunity Hack sponsor my visa?",
    a: "No. We are unable to sponsor visas of any kind. These are unpaid volunteer roles and do not constitute employment.",
  },
  {
    q: "How much time do these roles take?",
    a: "It varies by role — each listing states its expected hours per week, typically 2 to 6. What matters more than the number is reliability: we plan around what you commit to, so an honest 3 hours beats an optimistic 10.",
  },
  {
    q: "Why does the application require a video?",
    a: "Two reasons. First, these roles are communication-heavy, and a two-minute video tells us more than a page of text. Second, it filters out AI-generated and copy-paste applications — we'd rather meet 5 real people than sort through 50 templates. A phone-camera video is perfect; production quality doesn't matter.",
  },
  {
    q: "Do I need to live in Phoenix?",
    a: "Only for the Hackathon Operations Lead, which runs the physical event at ASU in Tempe and requires being on-site for the full event weekend. The Social Media Manager and Mentor Program Lead roles are remote-friendly.",
  },
  {
    q: "What happens after I apply?",
    a: "You'll get a confirmation email right away — reply to it within 5 days to confirm your application is active (consider it the first task). We review every application by hand, typically within a week, then reach out from questions@ohack.org to set up a short call.",
  },
  {
    q: "Will this actually help my career?",
    a: "It has for many of our volunteers. You get a real title, real scope, and public work you can point to in interviews — plus references who can speak to how you operate. Recruiters increasingly want proof over claims, and everything you do here is verifiable.",
  },
];

const WHAT_YOU_GET = [
  {
    title: "A title backed by real work",
    body: "Social Media Manager. Operations Lead. Program Lead. Roles you'd normally need years to reach — earned by shipping, and verifiable by anyone who checks.",
  },
  {
    title: "References that mean something",
    body: "LinkedIn recommendations and interview references from the organizers who watched you deliver under real constraints.",
  },
  {
    title: "Hearts & certificates",
    body: "Our recognition system converts sustained volunteering into certificates and public credit on your ohack.dev portfolio.",
  },
  {
    title: "A mission worth your weekends",
    body: "Everything you do helps nonprofits get software they could never afford. That's the whole point — and it shows in the people you'll work with.",
  },
];

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "26px 24px",
};

const JobsIndex = ({ listings }) => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const openRoles = (listings || []).filter((l) => l.status === "published");
  const closedRoles = (listings || []).filter((l) => l.status === "closed");

  return (
    <>
      <Head>
        <meta name="robots" content="index, follow" />
      </Head>

      <RefinedRoot>
        {/* ---------------- HERO ---------------- */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}
        >
          <div className="rise">
            <Eyebrow>Volunteer with us · Fall 2026 and beyond</Eyebrow>
            <h1 className="ohx-display" style={{ maxWidth: "18ch", marginTop: 10 }}>
              Help run <span className="ohx-italic">Opportunity Hack.</span>
            </h1>
            <p className="ohx-lead" style={{ marginTop: 18, maxWidth: "58ch" }}>
              We&apos;re a volunteer-run nonprofit that gets real software built for
              nonprofits. These organizer roles are unpaid — and they&apos;re the most
              career-real experience you can get without a job offer: real scope,
              real deadlines, real references.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 26 }}>
              <a
                className="ohx-btn ohx-btn--primary"
                href="#roles"
                onClick={() => trackClick("hero_see_roles")}
              >
                See open roles <Arrow />
              </a>
              <Link
                className="ohx-btn ohx-btn--ghost"
                href="/about"
                onClick={() => trackClick("hero_about")}
              >
                What is Opportunity Hack?
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 14,
                marginTop: 36,
                maxWidth: 560,
              }}
            >
              <div style={cardStyle}>
                <Stat value={String(openRoles.length || "—")} label="open roles" />
              </div>
              <div style={cardStyle}>
                <Stat value="100%" label="volunteer-run" />
              </div>
              <div style={cardStyle}>
                <Stat value="2013" label="helping nonprofits since" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- OPEN ROLES ---------------- */}
        <section
          id="roles"
          className="ohx-wrap"
          style={{ paddingTop: "clamp(40px, 7vh, 72px)", paddingBottom: "clamp(40px, 7vh, 72px)", scrollMarginTop: 100 }}
        >
          <Eyebrow>Open roles</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>
            Where we need you.
          </h2>

          {openRoles.length === 0 ? (
            <div style={{ ...cardStyle, maxWidth: 640 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>No open roles right now.</p>
              <p className="ohx-muted" style={{ marginTop: 8, marginBottom: 16 }}>
                New roles are posted here first. Meanwhile, the best way to plug in
                is our Slack community — most of our organizers started there.
              </p>
              <Link className="ohx-btn ohx-btn--ghost" href="/signup" onClick={() => trackClick("empty_slack")}>
                Join the Slack community
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 18,
              }}
            >
              {openRoles.map((role) => (
                <Link
                  key={role.slug}
                  href={`/jobs/${role.slug}`}
                  className="ohx-card ohx-card--hover"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "26px 24px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  onClick={() => trackClick(`role_${role.slug}`)}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    <span className="ohx-tag">
                      {LOCATION_LABELS[role.location_type] || role.location_label}
                    </span>
                    <span className="ohx-tag">{role.hours_per_week_label} hrs/week</span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 24,
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                      margin: 0,
                    }}
                  >
                    {role.title}
                  </h3>
                  <p className="ohx-muted" style={{ marginTop: 10, marginBottom: 18, lineHeight: 1.65, flexGrow: 1 }}>
                    {role.summary}
                  </p>
                  <span className="ohx-link" style={{ fontWeight: 600 }}>
                    View role <Arrow />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {closedRoles.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p className="ohx-faint" style={{ marginBottom: 10, fontWeight: 600 }}>
                Recently closed
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {closedRoles.map((role) => (
                  <span key={role.slug} className="ohx-tag" style={{ opacity: 0.7 }}>
                    {role.title} · closed
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ---------------- WHAT YOU GET ---------------- */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
            <Eyebrow>Why do this</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
              Unpaid ≠ <span className="ohx-italic">unrewarded.</span>
            </h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "58ch" }}>
              Everyone who runs Opportunity Hack has a full-time job. We volunteer
              because we believe tech can do good — and because the experience is
              real in a way side projects never are.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 18,
              }}
            >
              {WHAT_YOU_GET.map((item) => (
                <div key={item.title} style={cardStyle}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{item.title}</h3>
                  <p className="ohx-muted" style={{ margin: 0, lineHeight: 1.65 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- HOW APPLYING WORKS ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
          <Eyebrow>Fair warning</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
            The application is part of the <span className="ohx-italic">interview.</span>
          </h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "58ch" }}>
            It takes about 30 minutes and includes a role-specific work sample and a
            two-minute video. That&apos;s deliberate: it shows us how you actually
            work, and it filters out AI-written applications. If that sounds fun
            rather than annoying, you&apos;re exactly who we&apos;re looking for.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 18,
              maxWidth: 960,
            }}
          >
            {[
              ["01", "About you", "Basics, LinkedIn, and your resume."],
              ["02", "Commitment", "Honest hours per week and how long you'll stay."],
              ["03", "Work sample", "A ~15-minute exercise pulled from the actual job."],
              ["04", "Short video", "Two minutes on camera — then reply to our email to confirm."],
            ].map(([n, title, body]) => (
              <div key={n} style={cardStyle}>
                <div style={{ fontFamily: "var(--display)", fontSize: 22, color: "var(--accent)", marginBottom: 8 }}>{n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{title}</h3>
                <p className="ohx-muted" style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
              The honest FAQ.
            </h2>
            <div style={{ maxWidth: 760 }}>
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    padding: "16px 0",
                  }}
                >
                  <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 17 }}>
                    {item.q}
                  </summary>
                  <p className="ohx-muted" style={{ marginTop: 10, marginBottom: 4, lineHeight: 1.7 }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FINAL CTA ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(56px, 9vh, 104px)", paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}>
          <h2 className="ohx-display" style={{ marginBottom: 14, maxWidth: "24ch", marginInline: "auto" }}>
            Do work that <span className="ohx-italic">matters</span> — and counts.
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 24 }}>
            <a className="ohx-btn ohx-btn--primary" href="#roles" onClick={() => trackClick("footer_roles")}>
              Browse open roles <Arrow />
            </a>
            <Link className="ohx-btn ohx-btn--ghost" href="/signup" onClick={() => trackClick("footer_slack")}>
              Join our Slack first
            </Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default JobsIndex;

export const getStaticProps = async () => {
  // Rethrow server errors so ISR keeps serving the last good version rather
  // than publishing an empty page on a backend blip (teamPageData pattern).
  // A 404 means the backend doesn't serve /api/jobs yet (deploy ordering) —
  // render the empty state instead of failing the whole build.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/jobs`);
  let listings = [];
  if (res.ok) {
    const data = await res.json();
    listings = data.listings || [];
  } else if (res.status !== 404) {
    throw new Error(`GET /api/jobs failed: ${res.status}`);
  }

  const title = "Volunteer Jobs: Help Run Opportunity Hack | Phoenix & Remote";
  const description =
    "Volunteer leadership roles at Opportunity Hack — social media, hackathon operations (Phoenix, AZ), and mentor program lead. Real portfolio experience, references, and social impact. Unpaid, career-real.";

  return {
    props: {
      listings,
      title,
      description,
      canonical: CANONICAL,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "description", property: "description", content: description, key: "description" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: OG_IMAGE, key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: CANONICAL, key: "url" },
        { name: "og:url", property: "og:url", content: CANONICAL, key: "ogurl" },
        { property: "og:type", content: "website", key: "ogtype" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: OG_IMAGE, key: "twitterimage" },
        {
          name: "keywords",
          property: "keywords",
          content:
            "volunteer jobs phoenix, nonprofit volunteer opportunities, social media volunteer, hackathon organizer, event operations volunteer, mentor coordinator, volunteer leadership roles, tech volunteering, remote volunteer jobs, resume building volunteer work",
          key: "keywords",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": CANONICAL + "#webpage",
            url: CANONICAL,
            name: title,
            description,
            isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "Volunteer Jobs", item: CANONICAL },
            ],
          },
          {
            "@type": "ItemList",
            itemListElement: listings
              .filter((l) => l.status === "published")
              .map((l, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://www.ohack.dev/jobs/${l.slug}`,
              })),
          },
          {
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ],
      },
    },
    revalidate: 300,
  };
};
