import NextLink from "next/link";
import Image from "next/image";
import { Box } from "@mui/material";
import ProjectStoryMarkdown from "./ProjectStoryMarkdown";
import {
  getSubmissionStatus,
  submissionLabel,
  projectThumbUrl,
} from "./projectMeta";

// next/image is only allowed to load from hosts listed in next.config.js's
// remotePatterns — cdn.ohack.dev is allowlisted, img.youtube.com (the demo
// video poster fallback) is NOT, so that path stays a plain <img>.
const CDN_HOSTNAME = "cdn.ohack.dev";

function isCdnImage(url) {
  if (!url) return false;
  try {
    return new URL(url).hostname === CDN_HOSTNAME;
  } catch {
    return false;
  }
}

const thumbBoxSx = {
  position: "relative",
  aspectRatio: "16 / 9",
  background: "var(--surface-2, #F4F1E9)",
  borderRadius: "10px",
  overflow: "hidden",
  mb: 2,
};

const thumbImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const linkTileSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  p: 1.5,
  textDecoration: "none",
  fontWeight: 600,
  color: "var(--ink, #16181D)",
  fontSize: "0.92rem",
};

/**
 * The public-facing project write-up for a team, rendered as the FIRST
 * section on the team page (id="project"). Renders nothing for a public
 * visitor when the team has no project data at all (a calm prompt shows
 * instead, but only to a member who could fill it in). Always safe on a
 * legacy team — every field is optional and `getSubmissionStatus` returns
 * null rather than a misleading "Draft" tag.
 */
export default function TeamProjectSection({
  team,
  eventId,
  eventTimezone,
  isOnTeam,
  membershipChecked,
}) {
  const tagline = team?.project_tagline || null;
  const story = team?.project_story || null;
  const builtWith = Array.isArray(team?.project_built_with)
    ? team.project_built_with.filter(Boolean)
    : [];
  const links = Array.isArray(team?.project_links)
    ? team.project_links.filter((l) => l?.url)
    : [];
  const thumb = projectThumbUrl(team);
  const status = getSubmissionStatus(team);
  const { tag: submissionTag, line: submissionLine } = submissionLabel(
    team,
    eventTimezone,
  );

  const hasAnyProjectData = !!(
    tagline ||
    story ||
    builtWith.length ||
    links.length ||
    thumb ||
    status !== null
  );

  const dashboardHref = `/hack/${eventId}/manageteam#project`;

  if (!hasAnyProjectData) {
    // Only a confirmed member gets the "write it up" nudge — a public
    // visitor or an unresolved membership check sees nothing at all.
    if (!membershipChecked || !isOnTeam) return null;
    return (
      <Box
        className="ohx-card"
        sx={{ p: { xs: 2.5, md: 3.5 }, textAlign: "center" }}
      >
        <Box sx={{ color: "var(--muted)", mb: 1.5 }}>
          Tell the story of what you built.
        </Box>
        <NextLink href={dashboardHref} className="ohx-link">
          Add your project story →
        </NextLink>
      </Box>
    );
  }

  return (
    <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
      {tagline && (
        <Box className="ohx-lead" sx={{ mb: thumb || story ? 2 : 1 }}>
          {tagline}
        </Box>
      )}

      {thumb && (
        <Box sx={thumbBoxSx}>
          {isCdnImage(thumb) ? (
            <Image
              src={thumb}
              alt=""
              width={960}
              height={540}
              sizes="(max-width: 900px) 100vw, 760px"
              style={thumbImgStyle}
            />
          ) : (
            <img
              src={thumb}
              alt=""
              width={960}
              height={540}
              loading="lazy"
              decoding="async"
              style={thumbImgStyle}
            />
          )}
        </Box>
      )}

      {story && (
        <Box sx={{ mb: builtWith.length || links.length ? 2.5 : 0 }}>
          <ProjectStoryMarkdown markdown={story} demoteBy={1} />
        </Box>
      )}

      {builtWith.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            mb: links.length ? 2 : 0,
          }}
        >
          {builtWith.map((item, i) => (
            <span key={`${item}-${i}`} className="ohx-tag">
              {item}
            </span>
          ))}
        </Box>
      )}

      {links.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 1.25,
          }}
        >
          {links.map((link, i) => (
            <Box
              key={`${link.url}-${i}`}
              component="a"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-card ohx-card--hover"
              sx={linkTileSx}
            >
              <Box
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label || "Project link"}
              </Box>
              <span aria-hidden="true" style={{ marginLeft: "auto" }}>
                ↗
              </span>
            </Box>
          ))}
        </Box>
      )}

      {status !== null && (
        <Box sx={{ mt: 2.5, color: "var(--muted)", fontSize: "0.9rem" }}>
          {status === "submitted" || status === "late" ? (
            submissionLine
          ) : (
            <span className="ohx-tag">{submissionTag}</span>
          )}
        </Box>
      )}

      {isOnTeam && status === "draft" && (
        <Box sx={{ mt: 1, color: "var(--muted)", fontSize: "0.9rem" }}>
          Draft — not yet submitted.{" "}
          <NextLink href={dashboardHref} className="ohx-link">
            Edit on your dashboard →
          </NextLink>
        </Box>
      )}
    </Box>
  );
}
