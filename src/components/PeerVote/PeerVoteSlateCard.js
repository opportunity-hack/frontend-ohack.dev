import React from "react";
import Box from "@mui/material/Box";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";
import { slateLinks } from "./peerVoteState";

/**
 * One project in a hacker's Hackers' Choice slate (or in the read-only
 * "Your picks" summary — see `PeerVotePage`'s `PickedProjectRow`, which
 * intentionally does NOT reuse this component so the pick button never
 * shows in a review-only context).
 *
 * Media priority mirrors the gallery (`TeamList.ProjectMedia`): an uploaded
 * project thumbnail, else a YouTube/Vimeo/Loom demo-video lite-embed, else
 * an initial placeholder tile — never an eager iframe.
 */
function CardMedia({ item, onPlayVideo }) {
  if (item?.project_thumbnail_url) {
    return (
      <Box
        component="img"
        src={item.project_thumbnail_url}
        alt=""
        width={320}
        height={180}
        loading="lazy"
        decoding="async"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }
  if (item?.demo_video_url) {
    return (
      // LiteVideoThumbnail caps its own <button> at `maxWidth: width` (see
      // VideoDisplay/LiteVideoThumbnail.js) so it doesn't blow up past its
      // intended size on the pages that render it small. This card's media
      // box is a 16:9 slot that can be wider than that cap on a roomy
      // auto-fill grid (unlike the thumbnail branch above, which fills
      // edge-to-edge via sx), so override the cap here rather than in the
      // shared component — bumping the default there would ripple into
      // every other surface that renders it at a fixed width.
      <Box
        sx={{
          width: "100%",
          height: "100%",
          "& > button": { width: "100%", maxWidth: "none" },
        }}
      >
        <LiteVideoThumbnail
          url={item.demo_video_url}
          onClick={() => onPlayVideo?.(item.demo_video_url, item.name)}
          width={480}
          height={270}
          label={`Watch ${item.name || "team"} demo`}
        />
      </Box>
    );
  }
  const initial = (item?.name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--display)",
        fontSize: 56,
        fontWeight: 500,
        color: "#fff",
        background: "var(--brand, #1B3A6B)",
      }}
    >
      {initial}
    </Box>
  );
}

export default function PeerVoteSlateCard({
  item,
  selected = false,
  disabled = false,
  watched = false,
  onToggle,
  onWatched,
  onPlayVideo,
  eventId,
}) {
  if (!item) return null;
  const { github, project } = slateLinks(item, eventId);
  const titleId = `peer-vote-card-${item.team_id}`;
  const pickBlocked = disabled && !selected;

  return (
    <Box
      component="article"
      aria-labelledby={titleId}
      className="ohx-card"
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderColor: selected ? "var(--brand, #1B3A6B)" : undefined,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "var(--surface-2, #F4F1E9)",
          overflow: "hidden",
        }}
      >
        <CardMedia item={item} onPlayVideo={onPlayVideo} />
      </Box>

      <Box
        sx={{
          p: "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
        }}
      >
        <Box
          component="h3"
          id={titleId}
          className="ohx-display"
          sx={{ fontSize: "1.1rem", m: 0 }}
        >
          {item.name || "Unnamed team"}
        </Box>

        {item.project_tagline && (
          <Box
            className="ohx-muted"
            sx={{
              m: 0,
              fontSize: "0.9rem",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.project_tagline}
          </Box>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5em", mt: 0.5 }}>
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
              style={{ fontSize: "0.85rem" }}
            >
              GitHub ↗
            </a>
          )}
          {project && (
            <a
              href={project}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
              style={{ fontSize: "0.85rem" }}
            >
              Project page ↗
            </a>
          )}
        </Box>

        <Box
          component="label"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5em",
            fontSize: "0.8rem",
            color: "var(--muted)",
            mt: 0.5,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={!!watched}
            onChange={() => onWatched?.(item.team_id)}
          />
          Watched
        </Box>

        <Box
          component="button"
          type="button"
          aria-pressed={selected}
          disabled={pickBlocked}
          title={pickBlocked ? "You've used all your picks" : undefined}
          onClick={() => onToggle?.(item.team_id)}
          className={
            selected ? "ohx-btn ohx-btn--primary" : "ohx-btn ohx-btn--ghost"
          }
          sx={{
            mt: "auto",
            justifyContent: "center",
            width: "100%",
            opacity: pickBlocked ? 0.5 : 1,
            cursor: pickBlocked ? "not-allowed" : "pointer",
            "&:focus-visible": {
              outline: "2px solid var(--brand, #1B3A6B)",
              outlineOffset: 2,
            },
          }}
        >
          {selected ? "Picked ✓" : "Pick this project"}
        </Box>
      </Box>
    </Box>
  );
}
