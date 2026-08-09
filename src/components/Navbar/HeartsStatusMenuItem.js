import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { MenuItem, Box, Typography, LinearProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { formatHearts } from "../../lib/heartTiers";
import { trackEvent } from "../../lib/ga";

// Refined-palette tokens, inlined — the NavBar is not inside a RefinedRoot,
// so the .ohx-* classes / CSS vars are unavailable here.
const INK = "#16181D";
const MUTED = "#5B6270";
const NAVY = "#1B3A6B";
const TERRACOTTA = "#E2552E";
const HAIRLINE = "#E7E1D4";

/**
 * Rewards-status header for the avatar dropdown — tier, hearts, and progress
 * to the next tier, linking to the profile Hearts tab. Renders a single
 * Link-wrapped MenuItem (same shape as the sibling auth_settings items) or
 * null before the profile loads; never a Fragment (MUI Menu keyboard nav).
 */
export default function HeartsStatusMenuItem({
  profile,
  hearts,
  tier,
  nextTier,
  heartsToNext,
  progressPct,
  onNavigate,
}) {
  if (!profile) return null;

  const handleClick = () => {
    trackEvent({
      action: "hearts_status_click",
      params: { source: "navbar_menu", event_label: tier?.name || "none", hearts },
    });
    if (onNavigate) onNavigate();
  };

  let caption;
  if (!nextTier) {
    caption = "Top tier · View rewards →";
  } else if (tier) {
    caption = `${formatHearts(heartsToNext)} to ${nextTier.name} · View rewards →`;
  } else {
    caption = `${formatHearts(heartsToNext)} heart${heartsToNext === 1 ? "" : "s"} to Bronze — start earning`;
  }

  return (
    <Link href="/profile#hearts" passHref>
      <MenuItem
        onClick={handleClick}
        sx={{
          display: "block",
          py: 1.5,
          minHeight: "48px",
          minWidth: 230,
          borderBottom: `1px solid ${HAIRLINE}`,
          mb: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FavoriteIcon sx={{ fontSize: 16, color: TERRACOTTA }} />
          <Typography sx={{ fontWeight: 700, color: INK, fontSize: "0.95rem" }}>
            {tier
              ? `${tier.name} · ${formatHearts(hearts)} heart${hearts === 1 ? "" : "s"}`
              : `${formatHearts(hearts)} heart${hearts === 1 ? "" : "s"}`}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{
            mt: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: HAIRLINE,
            "& .MuiLinearProgress-bar": { backgroundColor: NAVY },
          }}
        />
        <Typography sx={{ mt: 0.5, fontSize: "0.78rem", color: MUTED }}>
          {caption}
        </Typography>
      </MenuItem>
    </Link>
  );
}

HeartsStatusMenuItem.propTypes = {
  profile: PropTypes.object,
  hearts: PropTypes.number,
  tier: PropTypes.object,
  nextTier: PropTypes.object,
  heartsToNext: PropTypes.number,
  progressPct: PropTypes.number,
  onNavigate: PropTypes.func,
};
