import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Moment from "moment";
import { Box } from "@mui/material";
import {
  RocketLaunchRounded, CodeRounded, CloudRounded, SpeedRounded, AutoAwesomeRounded, BuildRounded,
  LaptopRounded, TipsAndUpdatesRounded, GroupsRounded, FavoriteRounded, EmojiEventsRounded,
} from "@mui/icons-material";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../../components/design/refined";

const track = (buttonName) => trackEvent("click_hackers", buttonName);

const toolboxItems = [
  { name: "Epic Stack", description: "Full-stack web app framework with TypeScript, React, Remix, Prisma, and more.", url: "https://www.epicweb.dev/epic-stack", icon: <RocketLaunchRounded /> },
  { name: "Next.js", description: "React framework for production with server-side rendering and static generation.", url: "https://nextjs.org/", icon: <CodeRounded /> },
  { name: "Supabase", description: "Open-source Firebase alternative with PostgreSQL, auth, and realtime.", url: "https://supabase.com/", icon: <CloudRounded /> },
  { name: "Vercel", description: "Platform for frontend devs with instant deployment and a global CDN.", url: "https://vercel.com/", icon: <SpeedRounded /> },
  { name: "Tailwind CSS", description: "Utility-first CSS framework for rapidly building custom designs.", url: "https://tailwindcss.com/", icon: <AutoAwesomeRounded /> },
  { name: "Prisma", description: "Next-generation ORM for Node.js and TypeScript.", url: "https://www.prisma.io/", icon: <BuildRounded /> },
];

const whatToBringItems = [
  { icon: <LaptopRounded />, title: "Your laptop", description: "Fully charged, with your favorite dev environment set up." },
  { icon: <CodeRounded />, title: "Development skills", description: "Programming knowledge in any language — all skill levels welcome." },
  { icon: <TipsAndUpdatesRounded />, title: "Creative problem-solving", description: "An open mindset to tackle real nonprofit challenges." },
  { icon: <GroupsRounded />, title: "Collaborative spirit", description: "Enthusiasm for working with diverse teams and sharing knowledge." },
  { icon: <FavoriteRounded />, title: "Passion for good", description: "A desire to use technology to create positive social impact." },
  { icon: <EmojiEventsRounded />, title: "Competitive energy", description: "Drive to build something amazing in a short timeframe." },
];

function VideoBlock({ src, title }) {
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", maxWidth: 820, margin: "0 auto", borderRadius: 10, border: "1px solid var(--line)" }}>
      <iframe src={src} title={title} loading="lazy" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
    </div>
  );
}

const AboutHackers = () => {
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const formatEventDate = (s, e) => {
    const start = Moment(s);
    const end = Moment(e);
    if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) return start.format("dddd, MMMM Do YYYY");
    return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
  };

  const scrollTo = (id) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);

  return (
    <>
      <Head>
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Volunteer · hacker</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
            Build for good, <span className="ohx-italic">in a weekend.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Join developers, designers, and innovators who turn nonprofit challenges into real technology.
            Seasoned pro or just starting out — our hackathons are the place to learn, create, and make a difference.
          </p>
          <div className="rise" style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}>
            <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={(e) => { e.preventDefault(); scrollTo("upcoming-events"); }}>Find events to join <Arrow /></a>
            <Link href="/volunteer" className="ohx-btn ohx-btn--ghost">Explore all roles</Link>
          </div>
        </section>

        {/* WHAT IS A HACKER (video) */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
          <div className="ohx-narrow" style={{ marginInline: "auto", textAlign: "center", marginBottom: 24 }}>
            <Eyebrow>What is a hacker?</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>A two-minute intro</h2>
            <p className="ohx-muted" style={{ margin: 0 }}>What hackers do at Opportunity Hack — and how you make a difference through code.</p>
          </div>
          <VideoBlock src="https://www.youtube.com/embed/7hrwuBlbCzQ?si=c3RsM0pqEFjak_eS" title="What is a Hacker at Opportunity Hack?" />
        </section>

        {/* HERO IMAGE */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
            <Image src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp" alt="Hackers collaborating on solutions for nonprofits" fill sizes="(max-width: 1120px) 100vw, 1120px" style={{ objectFit: "cover" }} priority />
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <section id="upcoming-events" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Upcoming hackathons</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Start building soon</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
              Join an upcoming hackathon and start shipping solutions that make a real difference.
            </p>
            <Box sx={{ minHeight: { xs: 0, md: 180 } }}>
              {loadingEvents ? (
                <p className="ohx-faint">Loading events…</p>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                  {upcomingEvents.map((event) => (
                    <div key={event.event_id} className="ohx-card" style={{ padding: "24px", background: "var(--surface)" }}>
                      <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>{event.title}</h3>
                      <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>{event.location}</p>
                      <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>{formatEventDate(event.start_date, event.end_date)}</p>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
                        <Link href={`/hack/${event.event_id}/hacker-application`} className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }} onClick={() => track("hacker_apply_upcoming")}>Join as hacker</Link>
                        <Link href={`/hack/${event.event_id}`} className="ohx-link" style={{ fontSize: "0.9rem" }}>Event details <Arrow /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ohx-card" style={{ padding: "32px 28px", background: "var(--surface)" }}>
                  <p className="ohx-muted" style={{ margin: 0 }}>No upcoming events scheduled right now.</p>
                  <Link href="/hack" className="ohx-link" style={{ marginTop: 12 }}>View all hackathons <Arrow /></Link>
                </div>
              )}
            </Box>
            <div style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/hack" className="ohx-link">All hackathons <Arrow /></Link>
              <Link href="/signup" className="ohx-link">Join our community <Arrow /></Link>
            </div>
          </div>
        </section>

        {/* TEAM CREATION (video) */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <div className="ohx-narrow" style={{ marginInline: "auto", textAlign: "center", marginBottom: 24 }}>
            <Eyebrow>Teams</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Find &amp; create your team</h2>
            <p className="ohx-muted" style={{ margin: 0 }}>
              Once accepted, use our team-matching system to find teammates, get your Slack channel, and get approved to start.
            </p>
          </div>
          <VideoBlock src="https://www.youtube.com/embed/cUvbkG91Rf4" title="Hacker Team Creation" />
        </section>

        {/* WHAT HACKERS DO */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>What do hackers do</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Creative problem-solvers</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {[
              { t: "Problem solving", d: "Analyze real nonprofit challenges and design solutions that address root causes." },
              { t: "Rapid development", d: "Build functional prototypes and MVPs with modern frameworks — often in 48 hours." },
              { t: "Team collaboration", d: "Work alongside designers, PMs, and other developers to ship well-rounded solutions." },
            ].map((c, i) => (
              <div key={c.t} className="ohx-card rise" style={{ padding: "24px", animationDelay: `${i * 70}ms` }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.t}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY JOIN */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>Why become a hacker</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>What you get out of it</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[
              { t: "Learn & grow", tag: "Skill development", d: "Accelerate your skills on real projects with mentorship from industry experts." },
              { t: "Build your portfolio", tag: "Career growth", d: "Create compelling projects that show employers and clients what you can do." },
              { t: "Make real impact", tag: "Social good", d: "See your code solve actual problems and help nonprofits serve their communities." },
              { t: "Network & connect", tag: "Community", d: "Meet developers, professionals, and nonprofit leaders from around the world." },
            ].map((c) => (
              <div key={c.t} className="ohx-card" style={{ padding: "24px" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.t}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 14px", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.d}</p>
                <span className="ohx-tag">{c.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* HACKATHON NEVER STOPS */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <p className="ohx-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>The hackathon never stops</p>
            <h2 className="ohx-display" style={{ color: "#fff", marginTop: 8 }}>Start building today — no event required</h2>
            <p style={{ margin: "14px 0 32px", maxWidth: "70ch", color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", lineHeight: 1.6 }}>
              While others wait for the next event, smart developers are already building portfolios, gaining
              experience, and making impact. Every day you wait is a day you could be coding for good.
            </p>
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: 28 }}>
              {[
                { t: "Build momentum", d: "Start small, build confidence, and create a consistent coding habit." },
                { t: "Choose your adventure", d: "Browse dozens of real nonprofit projects and pick one that fits you." },
                { t: "Join an active community", d: "Connect with developers worldwide already collaborating in our Slack." },
              ].map((c) => (
                <div key={c.t} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: "20px 22px" }}>
                  <h3 className="ohx-display" style={{ color: "#fff", fontSize: "1.1rem" }}>{c.t}</h3>
                  <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.82)", fontSize: "0.9rem", lineHeight: 1.5 }}>{c.d}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", maxWidth: "72ch" }}>
              <strong>Pro tip:</strong> developers who start before scheduled hackathons often become team leaders and
              have higher success rates — you arrive with experience, confidence, and proven skills.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/projects" className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }} onClick={() => track("start_now_projects")}>Browse projects &amp; start <Arrow /></Link>
              <Link href="/signup" className="ohx-btn ohx-btn--ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => track("start_now_slack")}>Join Slack</Link>
            </div>
          </div>
        </section>

        {/* WHAT TO BRING */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>What to bring</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Come ready to dive in</h2>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {whatToBringItems.map((item) => (
              <div key={item.title} className="ohx-card" style={{ padding: "22px 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ color: "var(--brand)", display: "inline-flex", marginTop: 2 }}>{item.icon}</span>
                <div>
                  <h3 className="ohx-display" style={{ fontSize: "1.08rem" }}>{item.title}</h3>
                  <p className="ohx-muted" style={{ margin: "6px 0 0", fontSize: "0.92rem", lineHeight: 1.5 }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TOOLBOX */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>Recommended toolbox</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Get a head start</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "60ch" }}>
            Not required — but these frameworks and tools help you build production-ready apps fast.
          </p>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {toolboxItems.map((tool) => (
              <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="ohx-card ohx-card--hover" style={{ padding: "22px 24px", display: "flex", gap: 14, alignItems: "flex-start", textDecoration: "none", color: "inherit" }} onClick={() => track(`toolbox_${tool.name.toLowerCase().replace(/\s/g, "_")}`)}>
                <span style={{ color: "var(--brand)", display: "inline-flex", marginTop: 2 }}>{tool.icon}</span>
                <div>
                  <span className="ohx-display" style={{ fontSize: "1.08rem", display: "inline-flex", alignItems: "center", gap: 6 }}>{tool.name} <span className="ohx-faint" style={{ fontSize: "0.85rem" }}>↗</span></span>
                  <p className="ohx-muted" style={{ margin: "6px 0 0", fontSize: "0.92rem", lineHeight: 1.5 }}>{tool.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FREE HOSTING */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <div className="ohx-card" style={{ padding: "26px 28px", borderLeft: "3px solid var(--accent)" }}>
            <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>Free cloud hosting guide</h3>
            <p className="ohx-muted" style={{ margin: "10px 0 16px", maxWidth: "64ch", fontSize: "0.96rem" }}>
              Deploy your project for free. Our guide covers free-tier hosting options to get your solution online at no cost.
            </p>
            <a className="ohx-link" href="https://www.linkedin.com/pulse/free-tier-web-hosting-status-report-2025-opportunity-hack-ik7fc/" target="_blank" rel="noopener noreferrer" onClick={() => track("free_hosting_guide")}>
              Read the free hosting guide <Arrow />
            </a>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}>
          <Eyebrow>Ready to code for good?</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>Your next project could change lives</h2>
          <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "54ch" }}>
            Join thousands of developers who&apos;ve already used their skills to build technology that makes a difference.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={(e) => { e.preventDefault(); scrollTo("upcoming-events"); }}>Find events to join <Arrow /></a>
            <Link href="/about/mentors" className="ohx-btn ohx-btn--ghost">Learn about mentoring</Link>
            <Link href="/projects" className="ohx-btn ohx-btn--ghost">View projects</Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default AboutHackers;

export const getStaticProps = async () => {
  const title = "Hacker Guide - Build Tech Solutions for Social Impact | Opportunity Hack";
  const description = "Join passionate developers at Opportunity Hack hackathons and build technology solutions that transform nonprofits. Learn new skills, create portfolio projects, and make real social impact through code.";
  return {
    props: {
      title: "Hacker Guide - Opportunity Hack",
      description: description,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp", key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: "https://www.ohack.dev/about/hackers", key: "url" },
        { name: "og:url", property: "og:url", content: "https://www.ohack.dev/about/hackers", key: "ogurl" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp", key: "twitterimage" },
        { name: "twitter:image:alt", property: "twitter:image:alt", content: "Passionate hackers collaborating on technology solutions for nonprofits at Opportunity Hack", key: "twitterimagealt" },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.ohack.dev/#organization",
            "name": "Opportunity Hack",
            "url": "https://www.ohack.dev",
            "logo": { "@type": "ImageObject", "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp" },
            "sameAs": ["https://twitter.com/opportunityhack", "https://github.com/opportunity-hack"],
          },
          {
            "@type": "WebPage",
            "@id": "https://www.ohack.dev/about/hackers#webpage",
            "url": "https://www.ohack.dev/about/hackers",
            "name": title,
            "description": description,
            "isPartOf": { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
            "about": {
              "@type": "EducationalOrganization",
              "name": "Opportunity Hack Hacker Program",
              "description": "Developers and designers build technology solutions for nonprofits through collaborative hackathons",
            },
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ohack.dev" },
              { "@type": "ListItem", "position": 2, "name": "About", "item": "https://www.ohack.dev/about" },
              { "@type": "ListItem", "position": 3, "name": "Hackers", "item": "https://www.ohack.dev/about/hackers" },
            ],
          },
        ],
      },
    },
  };
};
