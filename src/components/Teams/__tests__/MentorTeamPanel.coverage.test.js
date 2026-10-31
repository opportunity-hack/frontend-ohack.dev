import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ user: null, accessToken: null, isLoggedIn: false }),
}));

import MentorTeamPanelDemo from "../MentorTeamPanelDemo";

// The demo team is seeded intro 3/3 (a once-item — age never matters),
// scope 1 fresh + 1 stale, architecture 1 stale (with a checked → cleared →
// checked history) from three mentors: 4 of 18 fresh sign-offs. The old
// header said "1 / 6 covered"; the headline now shows the share of FRESH
// sign-offs, who contributed and how many have gone stale, with the
// per-item meter beside it.
describe("MentorTeamPanel coverage headline", () => {
  beforeEach(() => {
    render(<MentorTeamPanelDemo />);
  });

  it("shows the share of fresh sign-offs, the mentor count and the stale count — never X/6", () => {
    expect(
      screen.getAllByText("22% signed off · 3 mentors · 2 stale").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/\/ 6 covered/)).not.toBeInTheDocument();
    expect(screen.getByText(/Coverage \(22%\)/)).toBeInTheDocument();
  });

  it("spells out what the percentage is a share of, including the 5h window", () => {
    expect(
      screen.getAllByText(
        /4 of 18 sign-offs in the last 5h \(6 items × 3 mentors each\) from 3 mentors · 2 older sign-offs over 5h old need a fresh check · 1 of 6 items fully covered/,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/A sign-off counts for 5 hours/),
    ).toBeInTheDocument();
  });

  it("renders one meter cell per item with its fresh count and stale count", () => {
    const meters = screen.getAllByRole("img", { name: /Mentor coverage:/ });
    expect(meters.length).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle("Mentor introductions made: 3 of 3 mentors").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle("Project scope reviewed: 1 of 3 mentors · 1 stale")
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle(
        "Architecture & tech stack discussed: 0 of 3 mentors · 1 stale",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle("GitHub repo reviewed: 0 of 3 mentors").length,
    ).toBeGreaterThan(0);
  });

  it("marks stale checks by name and age, and keeps the per-item count chip honest", () => {
    expect(screen.getByText(/Priya R\. · 18h ago · stale/)).toBeInTheDocument();
    expect(screen.getByText(/Greg V\. · 6h ago · stale/)).toBeInTheDocument();
    expect(screen.getByText("1/3 · 1 stale")).toBeInTheDocument();
    expect(screen.getByText("0/3 · 1 stale")).toBeInTheDocument();
    expect(screen.getByText("3/3 ✓")).toBeInTheDocument();
  });

  it("keeps every check and clear one click away in the item's history", () => {
    const toggle = screen.getByRole("button", { name: "History (3)" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Cleared · Sai M\./)).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Checked · Sai M\. · 9h ago/)).toBeInTheDocument();
    expect(screen.getByText(/Cleared · Sai M\. · 7h ago/)).toBeInTheDocument();
    expect(screen.getByText(/Checked · Greg V\. · 6h ago/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "History (2)" }),
    ).toBeInTheDocument();
  });
});
