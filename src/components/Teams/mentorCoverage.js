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

// Each coverage item wants independent sign-off from this many distinct mentors
// (and we cap there — no point pestering a team for more). An item only counts
// as "covered" once it reaches this many checks. Keep in lockstep with the
// backend COVERAGE_TARGET_MENTORS in api/mentors/mentors_service.py.
export const COVERAGE_TARGET_MENTORS = 3;

// Normalize a mentor_checklist[slug] entry into an array of per-mentor checks:
//   [{ propel_id, name, checked_at }]  (oldest first)
// Tolerates the legacy single-mentor shape ({ done, checked_by_propel_id,
// checked_by_name, checked_at }) so old data renders until a mentor migrates it.
export function coverageChecks(entry) {
  if (!entry || typeof entry !== "object") return [];
  if (entry.checks && typeof entry.checks === "object") {
    return Object.entries(entry.checks)
      .filter(([, v]) => v && typeof v === "object")
      .map(([propel_id, v]) => ({
        propel_id,
        name: v.name,
        checked_at: v.checked_at,
      }))
      .sort((a, b) => (a.checked_at || "").localeCompare(b.checked_at || ""));
  }
  if (entry.done) {
    return [
      {
        propel_id: entry.checked_by_propel_id || "_legacy",
        name: entry.checked_by_name,
        checked_at: entry.checked_at,
      },
    ];
  }
  return [];
}

// An item counts toward the X/6 total once COVERAGE_TARGET_MENTORS mentors signed off.
export function coverageItemCovered(entry) {
  return coverageChecks(entry).length >= COVERAGE_TARGET_MENTORS;
}

// Count of fully-covered items across the whole checklist object.
export function coverageDoneCount(checklist) {
  const c = checklist || {};
  return MENTOR_COVERAGE_ITEMS.reduce(
    (acc, it) => acc + (coverageItemCovered(c[it.slug]) ? 1 : 0),
    0
  );
}

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

// Split a team's append-only `mentor_flags` into the two lists the panel
// renders: open flags (newest raised first) and the resolved history (most
// recently resolved first). Tolerates a missing/non-array field. A flag is
// "resolved" iff it carries `resolved_at` — the same test the backend's
// `_open_flag_count` uses, so the header count and these lists agree.
export function splitMentorFlags(flags) {
  const list = Array.isArray(flags) ? flags.filter(Boolean) : [];
  const open = list
    .filter((f) => !f.resolved_at)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  const resolved = list
    .filter((f) => Boolean(f.resolved_at))
    .sort((a, b) => (b.resolved_at || "").localeCompare(a.resolved_at || ""));
  return { open, resolved };
}

// Human-readable span between two ISO timestamps ("12m", "2h 14m", "1d 3h").
// Used for "open for …" on resolved flags so a mentor can see how long the
// team waited. Returns "" for missing/invalid input or a negative span.
export function durationLabel(startIso, endIso) {
  if (!startIso || !endIso) return "";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "";
  const totalMins = Math.round((end - start) / 60000);
  if (totalMins < 1) return "under a minute";
  const days = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const mins = totalMins % 60;
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

// ---- optimistic overlays ----------------------------------------------------
// Every mentor write round-trips the backend (mentor check, Firestore write,
// synchronous Slack audit, team re-read) — ~1-3s with no local feedback, which
// read as "the button is laggy". The panel overlays the calling mentor's
// in-flight changes on the server copy so the UI flips on click and reconciles
// (or reverts) when the response lands. Neither helper mutates its input.

// `overrides` is {[slug]: true|false} — add/clear MY check on that item.
export function applyOptimisticCoverage(checklist, overrides, myPropelId, myName) {
  const base = checklist || {};
  const slugs = Object.keys(overrides || {});
  if (!myPropelId || slugs.length === 0) return base;
  const out = { ...base };
  for (const slug of slugs) {
    const checks = {};
    for (const c of coverageChecks(out[slug])) {
      checks[c.propel_id] = { name: c.name, checked_at: c.checked_at };
    }
    if (overrides[slug]) {
      if (!checks[myPropelId]) {
        checks[myPropelId] = {
          name: myName || "You",
          checked_at: new Date().toISOString(),
        };
      }
    } else {
      delete checks[myPropelId];
    }
    out[slug] = { checks };
  }
  return out;
}

// `overrides` is {[criterion]: {score, rated_at}} — MY newest rating on it.
export function applyOptimisticRatings(byCriterion, overrides, myPropelId) {
  const base = byCriterion || {};
  const slugs = Object.keys(overrides || {});
  if (!myPropelId || slugs.length === 0) return base;
  const out = { ...base };
  for (const slug of slugs) {
    const o = overrides[slug];
    if (!o?.score) continue;
    out[slug] = {
      ...(out[slug] || {}),
      [myPropelId]: {
        criterion: slug,
        score: o.score,
        rated_at: o.rated_at,
        rated_by_propel_id: myPropelId,
        optimistic: true,
      },
    };
  }
  return out;
}
