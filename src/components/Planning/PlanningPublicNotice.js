import { Alert, AlertTitle } from "@mui/material";

export default function PlanningPublicNotice({ compact = false, collapsible = false }) {
  if (compact) {
    return (
      <Alert
        severity="info"
        icon={false}
        sx={{
          py: 0,
          px: 1.5,
          fontSize: "0.75rem",
          "& .MuiAlert-message": { py: 0.5 },
        }}
      >
        🌐 <strong>Public board</strong> — visible to everyone on ohack.dev. Don&apos;t share
        confidential details.
      </Alert>
    );
  }
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <AlertTitle>This planning board is public</AlertTitle>
      Anything you upload, comment, or write here will be visible to everyone on ohack.dev —
      including search engines. Don&apos;t share confidential nonprofit details, personal contact
      info, or unreleased budget figures.
    </Alert>
  );
}
