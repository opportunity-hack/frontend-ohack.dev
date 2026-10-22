/**
 * /judge/[event_id] — the judge dashboard. Lives outside src/pages on purpose
 * (Next builds every file under pages/ as a route).
 *
 * Covers the inline "Adjust scores" flow end to end against a mocked API:
 * nothing is sent until Save, the saved payload carries the recalculated
 * total, a locked round hides the editor, and a failed submit stays on the
 * card with an error (the old client faked success).
 */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));
jest.mock("next/dynamic", () => () => () => null);
jest.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    query: { event_id: "fall-2026", tab: "round1" },
    asPath: "/judge/fall-2026?tab=round1",
    replace: jest.fn(),
    push: jest.fn(),
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
  // Defined inside the factory: jest.mock is hoisted above imports, so an
  // outer `const` would be read before initialization.
  const api = {
    getJudgeTeams: jest.fn(),
    getJudgeScores: jest.fn(),
    submitScore: jest.fn(),
  };
  class JudgeApiError extends Error {
    constructor(message, { status, body } = {}) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }
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
import HackathonJudgePage from "../../pages/judge/[event_id]";

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

const teams = (locks = null) => ({
  round1_teams: [
    {
      id: "t-scored",
      name: "Alpha",
      judged: true,
      score: 24,
      members: [{ name: "Sam" }],
      problem_statement: { nonprofit: "Helpers Inc", nonprofit_id: "np1" },
      github_url: "https://github.com/x/y",
    },
    {
      id: "t-new",
      name: "Beta",
      judged: false,
      score: null,
      members: [],
      problem_statement: {},
    },
  ],
  round2_teams: [],
  event: { title: "Fall 2026" },
  locks,
});

const scores = () => ({
  scores: [
    {
      team_id: "t-scored",
      round: "round1",
      scores: { ...CORE, accessibility: 3, total: 24 },
      feedback: {
        general: "Good start, clear README, deploy it behind auth next.",
      },
      submitted_at: "2026-10-11T20:00:00Z",
    },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  api.getJudgeTeams.mockResolvedValue(teams());
  api.getJudgeScores.mockResolvedValue(scores());
  api.submitScore.mockResolvedValue({ success: true });
});

describe("/judge/[event_id]", () => {
  it("renders the assigned teams with the right actions", async () => {
    render(<HackathonJudgePage />);
    // The h1 falls back to the event id before data arrives, so wait on a card.
    const alpha = await screen.findByRole("article", { name: "Alpha" });
    expect(
      screen.getByRole("heading", { level: 1, name: /fall 2026/i }),
    ).toBeInTheDocument();
    expect(
      within(alpha).getByText(/your score · 24 of 40/i),
    ).toBeInTheDocument();
    expect(
      within(alpha).getByRole("button", { name: /adjust scores/i }),
    ).toBeInTheDocument();
    const beta = screen.getByRole("article", { name: "Beta" });
    expect(within(beta).getByText(/score this team/i)).toBeInTheDocument();
    expect(
      within(beta).queryByRole("button", { name: /adjust scores/i }),
    ).toBeNull();
  });

  it("adjusts a score inline: nothing is sent until Save, and Save sends the new total", async () => {
    render(<HackathonJudgePage />);
    const alpha = await screen.findByRole("article", { name: "Alpha" });
    fireEvent.click(
      within(alpha).getByRole("button", { name: /adjust scores/i }),
    );

    const group = within(alpha).getByRole("radiogroup", {
      name: "Impact on Community",
    });
    fireEvent.click(group.querySelector('[data-value="5"]'));
    expect(api.submitScore).not.toHaveBeenCalled();

    fireEvent.click(
      within(alpha).getByRole("button", { name: /save changes/i }),
    );
    await waitFor(() => expect(api.submitScore).toHaveBeenCalledTimes(1));
    const [judgeId, teamId, eventId, payload, round, token, feedback] =
      api.submitScore.mock.calls[0];
    expect([judgeId, teamId, eventId, round, token]).toEqual([
      "judge-1",
      "t-scored",
      "fall-2026",
      "round1",
      "tok",
    ]);
    expect(payload.scopeImpact).toBe(5);
    expect(payload.total).toBe(26);
    expect(feedback.general).toMatch(/clear README/);

    expect(
      await screen.findByText(/saved your changes for alpha/i),
    ).toBeInTheDocument();
    expect(
      within(alpha).getByText(/your score · 26 of 40/i),
    ).toBeInTheDocument();
    expect(
      within(alpha).queryByRole("radiogroup", { name: "Impact on Community" }),
    ).toBeNull();
  });

  it("keeps the editor open with an error when the submit fails (never fakes success)", async () => {
    api.submitScore.mockRejectedValueOnce(
      Object.assign(new Error("Couldn't submit your score (HTTP 500)"), {
        status: 500,
      }),
    );
    render(<HackathonJudgePage />);
    const alpha = await screen.findByRole("article", { name: "Alpha" });
    fireEvent.click(
      within(alpha).getByRole("button", { name: /adjust scores/i }),
    );
    const group = within(alpha).getByRole("radiogroup", {
      name: "Data Protection",
    });
    fireEvent.click(group.querySelector('[data-value="1"]'));
    fireEvent.click(
      within(alpha).getByRole("button", { name: /save changes/i }),
    );
    expect(await within(alpha).findByRole("alert")).toHaveTextContent(
      /HTTP 500/,
    );
    expect(
      within(alpha).getByText(/your score · 24 of 40/i),
    ).toBeInTheDocument();
  });

  it("offers only the full page when a team is marked judged but no complete score row exists", async () => {
    api.getJudgeScores.mockResolvedValue({ scores: [] });
    render(<HackathonJudgePage />);
    const alpha = await screen.findByRole("article", { name: "Alpha" });
    expect(
      within(alpha).queryByRole("button", { name: /adjust scores/i }),
    ).toBeNull();
    expect(
      within(alpha).getByText(/open full scoring page/i),
    ).toBeInTheDocument();
  });

  it("disables Close and other cards' Adjust while a save is in flight, and keeps the error on the card", async () => {
    let rejectSave;
    api.submitScore.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectSave = reject;
      }),
    );
    api.getJudgeTeams.mockResolvedValue({
      ...teams(),
      round1_teams: [
        ...teams().round1_teams,
        {
          id: "t-other",
          name: "Gamma",
          judged: true,
          score: 24,
          members: [],
          problem_statement: {},
        },
      ],
    });
    api.getJudgeScores.mockResolvedValue({
      scores: [
        ...scores().scores,
        {
          team_id: "t-other",
          round: "round1",
          scores: { ...CORE, total: 24 },
          feedback: { general: "Fine work overall, ship it soon please." },
        },
      ],
    });
    render(<HackathonJudgePage />);
    const alpha = await screen.findByRole("article", { name: "Alpha" });
    const gamma = screen.getByRole("article", { name: "Gamma" });
    fireEvent.click(
      within(alpha).getByRole("button", { name: /adjust scores/i }),
    );
    fireEvent.click(
      within(alpha)
        .getByRole("radiogroup", { name: "Impact on Community" })
        .querySelector('[data-value="4"]'),
    );
    fireEvent.click(
      within(alpha).getByRole("button", { name: /save changes/i }),
    );

    expect(
      await within(alpha).findByRole("button", { name: /^close$/i }),
    ).toBeDisabled();
    expect(
      within(gamma).getByRole("button", { name: /adjust scores/i }),
    ).toBeDisabled();

    await act(async () => {
      rejectSave(
        Object.assign(new Error("Couldn't submit your score (HTTP 500)"), {
          status: 500,
        }),
      );
    });
    expect(await within(alpha).findByRole("alert")).toHaveTextContent(
      /HTTP 500/,
    );
    expect(
      within(alpha).getByRole("button", { name: /^close$/i }),
    ).toBeEnabled();
    expect(
      within(gamma).getByRole("button", { name: /adjust scores/i }),
    ).toBeEnabled();
  });

  it("hides scoring actions and shows a closed notice when the round is locked", async () => {
    api.getJudgeTeams.mockResolvedValue(
      teams({ round1: { locked: true }, round2: { locked: false } }),
    );
    render(<HackathonJudgePage />);
    const alpha = await screen.findByRole("article", { name: "Alpha" });
    expect(
      within(alpha).queryByRole("button", { name: /adjust scores/i }),
    ).toBeNull();
    expect(within(alpha).getByText(/view your score/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      /round 1 scoring is closed/i,
    );
    const beta = screen.getByRole("article", { name: "Beta" });
    expect(within(beta).queryByText(/score this team/i)).toBeNull();
  });

  it("shows a retry card instead of an empty list when the API fails", async () => {
    api.getJudgeTeams.mockRejectedValueOnce(
      new Error("Couldn't load your assigned teams (network error)"),
    );
    render(<HackathonJudgePage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn't load your assignments/i,
    );
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });
});
