import { useState, useMemo } from "react";
import { Pagination, Box } from "@mui/material";
import ProjectCard from "./ProjectCard";
import FeaturedProjects from "./FeaturedProjects/FeaturedProjects";
import { RefinedRoot, Eyebrow, Arrow } from "../design/refined";
import { ALL_PROJECT_STATUSES, isPausedStatus } from "../../lib/projectStatus";

const PROJECTS_PER_PAGE = 9;

const STATUS_FILTERS = [
  { value: null, label: "All" },
  ...ALL_PROJECT_STATUSES.map(({ value, label }) => ({ value, label })),
];

const SORT_OPTIONS = [
  { value: "rank", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "needHelp", label: "Needs help first" },
  { value: "title", label: "A–Z" },
];

export default function ProjectList({ initialProjects = [], events }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(null);
  const [sortBy, setSortBy] = useState("rank");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialProjects.filter((p) => {
      if (q) {
        const hit =
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.skills?.some((s) => s.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (status && p.status !== status) return false;
      return true;
    });
  }, [initialProjects, searchQuery, status]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      // Paused projects aren't asking for work, so they sink below active
      // ones in the help-oriented sorts (unless the Paused filter is on).
      if (sortBy === "rank" || sortBy === "needHelp") {
        const pausedDelta = isPausedStatus(a.status) - isPausedStatus(b.status);
        if (pausedDelta !== 0) return pausedDelta;
      }
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "needHelp":
          return (a.helping?.length || 0) - (b.helping?.length || 0);
        case "rank":
        default:
          return (b.rank || 0) - (a.rank || 0);
      }
    });
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / PROJECTS_PER_PAGE);
  const pageProjects = useMemo(() => {
    const end = currentPage * PROJECTS_PER_PAGE;
    return sorted.slice(end - PROJECTS_PER_PAGE, end);
  }, [sorted, currentPage]);

  const featured = useMemo(() => {
    const explicit = initialProjects.filter((p) => p.featured);
    if (explicit.length >= 3) return explicit.slice(0, 3);
    return [...initialProjects]
      .filter(
        (p) =>
          p.status !== "production" &&
          p.status !== "post-hackathon" &&
          !isPausedStatus(p.status)
      )
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 3);
  }, [initialProjects]);

  const resetPage = () => setCurrentPage(1);
  const showingFrom = sorted.length === 0 ? 0 : (currentPage - 1) * PROJECTS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * PROJECTS_PER_PAGE, sorted.length);

  return (
    <RefinedRoot>
      {/* ---------------- HEADER ---------------- */}
      <section
        className="ohx-wrap"
        style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 52px)" }}
      >
        <Eyebrow>
          <span className="rise" style={{ display: "inline-block" }}>
            Open source for good
          </span>
        </Eyebrow>
        <h1 className="ohx-display rise" style={{ marginTop: 18, animationDelay: "60ms" }}>
          Projects worth <span className="ohx-italic">your time.</span>
        </h1>
        <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "54ch" }}>
          Real software for real nonprofits. Find one that fits your skills, join a team,
          and ship something that keeps working long after the hackathon ends.
        </p>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      {featured.length > 0 && (
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(36px, 6vh, 64px)" }}>
          <Eyebrow style={{ marginBottom: 20 }}>Featured</Eyebrow>
          <FeaturedProjects projects={featured} />
        </section>
      )}

      {/* ---------------- CONTROLS + GRID ---------------- */}
      <section
        style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)" }}
      >
        <div className="ohx-wrap" style={{ paddingTop: "clamp(36px, 6vh, 64px)", paddingBottom: "clamp(48px, 8vh, 96px)" }}>
          <Eyebrow>Browse</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>
            All projects
          </h2>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPage();
              }}
              placeholder="Search projects, skills…"
              aria-label="Search projects"
              style={{
                flex: "1 1 260px",
                minWidth: 0,
                font: "inherit",
                fontSize: "0.95rem",
                color: "var(--ink)",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: "11px 14px",
                outline: "none",
              }}
            />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="ohx-eyebrow" style={{ fontSize: "0.66rem" }}>
                Sort
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  resetPage();
                }}
                style={{
                  font: "inherit",
                  fontSize: "0.9rem",
                  color: "var(--ink)",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Status filter as quiet toggle tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {STATUS_FILTERS.map((f) => {
              const active = status === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  className="ohx-tag"
                  onClick={() => {
                    setStatus(f.value);
                    resetPage();
                  }}
                  style={{
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: active ? "var(--brand)" : "var(--surface)",
                    color: active ? "#fff" : "var(--muted)",
                    borderColor: active ? "var(--brand)" : "var(--line)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <p className="ohx-faint" style={{ fontSize: "0.85rem", marginBottom: 20 }}>
            {sorted.length === 0
              ? "No matching projects"
              : `Showing ${showingFrom}–${showingTo} of ${sorted.length}`}
          </p>

          {/* Grid */}
          {sorted.length > 0 ? (
            <>
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {pageProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} hackathons={events} />
                ))}
              </div>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, v) => {
                      setCurrentPage(v);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          ) : (
            <div className="ohx-card" style={{ padding: "44px 28px", textAlign: "center" }}>
              <p className="ohx-muted" style={{ margin: 0 }}>
                Nothing matches those filters.
              </p>
              <button
                type="button"
                className="ohx-link"
                style={{ marginTop: 14, background: "none", border: 0, cursor: "pointer", font: "inherit" }}
                onClick={() => {
                  setSearchQuery("");
                  setStatus(null);
                  setSortBy("rank");
                  resetPage();
                }}
              >
                Clear filters <Arrow />
              </button>
            </div>
          )}
        </div>
      </section>
    </RefinedRoot>
  );
}
