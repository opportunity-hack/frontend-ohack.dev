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
  // backgroundColor: "teal",
  width: "90%",
  minHeight: "100vh",
});

export const TabsContainer = styling(Grid)({
  margin: "auto",
  width: "90%",
  // backgroundColor: "teal",
  // minHeight: "400px",
  // marginTop: "2%"
});

export const TabContainer = styling(Grid)({
  margin: "auto",
  width: "100%",
  height: "auto",
  // backgroundColor: "red"
});

export const InfoContainer = styling(Grid)((props) => ({
  borderRadius: "20px",
  padding: "0% 20%",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "5%",
  width: "100%",
  textAlign: "justify",
  // marginLeft: "5%",
  // marginRight: "5%",

  [props.theme.breakpoints.down("md")]: {
    padding: "0% 10%",
  },
}));

export const TitleContainer = styling(Grid)({
  width: "100%",
  // backgroundColor: "green",
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
  // backgroundColor: "teal",
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
