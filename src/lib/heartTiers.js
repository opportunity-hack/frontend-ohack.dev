/**
 * Heart tier system — single source of truth for the Opportunity Hack
 * recognition tiers used across the community champions page, profile
 * Heart Progress, and the /about/hearts rewards page.
 */

export const TIERS = [
  {
    name: "Bronze",
    color: "#CD7F32",
    minHearts: 2,
    rewards: [
      { hearts: 2, reward: "Certificate" },
      { hearts: 4, reward: "IG/FB Shoutout" },
    ],
  },
  {
    name: "Silver",
    color: "#C0C0C0",
    minHearts: 5,
    rewards: [
      { hearts: 5, reward: "LinkedIn Recommendation" },
      { hearts: 6, reward: "Interview prep & resume review" },
    ],
  },
  {
    name: "Gold",
    color: "#FFD700",
    minHearts: 10,
    rewards: [{ hearts: 10, reward: "Reference for job application" }],
  },
  {
    name: "Platinum",
    color: "#E5E4E2",
    minHearts: 24,
    rewards: [{ hearts: 24, reward: "Opportunity Hack swag" }],
  },
  {
    name: "Diamond",
    color: "#B9F2FF",
    minHearts: 48,
    rewards: [{ hearts: 48, reward: "Sponsor-provided tech award" }],
  },
];

export const TIER_ORDER = TIERS.map((t) => t.name);

/** Flat list of all rewards with tier metadata attached. */
export const ALL_REWARDS = TIERS.flatMap((tier) =>
  tier.rewards.map((r) => ({ ...r, tier: tier.name, color: tier.color }))
);

/**
 * Sum a user's hearts from their profile `history` map (what + how sections
 * only — matches the backend hearts summary). Shared by HeartGauge and the
 * public portfolio hero.
 */
export function countHeartsFromHistory(history) {
  let total = 0;
  for (const section of ["what", "how"]) {
    const values = history?.[section];
    if (!values || typeof values !== "object") continue;
    for (const value of Object.values(values)) {
      const amount = Number(value);
      if (!Number.isNaN(amount)) total += amount;
    }
  }
  return total;
}

/** Return the tier object a person belongs to given their heart count, or null. */
export function getTierForHearts(hearts) {
  let matched = null;
  for (const tier of TIERS) {
    if (hearts >= tier.minHearts) matched = tier;
  }
  return matched;
}

/** Return the next tier object a person is working toward, or null if at max. */
export function getNextTier(hearts) {
  for (const tier of TIERS) {
    if (hearts < tier.minHearts) return tier;
  }
  return null;
}

/**
 * Humanized labels for the per-category heart history keys
 * (`profile.history.what` / `profile.history.how`). Each entry is
 * `[key, label, description?]`. Shared by FeedbackSection (Volunteer History
 * ratings) and the Hearts & Rewards tab breakdown — keep them in lockstep
 * with the backend's history keys (common/utils/firebase.py).
 */
export const HEART_CATEGORIES = {
  what: [
    ["productionalized_projects", "Productionalized projects", "Projects that have been operationalized."],
    ["requirements_gathering", "Requirements gathering", "Worked with nonprofits to capture what they need."],
    ["documentation", "Documentation", "Wrote docs for developers and nonprofits."],
    ["design_architecture", "Design architecture", "Diagrams: sequence, deployment, ERD, etc."],
    ["code_quality", "Code quality"],
    ["unit_test_writing", "Unit test writing"],
    ["unit_test_coverage", "Unit test coverage"],
    ["observability", "Observability", "Added monitoring (USE, RED) to software."],
    ["judge", "Judging", "Judged other people's work."],
    ["mentor", "Mentoring", "Mentored other people."],
  ],
  how: [
    ["standups_completed", "Standups completed", "Provided updates and communicated to the team."],
    ["code_reliability", "Code reliability", "Code doesn't crash and stays available."],
    [
      "customer_driven_innovation_and_design_thinking",
      "Customer-driven innovation",
      "Conversations with customers to drive product decisions.",
    ],
    ["iterations_of_code_pushed_to_production", "Production iterations", "Iterated on the final product."],
  ],
};

/** Display a possibly-fractional heart count (0.5 increments) without float noise. */
export function formatHearts(hearts) {
  const n = Number(hearts) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
