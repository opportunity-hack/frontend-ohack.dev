import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import SlackMessageComposer from "../SlackMessageComposer";
import slackMessageApi from "../../../lib/slackMessageApi";

jest.mock("../../../lib/ga", () => ({
  trackStructuredEvent: jest.fn(),
  EventCategory: { ADMIN: "admin" },
}));
jest.mock("../../../lib/slackMessageApi", () => {
  const actual = jest.requireActual("../../../lib/slackMessageApi");
  return {
    __esModule: true,
    ...actual,
    default: { listChannels: jest.fn(), send: jest.fn() },
  };
});

const theme = createTheme();
const MESSAGE =
  ":trophy: Update\n\nSee the <https://www.ohack.dev/about/completion|Definition of Done>.";

const setup = async (props = {}) => {
  const onSnack = jest.fn();
  render(
    <ThemeProvider theme={theme}>
      <SlackMessageComposer accessToken="tok" orgId="org" onSnack={onSnack} {...props} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(slackMessageApi.listChannels).toHaveBeenCalled());
  return { onSnack };
};

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  window.localStorage.clear();
  slackMessageApi.listChannels.mockReset().mockResolvedValue([
    { id: "C1", name: "general", is_private: false, is_member: true, num_members: 812 },
  ]);
  slackMessageApi.send.mockReset();
});

test("previews mrkdwn, confirms, sends and clears the editor", async () => {
  slackMessageApi.send.mockResolvedValue({
    channel: "#general",
    channel_id: "C1",
    permalink: "https://slack.example/p1",
    unverified: false,
  });
  const { onSnack } = await setup();

  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  type("Channel", "#General");
  type("Slack message", MESSAGE);

  const preview = screen.getByLabelText("Slack preview");
  expect(within(preview).getByRole("link", { name: "Definition of Done" })).toHaveAttribute(
    "href",
    "https://www.ohack.dev/about/completion",
  );
  expect(within(preview).getByRole("img", { name: "trophy" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Send to #general" }));
  const dialog = await screen.findByRole("dialog");
  expect(slackMessageApi.send).not.toHaveBeenCalled();
  expect(within(dialog).getByText("812 members")).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button", { name: "Send to #general" }));

  await waitFor(() =>
    expect(slackMessageApi.send).toHaveBeenCalledWith("tok", "org", {
      message: MESSAGE,
      channel: "general",
      toSelf: false,
      unfurlLinks: false,
    }),
  );
  await waitFor(() => expect(screen.getByLabelText("Slack message")).toHaveValue(""));
  expect(onSnack).toHaveBeenCalledWith("Posted to #general.", "success");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  // The success notice and the "Sent from this browser" row both link to it.
  const links = screen.getAllByRole("link", { name: /View in Slack/ });
  expect(links).toHaveLength(2);
  links.forEach((link) => expect(link).toHaveAttribute("href", "https://slack.example/p1"));
  expect(JSON.parse(window.localStorage.getItem("ohack.adminSlack.history"))).toHaveLength(1);
});

test("a refused send keeps the text and shows the reason", async () => {
  slackMessageApi.send.mockRejectedValue(new Error("The bot is not in that channel."));
  await setup();
  type("Channel", "general");
  type("Slack message", "hello");
  fireEvent.click(screen.getByRole("button", { name: "Send to #general" }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Send to #general" }));
  expect(await screen.findByText("The bot is not in that channel.")).toBeInTheDocument();
  expect(screen.getByLabelText("Slack message")).toHaveValue("hello");
});

test("test send goes to self without a channel and keeps the text", async () => {
  slackMessageApi.send.mockResolvedValue({ channel_id: "D1", permalink: null });
  const { onSnack } = await setup();
  type("Slack message", "hello");
  fireEvent.click(screen.getByRole("button", { name: "Send a test to me" }));
  await waitFor(() =>
    expect(slackMessageApi.send).toHaveBeenCalledWith(
      "tok",
      "org",
      expect.objectContaining({ toSelf: true }),
    ),
  );
  expect(screen.getByLabelText("Slack message")).toHaveValue("hello");
  await waitFor(() => expect(onSnack).toHaveBeenCalled());
});

test("pasted Markdown is flagged and fixed in one click", async () => {
  await setup();
  type("Slack message", "Read [the guide](https://ohack.dev/x) **now**");
  fireEvent.click(screen.getByRole("button", { name: "Fix formatting" }));
  expect(screen.getByLabelText("Slack message")).toHaveValue(
    "Read <https://ohack.dev/x|the guide> *now*",
  );
});

test("a failed channel list still lets a name be typed", async () => {
  slackMessageApi.listChannels.mockRejectedValue(
    Object.assign(new Error("nope"), { status: 404 }),
  );
  await setup();
  expect(await screen.findByText(/needs a newer backend/)).toBeInTheDocument();
  type("Channel", "announcements");
  type("Slack message", "hi");
  expect(screen.getByRole("button", { name: "Send to #announcements" })).toBeEnabled();
});
