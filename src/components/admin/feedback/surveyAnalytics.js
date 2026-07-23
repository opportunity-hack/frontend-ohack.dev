// Pure analytics helpers for the admin Event Surveys dashboard.
//
// Dependency-light (only moment, already bundled) and side-effect free so the
// panels stay readable and these can be unit-tested in isolation. The typed
// aggregation + answer formatting were lifted out of EventSurveysPanel so both
// the single-event view and the cross-event view share one implementation.
import moment from "moment";
import { parseTs, extractThemes } from "./onboardingAnalytics";
import { SURVEY_QUESTIONS, questionLabel, ROLE_OPTIONS } from "../../Survey/surveyQuestions";

export { parseTs, extractThemes };

export const QUESTIONS_BY_ID = Object.fromEntries(SURVEY_QUESTIONS.map((q) => [q.id, q]));
// Stable catalog order so question blocks render universal-first, then by role.
export const QUESTION_ORDER = SURVEY_QUESTIONS.map((q) => q.id);
export const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));

// Consistent per-role coloring and a distinct palette for overlaying series.
export const ROLE_COLORS = {
  hacker: "#1e88e5",
  mentor: "#8e24aa",
  judge: "#fb8c00",
  nonprofit: "#43a047",
  volunteer: "#00897b",
  sponsor: "#6d4c41",
  organizer: "#e53935",
};
export const SERIES_COLORS = [
  "#1e88e5", "#e53935", "#43a047", "#fb8c00", "#8e24aa", "#00897b", "#6d4c41", "#c0ca33",
];

/** Resolve the visible label for a question (prefer post, fall back to live/id). */
export const qLabel = (q) =>
  questionLabel(q, "post") || questionLabel(q, "live") || q?.label || q?.id;

// --------------------------------------------------------------- aggregation
/** Typed roll-up of a response set: scale dists, choice counts, free text. */
export function aggregate(responses) {
  const scale = {}; // id -> { sum, count, dist: {1..5} }
  const choice = {}; // id -> { counts: {opt: n}, total }
  const texts = {}; // id -> [{ text, role }]

  const addScale = (id, v) => {
    if (typeof v !== "number") return;
    const s = (scale[id] = scale[id] || { sum: 0, count: 0, dist: {} });
    s.sum += v;
    s.count += 1;
    s.dist[v] = (s.dist[v] || 0) + 1;
  };
  const addChoice = (id, v) => {
    if (v === null || v === undefined || v === "") return;
    const c = (choice[id] = choice[id] || { counts: {}, total: 0 });
    c.counts[v] = (c.counts[v] || 0) + 1;
    c.total += 1;
  };
  const addText = (id, t, role) => {
    if (!t || typeof t !== "string" || !t.trim()) return;
    (texts[id] = texts[id] || []).push({ text: t.trim(), role });
  };

  (responses || []).forEach((r) => {
    const role = r.role;
    const answers = r.answers || {};
    Object.entries(answers).forEach(([id, val]) => {
      const q = QUESTIONS_BY_ID[id];
      if (!q) return; // skip the mirrored `role` key and anything off-catalog
      switch (q.type) {
        case "scale":
          addScale(id, val);
          break;
        case "scale_text":
          if (val && typeof val === "object") {
            addScale(id, val.value);
            addText(id, val.note, role);
          }
          break;
        case "single":
        case "yesno":
        case "yesnomaybe":
          addChoice(id, val);
          break;
        case "yesno_text":
          if (val && typeof val === "object") {
            addChoice(id, val.value);
            addText(id, val.note, role);
          }
          break;
        case "multi":
          (Array.isArray(val) ? val : []).forEach((opt) => addChoice(id, opt));
          break;
        case "text":
          addText(id, val, role);
          break;
        default:
          break;
      }
    });
  });
  return { scale, choice, texts };
}

/** Format a single answer for the per-response detail view. */
export function formatAnswer(q, val) {
  if (val === null || val === undefined || val === "") return null;
  switch (q.type) {
    case "scale":
      return `${val} / 5`;
    case "scale_text":
      return typeof val === "object"
        ? `${val.value ?? "—"} / 5${val.note ? ` — “${val.note}”` : ""}`
        : null;
    case "yesno_text":
      return typeof val === "object"
        ? `${val.value ?? "—"}${val.note ? ` — “${val.note}”` : ""}`
        : null;
    case "multi":
      return Array.isArray(val) ? val.join(", ") : null;
    default:
      return String(val);
  }
}

// --------------------------------------------------------- time-over-event
/**
 * Bucket responses by elapsed hour since the event kickoff (event-local).
 * Continuous + zero-filled so quiet hours read as quiet. Powers the
 * single-event "live pulse" and the cross-event elapsed overlay.
 * Each bucket: { hour, count, avgRating, lowN }.
 */
export function elapsedHourSeries(responses, startISO, { liveOnly = true, maxHours } = {}) {
  const considered = (responses || []).filter((r) => (liveOnly ? r.mode === "live" : true));
  const timed = considered
    .map((r) => ({ r, t: parseTs(r.created_at) }))
    .filter((x) => x.t);
  if (!timed.length) return [];

  // Prefer the event's start; fall back to the earliest response in the set.
  // A date-only start (YYYY-MM-DD) is anchored at LOCAL midnight (not UTC) so
  // "hour 0" lines up with the kickoff day for same-timezone admins.
  let base =
    typeof startISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startISO)
      ? moment(startISO, "YYYY-MM-DD").toDate()
      : parseTs(startISO);
  if (!base) base = timed.reduce((min, x) => (x.t < min ? x.t : min), timed[0].t);

  const map = new Map();
  let observedMax = 0;
  for (const { r, t } of timed) {
    const h = Math.floor((t.getTime() - base.getTime()) / 3600000);
    if (h < 0) continue; // before kickoff — ignore
    if (h > observedMax) observedMax = h;
    let b = map.get(h);
    if (!b) {
      b = { count: 0, _sum: 0, _n: 0 };
      map.set(h, b);
    }
    b.count += 1;
    const rating = r.answers?.overall_rating;
    if (typeof rating === "number") {
      b._sum += rating;
      b._n += 1;
    }
  }

  // Span at least the event duration (if known) but include any late responses.
  const limit = maxHours != null ? Math.max(maxHours, observedMax) : observedMax;
  const out = [];
  for (let h = 0; h <= limit; h++) {
    const b = map.get(h) || { count: 0, _sum: 0, _n: 0 };
    out.push({
      hour: h,
      count: b.count,
      avgRating: b._n ? +(b._sum / b._n).toFixed(2) : null,
      lowN: b.count > 0 && b.count < 3,
    });
  }
  return out;
}

/** Hours between an event's start and (inclusive) end day, rounded up, or null. */
export function eventDurationHours(startISO, endISO) {
  if (!startISO || !endISO) return null;
  const dateOnly = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  const s = dateOnly(startISO) ? moment(startISO, "YYYY-MM-DD") : moment(parseTs(startISO));
  const e = dateOnly(endISO) ? moment(endISO, "YYYY-MM-DD") : moment(parseTs(endISO));
  if (!s.isValid() || !e.isValid()) return null;
  // end_date is a calendar day; treat it as inclusive end-of-day.
  const hrs = Math.ceil(e.endOf("day").diff(s, "hours", true));
  return hrs > 0 ? hrs : null;
}

// --------------------------------------------------------- qualitative pulls
/**
 * Split free text into positive vs improvement buckets for theming. Notes
 * attached to low scores (≤3 or "No") read as improvement signals.
 */
export function collectFreeText(
  responses,
  { positiveIds = ["going_well"], negativeIds = ["to_improve"] } = {}
) {
  const positive = [];
  const negative = [];
  const pull = (val) => {
    if (typeof val === "string") return val.trim();
    if (val && typeof val === "object" && typeof val.note === "string") return val.note.trim();
    return "";
  };
  for (const r of responses || []) {
    const answers = r.answers || {};
    positiveIds.forEach((id) => {
      const t = pull(answers[id]);
      if (t) positive.push(t);
    });
    negativeIds.forEach((id) => {
      const t = pull(answers[id]);
      if (t) negative.push(t);
    });
    for (const [id, val] of Object.entries(answers)) {
      const q = QUESTIONS_BY_ID[id];
      if (!q || (q.type !== "scale_text" && q.type !== "yesno_text")) continue;
      if (val && typeof val === "object" && val.note) {
        const low = (typeof val.value === "number" && val.value <= 3) || val.value === "No";
        if (low && !negativeIds.includes(id)) negative.push(String(val.note).trim());
      }
    }
  }
  return { positive, negative };
}

// --------------------------------------------------------------- red flags
// Live-distress answers worth surfacing to organizers in real time.
const LIVE_DISTRESS = [
  { id: "hacker_blocked", bad: (v) => typeof v === "string" && v && v !== "Not blocked", reason: (v) => `Blocked: ${v}` },
  { id: "mentor_unreachable", bad: (v) => v === "Yes", reason: () => "Couldn't reach a mentor" },
  { id: "npo_team_waiting", bad: (v) => v === "Yes", reason: () => "A team is waiting on this nonprofit" },
  { id: "mentor_team_concern", bad: (v) => typeof v === "string" && v.trim(), reason: (v) => `Worried about a team: “${v.trim()}”` },
  { id: "vol_live_issue", bad: (v) => typeof v === "string" && v.trim(), reason: (v) => `Live issue: “${v.trim()}”` },
];

/** Responses needing attention: low overall rating + live-distress signals. */
export function redFlags(responses) {
  const flagged = [];
  for (const r of responses || []) {
    const answers = r.answers || {};
    const reasons = [];
    const overall = answers.overall_rating;
    if (typeof overall === "number" && overall > 0 && overall <= 2) {
      reasons.push(`Low rating (${overall}/5)`);
    }
    for (const rule of LIVE_DISTRESS) {
      const v = answers[rule.id];
      if (rule.bad(v)) reasons.push(rule.reason(v));
    }
    if (reasons.length) flagged.push({ ...r, reasons });
  }
  flagged.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return flagged;
}

/** One-line gist of a response for compact lists. */
export function gist(r) {
  const a = r.answers || {};
  return (a.to_improve || a.going_well || "").toString().trim();
}
