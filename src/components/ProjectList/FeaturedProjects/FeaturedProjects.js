import NextLink from "next/link";
import Image from "next/image";
import { PROJECT_STATUS_LABELS } from "../../../lib/projectStatus";

// Quiet 3-up featured strip: a photo, a title, a one-line teaser, and a single
// status tag. (Previously each featured card also stacked GitHub/helpers/skill
// chips, which made the top of the page as busy as the grid below it.)

const FEATURED_IMAGES = [
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_6.webp",
  "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
  "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
  "https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp",
  "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
  "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
  "https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp",
];

function hashCode(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash &= hash;
  }
  return hash;
}

function toPlain(text = "") {
  return text
    .replace(/[#>*_`~]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FeaturedProjects({ projects }) {
  if (!projects?.length) return null;

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      }}
    >
      {projects.map((project, i) => {
        const img = FEATURED_IMAGES[Math.abs(hashCode(project.id)) % FEATURED_IMAGES.length];
        const status = PROJECT_STATUS_LABELS[project.status] || project.status;
        return (
          <NextLink
            key={project.id}
            href={`/project/${project.id}`}
            className="ohx-card ohx-card--hover rise"
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              animationDelay: `${i * 90}ms`,
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "var(--surface-2)" }}>
              <Image
                src={img}
                alt={project.title}
                fill
                sizes="(max-width: 600px) 100vw, 360px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>
                  {project.title}
                </h3>
                {status && (
                  <span
                    className={`ohx-tag${project.status === "production" ? " ohx-tag--accent" : ""}`}
                    style={{ flexShrink: 0 }}
                  >
                    {status}
                  </span>
                )}
              </div>
              {project.description && (
                <p
                  className="ohx-muted"
                  style={{
                    margin: 0,
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {toPlain(project.description)}
                </p>
              )}
            </div>
          </NextLink>
        );
      })}
    </div>
  );
}
