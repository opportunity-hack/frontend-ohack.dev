import React from "react";
import { Paper, Typography, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const LinksContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "400px",
  overflowX: "hidden", // Prevent horizontal scroll
  overflowY: "auto", // Allow vertical scroll if needed
}));

const LinkButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "customcolor",
})(({ theme, customcolor }) => {
  const isCustomColor =
    customcolor &&
    !["primary", "secondary", "error", "warning", "info", "success"].includes(
      customcolor
    );

  return {
    margin: theme.spacing(1, 0),
    backgroundColor: isCustomColor
      ? customcolor
      : theme.palette[customcolor || "primary"].main,
    color: theme.palette.getContrastText(
      isCustomColor ? customcolor : theme.palette[customcolor || "primary"].main
    ),
    "&:hover": {
      backgroundColor: isCustomColor
        ? theme.palette.augmentColor({ color: { main: customcolor } }).dark
        : theme.palette[customcolor || "primary"].dark,
    },
    padding: theme.spacing(1, 2),
    minWidth: "auto",
    maxWidth: "100%",
    whiteSpace: "normal",
    wordWrap: "break-word",
    textAlign: "left",
    justifyContent: "flex-start",
    textTransform: "none",
    lineHeight: 1.2,
    "& .MuiButton-startIcon": {
      marginRight: theme.spacing(1),
    },
  };
});

const EventLinks = ({ links }) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <LinksContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Important Links
      </Typography>
      <Grid container spacing={2}>
        {links.map((link, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <LinkButton
              variant="contained"
              customcolor={link.color}
              href={link.link}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              aria-label={`Open ${link.name} in a new tab`}
              fullWidth
            >
              {link.name}
            </LinkButton>
          </Grid>
        ))}
      </Grid>
    </LinksContainer>
  );
};

export default EventLinks;
