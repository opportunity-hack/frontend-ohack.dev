import { Grid, Button, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

// Button
export const ButtonStyled = styling(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#003486",
  color: "#ffffff",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const ButtonBasicStyle = styling(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

// Grid
export const GridStyled = styling(Grid)((props) => ({
  padding: "8rem 6rem 6rem 6rem",
  height: "100%",
  width: "80%",
  margin: "auto",

  [props.theme.breakpoints.down("lg")]: {
    padding: "8rem 0rem 6rem 0rem",
  },

  [props.theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const BlankContainer = styling(Grid)({
  display: "flex",
  flexDirection: "column",
  position: "relative",
});

export const TitleContainer = styling(Grid)((props) => ({
  padding: "6rem 5% 0px 0px",
  marginTop: "5rem",

  [props.theme.breakpoints.down("md")]: {
    padding: props.right === "true" ? "15% 5% 5% 5%" : "3rem 10px 0 10px",
    justifyContent: "center",
    textAlign: "center",
  },
}));

export const CaptionContainer = styling(Grid)((props) => ({
  color: "#425466",
  maxWidth: "390px",

  [props.theme.breakpoints.down("md")]: {
    display: "flex",
    minWidth: "100%",
    justifyContent: "center",
    textAlign: "center",
  },
}));

export const ButtonContainers = styling(Grid)((props) => ({
  display: "flex",
  flexDirection: "column",
  width: "auto",
  gap: "1rem",
}));

// Typography
export const TitleStyled = styling(Typography)((props) => ({
  fontSize: "4vw",
  lineHeight: "5vw",
  fontWeight: "700",
  color: "#333333",
  textShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  letterSpacing: "-0.3rem",

  [props.theme.breakpoints.down("md")]: {
    fontSize: "8vw",
    lineHeight: "8.25vw",
  },
}));

export const TextStyled = styling(Typography)({
  fontSize: "1.5rem",
  margin: "2rem 0rem 1rem 0rem",
  width: "100%",
});

export const SpanText = styling("span") ((props) => ({
  color: `var(--blue)`,
  fontSize: "6.5vw",
  "& .Typewriter": {
    marginTop: "10px",
  },

  [props.theme.breakpoints.down("md")]: {
    fontSize: "10vw",
    lineHeight: "8.25vw",
  },
}));

export const BackgroundGrid = styling(Grid)({
  position: "absolute",
  width: "100%",
  height: "70rem",
  top: "-20rem",
  transform: "skewY(-10deg)",
  background: "linear-gradient(to bottom right, #58cffb 23%, #CCCCFF 89%)",
  zIndex: "-100",
});
