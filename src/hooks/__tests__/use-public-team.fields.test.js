/**
 * The refocus refetch must carry what teammates edit on the dashboard
 * (write-up, demo video, DevPost) back into the page — a dashboard left
 * open used to keep, and then save over, an old version.
 */
import { isLiveTeamField } from "../use-public-team";

it("refreshes mentor, write-up and link fields — nothing else", () => {
  [
    "mentor_checklist",
    "project_story",
    "project_field_meta",
    "project_submission_status",
    "demo_video_url",
    "devpost_link",
  ].forEach((key) => expect(isLiveTeamField(key)).toBe(true));
  ["name", "status", "users", "slack_channel", "github_links"].forEach((key) =>
    expect(isLiveTeamField(key)).toBe(false),
  );
});
