import {
  buildInviteMessage,
  isSlackLogin,
  loadPendingTeammates,
  savePendingTeammates,
  splitTeammates,
  stillToJoin,
} from "../teamInvite";

describe("splitTeammates", () => {
  it("Slack users are added now; typed names join later", () => {
    const sam = { id: "U1", real_name: "Sam Rivera", name: "sam" };
    expect(splitTeammates([sam, " Priya ", "", null])).toEqual({
      onSlack: [sam],
      joinLater: ["Priya"],
    });
  });
});

describe("isSlackLogin", () => {
  it("reads the OAuth provider from the own-profile user_id", () => {
    expect(isSlackLogin({ user_id: "oauth2|slack|T1-U1" })).toBe(true);
    expect(isSlackLogin({ user_id: "oauth2|google-oauth2|123" })).toBe(false);
    expect(isSlackLogin(null)).toBe(false);
  });
});

describe("buildInviteMessage", () => {
  it("walks a teammate through Slack → log in with Slack → application → Join", () => {
    const msg = buildInviteMessage({
      teamName: "Byte Club",
      eventTitle: "Opportunity Hack Fall 2026",
      eventId: "fall-2026",
      teamId: "t1",
      slackChannel: "byte-club",
      origin: "https://www.ohack.dev",
    });
    expect(msg).toMatch(/Join "Byte Club" for Opportunity Hack Fall 2026/);
    expect(msg).toMatch(/https:\/\/www\.ohack\.dev\/signup/);
    expect(msg).toMatch(/Sign in with Slack.*#byte-club/);
    expect(msg).toMatch(/\/hack\/fall-2026\/hacker-application/);
    expect(msg).toMatch(/https:\/\/www\.ohack\.dev\/hack\/fall-2026\/team\/t1/);
  });
});

describe("stillToJoin", () => {
  it("drops a reminder once someone with that name (or first name) is on the roster", () => {
    const roster = [{ name: "Sam Rivera" }, { nickname: "Jo" }];
    expect(stillToJoin(["Sam", "sam rivera", "Jo", "Priya"], roster)).toEqual([
      "Priya",
    ]);
  });
});

describe("pending teammates storage", () => {
  beforeEach(() => localStorage.clear());
  it("round-trips per Slack channel and clears when empty", () => {
    savePendingTeammates("#byte-club", ["Priya"]);
    expect(loadPendingTeammates("byte-club")).toEqual(["Priya"]);
    savePendingTeammates("byte-club", []);
    expect(loadPendingTeammates("byte-club")).toEqual([]);
  });
  it("tolerates junk in storage", () => {
    localStorage.setItem("ohx.team.pendingTeammates.x", "{not json");
    expect(loadPendingTeammates("x")).toEqual([]);
  });
});
