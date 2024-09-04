import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import FacebookIcon from "@mui/icons-material/Facebook";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"; // Using this for Threads

const ShareVolunteer = ({ volunteer, type }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const shareUrl = "https://hack.ohack.dev";
  const shareImage =
    "https://cdn.ohack.dev/ohack.dev/OHack%202024%20Hackathon.jpg";
  const shareTitle = `Join me at Opportunity Hack 2024!`;
  const shareDescription = `I'm ${type === "mentor" ? "mentoring" : type === "judge" ? "judging" : "volunteering"} at Opportunity Hack 2024! Join us in supporting nonprofit innovation. @OpportunityHack #TechForGood https://hack.ohack.dev`;

  const getShareUrl = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedDescription = encodeURIComponent(shareDescription);

    switch (platform) {
      case "facebook":
        return `https://www.facebook.com/dialog/share?app_id=YOUR_FACEBOOK_APP_ID&href=${encodedUrl}&quote=${encodedDescription}`;
      case "threads":
        return `https://threads.net/intent/post?text=${encodedDescription}`;
      default:
        return "";
    }
  };

  const handleShare = (platform) => {
    const url = getShareUrl(platform);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${shareTitle}\n\n${shareDescription}\n\n${shareUrl}`
    );
  };

  return (
    <>
      <Tooltip title="Share your participation">
        <IconButton onClick={handleOpen} color="primary">
          <ShareIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Participation</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {shareDescription}
          </Typography>
          <Box
            mt={2}
            display="flex"
            justifyContent="center"
            maxHeight="200px"
            overflow="hidden"
          >
            <img
              src={shareImage}
              alt="Opportunity Hack 2024"
              style={{ width: "100%", objectFit: "cover" }}
            />
          </Box>
          
          <Box display="flex" justifyContent="space-around" mt={2}>
          
            {
                // <Tooltip title="Share on Facebook">
            //   <IconButton
            //     onClick={() => handleShare("facebook")}
            //     color="primary"
            //   >
            //     <FacebookIcon />
            //   </IconButton>
            // </Tooltip>
            }
          
            <Tooltip title="Share on Threads">
              <IconButton
                onClick={() => handleShare("threads")}
                color="primary"
              >
                <AlternateEmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy message">
              <IconButton onClick={handleCopy} color="primary">
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShareVolunteer;
