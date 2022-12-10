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

// Grid
export const GridStyled = styling(Grid)({
  padding: "8rem 6rem 6rem 6rem",
  height: "100%",
  width: "80%",
  margin: "auto",
});

export const BlankContainer = styling(Grid)({
  // width: "100%",
  // height: "100%",
});

export const TitleContainer = styling(Grid)((props) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  padding: "150px 5% 0px 0px",

  [props.theme.breakpoints.down("md")]: {
    padding: props.right === "true" ? "15% 5% 5% 5%" : "100px 10px 0 10px",
    justifyContent: "center",
    textAlign: "center",
  },
}));

export const CaptionContainer = styling(Grid)({
  color: "gray",
});

export const ButtonContainers = styling(Grid)((props) => ({
  display: "flex",
  flexDirection: "column",
  width: "auto",
  gap: "1rem",
}));

// Typography
export const TitleStyled = styling(Typography)((props) => ({
  fontSize: "4vw",
  lineHeight: "4.5vw",
  fontWeight: "bold",

  [props.theme.breakpoints.down("md")]: {
	fontSize: "6vw",
	lineHeight: "6.5vw",
  },
}));

export const TextStyled = styling(Typography)({
  fontSize: "1.5rem",
});

export const SpanText = styling("span")({
  color: `var(--blue)`,
});
