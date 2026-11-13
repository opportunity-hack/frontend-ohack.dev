// Shared constants for the mentor team panel. Slugs AND cadences MUST stay
// in lockstep with backend MENTOR_COVERAGE_ITEMS in api/mentors/mentors_service.py.
// `cadence`: "once" = doing it one time is enough for the whole event;
// "recurring" = the sign-off goes stale after MENTOR_COVERAGE_FRESH_HOURS.

export const MENTOR_COVERAGE_ITEMS = [
  {
    slug: "intro_made",
    cadence: "once",
    label: "Mentor introductions made",
    blurb: "A mentor has connected with the team in their Slack channel.",
  },
  {
    slug: "scope_reviewed",
    cadence: "recurring",
    label: "Project scope reviewed",
    blurb:
      "Scope is realistic for the hackathon window and ties to a real nonprofit need.",
  },
  {
    slug: "architecture_discussed",
    cadence: "recurring",
    label: "Architecture & tech stack discussed",
    blurb:
      "Stack is sensible; nothing single-file or trivially shallow — addresses Polish and Scope in the judging rubric.",
  },
  {
    slug: "repo_health_checked",
    cadence: "recurring",
    label: "GitHub repo reviewed",
    blurb:
      "Commits flowing, structure sensible, README starting to take shape — addresses Documentation.",
  },
  {
    slug: "criteria_walkthrough",
    cadence: "once",
    label: "Judging criteria walkthrough",
    blurb:
      "Team has been shown the judging rubric (Scope, Documentation, Polish, Security, plus Accessibility) and knows what judges look for.",
  },
  {
    // Slug keeps its old name on purpose: renaming it would orphan every
    // sign-off already stored under it. DevPost is optional now, so the item
    // is about the demo video only.
    slug: "demo_devpost_reviewed",
    cadence: "recurring",
    label: "Demo video reviewed",
    blurb: "A mentor has watched at least a draft of the team's demo video.",
  },
];

export const MENTOR_COVERAGE_TOTAL = MENTOR_COVERAGE_ITEMS.length;

// Each coverage item wants independent sign-off from this many distinct mentors
// (and we cap there — no point pestering a team for more). An item only counts
// as "covered" once it reaches this many checks. Keep in lockstep with the
// backend COVERAGE_TARGET_MENTORS in api/mentors/mentors_service.py.
export const COVERAGE_TARGET_MENTORS = 3;

// ---- freshness --------------------------------------------------------------
// A sign-off is a snapshot: "a mentor checked this with the team". Over a
// two-day hackathon a Saturday check says nothing about Sunday, so a check
// only counts toward the headline while it is under MENTOR_COVERAGE_FRESH_HOURS
// old (about one mentor shift — the same scale as the 4h rating half-life).
// Older checks stay visible as "stale" (who, when) and the item asks for a
// fresh look. Items with `cadence: "once"` (introductions, the criteria
// walkthrough) never go stale: re-doing them every shift would just pester
// the team. The backend applies the same rule to its 3-mentor cap, so a
// stale check never blocks a fresh mentor from signing off.
//
// Freshness needs a clock, so `coverageSummary` takes `now` (epoch ms) from
// the caller: `useCoverageNow()` supplies it after mount (null during SSR +
// hydration, which means "count everything") and freezes it at the end of
// the event so a finished hackathon keeps its final picture instead of
// decaying to 0% a week later.
export const MENTOR_COVERAGE_FRESH_HOURS = 5;
export const MENTOR_COVERAGE_FRESH_MS =
  MENTOR_COVERAGE_FRESH_HOURS * 60 * 60 * 1000;

// The one-line caption under the checklist. The full rules live in
// COVERAGE_RULES (below, behind a "How coverage works" disclosure) so the
// panel doesn't read like a manual on every visit.
export const COVERAGE_CAPTION_COPY = `Tick what you've covered yourself. Checks last ${MENTOR_COVERAGE_FRESH_HOURS} hours.`;

export function coverageCadence(slug) {
  return (
    MENTOR_COVERAGE_ITEMS.find((it) => it.slug === slug)?.cadence || "recurring"
  );
}

// true while a check still counts at `now`. No clock → everything counts.
export function isCheckFresh(check, slug, now) {
  if (now == null || coverageCadence(slug) === "once") return true;
  const t = parseMentorTimestamp(check?.checked_at);
  if (Number.isNaN(t)) return true; // legacy check with no timestamp
  return now - t < MENTOR_COVERAGE_FRESH_MS;
}

// The append-only trail behind an item, newest first:
//   [{ propel_id, name, at, action: "checked" | "cleared" }]
// The backend appends one row per check / re-check / clear (Oct 2026);
// older data has no `history` and renders none.
export function coverageHistory(entry) {
  if (!entry || typeof entry !== "object" || !Array.isArray(entry.history)) {
    return [];
  }
  return entry.history
    .filter((h) => h && typeof h === "object")
    .map((h) => ({
      propel_id: h.propel_id,
      name: h.name,
      at: h.at,
      action: h.action === "cleared" ? "cleared" : "checked",
    }))
    .sort((a, b) => (b.at || "").localeCompare(a.at || ""));
}

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
    0,
  );
}

// ---- whole-checklist progress ----------------------------------------------
// "0/6 covered" only counted items that had every one of the 3 sign-offs, so
// a team two mentors had walked through end to end still read as untouched
// (every item sat at 2 of 3). The summary counts every individual sign-off
// instead: 6 items × 3 mentors = 18 possible, the headline is the share of
// those that are in, and how many distinct mentors contributed. "Fully
// covered" (all 3 on an item) stays as the secondary number — it is still
// what fires the backend's one-time Slack milestone.
export const COVERAGE_POSSIBLE_SIGNOFFS =
  MENTOR_COVERAGE_TOTAL * COVERAGE_TARGET_MENTORS;

// `now` (epoch ms, from useCoverageNow) switches freshness on: only checks
// under MENTOR_COVERAGE_FRESH_HOURS old count, the rest are reported as
// `stale`. Without it (SSR, tests, hydration) every check counts.
export function coverageSummary(checklist, { now = null } = {}) {
  const c = checklist || {};
  const mentors = new Map(); // propel_id -> name (first seen, fresh checks)
  let staleSignoffs = 0;
  let newestCheckMs = null;
  const items = MENTOR_COVERAGE_ITEMS.map((it) => {
    const checks = coverageChecks(c[it.slug]).map((ch) => ({
      ...ch,
      fresh: isCheckFresh(ch, it.slug, now),
    }));
    let fresh = 0;
    let stale = 0;
    for (const ch of checks) {
      const t = parseMentorTimestamp(ch.checked_at);
      if (!Number.isNaN(t) && (newestCheckMs == null || t > newestCheckMs)) {
        newestCheckMs = t;
      }
      if (!ch.fresh) {
        stale += 1;
        continue;
      }
      fresh += 1;
      if (!mentors.has(ch.propel_id)) mentors.set(ch.propel_id, ch.name);
    }
    staleSignoffs += stale;
    // The backend refuses a 4th fresh check, so the cap only guards odd
    // legacy data from pushing the percentage past 100.
    const count = Math.min(fresh, COVERAGE_TARGET_MENTORS);
    return {
      slug: it.slug,
      label: it.label,
      cadence: it.cadence,
      count,
      stale,
      target: COVERAGE_TARGET_MENTORS,
      covered: count >= COVERAGE_TARGET_MENTORS,
      checks,
      history: coverageHistory(c[it.slug]),
    };
  });
  const signoffs = items.reduce((sum, i) => sum + i.count, 0);
  const possible = COVERAGE_POSSIBLE_SIGNOFFS;
  const fullyCovered = items.filter((i) => i.covered).length;
  return {
    items,
    signoffs,
    staleSignoffs,
    possible,
    percent: possible ? Math.round((signoffs / possible) * 100) : 0,
    fullyCovered,
    started: items.filter((i) => i.count > 0).length,
    totalItems: MENTOR_COVERAGE_TOTAL,
    target: COVERAGE_TARGET_MENTORS,
    mentorCount: mentors.size,
    mentorNames: [...mentors.values()].filter(Boolean),
    complete: fullyCovered === MENTOR_COVERAGE_TOTAL,
    freshHours: MENTOR_COVERAGE_FRESH_HOURS,
    now,
    newestCheckAt: newestCheckMs,
  };
}

function mentorsWord(n) {
  return `${n} mentor${n === 1 ? "" : "s"}`;
}

// The rules, one per bullet, for the "How coverage works" disclosure. This
// is the only place the 18-sign-off arithmetic is spelled out.
export const COVERAGE_RULES = [
  `Each item needs ${COVERAGE_TARGET_MENTORS} different mentors. Tick only what you covered yourself; it turns green at ${COVERAGE_TARGET_MENTORS}, and you can clear your own tick anytime.`,
  `The percentage is the share of all ${COVERAGE_POSSIBLE_SIGNOFFS} possible sign-offs (${MENTOR_COVERAGE_TOTAL} items × ${COVERAGE_TARGET_MENTORS} mentors) that are fresh.`,
  `A check lasts ${MENTOR_COVERAGE_FRESH_HOURS} hours, about one shift. After that it shows as stale and asks you to confirm again.`,
  "Introductions and the judging-criteria walkthrough never go stale.",
];

// The headline every surface renders — one number, one qualifier, the
// meter does the rest: "56% covered · 2 mentors", "Fully covered · 3
// mentors", "No sign-offs yet". `compact` is the table form ("56% · 2
// mentors"). Stale sign-offs are NOT counted in the headline (the meter's
// faint segments, the tooltip and the per-item chips carry them); the one
// exception is a team whose every sign-off has gone stale, which says so
// and when the last one was.
export function coverageLabel(summary, { compact = false } = {}) {
  const s = summary;
  if (!s) return "";
  const stale = s.staleSignoffs || 0;
  if (s.signoffs === 0) {
    if (stale === 0) return compact ? "0%" : "No sign-offs yet";
    if (compact) return "0% · all stale";
    const last = relativeTime(s.newestCheckAt, s.now);
    return `No fresh sign-offs${last ? ` · last one ${last}` : ""}`;
  }
  const who = mentorsWord(s.mentorCount);
  if (compact) return `${s.percent}% · ${who}`;
  if (s.complete) return `Fully covered · ${who}`;
  return `${s.percent}% covered · ${who}`;
}

// The sentence behind the headline (tooltip / meter aria-label): three
// short clauses, no arithmetic — "4 fresh sign-offs · 8 stale (older than
// 5h) · 0 of 6 items fully covered". Without a clock (SSR, tests) the
// sign-offs aren't "fresh", just counted.
export function coverageDetail(summary) {
  const s = summary;
  if (!s) return "";
  const plural = s.signoffs === 1 ? "" : "s";
  const parts = [
    s.now != null
      ? `${s.signoffs} fresh sign-off${plural}`
      : `${s.signoffs} sign-off${plural}`,
  ];
  if (s.staleSignoffs > 0) {
    parts.push(`${s.staleSignoffs} stale (older than ${s.freshHours}h)`);
  }
  parts.push(`${s.fullyCovered} of ${s.totalItems} items fully covered`);
  return parts.join(" · ");
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

// Numeric value of each score for blending (red is worst).
export const SCORE_VALUE = { red: 1, yellow: 2, green: 3 };

// Recency weighting for the blend (#412): a rating counts half as much for
// every RATING_HALF_LIFE_HOURS it is behind the newest rating on the same
// criterion. 4h ≈ one mentor shift, so the previous shift's call still counts
// but can't outvote the mentor who looked most recently.
export const RATING_HALF_LIFE_HOURS = 4;
export const RATING_HALF_LIFE_MS = RATING_HALF_LIFE_HOURS * 60 * 60 * 1000;

// One sentence, reused by every surface that explains the rule.
export const RATING_RULE_COPY = `Each mentor's latest rating counts, weighted toward the most recent — a rating counts half as much for every ${RATING_HALF_LIFE_HOURS} hours it trails the newest one — and the blend is rounded to the closest score.`;

// Mentor timestamps (`rated_at`, `checked_at`, `created_at`,
// `mentor_last_touched_at`, …) arrive as NAIVE ISO strings — the backend
// stamps `datetime.now().isoformat()` on a UTC container, so there's no `Z`
// and no offset. `new Date(naive)` parses those as browser-local time, which
// put every "Xm ago" in Arizona 7h into the future ("just now" for most of a
// shift). Treat an offset-less string as UTC; pass real offsets (and the
// client's own `toISOString()` overlays) straight through. Returns epoch ms
// or NaN.
export function parseMentorTimestamp(iso) {
  if (!iso) return NaN;
  if (typeof iso !== "string") return new Date(iso).getTime();
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return new Date(hasOffset || dateOnly ? iso : `${iso}Z`).getTime();
}

export function latestRatingsByMentor(ratings) {
  // ratings is an append-only array. Returns a map of
  //   { [criterion]: { [propel_id]: latest_entry } }
  const out = {};
  if (!Array.isArray(ratings)) return out;
  for (const r of ratings) {
    if (!r?.criterion || !r?.rated_by_propel_id || !SCORE_META[r.score])
      continue;
    const c = r.criterion;
    if (!out[c]) out[c] = {};
    const existing = out[c][r.rated_by_propel_id];
    if (!existing || (r.rated_at || "") > (existing.rated_at || "")) {
      out[c][r.rated_by_propel_id] = r;
    }
  }
  return out;
}

// Newest-first history of every rating on one criterion (a sorted copy; the
// stored array is append-only, oldest-first). Malformed entries are dropped.
export function ratingHistory(ratings, criterion) {
  if (!Array.isArray(ratings) || !criterion) return [];
  return ratings
    .filter(
      (r) =>
        r &&
        r.criterion === criterion &&
        r.rated_by_propel_id &&
        SCORE_META[r.score],
    )
    .sort((a, b) => (b.rated_at || "").localeCompare(a.rated_at || ""));
}

// Round a blended value (1..3) to the closest score. An exact midpoint
// rounds DOWN — a 50/50 split between "On track" and "Needs attention" is a
// reason to look, not a pass.
export function scoreFromValue(value) {
  if (!Number.isFinite(value)) return null;
  if (value > 2.5) return "green";
  if (value > 1.5) return "yellow";
  return "red";
}

// Weight of one rating relative to the newest rating on the criterion
// (`anchorMs`): 1 for the newest, halving every RATING_HALF_LIFE_MS behind
// it. Measured against the newest rating, NOT the clock, so the blend is a
// pure function of the data — it doesn't drift between server render and
// hydration, and two ratings from last week still compare sensibly.
export function ratingWeight(entry, anchorMs) {
  const t = parseMentorTimestamp(entry?.rated_at);
  if (Number.isNaN(t) || !Number.isFinite(anchorMs)) return 1;
  const behind = Math.max(0, anchorMs - t);
  return Math.pow(0.5, behind / RATING_HALF_LIFE_MS);
}

// The CURRENT state of a criterion is a recency-weighted blend of each
// mentor's latest rating, rounded to the closest score (#412). Neither
// extreme worked: "worst wins" froze an "At risk" from a mentor who had gone
// home, and "newest wins" threw away every other opinion. Here every mentor
// still has a vote, the most recent vote counts the most, and a fresh
// disagreement lands on "Needs attention" instead of silently picking a side.
// Input is the per-mentor map from latestRatingsByMentor so the optimistic
// overlay flows through: an in-flight entry is by definition the newest
// action and anchors the blend at weight 1, whatever the two clocks say.
// Returns null when nobody has rated, else
//   { score, value, newest, contributions: [{ entry, weight, share }] }
// with contributions newest-first and shares summing to 1.
export function blendedRating(latestForCriterion) {
  if (!latestForCriterion) return null;
  const entries = Object.values(latestForCriterion).filter((r) =>
    Boolean(SCORE_META[r?.score]),
  );
  if (entries.length === 0) return null;
  const optimistic = entries.find((r) => r.optimistic) || null;
  const times = entries.map((r) => parseMentorTimestamp(r.rated_at));
  const anchorMs = optimistic
    ? parseMentorTimestamp(optimistic.rated_at)
    : Math.max(...times.filter((t) => !Number.isNaN(t)));
  const weighted = entries.map((entry, i) => ({
    entry,
    weight: entry.optimistic ? 1 : ratingWeight(entry, anchorMs),
    t: Number.isNaN(times[i]) ? -Infinity : times[i],
  }));
  weighted.sort((a, b) => {
    if (a.entry.optimistic !== b.entry.optimistic) {
      return a.entry.optimistic ? -1 : 1;
    }
    return b.t - a.t;
  });
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  const value =
    weighted.reduce(
      (sum, w) => sum + w.weight * SCORE_VALUE[w.entry.score],
      0,
    ) / total;
  return {
    score: scoreFromValue(value),
    value,
    newest: weighted[0].entry,
    contributions: weighted.map(({ entry, weight }) => ({
      entry,
      weight,
      share: weight / total,
    })),
  };
}

// Newest contributing rating across every criterion — the "latest Xm ago"
// caption the compact dot strips show so the time element is never implicit.
export function newestRating(ratingsByMentor) {
  let newest = null;
  for (const perMentor of Object.values(ratingsByMentor || {})) {
    const cur = blendedRating(perMentor)?.newest;
    if (cur && (!newest || (cur.rated_at || "") > (newest.rated_at || ""))) {
      newest = cur;
    }
  }
  return newest;
}

// A newest rating older than this during a live event is worth a fresh
// look — a team can change a lot in half a shift. Display hint only: it
// never changes the blend.
export const RATING_STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export function isRatingStale(entry, now = Date.now()) {
  const t = parseMentorTimestamp(entry?.rated_at);
  if (Number.isNaN(t)) return false;
  return now - t > RATING_STALE_AFTER_MS;
}

// "45m ago · Jasmine T." / "45m ago · you" — the attribution every surface
// renders beside a rating.
export function ratingAttribution(entry, myPropelId) {
  if (!entry) return "";
  const when = relativeTime(entry.rated_at);
  const who =
    myPropelId && entry.rated_by_propel_id === myPropelId
      ? "you"
      : entry.rated_by_name || "a mentor";
  return when ? `${when} · ${who}` : who;
}

// The one-line summary beside a blended score on the compact surfaces:
// "45m ago · Jasmine T." for a single rating, "2 ratings, latest 45m ago ·
// Jasmine T." when the score is a blend.
export function ratingBlendSummary(blend, myPropelId) {
  if (!blend) return "";
  const latest = ratingAttribution(blend.newest, myPropelId);
  const n = blend.contributions.length;
  return n > 1 ? `${n} ratings, latest ${latest}` : latest;
}

// `now` (epoch ms) defaults to the wall clock; pass the coverage clock when
// the caller's other numbers are frozen to it (event end, tests).
export function relativeTime(iso, now = null) {
  if (!iso) return "";
  const then = parseMentorTimestamp(iso);
  if (Number.isNaN(then)) return "";
  const diffMs = (now ?? Date.now()) - then;
  if (diffMs < 0) return "just now";
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
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
  const start = parseMentorTimestamp(startIso);
  const end = parseMentorTimestamp(endIso);
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
export function applyOptimisticCoverage(
  checklist,
  overrides,
  myPropelId,
  myName,
) {
  const base = checklist || {};
  const slugs = Object.keys(overrides || {});
  if (!myPropelId || slugs.length === 0) return base;
  const out = { ...base };
  for (const slug of slugs) {
    const prev = out[slug] && typeof out[slug] === "object" ? out[slug] : {};
    const checks = {};
    for (const c of coverageChecks(prev)) {
      checks[c.propel_id] = { name: c.name, checked_at: c.checked_at };
    }
    if (overrides[slug]) {
      // Adding — or re-confirming a stale check: either way mine is "now".
      checks[myPropelId] = {
        name: checks[myPropelId]?.name || myName || "You",
        checked_at: new Date().toISOString(),
      };
    } else {
      delete checks[myPropelId];
    }
    // Keep the audit trail (and any legacy keys): only `checks` changes here.
    out[slug] = { ...prev, checks };
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
