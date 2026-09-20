import React, { useCallback, useEffect, useRef, useState } from "react";
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
  LinearProgress,
  Link as MuiLink,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import axios from "axios";
import * as ga from "../../lib/ga";
import { FONT_MONO } from "../../styles/fonts";

const LOW_EXPOSURE_THRESHOLD = 3;

const pct = (v) => `${Math.round((Number(v) || 0) * 100)}%`;

/**
 * Whether voting has closed. Prefers the backend's own `results.window`
 * (`{state, opens_at, closes_at}` from `compute_voting_window`), which
 * accounts for the backend's end-of-event default when no explicit
 * `voting_closes` deadline is set. Falls back to the `votingCloses` prop
 * (`admin.hackathon.deadlines.voting_closes`) only when `window` isn't
 * present yet (still loading, or an older backend) — that prop is `NaN`
 * when unset, which used to permanently disable Publish.
 */
function computeVotingHasClosed(window, votingCloses) {
  if (window) return window.state === "closed";
  const closesAtMs = votingCloses ? Date.parse(votingCloses) : NaN;
  return Number.isFinite(closesAtMs) && Date.now() > closesAtMs;
}

/**
 * Admin view of the Hackers' Choice peer vote — the 4th subtab of
 * `JudgingSection` (`?subtab=peer-vote`). Read-only tallies + ballot
 * moderation; never shown to voters. See Part 2.5/3 of
 * docs/plans/team-dashboard-devpost-replacement.md.
 */
const PeerVoteResults = ({
  eventId,
  accessToken,
  orgId,
  onSnack,
  votingCloses,
  enabled,
}) => {
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);

  const [voidTarget, setVoidTarget] = useState(null); // { voter_propel_id, picks_count }
  const [voiding, setVoiding] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // PropelAuth mints a fresh accessToken on tab refocus. Requests read the
  // token/orgId through refs so `load` stays identity-stable across token
  // rotation — otherwise the mount effect refires, `setLoading(true)` flips
  // the whole table into a spinner, and a background refresh loses the
  // in-progress table state (same lesson as useHackathonAdmin.js).
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;
  const orgIdRef = useRef(orgId);
  orgIdRef.current = orgId;

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${accessTokenRef.current}`,
      ...(orgIdRef.current ? { "X-Org-Id": orgIdRef.current } : {}),
    }),
    [],
  );

  const load = useCallback(
    async ({ background = false } = {}) => {
      if (!eventId || !accessTokenRef.current) return;
      if (!background) setLoading(true);
      setError(null);
      try {
        const [resultsRes, summaryRes] = await Promise.all([
          axios.get(
            `${apiBase}/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/results`,
            { headers: authHeaders() },
          ),
          axios
            .get(
              `${apiBase}/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/summary`,
            )
            .catch(() => ({ data: { published: false } })),
        ]);
        setResults(resultsRes.data || null);
        setSummary(summaryRes.data || { published: false });
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setError(
            "Hackers' Choice results aren't available on this backend yet.",
          );
        } else if (status === 401 || status === 403) {
          setError(
            "You don't have permission to view Hackers' Choice results.",
          );
        } else {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              "Failed to load Hackers' Choice results.",
          );
        }
      } finally {
        if (!background) setLoading(false);
      }
    },
    [eventId, apiBase, authHeaders],
  );

  // Keyed on token *presence*, not value — a rotated token must not reload.
  const hasToken = !!accessToken;
  useEffect(() => {
    if (!hasToken) return;
    load();
  }, [load, hasToken]);

  const openVoidConfirm = (ballot) => setVoidTarget(ballot);

  const handleVoid = async () => {
    if (!voidTarget) return;
    setVoiding(true);
    try {
      await axios.post(
        `${apiBase}/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/ballots/${encodeURIComponent(
          voidTarget.voter_propel_id,
        )}/void`,
        {},
        { headers: authHeaders() },
      );
      onSnack?.("Ballot voided.", "success");
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "admin_peer_vote_void_ballot",
        eventId,
      );
      setVoidTarget(null);
      load({ background: true });
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      // void_ballot (peer_votes_service.py) returns {"error": ...}, not
      // {"message": ...} — reading body?.message here always fell through
      // to the generic fallback even when the backend explained why.
      if (status === 404 && body?.error === "Ballot not found") {
        onSnack?.(
          "That ballot no longer exists — refresh and try again.",
          "warning",
        );
      } else {
        onSnack?.(
          body?.message || body?.error || "Failed to void that ballot.",
          "error",
        );
      }
    } finally {
      setVoiding(false);
    }
  };

  const votingWindow = results?.window;
  const votingHasClosed = computeVotingHasClosed(votingWindow, votingCloses);
  const alreadyPublished = !!summary?.published;
  const topTeam =
    results?.teams?.find((t) => t.rank === 1) || results?.teams?.[0] || null;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await axios.post(
        `${apiBase}/api/hackathons/${encodeURIComponent(eventId)}/peer-vote/publish`,
        {},
        { headers: authHeaders() },
      );
      onSnack?.(
        `Published — Hackers' Choice: ${res.data?.winner_team_name || topTeam?.name || "winner"}`,
        "success",
      );
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "admin_peer_vote_publish",
        eventId,
      );
      setPublishConfirmOpen(false);
      load({ background: true });
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      // publish_results (peer_votes_service.py) returns {"error": ...}, not
      // {"message": ...} — reading body?.message here rendered the generic
      // fallback even for the exact 409 "no ballots" case Part 3 specifies.
      if (status === 409 && body?.error === "no_ballots") {
        onSnack?.("Can't publish yet — no ballots have been cast.", "warning");
      } else if (
        status === 400 &&
        body?.error === "Winning team not found in results"
      ) {
        onSnack?.(
          "Couldn't find the winning team in the results — refresh and try again.",
          "error",
        );
      } else {
        onSnack?.(
          body?.message || body?.error || "Failed to publish results.",
          "error",
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }

  const teams = results?.teams || [];
  const ballotsDetail = results?.ballots_detail || [];
  const lowExposureCount = teams.filter(
    (t) => (t.shown ?? 0) < LOW_EXPOSURE_THRESHOLD,
  ).length;
  const eligiblePct = results?.eligible_estimate
    ? pct((results.ballots || 0) / results.eligible_estimate)
    : null;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6">Hackers' Choice</Typography>
          <Typography variant="body2" color="text.secondary">
            {results?.ballots ?? 0} ballot
            {(results?.ballots ?? 0) === 1 ? "" : "s"}
            {results?.eligible_estimate != null
              ? ` · ~${results.eligible_estimate} eligible (${eligiblePct})`
              : ""}
            {results?.voided ? ` · ${results.voided} voided` : ""}
          </Typography>
        </Box>
        <Button size="small" startIcon={<RefreshIcon />} onClick={() => load()}>
          Refresh
        </Button>
      </Stack>

      {!enabled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Hackers' Choice is off for this event — enable it under Deadlines.
        </Alert>
      )}

      {alreadyPublished && (
        <Alert
          severity="success"
          icon={<TrophyIcon fontSize="inherit" />}
          sx={{ mb: 2 }}
        >
          Published{" "}
          {summary.published_at
            ? new Date(summary.published_at).toLocaleString()
            : ""}{" "}
          · Hackers' Choice: {summary.winner_team_name}
        </Alert>
      )}

      {lowExposureCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {lowExposureCount} project{lowExposureCount === 1 ? "" : "s"} seen by
          fewer than {LOW_EXPOSURE_THRESHOLD} voters — rank unreliable for those
          rows.
        </Alert>
      )}

      {teams.length === 0 ? (
        <Alert severity="info">No ballots yet.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Team</TableCell>
                <TableCell align="right">Shown</TableCell>
                <TableCell align="right">Approvals</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell align="right">Wilson LB</TableCell>
                <TableCell sx={{ width: 160 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((t) => {
                const lowExposure = (t.shown ?? 0) < LOW_EXPOSURE_THRESHOLD;
                return (
                  <TableRow key={t.team_id} hover>
                    <TableCell>
                      {t.rank}
                      {t.rank === 1 && (
                        <TrophyIcon
                          fontSize="inherit"
                          sx={{
                            ml: 0.5,
                            verticalAlign: "middle",
                            color: "warning.main",
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <MuiLink
                        href={`/hack/${eventId}/team/${t.team_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.name}
                      </MuiLink>
                      {lowExposure && (
                        <Tooltip
                          title={`Seen by fewer than ${LOW_EXPOSURE_THRESHOLD} voters — rank unreliable.`}
                        >
                          <WarningIcon
                            fontSize="inherit"
                            color="warning"
                            sx={{ ml: 0.5, verticalAlign: "middle" }}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t.shown ?? t.exposure_shown ?? 0}
                    </TableCell>
                    <TableCell align="right">{t.approvals ?? 0}</TableCell>
                    <TableCell align="right">{pct(t.approval_rate)}</TableCell>
                    <TableCell align="right">
                      {(Number(t.wilson_lower_bound) || 0).toFixed(3)}
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          100,
                          (Number(t.wilson_lower_bound) || 0) * 100,
                        )}
                        sx={{ height: 6, borderRadius: 3 }}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Ballots
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Void removes one voter's picks from the tally (e.g. a duplicate account
        or abuse report). Cannot be undone from here.
      </Typography>
      {ballotsDetail.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No ballots cast yet.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Voter</TableCell>
                <TableCell>Voted at</TableCell>
                <TableCell align="right">Picks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ width: 100 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {ballotsDetail.map((b) => (
                <TableRow key={b.voter_propel_id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: FONT_MONO, fontSize: "0.8rem" }}
                    >
                      {b.voter_propel_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {b.voted_at ? new Date(b.voted_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell align="right">{b.picks_count ?? 0}</TableCell>
                  <TableCell>
                    {b.voided ? (
                      <Chip label="Voided" size="small" color="default" />
                    ) : (
                      <Chip label="Active" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={b.voided}
                      onClick={() => openVoidConfirm(b)}
                    >
                      Void
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Publish results
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Appends "Hackers' Choice" to the winning team's awards and makes the
          winner public.
          {!votingHasClosed &&
            !alreadyPublished &&
            " Disabled until voting closes."}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          disabled={!votingHasClosed || alreadyPublished || !topTeam}
          onClick={() => setPublishConfirmOpen(true)}
        >
          {alreadyPublished ? "Already published" : "Publish Hackers' Choice"}
        </Button>
      </Box>

      <Dialog
        open={!!voidTarget}
        onClose={() => !voiding && setVoidTarget(null)}
      >
        <DialogTitle>Void this ballot?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The ballot for voter{" "}
            <strong style={{ fontFamily: FONT_MONO }}>
              {voidTarget?.voter_propel_id}
            </strong>{" "}
            ({voidTarget?.picks_count ?? 0} pick
            {(voidTarget?.picks_count ?? 0) === 1 ? "" : "s"}) will be excluded
            from all future tallies. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoidTarget(null)} disabled={voiding}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleVoid}
            disabled={voiding}
          >
            {voiding ? "Voiding…" : "Void ballot"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={publishConfirmOpen}
        onClose={() => !publishing && setPublishConfirmOpen(false)}
      >
        <DialogTitle>Publish Hackers' Choice?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This appends the "Hackers' Choice" award to{" "}
            <strong>{topTeam?.name}</strong> and shows it publicly on the
            results page. Voters never see tallies — only the final winner.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPublishConfirmOpen(false)}
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeerVoteResults;
