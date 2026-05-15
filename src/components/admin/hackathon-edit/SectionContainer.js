import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

/**
 * Standardized wrapper for every section. Renders the title, optional
 * description, then the section's content. Sections that need explicit Save
 * pass `dirty`, `onSave`, and `onDiscard`; those render a sticky bottom bar.
 */
const SectionContainer = ({
  title,
  description,
  actions,
  children,
  dirty = false,
  saving = false,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
}) => {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", position: "relative" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" sx={{ mb: description ? 1 : 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>{title}</Typography>
        {actions && <Box>{actions}</Box>}
      </Stack>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      <Box>{children}</Box>

      {(dirty || saving) && onSave && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            mt: 4,
            mx: { xs: -2, md: -3 },
            mb: { xs: -2, md: -3 },
            px: { xs: 2, md: 3 },
            py: 1.5,
            bgcolor: "warning.50",
            borderTop: "1px solid",
            borderColor: "warning.light",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            backdropFilter: "blur(2px)",
          }}
        >
          {onDiscard && (
            <Button size="small" onClick={onDiscard} disabled={saving} color="inherit">
              Discard
            </Button>
          )}
          <Button size="small" variant="contained" onClick={onSave} disabled={saving} color="primary">
            {saving ? "Saving…" : saveLabel}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SectionContainer;
