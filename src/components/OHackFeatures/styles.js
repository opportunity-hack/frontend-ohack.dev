import { 
  Grid, 
  // Button, 
  // Link, 
  Typography, 
  Tabs, 
  Tab 
} from "@mui/material";
import { styled } from "@mui/material";

// Grid
export const OuterGrid = styled(Grid)({
  width: "100%",
  margin: "auto",
});

export const BlankContainer = styled(Grid)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "auto",
  textAlign: "center",
  width: "90%",
  minHeight: "100vh",
});

export const TabsContainer = styled(Grid)({
  margin: "auto",
  width: "90%",
  minHeight: "410px",
});

export const TabContainer = styled(Grid)({
  margin: "auto",
  width: "100%",
  height: "auto",
});

export const InfoContainer = styled(Grid)((props) => ({
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

export const GridStyled = styled(Grid)({});

export const TitleContainer = styled(Grid)({
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  minHeight: "50px",
  marginBottom: "2%",
});

export const TextContainer = styled(Grid)({
  width: "100%",
  textAlign: "justify",
  height: "100%",
});

// Tab
export const TabsStyled = styled(Tabs)({
  backgroundColor: "#ffffff",
  borderRadius: "82px",
});

export const TabStyled = styled(Tab)((props) => ({
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
export const TitleStyled = styled(Typography)({
  fontSize: "1.5rem",
  fontWeight: "bold",
});

export const SectionTitle = styled(Typography)({
  fontSize: "3rem",
  fontWeight: "600",
});

export const NormalTextStyled = styled(Typography)({
  fontSize: "1.5rem",
  lineHeight: "3rem",
});
