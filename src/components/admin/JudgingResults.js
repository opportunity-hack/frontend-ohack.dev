import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  ContentCopy as ContentCopyIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useAuthInfo } from "@propelauth/react";
import { buildCsv, csvFilename, downloadCsv } from "../../lib/csvExport";
import * as ga from "../../lib/ga";
import { useSnackbar } from "notistack";
import axios from "axios";
import judgeApi from "../../lib/judgeApi";
import {
  rankRound2Teams,
  formatSubmittedAt,
  TIE_BREAK_LABELS,
} from "./judging/resultsRanking";

// Sample standard deviation (n-1) across one team's judge totals.
const calculateStandardDeviation = (scores) => {
  if (scores.length <= 1) return 0;
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    (scores.length - 1);
  return Math.sqrt(variance);
};

const feedbackOf = (score) =>
  typeof score?.feedback === "object"
    ? score?.feedback?.general || ""
    : score?.feedback || "";

const TieChip = ({ row }) => {
  if (!row?.tieGroup) return null;
  const reason = row.tieBrokenBy ? TIE_BREAK_LABELS[row.tieBrokenBy] : null;
  return (
    <Tooltip
      title={
        reason
          ? `Tied on average score — placed below the team above it by ${reason}.`
          : "Tied on average score with the team(s) below — ranked by earliest project submission."
      }
    >
      <Chip
        size="small"
        variant="outlined"
        color="warning"
        icon={<ScheduleIcon />}
        label="Tie"
      />
    </Tooltip>
  );
};

/**
 * Final Round 2 results.
 *
 * Data: ONE bulk-scores call (`/api/judge/admin/scores/<event>/round2`) plus
 * the Round 2 panel assignments (for "n of m judges") — the previous version
 * fetched one request per (judge, team) pair plus one per judge.
 *
 * Ranking (see judging/resultsRanking.js): average score, ties broken by the
 * EARLIEST `project_submitted_at` (the first time the team pressed "Submit
 * your project" on its dashboard), then lower std dev.
 */
const JudgingResults = ({
  orgId,
  hackathons,
  selectedHackathon,
  setSelectedHackathon,
  onSnack,
}) => {
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  // No notistack provider in the app — mirror toasts to the host page.
  const notify = useCallback(
    (message, options = {}) => {
      enqueueSnackbar(message, options);
      if (typeof onSnack === "function")
        onSnack(message, options.variant || "info");
    },
    [enqueueSnackbar, onSnack],
  );

  const [selectedHackathonData, setSelectedHackathonData] = useState(null);
  const [round2Scores, setRound2Scores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [viewScoresDialog, setViewScoresDialog] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [nonprofitNames, setNonprofitNames] = useState({});
  const [loadingNonprofits, setLoadingNonprofits] = useState(false);
  const [panelAssignmentsCache, setPanelAssignmentsCache] = useState({});

  const eventTimezone = selectedHackathonData?.timezone;

  useEffect(() => {
    if (selectedHackathon && hackathons.length > 0) {
      setSelectedHackathonData(
        hackathons.find((h) => h.event_id === selectedHackathon) || null,
      );
    }
  }, [selectedHackathon, hackathons]);

  useEffect(() => {
    setPanelAssignmentsCache({});
    setRound2Scores([]);
  }, [selectedHackathon]);

  const fetchPanelAssignments = useCallback(
    async (panelId) => {
      if (panelAssignmentsCache[panelId]) return panelAssignmentsCache[panelId];
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panel/${panelId}/assignments`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Org-Id": orgId,
            },
          },
        );
        const assignments = response.data.assignments || [];
        setPanelAssignmentsCache((prev) => ({
          ...prev,
          [panelId]: assignments,
        }));
        return assignments;
      } catch (error) {
        console.error(
          `Error fetching assignments for panel ${panelId}:`,
          error,
        );
        return [];
      }
    },
    [accessToken, orgId, panelAssignmentsCache],
  );

  const fetchNonprofitNames = useCallback(
    async (teams) => {
      if (!teams || teams.length === 0) return;
      setLoadingNonprofits(true);
      const nonprofitIds = [
        ...new Set(
          teams
            .filter((t) => t.selected_nonprofit_id)
            .map((t) => t.selected_nonprofit_id),
        ),
      ];
      if (nonprofitIds.length === 0) {
        setLoadingNonprofits(false);
        return;
      }
      try {
        const results = await Promise.all(
          nonprofitIds.map(async (nonprofitId) => {
            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofitId}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "X-Org-Id": orgId,
                  },
                },
              );
              return {
                id: nonprofitId,
                name:
                  response.data.nonprofits.name || `Nonprofit ${nonprofitId}`,
              };
            } catch (error) {
              return { id: nonprofitId, name: `Nonprofit ${nonprofitId}` };
            }
          }),
        );
        const map = {};
        results.forEach((r) => {
          map[r.id] = r.name;
        });
        setNonprofitNames(map);
      } finally {
        setLoadingNonprofits(false);
      }
    },
    [accessToken, orgId],
  );

  const fetchRound2Scores = useCallback(async () => {
    if (!selectedHackathon || !selectedHackathonData) return;
    setLoadingScores(true);
    setLoadError(null);
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "X-Org-Id": orgId,
      };
      const panelsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels/${selectedHackathon}`,
        { headers },
      );
      const panels = panelsResponse.data.panels || [];
      const round2Panels = panels.filter((p) =>
        (p.panel_name || "").includes("Round 2"),
      );
      if (round2Panels.length === 0) {
        setRound2Scores([]);
        return;
      }

      // Everything else in parallel: per-panel assignments, ALL submitted
      // Round 2 scores in one call, and the event's teams.
      const [allPanelAssignments, bulk, teamsResponse] = await Promise.all([
        Promise.all(
          round2Panels.map((panel) => fetchPanelAssignments(panel.id)),
        ),
        judgeApi.getBulkScores(selectedHackathon, "round2", accessToken, orgId),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${selectedHackathonData.id}`,
          { headers },
        ),
      ]);
      const flatAssignments = allPanelAssignments.flat();
      const round2TeamIds = [...new Set(flatAssignments.map((a) => a.team_id))];
      const allTeams = teamsResponse.data.teams || [];
      const round2Teams = allTeams.filter((team) =>
        round2TeamIds.includes(team.id),
      );
      await fetchNonprofitNames(round2Teams);

      const scoresByTeam = new Map();
      (bulk?.scores || []).forEach((s) => {
        if (!scoresByTeam.has(s.team_id)) scoresByTeam.set(s.team_id, []);
        scoresByTeam.get(s.team_id).push(s);
      });

      const teamScores = round2Teams.map((team) => {
        const assignedJudgeIds = new Set(
          flatAssignments
            .filter((a) => a.team_id === team.id)
            .map((a) => a.judge_id),
        );
        const scores = (scoresByTeam.get(team.id) || []).map((s) => ({
          judge: {
            name: s.judge_name || `Judge ${s.judge_id}`,
            user_id: s.judge_id,
          },
          score: {
            total_score: s.total_score,
            scores: s.scores,
            feedback: s.feedback,
            is_draft: false,
            created_at: s.created_at,
            submitted_at: s.submitted_at,
          },
          assigned: assignedJudgeIds.has(s.judge_id),
        }));
        const totals = scores.map((s) => s.score.total_score || 0);
        const judgeCount = scores.length;
        const totalScore = totals.reduce((sum, v) => sum + v, 0);
        const submittedByAssigned = scores.filter((s) => s.assigned).length;
        return {
          team,
          scores,
          judgeCount,
          totalScore,
          averageScore: judgeCount > 0 ? totalScore / judgeCount : 0,
          standardDeviation:
            judgeCount > 0 ? calculateStandardDeviation(totals) : 0,
          totalAssignedJudges: assignedJudgeIds.size,
          completionPercentage:
            assignedJudgeIds.size > 0
              ? (submittedByAssigned / assignedJudgeIds.size) * 100
              : 0,
        };
      });

      setRound2Scores(rankRound2Teams(teamScores));
    } catch (error) {
      console.error("Error fetching Round 2 scores:", error);
      setLoadError(error?.message || "Failed to fetch Round 2 scores");
      notify("Failed to fetch Round 2 scores", { variant: "error" });
    } finally {
      setLoadingScores(false);
    }
  }, [
    selectedHackathon,
    selectedHackathonData,
    accessToken,
    orgId,
    fetchPanelAssignments,
    fetchNonprofitNames,
    notify,
  ]);

  useEffect(() => {
    if (selectedHackathon && selectedHackathonData) {
      fetchRound2Scores();
    }
  }, [selectedHackathon, selectedHackathonData?.id]);

  // Derive the open dialog's row from live state (stale-snapshot lesson).
  const selectedTeamScores = selectedTeamId
    ? round2Scores.find((r) => r.team.id === selectedTeamId) || null
    : null;

  const viewTeamScores = (row) => {
    setSelectedTeamId(row.team.id);
    setViewScoresDialog(true);
  };

  const nonprofitLabel = (team) =>
    team?.selected_nonprofit_id
      ? nonprofitNames[team.selected_nonprofit_id] || "Loading..."
      : "No nonprofit";

  const getTrophyColor = (index) => {
    switch (index) {
      case 0:
        return "warning";
      case 1:
        return "action";
      case 2:
        return "#CD7F32";
      default:
        return "action";
    }
  };

  const exportResults = () => {
    if (round2Scores.length === 0) {
      notify("No results to export", { variant: "warning" });
      return;
    }
    const columns = [
      { key: "rank", label: "Rank" },
      { key: "team", label: "Team Name", get: (r) => r.team?.name },
      {
        key: "nonprofit",
        label: "Nonprofit",
        get: (r) =>
          r.team?.selected_nonprofit_id
            ? nonprofitNames[r.team.selected_nonprofit_id] || "Unknown"
            : "No nonprofit",
      },
      {
        key: "averageScore",
        label: "Average Score",
        get: (r) => (r.judgeCount > 0 ? r.averageScore.toFixed(2) : "N/A"),
      },
      {
        key: "totalScore",
        label: "Total Score",
        get: (r) => (r.judgeCount > 0 ? r.totalScore.toFixed(1) : "N/A"),
      },
      {
        key: "standardDeviation",
        label: "Std Dev",
        get: (r) => (r.judgeCount > 1 ? r.standardDeviation.toFixed(2) : ""),
      },
      { key: "judgeCount", label: "Judges Complete" },
      { key: "totalAssignedJudges", label: "Total Assigned" },
      {
        key: "completionPercentage",
        label: "Completion %",
        get: (r) => `${(r.completionPercentage ?? 0).toFixed(0)}%`,
      },
      {
        key: "project_submitted_at",
        label: "Project submitted (ISO)",
        get: (r) => r.team?.project_submitted_at || "",
      },
      {
        key: "project_submitted_local",
        label: `Project submitted (${eventTimezone || "America/Phoenix"})`,
        get: (r) =>
          formatSubmittedAt(r.team?.project_submitted_at, eventTimezone) || "",
      },
      {
        key: "tie",
        label: "Tie",
        get: (r) => (r.tieGroup ? `Tie group ${r.tieGroup}` : ""),
      },
      {
        key: "tieBrokenBy",
        label: "Tie broken by",
        get: (r) => (r.tieBrokenBy ? TIE_BREAK_LABELS[r.tieBrokenBy] : ""),
      },
    ];
    const filename = csvFilename(
      selectedHackathon || selectedHackathonData?.title || "hackathon",
      "round2-results",
    );
    downloadCsv(filename, buildCsv(round2Scores, columns));
    ga.trackStructuredEvent(
      ga.EventCategory.ADMIN,
      "admin_csv_export",
      "judging_round2_results",
      round2Scores.length,
      {
        event_id: selectedHackathon || undefined,
      },
    );
    notify("Results exported successfully!", { variant: "success" });
  };

  const copyAllFeedback = (row) => {
    if (!row || row.scores.length === 0) {
      notify("No feedback available to copy", { variant: "warning" });
      return;
    }
    const text = [
      `=== Feedback for ${row.team.name} ===`,
      `Average Score: ${row.averageScore.toFixed(1)}`,
      `Total Score: ${row.totalScore.toFixed(1)}`,
      `Judges Complete: ${row.judgeCount}/${row.totalAssignedJudges}`,
      "",
      "--- Individual Judge Feedback ---",
      ...row.scores.map(
        (js) =>
          `Judge Feedback: ${feedbackOf(js.score) || "No feedback provided"}\n`,
      ),
    ].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        notify("All feedback copied to clipboard!", { variant: "success" });
      })
      .catch(() => {
        notify("Failed to copy feedback to clipboard", { variant: "error" });
      });
  };

  const WinnerPodium = ({ winners }) => (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mb: 4, fontWeight: "bold" }}
      >
        🏆 Final Results 🏆
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {winners.slice(0, 3).map((row, index) => (
          <Grid size={{ xs: 12, sm: 4 }} key={row.team.id}>
            <Card
              sx={{
                textAlign: "center",
                border:
                  index === 0
                    ? "3px solid gold"
                    : index === 1
                      ? "2px solid silver"
                      : "1px solid #CD7F32",
                backgroundColor:
                  index === 0 ? "rgba(255, 215, 0, 0.1)" : "inherit",
                minHeight: 260,
              }}
            >
              <CardContent>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    fontSize: "2rem",
                    bgcolor:
                      index === 0
                        ? "warning.main"
                        : index === 1
                          ? "grey.400"
                          : "#CD7F32",
                  }}
                >
                  {row.rank}
                </Avatar>
                <Typography
                  variant={index === 0 ? "h5" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {row.team.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {nonprofitLabel(row.team)}
                </Typography>
                {row.tieGroup && (
                  <Box sx={{ mb: 1 }}>
                    <TieChip row={row} />
                  </Box>
                )}
                {row.judgeCount > 0 ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h4"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                      >
                        {row.averageScore.toFixed(1)}
                      </Typography>
                      <Box sx={{ display: "flex" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            sx={{
                              fontSize: 20,
                              color:
                                star <= row.averageScore / 2
                                  ? "warning.main"
                                  : "action.disabled",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Chip
                      label={`${row.judgeCount}/${row.totalAssignedJudges} judges`}
                      size="small"
                      color={
                        row.completionPercentage === 100 ? "success" : "warning"
                      }
                      variant="outlined"
                    />
                    {row.team.project_submitted_at && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Project submitted{" "}
                        {formatSubmittedAt(
                          row.team.project_submitted_at,
                          eventTimezone,
                        )}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Typography
                      variant="h4"
                      color="text.secondary"
                      sx={{ fontWeight: "bold", mb: 2 }}
                    >
                      --
                    </Typography>
                    <Chip
                      label={`0/${row.totalAssignedJudges} judges`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Awaiting scores
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const anyTies = round2Scores.some((r) => r.tieGroup);

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Select Hackathon</InputLabel>
            <Select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              label="Select Hackathon"
            >
              {hackathons.map((hackathon) => (
                <MenuItem key={hackathon.event_id} value={hackathon.event_id}>
                  {hackathon.event_id} -{" "}
                  {new Date(hackathon.start_date).toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportResults}
              disabled={round2Scores.length === 0 || loadingScores}
            >
              Export Results
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print Results
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                notify("Results URL copied to clipboard!", {
                  variant: "success",
                });
              }}
            >
              Share Results
            </Button>
            <Button
              variant="text"
              onClick={fetchRound2Scores}
              disabled={loadingScores}
            >
              Refresh
            </Button>
          </Box>
        </Grid>
      </Grid>

      {!selectedHackathon ? (
        <Alert severity="info">
          Please select a hackathon to view final results.
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>How ties are broken:</strong> teams with the same average
              score are ranked by the earliest project submission — the first
              time the team pressed <em>Submit your project</em> on its
              dashboard ({eventTimezone || "America/Phoenix"} time shown). A
              team that never submitted loses the tie. If that still ties, the
              lower standard deviation (more consistent judges) wins.
            </Typography>
          </Alert>

          {loadError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Button size="small" onClick={fetchRound2Scores}>
                  Retry
                </Button>
              }
            >
              {loadError}
            </Alert>
          )}

          {loadingScores ? (
            <Box>
              <Skeleton
                variant="text"
                width={300}
                height={40}
                sx={{ mx: "auto", mb: 4 }}
              />
              <Grid container spacing={3} justifyContent="center">
                {[1, 2, 3].map((item) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={item}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Skeleton
                          variant="circular"
                          width={80}
                          height={80}
                          sx={{ mx: "auto", mb: 2 }}
                        />
                        <Skeleton
                          variant="text"
                          width={150}
                          height={30}
                          sx={{ mx: "auto", mb: 1 }}
                        />
                        <Skeleton
                          variant="text"
                          width={100}
                          height={20}
                          sx={{ mx: "auto", mb: 2 }}
                        />
                        <Skeleton
                          variant="text"
                          width={80}
                          height={40}
                          sx={{ mx: "auto" }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : round2Scores.length === 0 ? (
            <Alert severity="warning" icon={<TrophyIcon />}>
              No Round 2 results found. Make sure Round 2 judging has been set
              up and scores have been submitted.
            </Alert>
          ) : (
            <>
              {round2Scores.some((ts) => ts.completionPercentage < 100) && (
                <Alert severity="info" sx={{ mb: 3 }} icon={<TrophyIcon />}>
                  <Typography variant="body2">
                    <strong>Partial Results:</strong> Some teams are still
                    awaiting judge scores. Rankings shown are based on currently
                    available scores and may change as judging completes.
                  </Typography>
                </Alert>
              )}

              {anyTies && (
                <Alert
                  severity="warning"
                  sx={{ mb: 3 }}
                  icon={<ScheduleIcon />}
                >
                  <Typography variant="body2">
                    <strong>Tie detected.</strong> Rows marked <em>Tie</em>{" "}
                    share an average score; their order follows the earliest
                    project submission time shown in the table.
                  </Typography>
                </Alert>
              )}

              <WinnerPodium winners={round2Scores} />

              <Accordion defaultExpanded sx={{ mb: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Complete Results ({round2Scores.length} teams)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Team Name</TableCell>
                          <TableCell>Nonprofit</TableCell>
                          <TableCell align="center">Completion</TableCell>
                          <TableCell align="center">Average Score</TableCell>
                          <TableCell align="center">Total Score</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Standard deviation of judge totals — lower means more consistent scoring; used only if the submission time can't break a tie">
                              <span>Std Dev</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="First time the team pressed “Submit your project” on its dashboard — the tie-breaker">
                              <span>Project submitted</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {round2Scores.map((row) => {
                          const {
                            team,
                            averageScore,
                            judgeCount,
                            totalScore,
                            totalAssignedJudges,
                            completionPercentage,
                            standardDeviation,
                            rank,
                          } = row;
                          const top3 = rank <= 3 && judgeCount > 0;
                          const submitted = formatSubmittedAt(
                            team.project_submitted_at,
                            eventTimezone,
                          );
                          return (
                            <TableRow
                              key={team.id}
                              sx={{
                                backgroundColor: top3
                                  ? "action.selected"
                                  : row.tieGroup
                                    ? "rgba(255, 193, 7, 0.06)"
                                    : "inherit",
                              }}
                            >
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {top3 && (
                                    <TrophyIcon
                                      sx={{
                                        color: getTrophyColor(rank - 1),
                                        fontSize: 24,
                                      }}
                                    />
                                  )}
                                  <Typography
                                    variant={top3 ? "h6" : "body1"}
                                    sx={{ fontWeight: top3 ? 600 : 400 }}
                                  >
                                    #{rank}
                                  </Typography>
                                  <TieChip row={row} />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: top3 ? 600 : 400 }}
                                >
                                  {team.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {loadingNonprofits
                                    ? "Loading..."
                                    : nonprofitLabel(team)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${judgeCount}/${totalAssignedJudges}`}
                                  size="small"
                                  color={
                                    judgeCount === 0
                                      ? "error"
                                      : completionPercentage === 100
                                        ? "success"
                                        : "warning"
                                  }
                                  variant="outlined"
                                />
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  {completionPercentage.toFixed(0)}%
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {judgeCount > 0 ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {averageScore.toFixed(2)}
                                    </Typography>
                                    <Box sx={{ display: "flex" }}>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                          key={star}
                                          sx={{
                                            fontSize: 16,
                                            color:
                                              star <= averageScore / 2
                                                ? "warning.main"
                                                : "action.disabled",
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    No scores
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {totalScore.toFixed(1)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="body2"
                                  color={
                                    judgeCount > 1
                                      ? "text.primary"
                                      : "text.secondary"
                                  }
                                  sx={{ fontWeight: 500 }}
                                >
                                  {judgeCount > 1
                                    ? standardDeviation.toFixed(2)
                                    : judgeCount === 1
                                      ? "N/A"
                                      : "—"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {submitted ? (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: row.tieGroup ? 600 : 400,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {submitted}
                                  </Typography>
                                ) : (
                                  <Tooltip title="No submission recorded — the team never pressed Submit your project">
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Not submitted
                                    </Typography>
                                  </Tooltip>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant={top3 ? "contained" : "outlined"}
                                  startIcon={<ViewIcon />}
                                  onClick={() => viewTeamScores(row)}
                                  disabled={
                                    totalAssignedJudges === 0 &&
                                    judgeCount === 0
                                  }
                                  sx={{ minWidth: 120 }}
                                >
                                  {judgeCount === 0
                                    ? "View Assignments"
                                    : "View Details"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </>
      )}

      <Dialog
        open={viewScoresDialog}
        onClose={() => setViewScoresDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrophyIcon />
            Round 2{" "}
            {selectedTeamScores?.judgeCount > 0
              ? "Scores"
              : "Assignments"}: {selectedTeamScores?.team?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTeamScores && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {selectedTeamScores.averageScore.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">Average Score</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="secondary">
                        {selectedTeamScores.judgeCount}/
                        {selectedTeamScores.totalAssignedJudges}
                      </Typography>
                      <Typography variant="body2">Judges Complete</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="warning.main">
                        #{selectedTeamScores.rank}
                      </Typography>
                      <Typography variant="body2">Current Rank</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mt: 1 }}
                      >
                        {formatSubmittedAt(
                          selectedTeamScores.team.project_submitted_at,
                          eventTimezone,
                        ) || "Not submitted"}
                      </Typography>
                      <Typography variant="body2">Project submitted</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="h6">
                  {selectedTeamScores.scores.length > 0
                    ? "Individual Judge Scores"
                    : "Judge Assignments"}
                </Typography>
                {selectedTeamScores.scores.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyAllFeedback(selectedTeamScores)}
                  >
                    Copy All Feedback
                  </Button>
                )}
              </Box>

              {selectedTeamScores.totalAssignedJudges === 0 &&
              selectedTeamScores.scores.length === 0 ? (
                <Alert severity="warning">
                  No judges have been assigned to evaluate this team in Round 2.
                </Alert>
              ) : selectedTeamScores.scores.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Judge</TableCell>
                        {Object.keys(
                          selectedTeamScores.scores[0]?.score?.scores || {},
                        )
                          .filter((k) => k.toLowerCase() !== "total")
                          .map((criteria) => (
                            <TableCell key={criteria} align="center">
                              {criteria
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </TableCell>
                          ))}
                        <TableCell align="center">Total</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell>Feedback</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTeamScores.scores.map((judgeScore, index) => (
                        <TableRow key={`${judgeScore.judge.user_id || index}`}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {judgeScore.judge.name}
                            </Typography>
                            {!judgeScore.assigned && (
                              <Tooltip title="This judge is no longer assigned to the team; the score still counts.">
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  unassigned
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                          {Object.entries(judgeScore.score?.scores || {})
                            .filter(([k]) => k.toLowerCase() !== "total")
                            .map(([criteria, score]) => (
                              <TableCell key={criteria} align="center">
                                {score ?? "—"}
                              </TableCell>
                            ))}
                          <TableCell align="center">
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {judgeScore.score?.total_score || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {judgeScore.score?.submitted_at
                                ? new Date(
                                    judgeScore.score.submitted_at,
                                  ).toLocaleString()
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {feedbackOf(judgeScore.score) ||
                                "No feedback provided"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  This team has been assigned to{" "}
                  {selectedTeamScores.totalAssignedJudges} judge(s) but no
                  scores have been submitted yet.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewScoresDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JudgingResults;
