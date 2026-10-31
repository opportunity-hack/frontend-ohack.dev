import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({
    user: { userId: "me", firstName: "Me" },
    accessToken: "tok",
    isLoggedIn: true,
  }),
}));

import MentorTeamPanel from "../MentorTeamPanel";

// A mentor's own sign-off that has gone stale (over 5h) is a "confirm again"
// action — clicking sends done:true (the backend refreshes the timestamp) —
// while a fresh own sign-off still clears on click. No end_date on the event
// so the clock never freezes and the test doesn't age out.
const ago = (hours) => new Date(Date.now() - hours * 3_600_000).toISOString();
const team = {
  id: "t1",
  name: "Team",
  hackathon_event_id: "fall-2026",
  mentor_checklist: {
    scope_reviewed: {
      checks: {
        me: { name: "Me", checked_at: ago(7) },
        a: { name: "A", checked_at: ago(1) },
      },
    },
    repo_health_checked: {
      checks: { me: { name: "Me", checked_at: ago(1) } },
    },
  },
};
const event = { start_date: "2026-10-30", timezone: "America/Phoenix" };

function coverageCalls() {
  return global.fetch.mock.calls
    .filter(([url]) => String(url).includes("/mentor/coverage"))
    .map(([, opts]) => JSON.parse(opts.body));
}

describe("MentorTeamPanel stale sign-offs (mentor view)", () => {
  let onTeamUpdate;
  beforeEach(() => {
    onTeamUpdate = jest.fn();
    global.fetch = jest.fn((url, opts = {}) => {
      const u = String(url);
      if (u.includes("/me?type=mentor")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ is_mentor: true, volunteer: {} }),
        });
      }
      if (u.includes("/mentor/coverage")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, team: { ...team } }),
        });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    render(
      <MentorTeamPanel
        team={team}
        event={event}
        eventId="fall-2026"
        onTeamUpdate={onTeamUpdate}
      />,
    );
  });

  it("offers to confirm a stale own check again and re-posts done:true", async () => {
    await screen.findByText(/Confirm again — your check is over 5h old/);
    expect(screen.getByText(/You · 7h ago · stale/)).toBeInTheDocument();
    expect(screen.getByText("1/3 · 1 stale")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Project scope reviewed/ }),
    );
    await waitFor(() =>
      expect(coverageCalls()).toEqual([{ item: "scope_reviewed", done: true }]),
    );
    await screen.findByText("Your check is fresh again");
    expect(onTeamUpdate).toHaveBeenCalled();
  });

  it("still clears a fresh own check on click", async () => {
    await screen.findByText(/Confirm again — your check is over 5h old/);
    fireEvent.click(
      screen.getByRole("button", { name: /GitHub repo reviewed/ }),
    );
    await waitFor(() =>
      expect(coverageCalls()).toEqual([
        { item: "repo_health_checked", done: false },
      ]),
    );
    await screen.findByText("Your check cleared");
  });
});
