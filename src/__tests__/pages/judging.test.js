/**
 * /hack/[event_id]/judging — the public judging schedule. Lives outside
 * src/pages on purpose (Next builds every file under pages/ as a route).
 *
 * Covers each schedule state (SSR-seeded and client-fetched), the panel
 * render (room, nonprofit line, judges, readiness, inactive note,
 * unassigned teams), search, the single video dialog and the print button.
 */
import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement", ADMIN: "admin" },
}));
jest.mock("../../components/VideoDisplay/VideoDisplay", () => ({
  __esModule: true,
  default: ({ url }) => <div data-testid="video-player">{url}</div>,
}));
jest.mock("../../lib/judgeApi", () => ({
  __esModule: true,
  default: { getPublicSchedule: jest.fn() },
}));
jest.mock("../../lib/teamDashboardApi", () => ({
  getGithubActivity: jest.fn(),
}));

import judgeApi from "../../lib/judgeApi";
import { getGithubActivity } from "../../lib/teamDashboardApi";
import { trackEvent } from "../../lib/ga";
import { __resetJudgingScheduleCache } from "../../hooks/use-judging-schedule";
import JudgingPage, { getStaticProps } from "../../pages/hack/[event_id]/judging";

const eventData = {
  id: "h1",
  event_id: "fall-2026",
  title: "Fall 2026",
  timezone: "America/Phoenix",
  nonprofits: [{ id: "npo1", name: "Food Bank" }],
  teams: [
    {
      id: "t1",
      name: "Alpha",
      slack_channel: "team-1",
      status: "ACTIVE",
      github_links: [{ link: "https://github.com/2026-fall/alpha" }],
      demo_video_url: "https://youtu.be/dQw4w9WgXcQ",
      project_tagline: "Helps food banks",
      project_submission_status: "submitted",
      selected_nonprofit_id: "npo1",
    },
    {
      id: "t2",
      name: "Beta",
      slack_channel: "team-2",
      status: "ACTIVE",
      github_links: [],
      demo_video_url: null,
      selected_nonprofit_id: "npo1",
    },
    { id: "t3", name: "Gone", status: "INACTIVE" },
    { id: "t9", name: "Unpanelled", status: "ACTIVE" },
  ],
};

const published = {
  event_id: "fall-2026",
  published: true,
  locks: { round1: { locked: true }, round2: { locked: false } },
  rounds: {
    round1: [
      {
        panel_id: "pA",
        panel_name: "Panel A",
        room: "Room 101",
        judges: [
          { id: "j1", name: "Ada Lovelace", title: "CTO", company: "Engines", photoUrl: "", linkedinProfile: "" },
          { id: "j2", name: "Bob Builder", title: "", company: "", photoUrl: "", linkedinProfile: "" },
        ],
        teams: [
          { id: "t1", name: "Alpha", slack_channel: "team-1", demo_time: null, room: "Room 101" },
          { id: "t2", name: "Beta", slack_channel: "team-2", demo_time: null, room: "Room 101" },
          { id: "t3", name: "Gone", slack_channel: "team-3", demo_time: null, room: "Room 101" },
        ],
      },
    ],
    round2: [
      {
        panel_id: "pR2",
        panel_name: "Round 2 - Final Judging",
        room: "Main hall",
        judges: [{ id: "j1", name: "Ada Lovelace" }],
        teams: [{ id: "t1", name: "Alpha", slack_channel: "team-1", demo_time: "2025-01-01T22:20:00.000Z", room: "Main hall" }],
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  __resetJudgingScheduleCache();
  getGithubActivity.mockResolvedValue({
    commits: { total_recent: 12, last_commit_at: new Date(Date.now() - 2 * 3600e3).toISOString() },
  });
});

describe("states", () => {
  it("renders the not-published card from SSR without fetching", () => {
    render(<JudgingPage eventData={eventData} schedule={{ ...published, published: false, rounds: { round1: [], round2: [] } }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Judging schedule");
    expect(screen.getByText("The judging schedule hasn't been published yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Opportunity Hack Fall 2026/ })).toHaveAttribute("href", "/hack/fall-2026");
    expect(judgeApi.getPublicSchedule).not.toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "judging_schedule_view", params: expect.objectContaining({ state: "unpublished" }) }),
    );
  });

  it("shows the unavailable card when the backend has no schedule route (404 → null)", async () => {
    judgeApi.getPublicSchedule.mockResolvedValue(null);
    render(<JudgingPage eventData={eventData} schedule={null} />);
    expect(screen.getByText(/Loading the judging schedule/)).toBeInTheDocument();
    expect(await screen.findByText("The judging schedule isn't available right now.")).toBeInTheDocument();
  });

  it("shows the empty card when published with no panels", () => {
    render(<JudgingPage eventData={eventData} schedule={{ ...published, rounds: { round1: [], round2: [] } }} />);
    expect(screen.getByText("Panels are still being set up.")).toBeInTheDocument();
  });

  it("fetches client-side when SSR had no copy", async () => {
    judgeApi.getPublicSchedule.mockResolvedValue(published);
    render(<JudgingPage eventData={eventData} schedule={null} />);
    expect(await screen.findByRole("heading", { name: "Panel A" })).toBeInTheDocument();
    expect(judgeApi.getPublicSchedule).toHaveBeenCalledWith("fall-2026");
  });
});

describe("published schedule", () => {
  it("renders panels with room, nonprofit line, judges and readiness", async () => {
    render(<JudgingPage eventData={eventData} schedule={published} />);
    const panel = screen.getByRole("region", { name: "Panel A" });
    expect(within(panel).getByText("Room 101")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Food Bank" })).toHaveAttribute("href", "/nonprofit/npo1");
    expect(within(panel).getByText("Ada Lovelace")).toBeInTheDocument();
    expect(within(panel).getByText("CTO · Engines")).toBeInTheDocument();
    expect(within(panel).getByText(/Also on Round 2 - Final Judging/)).toBeInTheDocument();
    // inactive team hidden with a note
    expect(within(panel).queryByText("Gone")).not.toBeInTheDocument();
    expect(within(panel).getByText(/1 team left the hackathon and isn't listed/)).toBeInTheDocument();
    // Beta has no repo/video/write-up
    expect(within(panel).getByText("No repo")).toBeInTheDocument();
    expect(within(panel).getByText("No video")).toBeInTheDocument();
    // GitHub activity → commits + Ready tag
    expect(await within(panel).findByText(/12 commits · 2h ago/)).toBeInTheDocument();
    expect(within(panel).getByText("Ready")).toBeInTheDocument();
    expect(within(panel).getByText(/2 teams · 1 ready/)).toBeInTheDocument();
    expect(within(panel).getAllByText("Submitted")).toHaveLength(2); // header + Alpha
    expect(within(panel).getByRole("link", { name: /Alpha/ })).toHaveAttribute("href", "/hack/fall-2026/team/t1");
    // lock tag, round 2 demo time, organizer heads-up
    expect(screen.getByText("Round 1 scoring closed")).toBeInTheDocument();
    const r2 = screen.getByRole("region", { name: "Round 2 - Final Judging" });
    expect(within(r2).getByText("3:20 PM")).toBeInTheDocument();
    expect(screen.getByText(/1 active team isn't on a Round 1 panel yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unpanelled" })).toBeInTheDocument();
    // totals line
    expect(screen.getByText(/2 panels · 2 teams · 2 judges\./)).toBeInTheDocument();
    // TOC
    const toc = screen.getByRole("navigation", { name: "Panels on this page" });
    expect(within(toc).getByRole("link", { name: /Panel A/ })).toHaveAttribute("href", "#round1-pA");
  });

  it("search filters teams and hides panels without a match", async () => {
    jest.useFakeTimers();
    render(<JudgingPage eventData={eventData} schedule={published} />);
    fireEvent.change(screen.getByLabelText("Find your team"), { target: { value: "bet" } });
    expect(screen.getByText(/1 team match/)).toBeInTheDocument();
    const panel = screen.getByRole("region", { name: "Panel A" });
    expect(within(panel).queryByRole("link", { name: /Alpha/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Round 2 - Final Judging" })).not.toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000));
    const searchCalls = trackEvent.mock.calls.filter(([e]) => e.action === "judging_schedule_search");
    expect(searchCalls).toHaveLength(1);
    expect(JSON.stringify(searchCalls[0])).not.toContain("bet");
    jest.useRealTimers();
  });

  it("opens ONE video dialog and tracks the play", async () => {
    render(<JudgingPage eventData={eventData} schedule={published} />);
    const panel = screen.getByRole("region", { name: "Panel A" });
    fireEvent.click(within(panel).getByRole("button", { name: "Watch Alpha demo" }));
    expect(await screen.findByTestId("video-player")).toHaveTextContent("dQw4w9WgXcQ");
    expect(screen.getByRole("heading", { name: "Alpha demo" })).toBeInTheDocument();
    // Team context stays visible next to the video.
    expect(screen.getByText(/^Panel A · Room 101/)).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith(expect.objectContaining({ action: "judging_schedule_video_play" }));
  });

  it("Present maximizes the video, F toggles it, Esc leaves Present before closing", async () => {
    window.sessionStorage.clear();
    render(<JudgingPage eventData={eventData} schedule={published} />);
    const panel = screen.getByRole("region", { name: "Panel A" });
    fireEvent.click(within(panel).getByRole("button", { name: "Watch Alpha demo" }));
    await screen.findByTestId("video-player");

    fireEvent.click(screen.getByRole("button", { name: "Present" }));
    expect(screen.getByRole("button", { name: "Exit presentation" })).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector(".MuiDialog-paperFullScreen")).not.toBeNull();
    expect(trackEvent).toHaveBeenCalledWith(expect.objectContaining({ action: "judging_schedule_video_present" }));
    expect(window.sessionStorage.getItem("ohack.judgingVideo.present")).toBe("1");

    // First Esc exits Present; the video stays open.
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("button", { name: "Present" })).toBeInTheDocument();
    expect(screen.getByTestId("video-player")).toBeInTheDocument();

    // "F" toggles it back on.
    fireEvent.keyDown(window, { key: "f" });
    expect(screen.getByRole("button", { name: "Exit presentation" })).toBeInTheDocument();
  });

  it("print button calls window.print and fires GA", () => {
    const print = jest.spyOn(window, "print").mockImplementation(() => {});
    render(<JudgingPage eventData={eventData} schedule={published} />);
    fireEvent.click(screen.getByRole("button", { name: "Print" }));
    expect(print).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith(expect.objectContaining({ action: "judging_schedule_print" }));
    print.mockRestore();
  });
});

describe("getStaticProps", () => {
  const realFetch = global.fetch;
  const realTimeout = AbortSignal.timeout;
  beforeAll(() => {
    // jsdom lacks AbortSignal.timeout (Node has it — getStaticProps runs there).
    AbortSignal.timeout = AbortSignal.timeout || (() => undefined);
  });
  afterAll(() => {
    AbortSignal.timeout = realTimeout;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });
  const res = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

  it("projects the event and tolerates a missing schedule route", async () => {
    global.fetch = jest.fn(async (url) =>
      url.includes("/api/judge/schedule/")
        ? res(404, { error: "not found" })
        : res(200, { ...eventData, constraints: { judging_schedule_published: true }, teams: [{ ...eventData.teams[0], project_story: "x".repeat(50) }] }),
    );
    const out = await getStaticProps({ params: { event_id: "fall-2026" } });
    expect(out.revalidate).toBe(30);
    expect(out.props.schedule).toBe(null);
    expect(out.props.eventData.teams[0]).not.toHaveProperty("project_story");
    expect(out.props.eventData.judging_schedule_published).toBe(true);
  });

  it("404s for an unknown event and keeps a schedule fetch failure non-fatal", async () => {
    global.fetch = jest.fn(async () => res(404, {}));
    expect(await getStaticProps({ params: { event_id: "nope" } })).toEqual(
      expect.objectContaining({ notFound: true }),
    );
    global.fetch = jest.fn(async (url) => {
      if (url.includes("/api/judge/schedule/")) throw new Error("timeout");
      return res(200, eventData);
    });
    const out = await getStaticProps({ params: { event_id: "fall-2026" } });
    expect(out.props.schedule).toBe(null);
  });
});
