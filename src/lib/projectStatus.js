// Canonical project (problem statement) status catalog — the single source of
// truth for status values, labels, and explanations across the site
// (ProjectProgress, ProblemStatement, ProjectList/ProjectCard, onboarding,
// admin). The backend stores status as a free-form string, so this list is
// what keeps every surface consistent.

// The build journey, in ladder order. `paused` is intentionally NOT a rung —
// it's a parked state a project can enter from any stage, not a stage itself.
export const PROJECT_LADDER = [
  {
    value: "concept",
    label: "Concept",
    blurb: "An idea no one has built yet — needs a team",
    description:
      "An idea waiting for its first team. Nobody has written code yet, which makes this the easiest place to jump in and shape the whole project.",
  },
  {
    value: "hackathon",
    label: "Hackathon",
    blurb: "Worked on at one or more hackathons",
    description:
      "Teams have worked on this at one or more Opportunity Hack events, so prototype code exists in GitHub — a starting point, not a finished product.",
  },
  {
    value: "post-hackathon",
    label: "Post-hackathon",
    blurb: "Development continuing after the event",
    description:
      "Development continued after the event — often by a winning team or a university capstone group — but nothing is live for the nonprofit yet.",
  },
  {
    value: "production",
    label: "Production",
    blurb: "Live and being used by the nonprofit",
    description:
      "Deployed and in real use by the nonprofit. This is the goal of every Opportunity Hack project.",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    blurb: "Live, receiving patches and enhancements",
    description:
      "Live and being cared for: security patches, bug fixes, and small enhancements. Contributors are still welcome here.",
  },
];

// Off-ramp state: work is intentionally on hold. Distinct from the ladder so
// nothing implies "one step past maintenance".
export const PAUSED_STATUS = {
  value: "paused",
  label: "Paused",
  blurb: "Work is intentionally on hold",
  description:
    "Work on this project is intentionally on hold — the nonprofit's need changed or something outside the team's control has to happen first. Check the project's Slack channel before starting new work.",
};

export const ALL_PROJECT_STATUSES = [...PROJECT_LADDER, PAUSED_STATUS];

// value -> display label, for quick tag rendering
export const PROJECT_STATUS_LABELS = Object.fromEntries(
  ALL_PROJECT_STATUSES.map((s) => [s.value, s.label])
);

export function getProjectStatusMeta(status) {
  return ALL_PROJECT_STATUSES.find((s) => s.value === status) || null;
}

// Index of a status on the ladder; -1 for paused/unknown
export function ladderIndex(status) {
  return PROJECT_LADDER.findIndex((s) => s.value === status);
}

export function isPausedStatus(status) {
  return status === PAUSED_STATUS.value;
}

// Live for the nonprofit (production or maintenance)
export function isLiveStatus(status) {
  return status === "production" || status === "maintenance";
}

// Should the "Want to help?" affordance be offered to NEW volunteers?
// Production projects don't need new volunteers; paused projects have no
// active need. Maintenance projects still welcome help.
export function acceptsNewHelpers(status) {
  return status !== "production" && !isPausedStatus(status);
}
