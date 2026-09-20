import React from "react";
import { render, screen } from "@testing-library/react";
import PeerVotePage from "../PeerVotePage";
import { ApiError } from "../../../lib/teamDashboardApi";

// Part 6 item 4 of docs/plans/team-dashboard-devpost-replacement.md: force
// every slate `status` the backend can report (Part 3 contract) through the
// page with mocked responses and assert the state card each one renders.
// Voters must never see tallies, so the open/voted assertions also check
// that no approval counts leak into the markup.

jest.mock("next/router", () => ({
  useRouter: () => ({ query: { event_id: "2026_fall" } }),
}));

const mockAuth = { accessToken: "test-token" };
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
}));

jest.mock("../../../lib/ga", () => ({ trackEvent: jest.fn() }));

const mockGetPeerVoteSlate = jest.fn();
const mockGetHackathonMeta = jest.fn();
jest.mock("../../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../../lib/teamDashboardApi");
  return {
    ...actual,
    getPeerVoteSlate: (...args) => mockGetPeerVoteSlate(...args),
    submitPeerVoteBallot: jest.fn(),
    getHackathonMeta: (...args) => mockGetHackathonMeta(...args),
  };
});

const OWN_TEAM_ID = "my-team";
const SLATE = [
  {
    team_id: "team-1",
    name: "Team One",
    project_tagline: "One.",
    users_count: 2,
  },
  {
    team_id: "team-2",
    name: "Team Two",
    project_tagline: "Two.",
    users_count: 3,
  },
  {
    team_id: "team-3",
    name: "Team Three",
    project_tagline: "Three.",
    users_count: 4,
  },
  {
    team_id: "team-4",
    name: "Team Four",
    project_tagline: "Four.",
    users_count: 2,
  },
  {
    team_id: "team-5",
    name: "Team Five",
    project_tagline: "Five.",
    users_count: 5,
  },
];

const FUTURE = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
const PAST = new Date(Date.now() - 36 * 3600 * 1000).toISOString();

beforeEach(() => {
  jest.clearAllMocks();
  mockGetHackathonMeta.mockResolvedValue({
    title: "Fall 2026",
    timezone: "America/Phoenix",
    constraints: { peer_vote_slate_size: 5, peer_vote_max_picks: 2 },
  });
});

describe("PeerVotePage renders every backend slate status", () => {
  it("disabled → 'Voting isn't set up for this event yet.'", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({ status: "disabled" });
    render(<PeerVotePage />);
    expect(
      await screen.findByText("Voting isn't set up for this event yet."),
    ).toBeInTheDocument();
  });

  it("404 from an older backend is treated as disabled (feature off)", async () => {
    mockGetPeerVoteSlate.mockRejectedValue(new ApiError(404, {}));
    render(<PeerVotePage />);
    expect(
      await screen.findByText("Voting isn't set up for this event yet."),
    ).toBeInTheDocument();
  });

  it("not_eligible → 'This vote is for registered hackers.' (default reason)", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "not_eligible",
      reason: "not_selected_hacker",
    });
    render(<PeerVotePage />);
    expect(
      await screen.findByText("This vote is for registered hackers."),
    ).toBeInTheDocument();
  });

  it("not_eligible + own_team_not_submitted → asks the voter to submit first", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "not_eligible",
      reason: "own_team_not_submitted",
    });
    render(<PeerVotePage />);
    expect(
      await screen.findByText("Submit your project to unlock voting."),
    ).toBeInTheDocument();
  });

  it("upcoming → 'Voting opens soon' with the opens-at time", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "upcoming",
      opens_at: FUTURE,
      closes_at: FUTURE,
    });
    render(<PeerVotePage />);
    expect(await screen.findByText("Voting opens soon")).toBeInTheDocument();
    // Body line carries the formatted opens-at moment ("Voting opens Mon 5:36 PM MST.").
    expect(screen.getByText(/^Voting opens \w{3} \d/)).toBeInTheDocument();
  });

  it("open → renders the slate (never the voter's own team), the pick bar and no tallies", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "open",
      opens_at: PAST,
      closes_at: FUTURE,
      max_picks: 2,
      picks: null,
      own_team_ids: [OWN_TEAM_ID],
      slate: SLATE,
    });
    render(<PeerVotePage />);
    expect(await screen.findByText("Team One")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Pick this project" }),
    ).toHaveLength(5);
    expect(screen.queryByText(OWN_TEAM_ID)).not.toBeInTheDocument();
    expect(screen.getByText("0 of 2 picked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit picks" })).toBeDisabled();
    // The lead reflects the actual slate size + max picks from the payload.
    expect(
      screen.getByText(/You'll see 5 projects picked for you\. Pick up to 2/),
    ).toBeInTheDocument();
    // No tallies for voters — none of the admin results vocabulary appears.
    expect(screen.queryByText(/approval/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/wilson/i)).not.toBeInTheDocument();
  });

  it("open + not_enough_submissions → 'Not enough submitted projects yet'", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "open",
      reason: "not_enough_submissions",
      opens_at: PAST,
      closes_at: FUTURE,
      max_picks: 2,
      picks: null,
      slate: [],
    });
    render(<PeerVotePage />);
    expect(
      await screen.findByText(
        "Not enough submitted projects yet — check back later.",
      ),
    ).toBeInTheDocument();
  });

  it("voted → 'Your picks' summary with a 'Change picks' affordance while the window is open", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "voted",
      opens_at: PAST,
      closes_at: FUTURE,
      max_picks: 2,
      picks: ["team-1", "team-3"],
      slate: SLATE,
    });
    render(<PeerVotePage />);
    expect(await screen.findByText("Your picks")).toBeInTheDocument();
    expect(screen.getByText("Team One")).toBeInTheDocument();
    expect(screen.getByText("Team Three")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /change picks/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/approval/i)).not.toBeInTheDocument();
  });

  it("closed → 'Voting has closed.' with a results link", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "closed",
      opens_at: PAST,
      closes_at: PAST,
    });
    render(<PeerVotePage />);
    expect(await screen.findByText("Voting has closed.")).toBeInTheDocument();
    // jest.setup.js mocks next/link down to its children, so assert the
    // CTA text rather than the anchor href.
    expect(screen.getByText("See results →")).toBeInTheDocument();
  });

  it("voided → read-only explanation, no 'Change picks'", async () => {
    mockGetPeerVoteSlate.mockResolvedValue({
      status: "voided",
      opens_at: PAST,
      closes_at: FUTURE,
      picks: ["team-1"],
      slate: SLATE,
    });
    render(<PeerVotePage />);
    expect(
      await screen.findByText("Your ballot was voided."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /change picks/i }),
    ).not.toBeInTheDocument();
  });
});
