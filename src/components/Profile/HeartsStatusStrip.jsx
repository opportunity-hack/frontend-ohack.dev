import React from "react";
import PropTypes from "prop-types";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  countHeartsFromHistory,
  getTierForHearts,
  getNextTier,
  formatHearts,
} from "../../lib/heartTiers";
import { Arrow } from "../design/refined";
import { trackEvent } from "../../lib/ga";

/*
 * Compact one-line hearts status for the profile masthead — the loyalty-card
 * summary that replaced the full-height HeartGauge panel. Clicks through to
 * the Hearts tab. Same layout in tier and no-tier states so the masthead
 * height never shifts.
 */
export default function HeartsStatusStrip({ history, onOpenHearts }) {
  const hearts = countHeartsFromHistory(history);
  const tier = getTierForHearts(hearts);
  const nextTier = getNextTier(hearts);
  const curMin = tier?.minHearts || 0;
  const pct = nextTier
    ? Math.max(0, Math.min(100, ((hearts - curMin) / (nextTier.minHearts - curMin)) * 100))
    : 100;

  const handleClick = () => {
    trackEvent({
      action: "hearts_status_click",
      params: { source: "profile_masthead", event_label: tier?.name || "none", hearts },
    });
    onOpenHearts();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ohx-card ohx-card--hover"
      aria-label="View your hearts and rewards"
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        padding: "10px 16px",
        background: "var(--surface)",
        color: "var(--ink)",
        font: "inherit",
        cursor: "pointer",
      }}
    >
      <FavoriteIcon sx={{ fontSize: 15, color: "var(--accent)" }} />
      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
        {tier
          ? `${tier.name} · ${formatHearts(hearts)} heart${hearts === 1 ? "" : "s"}`
          : `${formatHearts(hearts)} of 2 hearts to Bronze`}
      </span>
      <span
        aria-hidden
        style={{
          width: 110,
          height: 5,
          borderRadius: 3,
          background: "var(--line)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: `${pct}%`,
            height: "100%",
            background: "var(--brand)",
          }}
        />
      </span>
      <span className="ohx-muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
        {nextTier
          ? `${formatHearts(nextTier.minHearts - hearts)} to ${nextTier.name}`
          : "Top tier"}
      </span>
      <Arrow />
    </button>
  );
}

HeartsStatusStrip.propTypes = {
  history: PropTypes.object,
  onOpenHearts: PropTypes.func.isRequired,
};
