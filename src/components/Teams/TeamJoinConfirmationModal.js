import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  FaHandshake,
  FaShieldAlt,
  FaUsers,
  FaUserFriends,
} from "react-icons/fa";
import { FONT_BODY, FONT_DISPLAY } from "../../styles/fonts";

// Literal refined-palette colors: a Dialog renders through a MUI Portal,
// outside any RefinedRoot, so `.ohx-*` classes and `var(--x)` never reach it.
const NAVY = "#1B3A6B";
const NAVY_HOVER = "#16315a";
const INK = "#16181D";
const MUTED = "#5B6270";
const LINE = "#E7E1D4";
const SURFACE_2 = "#F6F3EB";
const SUCCESS = "#2e7d32";

const EMPTY = { knowTeamMember: false, notMentor: false, understands: false };

export const JOIN_CHECKLIST_ITEMS = [
  {
    key: "knowTeamMember",
    Icon: FaHandshake,
    title: "I know someone on this team",
    description:
      "Teams work best when you've already talked. Connect with a member on Slack first, or come with friends.",
  },
  {
    key: "notMentor",
    Icon: FaShieldAlt,
    title: "I'm participating as a hacker",
    description:
      "Mentors help many teams and may not stay the whole hackathon, so they don't join a single team.",
  },
  {
    key: "understands",
    Icon: FaUsers,
    title: "I'm ready to collaborate",
    description:
      "I'll contribute throughout the hackathon to build something useful for the nonprofit.",
  },
];

/**
 * Three-ack confirmation before joining a team. Shared by the event page's
 * team cards (`Hackathon/TeamList`) and the team page's members section.
 * `onConfirm` fires once every item is checked; the parent owns the request.
 */
export default function TeamJoinConfirmationModal({
  open,
  onClose,
  onConfirm,
  teamName,
  loading = false,
  // false when the viewer logged in without Slack: join_team only invites
  // Slack logins to the team channel.
  slackInvite = true,
}) {
  const [confirmations, setConfirmations] = useState(EMPTY);

  const toggle = (key) =>
    setConfirmations((prev) => ({ ...prev, [key]: !prev[key] }));

  const checkedCount = Object.values(confirmations).filter(Boolean).length;
  const allConfirmed = checkedCount === JOIN_CHECKLIST_ITEMS.length;

  const handleConfirm = () => {
    if (!allConfirmed) return;
    onConfirm();
    setConfirmations(EMPTY);
  };

  const handleClose = () => {
    onClose();
    setConfirmations(EMPTY);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="team-join-dialog-title"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      <Box sx={{ background: NAVY, color: "#fff", px: 3, py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.14)",
              flexShrink: 0,
            }}
          >
            <FaUserFriends style={{ fontSize: 20 }} />
          </Box>
          <Typography
            id="team-join-dialog-title"
            component="h2"
            sx={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 500,
              fontSize: { xs: "1.35rem", sm: "1.6rem" },
              lineHeight: 1.15,
              m: 0,
            }}
          >
            Ready to join {teamName || "this team"}?
          </Typography>
        </Box>
        <Typography
          sx={{ fontFamily: FONT_BODY, fontSize: 15, opacity: 0.85, m: 0 }}
        >
          A quick check so you land on a team that's expecting you.
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {JOIN_CHECKLIST_ITEMS.map(({ key, Icon, title, description }) => {
            const checked = confirmations[key];
            return (
              <Grid size={{ xs: 12, sm: 4 }} key={key}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-pressed={checked}
                  onClick={() => toggle(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(key);
                    }
                  }}
                  sx={{
                    height: "100%",
                    boxSizing: "border-box",
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: `1px solid ${checked ? NAVY : LINE}`,
                    background: checked ? "rgba(27,58,107,0.06)" : "#fff",
                    textAlign: "center",
                    transition: "border-color .18s ease, background .18s ease",
                    "&:hover": { borderColor: NAVY },
                    "&:focus-visible": {
                      outline: `2px solid ${NAVY}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box sx={{ color: NAVY, mb: 1 }}>
                    <Icon style={{ fontSize: 22 }} />
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => toggle(key)}
                        onClick={(e) => e.stopPropagation()}
                        inputProps={{ "aria-label": title }}
                        sx={{ color: NAVY, "&.Mui-checked": { color: NAVY } }}
                      />
                    }
                    label={
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                          fontSize: 15,
                          color: INK,
                        }}
                      >
                        {title}
                      </Typography>
                    }
                    sx={{
                      flexDirection: "column",
                      alignItems: "center",
                      m: 0,
                      "& .MuiFormControlLabel-label": { mt: 0.5 },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: MUTED,
                      mt: 0.75,
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 3 }}>
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              color: MUTED,
              flexShrink: 0,
            }}
          >
            {checkedCount} of {JOIN_CHECKLIST_ITEMS.length} confirmed
          </Typography>
          <LinearProgress
            variant="determinate"
            aria-hidden
            value={(checkedCount / JOIN_CHECKLIST_ITEMS.length) * 100}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: SURFACE_2,
              "& .MuiLinearProgress-bar": {
                backgroundColor: allConfirmed ? SUCCESS : NAVY,
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Typography
          role="status"
          sx={{
            fontFamily: FONT_BODY,
            fontSize: 14,
            color: allConfirmed ? SUCCESS : MUTED,
            mt: 1.5,
          }}
        >
          {allConfirmed
            ? slackInvite
              ? "All set. You'll be added to the team and its Slack channel."
              : "All set. You'll be added to the team — then join its channel in Slack."
            : "Confirm the three items above to join."}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 0, gap: 1.5, justifyContent: "flex-end" }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{
            fontFamily: FONT_BODY,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1,
            color: INK,
            borderColor: LINE,
            "&:hover": { borderColor: INK, background: "rgba(0,0,0,0.02)" },
          }}
        >
          Maybe later
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!allConfirmed || loading}
          variant="contained"
          disableElevation
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FaUserFriends />
            )
          }
          sx={{
            fontFamily: FONT_BODY,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1,
            background: NAVY,
            "&:hover": { background: NAVY_HOVER },
          }}
        >
          {loading ? "Joining…" : "Join team"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
