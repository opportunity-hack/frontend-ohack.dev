import React from "react";
import Link from "next/link";
import { Eyebrow, Arrow } from "../../design/refined";

/*
 * Detailed scoring guide for the public /about/hearts page. Rendered inside
 * the page's <RefinedRoot>, so the .ohx-* classes apply. The criteria data is
 * the single copy on this page (the short "scoring levels" grid that used to
 * duplicate it in Hearts.js was removed). All subcomponents are module-scope.
 */

export const REWARD_LEVELS = [
  {
    hearts: 0.5,
    title: "Partially met goal",
    summary: {
      what: "Partial completion — code complete but not in production, partial docs, under 50% architecture or observability coverage, lint warnings or outstanding PRs.",
      how: "At least one standup, code has errors or is slow, spoke to the customer once, pushed code once.",
    },
    what: [
      {
        primary: "Productionalized projects",
        secondary: "Code complete, but not pushed to production",
      },
      {
        primary: "Requirements gathering",
        secondary: "Requirements not fully collected",
      },
      {
        primary: "Documentation",
        secondary: "Documentation not fully completed",
      },
      {
        primary: "Design architecture",
        secondary: "Partial architecture — less than 50% of overall system",
      },
      {
        primary: "Code quality",
        secondary:
          "P0-level lint warnings, errors or security bugs, outstanding PR comments",
      },
      { primary: "Unit tests written", secondary: "Some unit tests improved" },
      { primary: "Unit test coverage", secondary: "Coverage less than 50%" },
      {
        primary: "Observability",
        secondary:
          "Less than 50% of the system instrumented with decent logging",
      },
    ],
    how: [
      {
        primary: "Standups completed",
        secondary: "Attended at least 1 standup",
      },
      {
        primary: "Code reliability",
        secondary:
          "Code not consistently reliable — errors, >10s load times, obvious bugs",
      },
      {
        primary: "Customer-driven innovation",
        secondary: "Spoke to customer at least once",
      },
      {
        primary: "Production pushes",
        secondary: "Pushed code to production at least once",
      },
    ],
  },
  {
    hearts: 1,
    title: "Met goal",
    summary: {
      what: "More than 90% completion across all categories.",
      how: "3+ standups, reliable error-free code, 3+ documented customer interactions, 3+ production pushes.",
    },
    what: [
      {
        primary: "All 0.5-heart criteria",
        secondary: "But with more than 90% completion",
      },
    ],
    how: [
      { primary: "Standups completed", secondary: "At least 3 standups" },
      {
        primary: "Code reliability",
        secondary:
          "Works without errors, loads under 10 seconds, no obvious bugs",
      },
      {
        primary: "Customer-driven innovation",
        secondary: "3+ customer interactions with documentation",
      },
      {
        primary: "Production pushes",
        secondary: "Pushed code at least 3 times",
      },
    ],
  },
  {
    hearts: 1.5,
    title: "Exceeded goal",
    summary: {
      what: "100%+ completion, delivered 25% faster than expected.",
      how: "8 standups, fault-tolerant code reliable over a week, 8 customer interactions, 8 production pushes.",
    },
    what: [
      {
        primary: "100%+ completion",
        secondary: "Delivered 25% faster than expected",
      },
    ],
    how: [
      { primary: "Standups completed", secondary: "8 standups" },
      {
        primary: "Code reliability",
        secondary: "Fault tolerance, retries, caching — reliable over 1 week",
      },
      {
        primary: "Customer-driven innovation",
        secondary: "8 customer interactions",
      },
      { primary: "Production pushes", secondary: "8 pushes" },
    ],
  },
  {
    hearts: 2,
    title: "Greatly exceeded goal",
    summary: {
      what: "100%+ completion, delivered 50% faster than expected.",
      how: "15+ standups, outstanding reliability over two weeks, 15+ customer interactions, 15+ production pushes.",
    },
    what: [
      {
        primary: "100%+ completion",
        secondary: "Delivered 50% faster than expected",
      },
    ],
    how: [
      { primary: "Standups completed", secondary: "15+ standups" },
      {
        primary: "Code reliability",
        secondary: "Outstanding reliability over 2 weeks",
      },
      {
        primary: "Customer-driven innovation",
        secondary: "15+ customer interactions",
      },
      { primary: "Production pushes", secondary: "15+ pushes" },
    ],
  },
];

const heartsLabel = (hearts) =>
  `${hearts} ${hearts === 1 ? "heart" : "hearts"}`;

function CriteriaColumn({ title, items }) {
  return (
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>{title}</Eyebrow>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item, i) => (
          <li
            key={item.primary}
            style={{
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{item.primary}</div>
            <div
              className="ohx-muted"
              style={{ fontSize: "0.9rem", lineHeight: 1.5 }}
            >
              {item.secondary}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LevelDetails({ level, defaultOpen }) {
  return (
    <details
      open={defaultOpen}
      style={{ borderBottom: "1px solid var(--line)", padding: "18px 2px" }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 14px",
        }}
      >
        <span
          className={`ohx-tag${level.hearts === 2 ? " ohx-tag--accent" : ""}`}
          style={{ whiteSpace: "nowrap" }}
        >
          {heartsLabel(level.hearts)} per category
        </span>
        <span
          className="ohx-display"
          style={{ fontSize: "1.05rem", color: "var(--ink)", flex: "1 1 auto" }}
        >
          {level.title}
        </span>
        <span className="ohx-faint" style={{ fontSize: "0.8rem" }}>
          Criteria ▾
        </span>
      </summary>
      <div
        className="ohx-muted"
        style={{
          margin: "10px 0 0",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          maxWidth: "70ch",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong style={{ color: "var(--ink)" }}>What:</strong>{" "}
          {level.summary.what}
        </p>
        <p style={{ margin: "4px 0 0" }}>
          <strong style={{ color: "var(--ink)" }}>How:</strong>{" "}
          {level.summary.how}
        </p>
      </div>
      <div
        className="ohx-card"
        style={{
          marginTop: 16,
          padding: "18px 22px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px 32px",
        }}
      >
        <CriteriaColumn title="What you build" items={level.what} />
        <CriteriaColumn title="How you work" items={level.how} />
      </div>
    </details>
  );
}

export default function RewardStructure() {
  return (
    <div>
      <Eyebrow>Scoring guide</Eyebrow>
      <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>
        How many hearts a contribution earns
      </h2>
      <p
        className="ohx-muted"
        style={{ margin: "0 0 10px", maxWidth: "64ch", lineHeight: 1.6 }}
      >
        Each contribution is scored on a 0.5–2 heart scale per category. These
        criteria are flexible guidelines, not rigid rules. Opportunity Hack
        keeps discretion when awarding hearts: context, creativity, and
        real-world impact matter more than checking boxes.
      </p>
      <Link href="/about/completion" className="ohx-link">
        Read more about project completion <Arrow />
      </Link>
      <div style={{ marginTop: 26, borderTop: "1px solid var(--line)" }}>
        {REWARD_LEVELS.map((level, i) => (
          <LevelDetails
            key={level.hearts}
            level={level}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
