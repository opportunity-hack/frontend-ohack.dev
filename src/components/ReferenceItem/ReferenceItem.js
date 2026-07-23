import React from "react";
import ArticleIcon from "@mui/icons-material/Article";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VideoDisplay from "../VideoDisplay/VideoDisplay";

// Only ever rendered inside ProblemStatement (which is always inside a
// RefinedRoot), so scoped .ohx-* classes are safe here.

const getReferenceMeta = (link = "", name = "") => {
  const l = link.toLowerCase();
  const n = name.toLowerCase();

  if (l.includes("github.com")) return { Icon: GitHubIcon, kind: "GitHub" };
  if (
    l.endsWith(".pptx") ||
    l.includes("slides.google.com") ||
    l.includes("docs.google.com/presentation")
  ) {
    return { Icon: CoPresentIcon, kind: "Slides" };
  }
  if (
    [".pdf", ".doc", ".docx"].some((ext) => l.endsWith(ext)) ||
    l.includes("docs.google.com")
  ) {
    return { Icon: ArticleIcon, kind: "Document" };
  }
  if (
    ["youtube", "video"].some((text) => n.includes(text)) ||
    ["youtube.com", "vimeo.com"].some((host) => l.includes(host))
  ) {
    return { Icon: SmartDisplayIcon, kind: "Video" };
  }
  return { Icon: OpenInNewIcon, kind: "Link" };
};

const isVideoUrl = (url) =>
  url &&
  (url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("loom.com") ||
    url.includes("drive.google.com/file"));

const ReferenceItem = ({ reference }) => {
  if (reference.link && isVideoUrl(reference.link)) {
    return <VideoDisplay url={reference.link} title={reference.name} />;
  }

  const { Icon, kind } = getReferenceMeta(reference.link, reference.name);

  return (
    <a
      href={reference.link}
      target="_blank"
      rel="noopener noreferrer"
      className="ohx-card ohx-card--hover"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        textDecoration: "none",
      }}
    >
      <Icon sx={{ fontSize: 18, color: "var(--brand, #1B3A6B)", flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontWeight: 600,
          fontSize: "0.92rem",
          color: "var(--ink, #16181D)",
          overflowWrap: "anywhere",
        }}
      >
        {reference.name}
      </span>
      <span className="ohx-tag" style={{ fontSize: "0.7rem", flexShrink: 0 }}>
        {kind}
      </span>
      <OpenInNewIcon
        sx={{ fontSize: 14, color: "var(--muted, #5B6270)", flexShrink: 0 }}
      />
    </a>
  );
};

export default ReferenceItem;
