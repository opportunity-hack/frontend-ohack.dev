import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

// Stable auth object — a fresh object per render would re-run the effect.
const AUTH = {
  user: { userId: "propel-1", firstName: "Ada" },
  accessToken: "tok",
  isLoggedIn: true,
};
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => AUTH,
}));

import MentorTeamPanel from "../MentorTeamPanel";

const TEAM = { id: "team-1", name: "Team One" };
const EVENT = { event_id: "fall-2026", start_date: "2026-11-13", end_date: "2026-11-15" };

function renderPanel() {
  return render(
    <MentorTeamPanel team={TEAM} event={EVENT} eventId="fall-2026" />,
  );
}

function jsonResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("MentorTeamPanel mentor self-check (failure ≠ 'not a mentor')", () => {
  afterEach(() => {
    delete global.fetch;
  });

  it("a 500 shows a quiet Retry, never the not-registered copy", async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => jsonResponse(500, { error: "boom" }))
      .mockImplementationOnce(() => jsonResponse(200, { is_mentor: false }));
    renderPanel();

    expect(
      await screen.findByText("Couldn't confirm mentor access."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/not registered as an approved mentor/)).toBeNull();

    // Retry re-runs the check; a SUCCESSFUL "no" is the only path to the copy.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    });
    expect(
      await screen.findByText(/not registered as an approved mentor/),
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("a network failure also lands on Retry", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("offline")));
    renderPanel();
    expect(
      await screen.findByText("Couldn't confirm mentor access."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/not registered as an approved mentor/)).toBeNull();
  });

  it("a successful is_mentor:true unlocks the panel (no read-only alert)", async () => {
    global.fetch = jest.fn(() => jsonResponse(200, { is_mentor: true }));
    renderPanel();
    await waitFor(() =>
      expect(screen.queryByText("Checking mentor status…")).toBeNull(),
    );
    expect(screen.queryByText("Couldn't confirm mentor access.")).toBeNull();
    expect(screen.queryByText(/not registered as an approved mentor/)).toBeNull();
  });
});
