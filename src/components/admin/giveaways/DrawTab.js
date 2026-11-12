import React from "react";
import { Alert } from "@mui/material";

// Placeholder until the live draw stage lands (plan §7, PR 3).
export default function DrawTab() {
  return (
    <Alert severity="info">
      The live draw is coming next. Until then, set up prizes and review entries here.
    </Alert>
  );
}
