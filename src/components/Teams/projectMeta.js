/**
 * projectMeta — single source of truth for a team's project write-up:
 * submission status/labels, deadline formatting, thumbnail resolution, and
 * social-unfurl composition (OG image + description + JSON-LD).
 *
 * Used by the public team page, the gallery (`TeamList`), `HackathonResults`
 * and the team dashboard, so what a team sees on their own dashboard is
 * exactly what the public page and social scrapers show. Pure functions
 * only — no fetching, no window/document.
 */

import {
  getTimezoneAbbreviation,
  DEFAULT_EVENT_TIMEZONE,
} from "../../lib/timezoneUtils";
import { repoEntriesFromTeam } from "../../lib/githubLinks";
import { OG_IMAGE } from "./teamPageData";

// Matches LiteVideoThumbnail.js's YouTube regex so the same URL yields the
// same extracted video id everywhere.
const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;

function clamp(text, max = 160) {
  if (!text) return text;
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

/**
 * `'submitted' | 'late' | 'draft' | null` — null when the team predates the
 * Sep 2026 project fields (neither `project_submission_status` nor
 * `project_submitted_at` is present), so legacy teams render no submission
 * tag anywhere instead of a misleading "Draft".
 */
export function getSubmissionStatus(team) {
  if (!team) return null;
  const status = team.project_submission_status;
  const submittedAt = team.project_submitted_at;
  if (!status && !submittedAt) return null;
  if (status === "submitted" || status === "late" || status === "draft")
    return status;
  // Status field absent/unrecognized but a submission timestamp exists —
  // treat as submitted rather than surfacing an unknown enum value.
  return submittedAt ? "submitted" : "draft";
}

/**
 * `{ tag, line }` — a short chip label and a one-line sentence describing
 * the team's submission state, or `{ tag: null, line: null }` for legacy
 * teams with no submission fields at all (see `getSubmissionStatus`).
 */
export function submissionLabel(team, tz) {
  const status = getSubmissionStatus(team);
  if (status === null) return { tag: null, line: null };

  const when = team?.project_submitted_at
    ? formatDeadline(team.project_submitted_at, tz)
    : null;

  if (status === "submitted") {
    return { tag: "Submitted", line: when ? `Submitted ${when}` : "Submitted" };
  }
  if (status === "late") {
    return {
      tag: "Submitted late",
      line: when ? `Submitted late ${when}` : "Submitted late",
    };
  }
  return { tag: "In progress", line: "Draft — not yet submitted." };
}

/**
 * Formats an ISO instant in a given IANA timezone as e.g. `"Sat 2:58 PM
 * MST"`. Returns null for a missing/unparseable input.
 */
export function formatDeadline(iso, tz) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const timezone = tz || DEFAULT_EVENT_TIMEZONE;
  const formatted = date
    .toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(",", "");
  const abbr = getTimezoneAbbreviation(date, timezone);
  return abbr ? `${formatted} ${abbr}` : formatted;
}

/**
 * The best thumbnail available for a team's project: an uploaded project
 * thumbnail, else a YouTube demo-video poster, else null (caller falls back
 * to an initial/placeholder tile).
 */
export function projectThumbUrl(team) {
  if (team?.project_thumbnail_url) return team.project_thumbnail_url;
  const videoUrl = team?.demo_video_url;
  if (videoUrl) {
    const match = String(videoUrl).match(YOUTUBE_REGEX);
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

/**
 * `{ image, card }` — the og:image / twitter:image to unfurl for a team's
 * project page, and the twitter:card type to pair with it. Every candidate
 * here (an uploaded 16:9 thumbnail, a YouTube poster, or the site fallback
 * banner) is landscape, so this always recommends `summary_large_image`
 * (matches the existing team-page default in `team/[team_id]/index.js`).
 */
export function buildTeamOgImage(team) {
  const image = projectThumbUrl(team) || OG_IMAGE;
  return { image, card: "summary_large_image" };
}

/**
 * A ≤200-char description for `<meta name="description">` / og:description.
 * Prefers the team's own tagline; otherwise composes one from what's known
 * about the project (nonprofit, event, member count).
 */
export function buildTeamDescription(
  team,
  { nonprofitName, eventName, memberCount } = {},
) {
  if (team?.project_tagline) return clamp(team.project_tagline, 200);

  const name = team?.name || "This team";
  let base = `${name}'s Opportunity Hack project`;
  if (nonprofitName) base += ` for ${nonprofitName}`;
  if (eventName) base += ` at ${eventName}`;
  base += memberCount
    ? ` — ${memberCount} member${memberCount === 1 ? "" : "s"}.`
    : ".";
  return clamp(base, 200);
}

/** The first GitHub repo URL linked to a team, or null. */
export function firstRepoUrl(team) {
  return repoEntriesFromTeam(team)[0]?.link || null;
}

/** True when the team hasn't written a project story yet (tagline + story
 * are both required before the story counts as present). */
export function isProjectStoryMissing(team) {
  return !(team?.project_tagline && team?.project_story);
}

/**
 * True when a team has real, hand-entered project content: a tagline,
 * story, built-with tags, links, an uploaded thumbnail, or a recorded
 * submission status. This is the single gate for "does the Project section
 * have anything to show" — shared by the public team page and
 * `TeamProjectSection`.
 *
 * Deliberately does NOT count `projectThumbUrl()`'s YouTube-poster fallback
 * — a legacy team with only a demo video and no story/links/etc. shouldn't
 * get a "Project" section (TOC entry + masthead tag) that's just a static,
 * non-clickable copy of the poster already shown in the Demo video section
 * below. Only a real, uploaded `project_thumbnail_url` counts here.
 */
export function hasProjectContent(team) {
  if (!team) return false;
  return !!(
    team.project_tagline ||
    team.project_story ||
    (Array.isArray(team.project_built_with) &&
      team.project_built_with.length > 0) ||
    (Array.isArray(team.project_links) &&
      team.project_links.some((l) => l?.url)) ||
    team.project_thumbnail_url ||
    getSubmissionStatus(team) !== null
  );
}

/**
 * A `SoftwareSourceCode` JSON-LD node describing the team's project, or
 * null when there's nothing yet worth describing (no story, no repo, no
 * thumbnail) — legacy/empty teams should emit no structured data at all
 * rather than an empty shell.
 */
export function buildProjectJsonLd(
  team,
  { canonicalUrl, eventName, eventUrl } = {},
) {
  if (!team) return null;
  const repoUrl = firstRepoUrl(team);
  const image = projectThumbUrl(team);
  // Gate on real project content (or a linked repo) — not the derived
  // YouTube-poster fallback in `image`, or a team with only a demo video
  // would get a SoftwareSourceCode node describing... a video poster.
  const hasContent = hasProjectContent(team) || !!repoUrl;
  if (!hasContent) return null;

  const node = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: team.name || "Opportunity Hack project",
  };
  if (canonicalUrl) node.url = canonicalUrl;
  const description = buildTeamDescription(team, { eventName });
  if (description) node.description = description;
  if (repoUrl) node.codeRepository = repoUrl;
  if (image) node.image = image;
  if (team.project_updated_at) node.dateModified = team.project_updated_at;
  if (eventName) {
    node.isPartOf = {
      "@type": "Event",
      name: eventName,
      ...(eventUrl ? { url: eventUrl } : {}),
    };
  }
  return node;
}
