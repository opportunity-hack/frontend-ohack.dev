jest.mock("../ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));

import { trackEvent } from "../ga";
import {
  joinTeam,
  leaveTeam,
  fetchHackerStatus,
  teamJoinBlockedReason,
  teamLeaveBlockedReason,
  addProfileToUsers,
  removeProfileFromUsers,
  userEntryMatchesProfile,
  humanizeMembershipError,
  TeamMembershipError,
  TEAM_REFUSAL_COPY,
  isMembershipRefusal,
} from "../teamMembershipApi";

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
});

describe("teamMembershipApi join/leave", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_SERVER_URL = "https://api.test";
    global.fetch = jest.fn();
  });

  it("joinTeam PATCHes /api/messages/team with the bearer token and fires GA", async () => {
    fetch.mockResolvedValue(jsonResponse({ message: "Joined Team" }));
    const res = await joinTeam({
      accessToken: "tok",
      teamId: "t1",
      eventId: "fall-2026",
      source: "team_page",
    });
    expect(res).toEqual({ message: "Joined Team", noop: false });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/api/messages/team");
    expect(init.method).toBe("PATCH");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual({ teamId: "t1" });
    expect(trackEvent).toHaveBeenCalledWith({
      action: "team_join",
      params: expect.objectContaining({
        event_category: "engagement",
        event_label: "team_page",
        event_id: "fall-2026",
        team_id: "t1",
      }),
    });
  });

  it("leaveTeam DELETEs and flags the already-not-on-team answer as a noop", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ message: "User was not in the team" }),
    );
    const res = await leaveTeam({ accessToken: "tok", teamId: "t1" });
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
    expect(res.noop).toBe(true);
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team_leave" }),
    );
  });

  it("treats the backend's HTTP 200 + 'Error: …' message as a failure", async () => {
    // services/teams_service.py returns Message("Error: User not found") with
    // a 200 — the event page used to report that as a successful join.
    fetch.mockResolvedValue(jsonResponse({ message: "Error: User not found" }));
    await expect(
      joinTeam({ accessToken: "tok", teamId: "t1" }),
    ).rejects.toMatchObject({
      name: "TeamMembershipError",
      message: expect.stringMatching(
        /couldn't find your opportunity hack profile/i,
      ),
    });
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("rejects on a non-2xx response", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ message: "nope" }, { ok: false, status: 500 }),
    );
    const err = await joinTeam({ accessToken: "tok", teamId: "t1" }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(TeamMembershipError);
    expect(err.status).toBe(500);
  });

  it("reads the legacy backend's real `text` field (vars(Message)), not just `message`", async () => {
    // The legacy route returns {text, metadata}; checking only `message`
    // missed every "Error: …" soft failure and every noop.
    fetch.mockResolvedValue(jsonResponse({ text: "Error: User not found" }));
    await expect(
      joinTeam({ accessToken: "tok", teamId: "t1" }),
    ).rejects.toMatchObject({ name: "TeamMembershipError", code: null });
    expect(trackEvent).not.toHaveBeenCalled();

    fetch.mockResolvedValue(jsonResponse({ text: "User was already in the team" }));
    await expect(
      joinTeam({ accessToken: "tok", teamId: "t1" }),
    ).resolves.toEqual({ message: "User was already in the team", noop: true });
  });

  it.each([
    ["event_ended", 409, /hackathon has ended/i],
    ["team_join_disabled", 409, /paused/i],
    ["team_inactive", 409, /isn't active/i],
    ["team_not_joinable", 409, /isn't taking new members/i],
    ["not_approved_hacker", 403, /approved hackers/i],
    ["team_not_found", 404, /no longer exists/i],
  ])("maps the server refusal %s (%i) to the blocked-reason copy", async (code, status, copy) => {
    fetch.mockResolvedValue(
      jsonResponse({ error: code, message: "server copy" }, { ok: false, status }),
    );
    const err = await joinTeam({ accessToken: "tok", teamId: "t1" }).catch((e) => e);
    expect(err).toBeInstanceOf(TeamMembershipError);
    expect(err.code).toBe(code);
    expect(err.status).toBe(status);
    expect(err.message).toMatch(copy);
    expect(isMembershipRefusal(err)).toBe(true);
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("refusal copy matches the client-side blocked reasons exactly", () => {
    expect(TEAM_REFUSAL_COPY.event_ended).toBe(teamJoinBlockedReason({ eventEnded: true }));
    expect(TEAM_REFUSAL_COPY.team_join_disabled).toBe(
      teamLeaveBlockedReason({ teamJoinEnabled: false }),
    );
    expect(TEAM_REFUSAL_COPY.team_inactive).toBe(teamJoinBlockedReason({ isActive: false }));
    expect(TEAM_REFUSAL_COPY.team_not_joinable).toBe(
      teamJoinBlockedReason({ isActive: true, status: "DEPLOYED" }),
    );
  });

  it("an unknown 4xx error code is a plain failure, not a refusal", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ error: "something_else", message: "nope" }, { ok: false, status: 400 }),
    );
    const err = await joinTeam({ accessToken: "tok", teamId: "t1" }).catch((e) => e);
    expect(err.code).toBeNull();
    expect(isMembershipRefusal(err)).toBe(false);
  });

  it("rejects without a token and never calls fetch", async () => {
    await expect(leaveTeam({ accessToken: "", teamId: "t1" })).rejects.toThrow(
      /log in/i,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("humanizes unknown backend errors with the action verb", () => {
    expect(humanizeMembershipError("Error: Firestore exploded", "leave")).toBe(
      "Couldn't leave the team: Firestore exploded",
    );
    expect(humanizeMembershipError("Error: Team not found", "join")).toBe(
      "This team no longer exists.",
    );
  });
});

describe("fetchHackerStatus", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_SERVER_URL = "https://api.test";
    global.fetch = jest.fn();
  });

  it.each([
    [{ data: { isSelected: true } }, "approved"],
    [{ data: { isSelected: false } }, "pending"],
    [{ data: null }, "none"],
    [{}, "none"],
  ])("maps %j to %s", async (body, expected) => {
    fetch.mockResolvedValue(jsonResponse(body));
    await expect(
      fetchHackerStatus({ accessToken: "tok", eventId: "fall-2026" }),
    ).resolves.toBe(expected);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://api.test/api/hacker/application/fall-2026",
    );
  });

  it("is 'none' on a non-OK response, a thrown fetch, or no token", async () => {
    fetch.mockResolvedValue(jsonResponse({}, { ok: false, status: 404 }));
    await expect(
      fetchHackerStatus({ accessToken: "tok", eventId: "e" }),
    ).resolves.toBe("none");
    fetch.mockRejectedValue(new Error("offline"));
    await expect(
      fetchHackerStatus({ accessToken: "tok", eventId: "e" }),
    ).resolves.toBe("none");
    await expect(
      fetchHackerStatus({ accessToken: null, eventId: "e" }),
    ).resolves.toBe("none");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe("blocked reasons", () => {
  it.each(["IN_REVIEW", "APPROVING"])(
    "keeps a team waiting for review joinable even though it's saved inactive (%s)",
    (status) => {
      expect(
        teamJoinBlockedReason({ isActive: false, teamJoinEnabled: true, status }),
      ).toBeNull();
    },
  );

  it("orders event ended → joining paused → inactive → status", () => {
    expect(
      teamJoinBlockedReason({
        eventEnded: true,
        teamJoinEnabled: false,
        isActive: false,
        status: "ONBOARDED",
      }),
    ).toMatch(/has ended/);
    expect(
      teamJoinBlockedReason({
        eventEnded: false,
        teamJoinEnabled: false,
        isActive: false,
        status: "ONBOARDED",
      }),
    ).toMatch(/paused/);
    expect(
      teamJoinBlockedReason({
        eventEnded: false,
        teamJoinEnabled: true,
        isActive: false,
        status: "ONBOARDED",
      }),
    ).toMatch(/isn't active/);
    expect(
      teamJoinBlockedReason({
        eventEnded: false,
        teamJoinEnabled: true,
        isActive: true,
        status: "ONBOARDED",
      }),
    ).toMatch(/isn't taking new members/);
    expect(
      teamJoinBlockedReason({
        eventEnded: false,
        isActive: true,
        status: "NONPROFIT_SELECTED",
      }),
    ).toBeNull();
  });

  it("leave is only blocked by the event ending or joining being paused", () => {
    expect(teamLeaveBlockedReason({ eventEnded: true })).toMatch(/has ended/);
    expect(
      teamLeaveBlockedReason({ eventEnded: false, teamJoinEnabled: false }),
    ).toMatch(/paused/);
    expect(teamLeaveBlockedReason({ eventEnded: false })).toBeNull();
  });
});

describe("optimistic roster helpers", () => {
  const profile = {
    id: "db1",
    user_id: "oauth2|slack|T-U1",
    name: "Ada",
    nickname: "ada",
    profile_image: "https://cdn/x.png",
  };

  it("matches both id-string and enriched-object entries", () => {
    expect(userEntryMatchesProfile("db1", profile)).toBe(true);
    expect(userEntryMatchesProfile("oauth2|slack|T-U1", profile)).toBe(true);
    expect(userEntryMatchesProfile({ id: "db1" }, profile)).toBe(true);
    expect(
      userEntryMatchesProfile({ user_id: "oauth2|slack|T-U1" }, profile),
    ).toBe(true);
    expect(userEntryMatchesProfile({ id: "other" }, profile)).toBe(false);
    expect(userEntryMatchesProfile("db1", null)).toBe(false);
  });

  it("adds the profile once as a slim roster object and removes it by either id", () => {
    const once = addProfileToUsers([{ id: "db2", name: "Bo" }], profile);
    expect(once).toHaveLength(2);
    expect(once[1]).toEqual({
      id: "db1",
      user_id: "oauth2|slack|T-U1",
      name: "Ada",
      nickname: "ada",
      profile_image: "https://cdn/x.png",
    });
    expect(addProfileToUsers(once, profile)).toBe(once);
    expect(removeProfileFromUsers(once, profile)).toEqual([
      { id: "db2", name: "Bo" },
    ]);
    expect(removeProfileFromUsers(["db1", "db2"], profile)).toEqual(["db2"]);
    expect(addProfileToUsers(undefined, { name: "no id" })).toEqual([]);
  });
});
