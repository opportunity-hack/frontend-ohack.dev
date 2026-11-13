import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import TeamMembershipActions from "../TeamMembershipActions";

const baseProps = {
  eventId: "fall-2026",
  teamName: "Night Owls",
  slackChannel: "npo-night-owls",
  isLoggedIn: true,
  isOnTeam: false,
  membershipChecked: true,
  hackerStatus: "approved",
  joinBlockedReason: null,
  leaveBlockedReason: null,
  pending: null,
  error: null,
  result: null,
  onJoin: jest.fn(),
  onLeave: jest.fn(),
  onLogin: jest.fn(),
  onDismissFeedback: jest.fn(),
};

const renderActions = (overrides = {}) =>
  render(<TeamMembershipActions {...baseProps} {...overrides} />);

describe("TeamMembershipActions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("logged out: offers a login button (hidden when joining is blocked)", () => {
    renderActions({ isLoggedIn: false });
    fireEvent.click(screen.getByRole("button", { name: /log in to join/i }));
    expect(baseProps.onLogin).toHaveBeenCalled();

    renderActions({
      isLoggedIn: false,
      joinBlockedReason: "This hackathon has ended.",
    });
    expect(screen.getByText("This hackathon has ended.")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /log in to join/i }),
    ).toHaveLength(1);
  });

  it("waits for the membership check before showing any action", () => {
    renderActions({ membershipChecked: false });
    expect(screen.getByRole("status")).toHaveTextContent(
      /checking your team status/i,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("approved hacker: Join opens the confirmation modal; all three acks unlock Join", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: /^join team$/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/ready to join night owls/i);

    const confirm = within(dialog).getByRole("button", {
      name: /^join team$/i,
    });
    expect(confirm).toBeDisabled();
    within(dialog)
      .getAllByRole("checkbox")
      .forEach((box) => fireEvent.click(box));
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(baseProps.onJoin).toHaveBeenCalledTimes(1);
  });

  it("'Maybe later' closes the modal without joining", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: /^join team$/i }));
    fireEvent.click(screen.getByRole("button", { name: /maybe later/i }));
    expect(baseProps.onJoin).not.toHaveBeenCalled();
  });

  it("shows the join button busy while pending", () => {
    renderActions({ pending: "join" });
    const btn = screen.getByRole("button", { name: /joining/i });
    expect(btn).toBeDisabled();
  });

  it("blocked reason wins for non-members, whatever the hacker status", () => {
    renderActions({
      hackerStatus: "pending",
      joinBlockedReason: "This team isn't taking new members anymore.",
    });
    expect(screen.getByText(/isn't taking new members/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("pending / no application copy", () => {
    renderActions({ hackerStatus: "pending" });
    expect(screen.getByText(/awaiting confirmation/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();

    renderActions({ hackerStatus: "none" });
    expect(screen.getByText(/apply as a hacker/i)).toBeInTheDocument();
  });

  it("member: two-step leave, cancel keeps you on the team", () => {
    renderActions({ isOnTeam: true });
    expect(screen.getByText(/you're on this team/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^leave team$/i }));
    expect(baseProps.onLeave).not.toHaveBeenCalled();
    const group = screen.getByRole("group", { name: /leave night owls/i });
    expect(group).toHaveTextContent(/#npo-night-owls/);

    fireEvent.click(
      within(group).getByRole("button", { name: /stay on the team/i }),
    );
    expect(
      screen.queryByRole("group", { name: /leave night owls/i }),
    ).toBeNull();
    expect(baseProps.onLeave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^leave team$/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /yes, leave the team/i }),
    );
    expect(baseProps.onLeave).toHaveBeenCalledTimes(1);
  });

  it("member: leave is replaced by the reason when blocked", () => {
    renderActions({
      isOnTeam: true,
      leaveBlockedReason: "This hackathon has ended, so its teams are closed.",
    });
    expect(screen.getByText(/has ended/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /leave/i })).toBeNull();
  });

  it("success strip after joining links to the team's Slack channel", () => {
    renderActions({ isOnTeam: true, result: { action: "join", noop: false } });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/you're in/i);
    const link = within(status).getByRole("link", { name: /say hello/i });
    expect(link).toHaveAttribute(
      "href",
      "https://opportunity-hack.slack.com/app_redirect?channel=npo-night-owls",
    );
  });

  it("error strip is an alert and can be dismissed", () => {
    renderActions({ error: "Couldn't join the team: boom" });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/boom/);
    fireEvent.click(within(alert).getByRole("button", { name: /dismiss/i }));
    expect(baseProps.onDismissFeedback).toHaveBeenCalled();
  });

  it("non-member checklist: logged out → Slack, log in with Slack, application, join", () => {
    renderActions({ isLoggedIn: false, hackerStatus: "none" });
    const list = screen.getByRole("list", { name: /how to join night owls/i });
    const steps = within(list).getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveTextContent(/join the opportunity hack slack/i);
    // next/link is globally mocked to its children, so assert the copy.
    expect(steps[0]).toHaveTextContent(/how to join slack/i);
    expect(steps[1]).toHaveTextContent(/sign in with slack/i);
    expect(steps[1]).toHaveAttribute("aria-current", "step");
    fireEvent.click(
      within(steps[1]).getByRole("button", { name: /log in to join/i }),
    );
    expect(baseProps.onLogin).toHaveBeenCalled();
    expect(
      within(steps[3]).queryByRole("button", { name: /join team/i }),
    ).toBeNull();
  });

  it("non-member checklist: approved Slack login gets the Join button on step 4", () => {
    renderActions({
      isLoggedIn: true,
      hackerStatus: "approved",
      isSlackLogin: true,
    });
    const steps = within(
      screen.getByRole("list", { name: /how to join night owls/i }),
    ).getAllByRole("listitem");
    expect(steps[0]).toHaveTextContent(/you're on slack/i);
    expect(steps[3]).toHaveAttribute("aria-current", "step");
    fireEvent.click(
      within(steps[3]).getByRole("button", { name: /join team/i }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("non-member logged in without Slack is told to join the channel themselves", () => {
    renderActions({
      isLoggedIn: true,
      hackerStatus: "approved",
      isSlackLogin: false,
    });
    expect(screen.getByText(/logged in without slack/i)).toBeInTheDocument();
  });

  it("member sees the invite kit (copy invite message)", () => {
    renderActions({ isOnTeam: true, teamId: "t1" });
    expect(
      screen.getByRole("button", { name: /copy invite message/i }),
    ).toBeInTheDocument();
  });
});
