// Single source of truth for volunteer-application FIELDS in the admin
// workbench: which keys each type has, how they're labelled, which legacy
// aliases they read from / mirror to, how they render in the review card,
// what the search index covers, and how an edit becomes a PATCH.
//
// React-free so it unit-tests trivially. Consumers: VolunteerEditDialog,
// ApplicationReviewCard, VolunteerTable, VolunteerWorkbench.
//
// Decision fields (`status`, `isSelected`) are deliberately NOT fields here —
// they're owned by the decision bar / inline controls and travel on their own
// transports (see `buildPatch`).

import {
  normalizeStatus,
  rosterConflict,
  rosterReady,
} from "../../../lib/applicationStatus";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const VOLUNTEER_TYPES = ["mentor", "judge", "volunteer", "hacker", "sponsor"];

const PLURAL_OF = {
  mentor: "mentors",
  judge: "judges",
  volunteer: "volunteers",
  hacker: "hackers",
  sponsor: "sponsors",
};

const SINGULAR_ALIASES = {
  mentors: "mentor",
  judges: "judge",
  volunteers: "volunteer",
  hackers: "hacker",
  sponsors: "sponsor",
  participant: "hacker",
  participants: "hacker",
};

export function toSingularType(type) {
  if (!type) return null;
  const s = String(type).toLowerCase().trim();
  if (VOLUNTEER_TYPES.includes(s)) return s;
  return SINGULAR_ALIASES[s] || null;
}

export function toPluralType(type) {
  const s = toSingularType(type);
  return s ? PLURAL_OF[s] : null;
}

// Prefer what the doc says about itself; fall back to the tab's type.
export function typeOf(doc, fallbackType) {
  return toSingularType(doc?.volunteer_type) || toSingularType(fallbackType);
}

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

export const isBlank = (v) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0);

// Multiselects are stored as arrays by the forms but as comma-strings by the
// Google-Sheets importers. Read either shape.
export const toArray = (v) => {
  if (Array.isArray(v)) return v.filter((x) => x !== null && x !== undefined && x !== "");
  if (typeof v === "string" && v.trim()) {
    return v
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

// Write back in the shape the doc already had, so a Sheets-imported string
// stays a string and a form-submitted array stays an array.
const serializeLike = (arr, originalValue) =>
  typeof originalValue === "string" ? arr.join(", ") : arr;

const same = (a, b) => {
  if (isBlank(a) && isBlank(b)) return true;
  return JSON.stringify(a) === JSON.stringify(b);
};

const firstPresent = (doc, keys) => {
  for (const k of keys) {
    const v = doc?.[k];
    if (!isBlank(v)) return v;
  }
  return undefined;
};

const firstDefined = (doc, keys) => {
  for (const k of keys) {
    const v = doc?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
};

export function humanize(key) {
  if (!key) return "";
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

// The judge photo uploader stores the raw GCS URL; the CDN alias is what the
// public site serves. Moved here from the old edit dialog.
export const transformPhotoUrl = (url) =>
  typeof url === "string"
    ? url.replace("https://storage.googleapis.com/ohack-dev_cdn", "https://cdn.ohack.dev")
    : url;

// ---------------------------------------------------------------------------
// Field descriptor
// ---------------------------------------------------------------------------
// {
//   key,            canonical write key AND the formData key
//   label,
//   type,           text | email | url | textarea | select | multiselect |
//                   switch | yesno | artifacts | readonly
//   readFrom,       [aliases]  default [key]; first non-empty wins
//   writeTo,        [mirrors]  default [key]; every listed key gets the value
//   options,        select / multiselect suggestions (multiselect is freeSolo)
//   isLink,         render as an anchor wherever it appears
//   review,         "primary" | "secondary" | "additional" | null
//                   (null = never a raw card row; e.g. rendered by a panel)
//   search,         include in the workbench search index (default true for
//                   text-ish types)
//   normalize,      input sanitizer run on change
//   toForm(doc),    escape hatch when readFrom can't express the read
//   toPatch(v, doc) escape hatch when writeTo can't express the write
//   searchValues(doc) escape hatch for nested data (artifacts)
// }

const TEXTISH = new Set(["text", "email", "url", "textarea", "select", "multiselect", "yesno"]);

const f = (key, label, type = "text", extra = {}) => ({
  key,
  label,
  type,
  readFrom: extra.readFrom || [key],
  writeTo: extra.writeTo || [key],
  review: extra.review === undefined ? "additional" : extra.review,
  search: extra.search === undefined ? TEXTISH.has(type) : extra.search,
  ...extra,
});

// --- shared option lists (mirror the live application forms) ---------------

export const PARTICIPATION_OPTIONS = [
  "This is my first Opportunity Hack! 👆",
  "This will be my 2nd Opportunity Hack ✌️",
  "This will be my 3rd Opportunity Hack ☘️",
  "I've been to 4+ Opportunity Hacks 🔥",
];

export const JUDGE_BACKGROUND_OPTIONS = [
  "Software Development",
  "Product Management",
  "UX/UI Design",
  "Data Science & Analytics",
  "Cloud Architecture",
  "Nonprofit Experience",
  "Entrepreneurship",
  "Digital Marketing",
  "Project Management",
  "Business Strategy",
  "Cybersecurity",
  "Education Technology",
  "AI/Machine Learning",
  "Healthcare Technology",
  "Other",
];

export const MENTOR_EXPERTISE_OPTIONS = [
  "Software Engineering",
  "Product Management (vPM)",
  "UX/UI Design",
  "Data Science & Analytics",
  "Cloud Architecture",
  "DevOps",
  "Nonprofit Technology",
  "Entrepreneurship",
  "Digital Marketing",
  "Project Management",
  "Business Strategy",
  "Cybersecurity",
  "Database Management",
  "Other",
];

export const HACKER_PARTICIPANT_TYPES = [
  "Student",
  "Professional",
  "Educator",
  "Community Member",
  "Other",
];

export const HACKER_EXPERIENCE_LEVELS = [
  "First-time hacker",
  "Some hackathon experience (1-3 events)",
  "Experienced hacker (4+ events)",
];

export const HACKER_ROLE_OPTIONS = [
  "Software Development - Frontend",
  "Software Development - Backend",
  "Software Development - Mobile",
  "Software Development - Full Stack",
  "Design (UI/UX, Graphics)",
  "Data Science/Analytics",
  "Project Management",
  "Business Analysis",
  "Quality Assurance",
  "DevOps",
  "Other",
];

export const HACKER_TEAM_STATUS_OPTIONS = [
  "I have a complete team of 2-5 people",
  "I have a team and we'd like to add more people",
  "I don't have a team and I'd like to be matched with people to form a team",
  "I would like to work alone and I'm okay with not obtaining experience with working with others",
];

export const SOCIAL_CAUSE_OPTIONS = [
  "Education",
  "Healthcare",
  "Environment",
  "Economic Opportunity",
  "Community Development",
  "Accessibility/Inclusion",
  "Homelessness",
  "Food Security",
  "Mental Health",
  "Disaster Relief",
  "Animal Welfare",
  "Other",
];

export const SHIRT_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

export const AGE_RANGE_OPTIONS = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"];

export const EMPLOYEE_COUNT_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

// --- shared field blocks ---------------------------------------------------

// Forms store BOTH `isInPerson` (bool) and `inPerson` (string). The string
// convention differs per form: judge/hacker/volunteer use "Yes"/"No", the
// mentor form uses "Yes!"/"No, I'll be virtual". Read either; write both in
// the form's own convention so its `loadPreviousSubmission` keeps working.
const inPersonField = (yes, no) =>
  f("inPerson", "In person", "switch", {
    review: "secondary",
    readFrom: ["isInPerson", "inPerson"],
    writeTo: ["isInPerson", "inPerson"],
    toForm: (d) => {
      if (typeof d?.isInPerson === "boolean") return d.isInPerson;
      return /^yes/i.test(String(d?.inPerson ?? ""));
    },
    toPatch: (v) => ({ isInPerson: Boolean(v), inPerson: v ? yes : no }),
  });

const LINKEDIN = f("linkedinProfile", "LinkedIn", "url", {
  isLink: true,
  review: "secondary",
  readFrom: ["linkedinProfile", "linkedin", "linkedinUrl"],
  writeTo: ["linkedinProfile", "linkedin"],
});

const CODE_OF_CONDUCT = f("agreedToCodeOfConduct", "Agreed to code of conduct", "switch", {
  readFrom: ["agreedToCodeOfConduct", "codeOfConduct"],
  writeTo: ["agreedToCodeOfConduct", "codeOfConduct"],
  toForm: (d) => Boolean(d?.agreedToCodeOfConduct || d?.codeOfConduct),
});

const PHOTO_URL = f("photoUrl", "Photo URL", "url", {
  review: "additional",
  search: false,
  normalize: transformPhotoUrl,
});

const NAME = f("name", "Name", "text", { review: "primary" });
const EMAIL = f("email", "Email", "email", { review: "primary" });
const PRONOUNS = f("pronouns", "Pronouns", "text");
const SLACK_ID = f("slack_user_id", "Slack user ID", "text", { review: null, search: false });
const COUNTRY = f("country", "Country", "text", { review: "secondary" });
const STATE = f("state", "State", "text", { review: "secondary" });
const DIETARY = f("dietaryRestrictions", "Dietary restrictions", "text");
const ADDITIONAL_INFO = f("additionalInfo", "Additional information", "textarea");
const SHIRT = f("shirtSize", "T-shirt size", "select", { options: SHIRT_SIZE_OPTIONS });
const PARTICIPATION = f("participationCount", "OHack participation", "select", {
  review: "secondary",
  options: PARTICIPATION_OPTIONS,
});

const contactSection = (inPerson) => ({
  id: "contact",
  title: "Contact",
  fields: [NAME, EMAIL, PRONOUNS, PHOTO_URL, LINKEDIN, inPerson, SLACK_ID].filter(Boolean),
});

// Never editable, never raw card rows, never sent in a PATCH.
export const SYSTEM_KEYS = [
  "id",
  "user_id",
  "user_db_id",
  "propel_id",
  "event_id",
  "volunteer_type",
  "type", // UI routing key that leaked into docs via the old whole-object PATCH
  "timestamp",
  "created_by",
  "created_timestamp",
  "updated_by",
  "updated_timestamp",
  "checkedIn",
  "checkedInAt",
  "checkedInBy",
  "checkInTime",
  "checkInTimeList",
  "checkOutTime",
  "checkoutTimeList",
  "isCheckedIn",
  "timeSlot",
  "sent_emails",
  "certificates",
  "profile_image",
  "selected", // dead legacy approval flag — nothing reads it
  "recaptchaToken",
];

export const DECISION_KEYS = ["status", "isSelected"];

const SYSTEM_SECTION = {
  id: "system",
  title: "System",
  fields: SYSTEM_KEYS.map((k) =>
    f(k, humanize(k), "readonly", { review: null, search: false })
  ),
};

// ---------------------------------------------------------------------------
// Per-type schema
// ---------------------------------------------------------------------------

const JUDGE = {
  title: "Judge",
  sections: [
    contactSection(inPersonField("Yes", "No")),
    {
      id: "professional",
      title: "Professional",
      fields: [
        f("title", "Title", "text", { review: "primary" }),
        // Judge applications store `companyName`; VolunteerTable's companyOf() reads the same pair.
        f("companyName", "Company", "text", {
          review: "primary",
          readFrom: ["companyName", "company"],
        }),
        f("backgroundAreas", "Background areas", "multiselect", {
          review: "secondary",
          readFrom: ["backgroundAreas", "background"],
          writeTo: ["backgroundAreas", "background"],
          options: JUDGE_BACKGROUND_OPTIONS,
        }),
        f("otherBackground", "Other background", "text"),
        PARTICIPATION,
      ],
    },
    {
      id: "bio",
      title: "Bio & motivation",
      fields: [
        // ONE field. The judge form writes all three keys with the same value;
        // the public VolunteerList falls back through shortBio/shortBiography.
        f("biography", "Bio", "textarea", {
          readFrom: ["biography", "shortBio", "shortBiography"],
          writeTo: ["biography", "shortBio", "shortBiography"],
        }),
        f("whyJudge", "Why judge?", "textarea"),
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      fields: [
        f("availability", "Availability", "text"),
        f("canAttendJudging", "Can attend judging", "yesno", {
          review: "secondary",
          options: ["Yes", "No", "Partial"],
        }),
        COUNTRY,
        STATE,
        DIETARY,
        ADDITIONAL_INFO,
      ],
    },
    { id: "agreements", title: "Agreements", fields: [CODE_OF_CONDUCT] },
    {
      // Editable here, but review:null keeps them out of the card's raw rows —
      // JudgeTrainingPanel renders them (see CLAUDE.md).
      id: "training",
      title: "Training links",
      fields: [
        f("introductionVideoUrl", "Intro video", "url", { isLink: true, review: null, search: false }),
        f("judgeTrainingIntroCertUrl", "Training cert: judge intro", "url", { isLink: true, review: null, search: false }),
        f("judgeTrainingToolCertUrl", "Training cert: judging tool", "url", { isLink: true, review: null, search: false }),
        f("judgeTrainingCompleted", "Judge training completed", "switch", { review: null, search: false }),
      ],
    },
    SYSTEM_SECTION,
  ],
  hidden: [],
};

const MENTOR = {
  title: "Mentor",
  sections: [
    contactSection(inPersonField("Yes!", "No, I'll be virtual")),
    {
      id: "professional",
      title: "Professional",
      fields: [
        f("title", "Title", "text", { review: "primary" }),
        f("company", "Company", "text", { review: "primary", readFrom: ["company", "companyName"] }),
        f("expertise", "Expertise", "multiselect", {
          review: "secondary",
          options: MENTOR_EXPERTISE_OPTIONS,
        }),
        f("engineeringSpecifics", "Engineering specifics", "text", {
          review: "secondary",
          readFrom: ["engineeringSpecifics", "softwareEngineeringSpecifics"],
        }),
        PARTICIPATION,
        f("yearsExperience", "Years of experience", "text", { review: "secondary" }),
        f("aiToolsUsed", "AI tools used", "text", { review: "secondary" }),
        f("aiToolsExperience", "AI tools experience", "textarea", { review: "secondary" }),
      ],
    },
    {
      id: "bio",
      title: "Bio & mentoring",
      fields: [
        f("bio", "Bio", "textarea", { readFrom: ["bio", "shortBio"], writeTo: ["bio", "shortBio"] }),
        f("mentorshipAreas", "Mentorship areas", "text"),
        f("previousMentoring", "Previous mentoring", "textarea"),
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      fields: [f("availability", "Availability", "text"), COUNTRY, STATE, SHIRT, DIETARY, ADDITIONAL_INFO],
    },
    { id: "agreements", title: "Agreements", fields: [CODE_OF_CONDUCT] },
    SYSTEM_SECTION,
  ],
  hidden: [],
};

const VOLUNTEER = {
  title: "Volunteer",
  sections: [
    contactSection(inPersonField("Yes", "No")),
    {
      id: "role",
      title: "Role & skills",
      fields: [
        f("title", "Title", "text", { review: "primary" }),
        f("company", "Company", "text", { review: "primary", readFrom: ["company", "companyName"] }),
        f("experienceLevel", "Experience", "text", { review: "primary" }),
        f("volunteerType", "Volunteer roles", "multiselect", {
          review: "secondary",
          readFrom: ["volunteerType", "volunteerRole"],
        }),
        f("skills", "Skills", "multiselect", { review: "secondary" }),
        f("availability", "Availability", "text", { review: "secondary" }),
        f("availableDays", "Time slots", "multiselect", { review: "secondary" }),
        f("previousVolunteering", "Previous volunteering", "textarea", { review: "secondary" }),
      ],
    },
    {
      id: "bio",
      title: "Bio & motivation",
      fields: [
        f("bio", "Bio", "textarea", { readFrom: ["bio", "shortBio"], writeTo: ["bio", "shortBio"] }),
        f("motivation", "Motivation", "textarea", { review: "secondary" }),
        f("socialCauses", "Social causes", "multiselect", {
          review: "secondary",
          options: SOCIAL_CAUSE_OPTIONS,
        }),
        f("otherSocialCause", "Other social cause", "text"),
        f("portfolio", "Portfolio", "url", { isLink: true }),
      ],
    },
    { id: "logistics", title: "Logistics", fields: [COUNTRY, STATE, SHIRT, DIETARY, ADDITIONAL_INFO] },
    { id: "agreements", title: "Agreements", fields: [CODE_OF_CONDUCT] },
    {
      id: "contributions",
      title: "Contributions",
      fields: [
        f("artifacts", "Artifacts", "artifacts", {
          review: null,
          search: true,
          searchValues: (d) => (d?.artifacts || []).flatMap((a) => [a?.label, a?.comment]),
        }),
      ],
    },
    SYSTEM_SECTION,
  ],
  hidden: [],
};

const HACKER = {
  title: "Hacker",
  sections: [
    contactSection(inPersonField("Yes", "No")),
    {
      id: "profile",
      title: "Profile",
      fields: [
        f("participantType", "Participant type", "select", {
          review: "secondary",
          options: HACKER_PARTICIPANT_TYPES,
        }),
        f("schoolOrganization", "School / organization", "text", { review: "secondary" }),
        f("experienceLevel", "Experience", "select", {
          review: "primary",
          options: HACKER_EXPERIENCE_LEVELS,
        }),
        f("primaryRoles", "Primary roles", "multiselect", {
          review: "primary",
          options: HACKER_ROLE_OPTIONS,
        }),
        f("skills", "Skills", "multiselect", { review: "secondary" }),
        PARTICIPATION,
      ],
    },
    {
      id: "bio",
      title: "Bio & links",
      fields: [
        f("bio", "Bio", "textarea", { readFrom: ["bio", "shortBio"], writeTo: ["bio", "shortBio"] }),
        f("github", "GitHub", "url", { isLink: true }),
        f("portfolio", "Portfolio", "url", { isLink: true }),
        f("motivation", "Motivation", "textarea"),
      ],
    },
    {
      id: "team",
      title: "Team",
      fields: [
        f("teamStatus", "Team status", "select", {
          review: "secondary",
          options: HACKER_TEAM_STATUS_OPTIONS,
        }),
        f("teamCode", "Team code", "text", { review: "secondary" }),
        f("teamNeededSkills", "Skills the team needs", "text"),
        f("workshopInterests", "Workshop interests", "multiselect"),
      ],
    },
    {
      id: "interests",
      title: "Interests",
      fields: [
        f("socialCauses", "Social causes", "multiselect", { options: SOCIAL_CAUSE_OPTIONS }),
        f("otherSocialCause", "Other social cause", "text"),
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      fields: [
        COUNTRY,
        STATE,
        // Derived at submit time from country+state (see hacker form); not hand-edited.
        f("arizonaResident", "Arizona resident", "readonly", { review: "secondary", search: false }),
        f("county", "County", "text"),
        f("ageRange", "Age range", "select", { options: AGE_RANGE_OPTIONS, search: false }),
        SHIRT,
        DIETARY,
        f("referralSource", "How they heard about us", "text"),
        ADDITIONAL_INFO,
      ],
    },
    { id: "agreements", title: "Agreements", fields: [CODE_OF_CONDUCT] },
    SYSTEM_SECTION,
  ],
  // Deposit bookkeeping is owned by Stripe flows + the refund dialog.
  hidden: [
    "stripe_payment_intent_id",
    "deposit_amount_cents",
    "deposit_disposition",
    "deposit_status",
    "deposit_refund_id",
    "deposit_refund_amount_cents",
    "deposit_refunded_at",
    "deposit_refunded_by",
    "deposit_refund_status_msg",
  ],
};

const SPONSOR = {
  title: "Sponsor",
  sections: [
    {
      id: "contact",
      title: "Contact",
      fields: [
        f("name", "Contact name", "text", { review: "primary", readFrom: ["name", "contactName"] }),
        EMAIL,
        f("title", "Contact title", "text", { review: "primary" }),
        f("phoneNumber", "Phone", "text", { review: "secondary" }),
        f("preferredContact", "Preferred contact", "text", { review: "secondary" }),
        SLACK_ID,
      ],
    },
    {
      id: "company",
      title: "Company",
      fields: [
        f("companyName", "Company", "text", { review: "primary", readFrom: ["companyName", "company"] }),
        f("website", "Website", "url", { isLink: true, review: "secondary" }),
        f("industry", "Industry", "text"),
        f("employeeCount", "Employee count", "select", { options: EMPLOYEE_COUNT_OPTIONS }),
        f("logoUrl", "Logo URL", "url", { search: false }),
        f("useLogo", "Use logo", "text", { review: "secondary" }),
        f("bio", "Company description", "textarea"),
      ],
    },
    {
      id: "sponsorship",
      title: "Sponsorship",
      fields: [
        f("sponsorshipTypes", "Sponsorship types", "text", { review: "primary" }),
        f("sponsorshipTier", "Sponsorship tier", "text", { review: "secondary" }),
        f("sponsorshipLevel", "Sponsorship level", "text"),
        f("sponsorshipDetails", "Sponsorship details", "textarea", { review: "secondary" }),
        f("volunteerType", "Volunteer roles offered", "text", { review: "secondary" }),
        f("volunteerCount", "Volunteer count", "text", { review: "secondary" }),
        f("volunteerHours", "Volunteer hours", "text", { review: "secondary" }),
        f("howHeard", "How they heard about the event", "text"),
        f("otherInvolvement", "Other involvement", "textarea"),
        f("specialRequests", "Special requests", "textarea"),
        ADDITIONAL_INFO,
      ],
    },
    SYSTEM_SECTION,
  ],
  hidden: [],
};

const GENERIC = {
  title: "Application",
  sections: [contactSection(inPersonField("Yes", "No")), SYSTEM_SECTION],
  hidden: [],
};

export const FIELD_SCHEMA = {
  judge: JUDGE,
  mentor: MENTOR,
  volunteer: VOLUNTEER,
  hacker: HACKER,
  sponsor: SPONSOR,
};

// Labels for keys that show up under "All submitted fields" but aren't
// schema fields for that type (legacy or cross-type keys).
const EXTRA_LABELS = {
  linkedin: "LinkedIn",
  linkedinUrl: "LinkedIn",
  shortBio: "Bio",
  shortBiography: "Bio",
  background: "Background areas",
  codeOfConduct: "Agreed to code of conduct",
  softwareEngineeringSpecifics: "Engineering specifics",
  isInPerson: "In person",
  contactName: "Contact name",
  volunteerRole: "Volunteer role",
  judgingExperience: "Judging experience",
  criteriaPreferences: "Criteria preferences",
  status: "Application status",
  isSelected: "On event roster",
  teamMatchingPreferredSize: "Preferred team size",
  teamMatchingPreferredSkills: "Preferred teammate skills",
  teamMatchingPreferredCauses: "Preferred team causes",
  willContinue: "Will continue after the hackathon",
  socialImpactExperience: "Social impact experience",
  interestedInTaxCredit: "Interested in AZ tax credit",
  hasHelpedBefore: "Has helped before",
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getSchema(type) {
  return FIELD_SCHEMA[toSingularType(type)] || GENERIC;
}

export function getSections(type) {
  return getSchema(type).sections;
}

export function getEditableSections(type) {
  return getSections(type).filter((s) => s.id !== "system");
}

export function getSystemSection(type) {
  return getSections(type).find((s) => s.id === "system") || SYSTEM_SECTION;
}

export function getAllFields(type) {
  return getSections(type).flatMap((s) => s.fields);
}

export function getEditableFields(type) {
  return getEditableSections(type).flatMap((s) => s.fields);
}

export function getField(type, keyOrAlias) {
  if (!keyOrAlias) return null;
  return (
    getAllFields(type).find(
      (fld) => fld.key === keyOrAlias || fld.readFrom.includes(keyOrAlias) || fld.writeTo.includes(keyOrAlias)
    ) || null
  );
}

export function getFieldLabel(type, keyOrAlias) {
  const fld = getField(type, keyOrAlias);
  if (fld) return fld.label;
  return EXTRA_LABELS[keyOrAlias] || humanize(keyOrAlias);
}

// { primary: [field], secondary: [field], additional: [field] } in section order.
export function getReviewFields(type) {
  const out = { primary: [], secondary: [], additional: [] };
  for (const fld of getEditableFields(type)) {
    if (fld.review && out[fld.review]) out[fld.review].push(fld);
  }
  return out;
}

// Every key the card already accounts for — used to decide what belongs in
// "All submitted fields". Includes aliases, mirrors, system, hidden, decision.
export function getRenderedKeys(type) {
  const keys = new Set([...SYSTEM_KEYS, ...DECISION_KEYS, ...getSchema(type).hidden]);
  for (const fld of getAllFields(type)) {
    keys.add(fld.key);
    fld.readFrom.forEach((k) => keys.add(k));
    fld.writeTo.forEach((k) => keys.add(k));
  }
  return keys;
}

// Fields rendered as external links wherever they appear — ONE constant for
// every type (the review card used to carry three copies of this list).
export const LINK_FIELDS = Array.from(
  new Set(
    VOLUNTEER_TYPES.flatMap((t) =>
      getAllFields(t)
        .filter((fld) => fld.isLink)
        .flatMap((fld) => [fld.key, ...fld.readFrom, ...fld.writeTo])
    )
  )
);

export function linkedinUrlOf(doc) {
  const raw = doc?.linkedinProfile || doc?.linkedin || doc?.linkedinUrl || "";
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

// ---------------------------------------------------------------------------
// Read / search
// ---------------------------------------------------------------------------

export function readFieldValue(doc, field) {
  if (!field) return undefined;
  if (field.toForm) return field.toForm(doc);
  switch (field.type) {
    case "switch":
      return Boolean(firstDefined(doc, field.readFrom));
    case "multiselect":
      return toArray(firstPresent(doc, field.readFrom));
    case "artifacts": {
      const v = firstPresent(doc, field.readFrom);
      return Array.isArray(v) ? v.map((a) => ({ ...a, url: Array.isArray(a?.url) ? [...a.url] : a?.url })) : [];
    }
    default: {
      const v = firstPresent(doc, field.readFrom);
      return v === undefined ? "" : v;
    }
  }
}

// formData for the edit dialog: { [field.key]: value } for editable fields.
export function toFormData(doc, type) {
  const out = {};
  for (const fld of getEditableFields(type)) {
    if (fld.type === "readonly") continue;
    out[fld.key] = readFieldValue(doc, fld);
  }
  return out;
}

// Flat list of strings the workbench search box matches against.
export function getSearchValues(doc, type) {
  const values = [];
  for (const fld of getAllFields(type)) {
    if (fld.search === false) continue;
    if (fld.searchValues) {
      values.push(...fld.searchValues(doc));
      continue;
    }
    for (const k of fld.readFrom) {
      const v = doc?.[k];
      if (v === null || v === undefined) continue;
      if (Array.isArray(v)) values.push(v.join(" "));
      else values.push(String(v));
    }
  }
  return values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

const fieldPatch = (field, value, original) => {
  if (field.toPatch) return field.toPatch(value, original);
  if (field.type === "multiselect") {
    const arr = toArray(value);
    // Shape follows the doc: the key itself if present, else the first
    // populated alias (a Sheets import stores `background`, not `backgroundAreas`).
    const shapeSource = firstPresent(original, field.readFrom);
    return Object.fromEntries(
      field.writeTo.map((k) => [k, serializeLike(arr, original?.[k] ?? shapeSource)])
    );
  }
  if (field.type === "switch") {
    return Object.fromEntries(field.writeTo.map((k) => [k, Boolean(value)]));
  }
  return Object.fromEntries(field.writeTo.map((k) => [k, value]));
};

/**
 * Diff the dialog's formData against the original doc.
 *
 * Returns { patch, roster }:
 *   patch  — `{ id, ...changedKeys }` for the generic hackathon PATCH
 *            (Firestore top-level merge). Contains `status` only when the
 *            reviewer changed it. NEVER contains `isSelected`, `type`, or any
 *            system key.
 *   roster — true | false when the "on roster" switch was toggled, else null.
 *            Travels separately via the dedicated select route.
 *
 * `patch` with only `id` and `roster === null` means nothing changed.
 */
export function buildPatch(original, formData, type, decision = {}) {
  const patch = { id: original?.id };
  for (const fld of getEditableFields(type)) {
    if (fld.type === "readonly") continue;
    const before = readFieldValue(original, fld);
    const after = formData?.[fld.key];
    if (after === undefined) continue;
    if (same(before, after)) continue;
    Object.assign(patch, fieldPatch(fld, after, original || {}));
  }
  if (
    decision.status !== undefined &&
    decision.status !== null &&
    normalizeStatus(decision.status) !== normalizeStatus(original?.status)
  ) {
    patch.status = normalizeStatus(decision.status);
  }
  const roster =
    typeof decision.isSelected === "boolean" && decision.isSelected !== Boolean(original?.isSelected)
      ? decision.isSelected
      : null;
  return { patch, roster };
}

export function hasChanges({ patch, roster }) {
  return Object.keys(patch || {}).some((k) => k !== "id") || roster !== null;
}

// Add-mode payload. Roster is NOT set here — the caller flips it through the
// select route after the doc exists, so the same server-authoritative writer
// owns `isSelected` on create as on edit.
export function buildCreatePayload(formData, type, decision = {}) {
  const singular = toSingularType(type);
  const payload = {};
  for (const fld of getEditableFields(type)) {
    if (fld.type === "readonly") continue;
    const v = formData?.[fld.key];
    if (isBlank(v) && fld.type !== "switch") continue;
    Object.assign(payload, fieldPatch(fld, v, {}));
  }
  payload.volunteer_type = singular;
  payload.timestamp = new Date().toISOString();
  payload.status = normalizeStatus(decision.status);
  payload.isSelected = false;
  return payload;
}

// ---------------------------------------------------------------------------
// Filtering shared by table + review list
// ---------------------------------------------------------------------------

export const DECISION_PRESETS = {
  none: { label: "", test: () => true },
  ready: { label: "Ready for roster", test: rosterReady },
  conflict: { label: "Roster conflicts", test: rosterConflict },
};

export function filterByDecision(list, { statusFilter = "all", selectedFilter = "all", preset = "none" } = {}) {
  let out = Array.isArray(list) ? list : [];
  if (statusFilter && statusFilter !== "all") {
    out = out.filter((app) => normalizeStatus(app?.status) === statusFilter);
  }
  if (selectedFilter === "yes") out = out.filter((app) => Boolean(app?.isSelected));
  else if (selectedFilter === "no") out = out.filter((app) => !app?.isSelected);
  const p = DECISION_PRESETS[preset];
  if (p && preset !== "none") out = out.filter(p.test);
  return out;
}
