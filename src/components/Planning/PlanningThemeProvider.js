/**
 * Local MUI theme override that scopes light/dark mode to the planning board.
 *
 * The rest of OHack stays on the global light theme. The planning board reads
 * the user's preference (set via the toggle in the board header) — defaulting
 * to the OS preference (`prefers-color-scheme`) on first visit.
 *
 * Preference is persisted to localStorage so a user who picked dark sees dark
 * across sessions.
 */
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

const STORAGE_KEY = "ohack:planning:colorMode";
// Modes: "light" | "dark" | "auto"
const DEFAULT_MODE = "auto";

function getInitialMode() {
  if (typeof window === "undefined") return DEFAULT_MODE;
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function detectSystemDark() {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function usePlanningColorMode() {
  const [mode, setModeState] = useState(getInitialMode);
  const [systemDark, setSystemDark] = useState(detectSystemDark);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  function setMode(next) {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  const isDark = mode === "dark" || (mode === "auto" && systemDark);
  return { mode, setMode, isDark };
}

export default function PlanningThemeProvider({ children, isDark }) {
  const parentTheme = useTheme();
  const theme = useMemo(
    () =>
      createTheme({
        ...parentTheme,
        palette: {
          ...parentTheme.palette,
          mode: isDark ? "dark" : "light",
          ...(isDark
            ? {
                background: { default: "#1a1d24", paper: "#22262e" },
                text: { primary: "#e6e8eb", secondary: "#a8b0bc" },
                divider: "rgba(255,255,255,0.08)",
              }
            : {}),
        },
      }),
    [parentTheme, isDark]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
