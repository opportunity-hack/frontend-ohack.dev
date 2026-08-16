import { FONT_BODY } from "../../styles/fonts";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { normalizeImageUrl } from "../../lib/imageUtils";

// Refined nonprofit / project picker for the event page. Lives inside the
// page's <RefinedRoot>, so it uses the .ohx-* utility classes. Logic (view
// toggle + project fetch) is unchanged from the original.

const PLACEHOLDER =
  "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Light_Blue_Square.png";
const PRODUCTION_STATUSES = new Set(["production", "post-hackathon"]);

const toggleSx = {
  "& .MuiToggleButton-root": {
    textTransform: "none",
    border: "1px solid var(--line)",
    color: "var(--muted)",
    fontFamily: FONT_BODY,
    fontWeight: 500,
    px: 1.5,
    py: 0.6,
    "&.Mui-selected": {
      backgroundColor: "var(--brand)",
      color: "#fff",
      "&:hover": { backgroundColor: "#16315a" },
    },
  },
};

const clamp = (text, n) =>
  text && text.length > n ? `${text.substring(0, n)}…` : text;

const NonprofitList = ({
  nonprofits,
  teams,
  eventId,
  visibleProblemStatements,
}) => {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ohack_hackathon_view") || "nonprofits";
    }
    return "nonprofits";
  });
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const projectIdMap = useMemo(() => {
    const map = {};
    if (!nonprofits) return map;
    nonprofits.forEach((npo) => {
      (npo.problem_statements || []).forEach((psId) => {
        if (
          !visibleProblemStatements ||
          visibleProblemStatements.includes(psId)
        ) {
          if (!map[psId]) map[psId] = [];
          map[psId].push({ nonprofitId: npo.id, nonprofitName: npo.name });
        }
      });
    });
    return map;
  }, [nonprofits, visibleProblemStatements]);

  useEffect(() => {
    const projectIds = Object.keys(projectIdMap);
    if (viewMode !== "projects" || projectIds.length === 0) return;
    if (projects.length > 0) return;

    let cancelled = false;
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`,
        );
        if (!cancelled && response.data?.problem_statements) {
          setProjects(
            response.data.problem_statements.filter((ps) =>
              projectIds.includes(ps.id),
            ),
          );
        }
      } catch (err) {
        console.error("Error fetching projects for hackathon view:", err);
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    };
    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, [viewMode, projectIdMap, projects.length]);

  const handleViewChange = (_, newView) => {
    if (newView) {
      setViewMode(newView);
      if (typeof window !== "undefined")
        localStorage.setItem("ohack_hackathon_view", newView);
    }
  };

  const gridStyle = {
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  };

  if (!nonprofits || nonprofits.length === 0) {
    return (
      <Box component="section" sx={{ my: 4 }}>
        <div
          className="ohx-card"
          style={{ padding: "40px 28px", textAlign: "center" }}
        >
          <h2
            className="ohx-display"
            id="nonprofit-section-heading"
            style={{ fontSize: "1.4rem" }}
          >
            No nonprofits yet
          </h2>
          <p className="ohx-muted" style={{ margin: "10px 0 18px" }}>
            Be the first nonprofit to participate in this event.
          </p>
          <Link href="/nonprofits/apply" className="ohx-btn ohx-btn--primary">
            Apply as a nonprofit
          </Link>
        </div>
      </Box>
    );
  }

  const renderNonprofitsView = () => (
    <div style={gridStyle}>
      {nonprofits.map((nonprofit) => (
        <Link
          key={nonprofit.id}
          href={`/nonprofit/${nonprofit.id}`}
          className="ohx-card ohx-card--hover"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            textDecoration: "none",
            color: "inherit",
          }}
          aria-label={`View ${nonprofit.name} projects and ways to help`}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              background: "var(--surface-2)",
            }}
          >
            <Image
              src={normalizeImageUrl(nonprofit.image) || PLACEHOLDER}
              alt={`${nonprofit.name} logo or image`}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              loading="lazy"
            />
          </div>
          <div
            style={{
              padding: "20px 22px 18px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>
              {nonprofit.name}
            </h3>
            <p
              className="ohx-muted"
              style={{
                margin: "10px 0 0",
                fontSize: "0.93rem",
                lineHeight: 1.55,
              }}
            >
              {clamp(nonprofit.description, 110)}
            </p>
            <span
              className="ohx-link"
              style={{ marginTop: "auto", paddingTop: 16, fontSize: "0.9rem" }}
            >
              View projects &amp; ways to help →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderProjectsView = () => {
    if (projectsLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress sx={{ color: "#1B3A6B" }} />
        </Box>
      );
    }
    if (projects.length === 0) {
      return (
        <p className="ohx-muted" style={{ padding: "8px 0" }}>
          No projects found for this hackathon.
        </p>
      );
    }
    return (
      <div style={gridStyle}>
        {projects.map((project) => {
          const npoInfoList = projectIdMap[project.id] || [];
          const isLive = PRODUCTION_STATUSES.has(project.status);
          return (
            <div
              key={project.id}
              className="ohx-card ohx-card--hover"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  padding: "22px 22px 18px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {project.status && (
                    <span
                      className={`ohx-tag${isLive ? " ohx-tag--accent" : ""}`}
                    >
                      {project.status}
                    </span>
                  )}
                  {npoInfoList.map((npoInfo) => (
                    <Link
                      key={npoInfo.nonprofitId}
                      href={`/nonprofit/${npoInfo.nonprofitId}`}
                      className="ohx-tag"
                      style={{ textDecoration: "none" }}
                    >
                      {npoInfo.nonprofitName}
                    </Link>
                  ))}
                </div>
                <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>
                  {project.title}
                </h3>
                <p
                  className="ohx-muted"
                  style={{
                    margin: "10px 0 0",
                    fontSize: "0.93rem",
                    lineHeight: 1.55,
                  }}
                >
                  {clamp(project.description, 150)}
                </p>
                <Link
                  href={`/project/${project.id}`}
                  className="ohx-link"
                  style={{
                    marginTop: "auto",
                    paddingTop: 16,
                    fontSize: "0.9rem",
                  }}
                >
                  View project details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Box component="section" sx={{ my: { xs: 4, md: 5 } }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 10,
        }}
      >
        <div>
          <span className="ohx-eyebrow">Step 2</span>
          <h2
            id="nonprofit-section-heading"
            className="ohx-display"
            style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", marginTop: 8 }}
          >
            Choose your hackathon project
          </h2>
        </div>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
          aria-label="Switch between nonprofits and projects view"
          sx={toggleSx}
        >
          <ToggleButton value="nonprofits" aria-label="View by nonprofit">
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="small" /> Nonprofits
          </ToggleButton>
          <ToggleButton value="projects" aria-label="View by project">
            <AssignmentIcon sx={{ mr: 0.5 }} fontSize="small" /> Projects
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <p
        className="ohx-muted"
        style={{ marginTop: 0, marginBottom: 24, fontSize: "0.95rem" }}
      >
        {viewMode === "nonprofits"
          ? "Browse by nonprofit organization. Open one to see their specific projects."
          : "Browse all projects directly. Each shows which nonprofit it belongs to."}
      </p>
      {viewMode === "nonprofits"
        ? renderNonprofitsView()
        : renderProjectsView()}
    </Box>
  );
};

export default NonprofitList;
