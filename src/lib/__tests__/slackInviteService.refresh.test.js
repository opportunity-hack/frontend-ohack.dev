import SlackInviteService from "../slackInviteService";

const service = () => new SlackInviteService("https://api.test", "tok", "org-1");
const respond = (status, body) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  });

describe("SlackInviteService.refreshSlackIds", () => {
  afterEach(() => {
    delete global.fetch;
  });

  it("posts the event and type with admin headers and returns the result", async () => {
    global.fetch = jest.fn(() =>
      respond(200, { success: true, checked: 3, updated: [{ id: "v1", slack_user_id: "U1" }], unmatched: [{ id: "v2" }] }),
    );

    const result = await service().refreshSlackIds("fall 2026", "mentor");

    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe("https://api.test/api/slack/admin/volunteers/fall%202026/refresh");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.headers["X-Org-Id"]).toBe("org-1");
    expect(JSON.parse(init.body)).toEqual({ volunteer_type: "mentor" });
    expect(result).toEqual({ checked: 3, updated: [{ id: "v1", slack_user_id: "U1" }], unmatched: [{ id: "v2" }] });
  });

  it.each([
    [404, /isn't available on this backend yet/],
    [502, /Slack couldn't be reached/],
    [500, /HTTP 500/],
  ])("throws on %s instead of reporting nobody found", async (status, message) => {
    global.fetch = jest.fn(() => respond(status, { success: false }));
    await expect(service().refreshSlackIds("ev", "judge")).rejects.toThrow(message);
  });

  it("throws on a network failure and on an unreadable body", async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(service().refreshSlackIds("ev")).rejects.toThrow(/reach the server/);

    global.fetch = jest.fn(() => respond(200, { success: true }));
    await expect(service().refreshSlackIds("ev")).rejects.toThrow(/read the Slack check result/);
  });
});

describe("SlackInviteService helpers", () => {
  const users = [
    { id: "a", isSelected: true, slack_user_id: "U1" },
    { id: "b", isSelected: true, slack_user_id: "  " },
    { id: "c", isSelected: true },
    { id: "d", isSelected: false },
  ];

  it("splits the roster into invitable and not-on-Slack", () => {
    expect(SlackInviteService.filterEligibleUsers(users).map((u) => u.id)).toEqual(["a"]);
    expect(SlackInviteService.filterRosterWithoutSlack(users).map((u) => u.id)).toEqual(["b", "c"]);
  });

  it("summarises a refresh in one line", () => {
    expect(SlackInviteService.refreshSummary({ updated: [{}, {}], unmatched: [{}] })).toBe(
      "Found 2 people who joined Slack · 1 still not on Slack",
    );
    expect(SlackInviteService.refreshSummary({ updated: [{}], unmatched: [] })).toBe(
      "Found 1 person who joined Slack",
    );
    expect(SlackInviteService.refreshSummary({ updated: [], unmatched: [{}, {}] })).toBe(
      "No new Slack members found · 2 still not on Slack",
    );
  });
});

describe("invite audit context", () => {
  afterEach(() => { delete global.fetch; });

  it("sends who is being invited along with the Slack id", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const service = new SlackInviteService("https://api.test", "tok", "org1");
    await service.inviteMultipleUsers(
      [{ id: "v1", name: "Ada L", email: "ada@example.com", volunteer_type: "judge", event_id: "ev1", slack_user_id: "U1", notes: "private" }],
      "fall-judges"
    );
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
      user_id: "U1", channel: "fall-judges", name: "Ada L", email: "ada@example.com",
      volunteer_id: "v1", volunteer_type: "judge", event_id: "ev1",
    });
  });

  it("leaves out empty fields and works with no person", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const service = new SlackInviteService("https://api.test", "tok", "org1");
    await service.inviteUser("U2", "c");
    await service.inviteUser("U3", "c", { name: " ", email: null });
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ user_id: "U2", channel: "c" });
    expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({ user_id: "U3", channel: "c" });
  });
});
