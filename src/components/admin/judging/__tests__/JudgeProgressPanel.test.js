import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

jest.mock("../../../../lib/ga", () => ({
  trackStructuredEvent: jest.fn(),
  EventCategory: { ADMIN: "admin" },
}));
jest.mock("../../../../lib/judgeApi", () => {
  const api = {
    getJudgingProgress: jest.fn(),
    setRoundLock: jest.fn(),
    getRoundLocks: jest.fn(),
  };
  return {
    __esModule: true,
    default: api,
    isNotFound: (e) => e?.status === 404,
  };
});
jest.mock("../../ExportCsvButton", () => () => null);

import judgeApi from "../../../../lib/judgeApi";
import JudgeProgressPanel from "../JudgeProgressPanel";

const api = judgeApi;
const progress = {
  lock: { locked: false },
  judges: [
    {
      judge_id: "j1",
      name: "Ada",
      email: "ada@x.org",
      assigned: 3,
      submitted: 1,
      complete: false,
      assigned_team_ids: ["t1", "t2", "t3"],
      submitted_team_ids: ["t1"],
      draft_team_ids: ["t2"],
      missing_team_ids: ["t3"],
      last_submitted_at: "2026-10-11T20:00:00Z",
    },
    {
      judge_id: "j2",
      name: "Bob",
      assigned: 2,
      submitted: 2,
      complete: true,
      assigned_team_ids: ["t1", "t2"],
      submitted_team_ids: ["t1", "t2"],
      draft_team_ids: [],
      missing_team_ids: [],
    },
  ],
  teams: [
    {
      team_id: "t1",
      name: "Alpha",
      assigned: 2,
      submitted: 2,
      assigned_judge_ids: ["j1", "j2"],
      submitted_judge_ids: ["j1", "j2"],
    },
    {
      team_id: "t3",
      name: "Gamma",
      assigned: 1,
      submitted: 0,
      assigned_judge_ids: ["j1"],
    }, // submitted_judge_ids missing on purpose
  ],
  summary: {
    judges_total: 2,
    judges_complete: 1,
    assignments_total: 5,
    submitted_total: 3,
    drafts_total: 1,
    orphan_submitted: 1,
  },
};

const props = {
  eventId: "fall-2026",
  round: "round2",
  accessToken: "tok",
  orgId: "org",
  onSnack: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  api.getJudgingProgress.mockResolvedValue(progress);
  api.setRoundLock.mockResolvedValue({
    success: true,
    lock: {
      locked: true,
      locked_at: "2026-10-11T21:00:00Z",
      locked_by_name: "Greg",
    },
  });
});

describe("JudgeProgressPanel", () => {
  it("renders who is done, who is missing teams, drafts and the orphan note", async () => {
    render(<JudgeProgressPanel {...props} />);
    expect(
      await screen.findByText(/judges complete 1\/2/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/scores in 3\/5/i)).toBeInTheDocument();
    expect(screen.getByText(/drafts in progress 1/i)).toBeInTheDocument();
    const ada = screen.getByText("Ada").closest("tr");
    expect(within(ada).getByText("Gamma")).toBeInTheDocument();
    expect(
      within(ada).getByText(/Beta|t2 \(draft\)|\(draft\)/),
    ).toBeInTheDocument();
    const bob = screen.getByText("Bob").closest("tr");
    expect(within(bob).getByText(/done/i)).toBeInTheDocument();
    expect(screen.getByText(/not counted in results/i)).toBeInTheDocument();
    // By-team view tolerates a row missing submitted_judge_ids
    fireEvent.click(screen.getByRole("button", { name: /by team/i }));
    const gamma = screen.getByText("Gamma").closest("tr");
    expect(within(gamma).getByText("Ada")).toBeInTheDocument();
  });

  it("locks the round through the confirm dialog and updates the chip", async () => {
    render(<JudgeProgressPanel {...props} />);
    expect(
      await screen.findByText(/round 2 scoring open/i),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /lock round 2 scoring/i }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(
      /judges will no longer be able to submit/i,
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^lock scoring$/i }),
    );
    await waitFor(() =>
      expect(api.setRoundLock).toHaveBeenCalledWith(
        "fall-2026",
        "round2",
        true,
        "tok",
        "org",
      ),
    );
    // The confirm dialog hides the page behind aria-hidden until its exit transition ends.
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(
      await screen.findByText(/round 2 scoring locked/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/locked by greg/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unlock round 2 scoring/i }),
    ).toBeInTheDocument();
    expect(props.onSnack).toHaveBeenCalledWith(
      expect.stringMatching(/now locked/i),
      "success",
    );
  });

  it("explains when the backend predates the progress route", async () => {
    api.getJudgingProgress.mockResolvedValue(null);
    render(<JudgeProgressPanel {...props} />);
    expect(
      await screen.findByText(/needs the latest backend/i),
    ).toBeInTheDocument();
  });

  it("keeps the lock toggle disabled while the lock state is unknown, then uses the public locks route", async () => {
    api.getJudgingProgress.mockRejectedValue(new Error("boom"));
    api.getRoundLocks.mockResolvedValue({
      locks: { round2: { locked: true, locked_at: "2026-10-11T21:00:00Z" } },
    });
    render(<JudgeProgressPanel {...props} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/boom/);
    expect(
      await screen.findByText(/round 2 scoring locked/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unlock round 2 scoring/i }),
    ).toBeEnabled();
  });
});
