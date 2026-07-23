import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button, IconButton, Tooltip } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

import {
  buildLinkedInShareUrl,
  openShareWindow,
} from "../../utils/socialShare";

const SHARE_LABEL_DEFAULT = "Share to LinkedIn";

function LinkedInShareButton({
  url,
  variant = "profile",
  label = SHARE_LABEL_DEFAULT,
  tooltip,
  size = "medium",
  fullWidth = false,
  onShare,
}) {
  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      const shareUrl = buildLinkedInShareUrl(url);
      openShareWindow(shareUrl, "linkedin-share");
      if (typeof onShare === "function") {
        onShare(shareUrl);
      }
    },
    [url, onShare]
  );

  if (variant === "section") {
    return (
      <Tooltip title={tooltip || label}>
        <IconButton
          aria-label={label}
          onClick={handleClick}
          size={size === "large" ? "large" : "small"}
          sx={{
            color: "#0a66c2",
            "&:hover": { backgroundColor: "rgba(10, 102, 194, 0.08)" },
          }}
        >
          <LinkedInIcon fontSize={size === "large" ? "medium" : "small"} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<LinkedInIcon />}
      onClick={handleClick}
      size={size}
      fullWidth={fullWidth}
      sx={{
        backgroundColor: "#0a66c2",
        "&:hover": { backgroundColor: "#084a8a" },
      }}
    >
      {label}
    </Button>
  );
}

LinkedInShareButton.propTypes = {
  url: PropTypes.string,
  variant: PropTypes.oneOf(["profile", "section"]),
  label: PropTypes.string,
  tooltip: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullWidth: PropTypes.bool,
  onShare: PropTypes.func,
};

export default LinkedInShareButton;
