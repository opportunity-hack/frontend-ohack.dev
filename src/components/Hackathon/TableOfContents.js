import React, { useEffect, useMemo } from "react";
import { Grid, Button, Box, Typography, Paper, List, ListItem, Divider, Chip } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";

const baseSections = [
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

const TableOfContents = ({ eventLinks = [], isHackathonExpired = false }) => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const sections = useMemo(() => {
    if (!isHackathonExpired) return baseSections;
    return [
      {
        id: "results",
        name: "Results",
        highlight: true,
        ariaLabel: "View hackathon results and winners",
      },
      ...baseSections.map(s =>
        s.id === "applications" ? { ...s, highlight: false } : s
      ),
    ];
  }, [isHackathonExpired]);

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
      elevation={0}
      sx={{ p: 3, my: 4, borderRadius: '12px', backgroundColor: 'var(--surface, #FFFFFF)', border: '1px solid var(--line, #E7E1D4)', boxShadow: 'none' }}
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
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: { xs: "1.4rem", sm: "1.6rem" },
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--ink, #16181D)',
          marginBottom: 2
        }}
      >
        Table of Contents
      </Typography>

      {/* Quick Access Event Links */}
      {eventLinks && eventLinks.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LinkIcon sx={{ mr: 1, color: 'var(--accent, #E2552E)' }} />
            <Typography
              component="h3"
              sx={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted, #5B6270)' }}
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
                variant="outlined"
                icon={link.open_new === "True" ? <OpenInNewIcon /> : <LinkIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: 'var(--brand, #1B3A6B)',
                  backgroundColor: 'var(--surface, #FFFFFF)',
                  borderColor: 'var(--line, #E7E1D4)',
                  '& .MuiChip-icon': { color: 'var(--accent, #E2552E)' },
                  '&:hover': {
                    backgroundColor: 'rgba(27,58,107,0.06)',
                    borderColor: 'var(--brand, #1B3A6B)',
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
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: 'var(--muted, #5B6270)',
                  backgroundColor: 'var(--surface-2, #F4F1E9)',
                  borderColor: 'var(--line, #E7E1D4)',
                  '&:hover': { backgroundColor: 'rgba(27,58,107,0.06)', borderColor: 'var(--brand, #1B3A6B)' },
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
              variant="text"
              size="large"
              href={`#${section.id}`}
              onClick={(event) => handleClick(event, section.id, section.name)}
              aria-label={section.ariaLabel}
              disableElevation
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                minWidth: { xs: '120px', sm: '140px' },
                boxShadow: 'none',
                ...(section.highlight
                  ? {
                      px: 3,
                      py: 1.25,
                      backgroundColor: 'var(--brand, #1B3A6B)',
                      color: '#fff',
                      border: '1px solid var(--brand, #1B3A6B)',
                      '&:hover': { backgroundColor: '#16315a', boxShadow: 'none' },
                    }
                  : {
                      backgroundColor: 'var(--surface, #FFFFFF)',
                      color: 'var(--ink, #16181D)',
                      border: '1px solid var(--line, #E7E1D4)',
                      '&:hover': { backgroundColor: 'rgba(27,58,107,0.06)', borderColor: 'var(--brand, #1B3A6B)', boxShadow: 'none' },
                    }),
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
