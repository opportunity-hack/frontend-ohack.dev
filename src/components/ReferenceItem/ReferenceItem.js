import React from 'react';
import Button from "@mui/material/Button";
import ArticleIcon from "@mui/icons-material/Article";
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideoDisplay from "../VideoDisplay/VideoDisplay";

function getIconForReferenceLinkOrName(link, name) {
  const documentExtensions = [".pdf", ".doc", ".docx"];
  for (const extension of documentExtensions) {
      if (link.endsWith(extension)) {
          return <ArticleIcon />;
      }
  }

  const documentPlatforms = ["docs.google.com"]; 
  for (const platform of documentPlatforms) {
      if (link.includes(platform)) {
          return <ArticleIcon />;
      }
  }

  // If YouTube is in the name or video is in the name
  const videoIconText = ["youtube", "video"];
  const videoIconLink = ["youtube.com", "vimeo.com"];
  if (videoIconText.some((text) => name.toLowerCase().includes(text)) || videoIconLink.some((text) => link.includes(text))) {
      return <SmartDisplayIcon />;
  }

  // If .pptx or slides.google.com, use a presentation icon
  const presentationExtensions = [".pptx"];
  for (const extension of presentationExtensions) {
      if (link.endsWith(extension)) {
          return <CoPresentIcon />;
      }
  }

  const presentationPlatforms = ["slides.google.com"];
  for (const platform of presentationPlatforms) {
      if (link.includes(platform)) {
          return <CoPresentIcon />;
      }
  }

  // Handle github name or link
  const githubPlatforms = ["github.com"];
  for (const platform of githubPlatforms) {
      if (link.includes(platform)) {
          return <GitHubIcon />;
      }
  }

  // Default to a link icon
  return <OpenInNewIcon />;
}

const ReferenceItem = ({ reference }) => {
  const isVideoUrl = (url) => {
    return url && (
      url.includes('youtube.com') || 
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.includes('loom.com') ||
      url.includes('drive.google.com/file')
    );
  };

  if (reference.link && isVideoUrl(reference.link)) {
    return <VideoDisplay url={reference.link} title={reference.name} />;
  }

  return (
    <Button
      key={reference.name}
      variant="outlined"
      href={reference.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ margin: "0.5rem", fontSize: '13px' }}
    >
      {getIconForReferenceLinkOrName(reference.link, reference.name)}
      &nbsp;
      {reference.name}
    </Button>
  );
};

export default ReferenceItem;
