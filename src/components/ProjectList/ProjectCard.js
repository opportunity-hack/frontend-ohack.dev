import { useMemo } from "react";
import NextLink from "next/link";

// Calm, single-surface project card. The previous version nested two bordered
// boxes ("Skills Used", "Hackathon History") plus several colored chips inside
// every card, which read as cluttered across a 9-up grid. This keeps one quiet
// surface: title + status, a short description, a thin row of skill tags, and a
// light footer. All visual tokens come from the <RefinedRoot> scope.

const STATUS_LABEL = {
  concept: "Concept",
  hackathon: "Hackathon",
  "post-hackathon": "Post-hackathon",
  production: "Production",
};

function getGithubUrl(project) {
  if (!project.github) return null;
  if (typeof project.github === "string") return project.github;
  if (Array.isArray(project.github)) return project.github[0]?.link;
  return project.github.link;
}

// Strip markdown-ish noise so the clamp preview reads as plain prose.
function toPlain(text = "") {
  return text
    .replace(/[#>*_`~]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ProjectCard({ project, hackathons }) {
  const github = getGithubUrl(project);
  const helpers = project.helping?.length || 0;
  const skills = project.skills || [];
  const visibleSkills = skills.slice(0, 4);
  const extraSkills = skills.length - visibleSkills.length;

  const relatedHackathon = useMemo(() => {
    if (!project.events || !hackathons) return null;
    return hackathons.find((h) => project.events.includes(h.id)) || null;
  }, [project.events, hackathons]);

  const statusLabel = STATUS_LABEL[project.status] || project.status;
  const isProduction = project.status === "production";

  return (
    <div
      className="ohx-card ohx-card--hover"
      style={{ height: "100%", display: "flex", flexDirection: "column", padding: "24px 24px 20px" }}
    >
      {/* Title + status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <NextLink
          href={`/project/${project.id}`}
          className="ohx-display"
          style={{ fontSize: "1.25rem", lineHeight: 1.2, textDecoration: "none", color: "var(--ink)" }}
        >
          {project.title}
        </NextLink>
        {statusLabel && (
          <span className={`ohx-tag${isProduction ? " ohx-tag--accent" : ""}`} style={{ flexShrink: 0 }}>
            {statusLabel}
          </span>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p
          className="ohx-muted"
          style={{
            margin: "12px 0 0",
            fontSize: "0.95rem",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {toPlain(project.description)}
        </p>
      )}

      {/* Skills — quiet tags, capped */}
      {visibleSkills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
          {visibleSkills.map((skill) => (
            <span key={skill} className="ohx-tag">
              {skill}
            </span>
          ))}
          {extraSkills > 0 && <span className="ohx-tag">+{extraSkills}</span>}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span className="ohx-faint" style={{ fontSize: "0.82rem" }}>
          {helpers > 0 ? `${helpers} helper${helpers === 1 ? "" : "s"}` : "Needs helpers"}
          {relatedHackathon?.location ? ` · ${relatedHackathon.location}` : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {github && (
            <a
              className="ohx-link"
              style={{ fontSize: "0.85rem" }}
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub
            </a>
          )}
          <NextLink href={`/project/${project.id}`} className="ohx-link" style={{ fontSize: "0.85rem" }}>
            View
          </NextLink>
        </div>
      </div>
    </div>
  );
}
