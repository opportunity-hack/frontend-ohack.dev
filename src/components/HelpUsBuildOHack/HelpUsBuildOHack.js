import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import {
  HelpUsBuildOHackContainer,
  HelpUsBuildOHackTitle,
  HelpUsBuildOHackDescription,
  HelpUsBuildOHackLink,
  CloseButtonContainer,
} from "./styles";

export default function HelpUsBuildOHack({ github_link, github_name }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <HelpUsBuildOHackContainer>
      <CloseButtonContainer>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </CloseButtonContainer>
      <HelpUsBuildOHackTitle>Help Us Build OHack.dev</HelpUsBuildOHackTitle>
      <HelpUsBuildOHackDescription>
        This portion is a work in progress and, more importantly, this site is
        open source and we welcome your contributions.
        <HelpUsBuildOHackLink href={github_link} target="_blank">
          Please see {github_name} for more information
        </HelpUsBuildOHackLink>
      </HelpUsBuildOHackDescription>
    </HelpUsBuildOHackContainer>
  );
}
