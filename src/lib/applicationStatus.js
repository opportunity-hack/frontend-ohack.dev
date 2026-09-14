// Canonical application-status catalog for volunteer applications (judges,
// mentors, volunteers, hackers, sponsors) — the single source of truth for
// the internal REVIEW pipeline value stored on a volunteer doc as `status`.
//
// `status` is deliberately independent of `isSelected` (the EVENT ROSTER bit:
// "this person is live on the event page with participant tools unlocked").
// Reviewing happens over days via `status`; publishing to the roster is a
// separate, later decision. Nothing outside the admin UI reads `status`;
// every participant-facing gate keys on `isSelected`.
//
// The backend stores `status` as a free-form string, so this list (plus the
// legacy passthrough in `normalizeStatus`) is what keeps every admin surface
// consistent. Mirrors the pattern in `src/lib/projectStatus.js`.

export const APPLICATION_STATUSES = [
  {
    value: "pending",
    label: "Pending review",
    color: "default",
    icon: "hourglass",
    description: "Submitted — nobody has reviewed it yet",
  },
  {
    value: "approved",
    label: "Approved",
    color: "success",
    icon: "check",
    description: "Reviewed and accepted",
  },
  {
    value: "waitlisted",
    label: "Waitlisted",
    color: "warning",
    icon: "queue",
    description: "Good fit — holding until a slot opens",
  },
  {
    value: "verified_travel",
    label: "Travel verified",
    color: "info",
    icon: "flight",
    description: "Approved; travel / attendance details confirmed",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "primary",
    icon: "verified",
    description: "Confirmed they will attend",
  },
  {
    value: "denied",
    label: "Denied",
    color: "error",
    icon: "close",
    description: "Not moving forward",
    isTerminal: true,
  },
  {
    value: "withdrew",
    label: "Withdrew",
    color: "default",
    icon: "undo",
    description: "Applicant pulled out",
    isTerminal: true,
  },
  {
    value: "no_show",
    label: "No-show",
    color: "error",
    icon: "personOff",
    description: "Did not show up",
    isTerminal: true,
  },
];

export const DEFAULT_STATUS = "pending";

export const STATUS_VALUES = APPLICATION_STATUSES.map((s) => s.value);

// Statuses that mean "this person should be on the roster". Used by the
// "Ready for roster" preset and the "Add all ready" bulk action.
export const ROSTER_READY_STATUSES = ["approved", "verified_travel", "confirmed"];

const BY_VALUE = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.value, s]));

// Case/whitespace-fold a stored value onto the catalog: "Approved " -> "approved".
const foldKnown = (raw) => {
  const folded = raw.toLowerCase().replace(/[\s-]+/g, "_");
  return BY_VALUE[folded] ? folded : null;
};

/**
 * Normalize whatever is on the doc to a status value.
 *  - ""/null/undefined -> "pending"
 *  - known values are case/whitespace-folded ("Approved" -> "approved")
 *  - anything else passes through trimmed so legacy values still render
 */
export function normalizeStatus(value) {
  if (value === null || value === undefined) return DEFAULT_STATUS;
  const raw = String(value).trim();
  if (!raw) return DEFAULT_STATUS;
  return foldKnown(raw) || raw;
}

export function isKnownStatus(value) {
  return Boolean(BY_VALUE[normalizeStatus(value)]);
}

/**
 * Always returns a meta object. Unknown/legacy values get a synthetic entry
 * so they render as "<value> (legacy)" instead of vanishing or crashing.
 */
export function statusMeta(value) {
  const v = normalizeStatus(value);
  if (BY_VALUE[v]) return BY_VALUE[v];
  return {
    value: v,
    label: `${v} (legacy)`,
    color: "default",
    icon: "help",
    description: "Legacy value not in the current catalog",
    isLegacy: true,
  };
}

export function statusLabel(value) {
  return statusMeta(value).label;
}

// Spread straight onto a MUI <Chip>. React-free on purpose — icons are
// resolved by the one component module that renders them (StatusControls).
export function statusChipProps(value) {
  const meta = statusMeta(value);
  return {
    label: meta.label,
    color: meta.color,
    variant: meta.isLegacy ? "outlined" : "filled",
  };
}

// Pipeline order for sorting; legacy values sink to the bottom.
export function statusSortIndex(value) {
  const idx = STATUS_VALUES.indexOf(normalizeStatus(value));
  return idx === -1 ? 99 : idx;
}

export function pipelineStatuses() {
  return APPLICATION_STATUSES.filter((s) => !s.isTerminal);
}

export function terminalStatuses() {
  return APPLICATION_STATUSES.filter((s) => s.isTerminal);
}

// Reviewed favorably but not yet published to the roster.
export function rosterReady(app) {
  if (!app) return false;
  return (
    ROSTER_READY_STATUSES.includes(normalizeStatus(app.status)) &&
    !app.isSelected
  );
}

// On the roster although the review reached a terminal negative outcome.
export function rosterConflict(app) {
  if (!app) return false;
  return Boolean(app.isSelected) && Boolean(statusMeta(app.status).isTerminal);
}
