import React, { memo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, Stack } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import LinkedInShareButton from "../../share/LinkedInShareButton";

function BadgeCard({ badge, mode, profileUrl }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        width: 160,
        borderRadius: 2,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        position: "relative",
        backgroundColor: "background.paper",
      }}
    >
      {mode === "public" && profileUrl && (
        <Box sx={{ position: "absolute", top: 4, right: 4 }}>
          <LinkedInShareButton
            variant="section"
            url={profileUrl}
            tooltip={`Share ${badge.description || "this badge"} on LinkedIn`}
            size="small"
          />
        </Box>
      )}
      <Box
        component="img"
        src={badge.image}
        alt={badge.description || "Badge"}
        loading="lazy"
        decoding="async"
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(0,0,0,0.08)",
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {badge.description}
      </Typography>
    </Paper>
  );
}

BadgeCard.propTypes = {
  badge: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(["public", "private"]).isRequired,
  profileUrl: PropTypes.string,
};

function BadgesSection({ badges, mode = "public", profileUrl }) {
  if (!badges) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading badges…
      </Typography>
    );
  }
  if (badges.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        {mode === "private"
          ? "You haven't earned any badges yet. Sign up for a hackathon to start earning achievements."
          : "No badges earned yet."}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {badges.map((badge, i) => (
          <BadgeCard
            key={badge.id || i}
            badge={badge}
            mode={mode}
            profileUrl={profileUrl}
          />
        ))}
      </Stack>
      <Box
        sx={{
          p: 1.5,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EmojiEventsIcon color="primary" fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {badges.length} achievement{badges.length === 1 ? "" : "s"} earned
        </Typography>
      </Box>
    </Box>
  );
}

BadgesSection.propTypes = {
  badges: PropTypes.array,
  mode: PropTypes.oneOf(["public", "private"]),
  profileUrl: PropTypes.string,
};

export default memo(BadgesSection);
