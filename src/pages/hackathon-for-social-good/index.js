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
  TrendingUpRounded,
  BalanceRounded,
} from "@mui/icons-material";

const CANONICAL = "https://www.ohack.dev/hackathon-for-social-good";
const HERO_PHOTO = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

const trackClick = (buttonName) => {
  trackEvent({
    action: "click_hackathon_for_social_good",
    params: { button: buttonName },
  });
};

// Single source of truth: rendered as <details> accordions AND emitted as
// FAQPage JSON-LD from getStaticProps.
const FAQ_ITEMS = [
  {
    q: 'What is a "hackathon for social good"?',
    a: "A hackathon for social good is an event where teams build software addressing a charitable, civic, environmental, or community problem — typically for a nonprofit, NGO, or public-sector organization. Opportunity Hack runs the longest-running version of this format in the US, with the distinguishing feature that projects continue past the hackathon weekend through our Founding Engineer program.",
  },
  {
    q: "When and where is the next Opportunity Hack hackathon?",
    a: "The annual flagship hackathon for social good is November 14-15, 2026 at Arizona State University in Tempe, AZ. Registration opens roughly 8 weeks before the event. Smaller and more frequent online events also happen throughout the year.",
  },
  {
    q: "Do I need experience to participate as a developer?",
    a: "No. Opportunity Hack runs with a high mentor-to-hacker ratio (roughly 1:3) specifically so beginner developers can ship real working code. About a third of our participants in any given event are at their first hackathon. Senior engineers handle architecture and debugging; beginners contribute code, design, and project work alongside them.",
  },
  {
    q: "Is the hackathon free to attend?",
    a: "Yes — for hackers, mentors, judges, and nonprofits the event is free. Food, swag, and event infrastructure are funded by corporate sponsors. Travel and accommodations are the participant's responsibility, though regional participants typically can attend without travel.",
  },
  {
    q: "What happens to the projects after the hackathon ends?",
    a: "Successful projects enter our Founding Engineer program — one or two volunteer engineers continue working with the nonprofit for weeks or months after the event, deploying the project to production, fixing bugs, and training the nonprofit's staff. Some projects deploy as-is from the hackathon weekend; others take 4-12 weeks to reach production.",
  },
  {
    q: "Can my company sponsor the hackathon for social good?",
    a: "Yes — sponsorship is the primary funding model. Tiers range from category-prize sponsorship to full event title sponsorship. Sponsors get logo presence, dedicated mentor/judge slots for their teams (a popular professional development perk), and recruiting access to participants. See sponsorship details at /sponsor.",
  },
  {
    q: "What technology stack does the hackathon use?",
    a: "Whatever the team picks. We don't mandate a stack. Most teams use a web stack (React/Next.js, Node, Postgres, etc.) because that's what nonprofits can host most cheaply, but mobile, data-pipeline, and even hardware projects have shipped at past events. The judging rubric is technology-agnostic.",
  },
  {
    q: 'How is this different from a corporate "hackathon for good" event?',
    a: "Corporate hack-for-good events are typically internal, single-company, with employees building speculative ideas. Opportunity Hack is external and cross-company, with developers from many organizations building for actual nonprofit clients. The depth of mentor support, the post-event continuation program, and the 13-year track record are also distinguishing.",
  },
];

const PILLARS = [
  {
    icon: <BusinessRounded fontSize="inherit" />,
    title: "It starts with a real nonprofit problem",
    body: 'Every project at Opportunity Hack begins with a problem statement from a real 501(c)(3) nonprofit. No fictional case studies, no "imagine if" scenarios. Teams are matched 4-8 weeks before the event so they can scope the problem, talk to the nonprofit\'s stakeholders, and arrive at the hackathon ready to build — not ready to brainstorm.',
  },
  {
    icon: <TrendingUpRounded fontSize="inherit" />,
    title: "It produces software that ships",
    body: "Hackathon prototypes that die on Sunday afternoon don't help nonprofits. Our Founding Engineer program pairs successful weekend projects with developers who continue working in the weeks and months after — deploying to production, fixing bugs, training nonprofit staff. The work doesn't stop when the hackathon does.",
  },
  {
    icon: <GroupsRounded fontSize="inherit" />,
    title: "It scales the volunteer engineering model",
    body: "Each event recruits more developers into ongoing volunteer roles. Senior engineers become mentors. Mentors become judges. Judges become sponsors who fund the next event. The hackathon itself is a recruiting funnel for sustained volunteer engineering — that's why the impact compounds across years.",
  },
];

const TIMELINE = [
  {
    n: "01",
    title: "4-8 weeks before: matching",
    body: "Nonprofits submit problem statements. Volunteer engineers sign up to hack, mentor, or judge. The OHack team matches projects to teams based on skills, interest, and team size. Stakeholder calls happen so the team understands the nonprofit's real workflow before code starts.",
  },
  {
    n: "02",
    title: "Friday evening: kickoff",
    body: "Teams meet in person (or remote for online events). Nonprofit stakeholders introduce their problem statement. Mentors circulate. Setup, scoping, and the first commits happen. Most teams sleep that night.",
  },
  {
    n: "03",
    title: "Saturday & Sunday: building",
    body: "~36 hours of focused work. Mentors are present continuously — both senior engineers (architecture, debugging) and domain experts (nonprofit operations, accessibility, security). Judges arrive Sunday afternoon for live demos.",
  },
  {
    n: "04",
    title: "Sunday night through the following weeks: shipping",
    body: null, // rendered inline — carries the judging-criteria link
  },
];

const DIFFERENCES = [
  {
    title: "Real nonprofits, not hypothetical ones",
    body: "Every team builds for a real 501(c)(3) with a real operational problem. Stakeholders are reachable during the hackathon. The team knows whether their work will actually be deployed because the deployment plan is part of the project from day one.",
  },
  {
    title: "Senior mentor density",
    body: "Most hackathons have 1 mentor per 10 teams. Opportunity Hack runs 1 mentor per 2-3 teams, with mentors drawn from senior engineers, technical PMs, and nonprofit-tech veterans. That ratio is why beginner teams ship working code at OHack when they wouldn't elsewhere.",
  },
  {
    title: "Post-hackathon continuation",
    body: "The Founding Engineer program is the half of OHack that other hackathons don't have. Top projects pair with one or two engineers who continue building for weeks or months. That's the difference between a prototype and a deployed system.",
  },
  {
    title: "Open-source rubric",
    body: null, // rendered inline — carries the judging-criteria link
  },
];

const PATHS = [
  {
    icon: <GroupsRounded fontSize="inherit" />,
    title: "For developers",
    body: "Whether you're a senior engineer or first-time hackathon participant, OHack has a role. Beginner teams are paired with senior mentors. Senior engineers can stretch by tackling harder projects or volunteering as Founding Engineers post-event.",
    href: "/hack",
    label: "Join the hackathon",
    track: "join_hackathon_participate",
  },
  {
    icon: <BalanceRounded fontSize="inherit" />,
    title: "For mentors and judges",
    body: "Senior engineers, technical PMs, and design leaders can volunteer as mentors (in-event guidance) or judges (project evaluation). Both are unpaid; both count toward most employer ESG / volunteer-time programs.",
    href: "/hackathon-judge-opportunities",
    label: "Apply to judge or mentor",
    track: "apply_judge_mentor_participate",
  },
  {
    icon: <BusinessRounded fontSize="inherit" />,
    title: "For sponsors",
    body: "Companies can fund the model — sponsorship keeps the event free for nonprofits and developers. Sponsorship tiers include dedicated mentor/judge slots and recruiting access. Many sponsors return year over year.",
    href: "/sponsor",
    label: "Become a sponsor",
    track: "become_sponsor_participate",
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

const HackathonForSocialGood = () => {
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
            Annual flagship event · November 14–15, 2026 · ASU Tempe
          </span>
        </Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}
        >
          A hackathon for social good where the software{" "}
          <span className="ohx-italic">keeps running after the demo.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
        >
          A hackathon for social good isn&apos;t just a hackathon with a
          charitable theme — it&apos;s an event where the projects keep running
          after the demo ends. Most hackathons celebrate the prototype.
          Opportunity Hack celebrates what happens <em>after</em> the prototype:
          the nonprofit deploying the tool, the volunteers continuing to
          maintain it, the staff hours saved every week from then on.
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
          We&apos;ve been running this model since 2013. Over 3,000 developers,
          designers, and engineers have built software for more than 200
          nonprofits across our weekend hackathons and the year-round Founding
          Engineer program that follows. The annual flagship event lands each
          fall at ASU in Tempe, Arizona — the next one is{" "}
          <strong>November 14-15, 2026</strong>. This page is the front door for
          everyone who wants in: developers, mentors, judges, sponsors, and
          nonprofits. Pick the path that fits.
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
            onClick={() => trackClick("register_fall_2026_hero")}
          >
            Register for Fall 2026 <Arrow />
          </Link>
          <Link
            href="/sponsor"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => trackClick("sponsor_event_hero")}
          >
            Sponsor the event
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
          <Stat value="3,000+" label="Developers, designers, engineers" />
          <Stat value="200+" label="Nonprofits served" />
          <Stat value="2013" label="Year founded" />
          <Stat value="1 : 3" label="Mentor-to-hacker ratio" />
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
              alt="Developers, mentors, and nonprofits collaborating at the Opportunity Hack hackathon for social good at ASU"
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
            Opportunity Hack · Arizona State University, Tempe
          </figcaption>
        </figure>
      </section>

      {/* ---------------- WHAT MAKES IT SOCIAL GOOD ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>The definition</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 32 }}
          >
            What makes a hackathon a hackathon for social good
          </h2>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {PILLARS.map((p) => (
              <div key={p.title} style={card}>
                <span style={iconWrap}>{p.icon}</span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.2rem", margin: "0 0 8px" }}
                >
                  {p.title}
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW THE HACKATHON WORKS ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>The weekend</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          How the hackathon actually works
        </h2>
        <p
          className="ohx-muted"
          style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
        >
          A weekend at Opportunity Hack looks like a standard hackathon on the
          surface — code, food, demos, prizes. The differences are in the
          structure: pre-event scoping, in-event mentor depth, and post-event
          continuation. Here&apos;s the timeline of an OHack event.
        </p>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, maxWidth: 820 }}>
          {TIMELINE.map((t, i) => (
            <li
              key={t.n}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 18,
                padding: "22px 0",
                borderTop: "1px solid var(--line)",
                borderBottom:
                  i === TIMELINE.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span
                className="ohx-display"
                style={{
                  fontSize: "1.6rem",
                  color: "var(--accent)",
                  lineHeight: 1.1,
                }}
              >
                {t.n}
              </span>
              <div>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", margin: "0 0 8px" }}
                >
                  {t.title}
                </h3>
                {t.body ? (
                  <p
                    className="ohx-muted"
                    style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}
                  >
                    {t.body}
                  </p>
                ) : (
                  <p
                    className="ohx-muted"
                    style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}
                  >
                    Live demos on Sunday. Awards by category (Scope /
                    Documentation / Polish / Security — see{" "}
                    <Link
                      href="/hackathon-judging-criteria"
                      className="ohx-link"
                    >
                      our judging criteria
                    </Link>
                    ). Top projects enter the Founding Engineer program for
                    ongoing development. Nonprofits start using the prototypes.
                    The work continues.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- PAST EVENT HIGHLIGHTS ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Past event highlights</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 22 }}
          >
            A decade of social-good hackathons looks like this
          </h2>
          <p style={prose}>
            Opportunity Hack started as a single weekend at Arizona State
            University in 2013. By 2024 it had become one of the largest
            social-good hackathons in the country — and the longest-running.
            Past projects include case-management platforms for homelessness
            services, donor tracking dashboards for grassroots nonprofits,
            volunteer scheduling tools used week after week by 50+
            organizations, and impact-reporting pipelines that gave nonprofit
            boards their first real visibility into program outcomes.
          </p>
          <p style={{ ...prose, marginBottom: 28 }}>
            The events themselves have ranged from intimate weekend hackathons
            of 60 developers to flagship fall events with 400+ participants.
            Format has shifted across in-person, hybrid, and online — but the
            core model (real nonprofit problem statements, mentor-rich support,
            post-event Founding Engineer follow-on) has stayed constant.
            That&apos;s the model that has actually shipped software to the
            people who need it.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/12-years-of-social-good"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("read_field_report")}
            >
              Read the 12-year field report <Arrow />
            </Link>
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("browse_past_hackathons")}
            >
              Browse past hackathons
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- WHAT MAKES OHACK DIFFERENT ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>The difference</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 32 }}>
          What makes Opportunity Hack different
        </h2>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {DIFFERENCES.map((d) => (
            <div key={d.title} style={card}>
              <h3
                className="ohx-display"
                style={{ fontSize: "1.2rem", margin: "0 0 8px" }}
              >
                {d.title}
              </h3>
              {d.body ? (
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  {d.body}
                </p>
              ) : (
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  Our{" "}
                  <Link href="/hackathon-judging-criteria" className="ohx-link">
                    4-category judging rubric
                  </Link>{" "}
                  (Scope, Documentation, Polish, Security) is designed to
                  identify projects that ship — not just projects that demo
                  well. Other hackathons have copied our rubric over the years;
                  we open-source it freely.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FALL 2026 — NAVY BAND ---------------- */}
      <section
        className="ohx-wrap"
        style={{ paddingBottom: "clamp(48px, 8vh, 88px)" }}
      >
        <div
          style={{
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
              Next event
            </p>
            <h2
              className="ohx-display"
              style={{ fontSize: "1.6rem", marginTop: 8, color: "#fff" }}
            >
              Fall 2026 Hackathon for Social Good
            </h2>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>November 14-15, 2026</strong> — Arizona State University,
              Tempe, AZ. The annual flagship event. Registration opens 8 weeks
              in advance for hackers, judges, mentors, and sponsors.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              href="/hack"
              className="ohx-btn"
              style={{ background: "#fff", color: "var(--brand)" }}
              onClick={() => trackClick("register_hacker_event_section")}
            >
              Register as a hacker
            </Link>
            <Link
              href="/hackathon-judge-opportunities"
              className="ohx-btn ohx-btn--ghost"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
              onClick={() => trackClick("apply_judge_event_section")}
            >
              Apply to judge
            </Link>
            <Link
              href="/sponsor"
              className="ohx-link"
              style={{ color: "#fff" }}
              onClick={() => trackClick("become_sponsor_event_section")}
            >
              Become a sponsor <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- HOW TO PARTICIPATE ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Get involved</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 32 }}
          >
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
          <div
            style={{
              ...card,
              marginTop: 20,
              padding: "18px 22px",
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            <strong>Are you a nonprofit?</strong> Apply for a free software
            project at{" "}
            <Link href="/nonprofits/apply" className="ohx-link">
              /nonprofits/apply
            </Link>{" "}
            or learn more about{" "}
            <Link href="/coding-for-nonprofits" className="ohx-link">
              coding for nonprofits
            </Link>
            .
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section
        className="ohx-narrow ohx-wrap"
        style={{ marginInline: "auto", ...sectionPad }}
      >
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>
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
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section style={band}>
        <div
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(56px, 9vh, 104px)",
            paddingBottom: "clamp(56px, 9vh, 104px)",
            textAlign: "center",
          }}
        >
          <h2
            className="ohx-display"
            style={{ marginBottom: 14, maxWidth: "24ch", marginInline: "auto" }}
          >
            Ready to join a hackathon for{" "}
            <span className="ohx-italic">social good?</span>
          </h2>
          <p
            className="ohx-muted"
            style={{
              marginTop: 0,
              marginBottom: 28,
              maxWidth: "56ch",
              marginInline: "auto",
            }}
          >
            Pick the path that fits — there&apos;s a role at the next
            Opportunity Hack hackathon for developers, mentors, judges,
            sponsors, and nonprofits.
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
              href="/hack"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("see_hackathons_final")}
            >
              See upcoming hackathons <Arrow />
            </Link>
            <Link
              href="/sponsor"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("sponsor_event_final")}
            >
              Sponsor the event
            </Link>
            <Link
              href="/coding-for-nonprofits"
              className="ohx-link"
              onClick={() => trackClick("coding_for_nonprofits_final")}
            >
              Read about coding for nonprofits <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </RefinedRoot>
  );
};

export default HackathonForSocialGood;

export const getStaticProps = async () => {
  const title =
    "Hackathon for Social Good — Build Free Software for Nonprofits | Opportunity Hack";
  const description =
    "Join the world's longest-running hackathon for social good. Since 2013, Opportunity Hack has connected 3,000+ developers with 200+ nonprofits. Annual flagship event at ASU each fall.";
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
            "Developers, mentors, and nonprofits collaborating at the Opportunity Hack hackathon for social good at ASU",
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
            "hackathon for social good, hack for social impact, develop for good, hackathon social good, hack for good, code for good hackathon, social impact hackathon, hackathon social impact",
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
              "@type": "Event",
              name: "Opportunity Hack Fall 2026 Hackathon for Social Good",
              url: "https://www.ohack.dev/hack",
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
                name: "Hackathon for Social Good",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "Event",
            name: "Opportunity Hack Fall 2026 Hackathon for Social Good",
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
            },
            image: ogImage,
            description:
              "The annual flagship hackathon for social good at Arizona State University. Developers, designers, and nonprofits build free software over a weekend, with post-event continuation through the Founding Engineer program.",
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
