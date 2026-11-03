import React, { useEffect } from "react";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import {
  RefinedRoot,
  Eyebrow,
  Stat,
  Arrow,
} from "../../components/design/refined";
import { FONT_MONO } from "../../styles/fonts";

import {
  AssessmentRounded,
  BalanceRounded,
  TrendingUpRounded,
  CheckCircleRounded,
} from "@mui/icons-material";

const CANONICAL = "https://www.ohack.dev/hackathon-judging-criteria";
const OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/judge_2.jpg";

const trackClick = (buttonName) => {
  trackEvent({
    action: "click_judging_criteria",
    params: { button: buttonName },
  });
};

const scrollToScorecard = () => {
  const el = document.getElementById("scorecard");
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

// Rubric content is the authoritative reference linked from the judge pages —
// presentation may change, the words and point values must not.
const CATEGORIES = [
  {
    icon: <AssessmentRounded fontSize="inherit" />,
    title: "Scope",
    points: 10,
    body: "Scope answers two questions: how many people benefit from this solution, and how hard was the underlying problem to solve? A volunteer-scheduling tool that serves one nonprofit's 50 volunteers is narrower scope than a case-management platform serving 30 nonprofits across a region. A trivial CRUD app is shallower complexity than a project that handles real data normalization or domain edge cases.",
    bullets: [
      "Number of nonprofits or end-users impacted",
      "Complexity of the problem solved relative to existing solutions",
      "Whether the team chose a real problem or a toy problem",
    ],
  },
  {
    icon: <BalanceRounded fontSize="inherit" />,
    title: "Documentation",
    points: 10,
    body: "Documentation is the proxy for sustainability. The most beautiful hackathon prototype is worthless to a nonprofit that can't deploy or maintain it. Look at the README, the inline comments, the deployment instructions, the user-facing UX. Could a non-author run this project six months from now?",
    bullets: [
      "README explains setup, deploy, environment variables clearly",
      "Code comments where logic isn't self-evident",
      "User-facing UX is intuitive without a manual",
      "Architecture decisions are recorded somewhere",
    ],
  },
  {
    icon: <TrendingUpRounded fontSize="inherit" />,
    title: "Polish",
    points: 10,
    body: 'Polish is "how much work remains before this can be used today?" A demoable prototype with three TODO bugs and no error handling scores low. A working app deployed to a public URL with reasonable error states scores high. Polish is not about visual design — it\'s about production readiness.',
    bullets: [
      "Project is deployed somewhere public (not just running on the demo laptop)",
      "Error states are handled gracefully",
      "Common edge cases (empty state, slow network, invalid input) don't break the app",
      "Estimated work remaining to reach MVP is small",
    ],
  },
  {
    icon: <CheckCircleRounded fontSize="inherit" />,
    title: "Security",
    points: 10,
    body: "Security is asymmetric: a vulnerability turns a useful app into a liability. Especially for nonprofits handling client data, donor records, or volunteer info, security failures can end a project. Score how the team thought about data protection and access control — even if the implementation isn't bulletproof, did they engage with the questions?",
    bullets: [
      "Sensitive data is gated by authentication",
      "Role-based access exists where appropriate (admin vs. public users)",
      "Secrets aren't committed to the repo",
      "Input is validated; obvious injection vectors are closed",
    ],
  },
];

const SCORING_SCALE = [
  { score: 1, description: "Poor — Significantly below expectations" },
  { score: 2, description: "Fair — Below expectations" },
  { score: 3, description: "Good — Meets expectations" },
  { score: 4, description: "Very Good — Exceeds expectations" },
  { score: 5, description: "Excellent — Significantly exceeds expectations" },
];

const WORKED_EXAMPLE = [
  {
    title: "Scope",
    score: "4/5",
    body: "Serves one nonprofit's ~80 weekly volunteers across 4 program sites. Solves a real problem (the nonprofit was using paper sign-up sheets and Google Sheets). Scope is moderate — single nonprofit, but the problem is operationally critical and replaces a manual process consuming staff hours every week. Not the broadest possible impact, but real.",
  },
  {
    title: "Documentation",
    score: "3/5",
    body: "README covers setup and deploy clearly. No inline comments in the trickier scheduling-conflict logic. UX is intuitive for the volunteer-facing pages but the admin pages have unlabeled buttons. A future maintainer would understand the surface but might struggle with the conflict-detection code.",
  },
  {
    title: "Polish",
    score: "4/5",
    body: "Deployed publicly. Empty states render correctly. Form validation catches obvious errors. One known issue: timezone handling when shift spans midnight — a moderate edge case. Overall closer to MVP than prototype, but not 5/5 production-ready.",
  },
  {
    title: "Security",
    score: "3/5",
    body: "Auth0 handles authentication well. Role-based access (admin vs. volunteer) is implemented. Secrets are in environment variables, not committed. But: no rate limiting on the sign-up endpoint, and the admin role check happens client-side only — the API would let a determined volunteer escalate. Solid foundations with one important gap.",
  },
];

const PITFALLS = [
  {
    title: "Scoring on demo flash, not on what shipped",
    body: "The team with the slickest pitch isn't always the team that built the most. Polished slide decks and confident speakers can hide thin implementations. Spend at least as much time looking at the code repo as you do at the demo. If you can't see code, ask why.",
  },
  {
    title: "Anchoring on the first project you score",
    body: "Whatever score you give the first team you evaluate sets your internal scale for the rest. Score the first project, then deliberately wait until you've watched 2-3 more before finalizing — and revise the first one if it doesn't fit the spread you've calibrated.",
  },
  {
    title: "Punishing teams for incomplete features they were honest about",
    body: "A team that says \"we didn't get to feature X — here's our mitigation plan\" is acting like a real engineering team. A team that hides incomplete work and hopes you don't notice is not. Reward honesty about gaps; penalize concealment.",
  },
  {
    title: '"Beautiful" vs. "good"',
    body: "Visual design is a tiebreaker, not a primary criterion. A clean utility app that solves the nonprofit's problem reliably scores higher than a beautiful app that doesn't. Polish is about production readiness, not aesthetics.",
  },
  {
    title: "Forgetting that the nonprofit is the customer",
    body: 'Hackathon judges sometimes evaluate technical impressiveness without asking "would the nonprofit actually use this?" If a project requires the nonprofit to hire a dev to maintain it, or learn a new tool to operate it, that\'s a scope/polish problem — not a strength.',
  },
];

// Single source of truth: rendered as <details> accordions AND emitted as
// FAQPage JSON-LD from getStaticProps.
const FAQ_ITEMS = [
  {
    q: "Can I use this rubric for my own hackathon?",
    a: "Yes — copy and adapt freely. We open-source the Opportunity Hack judging framework and explicitly invite other hackathon organizers to use it. No attribution is required, though we'd love to hear how you adapt it. Share feedback through our contact page at ohack.dev/contact.",
  },
  {
    q: "How long does scoring one project take with this rubric?",
    a: "A reasonable judge spends 12-20 minutes per project: 4 minutes watching the pitch video, 5-8 minutes reading code and the README, and 3-8 minutes for final scoring and notes. Live demo Q&A adds another 5-10 minutes for finalist projects. A judge handling 8-10 projects can expect a 3-4 hour total commitment.",
  },
  {
    q: "What if a project doesn't fit cleanly into one of the categories?",
    a: "Score what's present. A pure-data-pipeline project will score lower on Polish (no UI to evaluate) than a frontend-heavy project, but higher on Documentation and Security in many cases. Don't penalize projects for the categories they don't naturally exercise — let the average reflect the project's actual shape.",
  },
  {
    q: "How are ties broken?",
    a: "Multiple judges score each project, and the average is used. If two projects tie within 1 point, the head judge looks at sub-criterion scores and tiebreaker categories — typically Scope (impact) and Polish (production readiness) win out over Documentation in close calls. Ultimately the head judge has discretion.",
  },
  {
    q: "Should social impact be part of the criteria?",
    a: 'At Opportunity Hack, social impact is captured inside Scope\'s sub-criterion A ("impact on community"). We deliberately don\'t have a separate "social impact" category — every project at OHack already starts from a real nonprofit problem statement, so impact is the floor not a differentiator. For non-social-good hackathons, you\'d swap in a different sub-criterion under Scope.',
  },
  {
    q: "Is this rubric biased against beginner teams?",
    a: "Less than you'd think. Scope is independent of seniority — a beginner team that picks a focused problem and ships something narrow can match or beat a senior team that overscoped. Polish and Documentation reward effort and discipline, not raw skill. Security is the one category where senior teams often outscore beginners, but that's been more than offset historically by Scope and Documentation in our data.",
  },
  {
    q: "Does the rubric work for non-software hackathons?",
    a: 'The four-category framework generalizes well — Scope, Documentation, Polish, Security mostly map to "did they pick a real problem", "is the work understandable", "is the work usable today", and "is the work safe". For hardware, biotech, or design-focused hackathons, Security can become "safety/ethics" and the sub-criteria adjust accordingly.',
  },
  {
    q: "What if I disagree with another judge's score?",
    a: "Disagreement is normal and useful. Multi-judge scoring is designed to surface different perspectives. If two judges differ by 2+ points on the same project, the head judge brings them together briefly to discuss before final scores are locked. The goal isn't consensus — it's making sure both judges saw the same project. Keep your score if you still believe it after the discussion.",
  },
];

const SCORECARD_TEXT = `HACKATHON JUDGING SCORECARD — OPPORTUNITY HACK FRAMEWORK
=========================================================

Project: ________________________________________________
Team:    ________________________________________________
Judge:   ________________________________________________
Date:    ________________________________________________

CATEGORY 1: SCOPE (10 points)
Sub-criterion A — Impact on community:    ___ / 5
Sub-criterion B — Complexity of problem:  ___ / 5
                              SCOPE TOTAL: ___ / 10
Notes:

CATEGORY 2: DOCUMENTATION (10 points)
Sub-criterion A — Code & UX docs:         ___ / 5
Sub-criterion B — Ease of understanding:  ___ / 5
                       DOCUMENTATION TOTAL: ___ / 10
Notes:

CATEGORY 3: POLISH (10 points)
Sub-criterion A — Work remaining for MVP: ___ / 5
Sub-criterion B — Can use today:          ___ / 5
                              POLISH TOTAL: ___ / 10
Notes:

CATEGORY 4: SECURITY (10 points)
Sub-criterion A — Data protection:        ___ / 5
Sub-criterion B — Role-based access:      ___ / 5
                            SECURITY TOTAL: ___ / 10
Notes:

OVERALL TOTAL: ___ / 40
Recommendation: [ ] Grand Prize  [ ] Category Prize  [ ] Honorable Mention  [ ] No Award`;

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

const detailsStyle = (i) => ({
  borderTop: i === 0 ? "1px solid var(--line)" : "none",
  borderBottom: "1px solid var(--line)",
  padding: "18px 2px",
});

const summaryStyle = {
  fontSize: "1.05rem",
  cursor: "pointer",
  listStyle: "none",
  color: "var(--ink)",
};

const HackathonJudgingCriteria = () => {
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
            Open-source rubric · refined since 2013
          </span>
        </Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}
        >
          Hackathon judging criteria that reward{" "}
          <span className="ohx-italic">what actually ships.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
        >
          The scoring framework, rubric, and scorecard Opportunity Hack uses
          across every hackathon — free to copy and adapt for your own event. A
          hackathon&apos;s outcome rests on its judging. Bad criteria reward the
          showiest demos and ignore the hardest work; good criteria identify the
          projects that will actually ship.
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
          After running social-good hackathons since 2013 — with hundreds of
          judges across thousands of projects — Opportunity Hack has converged
          on a four-category rubric that has held up across both beginner and
          senior teams, in-person and remote, weekend and week-long events. This
          page is the authoritative reference: the framework, the scoring scale,
          a worked example, the downloadable rubric, and the common judging
          pitfalls we&apos;ve watched people stumble into. If you&apos;re
          judging an Opportunity Hack event — bookmark this. If you&apos;re
          running your own hackathon — copy the rubric below. We open-source the
          model.
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
            href="/hackathon-judge-opportunities"
            className="ohx-btn ohx-btn--primary"
            onClick={() => trackClick("apply_to_judge_hero")}
          >
            Apply to judge <Arrow />
          </Link>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => {
              trackClick("copy_scorecard_hero");
              scrollToScorecard();
            }}
          >
            Copy the scorecard
          </button>
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
          <Stat value="4" label="Categories" />
          <Stat value="1–5" label="Scoring scale" />
          <Stat value="40" label="Points total" />
          <Stat value="CC0" label="Free to copy" />
        </div>
      </section>

      {/* ---------------- FOUR-CATEGORY FRAMEWORK ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>The rubric</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          The four-category framework
        </h2>
        <p
          className="ohx-muted"
          style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
        >
          Each project receives one score per category on a 1-5 scale.
          Categories are weighted equally and combined for a total out of 40.
          The categories were chosen because they map to the qualities that
          distinguish hackathon prototypes that ship vs. those that don&apos;t —
          independent of the technology stack, problem domain, or seniority of
          the team.
        </p>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {CATEGORIES.map((c) => (
            <div key={c.title} style={card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span style={iconWrap}>{c.icon}</span>
                <span className="ohx-tag">{c.points} points</span>
              </div>
              <h3
                className="ohx-display"
                style={{ fontSize: "1.3rem", margin: "0 0 10px" }}
              >
                {c.title}
              </h3>
              <p
                className="ohx-muted"
                style={{
                  margin: "0 0 16px",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {c.body}
              </p>
              <p className="ohx-eyebrow" style={{ marginBottom: 8 }}>
                What to look for
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {c.bullets.map((b) => (
                  <li
                    key={b}
                    style={{
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                      marginBottom: 4,
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- SCORING SCALE ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Calibration</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 24 }}
          >
            The scoring scale
          </h2>
          <div
            style={{ ...card, padding: 0, overflow: "hidden", maxWidth: 760 }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="ohx-eyebrow"
                    style={{
                      textAlign: "left",
                      padding: "14px 22px",
                      width: 90,
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="ohx-eyebrow"
                    style={{
                      textAlign: "left",
                      padding: "14px 22px",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {SCORING_SCALE.map((row, i) => (
                  <tr key={row.score}>
                    <td
                      className="ohx-display"
                      style={{
                        padding: "12px 22px",
                        fontSize: "1.35rem",
                        color: "var(--brand)",
                        borderBottom:
                          i === SCORING_SCALE.length - 1
                            ? "none"
                            : "1px solid var(--line)",
                      }}
                    >
                      {row.score}
                    </td>
                    <td
                      style={{
                        padding: "12px 22px",
                        fontSize: "0.95rem",
                        borderBottom:
                          i === SCORING_SCALE.length - 1
                            ? "none"
                            : "1px solid var(--line)",
                      }}
                    >
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...prose, marginTop: 24, marginBottom: 0 }}>
            Most projects score 2-4 across categories. A score of 5 should be
            reserved for genuinely exceptional work — a project where you&apos;d
            want to recommend the team to your own employer. A score of 1 should
            be reserved for projects that fundamentally don&apos;t address the
            category (no documentation at all, no security thinking at all). The
            middle is where most evaluation happens.
          </p>
        </div>
      </section>

      {/* ---------------- WORKED EXAMPLE ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Worked example</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
          Scoring a volunteer-scheduling app
        </h2>
        <article style={{ ...card, padding: "30px 28px", maxWidth: 860 }}>
          <h3
            className="ohx-display"
            style={{ fontSize: "1.3rem", margin: "0 0 10px" }}
          >
            Project: a volunteer shift-scheduling app for a homeless-services
            nonprofit
          </h3>
          <p
            className="ohx-muted"
            style={{ margin: "0 0 22px", fontSize: "0.95rem", lineHeight: 1.6 }}
          >
            Here&apos;s how an experienced judge would score a real Opportunity
            Hack project — a volunteer shift-scheduling tool built for a
            homeless-services nonprofit during a weekend hackathon. The team
            shipped a working app deployed to Vercel, with a basic README and
            authentication via Auth0.
          </p>
          <div>
            {WORKED_EXAMPLE.map((row) => (
              <div
                key={row.title}
                style={{
                  padding: "18px 0",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <h4
                    className="ohx-display"
                    style={{ fontSize: "1.1rem", margin: 0 }}
                  >
                    {row.title}
                  </h4>
                  <span className="ohx-tag ohx-tag--accent">{row.score}</span>
                </div>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}
                >
                  {row.body}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 8,
              padding: "16px 20px",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.95rem",
              lineHeight: 1.55,
            }}
          >
            Total: 14/20 (or 28/40 on the full rubric across both judges&apos;
            scores). A solid project worthy of a category prize but not the
            grand prize.
          </div>
        </article>
      </section>

      {/* ---------------- SCORECARD TEMPLATE ---------------- */}
      <section id="scorecard" style={{ ...band, scrollMarginTop: 96 }}>
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Copy &amp; adapt</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            The scorecard template
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 24, maxWidth: "64ch" }}
          >
            Copy and paste this template for your own hackathon. We open-source
            the framework — no attribution required, but we&apos;d love to hear
            if you adapt it. Send feedback through our{" "}
            <Link href="/contact" className="ohx-link">
              contact page
            </Link>
            .
          </p>
          <pre
            style={{
              ...card,
              margin: 0,
              padding: "22px 24px",
              fontFamily: FONT_MONO,
              fontSize: "0.85rem",
              lineHeight: 1.6,
              overflow: "auto",
              whiteSpace: "pre",
              color: "var(--ink)",
            }}
          >
            {SCORECARD_TEXT}
          </pre>
          <div style={{ marginTop: 24 }}>
            <Link
              href="/hackathon-judge-opportunities#upcoming-events"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("interactive_scorecard")}
            >
              Try the interactive scorecard <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- PITFALLS ---------------- */}
      <section
        className="ohx-narrow ohx-wrap"
        style={{ marginInline: "auto", ...sectionPad }}
      >
        <Eyebrow>Lessons from hundreds of events</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          Common judging pitfalls
        </h2>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28 }}>
          After hundreds of hackathons we&apos;ve seen the same judging mistakes
          repeat. Avoiding these doesn&apos;t make you a great judge — it just
          keeps you from being a bad one.
        </p>
        <div>
          {PITFALLS.map((p, i) => (
            <details key={p.title} style={detailsStyle(i)}>
              <summary className="ohx-display" style={summaryStyle}>
                {p.title}
              </summary>
              <p
                className="ohx-muted"
                style={{
                  margin: "12px 0 0",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {p.body}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section style={band}>
        <div
          className="ohx-narrow ohx-wrap"
          style={{ marginInline: "auto", ...sectionPad }}
        >
          <Eyebrow>FAQ</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 28 }}
          >
            Frequently asked questions
          </h2>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <details key={item.q} style={detailsStyle(i)}>
                <summary className="ohx-display" style={summaryStyle}>
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
          Ready to judge an{" "}
          <span className="ohx-italic">Opportunity Hack event?</span>
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
          Apply to judge an upcoming Opportunity Hack hackathon, or browse our
          other hackathon resources.
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
            href="/hackathon-judge-opportunities"
            className="ohx-btn ohx-btn--primary"
            onClick={() => trackClick("apply_to_judge_final")}
          >
            Apply to judge <Arrow />
          </Link>
          <Link
            href="/about/mentors"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => trackClick("become_mentor_final")}
          >
            Become a mentor
          </Link>
          <Link
            href="/coding-for-nonprofits"
            className="ohx-link"
            onClick={() => trackClick("coding_for_nonprofits_final")}
          >
            Read about coding for nonprofits <Arrow />
          </Link>
        </div>
      </section>
    </RefinedRoot>
  );
};

export default HackathonJudgingCriteria;

export const getStaticProps = async () => {
  const title =
    "Hackathon Judging Criteria & Scorecard Template | Opportunity Hack";
  const description =
    "Authoritative hackathon judging criteria, scoring rubric, and downloadable scorecard. The 4-category framework Opportunity Hack uses to evaluate projects: Scope, Documentation, Polish, Security. Free to copy and adapt.";
  const canonicalUrl = CANONICAL;
  const ogImage = OG_IMAGE;

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
            "Expert hackathon judges collaborating during project evaluation sessions at Opportunity Hack",
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
            "hackathon judging criteria, hackathon scorecard, hackathon criteria, hackathon scoring rubric, how to judge a hackathon, hackathon evaluation framework, hackathon judging template",
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
              "@type": "CreativeWork",
              name: "Hackathon Judging Rubric — Four-Category Framework",
              description:
                "A four-category scoring rubric (Scope, Documentation, Polish, Security) for evaluating hackathon projects, developed by Opportunity Hack since 2013.",
              author: {
                "@type": "Organization",
                name: "Opportunity Hack",
                url: "https://www.ohack.dev",
              },
              license: "https://creativecommons.org/publicdomain/zero/1.0/",
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
                name: "Hackathon Judging Criteria",
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "HowTo",
            name: "How to Judge a Hackathon Project Using the 4-Category Framework",
            description:
              "Score four categories on a 1-5 scale: Scope, Documentation, Polish, Security.",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "USD",
              value: "0",
            },
            totalTime: "PT15M",
            step: [
              {
                "@type": "HowToStep",
                name: "Score Scope",
                text: "Evaluate community impact and problem complexity. Score 1-5.",
              },
              {
                "@type": "HowToStep",
                name: "Score Documentation",
                text: "Evaluate code/UX documentation and ease of understanding. Score 1-5.",
              },
              {
                "@type": "HowToStep",
                name: "Score Polish",
                text: "Evaluate work remaining for MVP and current usability. Score 1-5.",
              },
              {
                "@type": "HowToStep",
                name: "Score Security",
                text: "Evaluate data protection and role-based access. Score 1-5.",
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
