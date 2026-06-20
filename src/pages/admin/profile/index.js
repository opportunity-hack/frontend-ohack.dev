import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useDeferredValue,
} from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Avatar,
  Chip,
  Tooltip,
  Paper,
  Stack,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider,
  Badge as MuiBadge,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  AlertTitle,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  GitHub as GitHubIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Group as TeamIcon,
  AccessTime as AccessTimeIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CheckCircle as VerifiedIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Chat as SlackIcon,
  Google as GoogleIcon,
  VolunteerActivism as VolunteerIcon,
  Event as HackathonIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import AdminPage from "../../../components/admin/AdminPage";

// --- Auth provider / Slack helpers ---
const SLACK_PATTERN = /^oauth2\|slack\|([^-]+)-(.+)$/;

function getAuthProvider(userId) {
  if (!userId) return null;
  if (userId.startsWith("oauth2|slack|")) return "slack";
  if (userId.startsWith("oauth2|google-oauth2|")) return "google";
  if (userId.startsWith("oauth2|github|")) return "github";
  if (userId.startsWith("oauth2|")) return "oauth";
  return "propelauth";
}

function extractSlackUserId(userId) {
  if (!userId) return null;
  const match = SLACK_PATTERN.exec(userId);
  return match ? match[2] : null;
}

function getVolunteeringHours(profile) {
  if (!Array.isArray(profile.volunteering)) return 0;
  return profile.volunteering.reduce((sum, v) => sum + (v.hours || 0), 0);
}

function getHackathonCount(profile) {
  if (Array.isArray(profile.hackathons)) return profile.hackathons.length;
  return 0;
}

// Highlight matched substring in a string. Returns a fragment so it can be
// dropped into any text node. Case-insensitive single substring (matches
// today's filter behavior).
function highlightMatch(text, query) {
  if (text === null || text === undefined) return text;
  const t = String(text);
  const q = (query || "").trim();
  if (!q) return t;
  const idx = t.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return t;
  return (
    <>
      {t.slice(0, idx)}
      <mark style={{ backgroundColor: "#fff59d", padding: 0, color: "inherit" }}>
        {t.slice(idx, idx + q.length)}
      </mark>
      {t.slice(idx + q.length)}
    </>
  );
}

// Build a Slack profile URL from a Slack user id. Workspace is hardcoded —
// flag if we ever rename it.
function buildSlackProfileUrl(slackUserId) {
  if (!slackUserId) return null;
  return `https://opportunity-hack.slack.com/team/${slackUserId}`;
}

const StyledCard = styled(Card)(({ theme, completeness }) => {
  const getCompletenessColor = (score) => {
    if (score >= 6) return theme.palette.success.main;
    if (score >= 4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  return {
    height: "100%",
    position: "relative",
    transition: "all 0.25s ease",
    borderLeft: `4px solid ${getCompletenessColor(completeness)}`,
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[6],
      borderLeftColor: theme.palette.primary.main,
    },
  };
});

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  height: 22,
  fontSize: "0.72rem",
}));

const KbdChip = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: theme.spacing(0.25, 0.75),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  fontSize: "0.7rem",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
  lineHeight: 1.4,
}));

// Per-row quick actions. Stops propagation so clicking an action never opens
// the row's primary link.
function QuickActions({ user, onCopy, dense }) {
  const slackId = extractSlackUserId(user.user_id);
  const slackHref = buildSlackProfileUrl(slackId);
  const stop = (e) => e.stopPropagation();
  const size = dense ? "small" : "small";
  const fontSize = dense ? 16 : 18;
  return (
    <Stack
      direction="row"
      spacing={0.25}
      onClick={stop}
      onKeyDown={stop}
      sx={{ alignItems: "center" }}
    >
      <Tooltip title="Copy email">
        <span>
          <IconButton
            size={size}
            aria-label="Copy email"
            disabled={!user.email_address}
            onClick={() => {
              if (!user.email_address) return;
              navigator.clipboard?.writeText(user.email_address);
              onCopy && onCopy("Email copied");
            }}
          >
            <EmailIcon sx={{ fontSize }} />
          </IconButton>
        </span>
      </Tooltip>
      {slackId && (
        <Tooltip title={`Copy Slack ID (${slackId})`}>
          <IconButton
            size={size}
            aria-label="Copy Slack ID"
            onClick={() => {
              navigator.clipboard?.writeText(slackId);
              onCopy && onCopy("Slack ID copied");
            }}
          >
            <ContentCopyIcon sx={{ fontSize }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Open public profile">
        <IconButton
          size={size}
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href={`/profile/${user.id}`}
          aria-label="Open public profile in new tab"
        >
          <PersonIcon sx={{ fontSize }} />
        </IconButton>
      </Tooltip>
      {slackHref && (
        <Tooltip title="Open in Slack">
          <IconButton
            size={size}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={slackHref}
            aria-label="Open in Slack"
          >
            <SlackIcon sx={{ fontSize, color: "#4A154B" }} />
          </IconButton>
        </Tooltip>
      )}
      {user.linkedin_url && (
        <Tooltip title="Open LinkedIn">
          <IconButton
            size={size}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={user.linkedin_url}
            aria-label="Open LinkedIn"
          >
            <LinkedInIcon sx={{ fontSize, color: "#0A66C2" }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="View volunteer record">
        <span>
          <IconButton
            size={size}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={`/admin/volunteer?filter=${encodeURIComponent(user.email_address || "")}`}
            aria-label="View volunteer record"
            disabled={!user.email_address}
          >
            <VolunteerIcon sx={{ fontSize }} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

const SETUP_DISMISS_KEY = "ohack.adminProfile.setupHelpDismissed";
const VIEW_MODE_KEY = "ohack.adminProfile.viewMode";
const LIST_TOAST_KEY = "ohack.adminProfile.listToastSeen";

// Render cap: filtering runs across the full dataset (~3.5k profiles), but only
// this many rows mount in the DOM. Rendering everything at once froze the page
// on load and on every keystroke.
const INITIAL_VISIBLE_ROWS = 100;
const VISIBLE_ROWS_STEP = 200;

const AdminProfilePage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("last_login");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("list"); // SSR-safe default
  const [statsOpen, setStatsOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [expandedCards, setExpandedCards] = useState(() => new Set());
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ROWS);
  const [linkedInOnly, setLinkedInOnly] = useState(false);

  // Keystrokes update `filter` (and the TextField) immediately; the expensive
  // filter + list re-render tracks this deferred copy at low priority.
  const deferredFilter = useDeferredValue(filter);
  const isFilterPending = filter !== deferredFilter;

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("profile.admin");
  const orgId = org?.orgId;

  // Refs for URL sync + keyboard
  const initFromUrlRef = useRef(false);
  const lastUrlQRef = useRef("");
  const filterRef = useRef("");
  const searchRef = useRef(null);
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // --- Hydrate view mode + setup banner from localStorage (after mount) ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedView = localStorage.getItem(VIEW_MODE_KEY);
      if (savedView === "list" || savedView === "grid") {
        setViewMode(savedView);
      }
      if (!localStorage.getItem(SETUP_DISMISS_KEY)) {
        setShowSetup(true);
      }
    } catch (_) {
      // localStorage can throw in private mode / cross-origin; ignore.
    }
  }, []);

  const dismissSetup = () => {
    setShowSetup(false);
    try {
      localStorage.setItem(SETUP_DISMISS_KEY, "1");
    } catch (_) {}
  };

  const handleViewMode = (_e, v) => {
    if (!v) return;
    setViewMode(v);
    try {
      localStorage.setItem(VIEW_MODE_KEY, v);
    } catch (_) {}
    // First-time list-default toast.
    try {
      if (v === "list" && !localStorage.getItem(LIST_TOAST_KEY)) {
        localStorage.setItem(LIST_TOAST_KEY, "1");
      }
    } catch (_) {}
  };

  // --- Debounced URL writer ---
  // NOTE: ?q= is load-bearing for the Chrome `ohadmin` site-search shortcut.
  // Do not redirect to /admin/profile without preserving query params.
  const writeQToUrl = useMemo(
    () =>
      debounce((q) => {
        const next = { ...router.query };
        if (q) next.q = q;
        else delete next.q;
        lastUrlQRef.current = q;
        router.replace(
          { pathname: router.pathname, query: next },
          undefined,
          { shallow: true, scroll: false }
        );
      }, 250),
    // We intentionally do not include router.query in deps — it changes when we
    // write, which would re-create the debouncer and drop pending writes.
    [router.pathname] // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => () => writeQToUrl.cancel(), [writeQToUrl]);

  // --- Hydrate `filter` from URL once on first router-ready render ---
  useEffect(() => {
    if (!router.isReady || initFromUrlRef.current) return;
    initFromUrlRef.current = true;
    const q = typeof router.query.q === "string" ? router.query.q : "";
    if (q) {
      setFilter(q);
      lastUrlQRef.current = q;
    }
  }, [router.isReady, router.query.q]);

  // --- React to back/forward (skip echoes from our own writes) ---
  useEffect(() => {
    if (!initFromUrlRef.current) return;
    const urlQ = typeof router.query.q === "string" ? router.query.q : "";
    if (urlQ !== lastUrlQRef.current && urlQ !== filterRef.current) {
      setFilter(urlQ);
      lastUrlQRef.current = urlQ;
    }
  }, [router.query.q]);

  const onSearchChange = (e) => {
    const v = e.target.value;
    setFilter(v);
    writeQToUrl(v);
  };

  const clearSearch = () => {
    setFilter("");
    writeQToUrl.cancel();
    writeQToUrl("");
    searchRef.current?.focus();
  };

  // --- Global keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e) => {
      const active = typeof document !== "undefined" ? document.activeElement : null;
      const tag = active?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        active?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select?.();
        return;
      }
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (filterRef.current) {
          clearSearch();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // clearSearch is stable enough (only depends on writeQToUrl which is memoized)
  }, [writeQToUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Autofocus search box only when no ?q= is set (don't steal focus from
  // a deep-linked search where the user is already reading results) ---
  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.q) {
      // Defer to next tick so React renders the input first.
      const id = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Data fetch ---
  const fetchProfiles = useCallback(async () => {
    if (!accessToken || !orgId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/admin/profiles`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
      } else {
        throw new Error("Failed to fetch user profiles");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch user profiles. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId]);

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin, fetchProfiles]);

  // --- Helpers ---
  const calculateProfileCompleteness = (profile) => {
    const fields = ["role", "expertise", "education", "shirt_size", "github", "company", "why"];
    return fields.filter(
      (f) =>
        profile[f] &&
        (Array.isArray(profile[f]) ? profile[f].length > 0 : profile[f] !== "")
    ).length;
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "Never";
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getCompletenessColor = (score) => {
    if (score >= 6) return "success";
    if (score >= 4) return "warning";
    return "error";
  };
  const getCompletenessLabel = (score) => {
    if (score >= 6) return "Complete";
    if (score >= 4) return "Partial";
    return "Incomplete";
  };

  // --- Filter + sort (keyed on the deferred filter so typing stays smooth) ---
  const processedProfiles = useMemo(() => {
    let filtered = profiles;
    if (linkedInOnly) {
      filtered = filtered.filter((p) => !!p.linkedin_url);
    }
    if (deferredFilter) {
      const q = deferredFilter.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.email_address?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.nickname?.toLowerCase().includes(q) ||
          p.github?.toLowerCase().includes(q) ||
          p.company?.toLowerCase().includes(q) ||
          p.education?.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q) ||
          (Array.isArray(p.expertise) && p.expertise.some((e) => e.toLowerCase().includes(q))) ||
          p.shirt_size?.toLowerCase().includes(q) ||
          p.why?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.linkedin_url?.toLowerCase().includes(q) ||
          p.instagram_url?.toLowerCase().includes(q) ||
          (extractSlackUserId(p.user_id) || "").toLowerCase().includes(q) ||
          (getAuthProvider(p.user_id) || "").toLowerCase().includes(q)
      );
    }
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aV, bV;
      switch (sortBy) {
        case "name":
          aV = (a.name || "").toLowerCase();
          bV = (b.name || "").toLowerCase();
          break;
        case "email":
          aV = (a.email_address || "").toLowerCase();
          bV = (b.email_address || "").toLowerCase();
          break;
        case "last_login":
          aV = new Date(a.last_login || 0);
          bV = new Date(b.last_login || 0);
          break;
        case "completeness":
          aV = calculateProfileCompleteness(a);
          bV = calculateProfileCompleteness(b);
          break;
        case "badges":
          aV = Array.isArray(a.badges) ? a.badges.length : 0;
          bV = Array.isArray(b.badges) ? b.badges.length : 0;
          break;
        case "teams":
          aV = Array.isArray(a.teams) ? a.teams.length : 0;
          bV = Array.isArray(b.teams) ? b.teams.length : 0;
          break;
        case "hackathons":
          aV = getHackathonCount(a);
          bV = getHackathonCount(b);
          break;
        case "volunteering":
          aV = getVolunteeringHours(a);
          bV = getVolunteeringHours(b);
          break;
        default:
          return 0;
      }
      if (aV < bV) return sortOrder === "asc" ? -1 : 1;
      if (aV > bV) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [profiles, deferredFilter, sortBy, sortOrder, linkedInOnly]);

  // Reset the render cap whenever the result set changes shape.
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_ROWS);
  }, [deferredFilter, sortBy, sortOrder, viewMode, linkedInOnly]);

  // --- Best-match detection ---
  const bestMatch = useMemo(() => {
    if (!deferredFilter || processedProfiles.length === 0) return null;
    const q = deferredFilter.trim().toLowerCase();
    if (!q) return null;
    if (processedProfiles.length === 1) return processedProfiles[0];
    const exact = processedProfiles.find(
      (p) =>
        p.email_address?.toLowerCase() === q ||
        p.name?.toLowerCase() === q ||
        p.nickname?.toLowerCase() === q
    );
    if (exact) return exact;
    if (q.includes("@")) {
      const emailMatches = processedProfiles.filter((p) =>
        p.email_address?.toLowerCase().includes(q)
      );
      if (emailMatches.length === 1) return emailMatches[0];
    }
    return null;
  }, [deferredFilter, processedProfiles]);

  // --- Aggregate stats (memoized so we don't re-walk the array on every render) ---
  const stats = useMemo(() => {
    const total = profiles.length;
    let complete = 0;
    let withBadges = 0;
    let inTeams = 0;
    let slack = 0;
    let google = 0;
    let hackathonsP = 0;
    let withHours = 0;
    for (const p of profiles) {
      if (calculateProfileCompleteness(p) >= 6) complete++;
      if (Array.isArray(p.badges) && p.badges.length > 0) withBadges++;
      if (Array.isArray(p.teams) && p.teams.length > 0) inTeams++;
      const prov = getAuthProvider(p.user_id);
      if (prov === "slack") slack++;
      if (prov === "google") google++;
      if (getHackathonCount(p) > 0) hackathonsP++;
      if (getVolunteeringHours(p) > 0) withHours++;
    }
    return { total, complete, withBadges, inTeams, slack, google, hackathonsP, withHours };
  }, [profiles]);

  const handleSnackbarClose = () => setSnackbar((s) => ({ ...s, open: false }));
  const showToast = useCallback(
    (message, severity = "success") => setSnackbar({ open: true, message, severity }),
    []
  );

  const toggleCardExpand = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onRowKeyDown = (e, profile) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.open(`/profile/${profile.id}`, "_blank", "noopener,noreferrer");
    } else if (e.key === " ") {
      e.preventDefault();
      window.open(`/profile/${profile.id}`, "_blank", "noopener,noreferrer");
    }
    // Shift+Enter is handled before Enter due to JS keyboard semantics.
    if (e.shiftKey && e.key === "Enter" && profile.email_address) {
      navigator.clipboard?.writeText(profile.email_address);
      showToast("Email copied");
    }
  };

  if (!isAdmin) {
    return (
      <AdminPage title="User Profiles" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const totalUsers = profiles.length;
  const matchCount = processedProfiles.length;
  const hasQuery = !!filter;
  const isDefaultSort = sortBy === "last_login" && sortOrder === "desc";

  // Only mount the top slice — the full match count still reflects everything.
  const visibleProfiles =
    matchCount > visibleCount
      ? processedProfiles.slice(0, visibleCount)
      : processedProfiles;
  const hiddenCount = matchCount - visibleProfiles.length;

  // The "matches pills" strip — shown when 2..5 results to help disambiguate
  // without scrolling.
  const showMatchPills = hasQuery && matchCount >= 2 && matchCount <= 5;

  return (
    <AdminPage
      title="User Profiles"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      {/* Setup-help banner */}
      <Collapse in={showSetup}>
        <Alert
          severity="info"
          icon={<SearchIcon />}
          action={
            <Button color="inherit" size="small" onClick={dismissSetup} aria-label="Hide setup tip">
              Got it
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle sx={{ mb: 0.25 }}>Faster search from the Chrome address bar</AlertTitle>
          <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
            Open <code>chrome://settings/searchEngines</code> → Site search → Add → Name{" "}
            <b>OHack Admin Profile</b>, Shortcut <b>ohadmin</b>, URL{" "}
            <code>https://www.ohack.dev/admin/profile?q=%s</code>. Then type{" "}
            <KbdChip>ohadmin</KbdChip> <KbdChip>Tab</KbdChip> <i>name or email</i> from any tab.
          </Typography>
        </Alert>
      </Collapse>

      {/* Sticky search bar */}
      <Paper
        elevation={2}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          mb: 2,
          px: 2,
          py: 1.75,
          backgroundColor: "background.paper",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
          <TextField
            inputRef={searchRef}
            fullWidth
            value={filter}
            onChange={onSearchChange}
            placeholder="Search by name, email, Slack ID, GitHub, company…"
            size="medium"
            autoComplete="off"
            spellCheck={false}
            inputProps={{
              "aria-label": "Search users",
              role: "searchbox",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {filter ? (
                    <Tooltip title="Clear search (Esc)">
                      <IconButton
                        size="small"
                        onClick={clearSearch}
                        aria-label="Clear search"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    !isMobile && (
                      <Tooltip title="Focus search (⌘K or /)">
                        <Box component="span" sx={{ display: "inline-flex" }}>
                          <KbdChip>⌘K</KbdChip>
                        </Box>
                      </Tooltip>
                    )
                  )}
                </InputAdornment>
              ),
              sx: { fontSize: "1rem" },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchProfiles} aria-label="Refresh profiles" size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewMode}
              size="small"
              aria-label="View mode"
            >
              <ToggleButton value="list" aria-label="Compact list view">
                <Tooltip title="Compact list">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid" aria-label="Card grid view">
                <Tooltip title="Card grid">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {/* Active-filter row */}
        <Box
          sx={{
            mt: 1.25,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            role="status"
            aria-live="polite"
            sx={{ fontWeight: 500 }}
          >
            {loading
              ? "Loading users…"
              : isFilterPending
                ? "Filtering…"
                : hasQuery
                  ? `Showing ${matchCount.toLocaleString()} of ${totalUsers.toLocaleString()}`
                  : `${totalUsers.toLocaleString()} users`}
          </Typography>

          {hasQuery && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`q: ${filter}`}
              onDelete={clearSearch}
            />
          )}

          {!isDefaultSort && (
            <Chip
              size="small"
              variant="outlined"
              label={`sort: ${sortBy} (${sortOrder})`}
              onDelete={() => {
                setSortBy("last_login");
                setSortOrder("desc");
              }}
            />
          )}

          <Chip
            size="small"
            icon={<LinkedInIcon sx={{ fontSize: 14, color: linkedInOnly ? "#fff" : "#0A66C2" }} />}
            label="Has LinkedIn"
            color={linkedInOnly ? "primary" : "default"}
            variant={linkedInOnly ? "filled" : "outlined"}
            onClick={() => setLinkedInOnly((v) => !v)}
            onDelete={linkedInOnly ? () => setLinkedInOnly(false) : undefined}
            sx={{ cursor: "pointer" }}
          />

          <Box sx={{ flex: 1 }} />

          {/* Sort controls */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="last_login">Last login</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="completeness">Profile completeness</MenuItem>
              <MenuItem value="badges">Badges</MenuItem>
              <MenuItem value="teams">Teams</MenuItem>
              <MenuItem value="hackathons">Hackathons</MenuItem>
              <MenuItem value="volunteering">Volunteer hours</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Order"
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            variant="text"
            endIcon={statsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setStatsOpen((v) => !v)}
            aria-expanded={statsOpen}
            aria-controls="stats-grid"
          >
            {statsOpen ? "Hide stats" : "Show stats"}
          </Button>
        </Box>
      </Paper>

      {/* Compact stats chip strip (always visible, low density) */}
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1,
          mb: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          fontSize: "0.85rem",
        }}
      >
        <Chip
          size="small"
          label={`${stats.total.toLocaleString()} users`}
          color="primary"
          variant="outlined"
        />
        <Chip size="small" label={`${stats.complete.toLocaleString()} complete`} />
        <Chip size="small" label={`${stats.inTeams.toLocaleString()} in teams`} />
        <Chip size="small" label={`${stats.withBadges.toLocaleString()} with badges`} />
        <Chip size="small" label={`${stats.slack.toLocaleString()} Slack`} />
        <Chip size="small" label={`${stats.google.toLocaleString()} Google`} />
        <Chip
          size="small"
          label={`${stats.hackathonsP.toLocaleString()} hackathon participants`}
        />
        <Chip size="small" label={`${stats.withHours.toLocaleString()} volunteer hours`} />
      </Paper>

      {/* Expanded stats grid (disclosed) */}
      <Collapse in={statsOpen}>
        <Paper id="stats-grid" sx={{ p: 3, mb: 2 }}>
          <Grid container spacing={3}>
            {[
              { label: "Total Users", value: stats.total, color: "primary" },
              { label: "Complete Profiles", value: stats.complete, color: "success.main" },
              { label: "Users with Badges", value: stats.withBadges, color: "info.main" },
              { label: "Users in Teams", value: stats.inTeams, color: "secondary.main" },
            ].map((s) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" sx={{ color: s.color }}>
                    {s.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ color: "#4A154B" }}>
                  {stats.slack.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slack Connected
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ color: "#DB4437" }}>
                  {stats.google.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Google Sign-In
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" color="warning.main">
                  {stats.hackathonsP.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hackathon Participants
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" color="text.secondary">
                  {stats.withHours.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Volunteer Hours
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Loading / empty / best-match / results */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : matchCount === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          {hasQuery ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No users match{" "}
                <Box component="code" sx={{ px: 0.5, bgcolor: "action.hover", borderRadius: 0.5 }}>
                  {filter}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try a partial match. Searchable fields include: email · name · Slack ID · GitHub ·
                company · education · expertise · role.
              </Typography>
              <Button variant="outlined" onClick={clearSearch}>
                Clear search
              </Button>
            </>
          ) : (
            <Typography variant="h6" color="text.secondary">
              No user profiles found
            </Typography>
          )}
        </Paper>
      ) : (
        <>
          {/* Best-match hero */}
          {bestMatch && (
            <BestMatchHero
              user={bestMatch}
              query={deferredFilter}
              calculateProfileCompleteness={calculateProfileCompleteness}
              getCompletenessColor={getCompletenessColor}
              getCompletenessLabel={getCompletenessLabel}
              formatLastLogin={formatLastLogin}
              showToast={showToast}
            />
          )}

          {/* Match pills strip (2-5 matches) */}
          {showMatchPills && (
            <Paper
              variant="outlined"
              sx={{
                px: 2,
                py: 1,
                mb: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
              }}
              aria-label="All matches"
            >
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                All matches:
              </Typography>
              {processedProfiles.map((p) => (
                <Chip
                  key={p.id || p.email_address}
                  size="small"
                  avatar={
                    <Avatar src={p.profile_image} alt="">
                      {(p.name || p.nickname || "?").charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={p.name || p.nickname || p.email_address || "Unknown"}
                  component="a"
                  clickable
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/profile/${p.id}`}
                />
              ))}
            </Paper>
          )}

          {/* Results */}
          <Box component="section" aria-label="Search results">
            {viewMode === "list" ? (
              <CompactList
                profiles={visibleProfiles}
                filter={deferredFilter}
                isMobile={isMobile}
                bestMatchId={bestMatch?.id}
                calculateProfileCompleteness={calculateProfileCompleteness}
                getCompletenessColor={getCompletenessColor}
                formatLastLogin={formatLastLogin}
                showToast={showToast}
                onRowKeyDown={onRowKeyDown}
              />
            ) : (
              <CardGrid
                profiles={visibleProfiles}
                filter={deferredFilter}
                bestMatchId={bestMatch?.id}
                expandedCards={expandedCards}
                toggleCardExpand={toggleCardExpand}
                calculateProfileCompleteness={calculateProfileCompleteness}
                getCompletenessColor={getCompletenessColor}
                getCompletenessLabel={getCompletenessLabel}
                formatLastLogin={formatLastLogin}
                showToast={showToast}
              />
            )}
          </Box>

          {/* Render-cap footer */}
          {hiddenCount > 0 && (
            <Paper
              variant="outlined"
              sx={{
                mt: 2,
                px: 2,
                py: 1.5,
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing first {visibleProfiles.length.toLocaleString()} of{" "}
                {matchCount.toLocaleString()} — refine your search, or
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setVisibleCount((c) => c + VISIBLE_ROWS_STEP)}
              >
                Show {Math.min(VISIBLE_ROWS_STEP, hiddenCount).toLocaleString()} more
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => setVisibleCount(matchCount)}
              >
                Show all {matchCount.toLocaleString()}
              </Button>
            </Paper>
          )}
        </>
      )}
    </AdminPage>
  );
});

// ============================================================================
// BestMatchHero
// ============================================================================
function BestMatchHero({
  user,
  query,
  calculateProfileCompleteness,
  getCompletenessColor,
  getCompletenessLabel,
  formatLastLogin,
  showToast,
}) {
  const completeness = calculateProfileCompleteness(user);
  const slackId = extractSlackUserId(user.user_id);
  const teamCount = Array.isArray(user.teams) ? user.teams.length : 0;
  const hackathonCount = getHackathonCount(user);

  return (
    <Paper
      component="section"
      aria-label="Best match"
      elevation={3}
      sx={{
        p: 2.5,
        mb: 2,
        borderLeft: 4,
        borderColor: "primary.main",
        background: (t) =>
          `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${alpha(
            t.palette.primary.main,
            0.02
          )} 100%)`,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Avatar
          src={user.profile_image}
          alt={user.name || user.nickname}
          sx={{ width: 72, height: 72, fontSize: "1.5rem" }}
        >
          {(user.name || user.nickname || "?").charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Chip
              icon={<StarIcon sx={{ fontSize: 14 }} />}
              label="Best match"
              size="small"
              color="primary"
            />
            {completeness >= 6 && (
              <Tooltip title="Complete profile">
                <VerifiedIcon color="success" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {highlightMatch(user.name || user.nickname || "Unknown", query)}
          </Typography>
          {user.email_address && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {highlightMatch(user.email_address, query)}
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.5 }}
            alignItems="center"
          >
            {slackId && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <SlackIcon sx={{ fontSize: 14, color: "#4A154B" }} />
                <Typography variant="caption" color="text.secondary">
                  {highlightMatch(slackId, query)}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTimeIcon sx={{ fontSize: 14 }} color="action" />
              <Typography variant="caption" color="text.secondary">
                {formatLastLogin(user.last_login)}
              </Typography>
            </Stack>
            {teamCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TeamIcon sx={{ fontSize: 14 }} color="secondary" />
                <Typography variant="caption">
                  {teamCount} team{teamCount !== 1 ? "s" : ""}
                </Typography>
              </Stack>
            )}
            {hackathonCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <HackathonIcon sx={{ fontSize: 14 }} color="warning" />
                <Typography variant="caption">
                  {hackathonCount} hackathon{hackathonCount !== 1 ? "s" : ""}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Box sx={{ mt: 1.25, maxWidth: 360 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Profile completeness
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {completeness}/7 · {getCompletenessLabel(completeness)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(completeness / 7) * 100}
              color={getCompletenessColor(completeness)}
              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
            />
          </Box>
        </Box>
        <Stack
          direction={{ xs: "row", sm: "column" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
        >
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon />}
            component="a"
            href={`/profile/${user.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open profile
          </Button>
          <QuickActions user={user} onCopy={showToast} />
        </Stack>
      </Stack>
    </Paper>
  );
}

// ============================================================================
// CompactList — default view
// ============================================================================
function CompactList({
  profiles,
  filter,
  isMobile,
  bestMatchId,
  calculateProfileCompleteness,
  getCompletenessColor,
  formatLastLogin,
  showToast,
  onRowKeyDown,
}) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="User profiles">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 48 }} />
            <TableCell>Name</TableCell>
            {!isMobile && <TableCell>Email</TableCell>}
            {!isMobile && <TableCell sx={{ width: 140 }}>Slack</TableCell>}
            {!isMobile && <TableCell sx={{ width: 110 }}>Last login</TableCell>}
            {!isMobile && <TableCell sx={{ width: 130 }}>Profile</TableCell>}
            <TableCell align="right" sx={{ width: isMobile ? 100 : 220 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {profiles.map((profile) => {
            const completeness = calculateProfileCompleteness(profile);
            const completenessPct = Math.round((completeness / 7) * 100);
            const slackId = extractSlackUserId(profile.user_id);
            const provider = getAuthProvider(profile.user_id);
            const isBest = bestMatchId && profile.id === bestMatchId;
            return (
              <TableRow
                key={profile.id || profile.email_address}
                hover
                tabIndex={0}
                onKeyDown={(e) => onRowKeyDown(e, profile)}
                sx={{
                  cursor: "default",
                  ...(isBest && {
                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.04),
                  }),
                  "&:focus-visible": {
                    outline: (t) => `2px solid ${t.palette.primary.main}`,
                    outlineOffset: -2,
                  },
                }}
              >
                <TableCell>
                  <Avatar
                    src={profile.profile_image}
                    alt=""
                    sx={{ width: 32, height: 32, fontSize: "0.8rem" }}
                  >
                    {(profile.name || profile.nickname || "?").charAt(0).toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <MuiLink
                      href={`/profile/${profile.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{ fontWeight: 600, color: "text.primary", minWidth: 0 }}
                    >
                      {highlightMatch(profile.name || profile.nickname || "Unknown", filter)}
                    </MuiLink>
                    {completeness >= 6 && (
                      <Tooltip title="Complete profile">
                        <VerifiedIcon color="success" sx={{ fontSize: 14 }} />
                      </Tooltip>
                    )}
                    {provider === "google" && (
                      <Tooltip title="Google sign-in">
                        <GoogleIcon sx={{ fontSize: 14, color: "#DB4437" }} />
                      </Tooltip>
                    )}
                    {provider === "slack" && (
                      <Tooltip title="Slack sign-in">
                        <SlackIcon sx={{ fontSize: 14, color: "#4A154B" }} />
                      </Tooltip>
                    )}
                  </Stack>
                  {isMobile && profile.email_address && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {highlightMatch(profile.email_address, filter)}
                    </Typography>
                  )}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {highlightMatch(profile.email_address || "—", filter)}
                    </Typography>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    {slackId ? (
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: "ui-monospace, monospace", color: "#4A154B" }}
                      >
                        {highlightMatch(slackId, filter)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatLastLogin(profile.last_login)}
                    </Typography>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Tooltip title={`${completeness}/7 fields complete`}>
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={completenessPct}
                          color={getCompletenessColor(completeness)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            color: "text.secondary",
                            display: "block",
                            mt: 0.25,
                          }}
                        >
                          {completenessPct}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                )}
                <TableCell align="right">
                  <QuickActions user={profile} onCopy={showToast} dense />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ============================================================================
// CardGrid — opt-in view, trimmed density with per-card expand
// ============================================================================
function CardGrid({
  profiles,
  filter,
  bestMatchId,
  expandedCards,
  toggleCardExpand,
  calculateProfileCompleteness,
  getCompletenessColor,
  getCompletenessLabel,
  formatLastLogin,
  showToast,
}) {
  return (
    <Grid container spacing={2}>
      {profiles.map((profile) => {
        const completeness = calculateProfileCompleteness(profile);
        const badgeCount = Array.isArray(profile.badges) ? profile.badges.length : 0;
        const teamCount = Array.isArray(profile.teams) ? profile.teams.length : 0;
        const slackId = extractSlackUserId(profile.user_id);
        const hackathonCount = getHackathonCount(profile);
        const volunteerHours = getVolunteeringHours(profile);
        const expanded = expandedCards.has(profile.id);
        const isBest = bestMatchId && profile.id === bestMatchId;
        return (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={profile.id || profile.email_address}>
            <StyledCard
              completeness={completeness}
              sx={isBest ? { outline: (t) => `2px solid ${t.palette.primary.light}` } : undefined}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5 }}>
                  <MuiBadge
                    badgeContent={badgeCount}
                    color="primary"
                    max={99}
                    invisible={badgeCount === 0}
                    overlap="circular"
                  >
                    <ProfileAvatar src={profile.profile_image} alt={profile.name || ""}>
                      {(profile.name || profile.nickname || "?").charAt(0).toUpperCase()}
                    </ProfileAvatar>
                  </MuiBadge>
                  <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
                      <MuiLink
                        href={`/profile/${profile.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          fontSize: "1rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          minWidth: 0,
                        }}
                      >
                        {highlightMatch(profile.name || profile.nickname || "Unknown", filter)}
                      </MuiLink>
                      {completeness >= 6 && (
                        <Tooltip title="Complete profile">
                          <VerifiedIcon color="success" fontSize="small" />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {highlightMatch(profile.email_address || "—", filter)}
                    </Typography>
                    {slackId && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "ui-monospace, monospace",
                          color: "#4A154B",
                          mt: 0.25,
                          display: "inline-block",
                        }}
                      >
                        slack: {highlightMatch(slackId, filter)}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {formatLastLogin(profile.last_login)}
                    </Typography>
                  </Stack>
                  {teamCount > 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TeamIcon fontSize="small" color="secondary" />
                      <Typography variant="caption">{teamCount}</Typography>
                    </Stack>
                  )}
                  {hackathonCount > 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <HackathonIcon fontSize="small" color="warning" />
                      <Typography variant="caption">{hackathonCount}</Typography>
                    </Stack>
                  )}
                  {volunteerHours > 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <VolunteerIcon fontSize="small" sx={{ color: "#e91e63" }} />
                      <Typography variant="caption">{volunteerHours}h</Typography>
                    </Stack>
                  )}
                </Stack>

                <Box sx={{ mb: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Completeness
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {completeness}/7 · {getCompletenessLabel(completeness)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(completeness / 7) * 100}
                    color={getCompletenessColor(completeness)}
                    sx={{ height: 5, borderRadius: 3, mt: 0.5 }}
                  />
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                  {profile.role && (
                    <InfoChip
                      icon={<WorkIcon sx={{ fontSize: 14 }} />}
                      label={highlightMatch(profile.role, filter)}
                      variant="outlined"
                    />
                  )}
                  {profile.company && (
                    <InfoChip
                      icon={<BusinessIcon sx={{ fontSize: 14 }} />}
                      label={highlightMatch(profile.company, filter)}
                      variant="outlined"
                    />
                  )}
                  {profile.education && (
                    <InfoChip
                      icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                      label={highlightMatch(profile.education, filter)}
                      variant="outlined"
                    />
                  )}
                  {Array.isArray(profile.expertise) &&
                    profile.expertise.slice(0, 3).map((exp, idx) => (
                      <InfoChip
                        key={idx}
                        icon={<CodeIcon sx={{ fontSize: 14 }} />}
                        label={highlightMatch(exp, filter)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  {Array.isArray(profile.expertise) && profile.expertise.length > 3 && (
                    <Tooltip title={profile.expertise.slice(3).join(", ")}>
                      <InfoChip
                        label={`+${profile.expertise.length - 3}`}
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <QuickActions user={profile} onCopy={showToast} dense />
                  <Button
                    size="small"
                    onClick={() => toggleCardExpand(profile.id)}
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    {expanded ? "Less" : "More"}
                  </Button>
                </Stack>

                <Collapse in={expanded} unmountOnExit>
                  <Divider sx={{ my: 1.5 }} />
                  {(profile.github || profile.linkedin_url || profile.instagram_url) && (
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                      {profile.github && (
                        <Tooltip title={`GitHub: ${profile.github}`}>
                          <IconButton
                            size="small"
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://github.com/${profile.github}`}
                            sx={{ color: "#333" }}
                            aria-label="Open GitHub"
                          >
                            <GitHubIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {profile.linkedin_url && (
                        <Tooltip title="LinkedIn">
                          <IconButton
                            size="small"
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={profile.linkedin_url}
                            sx={{ color: "#0A66C2" }}
                            aria-label="Open LinkedIn"
                          >
                            <LinkedInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {profile.instagram_url && (
                        <Tooltip title="Instagram">
                          <IconButton
                            size="small"
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={profile.instagram_url}
                            sx={{ color: "#E4405F" }}
                            aria-label="Open Instagram"
                          >
                            <InstagramIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  )}
                  {profile.why && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic", lineHeight: 1.55 }}
                    >
                      “{profile.why}”
                    </Typography>
                  )}
                  {(badgeCount > 0 || teamCount > 0 || hackathonCount > 0 || volunteerHours > 0) && (
                    <Stack direction="row" spacing={2} sx={{ mt: 1.25 }}>
                      {badgeCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          🏆 {badgeCount} badge{badgeCount !== 1 ? "s" : ""}
                        </Typography>
                      )}
                      {teamCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          👥 {teamCount} team{teamCount !== 1 ? "s" : ""}
                        </Typography>
                      )}
                      {hackathonCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          🎯 {hackathonCount} hackathon{hackathonCount !== 1 ? "s" : ""}
                        </Typography>
                      )}
                      {volunteerHours > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          ⏱ {volunteerHours}h volunteered
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Collapse>
              </CardContent>
            </StyledCard>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default AdminProfilePage;
