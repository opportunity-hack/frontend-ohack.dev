import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("../MentorAvailabilityToggle", () => () => null);

import MentorSupportCard from "../MentorSupportCard";

// Team-facing mirror: each item says how many of the 3 mentors have checked
// it, instead of a bare ○ until all three are in. Sign-offs over 5h old are
// stale and named as such.
const ago = (hours) => new Date(Date.now() - hours * 3_600_000).toISOString();
const check = (name, hours = 0.5) => ({ name, checked_at: ago(hours) });
const team = {
  id: "t1",
  mentor_checklist: {
    intro_made: {
      checks: { a: check("A"), b: check("B"), c: check("C") },
    },
    scope_reviewed: { checks: { a: check("A"), b: check("B") } },
    architecture_discussed: { checks: { a: check("A") } },
    repo_health_checked: { checks: { a: check("A", 7) } },
  },
};

describe("MentorSupportCard coverage", () => {
  it("shows per-item mentor counts, stale checks and the overall share", () => {
    render(<MentorSupportCard team={team} eventId="fall-2026" />);
    expect(
      screen.getByText(/33% signed off · 3 mentors · 1 stale/),
    ).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getAllByText("0/3")).toHaveLength(3);
    expect(screen.getByText(/· 1 stale$/)).toBeInTheDocument();
    expect(screen.queryByText("○")).not.toBeInTheDocument();
  });

  it("reads 'No sign-offs yet' for a fresh team", () => {
    render(<MentorSupportCard team={{ id: "t2" }} eventId="fall-2026" />);
    expect(screen.getByText("No sign-offs yet")).toBeInTheDocument();
    expect(screen.getAllByText("0/3")).toHaveLength(6);
  });
});
