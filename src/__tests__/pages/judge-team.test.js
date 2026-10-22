/**
 * /judge/[event_id]/team/[team_id] — the full scoring page. Lives outside
 * src/pages on purpose (Next builds every file under pages/ as a route).
 *
 * Pins the draft-autosave contract the review asked for: never on load,
 * once (debounced) after a real change, never for an already-submitted
 * score, never when the round is locked; plus the read-only locked state.
 */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));
jest.mock("next/dynamic", () => () => () => null);
const routerEvents = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
jest.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    query: { event_id: "fall-2026", team_id: "team-1", round: "round1" },
    asPath: "/judge/fall-2026/team/team-1?round=round1",
    replace: jest.fn(),
    push: jest.fn(),
    events: routerEvents,
  }),
}));
jest.mock("@propelauth/react", () => ({
  withRequiredAuthInfo: (Component) => Component,
  useAuthInfo: () => ({
    accessToken: "tok",
    user: { userId: "judge-1", firstName: "Ada" },
  }),
}));
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
}));
jest.mock("../../lib/judgeApi", () => {
  const api = {
    getTeamDetails: jest.fn(),
    getJudgeScores: jest.fn(),
    getRoundLocks: jest.fn(),
    getDraft: jest.fn(),
    saveDraft: jest.fn(),
    submitScore: jest.fn(),
  };
  class JudgeApiError extends Error {}
  return {
    __esModule: true,
    default: api,
    JudgeApiError,
    isRoundLocked: (err) =>
      err?.status === 409 && err?.body?.error === "round_locked",
    isNotFound: (err) => err?.status === 404,
  };
});

import judgeApi from "../../lib/judgeApi";
import TeamScoringPage from "../../pages/judge/[event_id]/team/[team_id]";

const api = judgeApi;
const CORE = {
  scopeImpact: 3,
  scopeComplexity: 3,
  documentationCode: 3,
  documentationEase: 3,
  polishWorkRemaining: 3,
  polishCanUseToday: 3,
  securityData: 3,
  securityRole: 3,
};
const team = {
  id: "team-1",
  name: "Alpha",
  members: [{ name: "Sam" }],
  github_url: "https://github.com/x/y",
  problem_statement: { nonprofit: "Helpers Inc", title: "Track donations" },
};

const clickScale = (name, value) => {
  const group = screen.getByRole("radiogroup", { name });
  fireEvent.click(group.querySelector(`[data-value="${value}"]`));
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  api.getTeamDetails.mockResolvedValue({ team });
  api.getJudgeScores.mockResolvedValue({ scores: [] });
  api.getRoundLocks.mockResolvedValue({
    locks: { round1: { locked: false }, round2: { locked: false } },
  });
  api.getDraft.mockResolvedValue({ draft: null });
  api.saveDraft.mockResolvedValue({ success: true });
  api.submitScore.mockResolvedValue({ success: true });
});
afterEach(() => {
  jest.useRealTimers();
});

const renderReady = async () => {
  render(<TeamScoringPage />);
  await screen.findByRole("heading", { level: 1, name: "Alpha" });
  // let the hydrated flag settle (setTimeout 0 in the page)
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
};

describe("/judge/[event_id]/team/[team_id] draft autosave", () => {
  it("never saves a draft just from loading the page", async () => {
    await renderReady();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(api.saveDraft).not.toHaveBeenCalled();
    expect(screen.getByText(/not submitted yet/i)).toBeInTheDocument();
  });

  it("saves one debounced draft after a real change, with the quiet total updated", async () => {
    await renderReady();
    clickScale("Impact on Community", 5);
    expect(screen.getByText(/total 26 of 40/i)).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1900);
    });
    expect(api.saveDraft).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    await waitFor(() => expect(api.saveDraft).toHaveBeenCalledTimes(1));
    const [, teamId, eventId, scores, round] = api.saveDraft.mock.calls[0];
    expect([teamId, eventId, round]).toEqual(["team-1", "fall-2026", "round1"]);
    expect(scores.scopeImpact).toBe(5);
  });

  it("never autosaves edits to an already-submitted score; the button reads Update score", async () => {
    api.getJudgeScores.mockResolvedValue({
      scores: [
        {
          team_id: "team-1",
          round: "round1",
          scores: { ...CORE, accessibility: 4, total: 24 },
          feedback: {
            general: "Good start, clear README, deploy it behind auth next.",
          },
          submitted_at: "2026-10-11T20:00:00Z",
        },
      ],
    });
    await renderReady();
    expect(api.getDraft).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /update score/i }),
    ).toBeInTheDocument();
    clickScale("Data Protection", 1);
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(api.saveDraft).not.toHaveBeenCalled();
    expect(screen.getByText(/press update score to save/i)).toBeInTheDocument();
  });

  it("renders read-only when the round is locked: no submit, controls disabled, no autosave", async () => {
    api.getRoundLocks.mockResolvedValue({
      locks: { round1: { locked: true }, round2: { locked: false } },
    });
    await renderReady();
    expect(screen.queryByRole("button", { name: /submit score/i })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      /round 1 scoring is closed/i,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.every((r) => r.disabled)).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(api.saveDraft).not.toHaveBeenCalled();
  });

  it("restores a saved draft instead of defaults", async () => {
    api.getDraft.mockResolvedValue({
      draft: {
        scores: { ...CORE, scopeImpact: 5, accessibility: 2 },
        feedback: { general: "wip" },
      },
    });
    await renderReady();
    const group = screen.getByRole("radiogroup", {
      name: "Impact on Community",
    });
    expect(group.querySelector('[aria-checked="true"]')).toHaveAttribute(
      "data-value",
      "5",
    );
    expect(screen.getByText(/total 26 of 40/i)).toBeInTheDocument();
  });
});
