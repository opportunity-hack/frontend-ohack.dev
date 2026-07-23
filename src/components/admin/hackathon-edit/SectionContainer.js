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
  // When true, drops the Paper's internal padding so heavy content
  // (Tabs, workbenches with their own Paper elements) renders flush
  // inside the same outer frame. The border + width contract stay
  // so every section has the same outer width regardless of variant.
  disableGutters = false,
}) => {
  const hasHeader = !!(title || description);
  return (
    <Paper
      elevation={0}
      sx={{
        p: disableGutters ? 0 : { xs: 2, md: 3 },
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        // Width contract: every section's Paper renders at exactly the
        // parent content area's width. `width: 100%` + `boxSizing: border-box`
        // is enforcement, `maxWidth: 100%` + `minWidth: 0` are belts so a
        // child with intrinsic min-content larger than the parent can't push
        // the Paper wider (the content overflow is then clipped by the
        // scroll container's `overflowX: hidden`).
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {hasHeader && (
        <Box
          sx={{
            px: disableGutters ? { xs: 2, md: 3 } : 0,
            pt: disableGutters ? { xs: 2, md: 3 } : 0,
          }}
        >
          {title && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{ mb: description ? 1 : 2 }}
            >
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>{title}</Typography>
              {actions && <Box>{actions}</Box>}
            </Stack>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: disableGutters ? 2 : 3 }}>
              {description}
            </Typography>
          )}
        </Box>
      )}
      <Box>{children}</Box>

      {(dirty || saving) && onSave && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            mt: 4,
            mx: disableGutters ? 0 : { xs: -2, md: -3 },
            mb: disableGutters ? 0 : { xs: -2, md: -3 },
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
