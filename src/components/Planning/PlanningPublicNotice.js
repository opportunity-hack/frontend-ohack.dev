import { Alert, AlertTitle } from "@mui/material";

export default function PlanningPublicNotice({ collapsible = false }) {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <AlertTitle>This planning board is public</AlertTitle>
      Anything you upload, comment, or write here will be visible to everyone on ohack.dev —
      including search engines. Don&apos;t share confidential nonprofit details, personal contact
      info, or unreleased budget figures.
    </Alert>
  );
}
