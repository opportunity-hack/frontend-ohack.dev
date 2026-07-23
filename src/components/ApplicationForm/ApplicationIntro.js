import React from "react";
import { Box, Typography } from "@mui/material";

const ApplicationIntro = ({ heading, subheading, eventSummary, children }) => (
  <Box sx={{ mb: 4 }}>
    {heading && (
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 1.5, fontWeight: 600 }}
      >
        {heading}
      </Typography>
    )}
    {subheading && (
      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
        {subheading}
      </Typography>
    )}
    {eventSummary && (
      <Typography
        variant="body1"
        sx={{
          mb: 2,
          color: "text.secondary",
          fontWeight: 500,
        }}
      >
        {eventSummary}
      </Typography>
    )}
    {children}
  </Box>
);

export default ApplicationIntro;
