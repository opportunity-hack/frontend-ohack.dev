import {
  deadlineState,
  deriveDeliverables,
  endOfEventDay,
  summarizeGithubActivity,
} from "../teamDeliverables";

// Fixed reference "now" so tests are deterministic regardless of the host
// machine's clock/timezone.
const NOW = Date.parse("2026-10-11T12:00:00-07:00"); // Sat 12:00 PM Phoenix (no DST)

describe("endOfEventDay", () => {
  it("returns 23:59:59 local time in the given timezone as UTC", () => {
    const d = endOfEventDay("2026-10-12", "America/Phoenix");
    // Phoenix is fixed UTC-7 (no DST) — 23:59:59 local == 06:59:59Z next day.
    expect(d.toISOString()).toBe("2026-10-13T06:59:59.000Z");
  });

  it("returns null for a missing date", () => {
    expect(endOfEventDay(null, "America/Phoenix")).toBeNull();
    expect(endOfEventDay(undefined, "America/Phoenix")).toBeNull();
  });

  it("falls back to the default timezone when none is given", () => {
    const d = endOfEventDay("2026-10-12", null);
    expect(d.toISOString()).toBe("2026-10-13T06:59:59.000Z");
  });
});

describe("deadlineState", () => {
  it("reports 'open' with the submission deadline as target, before it passes", () => {
    const state = deadlineState({
      deadlines: { submission: "2026-10-11T18:00:00-07:00" },
      now: NOW,
    });
    expect(state.kind).toBe("open");
    expect(state.target.toISOString()).toBe("2026-10-12T01:00:00.000Z");
    expect(state.urgent).toBe(false);
  });

  it("marks 'open' as urgent under 6 hours from the deadline", () => {
    const state = deadlineState({
      deadlines: { submission: "2026-10-11T17:00:00-07:00" }, // 5h from NOW
      now: NOW,
    });
    expect(state.kind).toBe("open");
    expect(state.urgent).toBe(true);
  });

  it("is not urgent exactly at the 6-hour boundary", () => {
    const state = deadlineState({
      deadlines: { submission: "2026-10-11T18:00:00-07:00" }, // exactly 6h from NOW
      now: NOW,
    });
    expect(state.urgent).toBe(false);
  });

  it("reports 'late_open' between the submission deadline and the late window", () => {
    const state = deadlineState({
      deadlines: {
        submission: "2026-10-11T06:00:00-07:00", // already past
        late_submission_until: "2026-10-11T18:00:00-07:00", // still open
      },
      now: NOW,
    });
    expect(state.kind).toBe("late_open");
    expect(state.target.toISOString()).toBe("2026-10-12T01:00:00.000Z");
  });

  it("reports 'closed' once both the deadline and any late window have passed", () => {
    const state = deadlineState({
      deadlines: {
        submission: "2026-10-11T06:00:00-07:00",
        late_submission_until: "2026-10-11T08:00:00-07:00",
      },
      now: NOW,
    });
    expect(state.kind).toBe("closed");
  });

  it("reports 'closed' when the deadline passed with no late window at all", () => {
    const state = deadlineState({
      deadlines: { submission: "2026-10-11T06:00:00-07:00" },
      now: NOW,
    });
    expect(state.kind).toBe("closed");
  });

  it("falls back to the event's end-of-day when there's no deadlines.submission", () => {
    const state = deadlineState({
      deadlines: {},
      endDate: "2026-10-12",
      timezone: "America/Phoenix",
      now: NOW,
    });
    expect(state.kind).toBe("event_ends");
    expect(state.target.toISOString()).toBe("2026-10-13T06:59:59.000Z");
  });

  it("reports 'closed' once the event's own end-of-day fallback has passed", () => {
    const state = deadlineState({
      deadlines: {},
      endDate: "2026-10-10",
      timezone: "America/Phoenix",
      now: NOW,
    });
    expect(state.kind).toBe("closed");
  });

  it("reports 'none' with no deadlines and no end date", () => {
    const state = deadlineState({ deadlines: {}, now: NOW });
    expect(state).toEqual({
      kind: "none",
      target: null,
      label: "",
      urgent: false,
    });
  });

  it("reports 'submitted' regardless of the deadline, once the team has submitted", () => {
    const state = deadlineState({
      deadlines: { submission: "2026-10-11T06:00:00-07:00" }, // already closed
      submissionStatus: "late",
      submittedAt: "2026-10-11T07:00:00-07:00",
      now: NOW,
    });
    expect(state.kind).toBe("submitted");
    expect(state.target.toISOString()).toBe("2026-10-11T14:00:00.000Z");
  });
});

describe("summarizeGithubActivity", () => {
  it("sums total_recent commits across every repo", () => {
    const summary = summarizeGithubActivity({
      "org/a": { commits: { total_recent: 3 } },
      "org/b": { commits: { total_recent: 5 } },
    });
    expect(summary).toEqual({ commits: { total_recent: 8 } });
  });

  it("handles an empty/missing map", () => {
    expect(summarizeGithubActivity(null)).toEqual({
      commits: { total_recent: 0 },
    });
    expect(summarizeGithubActivity({})).toEqual({
      commits: { total_recent: 0 },
    });
  });
});

describe("deriveDeliverables", () => {
  const baseTeam = { id: "t1", hackathon_event_id: "e1", status: "IN_REVIEW" };

  it("marks everything todo/locked for a brand-new team with no repo yet", () => {
    const result = deriveDeliverables({
      team: baseTeam,
      activity: null,
      slackConfirmed: false,
    });
    const byKey = Object.fromEntries(result.items.map((i) => [i.key, i]));
    expect(byKey.slack.state).toBe("todo");
    expect(byKey.code.state).toBe("locked");
    expect(byKey.code.hint).toBe("Repository not yet created");
    expect(byKey.story.state).toBe("todo");
    expect(byKey.video.state).toBe("todo");
    expect(byKey.submit.state).toBe("locked");
    expect(byKey.devpost.state).toBe("optional");
    expect(result.canSubmit).toBe(false);
    expect(result.submitBlockedReason).toBe(
      "Add your story and demo video first",
    );
    expect(result.total).toBe(5); // excludes the optional devpost row
    expect(result.done).toBe(0);
  });

  it("marks code done once commits exist, handling the legacy string github_links shape", () => {
    const team = { ...baseTeam, github_links: ["https://github.com/org/repo"] };
    const result = deriveDeliverables({
      team,
      activity: { commits: { total_recent: 2 } },
      slackConfirmed: true,
    });
    const byKey = Object.fromEntries(result.items.map((i) => [i.key, i]));
    expect(byKey.code.state).toBe("done");
    expect(byKey.slack.state).toBe("done");
  });

  it("leaves code as todo (not locked) when a repo exists but has no commits yet", () => {
    const team = {
      ...baseTeam,
      github_links: [{ link: "https://github.com/org/repo" }],
    };
    const result = deriveDeliverables({
      team,
      activity: { commits: { total_recent: 0 } },
    });
    const byKey = Object.fromEntries(result.items.map((i) => [i.key, i]));
    expect(byKey.code.state).toBe("todo");
    expect(byKey.code.hint).toBe("No commits yet");
  });

  it("allows submitting once story and video are both present", () => {
    const team = {
      ...baseTeam,
      project_tagline: "A tagline",
      project_story: "## What we built\nStuff.",
      demo_video_url: "https://youtu.be/abc12345678",
    };
    const result = deriveDeliverables({ team });
    const byKey = Object.fromEntries(result.items.map((i) => [i.key, i]));
    expect(byKey.story.state).toBe("done");
    expect(byKey.video.state).toBe("done");
    expect(byKey.submit.state).toBe("todo");
    expect(result.canSubmit).toBe(true);
    expect(result.submitBlockedReason).toBeNull();
  });

  it("marks submit done once the team has submitted, independent of story/video", () => {
    const team = { ...baseTeam, project_submitted_at: "2026-10-11T00:00:00Z" };
    const result = deriveDeliverables({ team });
    const byKey = Object.fromEntries(result.items.map((i) => [i.key, i]));
    expect(byKey.submit.state).toBe("done");
    expect(result.canSubmit).toBe(false); // already submitted
    expect(result.submitBlockedReason).toBeNull();
  });

  it("marks devpost done when a link is present", () => {
    const team = {
      ...baseTeam,
      devpost_link: "https://devpost.com/software/x",
    };
    const result = deriveDeliverables({ team });
    const byKey = Object.fromEntries(result.items.map((i) => [i.key, i]));
    expect(byKey.devpost.state).toBe("done");
  });

  it("adds the Definition of Done row only for winning/completion-eligible statuses", () => {
    const notWinning = deriveDeliverables({
      team: { ...baseTeam, status: "ONBOARDED" },
    });
    expect(notWinning.items.some((i) => i.key === "completion")).toBe(false);

    const winning = deriveDeliverables({
      team: { ...baseTeam, status: "FOUNDING_ENGINEERS" },
    });
    const completionItem = winning.items.find((i) => i.key === "completion");
    expect(completionItem).toBeTruthy();
    expect(completionItem.href).toBe("/hack/e1/team/t1/completion");
    // The completion row is a separate finish line — not counted in total/done.
    expect(winning.total).toBe(notWinning.total);

    const deployed = deriveDeliverables({
      team: { ...baseTeam, status: "DEPLOYED" },
    });
    expect(deployed.items.some((i) => i.key === "completion")).toBe(true);
  });

  it("marks the Definition of Done row done when completion_status is complete", () => {
    const team = {
      ...baseTeam,
      status: "FOUNDING_ENGINEERS",
      completion_status: "complete",
    };
    const result = deriveDeliverables({ team });
    const completionItem = result.items.find((i) => i.key === "completion");
    expect(completionItem.state).toBe("done");
  });
});
