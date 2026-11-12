import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { FaCheck, FaCheckCircle } from "react-icons/fa";

/**
 * Admin "Nonprofit Assignment" tab of the Teams edit dialog (module-scope,
 * extracted from TeamManagement so it can be tested without the 4k-line
 * host). Approval requires the EXACT project (problem statement), not just
 * the nonprofit.
 *
 * Project titles come from `GET /api/team/<event_id>/project-options` —
 * `projectOptions` is `{status: "idle"|"loading"|"ready"|"error",
 * nonprofits: [{id, name, projects:[{id,title}]}]}`.
 */

const asArray = (v) => (Array.isArray(v) ? v : []);

/** Selectable projects for one nonprofit (empty when unknown). */
export function projectsForNonprofit(projectOptions, nonprofitId) {
  if (!nonprofitId) return [];
  const np = asArray(projectOptions?.nonprofits).find(
    (n) => n.id === nonprofitId,
  );
  return asArray(np?.projects);
}

/**
 * The project to preselect for `nonprofitId`: the team's assigned project
 * (if it belongs to that nonprofit), else the team's highest-ranked project
 * for it, else the only project when there's exactly one, else "".
 */
export function defaultProjectFor(
  team,
  nonprofitId,
  projects,
  assignedProjectId,
) {
  if (!nonprofitId) return "";
  const list = asArray(projects);
  const offered = (id) => list.length === 0 || list.some((p) => p.id === id);
  if (assignedProjectId && list.some((p) => p.id === assignedProjectId)) {
    return assignedProjectId;
  }
  const ranked = asArray(team?.nonprofit_rankings)
    .filter(
      (r) => r && r.nonprofit_id === nonprofitId && r.problem_statement_id,
    )
    .sort((a, b) => (Number(a.rank) || 0) - (Number(b.rank) || 0))
    .find((r) => offered(r.problem_statement_id));
  if (ranked) return ranked.problem_statement_id;
  if (list.length === 1) return list[0].id;
  return "";
}

/**
 * Whether approval may proceed. Projects must be loaded; when the chosen
 * nonprofit has selectable projects, one must be picked. A nonprofit with
 * no selectable projects is left to the backend to decide.
 */
export function approvalBlockedReason({
  nonprofitId,
  projectId,
  projectOptions,
}) {
  if (!nonprofitId) return "Select a nonprofit first";
  if (projectOptions?.status === "error")
    return "The project list couldn't load — retry it first";
  if (projectOptions?.status !== "ready") return "Loading projects…";
  const projects = projectsForNonprofit(projectOptions, nonprofitId);
  if (projects.length > 0 && !projectId) return "Select the project first";
  return null;
}

export default function ProjectAssignmentPanel({
  team,
  nonprofitOptions,
  nonprofitSource,
  getNonprofitName,
  projectOptions,
  selectedProjectId,
  assignedProjectId,
  savingProject,
  onNonprofitChange,
  onProjectChange,
  onAssignRanking,
  onApproveClick,
  onSaveProject,
  onRetryProjects,
}) {
  if (!team) return null;

  const rankings = asArray(team.nonprofit_rankings);
  const hasRankings = rankings.length > 0;
  const hasOptions = asArray(nonprofitOptions).length > 0;
  const nonprofitId = team.selected_nonprofit_id || "";
  const isInReview = (team.status || "IN_REVIEW") === "IN_REVIEW";
  const projects = projectsForNonprofit(projectOptions, nonprofitId);
  const projectTitle = (id) => {
    for (const np of asArray(projectOptions?.nonprofits)) {
      const hit = asArray(np.projects).find((p) => p.id === id);
      if (hit) return hit.title;
    }
    return null;
  };
  const blocked = approvalBlockedReason({
    nonprofitId,
    projectId: selectedProjectId,
    projectOptions,
  });
  const projectsLoading =
    projectOptions?.status === "loading" || projectOptions?.status === "idle";
  const projectChanged =
    !isInReview &&
    Boolean(selectedProjectId) &&
    selectedProjectId !== assignedProjectId;

  return (
    <Card elevation={1} sx={{ mb: 3 }}>
      <CardHeader
        title="Nonprofit & project assignment"
        subheader={
          hasRankings
            ? "Current selection and the team's ranked projects"
            : "Manually assign a nonprofit and project to this team"
        }
      />
      <Divider />
      <CardContent>
        {!hasRankings && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This team has no rankings on file — the team creation flow was not
            completed for this hackathon. You can still assign a nonprofit and
            project below.
          </Alert>
        )}
        {!hasOptions && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No nonprofits are attached to this hackathon, and the global
            fallback returned no nonprofits either. Add nonprofits to the
            hackathon (Admin → Hackathons → this event → Nonprofits) and reopen
            this dialog.
          </Alert>
        )}
        {hasOptions && nonprofitSource === "all" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing all nonprofits as a fallback because none are attached to
            this hackathon.
          </Alert>
        )}
        {projectOptions?.status === "error" && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={onRetryProjects}>
                Retry
              </Button>
            }
          >
            Couldn&apos;t load this hackathon&apos;s projects.
          </Alert>
        )}

        <Box
          sx={{
            mb: 3,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="nonprofit-select-label">
              Assigned Nonprofit
            </InputLabel>
            <Select
              labelId="nonprofit-select-label"
              value={nonprofitId}
              onChange={(e) => onNonprofitChange(e.target.value)}
              label="Assigned Nonprofit"
              disabled={!hasOptions}
            >
              <MenuItem value="">
                <em>Not assigned yet</em>
              </MenuItem>
              {asArray(nonprofitOptions).map((nonprofit) => (
                <MenuItem key={nonprofit.id} value={nonprofit.id}>
                  {nonprofit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            disabled={!nonprofitId || projects.length === 0}
          >
            <InputLabel id="project-select-label">Project</InputLabel>
            <Select
              labelId="project-select-label"
              value={
                projects.some((p) => p.id === selectedProjectId)
                  ? selectedProjectId
                  : ""
              }
              onChange={(e) => onProjectChange(e.target.value)}
              label="Project"
            >
              <MenuItem value="">
                <em>Not chosen yet</em>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {!nonprofitId
                ? "Pick a nonprofit first."
                : projectsLoading
                  ? "Loading projects…"
                  : projects.length === 0
                    ? "No selectable projects for this nonprofit."
                    : projects.length === 1
                      ? "This nonprofit has one project."
                      : `${projects.length} projects — pick the one this team builds.`}
            </FormHelperText>
          </FormControl>
        </Box>

        {isInReview ? (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 1,
              bgcolor: "#e8f5e9",
              border: 1,
              borderColor: "success.light",
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {blocked ? "Not ready to approve yet" : "Ready to approve"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {blocked
                  ? `${blocked}. Approving notifies the team, creates its repo and sets their status to Nonprofit Selected.`
                  : `Approving notifies the team and assigns them to ${
                      projectTitle(selectedProjectId)
                        ? `“${projectTitle(selectedProjectId)}” · `
                        : ""
                    }${getNonprofitName(nonprofitId)}.`}
              </Typography>
            </Box>
            <Tooltip title={blocked || ""}>
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FaCheckCircle />}
                  disabled={Boolean(blocked)}
                  onClick={onApproveClick}
                >
                  Approve Team
                </Button>
              </span>
            </Tooltip>
          </Box>
        ) : (
          <Alert
            severity="success"
            icon={<FaCheckCircle />}
            sx={{ mb: 3 }}
            action={
              projectChanged ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={onSaveProject}
                  disabled={savingProject}
                >
                  {savingProject ? (
                    <CircularProgress size={16} />
                  ) : (
                    "Save project"
                  )}
                </Button>
              ) : null
            }
          >
            This team has been approved
            {nonprofitId
              ? ` and assigned to ${getNonprofitName(nonprofitId)}`
              : ""}
            {assignedProjectId
              ? ` — project “${projectTitle(assignedProjectId) || assignedProjectId}”`
              : " — no project recorded yet"}
            .
            {projectChanged &&
              " Save to move the team to the selected project."}
          </Alert>
        )}

        {hasRankings && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Team&apos;s ranked projects
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Nonprofit</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Assign</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankings.map((ranking, index) => {
                    const psId = ranking.problem_statement_id || null;
                    const npName =
                      asArray(nonprofitOptions).find(
                        (n) => n.id === ranking.nonprofit_id,
                      )?.name || "Unknown Nonprofit";
                    const isSelected =
                      nonprofitId === ranking.nonprofit_id &&
                      (psId ? selectedProjectId === psId : true);
                    const title = psId ? projectTitle(psId) : null;
                    return (
                      <TableRow
                        key={`${ranking.nonprofit_id}:${psId || index}`}
                        selected={isSelected}
                      >
                        <TableCell>{ranking.rank ?? index + 1}</TableCell>
                        <TableCell>
                          {!psId ? (
                            "—"
                          ) : title ? (
                            title
                          ) : (
                            <Tooltip title={psId}>
                              <span style={{ color: "#8A8F9A" }}>
                                No longer offered
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{npName}</TableCell>
                        <TableCell>
                          {isSelected ? (
                            <Chip
                              size="small"
                              color="primary"
                              label="Selected"
                              icon={<FaCheck />}
                            />
                          ) : (
                            <Chip
                              size="small"
                              variant="outlined"
                              label="Not Selected"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={isSelected}
                            onClick={() =>
                              onAssignRanking({
                                nonprofitId: ranking.nonprofit_id,
                                projectId: title ? psId : "",
                              })
                            }
                            aria-label={`Assign rank ${ranking.rank ?? index + 1}${
                              title ? `: ${title}` : ""
                            }`}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
