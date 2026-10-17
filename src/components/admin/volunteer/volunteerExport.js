/**
 * Pure helpers behind the "Download CSV" dialog on the Volunteer admin tab.
 *
 * Two jobs:
 *   1. `scopeVolunteersForExport` — pick WHICH applications go in the file.
 *      Roster (isSelected) and review status are the two axes the admin
 *      chooses explicitly; the current view's search / check-in / preset
 *      filters can optionally be kept so "download what I'm looking at"
 *      works too. Uses the SAME `filterByDecision` the table and review
 *      list use, so counts in the dialog always match the counts on screen.
 *   2. `buildVolunteerExportColumns` — pick WHAT goes in each row. Driven by
 *      `applicationSchema.js` (the single field source for admin), so a new
 *      application field shows up in the export without touching this file.
 *      Any key on a doc the schema doesn't know about is appended as an
 *      "extra" column so nothing is silently dropped.
 *
 * No DOM, no React — see `__tests__/volunteerExport.test.js`.
 */

import {
  DECISION_KEYS,
  SYSTEM_KEYS,
  filterByDecision,
  getEditableFields,
  getFieldLabel,
  getRenderedKeys,
  getSearchValues,
  getSchema,
  readFieldValue,
  toPluralType,
  toSingularType,
} from "./applicationSchema";
import {
  APPLICATION_STATUSES,
  isKnownStatus,
  normalizeStatus,
  statusLabel,
} from "../../../lib/applicationStatus";

export const ROSTER_SCOPES = [
  { value: "all", label: "Everyone" },
  { value: "yes", label: "On roster" },
  { value: "no", label: "Not on roster" },
];

export const COLUMN_SETS = [
  {
    value: "all",
    label: "Everything on the application",
    description:
      "Every field the applicant filled in, plus status, roster and check-in.",
  },
  {
    value: "essentials",
    label: "Essentials",
    description:
      "Name, email, pronouns, status, roster, check-in, in-person, company.",
  },
];

// System keys that are noise in a spreadsheet (tokens, blobs, dead flags).
const EXPORT_SKIP_KEYS = new Set([
  "recaptchaToken",
  "sent_emails",
  "certificates",
  "profile_image",
  "selected",
  "type",
  "checkInTimeList",
  "checkoutTimeList",
  "checkedInBy",
]);

// Decision + check-in columns rendered first on every export.
const isCheckedIn = (doc) =>
  doc?.checkedIn === true || doc?.isCheckedIn === true;
const checkedInAt = (doc) => doc?.checkedInAt || doc?.checkInTime || "";

const DECISION_COLUMNS = [
  {
    key: "status",
    label: "Application status",
    get: (d) => statusLabel(normalizeStatus(d?.status)),
  },
  {
    key: "isSelected",
    label: "On event roster",
    get: (d) => Boolean(d?.isSelected),
  },
  { key: "checkedIn", label: "Checked in", get: (d) => isCheckedIn(d) },
  { key: "checkedInAt", label: "Checked in at", get: checkedInAt },
];

const ESSENTIAL_FIELD_KEYS = [
  "name",
  "email",
  "pronouns",
  "inPerson",
  "company",
  "companyName",
  "phone",
];

const fieldColumn = (field) => ({
  key: field.key,
  label: field.label,
  get: (doc) => readFieldValue(doc, field),
});

/**
 * Column spec for `buildCsv`. `rows` is inspected only to discover extra keys
 * (schema-unknown fields present on at least one doc).
 */
export function buildVolunteerExportColumns(
  type,
  rows = [],
  columnSet = "all",
) {
  const singular = toSingularType(type);
  const fields = getEditableFields(singular).filter(
    (f) => f.type !== "readonly",
  );
  const byKey = new Map(fields.map((f) => [f.key, f]));

  const lead = ["name", "email"]
    .map((k) => byKey.get(k))
    .filter(Boolean)
    .map(fieldColumn);
  const leadKeys = new Set(lead.map((c) => c.key));

  if (columnSet === "essentials") {
    const extras = ESSENTIAL_FIELD_KEYS.filter((k) => !leadKeys.has(k))
      .map((k) => byKey.get(k) || findFieldByAlias(fields, k))
      .filter(Boolean);
    const seen = new Set(leadKeys);
    const cols = [...lead, ...DECISION_COLUMNS];
    extras.forEach((f) => {
      if (seen.has(f.key)) return;
      seen.add(f.key);
      cols.push(fieldColumn(f));
    });
    cols.push({ key: "id", label: "Id" });
    return cols;
  }

  const rest = fields.filter((f) => !leadKeys.has(f.key)).map(fieldColumn);

  // System keys worth keeping, only when at least one row carries them.
  const present = new Set();
  rows.forEach((r) => {
    if (r && typeof r === "object")
      Object.keys(r).forEach((k) => present.add(k));
  });
  const system = SYSTEM_KEYS.filter(
    (k) => present.has(k) && !EXPORT_SKIP_KEYS.has(k),
  ).map((k) => ({
    key: k,
    label: getFieldLabel(singular, k),
  }));

  // Anything on a doc the schema doesn't account for — legacy keys, deposit
  // bookkeeping (hidden in the UI but useful in a spreadsheet), new fields.
  const known = getRenderedKeys(singular);
  const hidden = new Set(getSchema(singular).hidden || []);
  const extras = Array.from(present)
    .filter((k) => (!known.has(k) || hidden.has(k)) && !EXPORT_SKIP_KEYS.has(k))
    .filter((k) => !SYSTEM_KEYS.includes(k) && !DECISION_KEYS.includes(k))
    .sort()
    .map((k) => ({ key: k, label: getFieldLabel(singular, k) }));

  return [...lead, ...DECISION_COLUMNS, ...rest, ...system, ...extras];
}

function findFieldByAlias(fields, key) {
  return (
    fields.find((f) => f.readFrom?.includes(key) || f.writeTo?.includes(key)) ||
    null
  );
}

/**
 * Apply the dialog's choices (and optionally the current view's filters) to
 * the full list for one volunteer type.
 *
 *   rosterScope   "all" | "yes" | "no"
 *   statuses      null (= all) or array of normalized status values to keep
 *   keepView      when true, also apply `view.search`, `view.checkedInFilter`
 *                 and `view.preset` exactly like the table does
 */
export function scopeVolunteersForExport(
  list,
  {
    type,
    rosterScope = "all",
    statuses = null,
    keepView = false,
    view = {},
  } = {},
) {
  let out = (Array.isArray(list) ? list : []).filter(Boolean);

  if (keepView) {
    const search = (view.search || "").trim().toLowerCase();
    if (search) {
      out = out.filter((doc) =>
        getSearchValues(doc, type).some((v) =>
          v.toLowerCase().includes(search),
        ),
      );
    }
    if (view.checkedInFilter === "yes")
      out = out.filter((doc) => doc.checkedIn === true);
    else if (view.checkedInFilter === "no")
      out = out.filter((doc) => !doc.checkedIn);
  }

  out = filterByDecision(out, {
    statusFilter: "all",
    selectedFilter: rosterScope,
    preset: keepView && view.preset ? view.preset : "none",
  });

  if (Array.isArray(statuses)) {
    const keep = new Set(statuses.map(normalizeStatus));
    out = out.filter((doc) => keep.has(normalizeStatus(doc?.status)));
  }
  return out;
}

/** `[{ value, label, count }]` — catalog order first, then legacy values seen on docs. */
export function statusBreakdown(list) {
  const counts = new Map();
  (Array.isArray(list) ? list : []).forEach((doc) => {
    if (!doc) return;
    const v = normalizeStatus(doc.status);
    counts.set(v, (counts.get(v) || 0) + 1);
  });
  const rows = APPLICATION_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
    count: counts.get(s.value) || 0,
  }));
  Array.from(counts.keys())
    .filter((v) => !isKnownStatus(v))
    .sort()
    .forEach((v) =>
      rows.push({ value: v, label: statusLabel(v), count: counts.get(v) }),
    );
  return rows;
}

export function rosterBreakdown(list) {
  const arr = (Array.isArray(list) ? list : []).filter(Boolean);
  const yes = arr.filter((d) => Boolean(d.isSelected)).length;
  return { all: arr.length, yes, no: arr.length - yes };
}

/** Short, human filename suffix describing the scope: "on-roster-approved". */
export function exportScopeSlug({
  rosterScope = "all",
  statuses = null,
  allStatusCount = 0,
} = {}) {
  const parts = [];
  if (rosterScope === "yes") parts.push("on-roster");
  else if (rosterScope === "no") parts.push("not-on-roster");
  if (
    Array.isArray(statuses) &&
    statuses.length &&
    statuses.length < allStatusCount
  ) {
    parts.push(statuses.length <= 3 ? statuses.join("-") : "filtered");
  }
  return parts.join("-");
}

export const pluralType = (type) => toPluralType(type);
