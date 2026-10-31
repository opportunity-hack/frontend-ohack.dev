import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";

// Logged-out visitor: the panel renders read-only and skips its mentor check.
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ user: null, accessToken: null, isLoggedIn: false }),
}));

import MentorTeamPanelDemo from "../MentorTeamPanelDemo";

// #412 — the judging-readiness rubric shows each criterion's CURRENT state as
// a recency-weighted blend of every mentor's latest rating (rounded to the
// closest score), with every counted rating and its weight beside it, a stale
// hint for an old picture during a live event, and the replaced ratings on
// demand. The demo team is seeded with exactly these cases.
describe("MentorTeamPanel judging readiness (#412)", () => {
  const rowFor = (label) => {
    const heading = screen.getByText(label, { selector: "h6, span, p" });
    return heading.closest(".MuiPaper-root");
  };

  beforeEach(() => {
    render(<MentorTeamPanelDemo />);
  });

  it("explains the rule in plain language", () => {
    expect(
      screen.getByText(/Each mentor.s latest rating counts, weighted toward/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Worst rating wins/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/newest rating is/i)).not.toBeInTheDocument();
  });

  it("blends two mentors' ratings and shows each one with its weight", () => {
    const row = rowFor("Documentation");
    // Jasmine's green (45m ago) outweighs Greg's yellow (8h ago) → green.
    expect(
      within(row).getByText(/🟢 On track · 2 ratings/),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(/🟢 Jasmine T\. · 45m ago · 78%/),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(/🟡 Greg V\. · 8h ago · 22%/),
    ).toBeInTheDocument();
    expect(within(row).queryByText(/Consensus/)).not.toBeInTheDocument();
  });

  it("lands a fresh disagreement on Needs attention instead of picking a side", () => {
    const row = rowFor("Polish");
    expect(
      within(row).getByText(/🟡 Needs attention · 2 ratings/),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(/🔴 Sai M\. · 2h ago · 54%/),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(/🟢 Greg V\. · 3h ago · 46%/),
    ).toBeInTheDocument();
  });

  it("asks for a fresh look when the newest rating is hours old", () => {
    const security = rowFor("Security");
    // A single rating keeps the when/who on the main chip, no weight chips.
    expect(
      within(security).getByText(/🔴 At risk · 8h ago · Greg V\./),
    ).toBeInTheDocument();
    expect(within(security).queryByText(/%/)).not.toBeInTheDocument();
    expect(
      within(security).getByText(/Last rated 8h ago — worth a fresh look/),
    ).toBeInTheDocument();
    const scope = rowFor("Scope");
    expect(
      within(scope).queryByText(/worth a fresh look/),
    ).not.toBeInTheDocument();
  });

  it("keeps a mentor's replaced rating one click away, marked as not counting", () => {
    const row = rowFor("Documentation");
    const toggle = within(row).getByRole("button", {
      name: /Show history \(3\)/,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    const list = within(row).getByRole("list", {
      name: /Documentation rating history, newest first/,
    });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent(
      /On track.*45m ago · Jasmine T\. · counts 78%/,
    );
    expect(items[1]).toHaveTextContent(
      /Needs attention.*8h ago · Greg V\. · counts 22%/,
    );
    expect(items[2]).toHaveTextContent(
      /At risk.*20h ago · Greg V\. · replaced by their later rating/,
    );
    // Criteria where nobody re-rated have nothing hidden, so no disclosure.
    expect(
      within(rowFor("Polish")).queryByRole("button", { name: /history/ }),
    ).not.toBeInTheDocument();
  });
});
