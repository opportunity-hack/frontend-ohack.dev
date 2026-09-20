import { deriveVoteWindow, togglePick, canSubmit, slateLinks } from "../peerVoteState";

describe("peerVoteState", () => {
  describe("deriveVoteWindow", () => {
    const NOW = Date.parse("2026-09-19T12:00:00.000Z");

    it("is disabled when constraints are missing or peer_vote_enabled isn't true", () => {
      expect(deriveVoteWindow({}, null, NOW)).toBe("disabled");
      expect(deriveVoteWindow({}, {}, NOW)).toBe("disabled");
      expect(deriveVoteWindow({}, { peer_vote_enabled: false }, NOW)).toBe("disabled");
      expect(deriveVoteWindow({}, { peer_vote_enabled: "true" }, NOW)).toBe("disabled");
    });

    it("is unscheduled when enabled but there's no way to know the window", () => {
      expect(deriveVoteWindow(null, { peer_vote_enabled: true }, NOW)).toBe("unscheduled");
      expect(
        deriveVoteWindow({ submission: "2026-09-18T00:00:00Z" }, { peer_vote_enabled: true }, NOW)
      ).toBe("unscheduled");
      expect(
        deriveVoteWindow(
          { voting_closes: "2026-09-25T00:00:00Z" },
          { peer_vote_enabled: true },
          NOW
        )
      ).toBe("unscheduled");
    });

    it("is unscheduled when a deadline field doesn't parse", () => {
      expect(
        deriveVoteWindow(
          { voting_opens: "not-a-date", voting_closes: "2026-09-25T00:00:00Z" },
          { peer_vote_enabled: true },
          NOW
        )
      ).toBe("unscheduled");
    });

    it("prefers voting_opens, then late_submission_until, then submission for the open edge", () => {
      const constraints = { peer_vote_enabled: true };
      const closes = "2026-09-30T00:00:00Z";
      expect(
        deriveVoteWindow(
          { voting_opens: "2026-09-20T00:00:00Z", voting_closes: closes },
          constraints,
          NOW
        )
      ).toBe("upcoming");
      expect(
        deriveVoteWindow(
          { late_submission_until: "2026-09-10T00:00:00Z", voting_closes: closes },
          constraints,
          NOW
        )
      ).toBe("open");
      expect(
        deriveVoteWindow(
          { submission: "2026-09-01T00:00:00Z", voting_closes: closes },
          constraints,
          NOW
        )
      ).toBe("open");
    });

    it("is upcoming before opens_at, open between the two, closed at/after closes_at", () => {
      const deadlines = {
        voting_opens: "2026-09-19T13:00:00.000Z",
        voting_closes: "2026-09-19T15:00:00.000Z",
      };
      const constraints = { peer_vote_enabled: true };
      expect(deriveVoteWindow(deadlines, constraints, Date.parse("2026-09-19T12:00:00Z"))).toBe(
        "upcoming"
      );
      expect(deriveVoteWindow(deadlines, constraints, Date.parse("2026-09-19T14:00:00Z"))).toBe(
        "open"
      );
      expect(deriveVoteWindow(deadlines, constraints, Date.parse("2026-09-19T15:00:00Z"))).toBe(
        "closed"
      );
      expect(deriveVoteWindow(deadlines, constraints, Date.parse("2026-09-19T16:00:00Z"))).toBe(
        "closed"
      );
    });
  });

  describe("togglePick", () => {
    it("adds an id that isn't already picked", () => {
      expect(togglePick([], "t1", 2)).toEqual(["t1"]);
      expect(togglePick(["t1"], "t2", 2)).toEqual(["t1", "t2"]);
    });

    it("removes an id that's already picked", () => {
      expect(togglePick(["t1", "t2"], "t1", 2)).toEqual(["t2"]);
    });

    it("leaves picks unchanged when adding would exceed max", () => {
      expect(togglePick(["t1", "t2"], "t3", 2)).toEqual(["t1", "t2"]);
    });

    it("treats a missing/non-array picks as empty", () => {
      expect(togglePick(null, "t1", 2)).toEqual(["t1"]);
      expect(togglePick(undefined, "t1", 2)).toEqual(["t1"]);
    });

    it("allows unlimited picks when max is nullish", () => {
      expect(togglePick(["t1", "t2", "t3"], "t4", null)).toEqual(["t1", "t2", "t3", "t4"]);
    });
  });

  describe("canSubmit", () => {
    it("is false with zero picks", () => {
      expect(canSubmit([], 2)).toBe(false);
      expect(canSubmit(null, 2)).toBe(false);
    });

    it("is true with between 1 and max picks", () => {
      expect(canSubmit(["t1"], 2)).toBe(true);
      expect(canSubmit(["t1", "t2"], 2)).toBe(true);
    });

    it("is false with more than max picks", () => {
      expect(canSubmit(["t1", "t2", "t3"], 2)).toBe(false);
    });

    it("ignores the max ceiling when max is nullish", () => {
      expect(canSubmit(["t1", "t2", "t3"], null)).toBe(true);
    });
  });

  describe("slateLinks", () => {
    it("returns null for both when there's nothing to link to", () => {
      expect(slateLinks({}, undefined)).toEqual({ github: null, project: null });
    });

    it("reads the first github link in either string or object shape", () => {
      expect(slateLinks({ github_links: ["https://github.com/org/a"] }, "e1")).toMatchObject({
        github: "https://github.com/org/a",
      });
      expect(
        slateLinks({ github_links: [{ link: "https://github.com/org/b" }] }, "e1")
      ).toMatchObject({ github: "https://github.com/org/b" });
    });

    it("builds the public team page link from eventId + team_id", () => {
      expect(slateLinks({ team_id: "t1" }, "e1")).toEqual({
        github: null,
        project: "/hack/e1/team/t1",
      });
    });

    it("omits the project link without an eventId", () => {
      expect(slateLinks({ team_id: "t1" }, undefined)).toEqual({ github: null, project: null });
    });
  });
});
