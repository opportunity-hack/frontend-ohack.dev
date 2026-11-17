import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  EngagementScoreChip,
  MentorEngagementDialog,
  checkinText,
  engagementCsv,
  formatWhen,
} from "../MentorEngagementPanel";

const ROW = {
  volunteer_id: "v1", name: "Ann Lee", level: "engaged", rank: 1, score: 17,
  score_breakdown: [
    { label: "Mentor panel actions", detail: "6 x 1", points: 6 },
    { label: "Teams helped", detail: "2 x 2", points: 4 },
  ],
  checked_in: true, self_checkin_count: 1, checked_in_hours: 3.5,
  coverage_signoffs: 2, notes: 1, flags_raised: 1, flags_resolved: 1, ratings: 1,
  teams_helped: 2, teams: [{ id: "t1", name: "Team One" }, { id: "t2", name: "Team Two" }],
};

describe("engagement score chip + detail dialog", () => {
  it("shows the score and opens details on click", () => {
    const onClick = jest.fn();
    render(<EngagementScoreChip row={ROW} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Engagement score 17, Engaged/ }));
    expect(onClick).toHaveBeenCalled();
  });

  it("renders nothing without data", () => {
    const { container } = render(<EngagementScoreChip row={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("explains the score and links each team's mentor page", () => {
    render(
      <MentorEngagementDialog row={ROW} eventId="fall-2026" thresholds={{ min_actions: 5, min_teams: 1 }} onClose={() => {}} />,
    );
    expect(screen.getByText("Mentor panel actions (6 x 1)")).toBeInTheDocument();
    expect(screen.getByText("+6")).toBeInTheDocument();
    expect(screen.getByText(/Score 17 · rank #1/)).toBeInTheDocument();
    expect(screen.getByText("Team One").closest("a")).toHaveAttribute(
      "href", "/hack/fall-2026/team/t1/mentor",
    );
  });
});

describe("MentorEngagementPanel helpers", () => {
  it("describes check-ins", () => {
    expect(checkinText({ checked_in: false })).toBe("Not checked in");
    expect(
      checkinText({ checked_in: true, self_checkin_count: 2, checked_in_hours: 3.5, desk_checked_in: true }),
    ).toBe("2× · 3.5h · desk");
    expect(checkinText({ checked_in: true, self_checkin_count: 0, desk_checked_in: true })).toBe("desk");
  });

  it("handles missing timestamps", () => {
    expect(formatWhen(null)).toBe("—");
    expect(formatWhen("nope")).toBe("—");
  });

  it("builds a CSV with escaped values", () => {
    const csv = engagementCsv([
      { rank: 1, name: 'Ann "A" Lee', email: "a@x.org", level: "engaged", isSelected: true, checked_in: true,
        self_checkin_count: 1, checked_in_hours: 2, teams_helped: 2, panel_actions: 6,
        teams: [{ name: "T1" }, { name: "T2" }] },
    ]);
    const [header, row] = csv.split("\n");
    expect(header.startsWith('"Rank","Score","Name","Email","Level"')).toBe(true);
    expect(row).toContain('"Ann ""A"" Lee"');
    expect(row).toContain('"Engaged"');
    expect(row.endsWith('"T1; T2"')).toBe(true);
  });
});
