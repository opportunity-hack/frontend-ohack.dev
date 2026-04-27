import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, Stack } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Link from "next/link";

/**
 * Why-we-give-out-hearts info card. Shown alongside HeartGauge / FeedbackSection
 * to explain what the heart score represents and how to earn more.
 */
function HeartsExplainer({ compact = false }) {
  const tone = compact ? "body2" : "body1";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        backgroundColor: "rgba(255, 109, 117, 0.05)",
        borderColor: "rgba(255, 109, 117, 0.3)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <FavoriteIcon sx={{ color: "#ff6d75" }} fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Why we give out hearts
        </Typography>
      </Box>
      <Typography variant={tone} color="text.secondary" sx={{ mb: compact ? 1 : 1.5 }}>
        Hearts are how we recognize the impact you create at Opportunity Hack —
        not the hours you log. Every heart represents real, measurable progress
        for a nonprofit: code shipped to production, requirements gathered,
        documentation written, mentorship given.
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Typography variant="body2">
          <strong>Earn hearts by</strong> shipping projects, writing docs, mentoring,
          and judging.
        </Typography>
        <Typography
          component={Link}
          href="/about/hearts"
          variant="body2"
          color="primary"
          sx={{ fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          Learn more about hearts and rewards →
        </Typography>
      </Stack>
    </Paper>
  );
}

HeartsExplainer.propTypes = {
  compact: PropTypes.bool,
};

export default HeartsExplainer;
