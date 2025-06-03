import React, { useState, useRef } from "react";
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
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ShareIcon from "@mui/icons-material/Share";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";

const ShareDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.spacing(2),
    maxWidth: "600px",
    width: "100%",
  },
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  position: "relative",
  overflow: "hidden",
  minHeight: "300px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const PreviewOverlay = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.3)",
  zIndex: 1,
});

const PreviewContent = styled(CardContent)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: theme.spacing(3),
}));

const SocialButton = styled(IconButton)(({ theme, platform }) => ({
  width: "60px",
  height: "60px",
  margin: theme.spacing(1),
  backgroundColor: getSocialColor(platform),
  color: "white",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: getSocialColor(platform),
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[8],
  },
}));

function getSocialColor(platform) {
  const colors = {
    twitter: "#1DA1F2",
    linkedin: "#0077B5",
    facebook: "#1877F2",
    whatsapp: "#25D366",
    email: "#EA4335",
    copy: "#6C757D",
  };
  return colors[platform] || "#6C757D";
}

const ShareVolunteer = ({
  volunteer,
  type,
  eventTitle = "Opportunity Hack 2024",
}) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [customMessage, setCustomMessage] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const previewRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const shareUrl = "https://ohack.dev";
  const shareImage =
    "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Light_Blue_Square.png";

  const roleText =
    type === "mentor"
      ? "mentoring"
      : type === "judge"
      ? "judging"
      : type === "hacker"
      ? "participating in"
      : "volunteering at";

  const defaultMessage = `🚀 Excited to be ${roleText} ${eventTitle}! Join us in using technology to create positive social impact. 

🌟 What we're doing:
• Building solutions for nonprofit organizations
• Connecting tech talent with social causes
• Creating lasting change in our communities

#TechForGood #OpportunityHack #Hackathon #SocialImpact #Volunteer`;

  const customShareMessage = customMessage || defaultMessage;

  const handleOpen = () => {
    setOpen(true);
    setCustomMessage("");
  };

  const handleClose = () => setOpen(false);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getShareUrl = (platform, message = customShareMessage) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedMessage = encodeURIComponent(message);
    const encodedTitle = encodeURIComponent(
      `${volunteer?.name || "I\'m"} ${roleText} ${eventTitle}`
    );

    switch (platform) {
      case "twitter":
        // Twitter has character limits, so use a shorter message
        const twitterMessage = `🚀 ${roleText.charAt(0).toUpperCase() + roleText.slice(1)} ${eventTitle}! Building tech solutions for nonprofits. #TechForGood #OpportunityHack`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          twitterMessage
        )}&url=${encodedUrl}`;

      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedMessage}`;

      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;

      case "whatsapp":
        return `https://wa.me/?text=${encodeURIComponent(
          message + "\n\n" + shareUrl
        )}`;

      case "email":
        const subject = encodeURIComponent(`Join me at ${eventTitle}!`);
        const body = encodeURIComponent(`${message}\n\nLearn more: ${shareUrl}`);
        return `mailto:?subject=${subject}&body=${body}`;

      default:
        return "";
    }
  };

  const handleShare = async (platform) => {
    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(
          `${customShareMessage}\n\n${shareUrl}`
        );
        showSnackbar("Message copied to clipboard!");
      } catch (err) {
        showSnackbar("Failed to copy message", "error");
      }
      return;
    }

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({
          title: `${volunteer?.name || "I\'m"} ${roleText} ${eventTitle}`,
          text: customShareMessage,
          url: shareUrl,
        });
        showSnackbar("Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
          showSnackbar("Failed to share", "error");
        }
      }
      return;
    }

    const url = getShareUrl(platform);
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      showSnackbar(`Opened ${platform} share dialog!`);
    }
  };

  const downloadPreview = async () => {
    // This would require additional libraries like html2canvas for actual implementation
    showSnackbar("Download feature coming soon!", "info");
  };

  const socialPlatforms = [
    { key: "twitter", icon: TwitterIcon, label: "Twitter", color: "#1DA1F2" },
    { key: "linkedin", icon: LinkedInIcon, label: "LinkedIn", color: "#0077B5" },
    { key: "facebook", icon: FacebookIcon, label: "Facebook", color: "#1877F2" },
    { key: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp", color: "#25D366" },
    { key: "email", icon: EmailIcon, label: "Email", color: "#EA4335" },
    { key: "copy", icon: FileCopyIcon, label: "Copy Link", color: "#6C757D" },
  ];

  return (
    <>
      <Tooltip title="Share your participation">
        <IconButton onClick={handleOpen} color="primary" size="small">
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <ShareDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Share Your Impact</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}
          >
            <Tab icon={<ImageIcon />} label="Preview" />
            <Tab icon={<TextFieldsIcon />} label="Customize" />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <PreviewCard ref={previewRef} elevation={4}>
                <PreviewOverlay />
                <PreviewContent>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <img
                        src="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Light_Blue_Square.png"
                        alt="Opportunity Hack"
                        style={{
                          height: "40px",
                          objectFit: "contain",
                          borderRadius: "4px",
                        }}
                      />
                      <Chip
                        label={
                          roleText.charAt(0).toUpperCase() + roleText.slice(1)
                        }
                        color="secondary"
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ lineHeight: 1.2 }}
                    >
                      {volunteer?.name || "I'm"} {roleText} {eventTitle}!
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, lineHeight: 1.6 }}
                    >
                      Building technology solutions for nonprofit organizations.
                      Join us in creating positive social impact through
                      innovation.
                    </Typography>
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <Chip
                        label="#TechForGood"
                        size="small"
                        variant="outlined"
                        sx={{
                          color: "inherit",
                          borderColor: "rgba(255,255,255,0.5)",
                        }}
                      />
                      <Chip
                        label="#OpportunityHack"
                        size="small"
                        variant="outlined"
                        sx={{
                          color: "inherit",
                          borderColor: "rgba(255,255,255,0.5)",
                        }}
                      />
                      <Chip
                        label="#SocialImpact"
                        size="small"
                        variant="outlined"
                        sx={{
                          color: "inherit",
                          borderColor: "rgba(255,255,255,0.5)",
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, textAlign: "center" }}
                    >
                      {shareUrl}
                    </Typography>
                  </Box>
                </PreviewContent>
              </PreviewCard>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Share on Social Media
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(3, 1fr)"
                      : "repeat(6, 1fr)",
                    gap: 1,
                    justifyItems: "center",
                  }}
                >
                  {socialPlatforms.map(({ key, icon: Icon, label, color }) => (
                    <Tooltip key={key} title={`Share on ${label}`}>
                      <SocialButton
                        platform={key}
                        onClick={() => handleShare(key)}
                        sx={{ backgroundColor: color }}
                      >
                        <Icon />
                      </SocialButton>
                    </Tooltip>
                  ))}
                </Box>

                {navigator.share && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={() => handleShare("native")}
                      fullWidth={isMobile}
                    >
                      Use Device Share
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customize Your Message
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={defaultMessage}
                label="Your message"
                variant="outlined"
                sx={{ mb: 3 }}
                helperText={`${customMessage.length}/280 characters (Twitter limit)`}
              />

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeImage}
                      onChange={(e) => setIncludeImage(e.target.checked)}
                    />
                  }
                  label="Include preview image"
                />

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadPreview}
                  size="small"
                >
                  Download Preview
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                💡 Tip: Mention specific nonprofits you're helping or
                technologies you're using to make your post more engaging!
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="subtitle2" sx={{ width: "100%", mb: 1 }}>
                  Quick Actions:
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleShare("copy")}
                  startIcon={<FileCopyIcon />}
                >
                  Copy Message
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setCustomMessage("")}
                  startIcon={<CloseIcon />}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleShare("copy")}
            startIcon={<CheckCircleIcon />}
          >
            Copy & Share
          </Button>
        </DialogActions>
      </ShareDialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareVolunteer;
