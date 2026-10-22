// Scoped MUI theme for the judge-facing pages (/judge, /judge/[event],
// /judge/[event]/team/[id]). Builds on the application forms' refinedFormTheme
// (token fonts + px sizes) and pins the refined palette so MUI pieces that
// render through Portals (Dialog, Snackbar, Menu) still look refined even
// though RefinedRoot's CSS variables can't reach them.
import { createTheme } from "@mui/material/styles";
import { refinedFormTheme } from "../ApplicationForm/refinedStyles";

export const JUDGE_COLORS = {
  paper: "#FBFAF6",
  surface: "#FFFFFF",
  surface2: "#F4F1E9",
  ink: "#16181D",
  muted: "#5B6270",
  faint: "#8A8F9A",
  line: "#E7E1D4",
  brand: "#1B3A6B",
  brandInk: "#0E2547",
  accent: "#E2552E",
  accentSoft: "#FBE9E2",
  success: "#2F6E50",
  danger: "#B04A36",
};

export const judgeTheme = createTheme(refinedFormTheme, {
  palette: {
    primary: {
      main: JUDGE_COLORS.brand,
      dark: JUDGE_COLORS.brandInk,
      contrastText: "#fff",
    },
    secondary: { main: JUDGE_COLORS.accent, contrastText: "#fff" },
    success: { main: JUDGE_COLORS.success },
    error: { main: JUDGE_COLORS.danger },
    warning: { main: "#9A6B12" },
    info: { main: JUDGE_COLORS.brand },
    text: { primary: JUDGE_COLORS.ink, secondary: JUDGE_COLORS.muted },
    divider: JUDGE_COLORS.line,
    background: { default: JUDGE_COLORS.paper, paper: JUDGE_COLORS.surface },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 4 },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, minHeight: 44 },
      },
    },
    MuiTabs: { styleOverrides: { root: { minHeight: 44 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 6 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 10 } } },
  },
});

// Page-level padding for the outer <section className="ohx-wrap"> on the
// judge pages: the NavBar is absolute (64px) so the first in-flow element
// clears it itself. Same values as the application forms.
export const judgeSectionStyle = {
  paddingTop: "clamp(88px, 9vh, 108px)",
  paddingBottom: "clamp(48px, 8vh, 96px)",
};

// Small, uncolored — the point is that someone glancing over a judge's
// shoulder can't read a verdict off a big green/red box.
export const quietTotalStyle = {
  fontSize: 13,
  color: "var(--muted, #5B6270)",
  margin: 0,
  lineHeight: 1.5,
};
