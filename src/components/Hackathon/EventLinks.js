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

const EventLinks = ({ links, variant = "full" }) => {
  const router = useRouter();
  const { event_id } = router.query;
  
  if (!links) {
    links = [];
  }
  
  const applicationTypes = [
    {
      type: "hacker",
      title: "Hacker Application",
      description: "Participate as a developer, designer, or project manager",
      icon: <PersonIcon />,
      color: "primary",
      link: `/hack/${event_id}/hacker-application`,
    },
    {
      type: "mentor",
      title: "Mentor Application",
      description: "Guide teams with your technical expertise",
      icon: <VolunteerActivismIcon />,
      color: "secondary",
      link: `/hack/${event_id}/mentor-application`,
    },
    {
      type: "judge",
      title: "Judge Application",
      description: "Evaluate solutions and provide feedback",
      icon: <GavelIcon />,
      color: "success",
      link: `/hack/${event_id}/judge-application`,
    },
    {
      type: "volunteer",
      title: "Volunteer Application",
      description: "Help with event logistics and support",
      icon: <GroupsIcon />,
      color: "info",
      link: `/hack/${event_id}/volunteer-application`,
    },
    {
      type: "sponsor",
      title: "Sponsor Application",
      description: "Support the event as an organization",
      icon: <BusinessIcon />,
      color: "warning",
      link: `/hack/${event_id}/sponsor-application`,
    },
    {
      type: "nonprofit",
      title: "Nonprofit Application",
      description: "Submit a project idea for the hackathon",
      icon: <LightbulbIcon />,
      color: "error",
      link: `/nonprofits/apply`,
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
            Apply to Participate
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Select the role that best matches how you'd like to contribute to this hackathon
          </Typography>
          
          <Grid container spacing={2}>
            {applicationTypes.map((app) => (
              <Grid item xs={12} sm={6} key={app.type}>
                <ApplicationButton
                  variant="contained"
                  color={app.color}
                  fullWidth
                  startIcon={app.icon}
                  href={app.link}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    height: '100%',
                    minHeight: '80px'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <Typography variant="subtitle1" component="span" fontWeight="bold">
                      {app.title}
                    </Typography>
                    <Typography variant="caption" component="span" align="left">
                      {app.description}
                    </Typography>
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
            <Grid item xs={12} key={index}>
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
          Select the role that best matches how you'd like to contribute to this hackathon
        </Typography>
        
        <Grid container spacing={2} mb={3}>
          {applicationTypes.map((app) => (
            <Grid item xs={12} sm={6} key={app.type}>
              <ApplicationButton
                variant="contained"
                color={app.color}
                fullWidth
                startIcon={app.icon}
                href={app.link}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  height: '100%',
                  minHeight: '80px'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  <Typography variant="subtitle1" component="span" fontWeight="bold">
                    {app.title}
                  </Typography>
                  <Typography variant="caption" component="span" align="left">
                    {app.description}
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
              <Grid item xs={12} sm={6} md={4} key={index}>
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
