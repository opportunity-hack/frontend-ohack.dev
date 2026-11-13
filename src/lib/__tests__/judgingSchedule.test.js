import {
  codeState,
  findTeamAssignments,
  formatCommitCount,
  formatDemoTime,
  isTeamActive,
  judgePanelCounts,
  mergeSchedule,
  projectEventForSchedule,
  scheduleState,
  scheduleTotals,
  teamMatchesQuery,
  teamReadiness,
  unassignedActiveTeams,
} from "../judgingSchedule";

const REPO = "https://github.com/2026-fall/team-1";

const team = (over = {}) => ({
  id: "t1",
  name: "Alpha",
  status: "ACTIVE",
  slack_channel: "team-1",
  github_links: [{ link: REPO, name: "team-1" }],
  demo_video_url: "https://youtu.be/dQw4w9WgXcQ",
  project_tagline: "Helps food banks",
  selected_nonprofit_id: "npo1",
  ...over,
});

const schedule = (over = {}) => ({
  event_id: "fall-2026",
  published: true,
  locks: {},
  rounds: {
    round1: [
      {
        panel_id: "pA",
        panel_name: "Panel A",
        room: "Room 101",
        judges: [
          { id: "j1", name: "Ada" },
          { id: "j2", name: "Bob" },
        ],
        teams: [
          { id: "t1", name: "Alpha", slack_channel: "team-1", demo_time: null, room: "Room 101" },
          { id: "t2", name: "Beta", slack_channel: "team-2", demo_time: null, room: "Room 101" },
          { id: "t3", name: "Gone", slack_channel: "team-3", demo_time: null, room: "Room 101" },
        ],
      },
      {
        panel_id: "pB",
        panel_name: "Panel B",
        room: "Room 202",
        judges: [{ id: "j1", name: "Ada" }],
        teams: [{ id: "t4", name: "Delta", slack_channel: "team-4", demo_time: null, room: "Room 202" }],
      },
    ],
    round2: [
      {
        panel_id: "pR2",
        panel_name: "Round 2 - Final Judging",
        room: "Main hall",
        judges: [{ id: "j3", name: "Cy" }],
        teams: [{ id: "t1", name: "Alpha", slack_channel: "team-1", demo_time: "2025-01-01T22:20:00.000Z", room: "Main hall" }],
      },
    ],
  },
  ...over,
});

const eventData = {
  nonprofits: [
    { id: "npo1", name: "Food Bank" },
    { id: "npo2", name: "Shelter" },
  ],
  teams: [
    team(),
    team({ id: "t2", name: "Beta", selected_nonprofit_id: "npo2", github_links: [], demo_video_url: "" }),
    team({ id: "t3", name: "Gone", status: "INACTIVE" }),
    team({ id: "t4", name: "Delta", active: "False" }),
    team({ id: "t5", name: "Echo" }),
    team({ id: "t6", name: "Foxtrot", status: "IN_REVIEW" }),
    team({ id: "t7", name: "aardvark" }),
  ],
};

describe("isTeamActive", () => {
  it("hides only INACTIVE / explicit active=false", () => {
    expect(isTeamActive(team())).toBe(true);
    expect(isTeamActive(team({ active: undefined }))).toBe(true);
    expect(isTeamActive(team({ active: "True" }))).toBe(true);
    expect(isTeamActive(team({ status: "IN_REVIEW" }))).toBe(true);
    expect(isTeamActive(team({ status: "INACTIVE" }))).toBe(false);
    expect(isTeamActive(team({ active: false }))).toBe(false);
    expect(isTeamActive(team({ active: "False" }))).toBe(false);
    expect(isTeamActive(null)).toBe(false);
  });
});

describe("codeState / teamReadiness", () => {
  it("covers every code state", () => {
    expect(codeState(team({ github_links: [] }), undefined).state).toBe("no_repo");
    expect(codeState(team({ github_links: ["https://gitlab.com/x/y"] })).state).toBe("no_repo");
    expect(codeState(team(), undefined).state).toBe("pending");
    expect(codeState(team(), { unavailable: true }).state).toBe("unavailable");
    expect(codeState(team(), { commits: 0 }).state).toBe("none");
    const active = codeState(team(), { commits: 12, lastCommitAt: "2026-10-10T10:00:00Z" });
    expect(active).toEqual({
      state: "active",
      commits: 12,
      lastCommitAt: "2026-10-10T10:00:00Z",
      repoUrl: REPO,
    });
  });

  it("ready = commits + video + write-up", () => {
    expect(teamReadiness(team(), { commits: 3 }).ready).toBe(true);
    expect(teamReadiness(team(), { commits: 0 }).ready).toBe(false);
    expect(teamReadiness(team(), undefined).ready).toBe(false); // still checking
    expect(teamReadiness(team(), { unavailable: true }).ready).toBe(true); // can't tell — not held against them
    expect(teamReadiness(team({ demo_video_url: "" }), { commits: 3 }).ready).toBe(false);
    expect(teamReadiness(team({ project_tagline: "" }), { commits: 3 }).ready).toBe(false);
    expect(teamReadiness(team({ github_links: [] }), undefined).ready).toBe(false);
  });

  it("reports the submission status (null for legacy teams)", () => {
    expect(teamReadiness(team(), {}).submission).toBe(null);
    expect(teamReadiness(team({ project_submission_status: "late" }), {}).submission).toBe("late");
  });
});

describe("mergeSchedule", () => {
  it("enriches teams, hides inactive ones and builds the nonprofit line", () => {
    const merged = mergeSchedule(schedule(), eventData, { t1: { commits: 5 } });
    const [panelA, panelB] = merged.round1;
    expect(panelA.teams.map((t) => t.id)).toEqual(["t1", "t2"]);
    expect(panelA.inactiveCount).toBe(1);
    expect(panelA.panelNonprofits).toEqual([
      { id: "npo1", name: "Food Bank" },
      { id: "npo2", name: "Shelter" },
    ]);
    expect(panelA.teams[0].nonprofitName).toBe("Food Bank");
    expect(panelA.teams[0].room).toBe("Room 101");
    expect(panelA.teams[0].readiness.ready).toBe(true);
    expect(panelA.teams[1].readiness.code.state).toBe("no_repo");
    expect(panelA.readyCount).toBe(1);
    // active === "False" counts as left
    expect(panelB.teams).toEqual([]);
    expect(panelB.inactiveCount).toBe(1);
  });

  it("treats a team missing from the event payload as inactive", () => {
    const merged = mergeSchedule(schedule(), { teams: [], nonprofits: [] });
    expect(merged.round1[0].teams).toEqual([]);
    expect(merged.round1[0].inactiveCount).toBe(3);
  });

  it("is safe on an empty / unpublished schedule", () => {
    expect(mergeSchedule(null, eventData)).toEqual({ round1: [], round2: [] });
  });
});

describe("unassignedActiveTeams", () => {
  it("lists active, non-IN_REVIEW teams with no Round 1 panel, by name", () => {
    expect(unassignedActiveTeams(schedule(), eventData).map((t) => t.id)).toEqual(["t7", "t5"]);
  });

  it("also skips a team caught mid-approval (APPROVING)", () => {
    const data = {
      ...eventData,
      teams: [...eventData.teams, team({ id: "t8", name: "Golf", status: "APPROVING" })],
    };
    expect(unassignedActiveTeams(schedule(), data).map((t) => t.id)).toEqual(["t7", "t5"]);
  });
});

describe("findTeamAssignments", () => {
  it("returns every panel the team is on, Round 1 first", () => {
    const a = findTeamAssignments(schedule(), "t1");
    expect(a.map((x) => [x.round, x.panel_name, x.room])).toEqual([
      ["round1", "Panel A", "Room 101"],
      ["round2", "Round 2 - Final Judging", "Main hall"],
    ]);
    expect(a[0].judges.map((j) => j.name)).toEqual(["Ada", "Bob"]);
    expect(a[1].demo_time).toBe("2025-01-01T22:20:00.000Z");
  });

  it("is empty for unknown teams and unpublished schedules", () => {
    expect(findTeamAssignments(schedule(), "nope")).toEqual([]);
    expect(findTeamAssignments(schedule({ published: false }), "t1")).toEqual([]);
    expect(findTeamAssignments(null, "t1")).toEqual([]);
  });
});

describe("judgePanelCounts", () => {
  it("counts panels per judge across rounds", () => {
    expect(judgePanelCounts(schedule())).toEqual({ j1: 2, j2: 1, j3: 1 });
  });
});

describe("formatters", () => {
  it("formats demo times as a time only, in the event timezone", () => {
    expect(formatDemoTime("2025-01-01T22:20:00.000Z", "America/Phoenix")).toBe("3:20 PM");
    expect(formatDemoTime(null, "America/Phoenix")).toBe(null);
    expect(formatDemoTime("garbage", "America/Phoenix")).toBe(null);
  });

  it("formats commit counts", () => {
    expect(formatCommitCount(1)).toBe("1 commit");
    expect(formatCommitCount(12)).toBe("12 commits");
    expect(formatCommitCount(100)).toBe("100+ commits");
  });
});

describe("scheduleState", () => {
  it("maps every state", () => {
    expect(scheduleState(null)).toBe("unavailable");
    expect(scheduleState(schedule({ published: false }))).toBe("unpublished");
    expect(scheduleState(schedule({ rounds: { round1: [], round2: [] } }))).toBe("empty");
    expect(scheduleState(schedule())).toBe("ready");
  });
});

describe("search + totals + projection", () => {
  it("matches name, channel and nonprofit, case-insensitively", () => {
    const t = { name: "Alpha", slack_channel: "team-1", nonprofitName: "Food Bank" };
    expect(teamMatchesQuery(t, "")).toBe(true);
    expect(teamMatchesQuery(t, "ALP")).toBe(true);
    expect(teamMatchesQuery(t, "team-1")).toBe(true);
    expect(teamMatchesQuery(t, "food")).toBe(true);
    expect(teamMatchesQuery(t, "zzz")).toBe(false);
  });

  it("totals distinct teams and judges", () => {
    expect(scheduleTotals(mergeSchedule(schedule(), eventData))).toEqual({
      panels: 3,
      teams: 2,
      judges: 3,
    });
  });

  it("projects the event payload to serializable props", () => {
    const out = projectEventForSchedule({
      id: "h1",
      event_id: "fall-2026",
      title: "Fall",
      constraints: { judging_schedule_published: true, secret: 1 },
      nonprofits: [{ id: "n1", name: "NP", description: "long" }, {}],
      teams: [{ id: "t1", name: "A", project_story: "huge", users: [{}] }],
    });
    expect(out.judging_schedule_published).toBe(true);
    expect(out.nonprofits).toEqual([{ id: "n1", name: "NP" }]);
    expect(out.teams[0]).not.toHaveProperty("project_story");
    expect(out.teams[0]).not.toHaveProperty("users");
    expect(out.teams[0].demo_video_url).toBe(null);
    expect(out.timezone).toBe(null);
    expect(out).not.toHaveProperty("constraints");
  });
});
