import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MentorTeamsTable from "../MentorTeamsTable";

// The Coverage column used to be "0/6" for a team two mentors had signed off
// end to end (every item at 2 of 3). It now shows the share of all 18
// sign-offs + the mentor count, with the per-item meter beside it, and a
// "Least covered" sort so a mentor can find the team that needs them.
// Sign-offs over 5h old are stale (frontend clock, so timestamps are
// relative to now).
const ago = (hours) => new Date(Date.now() - hours * 3_600_000).toISOString();
const check = (name, hours = 0.5) => ({ name, checked_at: ago(hours) });
const two = { gina: check("Gina Vannoni"), greg: check("Greg V") };
const twoStale = { gina: check("Gina Vannoni", 7), greg: check("Greg V", 8) };
const teams = [
  {
    id: "t-both",
    name: "The Ginas",
    active: "True",
    mentor_checklist: Object.fromEntries(
      [
        "intro_made",
        "scope_reviewed",
        "architecture_discussed",
        "repo_health_checked",
        "criteria_walkthrough",
        "demo_devpost_reviewed",
      ].map((slug) => [slug, { checks: two }]),
    ),
    mentor_last_touched_at: "2026-10-30T22:27:27",
  },
  {
    id: "t-none",
    name: "Nah Bro",
    active: "True",
    mentor_checklist: {},
  },
  {
    id: "t-one",
    name: "The Cool Team",
    active: "True",
    mentor_checklist: { intro_made: { checks: { gina: check("Gina") } } },
    mentor_last_touched_at: "2026-10-30T20:00:00",
  },
  {
    // Signed off end to end yesterday — every recurring sign-off is stale.
    id: "t-stale",
    name: "Zzz Yesterday",
    active: "True",
    mentor_checklist: Object.fromEntries(
      [
        "scope_reviewed",
        "architecture_discussed",
        "repo_health_checked",
        "demo_devpost_reviewed",
      ].map((slug) => [slug, { checks: twoStale }]),
    ),
    mentor_last_touched_at: ago(7),
  },
];

describe("MentorTeamsTable coverage column", () => {
  it("shows the share of sign-offs and mentor count, never X/6", () => {
    render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);
    expect(screen.getAllByText("67% · 2 mentors").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6% · 1 mentor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
    expect(screen.queryByText(/^\d\/6$/)).not.toBeInTheDocument();
    expect(
      screen.getAllByTitle(
        "12 of 18 sign-offs in the last 5h (6 items × 3 mentors each) from 2 mentors · 0 of 6 items fully covered",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("counts yesterday's sign-offs as stale and flags the team as needing attention", () => {
    render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);
    expect(screen.getAllByText("0% · 8 stale").length).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle(
        /0 of 18 sign-offs in the last 5h .* from no mentors yet · 8 older sign-offs over 5h old need a fresh check/,
      ).length,
    ).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Needs attention/ }));
    const names = screen
      .getAllByText(/^(The Ginas|Nah Bro|The Cool Team|Zzz Yesterday)$/)
      .map((el) => el.textContent);
    expect(names).toContain("Zzz Yesterday");
    expect(names).toContain("Nah Bro"); // never touched
    expect(names).not.toContain("The Ginas"); // fresh end to end
  });

  it("can sort least-covered teams first", () => {
    render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);
    fireEvent.change(screen.getByLabelText("Sort teams"), {
      target: { value: "coverage" },
    });
    // getAllByText returns DOM order — the rendered row order.
    const names = screen
      .getAllByText(/^(The Ginas|Nah Bro|The Cool Team|Zzz Yesterday)$/)
      .map((el) => el.textContent);
    expect(names.indexOf("Nah Bro")).toBeLessThan(
      names.indexOf("The Cool Team"),
    );
    expect(names.indexOf("Zzz Yesterday")).toBeLessThan(
      names.indexOf("The Cool Team"),
    );
    expect(names.indexOf("The Cool Team")).toBeLessThan(
      names.indexOf("The Ginas"),
    );
  });
});
