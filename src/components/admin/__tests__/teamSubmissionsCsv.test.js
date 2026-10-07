import { buildSubmissionsCsv } from "../teamSubmissionsCsv";

const HEADER =
  "name,tagline,submission_status,submitted_at,demo_video_url,github_url,devpost_link,slack_channel,members,nonprofit";

describe("buildSubmissionsCsv", () => {
  it("returns just the header row for an empty team list", () => {
    expect(buildSubmissionsCsv([])).toBe(HEADER);
    expect(buildSubmissionsCsv(undefined)).toBe(HEADER);
  });

  it("renders a fully-populated team row", () => {
    const teams = [
      {
        name: "Team Rocket",
        project_tagline: "Blasting off again",
        project_submission_status: "submitted",
        project_submitted_at: "2026-10-11T15:00:00-07:00",
        demo_video_url: "https://youtu.be/abc123",
        github_links: [{ link: "https://github.com/ohack/team-rocket" }],
        devpost_link: "https://devpost.com/software/team-rocket",
        slack_channel: "team-rocket",
        team_members: [{ name: "Jessie" }, { real_name: "James" }, "Meowth"],
        selected_nonprofit_id: "npo1",
      },
    ];
    const csv = buildSubmissionsCsv(teams, { npo1: "Example Nonprofit" });
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(HEADER);
    expect(lines[1]).toBe(
      [
        "Team Rocket",
        "Blasting off again",
        "submitted",
        "2026-10-11T15:00:00-07:00",
        "https://youtu.be/abc123",
        "https://github.com/ohack/team-rocket",
        "https://devpost.com/software/team-rocket",
        "team-rocket",
        "Jessie; James; Meowth",
        "Example Nonprofit",
      ].join(","),
    );
  });

  it("leaves legacy teams with no submission fields blank rather than 'draft'", () => {
    const csv = buildSubmissionsCsv([{ name: "Legacy Team" }]);
    const [, row] = csv.split("\r\n");
    const cols = row.split(",");
    expect(cols[0]).toBe("Legacy Team");
    expect(cols[2]).toBe(""); // submission_status
  });

  it("quotes fields containing commas, quotes, or newlines per RFC 4180", () => {
    const csv = buildSubmissionsCsv([
      { name: 'Team "Alpha", Inc.', project_tagline: "Line one\nLine two" },
    ]);
    const [, row] = csv.split("\r\n");
    expect(row.startsWith('"Team ""Alpha"", Inc.","Line one\nLine two"')).toBe(
      true,
    );
  });

  it("handles a mixed string/object team_members array and a github string shape", () => {
    const csv = buildSubmissionsCsv([
      {
        name: "Mixed",
        team_members: [
          "Plain Name",
          { name: "Object Name" },
          { real_name: "" },
        ],
        github_links: ["https://github.com/ohack/mixed"],
      },
    ]);
    const [, row] = csv.split("\r\n");
    const cols = row.split(",");
    expect(cols[5]).toBe("https://github.com/ohack/mixed");
    expect(cols[8]).toBe("Plain Name; Object Name");
  });

  it("omits the nonprofit column value when the team has no assigned nonprofit", () => {
    const csv = buildSubmissionsCsv([{ name: "Solo" }], { npo1: "Example" });
    const [, row] = csv.split("\r\n");
    expect(row.split(",").pop()).toBe("");
  });
});
