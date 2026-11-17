import { checkinText, engagementCsv, formatWhen } from "../MentorEngagementPanel";

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
    expect(header.startsWith('"Rank","Name","Email","Level"')).toBe(true);
    expect(row).toContain('"Ann ""A"" Lee"');
    expect(row).toContain('"Engaged"');
    expect(row.endsWith('"T1; T2"')).toBe(true);
  });
});
