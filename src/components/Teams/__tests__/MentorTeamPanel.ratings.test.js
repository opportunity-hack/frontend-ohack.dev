import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";

// Logged-out visitor: the panel renders read-only and skips its mentor check.
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ user: null, accessToken: null, isLoggedIn: false }),
}));

import MentorTeamPanelDemo from "../MentorTeamPanelDemo";

// #412 — the judging-readiness rubric shows the CURRENT (newest) rating with
// when/who, the rating it replaced, a stale hint for old ratings during a
// live event, and the full per-criterion history on demand. The demo team
// is seeded with exactly these cases (see MentorTeamPanelDemo).
describe("MentorTeamPanel judging readiness (#412)", () => {
  const rowFor = (label) => {
    const heading = screen.getByText(label, { selector: "h6, span, p" });
    // The criterion's Paper card is the nearest ancestor with the outlined
    // Paper class; walking up two levels from the title lands on it.
    return heading.closest(".MuiPaper-root");
  };

  beforeEach(() => {
    render(<MentorTeamPanelDemo />);
  });

  it("explains the rule in plain language", () => {
    expect(
      screen.getByText(/The newest rating is the team.s current state/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Worst rating wins/i)).not.toBeInTheDocument();
  });

  it("shows the newer mentor's rating as current and the older one as history", () => {
    const row = rowFor("Documentation");
    // Jasmine's green (45m ago) supersedes Greg's yellow (8h ago).
    expect(
      within(row).getByText(/🟢 On track · 45m ago · Jasmine T\./),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(/↑ was 🟡 8h ago · Greg V\./),
    ).toBeInTheDocument();
    expect(within(row).queryByText(/Consensus/)).not.toBeInTheDocument();
  });

  it("asks for a fresh look when the current rating is hours old", () => {
    const security = rowFor("Security");
    expect(
      within(security).getByText(/🔴 At risk · 8h ago · Greg V\./),
    ).toBeInTheDocument();
    expect(
      within(security).getByText(/Last rated 8h ago — worth a fresh look/),
    ).toBeInTheDocument();
    // A 3h-old rating is still fresh enough.
    const scope = rowFor("Scope");
    expect(
      within(scope).queryByText(/worth a fresh look/),
    ).not.toBeInTheDocument();
  });

  it("reveals the full trajectory on demand, newest first", () => {
    const row = rowFor("Documentation");
    const toggle = within(row).getByRole("button", {
      name: /Show history \(2\)/,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    const list = within(row).getByRole("list", {
      name: /Documentation rating history, newest first/,
    });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/On track.*45m ago · Jasmine T\. · current/);
    expect(items[1]).toHaveTextContent(/Needs attention.*8h ago · Greg V\./);
    expect(items[1]).not.toHaveTextContent(/current/);
    // Criteria with a single rating have no history disclosure.
    expect(
      within(rowFor("Security")).queryByRole("button", { name: /history/ }),
    ).not.toBeInTheDocument();
  });
});
