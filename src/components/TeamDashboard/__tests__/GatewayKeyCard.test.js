import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import GatewayKeyCard from "../GatewayKeyCard";
import { fetchGatewayKey, ApiError } from "../../../lib/teamDashboardApi";

jest.mock("../../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../../lib/teamDashboardApi");
  return { ...actual, fetchGatewayKey: jest.fn() };
});
jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));

const team = { id: "team-1" };

describe("GatewayKeyCard", () => {
  beforeEach(() => fetchGatewayKey.mockReset());

  // Regression: Oct 2026 staging crash "Cannot read properties of null
  // (reading 'spend')". The hook used to start with loading=false, and the
  // card's data branch ran on the first paint with keyData === null.
  it("renders the loading skeleton on first paint instead of dereferencing a null key", () => {
    fetchGatewayKey.mockReturnValue(new Promise(() => {})); // never resolves
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(screen.getByLabelText("Loading AI API access")).toBeInTheDocument();
    expect(screen.queryByText(/Reveal/)).not.toBeInTheDocument();
  });

  it("stays on the skeleton (not the data branch) while the token is not known yet", () => {
    render(<GatewayKeyCard team={team} accessToken={null} />);
    expect(screen.getByLabelText("Loading AI API access")).toBeInTheDocument();
    expect(fetchGatewayKey).not.toHaveBeenCalled();
  });

  it("shows the 'being prepared' copy when the key is not provisioned yet", async () => {
    fetchGatewayKey.mockRejectedValue(
      new ApiError(404, { error: "key_not_provisioned", retryable: true }),
    );
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/Your AI key is being prepared/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders the masked key and budget meter once the key loads", async () => {
    fetchGatewayKey.mockResolvedValue({
      key: "sk-live-abc",
      key_alias: "fall26-team-1",
      models: ["muse-spark"],
      max_budget: 15,
      expires: "2026-11-16T07:00:00Z",
      spend: 3.5,
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(await screen.findByLabelText("API key hidden")).toBeInTheDocument();
    expect(screen.getByText(/\$3\.50 of \$15\.00/)).toBeInTheDocument();
    expect(screen.queryByText("sk-live-abc")).not.toBeInTheDocument();
  });

  it("omits the budget meter when spend is unavailable, without crashing", async () => {
    fetchGatewayKey.mockResolvedValue({
      key: "sk-live-abc",
      models: [],
      max_budget: 15,
      spend: null,
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(await screen.findByLabelText("API key hidden")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/of \$15\.00/)).not.toBeInTheDocument(),
    );
  });
});
