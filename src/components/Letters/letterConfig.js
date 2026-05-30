// Pure config + logic for the volunteer letter generator.
// No JSX here — consumed by LetterChecklist, LetterPreview, and the letters page.

export const ORG = {
  name: "Opportunity Hack, Inc.",
  shortName: "Opportunity Hack",
  taxStatus: "501(c)(3) nonprofit",
  ein: "81-2917815",
  website: "ohack.dev",
  slack: "slack.ohack.dev",
  heartsUrl: "ohack.dev/about/hearts",
  trackUrl: "ohack.dev/volunteer/track",
  // Org mailing address is editable on the form; blank by default.
  address: "",
};

export const LETTER_TYPES = {
  GENERAL: "general",
  OPT: "opt",
  MENTOR: "mentor",
  JUDGE: "judge",
};

export const LETTER_LABELS = {
  [LETTER_TYPES.GENERAL]: "General Volunteer",
  [LETTER_TYPES.OPT]: "Software Engineering Volunteer (OPT)",
  [LETTER_TYPES.MENTOR]: "Mentor",
  [LETTER_TYPES.JUDGE]: "Judge",
};

export const STEM_BLOCK_MESSAGE =
  "Volunteering cannot satisfy the STEM OPT extension employment requirement, so we can't issue an OPT-employment letter for this role. We're glad to provide a General Volunteer recognition letter instead. Please confirm your options with your DSO.";

export const UNSURE_ADVISORY_MESSAGE =
  "Please confirm your OPT type with your DSO before requesting this letter. You can proceed with the General Volunteer letter in the meantime; we can't offer the OPT letter until you confirm you're on initial post-completion OPT.";

// Q4 acknowledgments — ALL must be true before the OPT letter is offered.
export const OPT_ACKNOWLEDGMENTS = [
  {
    key: "degree",
    label:
      "The work is directly related to my degree field (software / computer science).",
  },
  {
    key: "hours20",
    label:
      "If I need this to stop my OPT unemployment clock, I will average at least 20 hours per week.",
  },
  {
    key: "logHours",
    label:
      "I will log my hours at ohack.dev/volunteer/track, and my supervisor can confirm them.",
  },
  {
    key: "noAdvice",
    label:
      "I understand Opportunity Hack does not provide immigration advice or certify my status, and I will confirm with my DSO.",
  },
];

export const ROLE_OPTIONS = [
  {
    value: "software",
    label:
      "Built / contributed to a software project, or did software engineering work",
  },
  { value: "mentor", label: "Mentored teams" },
  { value: "judge", label: "Judged submissions" },
];

export const IMMIGRATION_OPTIONS = [
  {
    value: "no",
    label: "No — I just want confirmation of my volunteer contribution",
  },
  {
    value: "yes",
    label:
      "Yes — I'm on F-1 post-completion OPT and need to report this as OPT employment",
  },
];

export const OPT_TYPE_OPTIONS = [
  { value: "initial", label: "Initial post-completion OPT (12-month)" },
  { value: "stem", label: "STEM OPT extension (24-month)" },
  { value: "unsure", label: "Not sure" },
];

const allAck = (ack) =>
  OPT_ACKNOWLEDGMENTS.every((a) => Boolean(ack && ack[a.key]));

/**
 * Resolves the decision checklist to a letter type (or a block / pending state).
 * @returns {{
 *   letterType: string|null,
 *   block?: boolean,
 *   blockMessage?: string,
 *   advisory?: string,
 *   needsAck?: boolean,   // OPT path chosen but Q4 not all checked yet
 * }}
 */
export function runChecklist(answers) {
  const { role, needsImmigration, optType, ack } = answers || {};

  if (role === "mentor") return { letterType: LETTER_TYPES.MENTOR };
  if (role === "judge") return { letterType: LETTER_TYPES.JUDGE };
  if (role !== "software") return { letterType: null };

  // Q2
  if (needsImmigration === "no") return { letterType: LETTER_TYPES.GENERAL };
  if (needsImmigration !== "yes") return { letterType: null };

  // Q3
  if (optType === "stem") {
    return {
      letterType: LETTER_TYPES.GENERAL,
      block: true,
      blockMessage: STEM_BLOCK_MESSAGE,
    };
  }
  if (optType === "unsure") {
    return {
      letterType: LETTER_TYPES.GENERAL,
      advisory: UNSURE_ADVISORY_MESSAGE,
    };
  }
  if (optType === "initial") {
    if (allAck(ack)) return { letterType: LETTER_TYPES.OPT };
    return { letterType: null, needsAck: true };
  }
  return { letterType: null };
}

// Event fields shown (pre-filled from metadata, editable) on every letter.
export const EVENT_FIELDS = [
  { key: "eventName", label: "Event name" },
  { key: "eventDates", label: "Event dates" },
  { key: "eventLocation", label: "Location / venue" },
  { key: "eventHost", label: "Host / partners" },
  { key: "eventTheme", label: "Theme" },
];

// Recipient fields the volunteer types (name/email may be profile-prefilled).
export const RECIPIENT_FIELDS = [
  { key: "recipientName", label: "Your full name" },
  { key: "recipientAddress", label: "Street address, City, State ZIP", multiline: true },
  { key: "letterDate", label: "Letter date", type: "date" },
];

// Role-specific typed fields, keyed by letter type.
export const ROLE_FIELDS = {
  [LETTER_TYPES.GENERAL]: [],
  [LETTER_TYPES.OPT]: [
    { key: "orgAddress", label: "Organization mailing address" },
    { key: "startDate", label: "Start date", type: "date" },
    { key: "endDate", label: 'End date (or "ongoing")' },
    { key: "hoursPerWeek", label: "Hours per week", default: "at least 20" },
    { key: "workLocation", label: "Work location", default: "Remote" },
    { key: "supervisorName", label: "Supervisor name" },
    { key: "supervisorTitle", label: "Supervisor title" },
    { key: "supervisorEmail", label: "Supervisor email" },
    { key: "supervisorPhone", label: "Supervisor phone" },
  ],
  [LETTER_TYPES.MENTOR]: [
    { key: "hoursContributed", label: "Hours contributed (event total)" },
    { key: "roleNote", label: "Brief role note (optional)", multiline: true },
  ],
  [LETTER_TYPES.JUDGE]: [
    { key: "hoursContributed", label: "Hours contributed (event total)" },
    { key: "roleNote", label: "Brief role note (optional)", multiline: true },
  ],
};

// Signer block — filled by OHack at review/sign time, not by the volunteer.
export const SIGNER_FIELDS = [
  { key: "signerName", label: "Signer name" },
  { key: "signerTitle", label: "Signer title" },
  { key: "signerEmail", label: "Signer email" },
  { key: "signerPhone", label: "Signer phone" },
];

// Compact, dependency-free base64 round-trip for the shareable URL (?d=).
export function encodeLetterState(payload) {
  try {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return "";
  }
}

export function decodeLetterState(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
