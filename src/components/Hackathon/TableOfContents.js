import React, { useEffect } from "react";
import { Grid, Button, Box, Typography, Paper, List, ListItem } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

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
  { id: "teams", name: "Create a Team", ariaLabel: "Browse hackathon teams" },
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

const TableOfContents = () => {
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
