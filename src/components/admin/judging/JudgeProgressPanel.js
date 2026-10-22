import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
  CheckCircle as DoneIcon,
} from "@mui/icons-material";
import judgeApi from "../../../lib/judgeApi";
import ExportCsvButton from "../ExportCsvButton";
import * as ga from "../../../lib/ga";

const POLL_MS = 30000;
const ROUND_LABEL = { round1: "Round 1", round2: "Round 2" };

const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const judgeCsvColumns = (teamName) => [
  { key: "name", label: "Judge" },
  { key: "email", label: "Email" },
  { key: "assigned", label: "Assigned" },
  { key: "submitted", label: "Submitted" },
  { key: "complete", label: "Complete" },
  {
    key: "drafts",
    label: "Drafts in progress",
    get: (j) => (j.draft_team_ids || []).length,
  },
  {
    key: "missing",
    label: "Missing teams",
    get: (j) => (j.missing_team_ids || []).map(teamName),
  },
  { key: "last_submitted_at", label: "Last submitted" },
];

/**
 * "Who has sent in scores and who hasn't" for one round, plus the round lock.
 *
 * Data: ONE call to GET /api/judge/admin/progress/<event>/<round> (replaces the
 * old per-(judge, team) score polling). Polls every 30s while the tab is
 * visible and the round isn't complete; refetches on tab refocus. Token and
 * org id are read through refs so PropelAuth's token rotation on refocus
 * never re-triggers the load effect.
 */
const JudgeProgressPanel = ({
  eventId,
  round,
  accessToken,
  orgId,
  onSnack,
  onLockChange,
  refreshSignal = 0,
}) => {
  const [progress, setProgress] = useState(null);
  // Lock state lives apart from `progress` so it survives a failed progress
  // load (falls back to the public locks route) and a successful toggle
  // always lands, whether or not the board is loaded. null = unknown.
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(Boolean(accessToken && eventId));
  const [error, setError] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [view, setView] = useState("judges");
  const [confirm, setConfirm] = useState(null); // 'lock' | 'unlock' | null
  const [lockBusy, setLockBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const tokenRef = useRef(accessToken);
  const orgRef = useRef(orgId);
  tokenRef.current = accessToken;
  orgRef.current = orgId;
  const inFlightRef = useRef(false);

  const notify = useCallback(
    (message, severity = "info") => {
      if (typeof onSnack === "function") onSnack(message, severity);
    },
    [onSnack],
  );

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!eventId || !tokenRef.current || inFlightRef.current) return;
      inFlightRef.current = true;
      if (!silent) setLoading(true);
      try {
        const data = await judgeApi.getJudgingProgress(
          eventId,
          round,
          tokenRef.current,
          orgRef.current,
        );
        if (data === null) {
          setUnavailable(true);
          setProgress(null);
        } else {
          setUnavailable(false);
          setProgress(data);
          setLock(data.lock || { locked: false });
          setError(null);
          setUpdatedAt(new Date());
        }
      } catch (err) {
        setError(err?.message || "Couldn't load judging progress");
        // Still try to learn the lock state so the toggle can't lie.
        try {
          const res = await judgeApi.getRoundLocks(eventId, tokenRef.current);
          if (res?.locks?.[round]) setLock((prev) => prev || res.locks[round]);
        } catch (lockErr) {
          /* leave lock unknown */
        }
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [eventId, round],
  );

  // Initial load — keyed on token PRESENCE, not value.
  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (hasToken) load();
  }, [hasToken, load]);

  // Host tabs bump this after they change assignments; refetch quietly
  // (no remount, so the By judge / By team choice is kept).
  useEffect(() => {
    if (refreshSignal) load({ silent: true });
  }, [refreshSignal, load]);

  const complete =
    progress?.summary &&
    progress.summary.assignments_total > 0 &&
    progress.summary.submitted_total >= progress.summary.assignments_total;

  // Poll while visible and not complete; refetch on refocus.
  useEffect(() => {
    if (!hasToken || unavailable) return undefined;
    const tick = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      )
        return;
      if (complete) return;
      load({ silent: true });
    };
    const id = setInterval(tick, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hasToken, unavailable, complete, load]);

  const teamName = useCallback(
    (id) => progress?.teams?.find((t) => t.team_id === id)?.name || id,
    [progress],
  );
  const judgeName = useCallback(
    (id) => progress?.judges?.find((j) => j.judge_id === id)?.name || id,
    [progress],
  );

  const lockKnown = lock !== null;
  const isLocked = Boolean(lock?.locked);
  const label = ROUND_LABEL[round] || round;

  const applyLock = async (locked) => {
    setLockBusy(true);
    try {
      const res = await judgeApi.setRoundLock(
        eventId,
        round,
        locked,
        tokenRef.current,
        orgRef.current,
      );
      const nextLock = res?.lock || { ...(lock || {}), locked };
      setLock(nextLock);
      setProgress((prev) => (prev ? { ...prev, lock: nextLock } : prev));
      setConfirm(null);
      notify(
        locked
          ? `${label} scoring is now locked.`
          : `${label} scoring is open again.`,
        "success",
      );
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        locked ? "admin_judging_lock" : "admin_judging_unlock",
        round,
        null,
        {
          event_id: eventId,
        },
      );
      if (typeof onLockChange === "function") onLockChange(nextLock);
    } catch (err) {
      notify(err?.message || "Couldn't update the lock", "error");
    } finally {
      setLockBusy(false);
    }
  };

  const rows = useMemo(() => progress?.judges || [], [progress]);

  if (unavailable) {
    return (
      <Alert severity="info">
        Judge progress needs the latest backend deploy (the progress route isn't
        available yet).
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          mb: 2,
        }}
      >
        <Chip
          icon={isLocked ? <LockIcon /> : <LockOpenIcon />}
          label={
            !lockKnown
              ? `${label} lock state unknown`
              : isLocked
                ? `${label} scoring locked`
                : `${label} scoring open`
          }
          color={!lockKnown ? "default" : isLocked ? "default" : "success"}
          variant={isLocked ? "filled" : "outlined"}
        />
        {isLocked && (
          <Typography variant="caption" color="text.secondary">
            Locked {lock.locked_by_name ? `by ${lock.locked_by_name} ` : ""}
            {lock.locked_at ? `at ${fmtTime(lock.locked_at)}` : ""}
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <Tooltip
          title={
            lockKnown
              ? ""
              : "Can't change the lock until its current state has loaded"
          }
        >
          <span>
            <Button
              size="small"
              variant={isLocked ? "outlined" : "contained"}
              color={isLocked ? "primary" : "warning"}
              startIcon={isLocked ? <LockOpenIcon /> : <LockIcon />}
              onClick={() => setConfirm(isLocked ? "unlock" : "lock")}
              disabled={lockBusy || !lockKnown}
            >
              {isLocked ? `Unlock ${label} scoring` : `Lock ${label} scoring`}
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Refresh now">
          <span>
            <IconButton size="small" onClick={() => load()} disabled={loading}>
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <RefreshIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button size="small" onClick={() => load()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && !progress ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : progress ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
              mb: 2,
            }}
          >
            <Chip
              size="small"
              icon={<DoneIcon />}
              color={
                progress.summary.judges_total > 0 &&
                progress.summary.judges_complete ===
                  progress.summary.judges_total
                  ? "success"
                  : "default"
              }
              label={`Judges complete ${progress.summary.judges_complete}/${progress.summary.judges_total}`}
            />
            <Chip
              size="small"
              label={`Scores in ${progress.summary.submitted_total}/${progress.summary.assignments_total}`}
            />
            <Chip
              size="small"
              variant="outlined"
              color={progress.summary.drafts_total > 0 ? "warning" : "default"}
              label={`Drafts in progress ${progress.summary.drafts_total}`}
            />
            <Box sx={{ flex: 1 }} />
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_e, v) => v && setView(v)}
            >
              <ToggleButton value="judges">By judge</ToggleButton>
              <ToggleButton value="teams">By team</ToggleButton>
            </ToggleButtonGroup>
            <ExportCsvButton
              rows={rows}
              columns={judgeCsvColumns(teamName)}
              filenameParts={[eventId, `${round}-judge-progress`]}
              table={`judging_${round}_progress`}
              eventId={eventId}
              label="Download progress CSV"
              iconOnly
            />
          </Box>

          {progress.summary.assignments_total === 0 ? (
            <Alert severity="info">
              No {label} assignments yet — judges appear here once the panel
              setup is saved.
            </Alert>
          ) : view === "judges" ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Judge</TableCell>
                    <TableCell sx={{ width: 220 }}>Progress</TableCell>
                    <TableCell>Still missing</TableCell>
                    <TableCell align="center">Drafts</TableCell>
                    <TableCell>Last submitted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((j) => {
                    const pct =
                      j.assigned > 0
                        ? Math.round((j.submitted / j.assigned) * 100)
                        : 0;
                    return (
                      <TableRow
                        key={j.judge_id}
                        sx={{
                          bgcolor: j.complete ? "action.hover" : "inherit",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {j.name}
                          </Typography>
                          {j.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {j.email}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              color={j.complete ? "success" : "primary"}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                minWidth: 44,
                                textAlign: "right",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {j.submitted}/{j.assigned}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {j.complete ? (
                            <Chip
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<DoneIcon />}
                              label="Done"
                            />
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(j.missing_team_ids || [])
                                .slice(0, 4)
                                .map((tid) => (
                                  <Chip
                                    key={tid}
                                    size="small"
                                    variant="outlined"
                                    label={teamName(tid)}
                                  />
                                ))}
                              {(j.missing_team_ids || []).length > 4 && (
                                <Tooltip
                                  title={j.missing_team_ids
                                    .slice(4)
                                    .map(teamName)
                                    .join(", ")}
                                >
                                  <Chip
                                    size="small"
                                    label={`+${(j.missing_team_ids || []).length - 4}`}
                                  />
                                </Tooltip>
                              )}
                              {(j.draft_team_ids || []).map((tid) => (
                                <Tooltip
                                  key={`d-${tid}`}
                                  title="Draft saved, not submitted yet"
                                >
                                  <Chip
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    label={`${teamName(tid)} (draft)`}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {(j.draft_team_ids || []).length || "—"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {fmtTime(j.last_submitted_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="center">Scores in</TableCell>
                    <TableCell>Waiting on</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(progress.teams || []).map((t) => {
                    const waiting = (t.assigned_judge_ids || []).filter(
                      (id) => !(t.submitted_judge_ids || []).includes(id),
                    );
                    return (
                      <TableRow key={t.team_id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {t.name || t.team_id}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            variant="outlined"
                            color={
                              t.assigned > 0 && t.submitted >= t.assigned
                                ? "success"
                                : t.submitted === 0
                                  ? "error"
                                  : "warning"
                            }
                            label={`${t.submitted}/${t.assigned}`}
                          />
                        </TableCell>
                        <TableCell>
                          {waiting.length === 0 ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              All in
                            </Typography>
                          ) : (
                            <Typography variant="body2">
                              {waiting.map(judgeName).join(", ")}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {progress.summary.orphan_submitted > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {progress.summary.orphan_submitted} submitted score
              {progress.summary.orphan_submitted === 1 ? " is" : "s are"} from a
              judge who is no longer assigned to that team. They are not counted
              in Results.
            </Alert>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : ""}
            {!complete &&
              " · refreshes every 30 seconds while this tab is open"}
          </Typography>
        </>
      ) : null}

      <Dialog
        open={Boolean(confirm)}
        onClose={() => !lockBusy && setConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirm === "lock"
            ? `Lock ${label} scoring?`
            : `Unlock ${label} scoring?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm === "lock"
              ? `Judges will no longer be able to submit or change ${label} scores. Scores already submitted are kept. You can unlock at any time.`
              : `Judges will be able to submit and change ${label} scores again.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={lockBusy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={confirm === "lock" ? "warning" : "primary"}
            onClick={() => applyLock(confirm === "lock")}
            disabled={lockBusy}
            startIcon={
              lockBusy ? (
                <CircularProgress size={16} color="inherit" />
              ) : confirm === "lock" ? (
                <LockIcon />
              ) : (
                <LockOpenIcon />
              )
            }
          >
            {confirm === "lock" ? "Lock scoring" : "Unlock scoring"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JudgeProgressPanel;
