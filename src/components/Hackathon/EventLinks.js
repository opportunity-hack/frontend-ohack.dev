import React from "react";
import { Paper, Typography, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";

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

const EventLinks = ({ links }) => {
  if (!links || links.length === 0) {
    return null;
  }

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
      style={{ textDecoration: "none" }}>
        {ButtonContent}
      </a>
    ) : (
      <Link href={link.link} passHref>
        {ButtonContent}
      </Link>
    );
  };

  return (
    <LinksContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Important Links
      </Typography>
      <Grid container spacing={2}>
        {links.map((link, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {renderButton(link)}
          </Grid>
        ))}
      </Grid>
    </LinksContainer>
  );
};

export default EventLinks;
