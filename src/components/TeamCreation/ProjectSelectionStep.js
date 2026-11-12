import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";
import ProjectRanking from "./ProjectRanking";
import ProjectBrowser from "./ProjectBrowser";

/**
 * "Choose projects" step. Owns the load states of the project-options
 * request: a skeleton while loading, a Retry card on any failure (a 404 means
 * the backend doesn't serve the route yet), and an honest empty card only
 * after a SUCCESSFUL response said there are no projects.
 */

const StateCard = ({ children, onRetry, role = "status" }) => (
  <Box
    className="ohx-card"
    role={role}
    sx={{ p: 3, textAlign: "center", minHeight: 120 }}
  >
    <p style={{ color: "var(--muted)", margin: "0 0 12px" }}>{children}</p>
    {onRetry && (
      <button
        type="button"
        className="ohx-btn ohx-btn--ghost"
        onClick={onRetry}
      >
        Retry
      </button>
    )}
  </Box>
);

const ProjectSelectionStep = memo(
  ({ options, ranked, limits, onToggle, onMove, onRemove }) => {
    const { status, nonprofits, reload } = options;

    let body;
    if (status === "error") {
      body = (
        <StateCard role="alert" onRetry={reload}>
          We couldn&apos;t load this hackathon&apos;s projects just now.
        </StateCard>
      );
    } else if (status !== "ready" || !nonprofits) {
      body = (
        <Box aria-busy="true" aria-label="Loading projects">
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2, mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={220}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      );
    } else if (nonprofits.length === 0) {
      body = (
        <StateCard onRetry={reload}>
          No projects are open for teams at this hackathon yet. Organizers add
          them before team formation — check back soon, or ask in Slack.
        </StateCard>
      );
    } else {
      body = (
        <>
          <ProjectRanking
            ranked={ranked}
            limits={limits}
            onMove={onMove}
            onRemove={onRemove}
          />
          <ProjectBrowser
            nonprofits={nonprofits}
            ranked={ranked}
            max={limits.max}
            onToggle={onToggle}
          />
        </>
      );
    }

    return (
      <Box>
        <h2
          style={{
            fontFamily: "var(--display)",
            fontWeight: 600,
            fontSize: "1.4rem",
            margin: "0 0 8px",
          }}
        >
          Choose the projects you want to build
        </h2>
        <p
          style={{
            color: "var(--muted)",
            margin: "0 0 20px",
            maxWidth: "40em",
          }}
        >
          Each nonprofit can have several projects. Rank{" "}
          {limits.min === limits.max
            ? limits.max
            : `${limits.min} to ${limits.max}`}{" "}
          you&apos;d be excited to work on — they can come from the same
          nonprofit. Organizers assign each team one project, using your order.
        </p>
        {body}
      </Box>
    );
  },
);

ProjectSelectionStep.displayName = "ProjectSelectionStep";

export default ProjectSelectionStep;
