// Pure CSV column builders for the admin Feedback page (one per data source).
// Each returns a `buildCsv` column spec (see src/lib/csvExport.js), so escaping
// and spreadsheet-formula defusing stay in the one shared writer.
import { QUESTIONS_BY_ID, QUESTION_ORDER, ROLE_LABEL, qLabel } from "./surveyAnalytics";
import { parseDevice } from "./onboardingAnalytics";

const NOTE_TYPES = new Set(["scale_text", "yesno_text"]);

const answerValue = (val) =>
  val && typeof val === "object" && !Array.isArray(val) ? val.value ?? "" : val ?? "";

/**
 * One row per survey response. Question columns are limited to questions that
 * at least one response answered (catalog order first, unknown ids last);
 * "rating + comment" questions get a second "(comment)" column.
 */
export function surveyResponseColumns(responses, eventTitle) {
  const present = new Set();
  (responses || []).forEach((r) => Object.keys(r.answers || {}).forEach((id) => present.add(id)));
  const ids = [
    ...QUESTION_ORDER.filter((id) => present.has(id)),
    ...[...present].filter((id) => !QUESTIONS_BY_ID[id]).sort(),
  ];

  const columns = [
    { key: "created_at", label: "Submitted" },
    { key: "event", label: "Event", get: () => eventTitle || "" },
    { key: "role", label: "Role", get: (r) => ROLE_LABEL[r.role] || r.role || "" },
    { key: "mode", label: "Live or post" },
    { key: "is_anonymous", label: "Anonymous", get: (r) => !!r.is_anonymous },
    { key: "email", label: "Email", get: (r) => (r.is_anonymous ? "" : r.email || "") },
  ];
  ids.forEach((id) => {
    const q = QUESTIONS_BY_ID[id];
    const label = q ? qLabel(q) : id;
    columns.push({ key: id, label, get: (r) => answerValue(r.answers?.[id]) });
    if (q && NOTE_TYPES.has(q.type)) {
      columns.push({
        key: `${id}__note`,
        label: `${label} (comment)`,
        get: (r) => r.answers?.[id]?.note || "",
      });
    }
  });
  return columns;
}

/** One row per event (the "Compare events" table). */
export const SURVEY_OVERVIEW_COLUMNS = [
  { key: "title", label: "Event", get: (e) => e.title || e.event_id },
  { key: "event_id", label: "Event ID" },
  { key: "start_date", label: "Start date" },
  { key: "count", label: "Responses" },
  { key: "rating", label: "Avg overall rating", get: (e) => e.overall_rating?.average ?? "" },
  { key: "would_return", label: "Avg would return", get: (e) => e.would_return?.average ?? "" },
  { key: "live", label: "Live responses", get: (e) => e.by_mode?.live || 0 },
  { key: "post", label: "Post responses", get: (e) => e.by_mode?.post || 0 },
];

/** One row per peer feedback entry; every score / comment key gets a column. */
export function peerFeedbackColumns(items) {
  const keys = [];
  const seen = new Set(["role"]);
  (items || []).forEach((f) =>
    Object.keys(f.feedback || {}).forEach((k) => {
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    })
  );
  return [
    { key: "timestamp", label: "Date" },
    {
      key: "giver",
      label: "From",
      get: (f) => f.giver?.name || (f.is_anonymous ? "Anonymous" : "Unknown"),
    },
    { key: "receiver", label: "To", get: (f) => f.receiver?.name || "Unknown" },
    { key: "role", label: "Role" },
    { key: "relationship", label: "Relationship" },
    { key: "is_anonymous", label: "Anonymous", get: (f) => !!f.is_anonymous },
    { key: "confidence_level", label: "Confidence" },
    { key: "duration", label: "Known for" },
    ...keys.map((k) => ({ key: `fb:${k}`, label: k, get: (f) => f.feedback?.[k] ?? "" })),
  ];
}

/** One row per onboarding feedback response. */
export const ONBOARDING_COLUMNS = [
  { key: "timestamp", label: "Date" },
  { key: "overallRating", label: "Rating (1-5)", get: (it) => it.overallRating || "" },
  { key: "easeOfUnderstanding", label: "Ease of understanding" },
  { key: "usefulTopics", label: "Useful topics" },
  { key: "missingTopics", label: "Missing / wanted topics" },
  { key: "improvements", label: "Suggested improvements" },
  { key: "additionalFeedback", label: "Additional feedback" },
  { key: "willing", label: "Open to follow-up", get: (it) => !!it.contact?.willing },
  { key: "firstName", label: "First name", get: (it) => (it.contact?.willing ? it.contact?.firstName || "" : "") },
  { key: "email", label: "Email", get: (it) => (it.contact?.willing ? it.contact?.email || "" : "") },
  { key: "device", label: "Device", get: (it) => parseDevice(it.userAgent).label },
];
