import React from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useEnv } from "../../context/env.context";

export function ApplicationLoadingPanel({ eventTitle }) {
  return (
    <Box className="ohx-card" sx={{ mt: 3, p: 4, textAlign: "center" }}>
      <CircularProgress size={40} sx={{ color: "var(--brand)" }} />
      <Typography variant="body1" sx={{ mt: 2, color: "var(--muted)" }}>
        Checking your participation status for {eventTitle || "this hackathon"}…
      </Typography>
    </Box>
  );
}

export function NoApplicationPanel({ eventId, eventTitle }) {
  return (
    <Box className="ohx-card" sx={{ mt: 3, p: 4, textAlign: "center" }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          mb: 2,
          color: "var(--brand)",
        }}
      >
        Apply first to manage a team
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 3, color: "var(--muted)", maxWidth: 560, mx: "auto" }}
      >
        Team management is only available to hackers who have submitted a hacker
        application and been confirmed for {eventTitle || "this hackathon"}.
        Submit your application to get started — we&apos;ll email you once your
        spot is confirmed.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "center",
        }}
      >
        <a
          href={`/hack/${eventId}/hacker-application`}
          className="ohx-btn ohx-btn--primary"
        >
          Submit Hacker Application
        </a>
        <a href={`/hack/${eventId}`} className="ohx-btn ohx-btn--ghost">
          Back to Hackathon
        </a>
      </Box>
    </Box>
  );
}

export function AwaitingConfirmationPanel({ eventTitle }) {
  const { slackSignupUrl } = useEnv();
  return (
    <Box className="ohx-card" sx={{ mt: 3, p: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          color: "var(--brand)",
          mb: 2,
        }}
      >
        Your application is awaiting confirmation
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, color: "var(--muted)" }}>
        Thanks for applying to {eventTitle || "this hackathon"}! We&apos;ve
        received your hacker application — it just hasn&apos;t been confirmed
        for a spot yet, so team management is locked for now.
      </Typography>
      <Alert severity="info" icon={false} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>What this means:</strong> Most applications are reviewed
          within about a week. You&apos;ll get an email as soon as your spot is
          confirmed, and team management will unlock automatically.
        </Typography>
        <Typography variant="body2">
          If the event is close and you haven&apos;t heard back, we may have
          reached capacity for this hackathon.
        </Typography>
      </Alert>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1.5, color: "var(--brand)" }}
      >
        While you wait
      </Typography>
      {[
        "Join our Slack to meet hackers, mentors, and nonprofits",
        "Contribute to open-source nonprofit projects year-round",
        "Browse other Opportunity Hack events you can apply to",
      ].map((text) => (
        <Typography key={text} variant="body1" sx={{ mb: 1 }}>
          {text}
        </Typography>
      ))}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <a
          href={slackSignupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-btn ohx-btn--primary"
        >
          Join Our Community
        </a>
        <a href="/hack" className="ohx-btn ohx-btn--ghost">
          View Upcoming Events
        </a>
      </Box>
      <Typography
        variant="caption"
        sx={{ display: "block", mt: 2, color: "var(--faint)" }}
      >
        Already received your confirmation email? Try refreshing — your status
        may not have synced yet.
      </Typography>
    </Box>
  );
}

export function TeamCreationDisabledPanel() {
  return (
    <Alert severity="warning" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold">
        Team Creation Currently Disabled
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        Team creation has been disabled for this hackathon. Please check with
        the event organizers or wait for team creation to be re-enabled.
      </Typography>
    </Alert>
  );
}
