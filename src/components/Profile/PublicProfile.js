import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FeedbackIcon from "@mui/icons-material/Feedback";
import PersonIcon from "@mui/icons-material/Person";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import usePublicProfile from "../../hooks/use-public-profile";
import PublicBadgeList from "./PublicBadgeList";
import PublicHackathonList from "./PublicHackathonList";
import PublicFeedback from "./PublicFeedback";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";

const PublicProfile = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userid } = router.query;

  const {
    profile,
    badges,
    hackathons,
    feedbackUrl,
    privacySettings,
    isLoading,
    error,
  } = usePublicProfile(userid);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile: {error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">Profile not found or user does not exist.</Alert>
      </Box>
    );
  }

  // Helper function to check if a field should be displayed
  const isPublic = (field) => {
    return privacySettings?.[field] === "public";
  };

  // Helper component for private content placeholder
  const PrivateContentPlaceholder = ({ icon: Icon, label }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        color: "text.secondary",
        fontStyle: "italic",
        p: 2,
        bgcolor: "action.hover",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <VisibilityOffIcon fontSize="small" />
      <Typography variant="body2">{label} is private</Typography>
    </Box>
  );

  const roleLabels = {
    hacker_in_school: "Hacker (In School)",
    hacker_pro: "Hacker (Professional)",
    mentor: "Mentor",
    volunteer: "Volunteer",
    judge: "Judge",
    nonprofit: "Nonprofit",
    sponsor: "Sponsor",
    organizer: "Organizer",
  };

  return (
    <div className="content-layout">
      <Head>
        <title>
          Profile for {profile?.name || userid} - Opportunity Hack Developer
          Portal
        </title>
      </Head>

      <Box sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600, fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" } }}
        >
          Public Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Viewing the public information for this Opportunity Hack community
          member
        </Typography>
      </Box>

      {/* Basic Profile Header */}
      <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              textAlign: { xs: "center", sm: "left" },
              mb: 3,
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Avatar
              src={profile?.profile_image || "https://i.imgur.com/RdOsE7s.png"}
              alt={profile?.name}
              sx={{
                width: { xs: 90, sm: 120 },
                height: { xs: 90, sm: 120 },
                mr: { xs: 0, sm: 3 },
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  mb: 1,
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "1.4rem", sm: "1.75rem", md: "2.125rem" },
                    wordBreak: "break-word",
                  }}
                >
                  {profile?.name || "Anonymous User"}
                </Typography>
                <VerifiedUserIcon
                  color="success"
                  fontSize="medium"
                  sx={{ ml: 0.5 }}
                />
              </Box>
              <Typography variant="h6" color="textSecondary" gutterBottom
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {profile?.nickname || "Community Member"}
              </Typography>

              {/* Public Role Display */}
              {profile?.role && isPublic("role") && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    icon={<PersonIcon />}
                    label={roleLabels[profile.role] || profile.role}
                    color="primary"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size={isMobile ? "medium" : "large"}
            startIcon={<FeedbackIcon />}
            component={Link}
            href={feedbackUrl}
            sx={{ mt: 1, width: { xs: "100%", sm: "auto" } }}
          >
            {isMobile
              ? `Send Feedback`
              : `Send Feedback to ${profile?.name || "User"}`}
          </Button>
        </CardContent>
      </Paper>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Basic Information */}
          <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonIcon />
                Basic Information
              </Typography>

              <Grid container spacing={3}>
                {/* GitHub Username */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    GitHub Profile
                  </Typography>
                  {isPublic("github") && profile?.github ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <GitHubIcon fontSize="small" />
                      <Link
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {profile.github}
                      </Link>
                    </Box>
                  ) : !isPublic("github") ? (
                    <PrivateContentPlaceholder
                      icon={GitHubIcon}
                      label="GitHub profile"
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Not provided
                    </Typography>
                  )}
                </Grid>

                {/* Company */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Company
                  </Typography>
                  {isPublic("company") && profile?.company ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon fontSize="small" />
                      <Typography variant="body1">{profile.company}</Typography>
                    </Box>
                  ) : !isPublic("company") ? (
                    <PrivateContentPlaceholder
                      icon={BusinessIcon}
                      label="Company information"
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Not provided
                    </Typography>
                  )}
                </Grid>

                {/* Why are you here */}
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Why are they here with Opportunity Hack?
                  </Typography>
                  {isPublic("why") && profile?.why ? (
                    <Typography
                      variant="body1"
                      sx={{
                        bgcolor: "action.hover",
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {profile.why}
                    </Typography>
                  ) : !isPublic("why") ? (
                    <PrivateContentPlaceholder
                      icon={VolunteerActivismIcon}
                      label="Personal motivation"
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Not provided
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Paper>

          {/* Badges Section */}
          {(isPublic("badges") || badges?.length > 0) && (
            <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <EmojiEventsIcon />
                  Achievements & Badges
                </Typography>

                {isPublic("badges") ? (
                  <PublicBadgeList badges={badges} />
                ) : (
                  <PrivateContentPlaceholder
                    icon={EmojiEventsIcon}
                    label="Achievements and badges"
                  />
                )}
              </CardContent>
            </Paper>
          )}

          {/* Hackathon History */}
          {(isPublic("hackathon_history") || hackathons?.length > 0) && (
            <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <HistoryIcon />
                  Hackathon History
                </Typography>

                {isPublic("hackathon_history") ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Track record of participation, mentoring, and judging at
                      Opportunity Hack events.
                    </Typography>
                    <PublicHackathonList hackathons={hackathons} />
                  </>
                ) : (
                  <PrivateContentPlaceholder
                    icon={HistoryIcon}
                    label="Hackathon participation history"
                  />
                )}
              </CardContent>
            </Paper>
          )}

          {/* Community Feedback Section */}
          {isPublic("feedback") && (
            <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <FeedbackIcon />
                  Community Feedback
                </Typography>

                <PublicFeedback 
                  feedbackUrl={feedbackUrl} 
                  history={profile?.history} 
                  userName={profile?.name}
                />
              </CardContent>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Info & Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              position: { xs: "static", md: "sticky" },
              top: { md: 24 },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              Connect & Engage
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<FeedbackIcon />}
              component={Link}
              href={feedbackUrl}
              sx={{ mb: 2 }}
            >
              Send Feedback
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Want to get involved with Opportunity Hack?
            </Typography>

            <Button
              variant="contained"
              fullWidth
              component={Link}
              href="/volunteer"
              sx={{ mb: 1 }}
            >
              Become a Volunteer
            </Button>

            <Button
              variant="text"
              fullWidth
              component={Link}
              href="/projects"
              size="small"
            >
              View Current Projects
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <HelpUsBuildOHack
          github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/195"
          github_name="Issue #195"
        />
      </Box>
    </div>
  );
};

export default PublicProfile;
