import { AccordionDetails, Grid, Typography, Link } from "@mui/material";
import { styled } from "@mui/material";

export const ProjectCard = styled(Grid)((props) => ({
  padding: "1.4rem",
  backgroundColor: props.bgcolor,
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
  borderRadius: "1rem",
  position: "relative",
  
}));

export const BadgeContainer = styled(Grid)((props) => ({
  position: "absolute",
  right: "4rem",

  [props.theme.breakpoints.down("sm")]: {
    left: "3rem",
  },
}));

export const TitleStyled = styled(Typography)((props) => ({
  fontSize: "3rem",
  fontWeight: "600",
  width: "calc(100% - 180px)",

  [props.theme.breakpoints.down("sm")]: {
    marginTop: "4rem",
    width: "90%",
  },
}));

export const YearStyled = styled(Typography)({
  color: "#808080",
  fontWeight: "bold",
  fontSize: "1.5rem",
  margin: "0.5rem 0",
  marginTop: "1rem",
});

export const AccordionContainer = styled(Grid)((props) => ({
  padding: "2.5rem 2rem",

  [props.theme.breakpoints.down("md")]: {
    padding: "2.5rem 0",
  },
}));

export const AccordionTitle = styled(Typography)((props) => ({
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

export const ProjectDescText = styled(AccordionDetails)({
  fontSize: "1.3rem",
});

export const ShortDescText = styled(Typography)({
  fontSize: "1.1rem",
});

export const AccordionButton = styled(Link)({
  fontSize: "1.5rem",
  textDecoration: "none",
  color: "white",
});
