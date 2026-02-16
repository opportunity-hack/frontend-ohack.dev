import React from "react";
import { Paper, Typography, Button, Grid, Box, Divider, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

import GavelIcon from "@mui/icons-material/Gavel";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Link from "next/link";
import { useRouter } from "next/router";
import SocialProofIndicator from './SocialProofIndicator';
import useParticipantCounts from '../../hooks/use-participant-counts';

const LinksContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "400px",
  overflowX: "hidden",
  overflowY: "auto",
}));

const LinkButton = styled(Button)(({ theme, customcolor }) => ({
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1, 2),
  minWidth: "auto",
  maxWidth: "100%",
  whiteSpace: "normal",
  wordWrap: "break-word",
  textAlign: "left",
  justifyContent: "flex-start",
  textTransform: "none",
  lineHeight: 1.2,
  fontSize: "1rem",
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
  },
}));

const ApplicationButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1.5),
  },
}));

const EventLinks = ({ links, variant = "full", constraints = {} }) => {
  const router = useRouter();
  const { event_id } = router.query;

  // Fetch participant counts for psychological nudging
  const { counts, loading: countsLoading } = useParticipantCounts(event_id);

  if (!links) {
    links = [];
  }

  // Get counts for social proof
  const getCountsForType = (type) => {
    const pluralType = type === 'hacker' ? 'hackers' : `${type}s`;
    return counts[pluralType] || { accepted: 0, total: 0 };
  };
  
  // 🎯 SOCIAL PROOF CONFIGURATION - Easily customizable urgency settings
  // showUrgency: true/false - whether to show "Filling up fast!" and "Popular choice" messages
  // urgencyThreshold: number - minimum accepted participants before showing urgency messages
  const socialProofConfig = {
    hacker: { showUrgency: true, urgencyThreshold: 10 }, // Most competitive, show urgency
    mentor: { showUrgency: false, urgencyThreshold: 15 }, // No urgency messaging
    judge: { showUrgency: false, urgencyThreshold: 10 }, // No urgency messaging
    volunteer: { showUrgency: false, urgencyThreshold: 20 }, // No urgency messaging
    sponsor: { showUrgency: false, urgencyThreshold: 5 }, // No urgency messaging
    nonprofit: { showUrgency: false, urgencyThreshold: 8 }, // No urgency messaging
  };
  // To enable urgency for other roles: change showUrgency to true
  // To adjust when urgency appears: modify urgencyThreshold value

  const applicationTypes = [
    {
      type: "hacker",
      title: "Hacker Application",
      description: "Participate as a developer, designer, product or project manager",
      icon: <PersonIcon />,
      color: "primary",
      link: `/hack/${event_id}/hacker-application`,
      enabled: constraints.application_hacker_enabled !== false,
      roleType: "hackers",
      socialProof: socialProofConfig.hacker,
    },
    {
      type: "mentor",
      title: "Mentor Application",
      description: "Guide teams with your technical expertise",
      icon: <VolunteerActivismIcon />,
      color: "secondary",
      link: `/hack/${event_id}/mentor-application`,
      enabled: constraints.application_mentor_enabled !== false,
      roleType: "mentors",
      socialProof: socialProofConfig.mentor,
    },
    {
      type: "judge",
      title: "Judge Application",
      description: "Evaluate solutions and provide feedback",
      icon: <GavelIcon />,
      color: "success",
      link: `/hack/${event_id}/judge-application`,
      enabled: constraints.application_judge_enabled !== false,
      roleType: "judges",
      socialProof: socialProofConfig.judge,
    },
    {
      type: "volunteer",
      title: "Volunteer Application",
      description: "Help with event logistics and support",
      icon: <GroupsIcon />,
      color: "info",
      link: `/hack/${event_id}/volunteer-application`,
      enabled: true, // Always enabled since there's no constraint for this
      roleType: "volunteers",
      socialProof: socialProofConfig.volunteer,
    },
    {
      type: "sponsor",
      title: "Sponsor Application",
      description: "Support the event as an organization",
      icon: <BusinessIcon />,
      color: "warning",
      link: `/hack/${event_id}/sponsor-application`,
      enabled: constraints.application_sponsor_enabled !== false,
      roleType: "sponsors",
      socialProof: socialProofConfig.sponsor,
    },
    {
      type: "nonprofit",
      title: "Nonprofit Application",
      description: "Submit a project idea for the hackathon",
      icon: <LightbulbIcon />,
      color: "error",
      link: `/nonprofits/apply`,
      enabled: constraints.application_nonprofit_enabled !== false,
      roleType: "nonprofits",
      socialProof: socialProofConfig.nonprofit,
    },
  ];

  const renderButton = (link) => {
    const buttonProps = {
      variant: link.variant || "contained",
      color: link.color || "primary",
      size: link.size || "medium",
      fullWidth: true,
      startIcon: link.open_new === "True" ? <OpenInNewIcon /> : null,
    };

    if (link.open_new === "True") {
      buttonProps.target = "_blank";
      buttonProps.rel = "noopener noreferrer";
      buttonProps["aria-label"] = `Open ${link.name} in a new tab`;
    }

    const ButtonContent = <LinkButton {...buttonProps}>{link.name}</LinkButton>;

    return link.open_new === "True" || link.link.startsWith("http") ? (
      <a href={link.link} target={
        link.open_new === "True" ? "_blank" : "_self"
      }
          rel={link.open_new === "True" ? "noopener noreferrer" : ""}
      style={{ textDecoration: "none" }} key={link.name}>
        {ButtonContent}
      </a>
    ) : (
      <Link href={link.link} passHref key={link.name}>
        {ButtonContent}
      </Link>
    );
  };

  // For applications-only variant
  if (variant === "applications") {
    return (
      <LinksContainer elevation={2} id="applications">
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Step 1. Apply to Participate
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Join the community! Select the role that best matches how you'd like to contribute to this hackathon.
          </Typography>

          {/* Overall Social Proof Summary */}
          {!countsLoading && Object.values(counts).some(c => c.accepted > 0) && (
            <Box sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: 'primary.main',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.dark',
              boxShadow: 2,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(21, 101, 192, 0.9) 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                opacity: 0.1,
                pointerEvents: 'none'
              }
            }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'common.white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                🎉 Join {Object.values(counts).reduce((sum, c) => sum + c.accepted, 0)}+ participants already confirmed for this hackathon!
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2}>
            {applicationTypes.map((app) => (
              <Grid size={{ xs: 12, sm: 6 }} key={app.type}>
                <ApplicationButton
                  variant="contained"
                  color={app.color}
                  fullWidth
                  startIcon={app.icon}
                  href={app.enabled ? app.link : undefined}
                  disabled={!app.enabled}
                  component={app.enabled ? "a" : "button"}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    minHeight: '100px', // Increased to accommodate social proof
                    opacity: app.enabled ? 1 : 0.6,
                    cursor: app.enabled ? 'pointer' : 'not-allowed',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <Typography variant="subtitle1" component="span" fontWeight="bold">
                      {app.title}
                    </Typography>
                    <Typography variant="caption" component="span" align="left">
                      {app.description}
                      {!app.enabled && " (Closed)"}
                    </Typography>

                    {/* Social Proof Indicator */}
                    {app.enabled && !countsLoading && app.roleType && (
                      <SocialProofIndicator
                        accepted={getCountsForType(app.type).accepted}
                        total={getCountsForType(app.type).total}
                        roleType={app.roleType}
                        showUrgency={app.socialProof?.showUrgency || false}
                        urgencyThreshold={app.socialProof?.urgencyThreshold || 10}
                        variant="compact"
                        buttonColor={app.color}
                      />
                    )}
                  </Box>
                </ApplicationButton>
              </Grid>
            ))}
          </Grid>
        </Box>
      </LinksContainer>
    );
  }
  
  // For event-links-only variant
  if (variant === "event-links" && links && links.length > 0) {
    return (
      <LinksContainer elevation={2} id="event-links">
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Important Event Links
        </Typography>
        <Grid container spacing={2}>
          {links.map((link, index) => (
            <Grid size={12} key={index}>
              {renderButton(link)}
            </Grid>
          ))}
        </Grid>
      </LinksContainer>
    );
  }
  
  // For full variant (original behavior - both sections)
  return (
    <LinksContainer elevation={2} id="applications">
      <Box mb={3}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Apply to Participate
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Join the community! Select the role that best matches how you'd like to contribute to this hackathon.
        </Typography>

        {/* Overall Social Proof Summary */}
        {!countsLoading && Object.values(counts).some(c => c.accepted > 0) && (
          <Box sx={{
            mb: 2,
            p: 1.5,
            backgroundColor: 'primary.main',
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.dark',
            boxShadow: 2,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(21, 101, 192, 0.9) 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              opacity: 0.1,
              pointerEvents: 'none'
            }
          }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'common.white',
                fontWeight: 700,
                fontSize: '0.875rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                position: 'relative',
                zIndex: 1
              }}
            >
              🎉 Join {Object.values(counts).reduce((sum, c) => sum + c.accepted, 0)}+ participants already confirmed for this hackathon!
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={2} mb={3}>
          {applicationTypes.map((app) => (
            <Grid size={{ xs: 12, sm: 6 }} key={app.type}>
              <ApplicationButton
                variant="contained"
                color={app.color}
                fullWidth
                startIcon={app.icon}
                href={app.enabled ? app.link : undefined}
                disabled={!app.enabled}
                component={app.enabled ? "a" : "button"}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  height: '100%',
                  minHeight: '80px',
                  opacity: app.enabled ? 1 : 0.6,
                  cursor: app.enabled ? 'pointer' : 'not-allowed'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  <Typography variant="subtitle1" component="span" fontWeight="bold">
                    {app.title}
                  </Typography>
                  <Typography variant="caption" component="span" align="left">
                    {app.description}
                    {!app.enabled && " (Closed)"}
                  </Typography>
                </Box>
              </ApplicationButton>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {links && links.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Important Event Links
          </Typography>
          <Grid container spacing={2}>
            {links.map((link, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                {renderButton(link)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </LinksContainer>
  );
};

export default EventLinks;
