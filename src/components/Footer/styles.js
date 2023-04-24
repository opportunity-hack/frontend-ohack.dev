import { Grid, Typography, Link } from "@mui/material";
import { styled } from "@mui/material";

export const FooterContainer = styled(Grid)({
  marginTop: "10rem",
  width: "100%",
  padding: "5rem 0rem",
  // backgroundColor: "#003486",
  backgroundColor: "#353535",
  justifyContent: "center",
  alignItems: "center",
  // background: "linear-gradient(to top, #000000 23%, #222222 89%)",
});

export const InnerContainer = styled(Grid)((props) => ({
  width: "80%",
  color: "white",
  fontSize: "1.5rem",

  [props.theme.breakpoints.down("md")]: {
    width: "100%",
    flexDirection: "column-reverse",
  },
}));

export const TextContainer = styled(Grid)({
  padding: "0rem 5rem",
});

export const StyledText = styled(Typography)({
  fontSize: "1.5rem",
  textTransform: "uppercase",
  fontWeight: 600,
  padding: "1rem 0",
  letterSpacing: "0.2em",
  width: "100%",
  color: "white"
});

export const MutedText = styled(Typography)({
  fontSize: "1.5rem",
  color: "#c7c7c7",
  width: "100%",
});

export const IconLink = styled(Link)({
  color: "#c7c7c7",
  transition: "0.25s",
  "&:hover": {
    color: "white",
  },
});

export const Hashtag = styled(Typography)({
  fontSize: "1.5rem",
  color: "#c7c7c7",
  display: "inline-block",
  transitionDuration: "0.3s",
  "&:hover": {
    color: "white",
  },
})

export const LinkList = styled("ul")({
  listStyle: "none",
  position: "relative",
  padding: "0",
  paddingBottom: "2rem",
  margin: "0",
});

export const LinkListItem = styled("li")({
  padding: "0.5rem 0rem",
  fontWeight: 700,
});

export const StyledLink = styled(Link)({
  textDecoration: "none",
  fontSize: "1.5rem",
  color: "#c7c7c7",
  transitionDuration: "0.3s",
  "&:hover": {
    color: "white",
  },
});
