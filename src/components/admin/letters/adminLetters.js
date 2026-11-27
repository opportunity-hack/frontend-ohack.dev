// Pure helpers for /admin/letters (unit-tested in __tests__/adminLetters.test.js).
import { reasonText, roleLabel } from "../../Profile/Letters/letterStates";

export const ROLE_OPTIONS = ["judge", "mentor", "volunteer", "hacker"];

export const STATUS_FILTERS = Object.freeze([
  { value: "all", label: "All" },
  { value: "eligible", label: "Eligible, not issued" },
  { value: "not_eligible", label: "Not eligible" },
  { value: "issued", label: "Issued" },
  { value: "revoked", label: "Revoked" },
]);

/** Where a row sits for the status filter. */
export function rowStatus(row) {
  if (row?.letter_id && row.status === "revoked") return "revoked";
  if (row?.letter_id && row.status === "issued") return "issued";
  return row?.eligible ? "eligible" : "not_eligible";
}

export function filterRows(rows, { role = "all", status = "all", search = "" } = {}) {
  const needle = search.trim().toLowerCase();
  return (rows || []).filter((row) => {
    if (role !== "all" && row.role !== role) return false;
    if (status !== "all" && rowStatus(row) !== status) return false;
    if (needle) {
      const hay = `${row.name || ""} ${row.email || ""} ${row.evidence?.team_name || ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

/** Row whose letter "Preview sample" renders for a role: the first issued
 * or eligible person (closest to what people will get), else anyone. */
export function sampleRowFor(rows, role) {
  const ofRole = (rows || []).filter((r) => r.role === role && r.user_id);
  return (
    ofRole.find((r) => rowStatus(r) === "issued") ||
    ofRole.find((r) => r.eligible) ||
    ofRole[0] ||
    null
  );
}

export function countsByStatus(rows) {
  const out = { all: 0, eligible: 0, not_eligible: 0, issued: 0, revoked: 0 };
  for (const row of rows || []) {
    out.all += 1;
    out[rowStatus(row)] += 1;
  }
  return out;
}

function formatWhen(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Phoenix",
  });
}

export const formatIssuedDate = (value) => formatWhen(value);

/** Short evidence lines for the table: what the eligibility verdict rests on. */
export function evidenceLines(row) {
  const ev = row?.evidence || {};
  const lines = [];
  if (ev.is_selected === false) lines.push("Not approved");
  if (row?.role === "judge") {
    lines.push(`${ev.score_count ?? 0} score${ev.score_count === 1 ? "" : "s"}`);
  }
  if (ev.check_in_time) lines.push(`Checked in ${formatWhen(ev.check_in_time)}`);
  else if (row?.role === "mentor" || row?.role === "volunteer") lines.push("No check-in");
  if (row?.role === "hacker") lines.push(ev.team_name ? `Team ${ev.team_name}` : "No team");
  return lines;
}

export function eligibilityLabel(row) {
  return row?.eligible ? "Eligible" : reasonText(row?.reason);
}

// Frozen facts, in the order the letter uses them. Anything else in the
// snapshot is listed after these, so nothing is hidden.
const FACT_LABELS = [
  ["name", "Name"],
  ["title_line", "Title line"],
  ["role", "Role"],
  ["event_title", "Event"],
  ["season_label", "Header season"],
  ["city_state", "City, state"],
  ["venue", "Venue"],
  ["attendance", "Attendance"],
  ["served_date", "Date served"],
  ["n_teams", "Teams evaluated"],
  ["nonprofits", "Nonprofits"],
  ["mentor_teams", "Teams mentored"],
  ["team_name", "Team"],
  ["project_title", "Project"],
  ["nonprofit_name", "Nonprofit"],
  ["awards", "Awards"],
  ["template_version", "Template version"],
];
const SKIP = new Set(["served_dates", "event_id"]);

function display(value, key) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (key === "role") return roleLabel(value);
  return String(value);
}

/** [[label, value]] for the frozen-facts panel. */
export function factRows(facts) {
  if (!facts) return [];
  const known = new Set(FACT_LABELS.map(([k]) => k));
  const out = FACT_LABELS.filter(([k]) => k in facts).map(([k, label]) => [label, display(facts[k], k)]);
  for (const key of Object.keys(facts)) {
    if (!known.has(key) && !SKIP.has(key)) out.push([key, display(facts[key], key)]);
  }
  return out;
}
