import { Grid, Button, Link, Typography, Tabs, Tab } from "@mui/material";
import { styled as styling } from "@mui/material";

// Grid
export const OuterGrid = styling(Grid)({
  width: "100%",
  margin: "auto",
});

export const BlankContainer = styling(Grid)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "auto",
  textAlign: "center",
  width: "90%",
  minHeight: "100vh",
});

export const TabsContainer = styling(Grid)({
  margin: "auto",
  width: "90%",
  minHeight: "410px",
});

export const TabContainer = styling(Grid)({
  margin: "auto",
  width: "100%",
  height: "auto",
});

export const InfoContainer = styling(Grid)((props) => ({
  borderRadius: "15px",
  padding: "2%",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "5px",
  marginBottom: "8px",
  width: "50%",
  textAlign: "justify",
  minHeight: "200px",
  //   border: "1px solid black",
  boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
//   borderTop: "2px solid #66cefb",
  backgroundColor: "#fafbfb",

  [props.theme.breakpoints.down("md")]: {
    padding: "0% 10%",
    width: "100%",
  },
}));

export const GridStyled = styling(Grid)({});

export const TitleContainer = styling(Grid)({
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  minHeight: "50px",
  marginBottom: "2%",
});

export const TextContainer = styling(Grid)({
  width: "100%",
  textAlign: "justify",
  height: "100%",
});

// Tab
export const TabsStyled = styling(Tabs)({
  backgroundColor: "#ffffff",
  borderRadius: "82px",
});

export const TabStyled = styling(Tab)((props) => ({
  zIndex: "10",
  textTransform: "none",
  fontSize: "1.5rem",
  fontWeight: "bold",
  borderRadius: "22px",
  minWidth: "200px",

  [props.theme.breakpoints.down("md")]: {
    minWidth: "0px",
  },

  "&.Mui-selected": {
    color: "#ffffff",
  },
}));

// Text
export const TitleStyled = styling(Typography)({
  fontSize: "1.5rem",
  fontWeight: "bold",
});

export const SectionTitle = styling(Typography)({
  fontSize: "3rem",
  fontWeight: "600",
});

export const NormalTextStyled = styling(Typography)({
  fontSize: "1.5rem",
  lineHeight: "3rem",
});
