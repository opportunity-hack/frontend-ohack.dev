import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

// Match VideoDisplay.js regex so we extract the same YouTube ID
const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const VIMEO_REGEX = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/;
const LOOM_REGEX = /loom\.com\/(?:share|embed)\//;
const DRIVE_REGEX = /drive\.google\.com\/file\/d\//;
const RAW_VIDEO_REGEX = /\.(mp4|webm|mov)(\?|#|$)/i;

const providerLabel = (url) => {
  if (!url) return null;
  if (YOUTUBE_REGEX.test(url)) return "YouTube";
  if (VIMEO_REGEX.test(url)) return "Vimeo";
  if (LOOM_REGEX.test(url)) return "Loom";
  if (DRIVE_REGEX.test(url)) return "Google Drive";
  if (RAW_VIDEO_REGEX.test(url)) return "Video";
  return null;
};

const LiteVideoThumbnail = ({
  url,
  onClick,
  width = 320,
  height = 180,
  label = "Watch demo",
  posterUrl = null,
}) => {
  if (!url) return null;

  const youtubeMatch = url.match(YOUTUBE_REGEX);
  const youtubeId = youtubeMatch ? youtubeMatch[1] : null;
  const provider = providerLabel(url);
  // A supplied poster (e.g. for raw mp4s) renders exactly like a YouTube thumb
  const posterSrc = posterUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

  const buttonStyles = {
    position: "relative",
    display: "block",
    width: "100%",
    maxWidth: width,
    padding: 0,
    margin: 0,
    border: 0,
    borderRadius: 1.5,
    overflow: "hidden",
    cursor: "pointer",
    background: "#000",
    "&:hover .lite-video-overlay-icon": {
      transform: "translate(-50%, -50%) scale(1.1)",
      opacity: 1,
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
    },
  };

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={buttonStyles}
      aria-label={label}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%",
          height: 0,
          bgcolor: posterSrc ? "transparent" : "grey.900",
        }}
      >
        {posterSrc ? (
          <Box
            component="img"
            src={posterSrc}
            alt=""
            loading="lazy"
            decoding="async"
            width={width}
            height={height}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "common.white",
              gap: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {label}
            </Typography>
            {provider && (
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {provider}
              </Typography>
            )}
          </Box>
        )}

        <Box
          className="lite-video-overlay-icon"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "common.white",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
            opacity: 0.92,
            transition: "transform 120ms ease, opacity 120ms ease",
            pointerEvents: "none",
          }}
        >
          <PlayCircleFilledIcon sx={{ fontSize: Math.min(64, height * 0.45) }} />
        </Box>
      </Box>
    </Box>
  );
};

export default LiteVideoThumbnail;
