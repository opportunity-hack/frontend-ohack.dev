import {
  ApiError,
  isSubmissionsClosed,
  isNotFound,
  isNotTeamMember,
  isInvalidProject,
  formatProjectErrors,
  getSubmissionWindow,
  saveTeamProject,
  submitTeamProject,
  saveTeamDevpost,
  saveTeamDemoVideo,
  setMentorAvailability,
  getGithubActivity,
  getPublicTeam,
  getHackerSelfStatus,
  getPeerVoteSlate,
  submitPeerVoteBallot,
  getPeerVoteSummary,
} from "../teamDashboardApi";

function mockFetchOnce({ ok = true, status = 200, body = null } = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    text: async () => (body === null ? "" : JSON.stringify(body)),
  });
  return global.fetch;
}

describe("teamDashboardApi", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  describe("ApiError", () => {
    it("carries status + body, preferring body.error for the message", () => {
      const err = new ApiError(409, {
        error: "submissions_closed",
        deadline: "x",
      });
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe("ApiError");
      expect(err.status).toBe(409);
      expect(err.body).toEqual({ error: "submissions_closed", deadline: "x" });
      expect(err.message).toBe("submissions_closed");
    });

    it("falls back to body.message, then a generic message", () => {
      expect(new ApiError(400, { message: "bad request" }).message).toBe(
        "bad request",
      );
      expect(new ApiError(500, null).message).toBe("Request failed (500)");
      expect(new ApiError(500, {}).message).toBe("Request failed (500)");
    });
  });

  describe("isSubmissionsClosed", () => {
    it("is true only for a 409 ApiError with error === 'submissions_closed'", () => {
      expect(
        isSubmissionsClosed(new ApiError(409, { error: "submissions_closed" })),
      ).toBe(true);
    });

    it("is false for other statuses, other error codes, or non-ApiError values", () => {
      expect(
        isSubmissionsClosed(new ApiError(403, { error: "submissions_closed" })),
      ).toBe(false);
      expect(
        isSubmissionsClosed(new ApiError(409, { error: "not_team_member" })),
      ).toBe(false);
      expect(isSubmissionsClosed(new Error("boom"))).toBe(false);
      expect(isSubmissionsClosed(null)).toBe(false);
    });
  });

  describe("isNotFound", () => {
    it("is true only for a 404 ApiError", () => {
      expect(isNotFound(new ApiError(404, null))).toBe(true);
    });

    it("is false for other statuses or non-ApiError values", () => {
      expect(isNotFound(new ApiError(400, null))).toBe(false);
      expect(isNotFound(new Error("boom"))).toBe(false);
      expect(isNotFound(undefined)).toBe(false);
    });
  });

  describe("isNotTeamMember", () => {
    it("is true only for a 403 ApiError with error === 'not_team_member'", () => {
      expect(
        isNotTeamMember(new ApiError(403, { error: "not_team_member" })),
      ).toBe(true);
    });

    it("is false for other statuses, other error codes, or non-ApiError values", () => {
      expect(
        isNotTeamMember(new ApiError(409, { error: "not_team_member" })),
      ).toBe(false);
      expect(
        isNotTeamMember(new ApiError(403, { error: "submissions_closed" })),
      ).toBe(false);
      expect(isNotTeamMember(new Error("boom"))).toBe(false);
      expect(isNotTeamMember(null)).toBe(false);
    });
  });

  describe("isInvalidProject", () => {
    it("is true only for a 400 ApiError with error === 'invalid_project'", () => {
      expect(
        isInvalidProject(
          new ApiError(400, { error: "invalid_project", errors: [] }),
        ),
      ).toBe(true);
    });

    it("is false for other statuses, other error codes, or non-ApiError values", () => {
      expect(
        isInvalidProject(new ApiError(404, { error: "invalid_project" })),
      ).toBe(false);
      expect(isInvalidProject(new ApiError(400, { error: "incomplete" }))).toBe(
        false,
      );
      expect(isInvalidProject(new Error("boom"))).toBe(false);
      expect(isInvalidProject(undefined)).toBe(false);
    });
  });

  describe("formatProjectErrors", () => {
    it("labels known fields and falls back to the raw field name for unknown ones", () => {
      expect(
        formatProjectErrors([
          { field: "project_thumbnail_url", reason: "must be an own-CDN URL" },
          { field: "project_weird_field", reason: "nope" },
        ]),
      ).toBe("Thumbnail: must be an own-CDN URL · project_weird_field: nope");
    });

    it("falls back to a generic message for empty/non-array input", () => {
      expect(formatProjectErrors([])).toBe("Couldn't save those changes.");
      expect(formatProjectErrors(undefined)).toBe(
        "Couldn't save those changes.",
      );
    });
  });

  describe("request wrappers — happy path", () => {
    it("getSubmissionWindow issues a plain GET to the submissions/window route", async () => {
      const fetchMock = mockFetchOnce({ body: { state: "open" } });
      const result = await getSubmissionWindow("2026_fall");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining("/api/hackathons/2026_fall/submissions/window"),
      );
      expect(opts.method).toBe("GET");
      expect(opts.headers.Authorization).toBeUndefined();
      expect(result).toEqual({ state: "open" });
    });

    it("saveTeamProject POSTs the payload as JSON with a bearer token", async () => {
      const fetchMock = mockFetchOnce({ body: { success: true } });
      await saveTeamProject("team1", { project_tagline: "Hi" }, "tok123");
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toEqual(expect.stringContaining("/api/team/team1/project"));
      expect(opts.method).toBe("POST");
      expect(opts.headers.Authorization).toBe("Bearer tok123");
      expect(opts.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(opts.body)).toEqual({ project_tagline: "Hi" });
    });

    it("submitTeamProject POSTs an empty body to the submit route", async () => {
      const fetchMock = mockFetchOnce({ body: { success: true } });
      await submitTeamProject("team1", "tok123");
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining("/api/team/team1/project/submit"),
      );
      expect(JSON.parse(opts.body)).toEqual({});
    });

    it("saveTeamDevpost / saveTeamDemoVideo wrap the value in the expected field name", async () => {
      let fetchMock = mockFetchOnce({ body: {} });
      await saveTeamDevpost("team1", "https://devpost.com/x", "tok");
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        devpost_link: "https://devpost.com/x",
      });

      fetchMock = mockFetchOnce({ body: {} });
      await saveTeamDemoVideo("team1", "https://youtu.be/x", "tok");
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        demo_video_url: "https://youtu.be/x",
      });
    });

    it("setMentorAvailability coerces its flag to a boolean", async () => {
      const fetchMock = mockFetchOnce({ body: {} });
      await setMentorAvailability("team1", 0, "tok");
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        open: false,
      });
    });

    it("getGithubActivity encodes org + repo as query params", async () => {
      const fetchMock = mockFetchOnce({ body: {} });
      await getGithubActivity("opportunity hack", "repo one");
      expect(fetchMock.mock.calls[0][0]).toEqual(
        expect.stringContaining(
          "/api/github/activity?org=opportunity%20hack&repo=repo%20one",
        ),
      );
    });

    it("getPublicTeam / getPeerVoteSummary issue unauthenticated GETs", async () => {
      let fetchMock = mockFetchOnce({ body: { team: {} } });
      await getPublicTeam("team1");
      expect(fetchMock.mock.calls[0][0]).toEqual(
        expect.stringContaining("/api/messages/team/team1"),
      );
      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();

      fetchMock = mockFetchOnce({ body: { published: false } });
      await getPeerVoteSummary("2026_fall");
      expect(fetchMock.mock.calls[0][0]).toEqual(
        expect.stringContaining("/api/hackathons/2026_fall/peer-vote/summary"),
      );
    });

    it("getHackerSelfStatus / getPeerVoteSlate attach the bearer token", async () => {
      let fetchMock = mockFetchOnce({ body: { is_hacker: true } });
      await getHackerSelfStatus("2026_fall", "tok");
      expect(fetchMock.mock.calls[0][0]).toEqual(
        expect.stringContaining("/api/volunteer/2026_fall/me?type=hacker"),
      );
      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
        "Bearer tok",
      );

      fetchMock = mockFetchOnce({ body: { status: "open" } });
      await getPeerVoteSlate("2026_fall", "tok");
      expect(fetchMock.mock.calls[0][0]).toEqual(
        expect.stringContaining("/api/hackathons/2026_fall/peer-vote/slate"),
      );
    });

    it("submitPeerVoteBallot POSTs the picks array", async () => {
      const fetchMock = mockFetchOnce({ body: { status: "voted" } });
      await submitPeerVoteBallot("2026_fall", ["t1", "t2"], "tok");
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining("/api/hackathons/2026_fall/peer-vote/ballot"),
      );
      expect(JSON.parse(opts.body)).toEqual({ picks: ["t1", "t2"] });
    });
  });

  describe("request wrappers — error handling", () => {
    it("throws ApiError with the parsed body when the response isn't ok", async () => {
      mockFetchOnce({
        ok: false,
        status: 409,
        body: { error: "submissions_closed", deadline: "x" },
      });
      await expect(saveTeamProject("team1", {}, "tok")).rejects.toMatchObject({
        name: "ApiError",
        status: 409,
        body: { error: "submissions_closed", deadline: "x" },
      });
    });

    it("treats an empty response body as null rather than throwing a JSON parse error", async () => {
      mockFetchOnce({ ok: false, status: 404, body: null });
      await expect(getPublicTeam("missing")).rejects.toMatchObject({
        status: 404,
        body: null,
      });
    });

    it("treats a non-JSON error body as null instead of throwing", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 502,
        text: async () => "<html>Bad Gateway</html>",
      });
      await expect(getPublicTeam("team1")).rejects.toMatchObject({
        status: 502,
        body: null,
      });
    });
  });
});
