import React from 'react';
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { parseVideoUrl } from "../../lib/videoLinks";

const VideoWrapper = styled("div")({
  position: "relative",
  paddingBottom: "56.25%", // 16:9 aspect ratio
  height: 0,
  overflow: "hidden",
  marginBottom: "1rem",
  "& iframe, & video": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});

const IFRAME_ALLOW = {
  youtube:
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
  vimeo: "autoplay; fullscreen; picture-in-picture",
  loom: "autoplay; fullscreen; picture-in-picture",
  drive: "autoplay",
};

// `fill`: take the parent's full width (no 600px cap, no margin) and keep
// the title for the iframe only — for callers that frame the video themselves.
const VideoDisplay = ({ url, title, fill = false }) => {
  const getVideoConfig = (url) => {
    const parsed = parseVideoUrl(url);
    if (!parsed) return null;
    if (parsed.provider === "file") {
      // Raw video file — play with a native <video> (no iframe)
      return { type: "file", embedUrl: parsed.embedUrl };
    }
    return { type: parsed.provider, embedUrl: parsed.embedUrl, allow: IFRAME_ALLOW[parsed.provider] };
  };

  const videoConfig = getVideoConfig(url);

  if (!videoConfig) {
    return (
      <Typography color="error">
        Unsupported video URL: {url}
      </Typography>
    );
  }

  return (
    <Box
      sx={
        fill
          ? { width: '100%' }
          : { width: '100%', maxWidth: '600px', margin: '1rem 0' }
      }
    >
      {title && !fill && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <VideoWrapper sx={fill ? { marginBottom: 0, borderRadius: '6px', bgcolor: '#000' } : undefined}>
        {videoConfig.type === 'file' ? (
          <video
            src={videoConfig.embedUrl}
            title={title || "Video"}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <iframe
            src={videoConfig.embedUrl}
            title={title || "Video"}
            frameBorder="0"
            allow={videoConfig.allow}
            allowFullScreen
            loading="lazy"
          />
        )}
      </VideoWrapper>
    </Box>
  );
};

export default VideoDisplay;
