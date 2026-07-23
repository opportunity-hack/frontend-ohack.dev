import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import NextLink from "next/link";
import { useAuthInfo } from "@propelauth/react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  AddCircleOutline as AddCheckIcon,
  LockOutlined as LockIcon,
  EmojiPeople as MentorIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  WarningAmber as WarningIcon,
  ReportProblem as BlockedIcon,
  Done as DoneIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ChatBubbleOutline as NoteIcon,
  Gavel as GavelIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";

import {
  MENTOR_COVERAGE_ITEMS,
  MENTOR_COVERAGE_TOTAL,
  COVERAGE_TARGET_MENTORS,
  coverageChecks,
  coverageDoneCount,
  JUDGING_CRITERIA,
  SCORE_META,
  latestRatingsByMentor,
  consensusForCriterion,
  relativeTime,
} from "./mentorCoverage";
import { parseLocalDate } from "../../lib/dateUtils";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

function authHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

// ------------------------- helpers --------------------------------------

function NoteRow({ note, canDelete, onDelete }) {
  if (note.deleted_at) {
    return (
      <ListItem
        sx={{
          py: 1,
          color: "text.disabled",
          fontStyle: "italic",
        }}
      >
        <ListItemText
          primary={
            <Typography variant="body2">
              [deleted by {note.author_name} · {relativeTime(note.deleted_at)}]
            </Typography>
          }
        />
      </ListItem>
    );
  }
  return (
    <ListItem
      alignItems="flex-start"
      sx={{ py: 1.5, alignItems: "flex-start" }}
      secondaryAction={
        canDelete ? (
          <Tooltip title="Delete this note">
            <IconButton edge="end" size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null
      }
    >
      <ListItemIcon sx={{ minWidth: 44, mt: 0.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
          {note.author_name?.[0] || "?"}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="body2" fontWeight={600}>
              {note.author_name || "A mentor"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {relativeTime(note.created_at)}
            </Typography>
          </Box>
        }
        secondary={
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
          >
            {note.body}
          </Typography>
        }
      />
    </ListItem>
  );
}

function FlagCard({ flag, isOwner, canMentor, onTakeOver, onResolve }) {
  const severityMeta =
    flag.severity === "blocked"
      ? {
          color: "error",
          chipBg: "rgba(244,67,54,0.12)",
          icon: <BlockedIcon fontSize="small" />,
          label: "Blocked",
        }
      : {
          color: "warning",
          chipBg: "rgba(255,167,38,0.16)",
          icon: <WarningIcon fontSize="small" />,
          label: "Needs attention",
        };
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 1.5,
        borderLeft: 4,
        borderLeftColor: `${severityMeta.color}.main`,
        backgroundColor: severityMeta.chipBg,
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 1 }}>
        <Chip
          size="small"
          color={severityMeta.color}
          icon={severityMeta.icon}
          label={severityMeta.label}
          sx={{ fontWeight: 700 }}
        />
        <Chip
          size="small"
          variant="outlined"
          avatar={<Avatar>{flag.owner_name?.[0] || "?"}</Avatar>}
          label={`Owned by ${flag.owner_name || "—"}`}
        />
        <Typography variant="caption" color="text.secondary">
          Raised {relativeTime(flag.created_at)} by {flag.raised_by_name}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1.5 }}>
        {flag.body}
      </Typography>
      {canMentor && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {isOwner ? (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<DoneIcon />}
              onClick={onResolve}
            >
              Resolve flag
            </Button>
          ) : (
            <Button size="small" variant="outlined" onClick={onTakeOver}>
              Take over
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
}

// ------------------------- main component -------------------------------

export default function MentorTeamPanel({ team, event, eventId, onTeamUpdate }) {
  const { user, accessToken, isLoggedIn } = useAuthInfo();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isMentor, setIsMentor] = useState(false);
  const [mentorCheckLoading, setMentorCheckLoading] = useState(true);

  const [pendingSlug, setPendingSlug] = useState(null);
  const [busy, setBusy] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });
  const showSnack = useCallback(
    (message, severity = "success") =>
      setSnackbar({ open: true, severity, message }),
    []
  );

  // confirm / dialog state
  const [raiseFlagOpen, setRaiseFlagOpen] = useState(false);
  const [raiseFlagSeverity, setRaiseFlagSeverity] = useState("needs_attention");
  const [raiseFlagBody, setRaiseFlagBody] = useState("");
  const [resolveFlag, setResolveFlag] = useState(null); // { id }
  const [resolveNote, setResolveNote] = useState("");

  // notes
  const [noteDraft, setNoteDraft] = useState("");
  const noteFieldRef = useRef(null);

  // -- mentor self-check
  useEffect(() => {
    let cancelled = false;
    if (!isLoggedIn || !accessToken || !eventId) {
      setIsMentor(false);
      setMentorCheckLoading(false);
      return undefined;
    }
    setMentorCheckLoading(true);
    fetch(`${API}/api/volunteer/${eventId}/me?type=mentor`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : { is_mentor: false }))
      .then((data) => {
        if (cancelled) return;
        setIsMentor(!!data?.is_mentor);
        setMentorCheckLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsMentor(false);
        setMentorCheckLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, accessToken, eventId]);

  // -- derived state from team
  const checklist = team?.mentor_checklist || {};
  const notes = useMemo(
    () => (Array.isArray(team?.mentor_notes) ? [...team.mentor_notes].reverse() : []),
    [team?.mentor_notes]
  );
  const flagsAll = Array.isArray(team?.mentor_flags) ? team.mentor_flags : [];
  const openFlags = useMemo(
    () =>
      flagsAll
        .filter((f) => !f.resolved_at)
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")),
    [flagsAll]
  );
  const doneCount = coverageDoneCount(checklist);
  const ratingsByMentor = useMemo(
    () => latestRatingsByMentor(team?.mentor_ratings),
    [team?.mentor_ratings]
  );
  const myPropelId = user?.userId || null;

  const eventEnded = useMemo(() => {
    if (!event?.end_date) return false;
    const end = parseLocalDate(event.end_date);
    if (Number.isNaN(end.getTime())) return false;
    // Treat the event as ended only after the end of the local end date.
    end.setHours(23, 59, 59, 999);
    return end < new Date();
  }, [event?.end_date]);
  const daysSinceEnd = useMemo(() => {
    if (!event?.end_date) return null;
    const end = parseLocalDate(event.end_date);
    if (Number.isNaN(end.getTime())) return null;
    end.setHours(23, 59, 59, 999);
    const ms = Date.now() - end.getTime();
    return Math.floor(ms / 86400000);
  }, [event?.end_date]);

  const canInteract = isMentor && !mentorCheckLoading;

  // -- network helpers
  const updateTeamFromResponse = useCallback(
    (resp) => {
      if (resp?.team && onTeamUpdate) {
        onTeamUpdate({ ...resp.team, id: team.id });
      }
    },
    [team?.id, onTeamUpdate]
  );

  const post = useCallback(
    async (path, body) => {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify(body || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      return data;
    },
    [accessToken]
  );

  const del = useCallback(
    async (path) => {
      const res = await fetch(`${API}${path}`, {
        method: "DELETE",
        headers: authHeaders(accessToken),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      return data;
    },
    [accessToken]
  );

  // -- handlers
  // `done` here means "add MY check" (true) or "clear MY check" (false) — the
  // backend only ever touches the calling mentor's own check on the item.
  const toggleCoverage = async (slug, done) => {
    setPendingSlug(slug);
    try {
      const data = await post(`/api/team/${team.id}/mentor/coverage`, {
        item: slug,
        done,
      });
      updateTeamFromResponse(data);
      showSnack(done ? "Your check added" : "Your check cleared");
    } catch (e) {
      showSnack(e.message || "Couldn't update coverage", "error");
    } finally {
      setPendingSlug(null);
    }
  };

  // Click adds your check if you haven't signed off; clicking your own check
  // clears it. Items already at the mentor cap (and not yours) are locked.
  const handleCoverageClick = (item) => {
    const checks = coverageChecks(checklist[item.slug]);
    const mine = checks.some((c) => c.propel_id === myPropelId);
    if (mine) {
      toggleCoverage(item.slug, false);
    } else if (checks.length >= COVERAGE_TARGET_MENTORS) {
      // Fully covered by other mentors — nothing to do.
    } else {
      toggleCoverage(item.slug, true);
    }
  };

  const postNote = async () => {
    const body = noteDraft.trim();
    if (!body) return;
    setBusy(true);
    try {
      const data = await post(`/api/team/${team.id}/mentor/notes`, { body });
      updateTeamFromResponse(data);
      setNoteDraft("");
      showSnack("Note posted");
    } catch (e) {
      showSnack(e.message || "Couldn't post note", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteNote = async (noteId) => {
    setBusy(true);
    try {
      const data = await del(`/api/team/${team.id}/mentor/notes/${noteId}`);
      updateTeamFromResponse(data);
      showSnack("Note deleted");
    } catch (e) {
      showSnack(e.message || "Couldn't delete note", "error");
    } finally {
      setBusy(false);
    }
  };

  const raiseFlag = async () => {
    const body = raiseFlagBody.trim();
    if (!body) return;
    setBusy(true);
    try {
      const data = await post(`/api/team/${team.id}/mentor/flags`, {
        severity: raiseFlagSeverity,
        body,
      });
      updateTeamFromResponse(data);
      setRaiseFlagOpen(false);
      setRaiseFlagBody("");
      setRaiseFlagSeverity("needs_attention");
      showSnack("Flag raised — Slack channel notified");
    } catch (e) {
      showSnack(e.message || "Couldn't raise flag", "error");
    } finally {
      setBusy(false);
    }
  };

  const takeOverFlag = async (flagId) => {
    setBusy(true);
    try {
      const data = await post(`/api/team/${team.id}/mentor/flags/${flagId}/take-over`);
      updateTeamFromResponse(data);
      showSnack("You now own this flag");
    } catch (e) {
      showSnack(e.message || "Couldn't take over flag", "error");
    } finally {
      setBusy(false);
    }
  };

  const resolveFlagSubmit = async () => {
    if (!resolveFlag) return;
    const note = resolveNote.trim();
    if (!note) return;
    setBusy(true);
    try {
      const data = await post(
        `/api/team/${team.id}/mentor/flags/${resolveFlag.id}/resolve`,
        { resolution_note: note }
      );
      updateTeamFromResponse(data);
      setResolveFlag(null);
      setResolveNote("");
      showSnack("Flag resolved");
    } catch (e) {
      showSnack(e.message || "Couldn't resolve flag", "error");
    } finally {
      setBusy(false);
    }
  };

  const setRating = async (criterion, score, note) => {
    setBusy(true);
    try {
      const body = { criterion, score };
      if (note) body.note = note;
      const data = await post(`/api/team/${team.id}/mentor/ratings`, body);
      updateTeamFromResponse(data);
      showSnack("Rating saved");
    } catch (e) {
      showSnack(e.message || "Couldn't save rating", "error");
    } finally {
      setBusy(false);
    }
  };

  // -- "I'm here now" check-in (adds my intro_made check if room, else just a note)
  const checkInNow = async () => {
    const introChecks = coverageChecks(checklist["intro_made"]);
    const mineIntro = introChecks.some((c) => c.propel_id === myPropelId);
    const introFull = introChecks.length >= COVERAGE_TARGET_MENTORS;
    if (!mineIntro && !introFull) {
      await toggleCoverage("intro_made", true);
    } else {
      // Already signed off (or item full) — fall back to dropping a note.
      setNoteDraft((d) => d || "Stopped by to check on the team.");
      // Scroll to composer
      setTimeout(() => noteFieldRef.current?.focus?.(), 50);
    }
  };

  // -- live refresh on tab refocus
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/messages/team/${team.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const t = data?.team || data;
      if (t && onTeamUpdate) onTeamUpdate({ ...t, id: team.id });
    } catch {
      /* swallow — best effort */
    }
  }, [team?.id, onTeamUpdate]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  // -- header pills
  const headerPills = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: "center" }}>
      <Chip
        size="small"
        color={doneCount === MENTOR_COVERAGE_TOTAL ? "success" : doneCount > 0 ? "primary" : "default"}
        label={`${doneCount} / ${MENTOR_COVERAGE_TOTAL} covered`}
        sx={{ fontWeight: 700 }}
      />
      {openFlags.length > 0 && (
        <Chip
          size="small"
          color="warning"
          icon={<FlagIcon fontSize="small" />}
          label={`${openFlags.length} open flag${openFlags.length === 1 ? "" : "s"}`}
        />
      )}
      <Chip
        size="small"
        variant="outlined"
        icon={<ScheduleIcon fontSize="small" />}
        label={
          team?.mentor_last_touched_at
            ? `Last touch ${relativeTime(team.mentor_last_touched_at)}${
                team.mentor_last_touched_by_name ? ` · ${team.mentor_last_touched_by_name}` : ""
              }`
            : "No mentor touch yet"
        }
      />
      {eventEnded && daysSinceEnd != null && (
        <Chip
          size="small"
          variant="outlined"
          label={daysSinceEnd === 0 ? "Event ended today" : `Event ended ${daysSinceEnd}d ago`}
        />
      )}
    </Stack>
  );

  // -- section renderers (used both inline and inside Accordions on mobile)
  const renderOpenConcerns = () => (
    <Box>
      {openFlags.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No open mentor flags. {canInteract ? "Raise one below if a team needs attention." : ""}
        </Typography>
      ) : (
        openFlags.map((f) => (
          <FlagCard
            key={f.id}
            flag={f}
            isOwner={canInteract && f.owner_propel_id === myPropelId}
            canMentor={canInteract}
            onTakeOver={() => takeOverFlag(f.id)}
            onResolve={() => {
              setResolveFlag({ id: f.id });
              setResolveNote("");
            }}
          />
        ))
      )}
      {canInteract && (
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<FlagIcon />}
          onClick={() => setRaiseFlagOpen(true)}
          sx={{ mt: openFlags.length > 0 ? 0.5 : 0 }}
        >
          Raise a flag
        </Button>
      )}
    </Box>
  );

  const renderCoverage = () => (
    <Box>
      <LinearProgress
        variant="determinate"
        value={(doneCount / MENTOR_COVERAGE_TOTAL) * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 1,
          backgroundColor: "rgba(0,0,0,0.06)",
          "& .MuiLinearProgress-bar": {
            background:
              doneCount === MENTOR_COVERAGE_TOTAL
                ? "linear-gradient(90deg, #ffd54f, #ff9800)"
                : "linear-gradient(90deg, #1dd1a1, #48dbfb)",
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Each item wants sign-off from {COVERAGE_TARGET_MENTORS} different mentors — check
        the ones you&apos;ve personally covered. An item turns green once{" "}
        {COVERAGE_TARGET_MENTORS} mentors have it. You can clear your own check anytime.
      </Typography>
      <List disablePadding>
        {MENTOR_COVERAGE_ITEMS.map((item, idx) => {
          const checks = coverageChecks(checklist[item.slug]);
          const count = checks.length;
          const mine = checks.some((c) => c.propel_id === myPropelId);
          const covered = count >= COVERAGE_TARGET_MENTORS;
          const lockedForMe = covered && !mine;
          const isPending = pendingSlug === item.slug;
          const clickable = canInteract && !isPending && (mine || !covered);

          const countChip = (
            <Chip
              size="small"
              variant={covered ? "filled" : "outlined"}
              color={covered ? "success" : count > 0 ? "primary" : "default"}
              label={
                covered
                  ? `${count}/${COVERAGE_TARGET_MENTORS} ✓`
                  : `${count}/${COVERAGE_TARGET_MENTORS}`
              }
            />
          );

          return (
            <React.Fragment key={item.slug}>
              {idx > 0 && <Divider component="li" />}
              <ListItem
                onClick={clickable ? () => handleCoverageClick(item) : undefined}
                sx={{
                  py: 1.25,
                  cursor: clickable ? "pointer" : "default",
                  backgroundColor: covered
                    ? "rgba(76,175,80,0.07)"
                    : count > 0
                    ? "rgba(72,219,251,0.05)"
                    : "transparent",
                  alignItems: "flex-start",
                  "&:hover": clickable ? { backgroundColor: "rgba(72,219,251,0.1)" } : {},
                }}
                secondaryAction={
                  lockedForMe ? (
                    <Tooltip title={`Fully covered by ${COVERAGE_TARGET_MENTORS} mentors`}>
                      {countChip}
                    </Tooltip>
                  ) : (
                    countChip
                  )
                }
              >
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  {isPending ? (
                    <CircularProgress size={20} />
                  ) : mine ? (
                    <Tooltip title="You checked this — tap to clear your check">
                      <CheckCircleIcon sx={{ color: "success.main" }} />
                    </Tooltip>
                  ) : lockedForMe ? (
                    <LockIcon sx={{ color: "success.light" }} />
                  ) : canInteract ? (
                    <AddCheckIcon sx={{ color: "primary.main" }} />
                  ) : (
                    <UncheckedIcon sx={{ color: "action.disabled" }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mr: { xs: 5, md: 9 } }}
                    >
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: "block", mt: 0.25 }}>
                      <Typography variant="caption" color="text.secondary" component="span" sx={{ display: "block" }}>
                        {item.blurb}
                      </Typography>
                      {count > 0 && (
                        <Typography
                          variant="caption"
                          component="span"
                          sx={{ display: "block", mt: 0.5, color: "text.secondary" }}
                        >
                          {checks
                            .map(
                              (c) =>
                                `${c.propel_id === myPropelId ? "You" : c.name || "A mentor"}${
                                  c.checked_at ? ` · ${relativeTime(c.checked_at)}` : ""
                                }`
                            )
                            .join("  ·  ")}
                        </Typography>
                      )}
                      {canInteract && !mine && !covered && (
                        <Typography
                          variant="caption"
                          component="span"
                          sx={{ display: "block", mt: 0.25, color: "primary.main", fontWeight: 600 }}
                        >
                          + Add your check
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  const renderRubric = () => (
    <Box>
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
        <GavelIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          Worst rating wins for the consensus row — coach the lowest.
        </Typography>
        <Link
          href="https://www.ohack.dev/about/judges#judging-criteria"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{ ml: "auto", display: "inline-flex", alignItems: "center", gap: 0.25 }}
        >
          Full rubric <OpenInNewIcon sx={{ fontSize: 12 }} />
        </Link>
      </Box>
      <Stack spacing={1}>
        {JUDGING_CRITERIA.map((c) => {
          const byMentor = ratingsByMentor[c.slug] || {};
          const myLatest = myPropelId ? byMentor[myPropelId] : null;
          const consensus = consensusForCriterion(byMentor);
          return (
            <Paper key={c.slug} variant="outlined" sx={{ p: 1.5 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 120 }}>
                  {c.label}
                </Typography>
                {consensus && (
                  <Chip
                    size="small"
                    color={SCORE_META[consensus].color}
                    label={`Consensus: ${SCORE_META[consensus].emoji} ${SCORE_META[consensus].label}`}
                  />
                )}
                {myLatest && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`You: ${SCORE_META[myLatest.score].emoji} ${relativeTime(myLatest.rated_at)}`}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {c.blurb}
              </Typography>
              {canInteract && (
                <ButtonGroup size="small" variant="outlined" sx={{ flexWrap: "wrap" }}>
                  {["green", "yellow", "red"].map((s) => (
                    <Button
                      key={s}
                      onClick={() => setRating(c.slug, s)}
                      color={SCORE_META[s].color}
                      variant={myLatest?.score === s ? "contained" : "outlined"}
                      sx={{ minWidth: 80 }}
                    >
                      {SCORE_META[s].emoji} {SCORE_META[s].label}
                    </Button>
                  ))}
                </ButtonGroup>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );

  const renderNotes = () => (
    <Box>
      {canInteract && (
        <Box sx={{ mb: 2 }}>
          <TextField
            inputRef={noteFieldRef}
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Drop a public note — what did you observe? What does this team need next?"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value.slice(0, 1000))}
            helperText={`${noteDraft.length}/1000 — visible to everyone, attributed to you`}
            disabled={busy}
          />
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="small"
              onClick={postNote}
              disabled={!noteDraft.trim() || busy}
              startIcon={<NoteIcon />}
            >
              Post note
            </Button>
          </Box>
        </Box>
      )}
      {notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No mentor notes yet.
          {canInteract ? " Be the first — observations help the next mentor on shift." : ""}
        </Typography>
      ) : (
        <List disablePadding>
          {notes.map((n, idx) => (
            <React.Fragment key={n.id || idx}>
              {idx > 0 && <Divider component="li" />}
              <NoteRow
                note={n}
                canDelete={canInteract && n.author_propel_id === myPropelId && !n.deleted_at}
                onDelete={() => deleteNote(n.id)}
              />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );

  // -- Read-only Alert for non-mentors / not-logged-in
  const readOnlyAlert = !canInteract ? (
    <Alert severity="info" sx={{ mb: 2 }}>
      {mentorCheckLoading && isLoggedIn ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={14} />
          <span>Checking mentor status…</span>
        </Box>
      ) : (
        <>
          Mentor support is tracked publicly per team.{" "}
          {isLoggedIn ? (
            eventId ? (
              <>
                You're not registered as an approved mentor for this event. Want to help?{" "}
                <Link component={NextLink} href={`/hack/${eventId}/mentor-application`}>
                  Apply as a mentor →
                </Link>
              </>
            ) : (
              <>
                Approved mentors can mark coverage, raise flags, rate judging-readiness,
                and leave public notes. Want to mentor an upcoming event?{" "}
                <Link component={NextLink} href="/hack">
                  Browse hackathons →
                </Link>
              </>
            )
          ) : (
            <>
              Approved mentors can mark coverage, raise flags, rate judging-readiness,
              and leave public notes. Log in if you're mentoring this event.
            </>
          )}
        </>
      )}
    </Alert>
  ) : null;

  // -- compose layout
  const sections = [
    {
      key: "concerns",
      title: openFlags.length > 0 ? `Open concerns (${openFlags.length})` : "Open concerns",
      icon: <FlagIcon fontSize="small" />,
      defaultExpanded: openFlags.length > 0,
      content: renderOpenConcerns(),
    },
    {
      key: "coverage",
      title: `Coverage (${doneCount}/${MENTOR_COVERAGE_TOTAL})`,
      icon: <CheckCircleIcon fontSize="small" />,
      defaultExpanded: !isMobile || openFlags.length === 0,
      content: renderCoverage(),
    },
    {
      key: "rubric",
      title: "Judging readiness",
      icon: <GavelIcon fontSize="small" />,
      defaultExpanded: !isMobile,
      content: renderRubric(),
    },
    {
      key: "notes",
      title: `Notes (${notes.filter((n) => !n.deleted_at).length})`,
      icon: <NoteIcon fontSize="small" />,
      defaultExpanded: !isMobile,
      content: renderNotes(),
    },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        border: 1,
        borderColor: openFlags.length > 0 ? "warning.light" : "divider",
      }}
    >
      {/* Header strip */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <MentorIcon color="primary" />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            Mentor support
          </Typography>
        </Box>
        {canInteract && (
          <Tooltip title="Records you stopping by — marks the team as 'recently touched' and prefills a note.">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MentorIcon />}
                onClick={checkInNow}
                disabled={busy}
              >
                I'm here now
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ mb: 2 }}>{headerPills}</Box>

      {readOnlyAlert}

      {/* Sections — Accordions on mobile, inline on desktop */}
      {isMobile ? (
        <Stack spacing={1}>
          {sections.map((s) => (
            <Accordion key={s.key} defaultExpanded={s.defaultExpanded} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {s.icon}
                  <Typography variant="subtitle2" fontWeight={700}>
                    {s.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>{s.content}</AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ) : (
        <Stack spacing={3} divider={<Divider flexItem />}>
          {sections.map((s) => (
            <Box key={s.key}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                {s.icon}
                <Typography variant="subtitle1" fontWeight={700}>
                  {s.title}
                </Typography>
              </Box>
              {s.content}
            </Box>
          ))}
        </Stack>
      )}

      {/* --- Dialogs --- */}

      <Dialog
        open={raiseFlagOpen}
        onClose={() => setRaiseFlagOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Raise a mentor flag</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This posts into the team's Slack channel and heartbeats the per-event mentor channel
            so other mentors don't duplicate effort. You'll be set as the owner — others can take
            over from this panel.
          </DialogContentText>
          <Select
            value={raiseFlagSeverity}
            onChange={(e) => setRaiseFlagSeverity(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            <MenuItem value="needs_attention">⚠️ Needs attention</MenuItem>
            <MenuItem value="blocked">🚨 Blocked</MenuItem>
          </Select>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            label="What's going on?"
            placeholder="e.g. Team is stuck on auth setup, would love a mentor with NextAuth experience."
            value={raiseFlagBody}
            onChange={(e) => setRaiseFlagBody(e.target.value.slice(0, 500))}
            helperText={`${raiseFlagBody.length}/500`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRaiseFlagOpen(false)}>Cancel</Button>
          <Button
            onClick={raiseFlag}
            disabled={!raiseFlagBody.trim() || busy}
            variant="contained"
            color="warning"
          >
            Raise flag
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!resolveFlag}
        onClose={() => setResolveFlag(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resolve this flag</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Briefly note what was done. The team Slack channel will get a resolution message.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            label="Resolution note"
            placeholder="e.g. Walked through NextAuth setup, team is unblocked."
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value.slice(0, 500))}
            helperText={`${resolveNote.length}/500`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveFlag(null)}>Cancel</Button>
          <Button
            onClick={resolveFlagSubmit}
            disabled={!resolveNote.trim() || busy}
            variant="contained"
            color="success"
          >
            Mark resolved
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
