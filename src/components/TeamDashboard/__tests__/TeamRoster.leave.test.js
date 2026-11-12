/**
 * Leave team from the dashboard roster card (TeamRoster → LeaveTeamControl).
 * Same rules and copy as the public team page's TeamMembershipActions.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));

import TeamRoster from "../TeamRoster";
import {
  leaveTeam,
  TeamMembershipError,
  TEAM_REFUSAL_COPY,
} from "../../../lib/teamMembershipApi";

process.env.NEXT_PUBLIC_API_SERVER_URL = "http://api.test";

const TWO = [
  { id: "db-me", name: "Me" },
  { id: "db-you", name: "You Too" },
];

function renderRoster(props = {}) {
  return render(
    <TeamRoster
      users={TWO}
      loading={false}
      ownId="db-me"
      eventId="fall-2026"
      teamId="t1"
      teamName="Byte Club"
      slackChannel="byte-club"
      onLeave={jest.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );
}

const leaveButton = () => screen.getByRole("button", { name: "Leave team" });

afterEach(() => {
  delete global.fetch;
});

it("asks before leaving and names the Slack channel", async () => {
  const onLeave = jest.fn().mockResolvedValue(undefined);
  renderRoster({ onLeave });

  fireEvent.click(leaveButton());
  expect(
    screen.getByText(
      "Leave Byte Club? Your teammates will see a note in #byte-club.",
    ),
  ).toBeInTheDocument();
  expect(onLeave).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Stay on the team" }));
  expect(leaveButton()).toBeInTheDocument();

  fireEvent.click(leaveButton());
  fireEvent.click(screen.getByRole("button", { name: "Yes, leave the team" }));
  expect(onLeave).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole("button", { name: /leave the team/ }))
    .toBeInTheDocument();
});

it("warns the last member that the team will be empty", () => {
  renderRoster({ users: [TWO[0]] });
  fireEvent.click(leaveButton());
  expect(
    screen.getByText(
      "You're the only member — Byte Club will have no one on it. An organizer can close it.",
    ),
  ).toBeInTheDocument();
});

it("shows the blocked reason instead of the button", () => {
  renderRoster({ leaveBlockedReason: TEAM_REFUSAL_COPY.event_ended });
  expect(screen.queryByRole("button", { name: "Leave team" })).toBeNull();
  expect(screen.getByText(TEAM_REFUSAL_COPY.event_ended)).toBeInTheDocument();
});

it("a server refusal settles into the blocked sentence, not an error", async () => {
  const onLeave = jest.fn().mockRejectedValue(
    new TeamMembershipError(TEAM_REFUSAL_COPY.team_join_disabled, {
      status: 409,
      code: "team_join_disabled",
    }),
  );
  renderRoster({ onLeave });
  fireEvent.click(leaveButton());
  fireEvent.click(screen.getByRole("button", { name: "Yes, leave the team" }));

  expect(
    await screen.findByText(TEAM_REFUSAL_COPY.team_join_disabled),
  ).toBeInTheDocument();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("button", { name: "Leave team" })).toBeNull();
});

it("an HTTP-200 'Error: User not found' answer shows an alert and keeps the button", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ text: "Error: User not found" }),
  });
  const onLeave = () =>
    leaveTeam({
      accessToken: "tok",
      teamId: "t1",
      eventId: "fall-2026",
      source: "team_dashboard",
    });
  renderRoster({ onLeave });
  fireEvent.click(leaveButton());
  fireEvent.click(screen.getByRole("button", { name: "Yes, leave the team" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /couldn't find your Opportunity Hack profile/,
  );
  expect(leaveButton()).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith(
    "http://api.test/api/messages/team",
    expect.objectContaining({ method: "DELETE" }),
  );

  fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(screen.queryByRole("alert")).toBeNull();
});

it("is hidden while the roster loads and without an onLeave handler", () => {
  const { rerender } = renderRoster({ loading: true });
  expect(screen.queryByRole("button", { name: "Leave team" })).toBeNull();
  rerender(
    <TeamRoster
      users={TWO}
      loading={false}
      eventId="fall-2026"
      teamId="t1"
    />,
  );
  expect(screen.queryByRole("button", { name: "Leave team" })).toBeNull();
});
