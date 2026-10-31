import React from "react";
import MentorTeamPanel from "./MentorTeamPanel";

// Static, read-only render of MentorTeamPanel for the /about/mentors page.
// Passes eventId={null} so the panel skips its mentor-check fetch and renders
// in non-interactive mode for every visitor.
const DEMO_NOW = Date.now();
const minutesAgo = (m) => new Date(DEMO_NOW - m * 60_000).toISOString();
const hoursAgo = (h) => new Date(DEMO_NOW - h * 3_600_000).toISOString();

const DEMO_TEAM = {
  id: "demo-team",
  name: "Demo: Team NaNpossible",
  slack_channel: "team-demo",
  hackathon_event_id: "demo_event",
  mentor_last_touched_at: minutesAgo(42),
  mentor_last_touched_by_name: "Sai M.",
  mentor_open_flag_count: 1,
  // Per-mentor coverage: each item collects sign-off from up to 3 mentors.
  // intro_made is fully covered (3/3); the rest show partial coverage.
  mentor_checklist: {
    intro_made: {
      checks: {
        "demo-priya": { name: "Priya R.", checked_at: hoursAgo(20) },
        "demo-greg": { name: "Greg V.", checked_at: hoursAgo(6) },
        "demo-sai": { name: "Sai M.", checked_at: minutesAgo(42) },
      },
    },
    scope_reviewed: {
      checks: {
        "demo-priya": { name: "Priya R.", checked_at: hoursAgo(18) },
        "demo-greg": { name: "Greg V.", checked_at: hoursAgo(5) },
      },
    },
    architecture_discussed: {
      checks: {
        "demo-greg": { name: "Greg V.", checked_at: hoursAgo(6) },
      },
    },
  },
  mentor_flags: [
    {
      id: "demo-flag-1",
      created_at: minutesAgo(75),
      raised_by_propel_id: "demo-priya",
      raised_by_name: "Priya R.",
      severity: "needs_attention",
      body: "Team is stuck on auth setup — would love a mentor with NextAuth experience to do a quick screen-share.",
      owner_propel_id: "demo-priya",
      owner_name: "Priya R.",
    },
    // A resolved flag so the "history" disclosure has something to show.
    {
      id: "demo-flag-0",
      created_at: hoursAgo(19),
      raised_by_propel_id: "demo-greg",
      raised_by_name: "Greg V.",
      severity: "blocked",
      body: "No commits in the repo 6 hours in — team may be building locally without pushing.",
      owner_propel_id: "demo-greg",
      owner_name: "Greg V.",
      resolved_at: hoursAgo(17),
      resolved_by_propel_id: "demo-greg",
      resolved_by_name: "Greg V.",
      resolution_note:
        "They hadn't set up git remotes yet. Paired on it — first four commits are in and CI is green.",
    },
  ],
  mentor_notes: [
    {
      id: "demo-note-1",
      created_at: hoursAgo(20),
      author_propel_id: "demo-priya",
      author_name: "Priya R.",
      body: "Said hello in their Slack channel. Strong product idea, but they're trying to scope way too much for a weekend — recommended trimming to a single workflow.",
    },
    {
      id: "demo-note-2",
      created_at: hoursAgo(5),
      author_propel_id: "demo-greg",
      author_name: "Greg V.",
      body: "Reviewed the repo — clean commits, README is forming. Recommended they wire up CI before the demo cutoff so judges see a green badge (Polish).",
    },
    {
      id: "demo-note-3",
      created_at: minutesAgo(30),
      author_propel_id: "demo-jasmine",
      author_name: "Jasmine T.",
      body: "Walked them through judging criteria with concrete examples for Scope and Documentation. They have great impact potential — need to lean into nonprofit storytelling for the demo video.",
    },
  ],
  // Ratings tell the #412 story. Each criterion's state is a recency-weighted
  // blend of every mentor's latest rating, rounded to the closest score:
  // - Documentation: Greg's 8h-old yellow (which replaced his own 20h-old
  //   red) vs Jasmine's green 45m ago → green, with both ratings shown.
  // - Polish: Greg green 3h ago vs Sai red 2h ago — a fresh disagreement
  //   blends to "Needs attention" instead of silently picking a side.
  // - Security: Greg's 8h-old red stands alone — nobody has looked since,
  //   so the panel asks for a fresh look instead of silently trusting it.
  mentor_ratings: [
    {
      rated_at: hoursAgo(20),
      rated_by_propel_id: "demo-greg",
      rated_by_name: "Greg V.",
      criterion: "documentation",
      score: "red",
    },
    {
      rated_at: hoursAgo(8),
      rated_by_propel_id: "demo-greg",
      rated_by_name: "Greg V.",
      criterion: "documentation",
      score: "yellow",
    },
    {
      rated_at: hoursAgo(8),
      rated_by_propel_id: "demo-greg",
      rated_by_name: "Greg V.",
      criterion: "security",
      score: "red",
    },
    {
      rated_at: hoursAgo(3),
      rated_by_propel_id: "demo-greg",
      rated_by_name: "Greg V.",
      criterion: "scope",
      score: "green",
    },
    {
      rated_at: hoursAgo(3),
      rated_by_propel_id: "demo-greg",
      rated_by_name: "Greg V.",
      criterion: "polish",
      score: "green",
    },
    {
      rated_at: hoursAgo(2),
      rated_by_propel_id: "demo-sai",
      rated_by_name: "Sai M.",
      criterion: "polish",
      score: "red",
    },
    {
      rated_at: minutesAgo(45),
      rated_by_propel_id: "demo-jasmine",
      rated_by_name: "Jasmine T.",
      criterion: "documentation",
      score: "green",
    },
  ],
};

const DEMO_EVENT = {
  start_date: new Date(DEMO_NOW - 24 * 3_600_000).toISOString(),
  end_date: new Date(DEMO_NOW + 24 * 3_600_000).toISOString(),
};

export default function MentorTeamPanelDemo() {
  // eventId=null disables the mentor self-check fetch in MentorTeamPanel
  // (we never want a demo to make backend calls). onTeamUpdate is a no-op.
  return (
    <MentorTeamPanel
      team={DEMO_TEAM}
      event={DEMO_EVENT}
      eventId={null}
      onTeamUpdate={() => {}}
    />
  );
}
