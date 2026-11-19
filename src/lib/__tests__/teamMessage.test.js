import {
  summarizeTeamMessageDelivery,
  teamMessageBlockedReason,
  teamMessagePayload,
} from "../teamMessage";

describe("teamMessagePayload", () => {
  it("sends subject only with email", () => {
    expect(
      teamMessagePayload({ message: " hi ", channels: { slack: true }, subject: "S" }),
    ).toEqual({ message: "hi", channels: { slack: true, email: false } });
    expect(
      teamMessagePayload({ message: "hi", channels: { email: true }, subject: " S " }),
    ).toEqual({ message: "hi", channels: { slack: false, email: true }, subject: "S" });
  });
});

describe("teamMessageBlockedReason", () => {
  it("needs a message and a channel", () => {
    expect(teamMessageBlockedReason({ message: " ", channels: { slack: true } })).toMatch(/message/);
    expect(teamMessageBlockedReason({ message: "x", channels: {} })).toMatch(/Pick/);
  });
  it("blocks Slack-only without a channel, allows email", () => {
    expect(
      teamMessageBlockedReason({ message: "x", channels: { slack: true }, slackChannel: "" }),
    ).toMatch(/no Slack channel/);
    expect(
      teamMessageBlockedReason({ message: "x", channels: { email: true }, slackChannel: "" }),
    ).toBeNull();
  });
});

describe("summarizeTeamMessageDelivery", () => {
  it("success on both channels", () => {
    expect(
      summarizeTeamMessageDelivery({
        delivery: {
          slack: { sent: true, channel: "rockets" },
          email: { sent: [{ name: "Ada" }, { name: "Cy" }], failed: [], missing_email: [] },
        },
      }),
    ).toEqual({ severity: "success", text: "Sent via Slack #rockets and 2 emails." });
  });

  it("warns about partial delivery", () => {
    const out = summarizeTeamMessageDelivery({
      delivery: {
        slack: { sent: false, error: "channel_not_found" },
        email: { sent: [{ name: "Ada" }], failed: [{ name: "Bo" }], missing_email: ["Cy"] },
      },
    });
    expect(out.severity).toBe("warning");
    expect(out.text).toContain("1 email");
    expect(out.text).toContain("Slack failed: channel_not_found");
    expect(out.text).toContain("email failed for Bo");
    expect(out.text).toContain("no email on file for Cy");
  });

  it("errors when nothing went out", () => {
    expect(
      summarizeTeamMessageDelivery({ delivery: { slack: { sent: false, error: "nope" } } }),
    ).toEqual({ severity: "error", text: "Message not sent — Slack failed: nope." });
  });
});
