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
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  EmojiEvents as EmojiEventsIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { trackEvent } from "../../lib/ga";

// Sections are grouped for the mobile drawer so the list is scannable rather
// than a flat 10-item dump. Order within each group matches priority of
// likely action (Apply > Projects > People > Help).
const sectionConfig = [
  { id: "applications", name: "Apply Now", icon: <AssignmentIcon />, shortcut: "A", group: "action" },
  { id: "nonprofit", name: "Projects", icon: <BusinessIcon />, shortcut: "P", group: "content" },
  { id: "teams", name: "Teams", icon: <GroupIcon />, shortcut: "T", group: "content" },
  { id: "stats", name: "Stats", icon: <BarChartIcon />, shortcut: "S", group: "content" },
  { id: "countdown", name: "Countdown", icon: <TimerIcon />, shortcut: "C", group: "content" },
  { id: "hacker", name: "Hackers", icon: <CodeIcon />, shortcut: "H", group: "people" },
  { id: "volunteer", name: "Volunteers", icon: <VolunteerIcon />, shortcut: "V", group: "people" },
  { id: "mentor", name: "Mentors", icon: <MentorIcon />, shortcut: "M", group: "people" },
  { id: "judge", name: "Judges", icon: <JudgeIcon />, shortcut: "J", group: "people" },
  { id: "faq", name: "FAQ", icon: <HelpIcon />, shortcut: "F", group: "help" },
];

const GROUP_LABELS = {
  action: "Get started",
  content: "Event content",
  people: "People",
  help: "Help",
};

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

const FloatingNavigation = ({ isHackathonExpired = false }) => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const activeSections = React.useMemo(() => {
    if (!isHackathonExpired) return sectionConfig;
    return [
      { id: "results", name: "Results", icon: <EmojiEventsIcon />, shortcut: "R", group: "action" },
      ...sectionConfig,
    ];
  }, [isHackathonExpired]);

  // Only show sections that actually exist in the DOM. Avoids dead-end taps
  // on events that don't render every section (e.g. a virtual hackathon
  // with no Judges block). Re-checked when the menu opens so late-mounting
  // sections (Mentor Team Panel, etc.) get picked up.
  const [presentIds, setPresentIds] = useState(null);
  const recomputePresentIds = useCallback(() => {
    if (typeof document === "undefined") return;
    const present = new Set();
    activeSections.forEach((s) => {
      if (document.getElementById(s.id)) present.add(s.id);
    });
    setPresentIds(present);
  }, [activeSections]);
  useEffect(() => {
    recomputePresentIds();
  }, [recomputePresentIds]);

  const [flashSection, setFlashSection] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const flashTimer = useRef(null);

  // Show/hide FAB based on scroll position. Threshold is a bit lower than
  // before so mobile users get the menu earlier (page is content-heavy).
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 240);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
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

    activeSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeSections]);

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

  // Global keyboard shortcuts — work without opening the menu. Disabled on
  // mobile (no keyboard) so the shortcut overlay isn't reachable there.
  useEffect(() => {
    if (isMobile) return undefined;
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
        if (index < activeSections.length) {
          event.preventDefault();
          const section = activeSections[index];
          navigateToSection(section.id, section.name);
        }
        return;
      }
      if (key === "0" && activeSections.length >= 10) {
        event.preventDefault();
        const section = activeSections[9];
        navigateToSection(section.id, section.name);
        return;
      }

      // Letter shortcuts
      const upper = key.toUpperCase();
      const section = activeSections.find((s) => s.shortcut === upper);
      if (section) {
        event.preventDefault();
        navigateToSection(section.id, section.name);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, open, showHelp, navigateToSection, handleBackToTop, activeSections]);

  if (!isVisible) return null;

  // -------------------------------------------------------------------------
  // MOBILE: bottom-sheet drawer triggered by a single FAB.
  // -------------------------------------------------------------------------
  if (isMobile) {
    // Only show sections that exist in the DOM; preserve original order.
    const sectionsToShow = activeSections.filter(
      (s) => !presentIds || presentIds.has(s.id)
    );

    // Group sections for the drawer. Empty groups are omitted.
    const sectionsByGroup = sectionsToShow.reduce((acc, s) => {
      const g = s.group || "content";
      (acc[g] = acc[g] || []).push(s);
      return acc;
    }, {});
    const groupOrder = ["action", "content", "people", "help"].filter(
      (g) => sectionsByGroup[g] && sectionsByGroup[g].length > 0
    );

    return (
      <>
        {/* Trigger FAB. We deliberately use a Fab — not a SpeedDial — so
            opening always shows the drawer below and never a stack of
            tooltip-only mini-FABs that overlap page content. */}
        <Fab
          aria-label="Open page navigation"
          onClick={() => {
            recomputePresentIds();
            setOpen(true);
            trackEvent?.({ action: "floating_nav_open", params: { source: "mobile_fab" } });
          }}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 16,
            zIndex: 1200,
            boxShadow: "0 10px 30px -10px rgba(22,24,29,0.5)",
            backgroundColor: "var(--brand, #1B3A6B)",
            color: "#fff",
            "&:hover": { backgroundColor: "#16315a" },
          }}
        >
          <MenuIcon />
        </Fab>

        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              // Cap height so a tall section list doesn't take the whole
              // screen — feels more like a "sheet" peek-and-pick.
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {/* Drag-handle affordance + close. Sticky at the top of the sheet
              so the section list scrolls under it. */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              pt: 1,
              pb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 2,
                bgcolor: "grey.300",
                mx: "auto",
                mb: 1,
              }}
              aria-hidden="true"
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                pb: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Jump to section
              </Typography>
              <IconButton
                onClick={() => setOpen(false)}
                size="small"
                aria-label="Close navigation"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* "Back to top" — pinned in the header so it's always one tap
                away regardless of how far the section list is scrolled. */}
            <ListItemButton
              onClick={handleBackToTop}
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
                <TopIcon />
              </ListItemIcon>
              <ListItemText
                primary="Back to top"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </Box>

          {/* Grouped section list. Scrollable inside the sheet. */}
          <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
            {groupOrder.map((group, gi) => (
              <React.Fragment key={group}>
                {gi > 0 && <Divider sx={{ my: 0.5 }} />}
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                    color: "text.secondary",
                    letterSpacing: 0.6,
                    fontWeight: 600,
                  }}
                >
                  {GROUP_LABELS[group] || group}
                </Typography>
                <List dense={false} disablePadding>
                  {sectionsByGroup[group].map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <ListItem key={section.id} disablePadding>
                        <ListItemButton
                          onClick={() =>
                            navigateToSection(section.id, section.name)
                          }
                          sx={{
                            py: 1.25,
                            px: 2,
                            position: "relative",
                            // Active section: subtle tinted bg + left bar +
                            // bold label. Reads at a glance without being
                            // loud.
                            ...(isActive && {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                left: 0,
                                top: 8,
                                bottom: 8,
                                width: 3,
                                borderRadius: 2,
                                bgcolor: "primary.main",
                              },
                            }),
                            minHeight: 48,
                          }}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 40,
                              color: isActive ? "primary.main" : "text.secondary",
                            }}
                          >
                            {section.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={section.name}
                            primaryTypographyProps={{
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? "primary.main" : "text.primary",
                            }}
                          />
                          {isActive ? (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "primary.main",
                                fontWeight: 700,
                                mr: 0.5,
                              }}
                            >
                              Viewing
                            </Typography>
                          ) : (
                            <ChevronRightIcon
                              fontSize="small"
                              sx={{ color: "action.disabled" }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </React.Fragment>
            ))}
          </Box>
        </Drawer>
      </>
    );
  }

  // -------------------------------------------------------------------------
  // DESKTOP: existing SpeedDial. Keyboard shortcuts work alongside it.
  // -------------------------------------------------------------------------
  const visibleSections = activeSections;
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
                {activeSections.map((section, i) => (
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
        {/* Help hint — shown briefly or on hover */}
        {!open && (
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
            tooltipTitle="Back to Top (B)"
            tooltipPlacement="left"
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
                tooltipTitle={`${section.name} (${section.shortcut})`}
                tooltipPlacement="left"
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
                  // Show shortcut badge on desktop
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
