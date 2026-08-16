import { createTheme } from "@mui/material/styles";
import { FONT_BODY } from "../styles/fonts";

// Global MUI theme. Font families come from src/styles/fonts.js — the single
// source of truth (loaded via next/font in _document.js). Headings deliberately
// use the body family (Hanken Grotesk) with weight doing the work; Fraunces is
// reserved for refined-page display type via the --display token in refined.js.
const theme = createTheme({
  typography: {
    fontFamily: FONT_BODY,
    h1: { fontFamily: FONT_BODY },
    h2: { fontFamily: FONT_BODY },
    h3: { fontFamily: FONT_BODY },
    h4: { fontFamily: FONT_BODY },
    h5: { fontFamily: FONT_BODY },
    h6: { fontFamily: FONT_BODY },
  },
  components: {
    MuiGrid: {
      defaultProps: {
        // Ensure Grid uses Flexbox layout (legacy v5 behavior) instead of CSS Grid
        disableEqualOverflow: false,
      },
      styleOverrides: {
        root: {
          // Force flexbox display for Grid containers to maintain v5 layout behavior
          "&.MuiGrid-container": {
            display: "flex",
            flexWrap: "wrap",
          },
        },
      },
    },
  },
});

export default theme;
