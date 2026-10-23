import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Moment from "moment";
import { Box, Slider } from "@mui/material";
import {
  BalanceRounded,
  TrendingUpRounded,
  GroupsRounded,
  MovieRounded,
  LiveTvRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import { initFacebookPixel, trackEvent } from "../lib/ga";
import useHackathonEvents from "../hooks/use-hackathon-events";
import {
  RefinedRoot,
  Eyebrow,
  Stat,
  Arrow,
} from "../components/design/refined";

const HERO_PHOTO = "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp";
const SECOND_PHOTO = "https://cdn.ohack.dev/ohack.dev/judge_2.jpg";
const DEMO_VIDEO = "https://www.youtube.com/embed/i_KQ0Z-0kkc";

// GA action + button names are unchanged from the previous version of this
// page — dashboards key on them.
const trackClick = (button) => {
  trackEvent({ action: "click_judge_opportunities", params: { button } });
};

const scrollTo = (id) =>
  setTimeout(
    () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
    100,
  );

const SCORE_DESCRIPTIONS = {
  1: "Poor - Significantly below expectations",
  2: "Fair - Below expectations",
  3: "Good - Meets expectations",
  4: "Very Good - Exceeds expectations",
  5: "Excellent - Significantly exceeds expectations",
};

const getDescription = (score) => SCORE_DESCRIPTIONS[score] || "";

const INITIAL_SCORES = {
  scopeImpact: 3,
  scopeComplexity: 3,
  documentationCode: 3,
  documentationEase: 3,
  polishWorkRemaining: 3,
  polishCanUseToday: 3,
  securityData: 3,
  securityRole: 3,
};

// The judging rubric. Presentation-only page: these categories, weights and
// sub-criteria mirror the real scoring process and must not drift from it.
const CRITERIA = [
  {
    category: "scope",
    name: "Scope of Solution",
    maxPoints: 10,
    subCriteria: [
      {
        name: "Impact on Community - how many people and nonprofits are impacted by this solution?",
        key: "scopeImpact",
      },
      {
        name: "Complexity of Problem Solved - how hard was this to do versus what is already out there?",
        key: "scopeComplexity",
      },
    ],
    tip: "Consider both breadth and depth of impact. Evaluate community impact and problem complexity.",
  },
  {
    category: "documentation",
    name: "Documentation",
    maxPoints: 10,
    subCriteria: [
      {
        name: "Code and UX Documentation - clear how to use the solution",
        key: "documentationCode",
      },
      {
        name: "Ease of Understanding - straightforward design",
        key: "documentationEase",
      },
    ],
    tip: "Assess documentation quality and clarity. Consider project sustainability.",
  },
  {
    category: "polish",
    name: "Polish",
    maxPoints: 10,
    subCriteria: [
      {
        name: "Work remaining - minimal work remaining for MVP",
        key: "polishWorkRemaining",
      },
      {
        name: "Can use today - deployed in the cloud, able to be shipped now",
        key: "polishCanUseToday",
      },
    ],
    tip: "Evaluate overall refinement and readiness for real-world use.",
  },
  {
    category: "security",
    name: "Security",
    maxPoints: 10,
    subCriteria: [
      {
        name: "Data Protection - hard to gain access to data because of security controls",
        key: "securityData",
      },
      {
        name: "Role-based Security - admin versus public access (where applicable)",
        key: "securityRole",
      },
    ],
    tip: "Assess data protection and role-based security implementation.",
  },
];

const MAX_TOTAL = CRITERIA.reduce((sum, c) => sum + c.maxPoints, 0);

const BENEFITS = [
  {
    icon: <BalanceRounded fontSize="inherit" />,
    title: "Real Impact Assessment",
    body: "Evaluate solutions that nonprofits will actually implement, ensuring your expertise contributes to measurable social change.",
  },
  {
    icon: <TrendingUpRounded fontSize="inherit" />,
    title: "Professional Recognition",
    body: "Enhance your professional portfolio with documented expertise in technology evaluation and social impact assessment.",
  },
  {
    icon: <GroupsRounded fontSize="inherit" />,
    title: "Global Network Access",
    body: "Connect with fellow judges, innovative development teams, and mission-driven nonprofit leaders from around the world.",
  },
];

const PROCESS = [
  {
    icon: <MovieRounded fontSize="inherit" />,
    title: "Video Pitch Evaluation",
    tag: "Initial technical assessment",
    body: "Review comprehensive 4-minute pitch videos showcasing project demonstrations, technical architecture, and team presentations.",
  },
  {
    icon: <LiveTvRounded fontSize="inherit" />,
    title: "Live Demo Sessions",
    tag: "Final expert review",
    body: "Engage directly with finalist teams through interactive demos, technical Q&A sessions, and detailed solution evaluations.",
  },
];

// Rendered FAQ. The FAQPage JSON-LD in getStaticProps carries the same
// questions; keep the two in step if you edit either.
const FAQ_ITEMS = [
  {
    q: "How do I become a hackathon judge at Opportunity Hack?",
    a: "Apply through any active event listed in 'Current Hackathon Judge Opportunities' above. Each event has a dedicated judge application that takes about 5 minutes. We confirm your role within a few days, then send a short training video and the scoring rubric before the event.",
  },
  {
    q: "What's the time commitment for a hackathon judge?",
    a: "Plan on 4–6 hours total: a 30-minute orientation, ~2 hours reviewing 4-minute pitch videos asynchronously the week before, and 2–3 hours of live demo evaluations on the final day of the hackathon. We require judges to attend the live demo block in person whenever the event is in person.",
  },
  {
    q: "Do I need to be in-person to judge a hackathon?",
    a: "We strongly prefer in-person judging during the live demo block — direct teams Q&A is where the real evaluation happens. Remote judging is available for the asynchronous video review portion. For in-person hackathons, plan to arrive by 2pm on the final day.",
  },
  {
    q: "What technical background do I need?",
    a: "Any professional software, data, security, or product background works. Most of our judges are senior engineers, engineering managers, founders, or technical PMs. The scoring rubric (Scope, Documentation, Polish, Security) is designed so any technologist can evaluate fairly — you don't need to be a domain expert in every project.",
  },
  {
    q: "Is judging a hackathon paid?",
    a: "No — judging is a volunteer role. Many judges use it for ESG / corporate-volunteer-time programs at their employer, and we provide an attendance letter on request. Your sponsorship company can also secure dedicated judge slots through the corporate program.",
  },
  {
    q: "What's the scoring framework?",
    a: "Four equal categories scored 1–10: Scope (community impact + problem complexity), Documentation (code/UX clarity + ease of understanding), Polish (work remaining + production readiness), and Security (data protection + role-based access). Try the interactive scorecard above to practice.",
  },
  {
    q: "Can my company sponsor judge slots for our team?",
    a: "Yes. Our Corporate Judge Programs provide guaranteed judging seats for sponsor company teams as part of a sponsorship package. This is a popular professional-development perk and counts toward ESG goals. See the corporate sponsorship section above.",
  },
  {
    q: "What if I've never judged a hackathon before?",
    a: "First-time judges are welcome. We pair new judges with experienced judges in the live demo block, send a short training video covering the rubric, and have a head judge available for tie-breaks and edge cases throughout the event.",
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

const bandStyle = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

const sectionPad = {
  paddingTop: "clamp(48px, 8vh, 88px)",
  paddingBottom: "clamp(48px, 8vh, 88px)",
};

// Native disclosure used for the FAQ and the practice-scoring criteria.
function Disclosure({ summary, children, defaultOpen = false }) {
  return (
    <details
      className="ohx-card"
      style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}
      open={defaultOpen}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          padding: "18px 22px",
          fontFamily: "var(--display)",
          fontSize: "1.05rem",
          fontWeight: 500,
          color: "var(--ink)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>{summary}</span>
        <span
          className="ohx-faint"
          aria-hidden="true"
          style={{
            fontSize: "1.4rem",
            lineHeight: 1,
            fontFamily: "var(--body)",
          }}
        >
          +
        </span>
      </summary>
      <div style={{ padding: "0 22px 22px" }}>{children}</div>
    </details>
  );
}

function Photo({ src, alt, caption, priority = false, delay }) {
  return (
    <figure
      className={delay ? "rise" : undefined}
      style={{ margin: 0, animationDelay: delay }}
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
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 1120px) 100vw, 1120px"
          style={{ objectFit: "cover" }}
        />
      </div>
      {caption && (
        <figcaption
          className="ohx-faint"
          style={{ marginTop: 10, fontSize: "0.82rem" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const HackathonJudgeOpportunities = () => {
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [totalScore, setTotalScore] = useState(0);
  const { hackathons: upcomingEvents, loading: loadingEvents } =
    useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    const newTotalScore = Object.values(scores).reduce(
      (sum, score) => sum + score,
      0,
    );
    setTotalScore(newTotalScore);
  }, [scores]);

  const formatEventDate = (startDate, endDate) => {
    const start = Moment(startDate);
    const end = Moment(endDate);

    if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
      return start.format("dddd, MMMM Do YYYY");
    }

    return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
  };

  const handleScoreChange = (criterion) => (_, newValue) => {
    setScores((prevScores) => ({ ...prevScores, [criterion]: newValue }));
  };

  const renderSlider = (criterion) => (
    <div key={criterion.key} style={{ width: "100%", marginTop: 18 }}>
      <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
        {criterion.name}
      </p>
      <Slider
        value={scores[criterion.key]}
        valueLabelFormat={getDescription}
        onChange={handleScoreChange(criterion.key)}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={5}
        sx={{
          mt: 1,
          color: "#1B3A6B",
          "& .MuiSlider-valueLabel": { bgcolor: "#1B3A6B" },
        }}
      />
      <p className="ohx-faint" style={{ margin: 0, fontSize: "0.85rem" }}>
        Score: {scores[criterion.key]} / 5 ({scores[criterion.key]} points)
      </p>
    </div>
  );

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
            Volunteer · expert judge
          </span>
        </Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}
        >
          Hackathon judge opportunities{" "}
          <span className="ohx-italic">with real social impact.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
        >
          Join an exclusive network of technology professionals evaluating
          groundbreaking hackathon projects. Our hackathon judge opportunities
          connect industry experts with innovative teams building solutions for
          nonprofits worldwide. Apply your technical expertise to identify
          projects with real social impact potential while advancing your
          professional network and ESG credentials.
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
            href="#upcoming-events"
            className="ohx-btn ohx-btn--primary"
            onClick={() => scrollTo("upcoming-events")}
          >
            View judge opportunities <Arrow />
          </a>
          <Link href="/volunteer" className="ohx-btn ohx-btn--ghost">
            Explore all volunteer roles
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
          <Stat value="4–6 hrs" label="Total commitment" />
          <Stat value="2 stages" label="Video review + live demos" />
          <Stat value={`${CRITERIA.length} × 10`} label="Scoring categories" />
          <Stat value="2013" label="Judging since" />
        </div>
      </section>

      {/* ---------------- HERO PHOTO ---------------- */}
      <section
        className="ohx-wrap"
        style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}
      >
        <Photo
          src={HERO_PHOTO}
          alt="Professional hackathon judges evaluating innovative technology solutions for nonprofits"
          caption="Professional hackathon judges evaluating innovative technology solutions and providing expert feedback to development teams."
          priority
          delay="420ms"
        />
      </section>

      {/* ---------------- UPCOMING EVENTS ---------------- */}
      <section
        id="upcoming-events"
        style={{ ...bandStyle, scrollMarginTop: 90 }}
      >
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Current hackathon judge opportunities</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            Where your expertise is needed next
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 28, maxWidth: "64ch" }}
          >
            Browse available hackathon judge opportunities and apply to evaluate
            cutting-edge technology solutions that address real nonprofit
            challenges. Each judging opportunity includes some basic training
            and networking with industry leaders.
          </p>
          <Box sx={{ minHeight: { xs: 0, md: 180 } }}>
            {loadingEvents ? (
              <p className="ohx-faint">Loading events…</p>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {upcomingEvents.map((event) => (
                  <div key={event.event_id} style={card}>
                    <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>
                      {event.title}
                    </h3>
                    <p
                      className="ohx-faint"
                      style={{ margin: "10px 0 0", fontSize: "0.88rem" }}
                    >
                      {event.location}
                    </p>
                    <p
                      className="ohx-faint"
                      style={{ margin: "4px 0 0", fontSize: "0.88rem" }}
                    >
                      {formatEventDate(event.start_date, event.end_date)}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginTop: 18,
                      }}
                    >
                      <Link
                        href={`/hack/${event.event_id}/judge-application`}
                        className="ohx-btn ohx-btn--primary"
                        style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }}
                        onClick={() => trackClick("judge_apply_opportunity")}
                      >
                        Apply for judge role
                      </Link>
                      <Link
                        href={`/hack/${event.event_id}`}
                        className="ohx-link"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Event details <Arrow />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...card, padding: "32px 28px" }}>
                <p style={{ margin: 0 }}>
                  No hackathon judge opportunities currently available.
                </p>
                <p
                  className="ohx-muted"
                  style={{ margin: "8px 0 0", fontSize: "0.95rem" }}
                >
                  Check back soon for new opportunities or{" "}
                  <Link href="/hack" className="ohx-link">
                    view all hackathons
                  </Link>{" "}
                  to explore past events and get notified about future judge
                  openings.
                </p>
              </div>
            )}
          </Box>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <Link href="/hack" className="ohx-link">
              Browse all hackathons <Arrow />
            </Link>
            <Link href="/signup" className="ohx-link">
              Join the judge network <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- WHY THESE OPPORTUNITIES STAND OUT ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Why these judge opportunities stand out</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          More than competition judging
        </h2>
        <p
          className="ohx-muted"
          style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
        >
          Our hackathon judge opportunities offer unique benefits beyond
          traditional competition judging, focusing on real-world impact and
          professional development.
        </p>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {BENEFITS.map((b) => (
            <div key={b.title} style={card}>
              <span style={iconWrap}>{b.icon}</span>
              <h3
                className="ohx-display"
                style={{ fontSize: "1.2rem", margin: "0 0 8px" }}
              >
                {b.title}
              </h3>
              <p
                className="ohx-muted"
                style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
              >
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- JUDGING PROCESS ---------------- */}
      <section style={bandStyle}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Our professional judging process</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            Two stages, one fair evaluation
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
          >
            Our structured judging process ensures fair evaluation while
            maximizing learning opportunities for both judges and participants.
          </p>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {PROCESS.map((p) => (
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
                  style={{
                    margin: "0 0 14px",
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                  }}
                >
                  {p.body}
                </p>
                <span className="ohx-tag">{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- DEMO EXAMPLE ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Demo example</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          Risk Scoring Solution
        </h2>
        <p
          className="ohx-muted"
          style={{ marginTop: 0, marginBottom: 28, maxWidth: "64ch" }}
        >
          Watch this example demo from our volunteer internship program
          showcasing the type of innovative solutions our hackathon participants
          create for nonprofits.
        </p>
        <figure className="ohx-card" style={{ margin: 0, padding: 16 }}>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: 6,
              background: "var(--surface-2)",
            }}
          >
            <iframe
              src={DEMO_VIDEO}
              title="Risk Scoring - End of Summer 2020 Demo - Opportunity Hack Volunteer Internship Program"
              loading="lazy"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
          <figcaption style={{ marginTop: 14 }}>
            <span
              className="ohx-display"
              style={{ display: "block", fontSize: "1.05rem" }}
            >
              Risk Scoring - End of Summer 2020 Demo
            </span>
            <span
              className="ohx-faint"
              style={{ display: "block", fontSize: "0.85rem", marginTop: 4 }}
            >
              Example demonstration from our volunteer internship program at
              Opportunity Hack
            </span>
          </figcaption>
        </figure>
      </section>

      {/* ---------------- CRITERIA & TRAINING ---------------- */}
      <section
        id="judging-criteria"
        style={{ ...bandStyle, scrollMarginTop: 90 }}
      >
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Expert evaluation criteria &amp; training</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            Practice with the scoring framework
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 24, maxWidth: "64ch" }}
          >
            Practice with our comprehensive scoring framework used across all
            hackathon judge opportunities to ensure consistent, fair
            evaluations.
          </p>
          <div style={{ maxWidth: 820 }}>
            {CRITERIA.map((criterion) => (
              <Disclosure
                key={criterion.category}
                summary={`${criterion.name} · ${criterion.maxPoints} points`}
              >
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.55 }}
                >
                  {criterion.tip}
                </p>
                {criterion.subCriteria.map(renderSlider)}
              </Disclosure>
            ))}
          </div>

          <div
            style={{
              ...card,
              marginTop: 8,
              textAlign: "center",
              maxWidth: 820,
            }}
          >
            <span className="ohx-eyebrow">Training score</span>
            <p
              className="ohx-display"
              style={{ fontSize: "2rem", margin: "6px 0 0" }}
              aria-live="polite"
            >
              {totalScore}
              <span className="ohx-faint" style={{ fontSize: "1.1rem" }}>
                {" "}
                / {MAX_TOTAL}
              </span>
            </p>
            <p
              className="ohx-muted"
              style={{ margin: "8px 0 0", fontSize: "0.9rem" }}
            >
              Practice with our evaluation framework to prepare for hackathon
              judge opportunities.
            </p>
          </div>

          <div
            style={{
              ...card,
              marginTop: 20,
              maxWidth: 820,
              borderLeft: "3px solid var(--accent)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <p style={{ margin: 0, fontSize: "0.95rem", maxWidth: "48ch" }}>
              Want the full rubric with worked examples and a downloadable
              scorecard? See the{" "}
              <Link href="/hackathon-judging-criteria" className="ohx-link">
                Hackathon Judging Criteria
              </Link>{" "}
              reference page.
            </p>
            <Link
              href="/hackathon-judging-criteria"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("view_full_judging_criteria")}
            >
              View full judging criteria <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- MISSION BAND ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <div
          className="ohx-card"
          style={{
            padding: "clamp(28px, 5vw, 48px)",
            background: "var(--brand)",
            borderColor: "var(--brand)",
            color: "#fff",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ maxWidth: "58ch" }}>
            <p
              className="ohx-eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Since 2013
            </p>
            <h2 className="ohx-display" style={{ marginTop: 8, color: "#fff" }}>
              Learn about our mission &amp; impact
            </h2>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: "0.98rem",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Discover how Opportunity Hack has been transforming nonprofits
              through technology since 2013. Meet our founders, learn about our
              values, and see the real impact we&apos;re making together with
              our community of volunteers and judges.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/about"
              className="ohx-btn"
              style={{ background: "#fff", color: "var(--brand)" }}
              onClick={() => trackClick("learn_about_mission")}
            >
              About Opportunity Hack <Arrow />
            </Link>
            <a
              href="#upcoming-events"
              className="ohx-btn ohx-btn--ghost"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
              onClick={() => {
                scrollTo("upcoming-events");
                trackClick("join_judging_from_cta");
              }}
            >
              Join our judging panel
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section style={bandStyle}>
        <div
          className="ohx-narrow ohx-wrap"
          style={{ ...sectionPad, marginInline: "auto" }}
        >
          <Eyebrow>Frequently asked questions</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            Questions technologists ask before judging
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 24, maxWidth: "60ch" }}
          >
            Common questions from technology professionals considering hackathon
            judge opportunities.
          </p>
          {FAQ_ITEMS.map((item) => (
            <Disclosure key={item.q} summary={item.q}>
              <p
                className="ohx-muted"
                style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}
              >
                {item.a}
              </p>
            </Disclosure>
          ))}
        </div>
      </section>

      {/* ---------------- CORPORATE JUDGE PROGRAMS ---------------- */}
      <section
        id="corporate-judge-programs"
        className="ohx-wrap"
        style={{ ...sectionPad, scrollMarginTop: 90 }}
      >
        <div
          style={{
            ...card,
            borderLeft: "3px solid var(--accent)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ maxWidth: "60ch" }}>
            <h3
              className="ohx-display"
              style={{
                fontSize: "1.2rem",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircleRounded
                fontSize="inherit"
                style={{ color: "var(--accent)" }}
              />
              Corporate Judge Programs
            </h3>
            <p
              className="ohx-muted"
              style={{
                margin: "10px 0 0",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              Companies can secure guaranteed hackathon judge opportunities for
              their teams through our corporate sponsorship program, enhancing
              ESG goals while providing valuable professional development
              experiences.
            </p>
          </div>
          <Link
            href="/sponsor"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => trackClick("corporate_judges")}
          >
            Learn about corporate judge programs <Arrow />
          </Link>
        </div>
      </section>

      {/* ---------------- SECOND PHOTO ---------------- */}
      <section
        className="ohx-wrap"
        style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}
      >
        <Photo
          src={SECOND_PHOTO}
          alt="Expert hackathon judges collaborating during project evaluation sessions"
          caption="Expert judges collaborating during comprehensive project evaluation and feedback sessions."
        />
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(40px, 7vh, 80px)",
          paddingBottom: "clamp(56px, 9vh, 104px)",
          textAlign: "center",
        }}
      >
        <Eyebrow>Start your judging journey today</Eyebrow>
        <h2
          className="ohx-display"
          style={{
            marginTop: 8,
            marginBottom: 14,
            maxWidth: "22ch",
            marginInline: "auto",
          }}
        >
          Help identify the next solution that{" "}
          <span className="ohx-italic">lasts.</span>
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
          Join our global network of expert judges and help identify the next
          generation of technology solutions creating lasting social impact.
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
          <a
            href="#upcoming-events"
            className="ohx-btn ohx-btn--primary"
            onClick={() => scrollTo("upcoming-events")}
          >
            Browse judge opportunities <Arrow />
          </a>
          <Link href="/about/mentors" className="ohx-btn ohx-btn--ghost">
            Explore mentoring opportunities
          </Link>
        </div>
        <p style={{ marginTop: 18, fontSize: "0.95rem" }}>
          <Link href="/volunteer" className="ohx-link">
            See all volunteer roles <Arrow />
          </Link>
        </p>
      </section>
    </RefinedRoot>
  );
};

export default HackathonJudgeOpportunities;

export const getStaticProps = async () => {
  const title =
    "Hackathon Judge Opportunities - Expert Evaluation Roles | Opportunity Hack";
  const description =
    "Discover exclusive hackathon judge opportunities to evaluate innovative technology solutions for nonprofits. Join expert judges worldwide in identifying impactful projects and advancing your professional network.";
  const canonicalUrl = "https://www.ohack.dev/hackathon-judge-opportunities";
  return {
    props: {
      title: title,
      description: description,
      canonical: canonicalUrl,
      openGraphData: [
        {
          name: "title",
          property: "title",
          content: title,
          key: "title",
        },
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
          content: "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp",
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
          content: "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp",
          key: "twitterimage",
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content:
            "Professional hackathon judges evaluating innovative technology solutions at Opportunity Hack",
          key: "twitterimagealt",
        },
        {
          name: "twitter:creator",
          property: "twitter:creator",
          content: "@opportunityhack",
          key: "twittercreator",
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
              url: "https://cdn.ohack.dev/ohack.dev/judge_4_2024.webp",
            },
            sameAs: [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack",
              "https://www.linkedin.com/company/opportunity-hack/",
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
              "@type": "JobPosting",
              title: "Hackathon Judge",
              description:
                "Volunteer expert evaluation role: assess innovative technology solutions built by hackers for nonprofit organizations at Opportunity Hack hackathons. Roles open globally for in-person and remote judging.",
              hiringOrganization: {
                "@type": "Organization",
                name: "Opportunity Hack",
                sameAs: "https://www.ohack.dev",
              },
              employmentType: "VOLUNTEER",
              workLocation: {
                "@type": "Place",
                address: "Global / Remote",
              },
              skills:
                "Technology Evaluation, Project Assessment, Technical Expertise, Social Impact Analysis",
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
                name: "Hackathon Judge Opportunities",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I become a hackathon judge at Opportunity Hack?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Apply through any active event listed in 'Current Hackathon Judge Opportunities'. Each event has a dedicated judge application that takes about 5 minutes. We confirm your role within a few days, then send a short training video and the scoring rubric before the event.",
                },
              },
              {
                "@type": "Question",
                name: "What's the time commitment for a hackathon judge?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Plan on 4-6 hours total: a 30-minute orientation, about 2 hours reviewing 4-minute pitch videos asynchronously the week before, and 2-3 hours of live demo evaluations on the final day of the hackathon. We require judges to attend the live demo block in person whenever the event is in person.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to be in-person to judge a hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We strongly prefer in-person judging during the live demo block - direct team Q&A is where the real evaluation happens. Remote judging is available for the asynchronous video review portion. For in-person hackathons, plan to arrive by 2pm on the final day.",
                },
              },
              {
                "@type": "Question",
                name: "What technical background do I need to judge a hackathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Any professional software, data, security, or product background works. Most judges are senior engineers, engineering managers, founders, or technical product managers. The scoring rubric (Scope, Documentation, Polish, Security) is designed so any technologist can evaluate fairly - you don't need to be a domain expert in every project.",
                },
              },
              {
                "@type": "Question",
                name: "Is judging a hackathon paid?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No - judging is a volunteer role. Many judges use it for ESG or corporate-volunteer-time programs at their employer, and we provide an attendance letter on request. Sponsor companies can also secure dedicated judge slots through our corporate sponsorship program.",
                },
              },
              {
                "@type": "Question",
                name: "What's the hackathon judging scoring framework?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Four equal categories scored 1-10: Scope (community impact + problem complexity), Documentation (code/UX clarity + ease of understanding), Polish (work remaining + production readiness), and Security (data protection + role-based access). Practice with the interactive scorecard on this page.",
                },
              },
              {
                "@type": "Question",
                name: "Can my company sponsor judge slots for our team?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Our Corporate Judge Programs provide guaranteed judging seats for sponsor company teams as part of a sponsorship package. This is a popular professional-development perk that also counts toward ESG goals.",
                },
              },
              {
                "@type": "Question",
                name: "What if I've never judged a hackathon before?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "First-time judges are welcome. We pair new judges with experienced judges in the live demo block, send a short training video covering the rubric, and have a head judge available for tie-breaks and edge cases throughout the event.",
                },
              },
            ],
          },
        ],
      },
    },
  };
};
