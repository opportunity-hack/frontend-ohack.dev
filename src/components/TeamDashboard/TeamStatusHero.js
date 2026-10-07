import React, { useState } from "react";
import { Box } from "@mui/material";

const WAITING_VIDEOS = [
  "a_cat_that_is_waiting_to_pounce.mp4",
  "a_cat_that_is_waiting_to_pounce_1.mp4",
  "a_cat_that_is_waiting_to_pounce_2.mp4",
  "a_cat_that_is_waiting_to_pounce_3.mp4",
  "a_dog_that_is_waiting_by_the.mp4",
  "a_dog_that_is_waiting_by_the_1.mp4",
  "a_dog_that_is_waiting_by_the_2.mp4",
  "a_dog_that_is_waiting_by_the_3.mp4",
];

/**
 * Shown only while a team is `IN_REVIEW` — a calm "we're on it" card instead
 * of the full dashboard, which isn't useful yet with nothing approved.
 */
export default function TeamStatusHero({ team }) {
  const [video] = useState(
    () => WAITING_VIDEOS[Math.floor(Math.random() * WAITING_VIDEOS.length)],
  );

  if (team?.status !== "IN_REVIEW") return null;

  return (
    <Box
      className="ohx-card"
      sx={{
        mb: 3,
        p: { xs: 2, md: 3 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 220px" },
        gap: 2.5,
        alignItems: "center",
      }}
    >
      <Box>
        <div className="ohx-eyebrow">Under review</div>
        <h2
          className="ohx-display"
          style={{ fontSize: "1.4rem", margin: "4px 0 8px" }}
        >
          We&apos;re reviewing your team
        </h2>
        <Box sx={{ color: "var(--muted)" }}>
          Review usually takes 10–20 minutes. We&apos;ll ping you in Slack when
          your channel and repo are ready. Nothing else to do here yet.
        </Box>
      </Box>
      <Box
        sx={{
          width: 220,
          height: 220,
          borderRadius: 2,
          overflow: "hidden",
          justifySelf: { xs: "start", sm: "end" },
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          width={220}
          height={220}
          style={{ objectFit: "cover" }}
        >
          <source
            src={`https://cdn.ohack.dev/ohack.dev/videos/fun/${video}`}
            type="video/mp4"
          />
        </video>
      </Box>
    </Box>
  );
}
