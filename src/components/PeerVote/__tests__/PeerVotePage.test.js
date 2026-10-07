import React from "react";
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import PeerVotePage from "../PeerVotePage";
import { ApiError } from "../../../lib/teamDashboardApi";

// This test focuses on the ballot-submit error branching (Part 3:
// POST .../peer-vote/ballot) and the peer_vote_view GA dedupe — the two
// review findings that touched PeerVotePage's own logic, not just markup.
// (PeerVoteSlateCard/PeerVoteCTA/peerVoteState have their own pure-unit
// suites; this is the first test file for the page shell itself.)

jest.mock("next/router", () => ({
  useRouter: () => ({ query: { event_id: "2026_fall" } }),
}));

const mockAuth = { accessToken: "test-token" };
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
}));

const mockTrackEvent = jest.fn();
jest.mock("../../../lib/ga", () => ({
  trackEvent: (...args) => mockTrackEvent(...args),
}));

const mockGetPeerVoteSlate = jest.fn();
const mockSubmitPeerVoteBallot = jest.fn();
const mockGetHackathonMeta = jest.fn();
jest.mock("../../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../../lib/teamDashboardApi");
  return {
    ...actual,
    getPeerVoteSlate: (...args) => mockGetPeerVoteSlate(...args),
    submitPeerVoteBallot: (...args) => mockSubmitPeerVoteBallot(...args),
    getHackathonMeta: (...args) => mockGetHackathonMeta(...args),
  };
});

const SLATE_ITEM = {
  team_id: "team-1",
  name: "Team One",
  project_tagline: "A great project.",
  github_links: [],
  users_count: 2,
};

function openSlate(overrides = {}) {
  return {
    status: "open",
    opens_at: "2026-09-01T00:00:00.000Z",
    closes_at: "2026-09-30T00:00:00.000Z",
    max_picks: 2,
    picks: null,
    slate: [SLATE_ITEM],
    ...overrides,
  };
}

async function pickAndOpenConfirm() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Pick this project" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Submit picks" }));
  // The confirm Dialog's own "Submit picks" button is now also on the page;
  // it's the one added after the sticky bar's, i.e. the last match.
  const buttons = screen.getAllByRole("button", { name: "Submit picks" });
  return buttons[buttons.length - 1];
}

describe("PeerVotePage ballot submit errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHackathonMeta.mockResolvedValue({
      title: "Fall 2026",
      timezone: "America/Phoenix",
      constraints: { peer_vote_slate_size: 5 },
    });
  });

  it("shows a reason-specific notice and refetches on a 400 invalid_picks error, without a generic fallback message", async () => {
    mockGetPeerVoteSlate
      .mockResolvedValueOnce(openSlate())
      .mockResolvedValueOnce(openSlate());
    mockSubmitPeerVoteBallot.mockRejectedValueOnce(
      new ApiError(400, { error: "invalid_picks" }),
    );

    render(<PeerVotePage />);
    const confirmButton = await pickAndOpenConfirm();
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(
      await screen.findByText(
        "One or more of your picks are no longer valid — we've refreshed your slate.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Couldn't submit your picks — please try again."),
    ).not.toBeInTheDocument();
    expect(mockGetPeerVoteSlate).toHaveBeenCalledTimes(2);
  });

  it("shows a reason-specific notice for a 403 not_eligible error", async () => {
    mockGetPeerVoteSlate
      .mockResolvedValueOnce(openSlate())
      .mockResolvedValueOnce({ status: "not_eligible" });
    mockSubmitPeerVoteBallot.mockRejectedValueOnce(
      new ApiError(403, { error: "not_eligible" }),
    );

    render(<PeerVotePage />);
    const confirmButton = await pickAndOpenConfirm();
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(
      await screen.findByText(
        "You're no longer eligible to vote for this event.",
      ),
    ).toBeInTheDocument();
  });

  it("clears any notice on a 409 ballot_voided error and lets VoidedState explain instead", async () => {
    mockGetPeerVoteSlate
      .mockResolvedValueOnce(openSlate())
      .mockResolvedValueOnce({ status: "voided" });
    mockSubmitPeerVoteBallot.mockRejectedValueOnce(
      new ApiError(409, { error: "ballot_voided" }),
    );

    render(<PeerVotePage />);
    const confirmButton = await pickAndOpenConfirm();
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(
      await screen.findByText("Your ballot was voided."),
    ).toBeInTheDocument();
    // No leftover generic/other-reason copy should coexist with the
    // VoidedState card's own explanation.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it('shows "Voting has closed." on a 409 voting_closed error', async () => {
    mockGetPeerVoteSlate
      .mockResolvedValueOnce(openSlate())
      .mockResolvedValueOnce({ status: "closed" });
    mockSubmitPeerVoteBallot.mockRejectedValueOnce(
      new ApiError(409, { error: "voting_closed" }),
    );

    render(<PeerVotePage />);
    const confirmButton = await pickAndOpenConfirm();
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Voting has closed.",
      );
    });
  });

  it("falls back to the generic error for an unrecognized error code and does not refetch", async () => {
    mockGetPeerVoteSlate.mockResolvedValueOnce(openSlate());
    mockSubmitPeerVoteBallot.mockRejectedValueOnce(
      new ApiError(500, { error: "server_error" }),
    );

    render(<PeerVotePage />);
    const confirmButton = await pickAndOpenConfirm();
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(
      await screen.findByText("Couldn't submit your picks — please try again."),
    ).toBeInTheDocument();
    expect(mockGetPeerVoteSlate).toHaveBeenCalledTimes(1);
  });
});

describe("PeerVotePage peer_vote_view GA dedupe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHackathonMeta.mockResolvedValue({
      title: "Fall 2026",
      timezone: "America/Phoenix",
      constraints: { peer_vote_slate_size: 5 },
    });
  });

  it("fires peer_vote_view once per distinct status, not again on a same-status visibilitychange poll", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "upcoming",
      opens_at: "2026-12-01T00:00:00.000Z",
    });

    render(<PeerVotePage />);
    await screen.findByText("Voting opens soon");

    const viewCallsFor = (label) =>
      mockTrackEvent.mock.calls.filter(
        ([arg]) =>
          arg.action === "peer_vote_view" && arg.params.event_label === label,
      ).length;
    expect(viewCallsFor("upcoming")).toBe(1);

    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(mockGetPeerVoteSlate).toHaveBeenCalledTimes(2);
    expect(viewCallsFor("upcoming")).toBe(1);
  });
});
