import React from "react";
import { Box } from "@mui/material";

/**
 * Module-scope shared section shell for every dashboard card — keeps the
 * `<section id>` anchors, spacing, and heading markup identical everywhere
 * (SectionBlock remount lesson: this must never be redefined inside a
 * parent component's render body).
 */
export default function DashboardSection({
  id,
  eyebrow,
  title,
  action,
  children,
}) {
  return (
    <Box
      component="section"
      id={id}
      sx={{ scrollMarginTop: 96, mb: { xs: 4, md: 5 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box>
          {eyebrow && <div className="ohx-eyebrow">{eyebrow}</div>}
          <h2
            className="ohx-display"
            style={{
              fontSize: "clamp(1.25rem, 2.2vw, 1.6rem)",
              margin: "2px 0 0",
              fontWeight: 600,
            }}
          >
            {title}
          </h2>
        </Box>
        {action}
      </Box>
      <Box className="ohx-card" sx={{ p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
