import {
  SLACK_WORKSPACE_ID,
  KEY_CHANNELS,
  slackChannelUrl,
  slackArchiveUrl,
} from "../slackLinks";

describe("slackLinks", () => {
  it("exposes the workspace id and the well-known channel ids", () => {
    expect(SLACK_WORKSPACE_ID).toBe("opportunity-hack");
    expect(KEY_CHANNELS).toEqual({
      introductions: "C01EY49JV8U",
      askAMentor: "C01E5CGDQ74",
      random: "C06BRHRS5BQ",
    });
  });

  describe("slackChannelUrl", () => {
    it("builds an app_redirect link from a channel id", () => {
      expect(slackChannelUrl(KEY_CHANNELS.askAMentor)).toBe(
        "https://opportunity-hack.slack.com/app_redirect?channel=C01E5CGDQ74"
      );
    });

    it("builds an app_redirect link from a channel name (a team's slack_channel)", () => {
      expect(slackChannelUrl("2026-fall-team-42")).toBe(
        "https://opportunity-hack.slack.com/app_redirect?channel=2026-fall-team-42"
      );
    });

    it("returns null for a missing/blank channel", () => {
      expect(slackChannelUrl(null)).toBeNull();
      expect(slackChannelUrl(undefined)).toBeNull();
      expect(slackChannelUrl("")).toBeNull();
      expect(slackChannelUrl("   ")).toBeNull();
    });

    it("url-encodes special characters", () => {
      expect(slackChannelUrl("team #1")).toBe(
        "https://opportunity-hack.slack.com/app_redirect?channel=team%20%231"
      );
    });
  });

  describe("slackArchiveUrl", () => {
    it("builds a direct archives link from a channel id", () => {
      expect(slackArchiveUrl(KEY_CHANNELS.introductions)).toBe(
        "https://opportunity-hack.slack.com/archives/C01EY49JV8U"
      );
    });

    it("returns null for a missing channel id", () => {
      expect(slackArchiveUrl(null)).toBeNull();
      expect(slackArchiveUrl("")).toBeNull();
    });
  });
});
