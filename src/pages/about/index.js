import React, { Suspense, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Box } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { cofounders, board_members, pledge } from "../../components/About/about-data";
import { VideoSection } from "../../components/About/components";
import { RefinedRoot, RefinedFonts, Eyebrow, Stat, Arrow } from "../../components/design/refined";

// ---- Schemas (unchanged) ----
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Opportunity Hack",
  alternateName: "OHack",
  url: "https://www.ohack.dev",
  description:
    "Harness the power of code for social good, fostering an inclusive society and championing impactful, sustainable change through technology volunteering and hackathons since 2013.",
  foundingDate: "2013",
  sameAs: [
    "https://www.linkedin.com/company/opportunity-hack/",
    "https://github.com/opportunity-hack",
    "https://www.instagram.com/opportunityhack/",
    "https://www.facebook.com/opportunityhack/",
  ],
  logo: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
  image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "board@ohack.org",
  },
  founder: [
    { "@type": "Person", name: "Prashanthi Ravanavarapu", sameAs: "https://www.linkedin.com/in/pravanavarapu/" },
    { "@type": "Person", name: "Jot Powers", sameAs: "https://www.linkedin.com/in/jotpowers/" },
    { "@type": "Person", name: "Bryant Chan", sameAs: "https://www.linkedin.com/in/bryantchan/" },
    { "@type": "Person", name: "Smitha Satish", sameAs: "https://www.linkedin.com/in/smitha-satish-7978091/" },
  ],
  address: { "@type": "PostalAddress", addressLocality: "Phoenix", addressRegion: "AZ", addressCountry: "US" },
};

const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "About Opportunity Hack",
  description: "Learn about Opportunity Hack's mission and impact in technology for social good",
  thumbnailUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
  uploadDate: "2024-04-04T08:00:00+08:00",
  duration: "PT2M30S",
  embedUrl: "https://www.youtube.com/embed/Ia_xsX-318E",
  interactionStatistic: {
    "@type": "InteractionCounter",
    interactionType: { "@type": "WatchAction" },
    userInteractionCount: 4913,
  },
};

const impactStats = [
  { value: "11+", label: "Years of impact" },
  { value: "50+", label: "Hackathons" },
  { value: "1,000+", label: "Volunteers" },
  { value: "100+", label: "Nonprofits" },
];

const whyJoin = [
  { title: "Real impact", description: "Build solutions nonprofits actually use to help their communities." },
  { title: "Career growth", description: "Grow your resume and portfolio with projects that carry social purpose." },
  { title: "A real network", description: "Connect with industry leaders, nonprofit pros, and like-minded developers." },
  { title: "New skills", description: "Learn new technologies on meaningful projects with real deadlines." },
];

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2);
}

// Quiet person card (founders + board share it)
function PersonCard({ name, role, linkedin, tag, accentTag, delay = 0 }) {
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: "50%",
            background: accentTag ? "var(--accent)" : "var(--brand)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "1rem",
            fontFamily: "var(--body)",
          }}
        >
          {initials(name)}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ohx-display" style={{ fontSize: "1.05rem", lineHeight: 1.2 }}>
              {name}
            </span>
            {linkedin && <LinkedInIcon sx={{ color: "#0A66C2", fontSize: 18, flexShrink: 0 }} />}
          </div>
          {tag && (
            <span className={`ohx-tag${accentTag ? " ohx-tag--accent" : ""}`} style={{ marginTop: 6 }}>
              {tag}
            </span>
          )}
        </div>
      </div>
      {role && (
        <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: "0.88rem", lineHeight: 1.5 }}>
          {role}
        </p>
      )}
    </>
  );

  const style = {
    display: "block",
    padding: "20px 22px",
    textDecoration: "none",
    color: "inherit",
    height: "100%",
    animationDelay: `${delay}ms`,
  };

  return linkedin ? (
    <a className="ohx-card ohx-card--hover rise" href={linkedin} target="_blank" rel="noopener noreferrer" style={style}>
      {inner}
    </a>
  ) : (
    <div className="ohx-card rise" style={style}>
      {inner}
    </div>
  );
}

export default function AboutUsPage() {
  const gaButton = (action, actionName) => trackEvent({ action, params: { action_name: actionName } });
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <>
      <Head>
        <title>About Opportunity Hack | Coding for Social Good Since 2013</title>
        <meta name="description" content="Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change." />
        <meta name="keywords" content="Opportunity Hack, social good, non-profit technology, tech volunteering, coding for good, social impact, inclusive society, sustainable change, effective altruism, hackathon, technology for nonprofits" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.ohack.dev/about" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Opportunity Hack | Coding for Social Good Since 2013" />
        <meta property="og:description" content="Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change." />
        <meta property="og:url" content="https://www.ohack.dev/about" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp" />
        <meta property="og:image:alt" content="Opportunity Hack team working together at hackathon event" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Opportunity Hack | Coding for Social Good Since 2013" />
        <meta name="twitter:description" content="Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change." />
        <meta name="twitter:image" content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp" />
        <meta name="twitter:image:alt" content="Opportunity Hack team working together at hackathon event" />
        <meta name="twitter:creator" content="@opportunityhack" />
        <meta name="twitter:site" content="@opportunityhack" />
        <link rel="preload" as="image" href="https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp" />
        <RefinedFonts />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(videoSchema)}</script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              mainEntity: { "@type": "Organization", name: "Opportunity Hack" },
              url: "https://www.ohack.dev/about",
              description: "Learn about Opportunity Hack's mission, history, founders, and commitment to using technology for social good.",
            }),
          }}
        />
        {board_members.map((member, i) => (
          <meta key={i} name="board_member" content={member.name} />
        ))}
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>About · since 2013</span>
          </Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "15ch", animationDelay: "60ms" }}>
            We code for <span className="ohx-italic">social good.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Founded in 2013 inside eBay/PayPal to meet the technology needs of nonprofits,
            Opportunity Hack has grown into a community that harnesses code for an inclusive,
            sustainable kind of change. Read how we{" "}
            <Link href="/coding-for-nonprofits" className="ohx-link">code for nonprofits</Link>{" "}
            and run our{" "}
            <Link href="/hackathon-for-social-good" className="ohx-link">hackathon for social good</Link>.
          </p>
          <div className="rise" style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}>
            <Link href="/volunteer" className="ohx-btn ohx-btn--primary" onClick={() => gaButton("about_get_involved", "Get involved")}>
              Get involved <Arrow />
            </Link>
            <Link href="/hack" className="ohx-btn ohx-btn--ghost" onClick={() => gaButton("about_find_events", "Find events")}>
              Find events
            </Link>
          </div>
        </section>

        {/* HERO IMAGE */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 64px)" }}>
          <div className="rise" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
            <Image
              src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp"
              alt="Developers, designers, and nonprofit partners collaborating at an Opportunity Hack event"
              fill
              sizes="(max-width: 1120px) 100vw, 1120px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <p className="ohx-faint" style={{ marginTop: 12, fontSize: "0.85rem", textAlign: "center" }}>
            Developers, designers, and nonprofit partners collaborating at an Opportunity Hack event
          </p>
        </section>

        {/* IMPACT STATS */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 64px)", paddingBottom: "clamp(40px, 6vh, 64px)" }}>
            <Eyebrow>Our impact over 11 years</Eyebrow>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: "clamp(32px, 7vw, 88px)" }}>
              {impactStats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        </section>

        {/* MISSION VIDEO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <div className="ohx-narrow" style={{ marginInline: "auto", textAlign: "center", marginBottom: 28 }}>
            <Eyebrow>Our mission in action</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>See it for yourself</h2>
            <p className="ohx-muted" style={{ margin: 0 }}>
              How developers, designers, and nonprofits come together to create lasting impact through technology.
            </p>
          </div>
          <div style={{ maxWidth: 860, marginInline: "auto" }}>
            <VideoSection />
          </div>
        </section>

        {/* WHY JOIN */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 72px)", paddingBottom: "clamp(40px, 6vh, 72px)" }}>
          <Eyebrow>Why join</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>A worthwhile way to spend your skills</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 32, maxWidth: "60ch" }}>
            As engineers and students, we have a real chance to use what we know to make a positive impact on the world.
          </p>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {whyJoin.map((r, i) => (
              <div key={r.title} className="ohx-card rise" style={{ padding: "24px 24px", animationDelay: `${i * 70}ms` }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{r.title}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{r.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* GET INVOLVED BAND */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)", textAlign: "center" }}>
            <h2 className="ohx-display" style={{ color: "#fff" }}>Ready to make a difference?</h2>
            <p style={{ margin: "14px auto 28px", maxWidth: "52ch", color: "rgba(255,255,255,0.85)", fontSize: "1.05rem" }}>
              Join thousands of developers, designers, mentors, and volunteers using their skills to create change.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/volunteer" className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }}>
                Get involved <Arrow />
              </Link>
              <Link href="/hack" className="ohx-btn ohx-btn--ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>
                Find events
              </Link>
            </div>
          </div>
        </section>

        <Suspense fallback={<Box sx={{ minHeight: 200 }} />}>
          {/* CO-FOUNDERS */}
          <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
            <Eyebrow>Co-founders</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Where it started</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
              The leaders who began this journey to harness technology for social good.
            </p>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {cofounders.map((m, i) => (
                <PersonCard key={m.name} name={m.name} role={m.title} linkedin={m.linkedin} tag="Co-founder" delay={i * 70} />
              ))}
            </div>
          </section>

          {/* PAYPAL SOCIAL PROOF */}
          <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
              <Eyebrow>Trusted by industry leaders</Eyebrow>
              <div style={{ marginTop: 24, display: "grid", gap: "clamp(28px, 5vw, 56px)", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image
                    src="https://cdn.ohack.dev/ohack.dev/paypal_opportunity_hack.jpg"
                    alt="PayPal CEO Dan Schulman and CTO Sri Shivananda at an Opportunity Hack event in San Jose"
                    fill
                    sizes="(max-width: 700px) 100vw, 540px"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
                <div>
                  <h2 className="ohx-display" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)" }}>A PayPal partnership legacy</h2>
                  <p className="ohx-muted" style={{ marginTop: 14, lineHeight: 1.6 }}>
                    Founded as part of eBay/PayPal in 2013, Opportunity Hack has hosted PayPal&apos;s CEO Dan
                    Schulman and CTO Sri Shivananda at our San Jose events — a mark of corporate leadership&apos;s
                    commitment to technology for social good.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Enterprise-level mentorship and guidance", "A proven track record with Fortune 500 companies", "Executive leadership involved in our mission"].map((t) => (
                      <li key={t} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>—</span>
                        <span className="ohx-muted" style={{ fontSize: "0.96rem" }}>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* BOARD */}
          <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
            <Eyebrow>Leadership board</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>The people steering us</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "60ch" }}>
              Experienced professionals guiding our mission and strategic direction.
            </p>
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {board_members.map((m, i) => {
                const isPresident = m.role.toLowerCase().includes("president");
                return (
                  <PersonCard
                    key={m.name + i}
                    name={m.name}
                    role={m.role}
                    linkedin={m.linkedin}
                    tag={isPresident ? "President" : m.role.toLowerCase().includes("co-founder") ? "Co-founder" : null}
                    accentTag={isPresident}
                    delay={Math.min(i, 8) * 50}
                  />
                );
              })}
            </div>
          </section>

          {/* PLEDGE */}
          <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
              <Eyebrow>Our community pledge</Eyebrow>
              <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>What we stand for</h2>
              <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                {pledge.map((item, i) => {
                  const [title, description] = item.split(":");
                  return (
                    <div key={i} className="ohx-card" style={{ padding: "22px 24px", background: "var(--surface)" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                        <span className="ohx-display ohx-italic" style={{ fontSize: "1.4rem", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <h3 className="ohx-display" style={{ fontSize: "1.1rem" }}>{title.trim()}</h3>
                          {description && <p className="ohx-muted" style={{ margin: "8px 0 0", fontSize: "0.93rem", lineHeight: 1.55 }}>{description.trim()}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="ohx-display" style={{ marginTop: 32, textAlign: "center", fontStyle: "italic", fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)", maxWidth: "44ch", marginInline: "auto", lineHeight: 1.35 }}>
                Together, we are Opportunity Hack. Together, we code for social good — for change.
              </p>
            </div>
          </section>
        </Suspense>

        {/* FINAL CTA */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}>
          <Eyebrow>Start your journey</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>Find your role</h2>
          <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "52ch" }}>
            Hack solutions, mentor teams, volunteer at events, judge projects — or take an
            organizer role and help run Opportunity Hack itself.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/volunteer" className="ohx-btn ohx-btn--primary">Explore roles <Arrow /></Link>
            <Link href="/jobs" className="ohx-btn ohx-btn--ghost">See organizer jobs</Link>
            <Link href="/signup" className="ohx-btn ohx-btn--ghost">Join the community</Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}

export const getStaticProps = async () => {
  const title = "About Opportunity Hack - Coding for Social Good Since 2013 | Opportunity Hack";
  const description =
    "Founded in 2013, Opportunity Hack harnesses the power of code for social good. Learn about our mission, founders, board members, and join our community of tech volunteers making sustainable change through hackathons and nonprofit technology solutions.";
  return {
    props: {
      title: "About Opportunity Hack - Coding for Social Good Since 2013",
      description: description,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp", key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: "https://www.ohack.dev/about", key: "url" },
        { name: "og:url", property: "og:url", content: "https://www.ohack.dev/about", key: "ogurl" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp", key: "twitterimage" },
        { name: "twitter:image:alt", property: "twitter:image:alt", content: "Developers, designers, and nonprofit partners collaborating at an Opportunity Hack event building technology solutions", key: "twitterimagealt" },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.ohack.dev/#organization",
            name: "Opportunity Hack",
            url: "https://www.ohack.dev",
            logo: { "@type": "ImageObject", url: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png" },
            sameAs: [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack",
              "https://www.linkedin.com/company/opportunity-hack/",
              "https://www.instagram.com/opportunityhack/",
              "https://www.facebook.com/opportunityhack/",
            ],
            foundingDate: "2013",
            description:
              "Harness the power of code for social good, fostering an inclusive society and championing impactful, sustainable change through technology volunteering and hackathons since 2013.",
            contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "board@ohack.org" },
            founder: [
              { "@type": "Person", name: "Prashanthi Ravanavarapu" },
              { "@type": "Person", name: "Jot Powers" },
              { "@type": "Person", name: "Bryant Chan" },
              { "@type": "Person", name: "Smitha Satish" },
            ],
          },
          {
            "@type": "WebPage",
            "@id": "https://www.ohack.dev/about#webpage",
            url: "https://www.ohack.dev/about",
            name: title,
            description: description,
            isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
            about: {
              "@type": "Organization",
              name: "Opportunity Hack",
              description: "Organization focused on using technology for social good through hackathons and nonprofit partnerships",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "About", item: "https://www.ohack.dev/about" },
            ],
          },
          {
            "@type": "AboutPage",
            mainEntity: { "@type": "Organization", name: "Opportunity Hack" },
            url: "https://www.ohack.dev/about",
            description: "Learn about Opportunity Hack's mission, history, founders, and commitment to using technology for social good.",
          },
        ],
      },
    },
  };
};
