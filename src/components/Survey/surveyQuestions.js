// Question catalog for the post-event / live-event feedback survey.
//
// One catalog drives both modes. Each question declares:
//   id      — stable answer key (kept identical across modes so live + post
//             responses merge cleanly; this is why first_timer / mentor_unreachable
//             use one id in both modes).
//   roles   — "all" (universal block) or an array of role values it belongs to.
//   mode    — "both" | "live" | "post" — when the question is asked.
//   type    — how to render + store it (see TYPES below).
//   showIf  — optional (answers, mode) => boolean for conditional questions.
//
// Storage shapes by type:
//   scale .................. number 1..5
//   single / yesno / yesnomaybe ... string (the chosen option)
//   multi .................. string[] (chosen options)
//   text ................... string
//   scale_text ............. { value: number|null, note: string }
//   yesno_text ............. { value: string|null, note: string }
//
// The role itself is captured by the component's role selector (stored top-level
// AND mirrored into answers.role), so it is intentionally not in this catalog.

export const ROLE_OPTIONS = [
  { value: "hacker", label: "Hacker" },
  { value: "mentor", label: "Mentor" },
  { value: "judge", label: "Judge" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "volunteer", label: "Volunteer" },
  { value: "sponsor", label: "Sponsor" },
  { value: "organizer", label: "Organizer" },
];

// Default 1–5 anchor labels; individual questions can override `scaleLabels`.
const RATING = { 1: "Poor", 5: "Excellent" };

export const SURVEY_QUESTIONS = [
  // ---------------------------------------------------------------- Universal
  {
    id: "overall_rating",
    roles: "all",
    mode: "both",
    type: "scale",
    required: true,
    labelByMode: {
      live: "How's it going?",
      post: "How was your experience?",
    },
    scaleLabels: { 1: "Rough", 5: "Great" },
  },
  {
    id: "going_well",
    roles: "all",
    mode: "both",
    type: "text",
    label: "One thing going well?",
  },
  {
    id: "to_improve",
    roles: "all",
    mode: "both",
    type: "text",
    label: "One thing we should fix?",
  },
  {
    id: "would_return",
    roles: "all",
    mode: "post",
    type: "scale",
    label: "How likely are you to come back / recommend OHack?",
    scaleLabels: { 1: "Not likely", 5: "Very likely" },
  },

  // ------------------------------------------------------------------ Hackers
  {
    id: "hacker_blocked",
    roles: ["hacker"],
    mode: "live",
    type: "single",
    label: "Are you blocked right now? By what?",
    options: [
      "Not blocked",
      "Waiting on nonprofit",
      "Unclear requirements",
      "Technical / setup",
      "Team issue",
      "Tooling — DevPost / GitHub / Slack",
    ],
  },
  {
    id: "hacker_ready_to_build",
    roles: ["hacker"],
    mode: "live",
    type: "multi",
    label: "Do you have what you need to start building?",
    helper: "Data, requirements, accounts / test credentials.",
    options: [
      "I have what I need",
      "Need data",
      "Need requirements",
      "Need accounts / test credentials",
    ],
  },
  {
    id: "hacker_problem_clarity",
    roles: ["hacker"],
    mode: "post",
    type: "scale_text",
    label: "Was the problem statement clear and appropriately scoped?",
    scaleLabels: RATING,
    textLabel: "Why? (optional)",
  },
  {
    id: "hacker_meaningful_coding",
    roles: ["hacker"],
    mode: "post",
    type: "yesno_text",
    label: "Did the project actually involve meaningful coding?",
    textLabel: "Tell us more (optional)",
  },
  {
    id: "hacker_onboarding",
    roles: ["hacker"],
    mode: "post",
    type: "scale_text",
    label: "How was onboarding (Slack / GitHub / DevPost / check-in)?",
    scaleLabels: RATING,
    // Only ask "what went wrong" when the score isn't positive (1–3).
    noteWhen: (v) => typeof v === "number" && v <= 3,
    textLabel: "What could be improved?",
  },
  {
    id: "first_timer",
    roles: ["hacker"],
    mode: "both",
    type: "yesno",
    label: "Is this your first hackathon?",
  },
  {
    id: "hacker_continue_npo",
    roles: ["hacker"],
    mode: "post",
    type: "yesnomaybe",
    label: "Would you keep helping this nonprofit after the event?",
  },
  {
    id: "ai_tools_used",
    roles: ["hacker"],
    mode: "both",
    type: "multi",
    label: "Which AI tools are you using on your project?",
    options: [
      "ChatGPT",
      "Claude",
      "GitHub Copilot",
      "Cursor",
      "Gemini",
      "v0 / Bolt-style builders",
      "Other",
      "None",
    ],
  },
  {
    id: "ai_centrality",
    roles: ["hacker"],
    mode: "post",
    type: "single",
    label: "How central were AI tools to what you built?",
    options: [
      "Not at all",
      "Minor help",
      "Significant",
      "Built most of it with AI",
    ],
  },
  {
    id: "ai_freetext",
    roles: ["hacker"],
    mode: "post",
    type: "text",
    optional: true,
    label: "Where did AI help most, and where did it get in the way?",
  },
  {
    id: "mentor_meaningful_help",
    roles: ["hacker"],
    mode: "post",
    type: "single",
    label: "Did you get meaningful help from a mentor?",
    options: ["Yes", "Somewhat", "No", "Didn't interact with a mentor"],
  },
  {
    id: "mentor_named",
    roles: ["hacker"],
    mode: "post",
    type: "text",
    label: "Which mentor(s)?",
    showIf: (a) => ["Yes", "Somewhat"].includes(a.mentor_meaningful_help),
  },
  {
    id: "mentor_unreachable",
    roles: ["hacker"],
    mode: "both",
    type: "yesno",
    label: "Were you unable to reach a mentor when you needed one?",
    // In live mode there's no mentor_meaningful_help yet, so ask directly.
    // In post mode, only surface it for the "No / didn't interact" branch.
    showIf: (a, mode) =>
      mode === "live" ||
      ["No", "Didn't interact with a mentor"].includes(a.mentor_meaningful_help),
  },
  {
    id: "learning_areas",
    roles: ["hacker"],
    mode: "post",
    type: "multi",
    label: "What did you learn or get better at?",
    options: [
      "New language / framework",
      "Working with real-world messy data",
      "Collaborating on a team",
      "Building for a real user / nonprofit",
      "Project scoping under time pressure",
      "Using AI tools effectively",
      "Presenting / demoing",
      "Other",
    ],
  },
  {
    id: "learning_proud",
    roles: ["hacker"],
    mode: "post",
    type: "text",
    optional: true,
    label: "Anything specific you're proud of learning or building?",
  },

  // ------------------------------------------------------------------ Mentors
  {
    id: "mentor_role_clarity",
    roles: ["mentor"],
    mode: "both",
    type: "scale",
    label: "Were your responsibilities and time commitments clear?",
    scaleLabels: RATING,
  },
  {
    id: "mentor_found_teams",
    roles: ["mentor"],
    mode: "both",
    type: "yesno_text",
    label: "Could you find and reach all your assigned teams?",
    textLabel: "Which channels? (optional)",
  },
  {
    id: "mentor_expertise_match",
    roles: ["mentor"],
    mode: "post",
    type: "scale",
    label: "Was your expertise matched well to your team(s)' needs?",
    scaleLabels: RATING,
  },
  {
    id: "mentor_team_concern",
    roles: ["mentor"],
    mode: "live",
    type: "text",
    label: "Any team you're worried about right now?",
  },
  {
    id: "mentor_return",
    roles: ["mentor"],
    mode: "post",
    type: "yesno",
    label: "Would you mentor again?",
  },

  // ------------------------------------------------------------------- Judges
  {
    id: "judge_prepared",
    roles: ["judge"],
    mode: "both",
    type: "scale",
    label:
      "Did you have everything you needed before judging started? (criteria, requirements doc, room / AV)",
    scaleLabels: RATING,
  },
  {
    id: "judge_tool_calibration",
    roles: ["judge"],
    mode: "post",
    type: "scale",
    label: "Was the scoring tool adequate for comparing / calibrating across teams?",
    scaleLabels: RATING,
  },
  {
    id: "judge_criteria_clarity",
    roles: ["judge"],
    mode: "post",
    type: "scale",
    label: "Were the judging criteria clear?",
    scaleLabels: RATING,
  },
  {
    id: "judge_time_per_team",
    roles: ["judge"],
    mode: "post",
    type: "single",
    label: "Was there enough time per team for demo + Q&A?",
    options: ["Too little", "About right", "Too much"],
  },
  {
    id: "judge_logistics",
    roles: ["judge"],
    mode: "both",
    type: "text",
    label: "Any room / AV / access issues?",
  },
  {
    id: "judge_return",
    roles: ["judge"],
    mode: "post",
    type: "yesno",
    label: "Would you judge again?",
  },

  // --------------------------------------------------------------- Nonprofits
  {
    id: "npo_expectations_clear",
    roles: ["nonprofit"],
    mode: "both",
    type: "scale",
    label: "Was it clear what you needed to provide, and when?",
    scaleLabels: RATING,
  },
  {
    id: "npo_data_ready",
    roles: ["nonprofit"],
    mode: "both",
    type: "yesno_text",
    label: "Was your problem statement / data ready before the event?",
    textLabel: "What was missing? (optional)",
  },
  {
    id: "npo_responsiveness",
    roles: ["nonprofit"],
    mode: "post",
    type: "scale",
    label: "How responsive were you able to be during the event?",
    scaleLabels: RATING,
  },
  {
    id: "npo_solution_usable",
    roles: ["nonprofit"],
    mode: "post",
    type: "single",
    label: "Is the solution usable for you now / soon?",
    options: ["Yes, now", "With more work", "No"],
  },
  {
    id: "npo_continue",
    roles: ["nonprofit"],
    mode: "post",
    type: "yesno",
    label: "Will you keep working with the team or OHack after the event?",
  },
  {
    id: "npo_team_waiting",
    roles: ["nonprofit"],
    mode: "live",
    type: "yesno",
    label: "Is a team waiting on something from you right now?",
  },

  // --------------------------------------------------------------- Volunteers
  {
    id: "vol_role_clarity",
    roles: ["volunteer"],
    mode: "both",
    type: "scale",
    label: "Was your role and shift clear?",
    scaleLabels: RATING,
  },
  {
    id: "vol_equipped",
    roles: ["volunteer"],
    mode: "both",
    type: "scale_text",
    label: "Did you have what you needed to do your job?",
    scaleLabels: RATING,
    textLabel: "Anything missing? (optional)",
  },
  {
    id: "vol_live_issue",
    roles: ["volunteer"],
    mode: "live",
    type: "text",
    label: "Anything breaking right now we should know about?",
  },
  {
    id: "vol_return",
    roles: ["volunteer"],
    mode: "post",
    type: "yesno",
    label: "Would you volunteer again?",
  },
];

/**
 * The questions that apply to a given role + mode (before conditional showIf).
 * Universal questions come first, then the role-specific block.
 */
export function getSurveyQuestions(role, mode) {
  return SURVEY_QUESTIONS.filter((q) => {
    const roleMatch = q.roles === "all" || q.roles.includes(role);
    const modeMatch = q.mode === "both" || q.mode === mode;
    return roleMatch && modeMatch;
  });
}

/** Resolve the visible label for a question in the current mode. */
export function questionLabel(q, mode) {
  if (q.labelByMode) return q.labelByMode[mode] || q.labelByMode.post || q.label;
  return q.label;
}
