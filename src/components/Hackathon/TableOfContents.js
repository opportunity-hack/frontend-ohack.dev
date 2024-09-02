import React, { useEffect } from "react";
import { Grid, Button, Box } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

const sections = [
  { id: "nonprofit", name: "Nonprofit List" },
  { id: "countdown", name: "Event Countdown" },
  { id: "faq", name: "FAQ" },
  { id: "mentor", name: "Mentors" },
  { id: "judge", name: "Judges" },
];

const trackNavigation = (sectionName) => {
  trackEvent({
    action: "navigate_section",
    params: {
      section_name: sectionName,
    },
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
    <Box sx={{ my: 2 }}>
      <Grid container spacing={1} justifyContent="center" alignItems="center">
        {sections.map((section) => (
          <Grid item key={section.id}>
            <Button
              variant="text"
              size="small"
              href={`#${section.id}`}
              onClick={(event) => handleClick(event, section.id, section.name)}
            >
              {section.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TableOfContents;
