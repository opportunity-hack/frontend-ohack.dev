import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Paper,
  Fade,
  IconButton,
  Backdrop,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon,
  Timer as TimerIcon,
  Code as CodeIcon,
  VolunteerActivism as VolunteerIcon,
  School as MentorIcon,
  Gavel as JudgeIcon,
  Help as HelpIcon,
  KeyboardArrowUp as TopIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
} from "@mui/icons-material";
import { trackEvent } from "../../lib/ga";

const sectionConfig = [
  { id: "applications", name: "Apply Now", icon: <AssignmentIcon />, shortcut: "A" },
  { id: "nonprofit", name: "Projects", icon: <BusinessIcon />, shortcut: "P" },
  { id: "teams", name: "Teams", icon: <GroupIcon />, shortcut: "T" },
  { id: "stats", name: "Stats", icon: <BarChartIcon />, shortcut: "S" },
  { id: "countdown", name: "Countdown", icon: <TimerIcon />, shortcut: "C" },
  { id: "hacker", name: "Hackers", icon: <CodeIcon />, shortcut: "H" },
  { id: "volunteer", name: "Volunteers", icon: <VolunteerIcon />, shortcut: "V" },
  { id: "mentor", name: "Mentors", icon: <MentorIcon />, shortcut: "M" },
  { id: "judge", name: "Judges", icon: <JudgeIcon />, shortcut: "J" },
  { id: "faq", name: "FAQ", icon: <HelpIcon />, shortcut: "F" },
];

// Check if the user is typing in an input, textarea, or contentEditable
function isTyping() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

const FloatingNavigation = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [flashSection, setFlashSection] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const flashTimer = useRef(null);

  // Show/hide FAB based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-20% 0px -70% 0px", threshold: 0.1 }
    );

    sectionConfig.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const navigateToSection = useCallback((sectionId, sectionName) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    setOpen(false);
    setShowHelp(false);

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });

    // Brief flash highlight on the target section
    setFlashSection(sectionId);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashSection(""), 1500);

    if (window.history?.pushState) {
      window.history.pushState(null, "", `#${sectionId}`);
    }

    trackEvent?.({
      action: "floating_nav_click",
      params: { section_name: sectionName },
    });
  }, []);

  const handleBackToTop = useCallback(() => {
    setOpen(false);
    setShowHelp(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (window.history?.pushState) {
      window.history.pushState(null, "", window.location.pathname);
    }

    trackEvent?.({
      action: "back_to_top",
      params: { source: "floating_nav" },
    });
  }, []);

  // Flash highlight effect — inject a brief outline on the target section element
  useEffect(() => {
    if (!flashSection) return;
    const el = document.getElementById(flashSection);
    if (!el) return;

    el.style.transition = "box-shadow 0.3s ease";
    el.style.boxShadow = `0 0 0 3px ${theme.palette.primary.main}40`;
    const timer = setTimeout(() => {
      el.style.boxShadow = "none";
    }, 1200);
    return () => {
      clearTimeout(timer);
      el.style.boxShadow = "none";
    };
  }, [flashSection, theme]);

  // Global keyboard shortcuts — work without opening the menu
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Never capture when user is typing in a form field
      if (isTyping()) return;

      // Don't capture if modifier keys are held (allow browser shortcuts)
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key;

      // ? or / toggles help overlay
      if (key === "?" || key === "/") {
        event.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Escape closes help and menu
      if (key === "Escape") {
        if (showHelp || open) {
          event.preventDefault();
          setShowHelp(false);
          setOpen(false);
        }
        return;
      }

      // B or Home = back to top
      if (key.toUpperCase() === "B" || key === "Home") {
        event.preventDefault();
        handleBackToTop();
        return;
      }

      // Number keys 1-9 and 0 for sections
      if (key >= "1" && key <= "9") {
        const index = parseInt(key) - 1;
        if (index < sectionConfig.length) {
          event.preventDefault();
          const section = sectionConfig[index];
          navigateToSection(section.id, section.name);
        }
        return;
      }
      if (key === "0" && sectionConfig.length >= 10) {
        event.preventDefault();
        const section = sectionConfig[9];
        navigateToSection(section.id, section.name);
        return;
      }

      // Letter shortcuts
      const upper = key.toUpperCase();
      const section = sectionConfig.find((s) => s.shortcut === upper);
      if (section) {
        event.preventDefault();
        navigateToSection(section.id, section.name);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, showHelp, navigateToSection, handleBackToTop]);

  if (!isVisible) return null;

  const visibleSections = isMobile ? sectionConfig.slice(0, 6) : sectionConfig;
  const displaySections = [...visibleSections].reverse();

  return (
    <>
      {/* Keyboard shortcut help dialog */}
      <Backdrop
        open={showHelp}
        onClick={() => setShowHelp(false)}
        sx={{ zIndex: 1200, backdropFilter: "blur(2px)" }}
      >
        <Fade in={showHelp}>
          <Paper
            elevation={8}
            onClick={(e) => e.stopPropagation()}
            sx={{
              p: 3,
              maxWidth: 420,
              width: "90%",
              borderRadius: 3,
              position: "relative",
            }}
          >
            <IconButton
              onClick={() => setShowHelp(false)}
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
              aria-label="Close keyboard shortcuts"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <KeyboardIcon color="primary" />
              <Typography variant="h6" component="h2">
                Keyboard Shortcuts
              </Typography>
            </Box>

            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& td": { py: 0.5, px: 1, verticalAlign: "middle" },
                "& td:first-of-type": { whiteSpace: "nowrap", width: 60 },
              }}
            >
              <tbody>
                <tr>
                  <td colSpan={2}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Sections
                    </Typography>
                  </td>
                </tr>
                {sectionConfig.map((section, i) => (
                  <tr key={section.id}>
                    <td>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Kbd>{section.shortcut}</Kbd>
                        <Typography variant="caption" color="text.secondary">
                          or
                        </Typography>
                        <Kbd>{i < 9 ? i + 1 : 0}</Kbd>
                      </Box>
                    </td>
                    <td>
                      <Typography variant="body2">{section.name}</Typography>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}>
                    <Box sx={{ my: 1, borderTop: "1px solid", borderColor: "divider" }} />
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Navigation
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td><Kbd>B</Kbd></td>
                  <td><Typography variant="body2">Back to top</Typography></td>
                </tr>
                <tr>
                  <td><Kbd>?</Kbd></td>
                  <td><Typography variant="body2">Toggle this help</Typography></td>
                </tr>
                <tr>
                  <td><Kbd>Esc</Kbd></td>
                  <td><Typography variant="body2">Close menu / help</Typography></td>
                </tr>
              </tbody>
            </Box>
          </Paper>
        </Fade>
      </Backdrop>

      {/* Floating navigation */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        {/* Help hint — shown briefly or on hover, hidden on mobile */}
        {!isMobile && !open && (
          <Fade in>
            <Typography
              variant="caption"
              onClick={() => setShowHelp(true)}
              sx={{
                position: "absolute",
                bottom: 64,
                right: 4,
                bgcolor: "rgba(0,0,0,0.7)",
                color: "white",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                cursor: "pointer",
                userSelect: "none",
                fontSize: "11px",
                opacity: 0.7,
                transition: "opacity 0.2s",
                "&:hover": { opacity: 1 },
              }}
            >
              Press <Kbd small>?</Kbd> for shortcuts
            </Typography>
          </Fade>
        )}

        <SpeedDial
          ariaLabel="Navigate to page sections"
          sx={{
            "& .MuiSpeedDial-fab": {
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              width: 56,
              height: 56,
            },
          }}
          icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<TopIcon />} />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          direction="up"
        >
          {/* Back to Top */}
          <SpeedDialAction
            key="top"
            icon={<TopIcon />}
            tooltipTitle={isMobile ? "Top" : "Back to Top (B)"}
            tooltipPlacement="left"
            tooltipOpen={isMobile}
            onClick={handleBackToTop}
            sx={{
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              "&:hover": { bgcolor: "secondary.dark" },
            }}
          />

          {/* Section Actions */}
          {displaySections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <SpeedDialAction
                key={section.id}
                icon={section.icon}
                tooltipTitle={
                  isMobile
                    ? section.name
                    : `${section.name} (${section.shortcut})`
                }
                tooltipPlacement="left"
                tooltipOpen={isMobile}
                onClick={() => navigateToSection(section.id, section.name)}
                sx={{
                  bgcolor: isActive ? "primary.light" : "background.paper",
                  color: isActive ? "primary.contrastText" : "text.primary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.main" : "action.hover",
                  },
                  ...(isActive && {
                    boxShadow: theme.shadows[8],
                    transform: "scale(1.1)",
                  }),
                  // Show shortcut badge on desktop only
                  ...(!isMobile && {
                    position: "relative",
                    "&::after": {
                      content: `"${section.shortcut}"`,
                      position: "absolute",
                      top: -4,
                      right: -4,
                      backgroundColor: isActive
                        ? theme.palette.primary.dark
                        : "rgba(0,0,0,0.65)",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      lineHeight: 1,
                    },
                  }),
                }}
              />
            );
          })}
        </SpeedDial>
      </Box>
    </>
  );
};

// Styled keyboard key indicator
const Kbd = ({ children, small }) => (
  <Box
    component="kbd"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: small ? 16 : 22,
      height: small ? 16 : 22,
      px: small ? 0.25 : 0.5,
      bgcolor: small ? "transparent" : "grey.100",
      border: small ? "1px solid rgba(255,255,255,0.5)" : "1px solid",
      borderColor: small ? "rgba(255,255,255,0.5)" : "grey.300",
      borderRadius: 0.5,
      fontSize: small ? "9px" : "12px",
      fontFamily: "monospace",
      fontWeight: 600,
      color: small ? "inherit" : "text.primary",
      lineHeight: 1,
      boxShadow: small ? "none" : "0 1px 0 1px rgba(0,0,0,0.08)",
    }}
  >
    {children}
  </Box>
);

export default FloatingNavigation;
