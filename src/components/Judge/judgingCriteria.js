/**
 * The judging rubric as pure data + pure helpers. Shared by the judge
 * dashboard's inline "Adjust scores" editor and the full scoring page so the
 * two can never disagree about keys, maxima or the feedback rule.
 *
 * The rubric itself (4 categories × 2 criteria, 1–5 each, 40 max; one
 * special-category prize scored separately) is unchanged — see /about/judges
 * and /hackathon-judging-criteria.
 */

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;
export const MAX_TOTAL = 40;
export const FEEDBACK_MIN_CHARS = 20;

export const SCORE_DESCRIPTIONS = {
  1: "Poor - Significantly below expectations",
  2: "Fair - Below expectations",
  3: "Good - Meets expectations",
  4: "Very Good - Exceeds expectations",
  5: "Excellent - Significantly exceeds expectations",
};

export const SCORE_SHORT_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export const JUDGING_CRITERIA = [
  {
    category: "scope",
    name: "Scope of Solution",
    maxPoints: 10,
    subCriteria: [
      {
        key: "scopeImpact",
        name: "Impact on Community",
        description:
          "How many people and nonprofits are impacted by this solution?",
        examples: [
          "How many other nonprofits could potentially use this solution?",
          "Does this address a widespread problem affecting multiple organizations?",
          "With some small changes, could this solution be scaled to help other nonprofits with similar challenges?",
        ],
      },
      {
        key: "scopeComplexity",
        name: "Complexity of Problem Solved",
        description:
          "How hard was this to do versus what is already out there?",
        examples: [
          "Is this solving a problem that hasn't been addressed by existing solutions?",
          "How technically challenging is the implementation compared to alternatives?",
          "Does this require innovative approaches or novel integration of technologies?",
        ],
      },
    ],
    tip: "Consider both breadth and depth of impact. Evaluate community impact and problem complexity.",
  },
  {
    category: "documentation",
    name: "Documentation",
    maxPoints: 10,
    subCriteria: [
      {
        key: "documentationCode",
        name: "Code and UX Documentation",
        description: "Clear how to use the solution",
        examples: [
          "Is there a clear DevPost project and Github README with setup and usage instructions?",
          "Are the user interfaces intuitive and self-explanatory?",
          "Is the code well-commented and structured for maintainability?",
        ],
      },
      {
        key: "documentationEase",
        name: "Ease of Understanding",
        description: "Straightforward design",
        examples: [
          "Can a new user understand how to use the solution without extensive training?",
          "Is the user experience logical and follows common design patterns?",
          "Are error messages helpful and actionable?",
        ],
      },
    ],
    tip: "Assess documentation quality and clarity. Consider project sustainability.",
  },
  {
    category: "polish",
    name: "Polish",
    maxPoints: 10,
    subCriteria: [
      {
        key: "polishWorkRemaining",
        name: "Work Remaining",
        description: "Minimal work remaining for MVP",
        examples: [
          "How much additional development is needed before the nonprofit could use this?",
          "Are the core features complete and functional?",
          "What percentage of the planned functionality has been implemented?",
        ],
      },
      {
        key: "polishCanUseToday",
        name: "Can Use Today",
        description: "Deployed in the cloud, able to be shipped now",
        examples: [
          "Is the solution hosted and accessible via a public URL (and not localhost)?",
          "Can the nonprofit start using this immediately without additional setup?",
          "Are all major bugs resolved and the solution stable for production use?",
        ],
      },
    ],
    tip: "Evaluate overall refinement and readiness for real-world use.",
  },
  {
    category: "security",
    name: "Security",
    maxPoints: 10,
    subCriteria: [
      {
        key: "securityData",
        name: "Data Protection",
        description: "Hard to gain access to data because of security controls",
        examples: [
          "Is sensitive data properly encrypted in transit and at rest (e.g. using HTTPS)?",
          "Are there appropriate authentication mechanisms in place?",
          "Is input validation implemented to prevent security vulnerabilities?",
        ],
      },
      {
        key: "securityRole",
        name: "Role-based Security",
        description: "Admin versus public access (where applicable)",
        examples: [
          "Are there different permission levels for different types of users?",
          "Can administrators control who has access to what data?",
          "Is there proper authorization checking for sensitive operations?",
        ],
      },
    ],
    tip: "Assess data protection and role-based security implementation.",
  },
];

// Special-category prizes: scored in Round 1 only, never part of the total.
export const SPECIAL_CATEGORIES = [
  {
    category: "accessibility",
    name: "Accessibility",
    maxPoints: 5,
    description:
      "Accessibility is important when building software. Consider the four W3C usability principles: perceivable, operable, understandable, robust.",
    reference: "https://www.w3.org/WAI/fundamentals/accessibility-principles/",
    subCriteria: [
      {
        key: "accessibility",
        name: "Accessibility Implementation",
        description:
          "How well does the solution implement accessibility principles?",
        examples: [
          "Is the content perceivable? (Can users see/hear content regardless of disabilities?)",
          "Is it operable? (Can users navigate with keyboard, screen readers, etc.?)",
          "Is it understandable? (Is the UI intuitive and error messages clear?)",
          "Is it robust? (Does it work across different browsers and assistive technologies?)",
          "What is the Lighthouse Accessibility score? (95+ is excellent)",
        ],
      },
    ],
    tip: "Special category prizes recognize excellence in specific areas beyond main judging criteria.",
  },
];

export const CORE_KEYS = JUDGING_CRITERIA.flatMap((c) =>
  c.subCriteria.map((s) => s.key),
);
export const SPECIAL_KEYS = SPECIAL_CATEGORIES.flatMap((c) =>
  c.subCriteria.map((s) => s.key),
);

const CRITERION_BY_KEY = Object.fromEntries(
  [...JUDGING_CRITERIA, ...SPECIAL_CATEGORIES].flatMap((c) =>
    c.subCriteria.map((s) => [
      s.key,
      { ...s, category: c.category, categoryName: c.name },
    ]),
  ),
);

export const criterionForKey = (key) => CRITERION_BY_KEY[key] || null;
export const labelForKey = (key) => CRITERION_BY_KEY[key]?.name || key;

/** Special categories are scored in Round 1 only. */
export const specialCategoriesForRound = (round) =>
  round === "round1" ? SPECIAL_CATEGORIES : [];

export const scoreKeysForRound = (round) => [
  ...CORE_KEYS,
  ...(round === "round1" ? SPECIAL_KEYS : []),
];

const clampScore = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n)) return null;
  if (n < SCORE_MIN || n > SCORE_MAX) return null;
  return n;
};

/** The historical default: every criterion starts at 3 ("Good"). */
export const defaultScores = (round) =>
  Object.fromEntries(scoreKeysForRound(round).map((k) => [k, 3]));

/**
 * Picks only the rubric keys for `round` out of an API score object (which
 * also carries `total` and may carry keys from the other round), coercing
 * each to an integer 1–5 or null.
 */
export const normalizeScores = (apiScores, round) => {
  const out = {};
  scoreKeysForRound(round).forEach((k) => {
    out[k] = clampScore(apiScores?.[k]);
  });
  return out;
};

/** Sum of the 8 core criteria. Ignores `total` and special categories. */
export const calculateTotal = (scores) =>
  CORE_KEYS.reduce((sum, k) => sum + (clampScore(scores?.[k]) || 0), 0);

export const categoryTotal = (criterion, scores) =>
  criterion.subCriteria.reduce(
    (sum, s) => sum + (clampScore(scores?.[s.key]) || 0),
    0,
  );

export const hasAllCoreScores = (scores) =>
  CORE_KEYS.every((k) => clampScore(scores?.[k]) !== null);

/** Feedback is stored as `{ general: string }`; older rows may be a string. */
export const feedbackText = (feedback) => {
  if (!feedback) return "";
  if (typeof feedback === "string") return feedback;
  if (typeof feedback === "object") return String(feedback.general || "");
  return "";
};

/** Counts meaningful characters (markdown/bullet/whitespace stripped). */
export const feedbackCharCount = (text) =>
  String(text || "")
    .replace(/[#*`\-\n\r\s]/g, "")
    .trim().length;

export const isFeedbackValid = (text) =>
  feedbackCharCount(text) >= FEEDBACK_MIN_CHARS;

export const feedbackCharsRemaining = (text) =>
  Math.max(0, FEEDBACK_MIN_CHARS - feedbackCharCount(text));

/**
 * Which criteria changed between two score objects, in rubric order.
 * Returns [{ key, name, from, to }].
 */
export const scoreDiff = (before, after, round) =>
  scoreKeysForRound(round)
    .filter((k) => clampScore(before?.[k]) !== clampScore(after?.[k]))
    .map((k) => ({
      key: k,
      name: labelForKey(k),
      from: clampScore(before?.[k]),
      to: clampScore(after?.[k]),
    }));

/** Human label for a round id. */
export const roundLabel = (round) =>
  round === "round2" ? "Round 2" : "Round 1";
