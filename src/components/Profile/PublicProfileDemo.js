import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Typography,
  Box,
  CardContent,
  Avatar,
  Button,
  Grid,
  Divider,
  Paper,
  Chip,
  useTheme,
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

import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";

const PublicProfileDemo = () => {
  const router = useRouter();
  const theme = useTheme();
  const { userid } = router.query;

  // Mock data for demonstration
  const mockProfile = {
    name: "Alex Johnson",
    nickname: "alexj_dev", 
    profile_image: "https://i.imgur.com/RdOsE7s.png",
    github: "alexjohnson",
    company: "Tech for Good Inc",
    role: "hacker_pro",
    why: "I'm passionate about using technology to solve real-world problems and help nonprofits maximize their impact in the community."
  };

  const mockBadges = [
    { id: 1, image: "https://images.credly.com/images/be8fcaeb-c769-4858-b567-ffaaa73ce8cf/image.png", description: "Hackathon Mentor" },
    { id: 2, image: "https://images.credly.com/images/be8fcaeb-c769-4858-b567-ffaaa73ce8cf/image.png", description: "Community Builder" }
  ];

  const mockHackathons = [
    { start_date: "2024-01-15", location: "Phoenix, AZ", devpost_url: "https://example.com", nonprofits: ["Local Food Bank", "Youth Center"] },
    { start_date: "2023-10-20", location: "Virtual", devpost_url: "https://example.com", nonprofits: ["Animal Shelter"] }
  ];

  const mockPrivacySettings = {
    github_username: "public",
    current_role: "public",
    current_company: "public", 
    why_are_you_here: "public",
    badges: "public",
    hackathon_history: "public",
    feedback: "public"
  };

  const feedbackUrl = `/feedback/${userid}`;

  // Helper function to check if a field should be displayed
  const isPublic = (field) => {
    return mockPrivacySettings?.[field] === 'public';
  };

  // Helper component for private content placeholder
  const PrivateContentPlaceholder = ({ icon: Icon, label }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        color: 'text.secondary',
        fontStyle: 'italic',
        p: 2,
        bgcolor: 'action.hover',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <VisibilityOffIcon fontSize="small" />
      <Typography variant="body2">
        {label} is private
      </Typography>
    </Box>
  );

  const roleLabels = {
    "hacker_in_school": "Hacker (In School)",
    "hacker_pro": "Hacker (Professional)",
    "mentor": "Mentor",
    "volunteer": "Volunteer",
    "judge": "Judge",
    "nonprofit": "Nonprofit",
    "sponsor": "Sponsor",
    "organizer": "Organizer"
  };

  return (
    <div className="content-layout">
      <Head>
        <title>
          Profile for {mockProfile?.name || userid} - Opportunity Hack Developer Portal
        </title>
      </Head>
      
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Public Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Viewing the public information for this Opportunity Hack community member
        </Typography>
      </Box>

      {/* Basic Profile Header */}
      <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              src={mockProfile?.profile_image || "https://i.imgur.com/RdOsE7s.png"}
              alt={mockProfile?.name}
              sx={{ width: 120, height: 120, mr: 3 }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 500 }}>
                  {mockProfile?.name || "Anonymous User"}
                </Typography>
                <VerifiedUserIcon
                  color="success"
                  fontSize="medium"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {mockProfile?.nickname || "Community Member"}
              </Typography>
              
              {/* Public Role Display */}
              {mockProfile?.role && isPublic('current_role') && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={<PersonIcon />}
                    label={roleLabels[mockProfile.role] || mockProfile.role}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<FeedbackIcon />}
            component={Link}
            href={feedbackUrl}
            sx={{ mt: 2 }}
          >
            Send Feedback to {mockProfile?.name || "User"}
          </Button>
        </CardContent>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Basic Information */}
          <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Basic Information
              </Typography>
              
              <Grid container spacing={3}>
                {/* GitHub Username */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    GitHub Profile
                  </Typography>
                  {isPublic('github_username') && mockProfile?.github ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GitHubIcon fontSize="small" />
                      <Link
                        href={`https://github.com/${mockProfile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {mockProfile.github}
                      </Link>
                    </Box>
                  ) : !isPublic('github_username') ? (
                    <PrivateContentPlaceholder icon={GitHubIcon} label="GitHub profile" />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Not provided
                    </Typography>
                  )}
                </Grid>

                {/* Company */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Company
                  </Typography>
                  {isPublic('current_company') && mockProfile?.company ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" />
                      <Typography variant="body1">
                        {mockProfile.company}
                      </Typography>
                    </Box>
                  ) : !isPublic('current_company') ? (
                    <PrivateContentPlaceholder icon={BusinessIcon} label="Company information" />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Not provided
                    </Typography>
                  )}
                </Grid>

                {/* Why are you here */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Why are they here with Opportunity Hack?
                  </Typography>
                  {isPublic('why_are_you_here') && mockProfile?.why ? (
                    <Typography variant="body1" sx={{ 
                      bgcolor: 'action.hover', 
                      p: 2, 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {mockProfile.why}
                    </Typography>
                  ) : !isPublic('why_are_you_here') ? (
                    <PrivateContentPlaceholder icon={VolunteerActivismIcon} label="Personal motivation" />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Not provided
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Paper>

          {/* Badges Section */}
          {(isPublic('badges') || mockBadges?.length > 0) && (
            <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEventsIcon />
                  Achievements & Badges
                </Typography>
                
                {isPublic('badges') ? (
                  mockBadges && mockBadges.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {mockBadges.map(badge => (
                        <Box key={badge.id} sx={{ textAlign: 'center', p: 1 }}>
                          <img src={badge.image} alt="Badge" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {badge.description}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No badges earned yet
                    </Typography>
                  )
                ) : (
                  <PrivateContentPlaceholder icon={EmojiEventsIcon} label="Achievements and badges" />
                )}
              </CardContent>
            </Paper>
          )}

          {/* Hackathon History */}
          {(isPublic('hackathon_history') || mockHackathons?.length > 0) && (
            <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon />
                  Hackathon History
                </Typography>
                
                {isPublic('hackathon_history') ? (
                  mockHackathons && mockHackathons.length > 0 ? (
                    <>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Track record of participation, mentoring, and judging at Opportunity Hack events.
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {mockHackathons.map((hackathon, index) => (
                          <Box key={index} sx={{ 
                            p: 2, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {hackathon.location} - {hackathon.start_date}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Nonprofits: {hackathon.nonprofits.join(', ')}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No hackathon participation recorded yet
                    </Typography>
                  )
                ) : (
                  <PrivateContentPlaceholder icon={HistoryIcon} label="Hackathon participation history" />
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

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Community feedback and ratings from Opportunity Hack members.
                </Typography>

                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'action.hover', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Want to see detailed feedback information or send feedback?
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FeedbackIcon />}
                    component={Link}
                    href={feedbackUrl}
                  >
                    Send Feedback to {mockProfile?.name || "User"}
                  </Button>
                </Box>
              </CardContent>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Info & Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, position: "sticky", top: 24 }}>
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

export default PublicProfileDemo;