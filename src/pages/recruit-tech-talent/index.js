import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { RefinedRoot, RefinedFonts, Eyebrow, Stat, Arrow } from "../../components/design/refined";

import {
  VerifiedRounded,
  FavoriteRounded,
  VisibilityRounded,
  BoltRounded,
  CodeRounded,
  DesignServicesRounded,
  InsightsRounded,
  AccountTreeRounded,
  Inventory2Rounded,
} from "@mui/icons-material";

const CANONICAL = "https://www.ohack.dev/recruit-tech-talent";
const OG_IMAGE = "https://cdn.ohack.dev/hackathons/2026_spring_wics_asu/photos/1777269370509_OpportunityHack-104.webp";
const HERO_PHOTO = "https://cdn.ohack.dev/hackathons/2025_fall/photos/1781122606757_IMG_9788.JPG";

const trackClick = (button) => {
  trackEvent({ action: "click_recruit_tech_talent", params: { button } });
};

// Single source of truth: rendered as accordions AND emitted as FAQPage JSON-LD.
const FAQ_ITEMS = [
  {
    q: "What kind of candidates will I meet at Opportunity Hack?",
    a: "A mix of experienced professionals and high-potential students and early-career builders across software engineering, product management, technical program management, design, and data. Every one of them has volunteered nights and weekends to ship real software for a nonprofit, so you're meeting people who build for reasons beyond a paycheck.",
  },
  {
    q: "How is this different from a job board, LinkedIn, or a sourcing tool?",
    a: "Those show you claims. We show you proof. Every Opportunity Hack participant has public work you can inspect before you ever talk to them: open-source code on GitHub, live demos, written project documentation, and DevPost submissions. You evaluate how someone actually scopes a problem, writes code, and ships under a deadline, not how well they wrote a résumé.",
  },
  {
    q: "Do I get access to participant resumes?",
    a: "Yes. Résumé access is included at the Transformer ($5,000) and Visionary ($10,000) sponsorship levels. Active recruiting and interviews are available during and after the event at Transformer, and before, during, and after the event at Visionary. Lower tiers include post-event recruiting touchpoints. See the full benefit grid on our sponsor page.",
  },
  {
    q: "Can my team interview candidates and pitch our company on-site?",
    a: "Absolutely. Sponsors get a booth at the Sponsor Fair (Changemaker and up), can run a sponsored workshop or tech talk to pitch your company and your stack (Transformer and up), and can serve as judges and mentors, which puts your engineers shoulder-to-shoulder with candidates while they build. It's a natural, low-pressure way to evaluate and recruit.",
  },
  {
    q: "Which roles and skills are represented?",
    a: "Software engineering (front-end, back-end, mobile, and cloud across AWS, GCP, and Azure), data science and ML, UX/UI and product design, and product and program management. Our 2023 event alone drew 30+ mentors from leading tech companies and universities, alongside the participant teams.",
  },
  {
    q: "Is there a diversity and early-career talent angle?",
    a: "Yes. Opportunity Hack runs at Arizona State University and draws a wide university and global community of students and career-changers alongside seasoned engineers. If you're building an early-career, internship, or diversity-focused pipeline, you'll meet motivated candidates who are already proving themselves on real projects.",
  },
  {
    q: "How much does it cost to recruit through Opportunity Hack?",
    a: "Sponsorship starts at $1,000 (Innovator). Résumé access and active recruiting begin at the $5,000 Transformer level. Support can be monetary or contributed as volunteer hours valued at $100/hour, so engineering time spent mentoring or judging can count toward your sponsorship. Opportunity Hack is a 501(c)(3), so sponsorships are tax-deductible.",
  },
  {
    q: "How do we get started?",
    a: "Tell us who you're hiring. Submit the contact form and choose 'Recruiting / Hiring Talent.' We'll scope your roles and goals, then line you up to sponsor the next hackathon so you can review résumés, judge, mentor, and recruit candidates while they build.",
  },
];

const VALUE_HOOKS = [
  {
    icon: <VerifiedRounded fontSize="inherit" />,
    title: "Proof over résumés",
    body:
      "Every candidate has shipped real, open-source software you can inspect: GitHub repos, live demos, and project write-ups. Evaluate how they actually build before the first interview.",
  },
  {
    icon: <FavoriteRounded fontSize="inherit" />,
    title: "Mission-driven, higher retention",
    body:
      "These are people who give up weekends to code for social good. Values-aligned hires signal culture fit and tend to stick. You're hiring intrinsic motivation, not just skills.",
  },
  {
    icon: <VisibilityRounded fontSize="inherit" />,
    title: "See candidates in action",
    body:
      "Sponsor to judge, mentor, and watch teams work under deadline. Review résumés, run interviews, and pitch your company directly. It's a working interview, not a 30-minute screen.",
  },
  {
    icon: <BoltRounded fontSize="inherit" />,
    title: "Grit and determination",
    body:
      "Every hackathon starts with the curious and ends with a small group who push all the way through. The people who reach the finish line share the traits we look for in high-performing engineers: grit, iteration, leadership, and the drive to land real impact.",
  },
];

const ROLES = [
  { icon: <CodeRounded fontSize="inherit" />, label: "Software Engineers", note: "Front-end, back-end, mobile, cloud" },
  { icon: <Inventory2Rounded fontSize="inherit" />, label: "Product Managers", note: "Scoping, prioritization, delivery" },
  { icon: <AccountTreeRounded fontSize="inherit" />, label: "Technical PMs", note: "Cross-team execution under deadline" },
  { icon: <DesignServicesRounded fontSize="inherit" />, label: "Designers", note: "UX/UI, research, prototyping" },
  { icon: <InsightsRounded fontSize="inherit" />, label: "Data & ML", note: "Analytics, data science, applied ML" },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us who you're hiring",
    body:
      "Submit the contact form and pick 'Recruiting / Hiring Talent.' Share the roles, levels, and skills you're after so we can point you at the right candidates.",
  },
  {
    n: "02",
    title: "Sponsor the next hackathon",
    body:
      "Choose a sponsorship level. Résumé access and active recruiting start at the Transformer tier; every tier gets you in the room with builders and your brand in front of them.",
  },
  {
    n: "03",
    title: "Meet and recruit candidates",
    body:
      "Review résumés, judge and mentor, run a workshop, and interview on-site. Then follow up with the people whose work and grit impressed you.",
  },
];

const card = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "26px 24px",
};

const iconWrap = {
  fontSize: 26,
  color: "var(--brand)",
  display: "inline-flex",
  marginBottom: 14,
};

const RecruitTechTalent = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <>
      <Head>
        <meta name="robots" content="index, follow" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* ---------------- HERO ---------------- */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              For recruiters &amp; talent teams
            </span>
          </Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}>
            Recruit tech talent that has{" "}
            <span className="ohx-italic">already shipped real software.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}>
            Opportunity Hack is a 501(c)(3) where 3,000+ developers, designers, and product people build
            free software for nonprofits. Every candidate has public proof of work: code, demos, and
            teamwork under deadline. Meet them by sponsoring our next hackathon.
          </p>
          <div
            className="rise"
            style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}
          >
            <Link
              href="/contact?type=recruit"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("hero_contact")}
            >
              Talk to us about hiring <Arrow />
            </Link>
            <Link
              href="/sponsor"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("hero_sponsor")}
            >
              Sponsor &amp; access résumés
            </Link>
          </div>

          <hr className="ohx-rule rise" style={{ marginTop: 52, animationDelay: "300ms" }} />
          <div
            className="rise"
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(28px, 6vw, 64px)",
              animationDelay: "360ms",
            }}
          >
            <Stat value="3,000+" label="Developers" />
            <Stat value="200+" label="Nonprofits served" />
            <Stat value="2013" label="Building since" />
            <Stat value="5" label="Disciplines hiring" />
          </div>
        </section>

        {/* ---------------- SOCIAL-PROOF PHOTO ---------------- */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(8px, 3vh, 24px)" }}>
          <figure
            className="rise"
            style={{ margin: 0, animationDelay: "420ms" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid var(--line)",
                background: "var(--surface-2)",
              }}
            >
              <Image
                src={HERO_PHOTO}
                alt="Software engineers, designers, and product managers collaborating in teams at an Opportunity Hack hackathon"
                fill
                priority
                sizes="(max-width: 1120px) 100vw, 1120px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption
              className="ohx-faint"
              style={{ marginTop: 10, fontSize: "0.82rem", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}
            >
              <span>Opportunity Hack · Fall 2025 · Arizona State University</span>
              <span>The candidates you&apos;d meet, building real software, in teams, under deadline.</span>
            </figcaption>
          </figure>
        </section>

        {/* ---------------- WHY RECRUITERS WORK WITH US ---------------- */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
            <Eyebrow>Why talent teams recruit here</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
              A signal you can&apos;t get from a résumé
            </h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}>
              Sourcing is noisy. Opportunity Hack hands you something rarer: people whose work, values, and
              follow-through are already on the table.
            </p>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {VALUE_HOOKS.map((h) => (
                <div key={h.title} style={card}>
                  <span style={iconWrap}>{h.icon}</span>
                  <h3 className="ohx-display" style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
                    {h.title}
                  </h3>
                  <p className="ohx-muted" style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}>
                    {h.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="ohx-muted" style={{ marginTop: 26, fontSize: "0.95rem" }}>
              See the proof for yourself:{" "}
              <Link href="/projects" className="ohx-link" onClick={() => trackClick("browse_projects")}>
                browse what teams have shipped <Arrow />
              </Link>
              {"  "}
              <Link href="/about/success-stories" className="ohx-link" onClick={() => trackClick("success_stories")} style={{ marginLeft: 18 }}>
                read success stories <Arrow />
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------- ROLES ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
          <Eyebrow>The roles you&apos;ll meet</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
            One event, five disciplines
          </h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 32, maxWidth: "62ch" }}>
            Hackathon teams ship like real product teams, which means you meet the full cast you&apos;re
            hiring for, working together in one room.
          </p>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            {ROLES.map((r) => (
              <div key={r.label} style={{ ...card, padding: "22px 20px" }}>
                <span style={{ ...iconWrap, marginBottom: 10 }}>{r.icon}</span>
                <h3 className="ohx-display" style={{ fontSize: "1.05rem", margin: "0 0 4px" }}>
                  {r.label}
                </h3>
                <p className="ohx-faint" style={{ margin: 0, fontSize: "0.85rem" }}>
                  {r.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- SPONSOR = HIRING ACCESS ---------------- */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
            <Eyebrow>How sponsoring becomes hiring access</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
              Get in the room, then get the hire
            </h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "64ch" }}>
              Sponsorship is how recruiters access candidates at Opportunity Hack. Each level unlocks more
              ways to meet, evaluate, and recruit. Support counts whether it&apos;s a check or your
              engineers&apos; volunteer hours ($100/hour).
            </p>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <div style={card}>
                <span className="ohx-tag">Innovator · $1,000</span>
                <p className="ohx-muted" style={{ margin: "14px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>
                  Brand presence, unlimited mentor seats, and a judging seat that gets your engineers next to
                  candidates while they build.
                </p>
              </div>
              <div style={card}>
                <span className="ohx-tag">Changemaker · $2,500</span>
                <p className="ohx-muted" style={{ margin: "14px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>
                  Everything in Innovator plus a booth at the Sponsor Fair and post-event recruiting
                  touchpoints.
                </p>
              </div>
              <div style={{ ...card, borderColor: "var(--brand)" }}>
                <span className="ohx-tag ohx-tag--accent">Transformer · $5,000 · résumé access</span>
                <p className="ohx-muted" style={{ margin: "14px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>
                  <strong>Participant résumé access</strong>, recruiting and interviews during and after the
                  event, and a sponsored workshop or tech talk to pitch your company and stack.
                </p>
              </div>
              <div style={card}>
                <span className="ohx-tag ohx-tag--accent">Visionary · $10,000 · full access</span>
                <p className="ohx-muted" style={{ margin: "14px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>
                  Résumé access plus recruiting before, during, and after the event, with first look at the
                  strongest candidates and maximum face time.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link href="/sponsor" className="ohx-btn ohx-btn--primary" onClick={() => trackClick("benefits_sponsor")}>
                See full levels &amp; benefits <Arrow />
              </Link>
              <Link href="/contact?type=recruit" className="ohx-btn ohx-btn--ghost" onClick={() => trackClick("benefits_contact")}>
                Ask which tier fits our hiring
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 32 }}>
            From &ldquo;we&apos;re hiring&rdquo; to a signed offer
          </h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {STEPS.map((s) => (
              <div key={s.n} style={card}>
                <div
                  className="ohx-display"
                  style={{ fontSize: "2rem", color: "var(--accent)", lineHeight: 1, marginBottom: 12 }}
                >
                  {s.n}
                </div>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem", margin: "0 0 8px" }}>
                  {s.title}
                </h3>
                <p className="ohx-muted" style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="ohx-narrow ohx-wrap" style={{ marginInline: "auto", paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(48px, 8vh, 88px)" }}>
            <Eyebrow>Recruiter FAQ</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>
              Questions talent teams ask
            </h2>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <details
                  key={i}
                  style={{
                    borderTop: i === 0 ? "1px solid var(--line)" : "none",
                    borderBottom: "1px solid var(--line)",
                    padding: "18px 2px",
                  }}
                >
                  <summary
                    className="ohx-display"
                    style={{
                      fontSize: "1.05rem",
                      cursor: "pointer",
                      listStyle: "none",
                      color: "var(--ink)",
                    }}
                  >
                    {item.q}
                  </summary>
                  <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FINAL CTA ---------------- */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(56px, 9vh, 104px)", paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}>
          <h2 className="ohx-display" style={{ marginBottom: 14, maxWidth: "22ch", marginInline: "auto" }}>
            Hire people who&apos;ve already <span className="ohx-italic">proven it.</span>
          </h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch", marginInline: "auto" }}>
            Tell us who you&apos;re hiring and we&apos;ll get you in front of candidates at the next
            Opportunity Hack, with résumés, interviews, and a stage to pitch your company.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <Link href="/contact?type=recruit" className="ohx-btn ohx-btn--primary" onClick={() => trackClick("footer_contact")}>
              Request hiring info <Arrow />
            </Link>
            <Link href="/sponsor" className="ohx-btn ohx-btn--ghost" onClick={() => trackClick("footer_sponsor")}>
              Become a sponsor
            </Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default RecruitTechTalent;

export const getStaticProps = async () => {
  const title =
    "Recruit Tech Talent: Hire Engineers, PMs & Designers Who Ship Real Software | Opportunity Hack";
  const description =
    "Recruit software engineers, product managers, TPMs, designers, and data talent who have shipped real, open-source software for nonprofits. Sponsor an Opportunity Hack hackathon for résumé access, on-site recruiting, and a direct line to mission-driven candidates.";

  return {
    props: {
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
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content: "Developers, designers, and product people building software in teams at an Opportunity Hack hackathon",
          key: "twitterimagealt",
        },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
        {
          name: "keywords",
          property: "keywords",
          content:
            "recruit software engineers, hire developers, tech talent pipeline, hackathon recruiting, sponsor a hackathon to hire, diverse engineering candidates, university recruiting tech, early career software engineers, hire product managers, hire technical program managers, hire UX designers, hire data scientists, open source candidates, technical recruiting events, recruit tech talent",
          key: "keywords",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.ohack.dev/#organization",
            name: "Opportunity Hack",
            url: "https://www.ohack.dev",
            logo: {
              "@type": "ImageObject",
              url: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
            },
            sameAs: [
              "https://www.linkedin.com/company/opportunity-hack/",
              "https://github.com/opportunity-hack",
              "https://twitter.com/opportunityhack",
            ],
          },
          {
            "@type": "WebPage",
            "@id": CANONICAL + "#webpage",
            url: CANONICAL,
            name: title,
            description: description,
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            about: {
              "@type": "Service",
              name: "Tech Recruiting & Talent Sourcing via Hackathon Sponsorship",
              provider: {
                "@type": "Organization",
                name: "Opportunity Hack",
              },
              areaServed: "Worldwide",
              serviceType: "Technical Recruiting",
              audience: {
                "@type": "Audience",
                audienceType: "Recruiters and Talent Acquisition Teams",
              },
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "Recruit Tech Talent", item: CANONICAL },
            ],
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
  };
};
