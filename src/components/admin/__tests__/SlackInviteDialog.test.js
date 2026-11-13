import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SlackInviteDialog from "../SlackInviteDialog";

// The dialog's styled() blocks read theme.palette, as they do under the app theme.
const theme = createTheme();

const volunteers = [
  {
    id: "v1",
    name: "Ada On Slack",
    email: "ada@example.com",
    isSelected: true,
    slack_user_id: "U1",
  },
  {
    id: "v2",
    name: "Grace Joined Later",
    email: "grace@example.com",
    isSelected: true,
  },
  {
    id: "v3",
    name: "Linus Not Yet",
    email: "linus@example.com",
    isSelected: true,
  },
  {
    id: "v4",
    name: "Pending Pat",
    email: "pat@example.com",
    isSelected: false,
  },
];

const renderDialog = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SlackInviteDialog
        open
        onClose={jest.fn()}
        volunteers={volunteers}
        volunteerType="mentors"
        accessToken="tok"
        orgId="org"
        {...props}
      />
    </ThemeProvider>,
  );

describe("SlackInviteDialog Slack re-check", () => {
  it("re-checks on open and makes people who joined Slack later invitable", async () => {
    const onRefresh = jest.fn().mockResolvedValue({
      ok: true,
      updated: [{ id: "v2", name: "Grace Joined Later", slack_user_id: "U2" }],
      unmatched: [{ id: "v3" }],
    });

    renderDialog({ onRefresh });

    expect(
      screen.getByText(/Checking for people who joined Slack/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Found 1 person who joined Slack since\s+applying: Grace Joined Later/,
      ),
    ).toBeInTheDocument();
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Grace Joined Later (U2)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Invite 2 Users/ }),
    ).toBeInTheDocument();
    // Linus is on the roster but still not on Slack; Pat isn't on the roster.
    expect(
      screen.getByRole("button", {
        name: /1 on the roster\s+isn't on Slack yet/,
      }),
    ).toBeInTheDocument();
  });

  it("never claims a result when the check fails, and offers a retry", async () => {
    const onRefresh = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        error: "Slack couldn't be reached, so nothing was changed.",
      })
      .mockResolvedValueOnce({ ok: true, updated: [], unmatched: [] });

    renderDialog({ onRefresh });

    expect(
      await screen.findByText(/Slack couldn't be reached/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/who joined Slack since/),
    ).not.toBeInTheDocument();
    // The last saved status still works.
    expect(
      screen.getByRole("button", { name: /Invite 1 Users/ }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        screen.queryByText(/Slack couldn't be reached/),
      ).not.toBeInTheDocument(),
    );
  });

  it("lists roster people who are not on Slack and works without onRefresh", () => {
    renderDialog();

    expect(screen.queryByText(/Checking for people/)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: /2 on the roster\s+aren't on Slack yet/,
      }),
    );
    expect(screen.getByText("grace@example.com")).toBeInTheDocument();
    expect(screen.getByText("linus@example.com")).toBeInTheDocument();
    expect(screen.queryByText("pat@example.com")).not.toBeInTheDocument();
  });
});
