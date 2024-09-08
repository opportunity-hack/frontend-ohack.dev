import React, { useEffect } from "react";
import { Grid, Button, Box, Typography, Paper } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

const sections = [
  { id: "countdown", name: "Event Countdown" },
  { id: "nonprofit", name: "Nonprofit List" },
  { id: "volunteer", name: "Volunteers" },
  { id: "mentor", name: "Mentors" },
  { id: "judge", name: "Judges" },
  { id: "faq", name: "FAQ" },
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
    <Paper elevation={3} sx={{ p: 3, my: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Table of Contents
      </Typography>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        {sections.map((section) => (
          <Grid item key={section.id}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href={`#${section.id}`}
              onClick={(event) => handleClick(event, section.id, section.name)}
              sx={{
                borderRadius: 4,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "secondary.main",
                },
              }}
            >
              {section.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TableOfContents;
