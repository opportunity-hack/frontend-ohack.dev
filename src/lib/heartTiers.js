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
