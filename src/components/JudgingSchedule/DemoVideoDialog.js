import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import VideoDisplay from "../VideoDisplay/VideoDisplay";
import { FONT_BODY, FONT_DISPLAY } from "../../styles/fonts";

/*
 * The judging schedule's ONE demo-video dialog, built for a projector.
 *
 * - Windowed: wide (lg) and the 16:9 frame is sized to the viewport HEIGHT,
 *   so the whole video is visible without scrolling on a laptop.
 * - Present (button or "F"): the dialog fills the screen on a dark stage,
 *   the team name is large enough to read from the back of the room, and
 *   the browser goes full screen (hides tabs/URL bar) where supported.
 *   Esc leaves Present first, a second Esc closes.
 * - Present is remembered for the browser session, so an operator showing
 *   panel after panel only has to choose it once.
 *
 * Portal: renders outside RefinedRoot, so colors are literals.
 */

const PRESENT_KEY = "ohack.judgingVideo.present";
const INK = "#16181D";
const MUTED = "#5B6270";
const NAVY = "#1B3A6B";

const readPresentPref = () => {
  try {
    return window.sessionStorage.getItem(PRESENT_KEY) === "1";
  } catch {
    return false;
  }
};
const writePresentPref = (on) => {
  try {
    window.sessionStorage.setItem(PRESENT_KEY, on ? "1" : "0");
  } catch {
    /* private mode etc. — the toggle still works for this dialog */
  }
};

const fullscreenElement = () =>
  typeof document !== "undefined"
    ? document.fullscreenElement || document.webkitFullscreenElement || null
    : null;

const requestFs = (el) => {
  const fn = el?.requestFullscreen || el?.webkitRequestFullscreen;
  if (!fn) return;
  try {
    const p = fn.call(el);
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    /* no transient activation — the in-page full-screen layout still applies */
  }
};

const exitFs = () => {
  if (!fullscreenElement()) return;
  const fn = document.exitFullscreen || document.webkitExitFullscreen;
  try {
    const p = fn?.call(document);
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    /* ignore */
  }
};

// One line of context under the team name: "Panel A · Room 1123 · NMTSA".
// Rooms are free text ("Room 1123", "Main hall"); a bare number gets "Room".
const roomLabel = (room) => {
  const r = String(room || "").trim();
  return /^\d/.test(r) ? `Room ${r}` : r;
};
export const videoContextLine = (context) =>
  [context?.panelName, roomLabel(context?.room), context?.nonprofit]
    .filter(Boolean)
    .join(" · ");

const isTypingTarget = (el) =>
  !!el &&
  (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

export default function DemoVideoDialog({
  open,
  url,
  teamName,
  context,
  onClose,
  onPresent,
}) {
  const rootRef = useRef(null);
  const closingRef = useRef(false);
  const [present, setPresent] = useState(false);
  const presentRef = useRef(present);
  presentRef.current = present;

  // Seed from the session preference each time a video opens.
  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    setPresent(readPresentPref());
  }, [open, url]);

  // Browser full screen follows Present. Opening a video is a user gesture,
  // so a remembered Present usually gets real full screen too; if the
  // browser refuses, the dialog still covers the whole viewport.
  useEffect(() => {
    if (!open) return;
    if (present) {
      if (!fullscreenElement()) requestFs(rootRef.current);
    } else exitFs();
  }, [open, present]);

  // Leaving browser full screen (the browser eats the first Esc) drops back
  // to the windowed dialog instead of leaving a dark stage behind.
  useEffect(() => {
    if (!open) return undefined;
    const onChange = () => {
      if (fullscreenElement() || closingRef.current) return;
      // The viewer left full screen on purpose — remember that too.
      writePresentPref(false);
      setPresent(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [open]);

  const togglePresent = useCallback(() => {
    const next = !presentRef.current;
    writePresentPref(next);
    setPresent(next);
    if (next) {
      requestFs(rootRef.current); // inside the click/keypress: has activation
      if (onPresent) onPresent();
    }
  }, [onPresent]);

  // "F" toggles Present (YouTube uses the same key inside its player).
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "f" && e.key !== "F") return;
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      e.preventDefault();
      togglePresent();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, togglePresent]);

  const handleClose = (_e, reason) => {
    if (reason === "escapeKeyDown" && present) {
      writePresentPref(false);
      setPresent(false);
      return;
    }
    closingRef.current = true; // keep the session preference
    exitFs();
    onClose();
  };

  const title = teamName || "Team demo";
  const contextLine = videoContextLine(context);
  const fg = present ? "#F4F1EA" : INK;
  const fgMuted = present ? "rgba(244,241,234,0.72)" : MUTED;
  // Header height the 16:9 frame has to leave room for.
  const reserve = present ? 150 : 230;

  return (
    <Dialog
      ref={rootRef}
      open={open}
      onClose={handleClose}
      fullScreen={present}
      maxWidth="lg"
      fullWidth
      aria-labelledby="judging-video-title"
      aria-describedby={contextLine ? "judging-video-context" : undefined}
      PaperProps={{
        sx: present
          ? { bgcolor: "#0B0D12", color: fg, borderRadius: 0 }
          : { borderRadius: "10px" },
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: present ? { xs: 2, md: 4 } : 3,
          py: present ? 2.25 : 2,
          minHeight: 64,
          borderBottom: present ? "none" : "1px solid #E7E1D4",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            component="h2"
            id="judging-video-title"
            sx={{
              m: 0,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: present ? "clamp(28px, 3.4vw, 52px)" : "22px",
              lineHeight: 1.15,
              color: fg,
              overflowWrap: "anywhere",
            }}
          >
            {title}
            {!present && (
              <Box component="span" sx={{ color: MUTED, fontWeight: 400 }}>
                {" "}
                demo
              </Box>
            )}
          </Box>
          {contextLine && (
            <Box
              id="judging-video-context"
              sx={{
                mt: 0.5,
                fontFamily: FONT_BODY,
                fontSize: present ? "clamp(16px, 1.4vw, 22px)" : "14.5px",
                color: fgMuted,
              }}
            >
              {contextLine}
            </Box>
          )}
        </Box>
        <Tooltip
          describeChild
          title={present ? "Exit presentation (Esc)" : "Present full screen (F)"}
        >
          <Button
            onClick={togglePresent}
            aria-pressed={present}
            startIcon={present ? <FullscreenExitIcon /> : <FullscreenIcon />}
            sx={{
              textTransform: "none",
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: "15px",
              borderRadius: "6px",
              px: 1.75,
              flexShrink: 0,
              ...(present
                ? {
                    color: fg,
                    border: "1px solid rgba(244,241,234,0.35)",
                    "&:hover": { bgcolor: "rgba(244,241,234,0.08)" },
                  }
                : {
                    color: "#fff",
                    bgcolor: NAVY,
                    "&:hover": { bgcolor: "#142C52" },
                  }),
            }}
          >
            {present ? "Exit presentation" : "Present"}
          </Button>
        </Tooltip>
        <IconButton
          aria-label="Close demo video"
          onClick={() => handleClose(null, "closeButton")}
          sx={{ color: present ? fg : MUTED, flexShrink: 0 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: present ? { xs: 1, md: 4 } : 3,
          pt: present ? 0 : 2.5,
          pb: present ? { xs: 1, md: 3 } : 3,
        }}
      >
        {url && (
          <Box
            sx={{
              // Largest 16:9 frame that fits both the width and the height.
              width: `min(100%, calc((100vh - ${reserve}px) * 16 / 9))`,
              mx: "auto",
            }}
          >
            <VideoDisplay url={url} title={`${title} demo`} fill />
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
