import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import {
  RefinedRoot,
  Eyebrow,
  Stat,
  Arrow,
} from "../../components/design/refined";

import {
  BusinessRounded,
  GroupsRounded,
  CodeRounded,
  HandshakeRounded,
} from "@mui/icons-material";

const CANONICAL = "https://www.ohack.dev/coding-for-nonprofits";
const HERO_PHOTO = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

const trackClick = (buttonName) => {
  trackEvent({
    action: "click_coding_for_nonprofits",
    params: { button: buttonName },
  });
};

// Single source of truth: rendered as <details> accordions AND emitted as
// FAQPage JSON-LD from getStaticProps.
const FAQ_ITEMS = [
  {
    q: "Is the software really free for nonprofits?",
    a: "Yes. There are no fees at any stage of the process. Opportunity Hack is funded by corporate sponsors and individual donors, which means our nonprofit partners pay nothing — not for the hackathon weekend, not for the Founding Engineer follow-on work, not for hosting (we help arrange free hosting credits where possible). The only thing we ask in return is that nonprofits stay engaged with the project team during development.",
  },
  {
    q: "What's the catch?",
    a: "There isn't one, but there are constraints. Hackathon teams have a weekend to ship a prototype. The scope of what we can build in that window is real — a focused tool that solves one specific problem, not a full enterprise platform. The Founding Engineer program extends timelines, but we still scope projects to what volunteer engineers can sustainably ship in their nights and weekends.",
  },
  {
    q: "Who owns the code?",
    a: "The nonprofit. Every project we build is licensed to the nonprofit (or open-sourced when both sides agree). Opportunity Hack does not retain commercial rights, IP claims, or revenue-share. The volunteer developers who built the project are credited but don't claim ownership — they signed onto the volunteer agreement before the hackathon started.",
  },
  {
    q: "What if our project needs ongoing maintenance after the hackathon?",
    a: "That's exactly what the Founding Engineer program is for. After the hackathon, we pair successful projects with one or two engineers who continue building for weeks or months — deploying to production, fixing bugs, training your staff to use and maintain the system. Long-term ongoing maintenance (years out) typically transitions to the nonprofit's own technical capacity, with our network available for consultation.",
  },
  {
    q: "Are these production-ready solutions, or just hackathon prototypes?",
    a: 'Hackathon weekend output is a working prototype, not production-ready. The path from prototype to production runs through the Founding Engineer program. Past nonprofit projects have ranged from "the prototype was enough — we deployed it as-is" to "took six more months of evening work to harden, deploy, and train staff." The team scopes the post-hackathon plan with each nonprofit before the event.',
  },
  {
    q: "We're not located in Arizona — can our nonprofit still apply?",
    a: "Absolutely. Many of our nonprofit partners are outside Arizona, and several are international (we've worked with organizations in India, the Philippines, and elsewhere). Our hackathons happen at ASU in Tempe, but the work itself happens remotely or hybrid. Nonprofits don't need to attend in person to participate — we just need engaged stakeholders available by video and email during the project.",
  },
  {
    q: "Does our nonprofit need any technical staff to participate?",
    a: "No technical staff required. About half of the nonprofits we work with have zero in-house engineers. What we do need is a stakeholder — usually an executive director, program manager, or operations lead — who can answer questions about workflows, give feedback on prototypes, and ultimately use the software once it ships. Without that engaged stakeholder, projects stall.",
  },
  {
    q: "How long does the whole process take, from application to deployed software?",
    a: "Plan on 4-12 weeks total. Applications open ~8 weeks before each hackathon. The hackathon weekend itself produces the prototype. The Founding Engineer follow-on typically lasts 4-8 weeks for straightforward projects, longer for more complex ones. Some projects deploy the hackathon prototype as-is within days; others spend the full 12 weeks reaching production.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Apply",
    body: "Submit a one-page application describing the problem you want to solve. Any 501(c)(3) (or international equivalent) is eligible. We help you refine the scope into a clear problem statement that volunteer engineers can build against in a hackathon weekend.",
  },
  {
    n: "02",
    title: "Get matched",
    body: "Four to eight weeks before the hackathon, we match your problem statement with a team of volunteer developers — typically 3-5 hackers ranging from senior engineers to early-career talent. Mentors and judges are pulled from our network of senior tech leaders.",
  },
  {
    n: "03",
    title: "Build & continue",
    body: "The hackathon weekend produces a working prototype. From there, our Founding Engineer program pairs your nonprofit with one or two engineers who keep building, deploy to production, and train your team. No fees. You own the code.",
  },
];

const GOOD_FIT = [
  "Volunteer scheduling and shift management",
  "Donor and grant tracking dashboards",
  "Case management for service nonprofits",
  "Internal admin tools for staff workflows",
  "Impact reporting pipelines (data to board-ready charts)",
  "Public community platforms with member portals",
];

const POOR_FIT = [
  "Mobile apps requiring multi-year iOS/Android maintenance",
  "Generic CRM replacements (use Salesforce nonprofit edition)",
  "AI/ML startups disguised as nonprofits",
  "Anything requiring a full-time engineering team",
];

const WHY = [
  {
    icon: <BusinessRounded fontSize="inherit" />,
    title: "The capacity gap",
    body: "There are roughly 1.5 million nonprofits in the United States. Most can't justify $50,000–$200,000 for custom software development, even when the ROI is obvious in staff hours saved. Generic SaaS tools cover the most common workflows but break down at the edges where nonprofits actually live — multi-program case management, mixed funding tracking, region-specific compliance.",
  },
  {
    icon: <GroupsRounded fontSize="inherit" />,
    title: "The talent gap",
    body: "On the developer side, thousands of senior software engineers want to use their skills for social good but bounce off the typical volunteer experience: vague scope, no end date, no peers to work alongside. The hackathon format creates a timeboxed commitment with a working team. The Founding Engineer program creates the ongoing path for the engineers who want to go deeper.",
  },
];

const PATHS = [
  {
    icon: <BusinessRounded fontSize="inherit" />,
    title: "For nonprofits",
    body: "Apply for a free software project. We work with 501(c)(3) organizations of all sizes. The application takes about 20 minutes.",
    href: "/nonprofits/apply",
    label: "Apply as a nonprofit",
    track: "apply_nonprofit_participate",
  },
  {
    icon: <CodeRounded fontSize="inherit" />,
    title: "For developers",
    body: "Join the next hackathon as a hacker. Beginner-friendly — we pair junior engineers with senior mentors. Senior engineers can also volunteer as Founding Engineers for ongoing work.",
    href: "/hack",
    label: "See upcoming hackathons",
    track: "see_hackathons",
  },
  {
    icon: <HandshakeRounded fontSize="inherit" />,
    title: "For sponsors",
    body: "Fund the model. Sponsors keep the program free for nonprofits and reserve dedicated mentor/judge slots for their teams as a professional-development perk.",
    href: "/sponsor",
    label: "Become a sponsor",
    track: "become_sponsor",
  },
];

const sectionPad = {
  paddingTop: "clamp(48px, 8vh, 88px)",
  paddingBottom: "clamp(48px, 8vh, 88px)",
};

const band = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

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

const prose = {
  margin: "0 0 16px",
  maxWidth: "68ch",
  lineHeight: 1.65,
};

const CodingForNonprofits = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <RefinedRoot>
      {/* ---------------- HERO ---------------- */}
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(104px, 13vh, 156px)",
          paddingBottom: "clamp(28px, 5vh, 48px)",
        }}
      >
        <Eyebrow>
          <span className="rise" style={{ display: "inline-block" }}>
            Free software for nonprofits · since 2013
          </span>
        </Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}
        >
          Coding for nonprofits,{" "}
          <span className="ohx-italic">built by volunteer engineers.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
        >
          Opportunity Hack connects volunteer software developers with
          nonprofits that need custom technology but can&apos;t afford to build
          it. Since 2013, more than 3,000 developers have built free software
          for over 200 nonprofits — volunteer scheduling tools, donor management
          systems, impact dashboards, community platforms, and the dozens of
          other small-but-essential apps that keep mission-driven organizations
          running.
        </p>
        <p
          className="ohx-muted rise"
          style={{
            marginTop: 14,
            animationDelay: "190ms",
            maxWidth: "62ch",
            fontSize: "0.95rem",
          }}
        >
          We&apos;re a 501(c)(3) ourselves, organizing weekend hackathons paired
          with an ongoing Founding Engineer model so the work doesn&apos;t end
          when the hackathon does.
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
            href="/nonprofits/apply"
            className="ohx-btn ohx-btn--primary"
            onClick={() => trackClick("apply_nonprofit_hero")}
          >
            Apply as a nonprofit <Arrow />
          </Link>
          <Link
            href="/volunteer"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => trackClick("volunteer_developer_hero")}
          >
            Volunteer as a developer
          </Link>
        </div>

        <hr
          className="ohx-rule rise"
          style={{ marginTop: 52, animationDelay: "300ms" }}
        />
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
          <Stat value="3,000+" label="Volunteer developers" />
          <Stat value="200+" label="Nonprofits served" />
          <Stat value="2013" label="Building since" />
          <Stat value="$0" label="Cost to nonprofits" />
        </div>
      </section>

      {/* ---------------- HERO PHOTO ---------------- */}
      <section
        className="ohx-wrap"
        style={{ paddingBottom: "clamp(8px, 3vh, 24px)" }}
      >
        <figure className="rise" style={{ margin: 0, animationDelay: "420ms" }}>
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
              alt="Volunteer software developers and nonprofits collaborating at an Opportunity Hack hackathon"
              fill
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <figcaption
            className="ohx-faint"
            style={{ marginTop: 10, fontSize: "0.82rem" }}
          >
            Volunteer engineers and nonprofit stakeholders scoping a project
            together at an Opportunity Hack weekend.
          </figcaption>
        </figure>
      </section>

      {/* ---------------- WHAT IT MEANS ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Our model</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 22 }}>
          What &ldquo;coding for nonprofits&rdquo; means at Opportunity Hack
        </h2>
        <p style={prose}>
          Most &ldquo;coding for nonprofits&rdquo; programs deliver one of three
          things: a generic donation page, a few hours of pro-bono consulting,
          or a beautifully scoped project that quietly dies after the volunteer
          demo. Our model is different.
        </p>
        <p style={prose}>
          When a nonprofit comes to Opportunity Hack, they get a small team of
          volunteer engineers who write actual production code over a weekend,
          and — critically — a path to keep that code maintained afterward. The
          hackathon weekend is the kickoff, not the deliverable. We pair every
          project with a Founding Engineer who continues working with the
          nonprofit in the weeks and months that follow.
        </p>
        <p style={{ ...prose, marginBottom: 0 }}>
          The result is software that nonprofits actually deploy. Custom tools
          tailored to the nonprofit&apos;s specific workflow. Code the nonprofit
          fully owns. No vendor lock-in. No subscription fees. No
          &ldquo;donation in exchange for our SaaS.&rdquo;
        </p>
      </section>

      {/* ---------------- HOW NONPROFITS GET FREE SOFTWARE ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>How it works</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 32 }}
          >
            How nonprofits get free software
          </h2>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {STEPS.map((s) => (
              <div key={s.n} style={card}>
                <div
                  className="ohx-display"
                  style={{
                    fontSize: "2rem",
                    color: "var(--accent)",
                    lineHeight: 1,
                    marginBottom: 12,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", margin: "0 0 8px" }}
                >
                  {s.title}
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- WHAT KINDS OF PROJECTS ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Project fit</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          What kinds of projects we build
        </h2>
        <p
          className="ohx-muted"
          style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
        >
          Our most successful projects share a pattern: a clear, specific
          operational problem that&apos;s blocking the nonprofit&apos;s mission.
          The kinds of projects that work well at Opportunity Hack are the
          unglamorous, internal-tool projects that commercial software vendors
          ignore — but that save nonprofit staff hours of manual work every
          week.
        </p>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={card}>
            <h3
              className="ohx-display"
              style={{ fontSize: "1.15rem", margin: "0 0 14px" }}
            >
              Projects that work well
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {GOOD_FIT.map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "8px 0",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color: "var(--brand)",
                      fontWeight: 700,
                      flexShrink: 0,
                      width: 14,
                    }}
                  >
                    +
                  </span>
                  <span style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div style={card}>
            <h3
              className="ohx-display"
              style={{ fontSize: "1.15rem", margin: "0 0 14px" }}
            >
              Projects that don&apos;t fit our model
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {POOR_FIT.map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "8px 0",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color: "var(--faint)",
                      fontWeight: 700,
                      flexShrink: 0,
                      width: 14,
                    }}
                  >
                    ×
                  </span>
                  <span
                    className="ohx-muted"
                    style={{ fontSize: "0.95rem", lineHeight: 1.5 }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          style={{
            ...card,
            marginTop: 20,
            background: "var(--surface-2)",
            padding: "18px 22px",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          <strong>Real examples</strong> — past Opportunity Hack nonprofit
          alumni include HomeFirst Services (homelessness case management),
          Vidyodaya (teacher training portal for tribal schools in India), and
          Saving One Life (animal adoption matching platform).{" "}
          <Link href="/nonprofits" className="ohx-link">
            Browse the full list of nonprofit projects <Arrow />
          </Link>
        </div>
      </section>

      {/* ---------------- WHY WE DO IT THIS WAY ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Why this model</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 32 }}
          >
            Why we do it this way
          </h2>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {WHY.map((w) => (
              <div key={w.title} style={card}>
                <span style={iconWrap}>{w.icon}</span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.2rem", margin: "0 0 8px" }}
                >
                  {w.title}
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  {w.body}
                </p>
              </div>
            ))}
          </div>

          {/* The multiplier effect — navy band */}
          <div
            style={{
              marginTop: 24,
              padding: "32px 30px",
              background: "var(--brand)",
              borderRadius: 10,
              color: "#fff",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ maxWidth: "60ch" }}>
              <p
                className="ohx-eyebrow"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                The multiplier effect
              </p>
              <h3
                className="ohx-display"
                style={{ fontSize: "1.5rem", marginTop: 8, color: "#fff" }}
              >
                Every project we ship recruits the next team
              </h3>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Every nonprofit project we ship recruits more volunteer
                engineers. Every senior engineer who becomes a mentor or judge
                brings their professional network with them. Coding for social
                good stops being something developers do instead of their day
                job and becomes a way to amplify it. That&apos;s why we&apos;ve
                grown from a single weekend hackathon in 2013 to a year-round
                program serving 200+ nonprofits.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/about"
                className="ohx-btn"
                style={{ background: "#fff", color: "var(--brand)" }}
                onClick={() => trackClick("read_our_story")}
              >
                Read our story
              </Link>
              <Link
                href="/hackathon-judge-opportunities"
                className="ohx-btn ohx-btn--ghost"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
                onClick={() => trackClick("become_mentor_judge")}
              >
                Become a mentor or judge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW TO PARTICIPATE ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Get involved</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 32 }}>
          How to participate
        </h2>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {PATHS.map((p) => (
            <div
              key={p.title}
              style={{ ...card, display: "flex", flexDirection: "column" }}
            >
              <span style={iconWrap}>{p.icon}</span>
              <h3
                className="ohx-display"
                style={{ fontSize: "1.2rem", margin: "0 0 8px" }}
              >
                {p.title}
              </h3>
              <p
                className="ohx-muted"
                style={{
                  margin: "0 0 18px",
                  fontSize: "0.95rem",
                  lineHeight: 1.55,
                  flexGrow: 1,
                }}
              >
                {p.body}
              </p>
              <Link
                href={p.href}
                className="ohx-link"
                onClick={() => trackClick(p.track)}
              >
                {p.label} <Arrow />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section style={band}>
        <div
          className="ohx-narrow ohx-wrap"
          style={{ marginInline: "auto", ...sectionPad }}
        >
          <Eyebrow>Nonprofit FAQ</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 28 }}
          >
            Frequently asked questions
          </h2>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={item.q}
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
                <p
                  className="ohx-muted"
                  style={{
                    margin: "12px 0 0",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(56px, 9vh, 104px)",
          paddingBottom: "clamp(56px, 9vh, 104px)",
          textAlign: "center",
        }}
      >
        <h2
          className="ohx-display"
          style={{ marginBottom: 14, maxWidth: "22ch", marginInline: "auto" }}
        >
          Ready to <span className="ohx-italic">start?</span>
        </h2>
        <p
          className="ohx-muted"
          style={{
            marginTop: 0,
            marginBottom: 12,
            maxWidth: "56ch",
            marginInline: "auto",
          }}
        >
          Whether you&apos;re a nonprofit looking for software, a developer
          looking to do meaningful work, or a sponsor looking to fund the model
          — we&apos;d love to hear from you.
        </p>
        <p
          className="ohx-muted"
          style={{
            marginTop: 0,
            marginBottom: 28,
            maxWidth: "56ch",
            marginInline: "auto",
            fontSize: "0.95rem",
          }}
        >
          Interested in the event itself?{" "}
          <Link href="/hackathon-for-social-good" className="ohx-link">
            Learn about our hackathon for social good
          </Link>{" "}
          — the annual flagship where all this work begins.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link
            href="/nonprofits/apply"
            className="ohx-btn ohx-btn--primary"
            onClick={() => trackClick("apply_nonprofit_final")}
          >
            Apply as a nonprofit <Arrow />
          </Link>
          <Link
            href="/volunteer"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => trackClick("volunteer_developer_final")}
          >
            Volunteer as a developer
          </Link>
          <Link
            href="/sponsor"
            className="ohx-link"
            onClick={() => trackClick("become_sponsor_final")}
          >
            Become a sponsor <Arrow />
          </Link>
        </div>
      </section>
    </RefinedRoot>
  );
};

export default CodingForNonprofits;

export const getStaticProps = async () => {
  const title =
    "Coding for Nonprofits: Free Software Development | Opportunity Hack";
  const description =
    "Learn how Opportunity Hack connects volunteer developers with nonprofits to build free, custom software. 200+ nonprofits served since 2013 through hackathons and our Founding Engineer program.";
  const canonicalUrl = CANONICAL;
  const ogImage = HERO_PHOTO;

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
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: canonicalUrl, key: "url" },
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
            "Volunteer software developers and nonprofits collaborating at an Opportunity Hack hackathon",
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
            "coding for nonprofits, nonprofit software development, coding for charity, coding for social good, free software for nonprofits, hackathon for social good, develop for good, code for good",
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
            "@id": canonicalUrl + "#webpage",
            url: canonicalUrl,
            name: title,
            description: description,
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            about: {
              "@type": "Service",
              name: "Free Software Development for Nonprofits",
              provider: {
                "@type": "Organization",
                name: "Opportunity Hack",
              },
              areaServed: "Worldwide",
              serviceType: "Software Development",
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
                name: "Coding for Nonprofits",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          },
        ],
      },
    },
  };
};
