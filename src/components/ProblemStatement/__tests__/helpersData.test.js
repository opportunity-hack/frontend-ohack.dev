import {
  normalizeHelpers,
  groupHelpersByType,
  countHelpers,
  helperDisplayName,
  helperInitials,
  formatSince,
  isSameHelper,
  findCurrentUserHelper,
  upsertHelper,
  removeHelper,
  helperProfileHref,
  slackChannelHref,
} from "../helpersData";

const RAW = [
  // Alice clicked twice (legacy append): one row, earliest timestamp kept
  { user: "alice", slack_user: "oauth2|slack|T-UA", type: "hacker", timestamp: "2025-05-31T01:36:06" },
  { user: "alice", slack_user: "oauth2|slack|T-UA", type: "hacker", timestamp: "2025-05-31T01:31:16" },
  // Bob switched hacker → mentor: latest type wins, since stays the first click
  { user: "bob", slack_user: "oauth2|google-oauth2|9", type: "hacker", timestamp: "2025-05-29T04:16:16" },
  { user: "bob", slack_user: "oauth2|google-oauth2|9", type: "mentor", timestamp: "2025-06-05T07:32:43" },
  // Legacy entry without a timestamp sorts last
  { user: "carol", slack_user: "oauth2|slack|T-UC", type: "hacker" },
  // Junk
  {}, null, "nope", { type: "mentor" },
];

describe("normalizeHelpers", () => {
  it("dedupes per person, keeps earliest since and latest type, oldest first", () => {
    const rows = normalizeHelpers(RAW);
    expect(rows.map((r) => r.db_id)).toEqual(["bob", "alice", "carol"]);
    const alice = rows.find((r) => r.db_id === "alice");
    expect(alice.since).toBe("2025-05-31T01:31:16");
    expect(alice.type).toBe("hacker");
    const bob = rows.find((r) => r.db_id === "bob");
    expect(bob.type).toBe("mentor");
    expect(bob.since).toBe("2025-05-29T04:16:16");
    expect(rows.find((r) => r.db_id === "carol").since).toBeNull();
    rows.forEach((r) => {
      expect(r).toEqual(expect.objectContaining({ name: null, nickname: null, profile_image: null }));
      expect(r).not.toHaveProperty("latest");
    });
  });

  it("returns [] for missing input", () => {
    expect(normalizeHelpers(undefined)).toEqual([]);
    expect(normalizeHelpers("x")).toEqual([]);
  });
});

describe("grouping and counting", () => {
  const rows = normalizeHelpers(RAW);
  it("splits developers and mentors; unknown types go to other", () => {
    const groups = groupHelpersByType([...rows, { db_id: "z", type: "designer" }]);
    expect(groups.hacker.map((r) => r.db_id)).toEqual(["alice", "carol"]);
    expect(groups.mentor.map((r) => r.db_id)).toEqual(["bob"]);
    expect(groups.other.map((r) => r.db_id)).toEqual(["z"]);
  });
  it("counts reflect the deduped rows, not the raw clicks", () => {
    expect(countHelpers(rows)).toEqual({ hacker: 2, mentor: 1, total: 3 });
    expect(countHelpers(undefined)).toEqual({ hacker: 0, mentor: 0, total: 0 });
  });
});

describe("display helpers", () => {
  it("falls back from name to nickname to a neutral label", () => {
    expect(helperDisplayName({ name: "Ada Lovelace" })).toBe("Ada Lovelace");
    expect(helperDisplayName({ name: " ", nickname: "ada" })).toBe("ada");
    expect(helperDisplayName({})).toBe("Community member");
    expect(helperInitials({ name: "Ada Byron Lovelace" })).toBe("AB");
    expect(helperInitials({})).toBe("?");
  });

  it("formatSince reads recent dates relatively and older ones as month + year", () => {
    const now = new Date("2025-06-10T12:00:00Z");
    expect(formatSince("2025-06-10T08:00:00Z", now)).toBe("today");
    expect(formatSince("2025-06-09T08:00:00Z", now)).toBe("1 day ago");
    expect(formatSince("2025-06-01T08:00:00Z", now)).toBe("9 days ago");
    expect(formatSince("2025-05-20T04:16:16Z", now)).toBe("May 2025");
    expect(formatSince("2024-12-31T23:00:00Z", now)).toMatch(/^(Dec 2024|Jan 2025)$/);
    expect(formatSince(null, now)).toBe("");
    expect(formatSince("garbage", now)).toBe("");
  });

  it("links to the Firestore db id, never the OAuth id", () => {
    expect(helperProfileHref({ db_id: "abc", user_id: "oauth2|slack|x" })).toBe("/profile/abc");
    expect(helperProfileHref({ user_id: "oauth2|slack|x" })).toBeNull();
    expect(slackChannelHref("npo-foo")).toBe(
      "https://opportunity-hack.slack.com/app_redirect?channel=npo-foo",
    );
    expect(slackChannelHref("")).toBeNull();
  });
});

describe("current-user matching and optimistic updates", () => {
  const rows = normalizeHelpers(RAW);
  const me = { id: "bob", user_id: "oauth2|google-oauth2|9" };

  it("matches on db id or OAuth id and ignores empty profiles", () => {
    expect(isSameHelper(rows[0], me)).toBe(true);
    expect(isSameHelper(rows[0], { user_id: "oauth2|google-oauth2|9" })).toBe(true);
    expect(isSameHelper(rows[0], { id: "someone-else" })).toBe(false);
    expect(isSameHelper(rows[0], {})).toBe(false);
    expect(findCurrentUserHelper(rows, me).type).toBe("mentor");
    expect(findCurrentUserHelper(rows, null)).toBeNull();
  });

  it("upsert keeps the original since when switching role, appends new people", () => {
    const switched = upsertHelper(rows, { db_id: "bob", type: "hacker", since: "2026-01-01T00:00:00" });
    const bob = switched.find((r) => r.db_id === "bob");
    expect(bob.type).toBe("hacker");
    expect(bob.since).toBe("2025-05-29T04:16:16");
    expect(switched).toHaveLength(3);

    const added = upsertHelper(rows, { db_id: "dave", type: "hacker", since: "2026-01-01T00:00:00", name: "Dave" });
    expect(added).toHaveLength(4);
    expect(added[3].name).toBe("Dave");
  });

  it("remove drops only the signed-in user", () => {
    expect(removeHelper(rows, me).map((r) => r.db_id)).toEqual(["alice", "carol"]);
    expect(removeHelper(rows, { id: "nobody" })).toHaveLength(3);
  });
});
