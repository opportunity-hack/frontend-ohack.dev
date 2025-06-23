import React from 'react';
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const VideoWrapper = styled("div")({
  position: "relative",
  paddingBottom: "56.25%", // 16:9 aspect ratio
  height: 0,
  overflow: "hidden",
  marginBottom: "1rem",
  "& iframe": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});

const VideoDisplay = ({ url, title }) => {
  const getVideoConfig = (url) => {
    if (!url) return null;

    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      };
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)(?:[a-zA-Z0-9_\-]+)?/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        allow: "autoplay; fullscreen; picture-in-picture"
      };
    }

    // Loom
    const loomRegex = /(?:loom\.com\/(?:share|embed)\/)([a-zA-Z0-9]+)/;
    const loomMatch = url.match(loomRegex);
    if (loomMatch) {
      return {
        type: 'loom',
        embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
        allow: "autoplay; fullscreen; picture-in-picture"
      };
    }

    // Google Drive videos
    const driveRegex = /drive\.google\.com\/file\/d\/([^/]+)/;
    const driveMatch = url.match(driveRegex);
    if (driveMatch) {
      return {
        type: 'google-drive',
        embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
        allow: "autoplay"
      };
    }

    return null;
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
    <Box sx={{ width: '100%', maxWidth: '600px', margin: '1rem 0' }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <VideoWrapper>
        <iframe
          src={videoConfig.embedUrl}
          title={title || "Video"}
          frameBorder="0"
          allow={videoConfig.allow}
          allowFullScreen
        />
      </VideoWrapper>
    </Box>
  );
};

export default VideoDisplay;
