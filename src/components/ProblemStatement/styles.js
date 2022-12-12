import { AccordionDetails, Grid, Typography, Link } from "@mui/material";
import { styled as styling } from "@mui/material";

export const ProjectCard = styling(Grid)({
  padding: "3rem",
  backgroundColor: "#f5f7f77f",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  borderRadius: "1rem",
  position: "relative",
});

export const BadgeContainer = styling(Grid)((props) => ({
  position: "absolute",
  right: "4rem",

  [props.theme.breakpoints.down("sm")]: {
    left: "3rem",
  },
}));

export const TitleStyled = styling(Typography)((props) => ({
  fontSize: "3rem",
  fontWeight: "600",
  width: "calc(100% - 180px)",

  [props.theme.breakpoints.down("sm")]: {
    marginTop: "4rem",
    width: "100%",
  },
}));

export const YearStyled = styling(Typography)({
  color: "#808080",
  fontWeight: "bold",
  fontSize: "1.5rem",
  margin: "0.5rem 0",
});

export const AccordionContainer = styling(Grid)((props) => ({
  padding: "2.5rem 2rem",

  [props.theme.breakpoints.down("md")]: {
    padding: "2.5rem 0",
  },
}));

export const AccordionTitle = styling(Typography)((props) => ({
  display: "flex",
  fontWeight: "bold",
  width: "25%",
  flexShrink: 0,
  alignItems: "center",
  gap: "1rem",
  fontSize: "1.25rem",
  color: "#2e2e2e",
  paddingRight: "1rem",

  [props.theme.breakpoints.down("md")]: {
    width: "30%",
  },

  [props.theme.breakpoints.down("sm")]: {
    width: "35%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
  },
}));

export const ProjectDescText = styling(AccordionDetails)({
  fontSize: "1.3rem",
});

export const ShortDescText = styling(Typography)({
  fontSize: "1.1rem",
});

export const AccordionButton = styling(Link)({
  fontSize: "1.5rem",
  textDecoration: "none",
  color: "white",
});
