import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    h1: { fontFamily: "'Montserrat', monospace"},
    h2: {
      fontFamily: `var(--font-secondary)`,
    },
    h3: {
      fontFamily: `var(--font-secondary)`,
    },
    h5: {
      fontFamily: `var(--font-secondary)`,
    },
    // body: {
    //   fontFamily: "'Nunito Sans', sans-serif"
    // },
    // fontFamily: "'Nunito Sans', sans-serif",
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
          '&.MuiGrid-container': {
            display: 'flex',
            flexWrap: 'wrap',
          },
        },
      },
    },
  },
});

export default theme;
