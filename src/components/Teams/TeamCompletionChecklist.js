import React, { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useAuthInfo } from "@propelauth/react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Typography,
  keyframes,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  EmojiEvents as TrophyIcon,
  Cloud as CloudIcon,
  Handshake as HandshakeIcon,
  VpnKey as KeyIcon,
  GitHub as GitHubIcon,
  TaskAlt as TaskAltIcon,
  Lock as LockIcon,
  Description as DescriptionIcon,
  Public as PublicIcon,
  Close as CloseIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";

// Lazy load confetti (matches the volunteer/track.js pattern)
const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
  loading: () => null,
});

// Canonical 8-item Definition of Done. Wording mirrors /about/completion;
// `slug` MUST match backend COMPLETION_ITEMS in api/teams/teams_service.py.
const COMPLETION_ITEMS = [
  {
    slug: "deployed",
    label: "Deployed",
    icon: <CloudIcon />,
    blurb: "Code is live in production (AWS, fly.io, GCP).",
  },
  {
    slug: "nonprofit_signoff",
    label: "Nonprofit Signoff",
    icon: <HandshakeIcon />,
    blurb: "Your nonprofit partner agrees the software meets their needs.",
  },
  {
    slug: "login_details",
    label: "Login Details for Testing",
    icon: <KeyIcon />,
    blurb: "Test credentials shared securely (changeable later).",
  },
  {
    slug: "code_updated",
    label: "Code Updated",
    icon: <GitHubIcon />,
    blurb: "All code, README, and docs in the designated GitHub repo.",
  },
  {
    slug: "tasks_closed",
    label: "Tasks Closed",
    icon: <TaskAltIcon />,
    blurb: "GitHub issues/tasks closed or addressed.",
  },
  {
    slug: "sensitive_info_security",
    label: "Sensitive Info Secured",
    icon: <LockIcon />,
    blurb: "No secrets in the repo; shared securely elsewhere.",
  },
  {
    slug: "documentation",
    label: "Documentation",
    icon: <DescriptionIcon />,
    blurb: "How to use, deploy, update, and configure.",
  },
  {
    slug: "open_source",
    label: "Open-Sourced (MIT)",
    icon: <PublicIcon />,
    blurb: "Repo is public under MIT.",
  },
];
const TOTAL = COMPLETION_ITEMS.length;

const pizzazPop = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.6) rotate(-8deg); }
  60%  { transform: scale(0.9) rotate(6deg); }
  100% { transform: scale(1); }
`;

const giantPulse = keyframes`
  0%, 100% { box-shadow: 0 0 18px rgba(255,107,107,0.6), 0 0 36px rgba(72,219,251,0.5); transform: translateY(0); }
  50%      { box-shadow: 0 0 28px rgba(255,107,107,0.9), 0 0 60px rgba(72,219,251,0.8); transform: translateY(-2px); }
`;

const bannerShimmer = keyframes`
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

function relativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function TeamCompletionChecklist({ team, eventId, onTeamUpdate }) {
  const { user, accessToken, isLoggedIn } = useAuthInfo();

  const checklist = team?.completion_checklist || {};
  const isComplete = team?.completion_status === "complete";

  // Membership must come from the server: the public team payload
  // intentionally omits `propel_id` (PII), and user docs have an OAuth-shaped
  // `user_id` that PropelAuth's `user.userId` can't be compared to directly.
  // GET /api/team/<event_id>/me returns the teams the caller is on for the event.
  const [membershipChecked, setMembershipChecked] = useState(false);
  const [isOnTeam, setIsOnTeam] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isLoggedIn || !accessToken || !eventId || !team?.id) {
      setIsOnTeam(false);
      setMembershipChecked(!!eventId);
      return undefined;
    }
    setMembershipChecked(false);
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${eventId}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : { teams: [] }))
      .then((data) => {
        if (cancelled) return;
        const myTeams = Array.isArray(data?.teams) ? data.teams : [];
        setIsOnTeam(myTeams.some((t) => t?.id === team.id));
        setMembershipChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsOnTeam(false);
        setMembershipChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, accessToken, eventId, team?.id]);

  const doneCount = useMemo(
    () => COMPLETION_ITEMS.reduce((acc, it) => acc + (checklist[it.slug]?.done ? 1 : 0), 0),
    [checklist]
  );
  const progressPct = (doneCount / TOTAL) * 100;
  const allDone = doneCount === TOTAL;

  const [confirmItem, setConfirmItem] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [poppingSlug, setPoppingSlug] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const measure = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const fireConfetti = useCallback((durationMs = 2500) => {
    setConfettiKey((k) => k + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), durationMs);
  }, []);

  const fireRowPop = useCallback((slug) => {
    setPoppingSlug(slug);
    setTimeout(() => setPoppingSlug((curr) => (curr === slug ? null : curr)), 700);
  }, []);

  const showSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleConfirmToggle = async () => {
    if (!confirmItem) return;
    const slug = confirmItem.slug;
    setPendingSlug(slug);
    setConfirmItem(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${team.id}/completion/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ item: slug }),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Failed (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.team && onTeamUpdate) {
        onTeamUpdate({ ...data.team, id: team.id });
      }
      fireConfetti(2500);
      fireRowPop(slug);
      const channel = team?.slack_channel ? `#${team.slack_channel}` : "your team Slack channel";
      showSnack(`✅ Slack message sent to ${channel} (${data.done || doneCount + 1}/${TOTAL})`);
    } catch (err) {
      showSnack(err.message || "Couldn't update checklist", "error");
    } finally {
      setPendingSlug(null);
    }
  };

  const handleConfirmComplete = async () => {
    setConfirmComplete(false);
    setCompleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${team.id}/completion/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Failed (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.team && onTeamUpdate) {
        onTeamUpdate({ ...data.team, id: team.id });
      }
      fireConfetti(8000);
      setCelebrationOpen(true);
    } catch (err) {
      showSnack(err.message || "Couldn't mark project complete", "error");
    } finally {
      setCompleting(false);
    }
  };

  const headerSubtitle = isComplete
    ? "Project complete — congratulations!"
    : isOnTeam
      ? `Each check posts a celebration to ${team?.slack_channel ? `#${team.slack_channel}` : "your team's Slack channel"}.`
      : "Read-only view. Log in as a team member to mark items complete.";

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        position: "relative",
        overflow: "hidden",
        border: isComplete ? "2px solid #ffb300" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {showConfetti && windowSize.width > 0 && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: (t) => t.zIndex.tooltip + 1,
          }}
        >
          <Confetti
            key={confettiKey}
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={allDone ? 800 : 500}
            recycle={false}
            gravity={0.25}
          />
        </Box>
      )}

      {isComplete && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            color: "#3e2723",
            background:
              "linear-gradient(90deg, #ffd54f, #ffecb3, #ffd54f, #ffecb3, #ffd54f)",
            backgroundSize: "200% 200%",
            animation: `${bannerShimmer} 4s linear infinite`,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            🏆 PROJECT COMPLETE 🏆
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Completed{" "}
            {team.completion_completed_at
              ? new Date(team.completion_completed_at).toLocaleDateString()
              : ""}
            {team.completion_completed_by_name
              ? ` by ${team.completion_completed_by_name}`
              : ""}
            . You shipped it. 🚀
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <CelebrationIcon color="primary" />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          Definition of Done
        </Typography>
        <Chip
          size="small"
          color={allDone ? "success" : "primary"}
          label={`${doneCount} / ${TOTAL}`}
          sx={{ ml: 1, fontWeight: 700 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {headerSubtitle}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{
          height: 10,
          borderRadius: 5,
          mb: 2,
          backgroundColor: "rgba(0,0,0,0.06)",
          "& .MuiLinearProgress-bar": {
            background: allDone
              ? "linear-gradient(90deg, #ffd54f, #ff9800, #ffd54f)"
              : "linear-gradient(90deg, #1dd1a1, #48dbfb)",
          },
        }}
      />

      {!isOnTeam && !isComplete && membershipChecked && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You're viewing this team's progress.{" "}
          {isLoggedIn
            ? "Only members of this team can mark items complete. If you just joined, refresh the page in a moment."
            : "Team members can log in to mark items complete"}{" "}
          — each check sends a celebration into the team's Slack channel.
        </Alert>
      )}
      {!membershipChecked && isLoggedIn && !isComplete && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, color: "text.secondary" }}>
          <CircularProgress size={16} />
          <Typography variant="body2">Checking team membership…</Typography>
        </Box>
      )}

      <List disablePadding>
        {COMPLETION_ITEMS.map((item, idx) => {
          const state = checklist[item.slug] || {};
          const done = !!state.done;
          const isPending = pendingSlug === item.slug;
          const isPopping = poppingSlug === item.slug;
          const canClick = isOnTeam && !done && !isPending && !isComplete;

          return (
            <React.Fragment key={item.slug}>
              {idx > 0 && <Divider component="li" />}
              <ListItem
                onClick={canClick ? () => setConfirmItem(item) : undefined}
                sx={{
                  py: 1.5,
                  cursor: canClick ? "pointer" : "default",
                  backgroundColor: done ? "rgba(76, 175, 80, 0.08)" : "transparent",
                  transition: "background-color 200ms ease",
                  "&:hover": canClick ? { backgroundColor: "rgba(72, 219, 251, 0.08)" } : {},
                }}
                secondaryAction={
                  done && state.completed_by_name ? (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="success"
                      label={`${state.completed_by_name} · ${relativeTime(state.completed_at)}`}
                    />
                  ) : null
                }
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  {isPending ? (
                    <CircularProgress size={22} />
                  ) : done ? (
                    <CheckCircleIcon
                      sx={{
                        color: "success.main",
                        fontSize: 28,
                        animation: isPopping ? `${pizzazPop} 700ms ease-out` : "none",
                      }}
                    />
                  ) : (
                    <UncheckedIcon sx={{ color: canClick ? "primary.main" : "action.disabled", fontSize: 28 }} />
                  )}
                </ListItemIcon>
                <ListItemIcon sx={{ minWidth: 36, color: done ? "success.main" : "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, textDecoration: done ? "line-through" : "none" }}
                    >
                      {item.label}
                    </Typography>
                  }
                  secondary={item.blurb}
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>

      {allDone && !isComplete && (
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            disabled={completing}
            onClick={() => setConfirmComplete(true)}
            sx={{
              minHeight: 80,
              fontSize: { xs: "1.1rem", md: "1.4rem" },
              fontWeight: 800,
              color: "white",
              letterSpacing: 1,
              background:
                "linear-gradient(135deg, #ff6b6b 0%, #feca57 35%, #48dbfb 70%, #1dd1a1 100%)",
              backgroundSize: "200% 200%",
              animation: `${giantPulse} 2.4s ease-in-out infinite`,
              "&:hover": {
                background:
                  "linear-gradient(135deg, #ff5252 0%, #ffb300 35%, #29b6f6 70%, #00bfa5 100%)",
              },
            }}
          >
            {completing ? (
              <CircularProgress size={26} sx={{ color: "white" }} />
            ) : (
              "🚀  Mark Project Complete  🚀"
            )}
          </Button>
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 1, textAlign: "center", color: "text.secondary" }}
          >
            Posts a celebration to your team's Slack channel and notifies the OHack team.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button
          component={NextLink}
          href="/about/completion"
          target="_blank"
          rel="noopener noreferrer"
          size="small"
        >
          Full Definition of Done →
        </Button>
      </Box>

      {/* Per-item confirmation dialog */}
      <Dialog open={!!confirmItem} onClose={() => setConfirmItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark "{confirmItem?.label}" complete?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will post a message to your team's Slack channel
            {team?.slack_channel ? ` (#${team.slack_channel})` : ""} and{" "}
            <strong>cannot be undone</strong>.
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">{confirmItem?.blurb}</Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmItem(null)}>Cancel</Button>
          <Button onClick={handleConfirmToggle} variant="contained" color="primary">
            Yes, mark complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final "complete the project" confirmation */}
      <Dialog open={confirmComplete} onClose={() => setConfirmComplete(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark the entire project COMPLETE?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to finalize <strong>{team?.name || "your team"}</strong>'s project.
            This posts a celebration message into your team's Slack channel that{" "}
            <strong>CCs the OHack admins</strong>. It can't be undone from this page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmComplete(false)}>Not yet</Button>
          <Button onClick={handleConfirmComplete} variant="contained" color="success">
            Yes, we shipped it! 🚀
          </Button>
        </DialogActions>
      </Dialog>

      {/* Celebration dialog */}
      <Dialog open={celebrationOpen} onClose={() => setCelebrationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
          <IconButton
            aria-label="close"
            onClick={() => setCelebrationOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <TrophyIcon sx={{ fontSize: 110, color: "#ffb300" }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
            You shipped it!
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, color: "text.secondary" }}>
            {team?.name || "Your team"} is officially complete.
          </Typography>
          <Typography variant="body1" sx={{ mt: 3 }}>
            Thank you for the months of work after the hackathon. This is the kind of
            follow-through that turns a weekend project into real impact for a
            nonprofit. 💛
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              component={NextLink}
              href="/about/success-stories"
            >
              Read other success stories
            </Button>
            <Button variant="outlined" onClick={() => setCelebrationOpen(false)}>
              Back to team page
            </Button>
          </Stack>
        </DialogContent>
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
