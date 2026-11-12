import React, { memo, useId, useMemo, useState } from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { filterProjectOptions, toRankedEntry } from "../../lib/projectRanking";

/**
 * Browse the event's projects, grouped by nonprofit, and add/remove them from
 * the team's ranking. One toggle per project (`aria-pressed` button) — the old
 * card-click + checkbox pair toggled twice, so a click did nothing.
 * Renders inside RefinedRoot (`.ohx-*` classes are safe).
 */

const MAX_SKILLS_SHOWN = 6;
const FALLBACK_LOGO =
  "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Light_Blue_Square.png";

const clampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const ProjectRow = ({
  nonprofit,
  project,
  rankIndex,
  atMax,
  hintId,
  onToggle,
}) => {
  const ranked = rankIndex >= 0;
  const disabled = !ranked && atMax;
  const skills = project.skills || [];
  return (
    <li
      style={{
        listStyle: "none",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        padding: "12px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div style={{ flex: "1 1 260px", minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>
          {project.title}
        </div>
        {project.description && (
          <div style={{ ...clampStyle, color: "var(--muted)", marginTop: 2 }}>
            {project.description}
          </div>
        )}
        {skills.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}
          >
            {skills.slice(0, MAX_SKILLS_SHOWN).map((skill) => (
              <span key={skill} className="ohx-tag">
                {skill}
              </span>
            ))}
            {skills.length > MAX_SKILLS_SHOWN && (
              <span className="ohx-tag">
                +{skills.length - MAX_SKILLS_SHOWN}
              </span>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`ohx-btn ${ranked ? "ohx-btn--primary" : "ohx-btn--ghost"}`}
        aria-pressed={ranked}
        aria-describedby={disabled ? hintId : undefined}
        disabled={disabled}
        onClick={() => onToggle(toRankedEntry(nonprofit, project))}
        style={{
          flexShrink: 0,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {ranked ? `Ranked #${rankIndex + 1} · Remove` : "Add to my ranking"}
      </button>
    </li>
  );
};

const NonprofitCard = ({ nonprofit, ranked, atMax, hintId, onToggle }) => (
  <Box
    component="article"
    className="ohx-card"
    sx={{ p: { xs: 2, md: 2.5 }, mb: 2 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src={nonprofit.image || FALLBACK_LOGO}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid var(--line)",
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <h3
          style={{
            fontFamily: "var(--display)",
            fontWeight: 600,
            fontSize: "1.1rem",
            margin: 0,
          }}
        >
          {nonprofit.name}
        </h3>
        <div style={{ color: "var(--faint)", fontSize: "0.85rem" }}>
          {nonprofit.projects.length === 1
            ? "1 project"
            : `${nonprofit.projects.length} projects`}
          {nonprofit.website && (
            <>
              {" · "}
              <a
                href={nonprofit.website}
                target="_blank"
                rel="noopener noreferrer"
                className="ohx-link"
              >
                Website
              </a>
            </>
          )}
        </div>
      </div>
    </div>
    <ul style={{ margin: "12px 0 0", padding: 0 }}>
      {nonprofit.projects.map((project) => (
        <ProjectRow
          key={project.id}
          nonprofit={nonprofit}
          project={project}
          rankIndex={ranked.findIndex((r) => r.projectId === project.id)}
          atMax={atMax}
          hintId={hintId}
          onToggle={onToggle}
        />
      ))}
    </ul>
  </Box>
);

const ProjectBrowser = memo(({ nonprofits, ranked, max, onToggle }) => {
  const [search, setSearch] = useState("");
  const hintId = useId();
  const visible = useMemo(
    () => filterProjectOptions(nonprofits, search),
    [nonprofits, search],
  );
  const atMax = ranked.length >= max;

  return (
    <section aria-labelledby="project-browser-heading">
      <h3
        id="project-browser-heading"
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: "1.15rem",
          margin: "0 0 8px",
        }}
      >
        Projects at this hackathon
      </h3>
      <TextField
        fullWidth
        size="small"
        label="Search by nonprofit, project or skill"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        // Enter in the search box must never advance the stepper.
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaSearch aria-hidden="true" />
            </InputAdornment>
          ),
        }}
      />
      <p
        id={hintId}
        role="status"
        style={{
          color: "var(--muted)",
          margin: "0 0 12px",
          minHeight: "1.5em",
        }}
      >
        {atMax ? `You've ranked ${max} — remove one to add another.` : ""}
      </p>
      {visible.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          No projects match “{search}”.{" "}
          <button
            type="button"
            className="ohx-link"
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            Clear search
          </button>
        </p>
      ) : (
        visible.map((nonprofit) => (
          <NonprofitCard
            key={nonprofit.id}
            nonprofit={nonprofit}
            ranked={ranked}
            atMax={atMax}
            hintId={hintId}
            onToggle={onToggle}
          />
        ))
      )}
    </section>
  );
});

ProjectBrowser.displayName = "ProjectBrowser";

export default ProjectBrowser;
