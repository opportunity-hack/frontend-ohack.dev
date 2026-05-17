import React from "react";
import {
  Box,
  Button,
  Chip,
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

const SIDEBAR_WIDTH = 220;

const statusChipColor = (status) => {
  if (status === "draft") return "warning";
  if (status === "archived") return "default";
  return "success";
};

const SidebarContent = ({ activeSection, onPick, dirtySections }) => (
  <Box sx={{ width: SIDEBAR_WIDTH, py: 2 }}>
    <Typography variant="overline" sx={{ px: 2, color: "text.secondary", display: "block" }}>
      Sections
    </Typography>
    <List dense>
      {SECTIONS.map(({ slug, label, icon: Icon }) => {
        const active = activeSection === slug;
        const dirty = dirtySections?.has(slug);
        return (
          <ListItemButton
            key={slug}
            selected={active}
            onClick={() => onPick(slug)}
            sx={{
              mx: 1,
              borderRadius: 1,
              my: 0.25,
              "&.Mui-selected": {
                bgcolor: "primary.50",
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
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
      })}
    </List>
  </Box>
);

const BlogAdminLayout = ({
  post,
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

  const postId = post?.id;
  const title = post?.title || "Untitled post";
  const status = post?.status || "published";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 100px)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
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
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <SidebarContent
            activeSection={activeSection}
            onPick={onSelectSection}
            dirtySections={dirtySections}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            px: { xs: 2, md: 3 },
            py: 2.25,
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
          <Tooltip title="Back to blog list">
            <IconButton size="small" onClick={onBack} aria-label="Back">
              <BackIcon />
            </IconButton>
          </Tooltip>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {title}
            </Typography>
            <Chip
              label={status === "published" ? "Published" : status === "draft" ? "Draft" : "Archived"}
              size="small"
              color={statusChipColor(status)}
              variant={status === "draft" ? "filled" : "outlined"}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SaveIndicator saveState={saveState} dirtySections={dirtySections} />
            {postId && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<LaunchIcon />}
                href={`/blog/${postId}`}
                target="_blank"
              >
                View public page
              </Button>
            )}
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, overflowY: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default BlogAdminLayout;
