/**
 * The Teammates step's two paths: Slack users are on the team at creation,
 * typed names are only an invite-list reminder (they join from the team page).
 */
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import TeamMemberManager from "../TeamMemberManager";

const SAM = { id: "U1", real_name: "Sam Rivera", name: "sam" };

function setup(teamMembers = [], extra = {}) {
  const onAddMember = jest.fn(() => null);
  const onRemoveMember = jest.fn();
  render(
    <TeamMemberManager
      teamMembers={teamMembers}
      onAddMember={onAddMember}
      onRemoveMember={onRemoveMember}
      slackUsers={[SAM]}
      slackUsersStatus="ready"
      slackChannel="byte-club"
      eventId="fall-2026"
      {...extra}
    />,
  );
  return { onAddMember, onRemoveMember };
}

it("labels Slack picks 'Added now' and typed names 'Joins later'", () => {
  setup([SAM, "Priya"]);
  const now = screen.getByRole("list", { name: /added to the team now/i });
  expect(now).toHaveTextContent("Sam Rivera");
  expect(now).toHaveTextContent(/added now · #byte-club/i);
  const later = screen.getByRole("list", { name: /joining later/i });
  expect(later).toHaveTextContent("Priya");
  expect(later).toHaveTextContent(/joins later/i);
});

it("adds a typed name to the invite list with the button or Enter", () => {
  const { onAddMember } = setup();
  const input = screen.getByLabelText(/teammate's name/i);
  fireEvent.change(input, { target: { value: "Priya" } });
  fireEvent.click(screen.getByRole("button", { name: /add to invite list/i }));
  expect(onAddMember).toHaveBeenCalledWith("Priya");
  fireEvent.change(input, { target: { value: "Jo" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onAddMember).toHaveBeenCalledWith("Jo");
});

it("shows a duplicate message from the page next to the field", () => {
  const onAddMember = jest.fn(() => "Priya is already on your list.");
  render(
    <TeamMemberManager
      teamMembers={["Priya"]}
      onAddMember={onAddMember}
      onRemoveMember={jest.fn()}
      slackUsers={[]}
      slackUsersStatus="ready"
      slackChannel="byte-club"
      eventId="fall-2026"
    />,
  );
  fireEvent.change(screen.getByLabelText(/teammate's name/i), {
    target: { value: "priya" },
  });
  fireEvent.click(screen.getByRole("button", { name: /add to invite list/i }));
  expect(
    screen.getByText("Priya is already on your list."),
  ).toBeInTheDocument();
});

it("removes the right teammate", () => {
  const { onRemoveMember } = setup([SAM, "Priya"]);
  const later = screen.getByRole("list", { name: /joining later/i });
  fireEvent.click(within(later).getByRole("button", { name: /remove priya/i }));
  expect(onRemoveMember).toHaveBeenCalledWith(1);
});

it("says so when the Slack directory couldn't load", () => {
  setup([], { slackUsersStatus: "error", slackUsers: [] });
  expect(
    screen.getByText(/couldn't load the slack directory/i),
  ).toBeInTheDocument();
});
