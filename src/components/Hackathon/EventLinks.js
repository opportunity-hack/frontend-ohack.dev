import React from "react";
import { Paper, Typography, Button, Grid, Box } from "@mui/material";
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
  overflow: "hidden", // Prevent content from spilling out
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
    margin: theme.spacing(1),
    backgroundColor: isCustomColor
      ? customcolor
      : theme.palette[customcolor || "primary"].main,
    color: theme.palette.getContrastText(
      isCustomColor ? customcolor : theme.palette[customcolor || "primary"].main
    ),
    "&:hover": {
      backgroundColor: isCustomColor
        ? customcolor
        : theme.palette[customcolor || "primary"].dark,
    },
    width: "100%", // Make all buttons the same width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
});

const ButtonContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  overflow: "auto", // Add scrolling if content exceeds container
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
      <ButtonContainer>
        <Grid container spacing={1}>
          {links.map((link, index) => (
            <Grid item xs={12} key={index}>
              <LinkButton
                variant="contained"
                customcolor={link.color}
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
              >
                {link.name}
              </LinkButton>
            </Grid>
          ))}
        </Grid>
      </ButtonContainer>
    </LinksContainer>
  );
};

export default EventLinks;
