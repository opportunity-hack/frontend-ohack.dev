import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Launch as LaunchIcon,
  Menu as MenuIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { SECTIONS } from "./sectionsManifest";
import SaveIndicator from "./SaveIndicator";

const SIDEBAR_WIDTH = 240;

const SidebarContent = ({ activeSection, onPick, dirtySections }) => {
  const dirtyByKey = (slug) => {
    // An explicit-save section is "dirty" when its name is in dirtySections.
    return dirtySections?.has(slug);
  };

  // Group by manifest group; default to "config" for any unlabeled (legacy)
  // entries. The order of groups here defines the order in the sidebar.
  const groupOrder = ["config", "ops"];
  const groupLabels = { config: "Configure", ops: "Operate" };
  const grouped = groupOrder.map((g) => [g, SECTIONS.filter((s) => (s.group || "config") === g)]);

  const renderItem = ({ slug, label, icon: Icon }) => {
    const active = activeSection === slug;
    const dirty = dirtyByKey(slug);
    return (
      <ListItemButton
        key={slug}
        selected={active}
        onClick={() => onPick(slug)}
        sx={{
          mx: 1,
          borderRadius: 1,
          my: 0.25,
          "&.Mui-selected": { bgcolor: "primary.50", color: "primary.main", "& .MuiListItemIcon-root": { color: "primary.main" } },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: "0.92rem", fontWeight: active ? 600 : 500 }}
        />
        {dirty && (
          <Tooltip title="Unsaved changes">
            <DotIcon sx={{ fontSize: 10, color: "warning.main" }} />
          </Tooltip>
        )}
      </ListItemButton>
    );
  };

  return (
    <Box sx={{ width: SIDEBAR_WIDTH, py: 2 }}>
      {grouped.map(([groupKey, items], idx) => (
        items.length > 0 && (
          <Box key={groupKey} sx={{ mb: idx === grouped.length - 1 ? 0 : 1 }}>
            <Typography
              variant="overline"
              sx={{ px: 2, color: "text.secondary", display: "block", mt: idx === 0 ? 0 : 1 }}
            >
              {groupLabels[groupKey] || groupKey}
            </Typography>
            <List dense>{items.map(renderItem)}</List>
          </Box>
        )
      ))}
    </Box>
  );
};

const HackathonAdminLayout = ({
  hackathon,
  activeSection,
  onSelectSection,
  saveState,
  dirtySections,
  onBack,
  children,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const eventId = hackathon?.event_id;
  const title = hackathon?.title || (eventId ? eventId : "Hackathon");

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 100px)", border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
      {/* Sidebar */}
      {isSmall ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <SidebarContent
            activeSection={activeSection}
            onPick={(s) => {
              onSelectSection(s);
              setDrawerOpen(false);
            }}
            dirtySections={dirtySections}
          />
        </Drawer>
      ) : (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
          <SidebarContent activeSection={activeSection} onPick={onSelectSection} dirtySections={dirtySections} />
        </Box>
      )}

      {/* Main column */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            px: { xs: 2, md: 3 },
            py: 1.75,
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          {isSmall && (
            <IconButton size="small" onClick={() => setDrawerOpen(true)} aria-label="Open sections">
              <MenuIcon />
            </IconButton>
          )}
          <Tooltip title="Back to hackathon list">
            <IconButton size="small" onClick={onBack} aria-label="Back">
              <BackIcon />
            </IconButton>
          </Tooltip>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </Typography>
            {eventId && <Chip label={eventId} size="small" />}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SaveIndicator saveState={saveState} dirtySections={dirtySections} />
            {eventId && (
              <Button size="small" variant="outlined" startIcon={<LaunchIcon />} href={`/hack/${eventId}`} target="_blank">
                View public page
              </Button>
            )}
          </Stack>
        </Box>

        {/* Content — width contract:
            - `overflowY: auto` + `scrollbarGutter: stable` keep width identical between
              scrollable and non-scrollable sections (no ~17px scrollbar jitter).
            - `overflowX: hidden` + `minWidth: 0` are critical: MUI Grid container's
              negative margins (e.g. `spacing={3}` in MealsSection) extend the grid
              past its parent's content area. Without these, sections containing
              `<Grid container spacing=...>` visibly bleed wider than sections built
              with `<Stack>` (e.g. ScheduleSection). Clipping here pins every section
              to the same outer width. */}
        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, minWidth: 0, overflowY: "auto", overflowX: "hidden", scrollbarGutter: "stable" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default HackathonAdminLayout;
