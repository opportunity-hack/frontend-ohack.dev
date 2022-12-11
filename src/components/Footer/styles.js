import { Grid, Typography, Link } from "@mui/material";
import { styled as styling } from "@mui/material";

export const FooterContainer = styling(Grid)({
  marginTop: "10rem",
  width: "100%",
  padding: "6rem 0rem",
  // backgroundColor: "#003486",
  backgroundColor: "#353535",
  justifyContent: "center",
  alignItems: "center",
  // background: "linear-gradient(to top, #000000 23%, #222222 89%)",
});

export const InnerContainer = styling(Grid)({
  width: "80%",
  color: "white",
  fontSize: "1.5rem",
});

export const TextContainer = styling(Grid)({
  padding: "0rem 5rem",
});

export const StyledText = styling(Typography)({
  fontSize: "1.5rem",
  textTransform: "uppercase",
  fontWeight: 600,
  padding: "1rem 0",
  letterSpacing: "0.2em",
  width: "100%",
});

export const MutedText = styling(Typography)({
  fontSize: "1.5rem",
  color: "#c7c7c7",
  width: "100%",
});

export const IconLink = styling(Link)({
  color: "#c7c7c7",
  transition: "0.25s",
  "&:hover": {
    color: "white",
  },
});

export const LinkList = styling("ul")({
  listStyle: "none",
  position: "relative",
  padding: "0",
  margin: "0",
});

export const LinkListItem = styling("li")({
  padding: "0.5rem 2rem",
  fontWeight: 700,
});

export const StyledLink = styling(Link)({
  textDecoration: "none",
  fontSize: "1.5rem",
  color: "#c7c7c7",
  transitionDuration: "0.3s",
  "&:hover": {
    color: "white",
  },
});
