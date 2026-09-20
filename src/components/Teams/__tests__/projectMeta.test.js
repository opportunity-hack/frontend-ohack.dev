import {
  getSubmissionStatus,
  submissionLabel,
  formatDeadline,
  projectThumbUrl,
  buildTeamOgImage,
  buildTeamDescription,
  buildProjectJsonLd,
  firstRepoUrl,
  isProjectStoryMissing,
} from "../projectMeta";
import { OG_IMAGE } from "../teamPageData";

describe("projectMeta", () => {
  describe("getSubmissionStatus", () => {
    it("is null for a legacy team with neither field", () => {
      expect(getSubmissionStatus({})).toBeNull();
      expect(getSubmissionStatus(null)).toBeNull();
    });

    it("returns the stored status when it's a known value", () => {
      expect(getSubmissionStatus({ project_submission_status: "draft" })).toBe("draft");
      expect(getSubmissionStatus({ project_submission_status: "submitted" })).toBe("submitted");
      expect(getSubmissionStatus({ project_submission_status: "late" })).toBe("late");
    });

    it("falls back to submitted/draft off project_submitted_at when the status is unset or unknown", () => {
      expect(getSubmissionStatus({ project_submitted_at: "2026-09-20T00:00:00Z" })).toBe(
        "submitted"
      );
      expect(
        getSubmissionStatus({
          project_submission_status: "weird_legacy_value",
          project_submitted_at: "2026-09-20T00:00:00Z",
        })
      ).toBe("submitted");
    });
  });

  describe("submissionLabel", () => {
    it("is all-null for a legacy team", () => {
      expect(submissionLabel({})).toEqual({ tag: null, line: null });
    });

    it("labels a draft", () => {
      expect(submissionLabel({ project_submission_status: "draft" })).toEqual({
        tag: "In progress",
        line: "Draft — not yet submitted.",
      });
    });

    it("labels a submitted project with the formatted timestamp", () => {
      const team = {
        project_submission_status: "submitted",
        project_submitted_at: "2026-09-20T21:58:00.000Z",
      };
      const { tag, line } = submissionLabel(team, "America/Phoenix");
      expect(tag).toBe("Submitted");
      expect(line).toMatch(/^Submitted Sun 2:58 PM MST$/);
    });

    it("labels a late submission distinctly", () => {
      const team = {
        project_submission_status: "late",
        project_submitted_at: "2026-09-21T01:00:00.000Z",
      };
      const { tag, line } = submissionLabel(team, "America/Phoenix");
      expect(tag).toBe("Submitted late");
      expect(line).toMatch(/^Submitted late /);
    });
  });

  describe("formatDeadline", () => {
    it("formats an ISO instant in the given timezone with a short weekday + abbreviation", () => {
      expect(formatDeadline("2026-09-20T21:58:00.000Z", "America/Phoenix")).toBe(
        "Sun 2:58 PM MST"
      );
    });

    it("returns null for missing/unparseable input", () => {
      expect(formatDeadline(null)).toBeNull();
      expect(formatDeadline("not-a-date")).toBeNull();
    });

    it("falls back to the default event timezone when none is given", () => {
      expect(formatDeadline("2026-09-20T21:58:00.000Z")).toBe("Sun 2:58 PM MST");
    });
  });

  describe("projectThumbUrl", () => {
    it("prefers the uploaded project thumbnail", () => {
      expect(
        projectThumbUrl({
          project_thumbnail_url: "https://cdn.ohack.dev/teams/1/project/thumb.png",
          demo_video_url: "https://youtu.be/dQw4w9WgXcQ",
        })
      ).toBe("https://cdn.ohack.dev/teams/1/project/thumb.png");
    });

    it("falls back to a YouTube poster derived from the demo video", () => {
      expect(projectThumbUrl({ demo_video_url: "https://youtu.be/dQw4w9WgXcQ" })).toBe(
        "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
      );
    });

    it("returns null when there's no thumbnail and the demo video isn't YouTube", () => {
      expect(projectThumbUrl({ demo_video_url: "https://vimeo.com/12345" })).toBeNull();
      expect(projectThumbUrl({})).toBeNull();
    });
  });

  describe("buildTeamOgImage", () => {
    it("uses the project thumbnail as a large-image card", () => {
      expect(
        buildTeamOgImage({ project_thumbnail_url: "https://cdn.ohack.dev/teams/1/project/t.png" })
      ).toEqual({ image: "https://cdn.ohack.dev/teams/1/project/t.png", card: "summary_large_image" });
    });

    it("falls back to the site OG image for a project with no media", () => {
      expect(buildTeamOgImage({})).toEqual({ image: OG_IMAGE, card: "summary_large_image" });
    });
  });

  describe("buildTeamDescription", () => {
    it("prefers the team's own tagline", () => {
      expect(buildTeamDescription({ name: "Team A", project_tagline: "A tagline" })).toBe(
        "A tagline"
      );
    });

    it("composes a description from nonprofit/event/member count when there's no tagline", () => {
      expect(
        buildTeamDescription(
          { name: "Team A" },
          { nonprofitName: "Helpful Org", eventName: "Fall 2026", memberCount: 4 }
        )
      ).toBe("Team A's Opportunity Hack project for Helpful Org at Fall 2026 — 4 members.");
    });

    it("handles a singular member count and missing context gracefully", () => {
      expect(buildTeamDescription({ name: "Team A" }, { memberCount: 1 })).toBe(
        "Team A's Opportunity Hack project — 1 member."
      );
      expect(buildTeamDescription({})).toBe("This team's Opportunity Hack project.");
    });
  });

  describe("firstRepoUrl", () => {
    it("returns the first linked repo url", () => {
      expect(firstRepoUrl({ github_links: ["https://github.com/org/repo"] })).toBe(
        "https://github.com/org/repo"
      );
    });

    it("returns null when there are no github links", () => {
      expect(firstRepoUrl({})).toBeNull();
    });
  });

  describe("isProjectStoryMissing", () => {
    it("is true unless both a tagline and story are present", () => {
      expect(isProjectStoryMissing({})).toBe(true);
      expect(isProjectStoryMissing({ project_tagline: "x" })).toBe(true);
      expect(isProjectStoryMissing({ project_story: "x" })).toBe(true);
      expect(isProjectStoryMissing({ project_tagline: "x", project_story: "y" })).toBe(false);
    });
  });

  describe("buildProjectJsonLd", () => {
    it("returns null for a team with nothing to describe", () => {
      expect(buildProjectJsonLd({ name: "Team A" })).toBeNull();
      expect(buildProjectJsonLd(null)).toBeNull();
    });

    it("builds a SoftwareSourceCode node when a story exists", () => {
      const node = buildProjectJsonLd(
        {
          name: "Team A",
          project_tagline: "A tagline",
          project_story: "## What we built\nStuff.",
          github_links: ["https://github.com/org/repo"],
          project_thumbnail_url: "https://cdn.ohack.dev/teams/1/project/t.png",
          project_updated_at: "2026-09-20T00:00:00Z",
        },
        { canonicalUrl: "https://www.ohack.dev/hack/e/team/1", eventName: "Fall 2026", eventUrl: "https://www.ohack.dev/hack/e" }
      );
      expect(node).toMatchObject({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "Team A",
        url: "https://www.ohack.dev/hack/e/team/1",
        description: "A tagline",
        codeRepository: "https://github.com/org/repo",
        image: "https://cdn.ohack.dev/teams/1/project/t.png",
        dateModified: "2026-09-20T00:00:00Z",
        isPartOf: { "@type": "Event", name: "Fall 2026", url: "https://www.ohack.dev/hack/e" },
      });
    });

    it("builds a node from just a repo link when there's no story yet", () => {
      const node = buildProjectJsonLd({ name: "Team A", github_links: ["https://github.com/org/repo"] });
      expect(node).not.toBeNull();
      expect(node.codeRepository).toBe("https://github.com/org/repo");
      expect(node.isPartOf).toBeUndefined();
    });
  });
});
