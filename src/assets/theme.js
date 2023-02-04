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
});

export default theme;
