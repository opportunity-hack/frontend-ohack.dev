/**
 * PeerVotePage × auth (Class C, docs/plans/reliability-bug-classes-2026-11.md):
 * PropelAuth resolving mid-flight never shows a negative state, a token
 * rotation fires zero requests, and a backend 500 renders the Retry card.
 */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import PeerVotePage from "../PeerVotePage";
import { ApiError } from "../../../lib/teamDashboardApi";

jest.mock("next/router", () => ({
  useRouter: () => ({ query: { event_id: "2026_fall" } }),
}));

const USER = { userId: "voter-1" };
let mockAuth;
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
}));
jest.mock("../../../lib/ga", () => ({ trackEvent: jest.fn() }));

const mockGetPeerVoteSlate = jest.fn();
jest.mock("../../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../../lib/teamDashboardApi");
  return {
    ...actual,
    getPeerVoteSlate: (...args) => mockGetPeerVoteSlate(...args),
    submitPeerVoteBallot: jest.fn(),
    getHackathonMeta: () => Promise.resolve({ title: "Fall 2026" }),
  };
});

const NEGATIVE_COPY = [
  "This vote is for registered hackers.",
  "Voting isn't set up for this event yet.",
  "Something went wrong",
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER,
    accessToken: "tok-1",
  };
});

it("auth resolving mid-flight: loading → slate, never a negative or error state", async () => {
  mockAuth = {
    loading: true,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  mockGetPeerVoteSlate.mockResolvedValue({ status: "closed" });
  const { rerender } = render(<PeerVotePage />);
  for (const copy of NEGATIVE_COPY) expect(screen.queryByText(copy)).toBeNull();
  expect(mockGetPeerVoteSlate).not.toHaveBeenCalled();

  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER,
    accessToken: "tok-1",
  };
  rerender(<PeerVotePage />);
  expect(await screen.findByText("Voting has closed.")).toBeInTheDocument();
  for (const copy of NEGATIVE_COPY) expect(screen.queryByText(copy)).toBeNull();
  expect(mockGetPeerVoteSlate).toHaveBeenCalledTimes(1);
  expect(mockGetPeerVoteSlate).toHaveBeenCalledWith("2026_fall", "tok-1");
});

it("a token rotation (tab refocus) fires zero slate requests", async () => {
  mockGetPeerVoteSlate.mockResolvedValue({ status: "closed" });
  const { rerender } = render(<PeerVotePage />);
  await screen.findByText("Voting has closed.");
  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender(<PeerVotePage />);
  mockAuth = { ...mockAuth, accessToken: "tok-3" };
  rerender(<PeerVotePage />);
  await act(async () => {});
  expect(mockGetPeerVoteSlate).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Voting has closed.")).toBeInTheDocument();
});

it("a 500 renders the Retry card (not 'not eligible'), and Try again recovers", async () => {
  mockGetPeerVoteSlate
    .mockRejectedValueOnce(new ApiError(500, { error: "server" }))
    .mockResolvedValueOnce({ status: "closed" });
  render(<PeerVotePage />);
  expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  expect(screen.queryByText("This vote is for registered hackers.")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() =>
    expect(screen.getByText("Voting has closed.")).toBeInTheDocument(),
  );
  expect(mockGetPeerVoteSlate).toHaveBeenCalledTimes(2);
});
