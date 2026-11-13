import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";

jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));

import TeamInviteKit from "../TeamInviteKit";
import { savePendingTeammates } from "../../../lib/teamInvite";

const props = {
  eventId: "fall-2026",
  teamId: "t1",
  teamName: "Byte Club",
  eventTitle: "Fall 2026",
  slackChannel: "byte-club",
};

beforeEach(() => {
  localStorage.clear();
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

it("copies the invite message", async () => {
  render(<TeamInviteKit {...props} users={[]} />);
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: /copy invite message/i }),
    );
  });
  const text = navigator.clipboard.writeText.mock.calls[0][0];
  expect(text).toMatch(/Join "Byte Club"/);
  expect(text).toMatch(/\/hack\/fall-2026\/team\/t1/);
  expect(screen.getByText(/invite message copied/i)).toBeInTheDocument();
});

it("lists names still to join, hides ones now on the roster, and can drop one", () => {
  savePendingTeammates("byte-club", ["Priya", "Sam"]);
  render(
    <TeamInviteKit {...props} users={[{ name: "Sam Rivera" }]} showPending />,
  );
  const list = screen.getByRole("list", { name: /still to join/i });
  expect(list).toHaveTextContent("Priya");
  expect(list).not.toHaveTextContent("Sam");
  fireEvent.click(
    within(list).getByRole("button", {
      name: /remove priya from the reminder list/i,
    }),
  );
  expect(screen.queryByRole("list", { name: /still to join/i })).toBeNull();
  expect(
    localStorage.getItem("ohx.team.pendingTeammates.byte-club"),
  ).toBeNull();
});

it("opens the message preview when copying fails", async () => {
  navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error("no"));
  const { container } = render(<TeamInviteKit {...props} users={[]} />);
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: /copy invite message/i }),
    );
  });
  expect(screen.getByText(/couldn't copy automatically/i)).toBeInTheDocument();
  expect(container.querySelector("details").open).toBe(true);
});
