import React, { useEffect } from "react";
import { Grid, Button, Box, Typography, Paper, List, ListItem, Divider, Chip } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";

const sections = [
  {
    id: "applications",
    name: "Apply Now",
    highlight: true,
    ariaLabel: "Apply for the hackathon",
  },
  {
    id: "nonprofit",
    name: "Review Projects",
    ariaLabel: "Browse participating nonprofits",
  },
  { id: "teams", name: "Teams", ariaLabel: "Browse hackathon teams" },
  {
    id: "stats",
    name: "Hackathon Stats",
    ariaLabel: "View hackathon statistics",
  },
  {
    id: "countdown",
    name: "Event Countdown",
    ariaLabel: "See event timeline and countdown",
  },

  { id: "hacker", name: "Hackers", ariaLabel: "See event hackers" },
  { id: "volunteer", name: "Volunteers", ariaLabel: "See event volunteers" },
  { id: "mentor", name: "Mentors", ariaLabel: "View hackathon mentors" },
  { id: "judge", name: "Judges", ariaLabel: "See event judges" },

  { id: "faq", name: "FAQ", ariaLabel: "Read frequently asked questions" },
];

const trackNavigation = (sectionName) => {
  trackEvent({
    action: "navigate_section",
    params: { section_name: sectionName },
  });
};

const TableOfContents = ({ eventLinks = [] }) => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleClick = (event, sectionId, sectionName) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${sectionId}`);
      trackNavigation(sectionName);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ p: 3, my: 4, borderRadius: 2 }}
      component="nav" 
      aria-labelledby="table-of-contents-heading"
    >
      <Typography
        variant="h2"
        component="h2"
        id="table-of-contents-heading"
        gutterBottom
        align="center"
        sx={{
          fontSize: { xs: "1.35rem", sm: "1.5rem" },
          fontWeight: 600,
          letterSpacing: '-0.01em',
          marginBottom: 2
        }}
      >
        Table of Contents
      </Typography>

      {/* Quick Access Event Links */}
      {eventLinks && eventLinks.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LinkIcon color="primary" sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontSize: '1rem', fontWeight: 600 }}
            >
              Quick Access
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            mb: 2
          }}>
            {eventLinks.slice(0, 4).map((link, index) => (
              <Chip
                key={index}
                label={link.name}
                component="a"
                href={link.link}
                target={link.open_new === "True" ? "_blank" : "_self"}
                rel={link.open_new === "True" ? "noopener noreferrer" : ""}
                clickable
                color="primary"
                variant="outlined"
                icon={link.open_new === "True" ? <OpenInNewIcon /> : <LinkIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                  '&:focus': {
                    outline: '2px solid currentColor',
                    outlineOffset: '2px'
                  }
                }}
              />
            ))}
            {eventLinks.length > 4 && (
              <Chip
                label={`+${eventLinks.length - 4} more`}
                component="a"
                href="#event-links"
                clickable
                variant="outlined"
                color="secondary"
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }
                }}
              />
            )}
          </Box>

          <Divider sx={{ mx: 'auto', maxWidth: '60%' }} />
        </Box>
      )}

      <List 
        component="ul" 
        aria-label="Event sections navigation"
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          p: 0,
          gap: 1
        }}
      >
        {sections.map((section) => (
          <ListItem
            key={section.id}
            sx={{ 
              width: 'auto', 
              p: 0.5,
              display: 'inline-flex'
            }}
            dense
          >
            <Button
              variant={section.highlight ? "contained" : "outlined"}
              color={section.highlight ? "secondary" : "primary"}
              size="large"
              href={`#${section.id}`}
              onClick={(event) => handleClick(event, section.id, section.name)}
              aria-label={section.ariaLabel}
              sx={{
                borderRadius: 4,
                textTransform: "none",
                fontWeight: "bold",
                minWidth: { xs: '120px', sm: '140px' },
                ...(section.highlight && {
                  px: 3,
                  py: 1.5,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: "0 0 0 0 rgba(156, 39, 176, 0.7)"
                    },
                    "70%": {
                      boxShadow: "0 0 0 10px rgba(156, 39, 176, 0)"
                    },
                    "100%": {
                      boxShadow: "0 0 0 0 rgba(156, 39, 176, 0)"
                    }
                  }
                }),
                "&:hover": {
                  backgroundColor: section.highlight ? "secondary.dark" : "primary.main",
                },
                "&:focus": {
                  outline: '2px solid currentColor',
                  outlineOffset: '2px'
                }
              }}
            >
              {section.name}
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TableOfContents;
