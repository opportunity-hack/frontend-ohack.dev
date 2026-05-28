// Shared constants for the mentor team panel. Slugs MUST stay in lockstep
// with backend MENTOR_COVERAGE_ITEMS in api/mentors/mentors_service.py.

export const MENTOR_COVERAGE_ITEMS = [
  {
    slug: "intro_made",
    label: "Mentor introductions made",
    blurb: "A mentor has connected with the team in their Slack channel.",
  },
  {
    slug: "scope_reviewed",
    label: "Project scope reviewed",
    blurb:
      "Scope is realistic for the hackathon window and ties to a real nonprofit need.",
  },
  {
    slug: "architecture_discussed",
    label: "Architecture & tech stack discussed",
    blurb:
      "Stack is sensible; nothing single-file or trivially shallow — addresses Polish and Scope in the judging rubric.",
  },
  {
    slug: "repo_health_checked",
    label: "GitHub repo reviewed",
    blurb:
      "Commits flowing, structure sensible, README starting to take shape — addresses Documentation.",
  },
  {
    slug: "criteria_walkthrough",
    label: "Judging criteria walkthrough",
    blurb:
      "Team has been shown the judging rubric (Scope, Documentation, Polish, Security, plus Accessibility) and knows what judges look for.",
  },
  {
    slug: "demo_devpost_reviewed",
    label: "Demo video + DevPost reviewed",
    blurb:
      "A mentor has reviewed at least a draft of the demo video and DevPost submission.",
  },
];

export const MENTOR_COVERAGE_TOTAL = MENTOR_COVERAGE_ITEMS.length;

// Judging rubric mentors use to coach teams. The labels and blurbs mirror
// /about/judges#judging-criteria. Accessibility is a separate "special
// category" prize on the judges page but mentors still need to coach for it.
export const JUDGING_CRITERIA = [
  {
    slug: "scope",
    label: "Scope",
    blurb: "Impact on community + complexity of the problem solved.",
  },
  {
    slug: "documentation",
    label: "Documentation",
    blurb: "Clear code & UX docs; easy for the nonprofit to understand.",
  },
  {
    slug: "polish",
    label: "Polish",
    blurb: "Minimal work remaining; the solution can be used today.",
  },
  {
    slug: "security",
    label: "Security",
    blurb: "Data is protected; role-based access where applicable.",
  },
  {
    slug: "accessibility",
    label: "Accessibility",
    blurb:
      "W3C principles (perceivable, operable, understandable, robust); aim for Lighthouse a11y > 95.",
  },
];

export const SCORE_VALUES = ["green", "yellow", "red"];

export const SCORE_META = {
  green: { label: "On track", emoji: "🟢", color: "success" },
  yellow: { label: "Needs attention", emoji: "🟡", color: "warning" },
  red: { label: "At risk", emoji: "🔴", color: "error" },
};

// Rank: red is worst. Used to compute the "team consensus" rating
// (worst among each mentor's most-recent rating per criterion).
export const SCORE_RANK = { red: 0, yellow: 1, green: 2 };

export function latestRatingsByMentor(ratings) {
  // ratings is an append-only array. Returns a map of
  //   { [criterion]: { [propel_id]: latest_entry } }
  const out = {};
  if (!Array.isArray(ratings)) return out;
  for (const r of ratings) {
    if (!r?.criterion || !r?.rated_by_propel_id) continue;
    const c = r.criterion;
    if (!out[c]) out[c] = {};
    const existing = out[c][r.rated_by_propel_id];
    if (!existing || (r.rated_at || "") > (existing.rated_at || "")) {
      out[c][r.rated_by_propel_id] = r;
    }
  }
  return out;
}

export function consensusForCriterion(latestForCriterion) {
  // Worst (lowest rank) wins. Returns score string or null.
  if (!latestForCriterion) return null;
  let worst = null;
  for (const r of Object.values(latestForCriterion)) {
    if (!worst || SCORE_RANK[r.score] < SCORE_RANK[worst]) {
      worst = r.score;
    }
  }
  return worst;
}

export function relativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  if (diffMs < 0) return "just now";
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
