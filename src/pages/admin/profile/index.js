import React, { useState, useEffect, useMemo } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import { useRouter } from "next/router";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
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
  EmojiEvents as BadgeIcon,
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
} from "@mui/icons-material";
import { styled } from "@mui/system";
import AdminPage from "../../../components/admin/AdminPage";

const StyledCard = styled(Card)(({ theme, completeness }) => {
  const getCompletenessColor = (score) => {
    if (score >= 6) return theme.palette.success.main;
    if (score >= 4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return {
    height: "100%",
    position: "relative",
    transition: "all 0.3s ease",
    borderLeft: `4px solid ${getCompletenessColor(completeness)}`,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[8],
      borderLeftColor: theme.palette.primary.main,
    },
  };
});

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  height: 24,
  fontSize: "0.75rem",
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  borderRadius: theme.shape.borderRadius,
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.75),
  minWidth: 36,
  minHeight: 36,
  "&:hover": {
    transform: "scale(1.15)",
  },
  transition: "transform 0.2s ease",
}));

const CompactRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: "background-color 0.15s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    flexWrap: "wrap",
  },
}));

const AdminProfilePage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
  const [viewMode, setViewMode] = useState("card");

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("profile.admin");
  const orgId = org.orgId;

  const fetchProfiles = async () => {
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
        console.log("Profiles: ", data.profiles);
        setProfiles(data.profiles);
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
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin, accessToken]);

  const calculateProfileCompleteness = (profile) => {
    const fields = [
      "role",
      "expertise",
      "education",
      "shirt_size",
      "github",
      "company",
      "why",
    ];
    const filledFields = fields.filter(
      (field) => profile[field] && (Array.isArray(profile[field]) ? profile[field].length > 0 : profile[field] !== "")
    );
    return filledFields.length;
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "Never";

    const date = new Date(lastLogin);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

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

  const processedProfiles = useMemo(() => {
    let filtered = profiles;

    // Apply text filter
    if (filter) {
      const searchLower = filter.toLowerCase();
      filtered = filtered.filter(
        (profile) =>
          profile.email_address?.toLowerCase().includes(searchLower) ||
          profile.name?.toLowerCase().includes(searchLower) ||
          profile.nickname?.toLowerCase().includes(searchLower) ||
          profile.github?.toLowerCase().includes(searchLower) ||
          profile.company?.toLowerCase().includes(searchLower) ||
          profile.education?.toLowerCase().includes(searchLower) ||
          profile.role?.toLowerCase().includes(searchLower) ||
          (Array.isArray(profile.expertise) &&
            profile.expertise.some((exp) =>
              exp.toLowerCase().includes(searchLower)
            )) ||
          profile.shirt_size?.toLowerCase().includes(searchLower) ||
          profile.why?.toLowerCase().includes(searchLower) ||
          profile.id?.toLowerCase().includes(searchLower) ||
          profile.linkedin_url?.toLowerCase().includes(searchLower) ||
          profile.instagram_url?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = (a.name || "").toLowerCase();
          bValue = (b.name || "").toLowerCase();
          break;
        case "email":
          aValue = (a.email_address || "").toLowerCase();
          bValue = (b.email_address || "").toLowerCase();
          break;
        case "last_login":
          aValue = new Date(a.last_login || 0);
          bValue = new Date(b.last_login || 0);
          break;
        case "completeness":
          aValue = calculateProfileCompleteness(a);
          bValue = calculateProfileCompleteness(b);
          break;
        case "badges":
          aValue = Array.isArray(a.badges) ? a.badges.length : 0;
          bValue = Array.isArray(b.badges) ? b.badges.length : 0;
          break;
        case "teams":
          aValue = Array.isArray(a.teams) ? a.teams.length : 0;
          bValue = Array.isArray(b.teams) ? b.teams.length : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [profiles, filter, sortBy, sortOrder]);

  const handleProfileClick = (profileId) => {
    router.push(`/profile/${profileId}`);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isAdmin) {
    return (
      <AdminPage title="User Profiles" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="User Profiles"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      {/* Header Stats */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary">
                {profiles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="success.main">
                {profiles.filter((p) => calculateProfileCompleteness(p) >= 6).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete Profiles
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="info.main">
                {profiles.filter((p) => Array.isArray(p.badges) && p.badges.length > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users with Badges
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="secondary.main">
                {profiles.filter((p) => Array.isArray(p.teams) && p.teams.length > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users in Teams
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search profiles"
              variant="outlined"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Name, email, company, skills..."
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="last_login">Last Login</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="completeness">Profile Completeness</MenuItem>
                <MenuItem value="badges">Badge Count</MenuItem>
                <MenuItem value="teams">Team Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              onClick={fetchProfiles}
              variant="outlined"
              startIcon={<RefreshIcon />}
              fullWidth
              size="small"
            >
              Refresh
            </Button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              size="small"
              aria-label="View mode"
            >
              <ToggleButton value="card" aria-label="Card view">
                <Tooltip title="Card view">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="compact" aria-label="Compact view">
                <Tooltip title="Compact view">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {filter && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`Search: "${filter}"`}
              onDelete={() => setFilter("")}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {/* Results Count */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {processedProfiles.length} of {profiles.length} users
          </Typography>
        </Box>
      </Paper>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : processedProfiles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {profiles.length === 0
              ? "No user profiles found"
              : "No profiles match your search criteria"}
          </Typography>
          {filter && (
            <Button
              variant="outlined"
              onClick={() => setFilter("")}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      ) : viewMode === "compact" ? (
        <Paper sx={{ overflow: "hidden" }}>
          {/* Compact header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              backgroundColor: "action.hover",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ width: 40, fontWeight: 600 }} />
            <Typography variant="caption" sx={{ flex: 1, minWidth: 100, fontWeight: 600 }}>Name</Typography>
            {!isMobile && (
              <Typography variant="caption" sx={{ flex: 1, minWidth: 120, fontWeight: 600 }}>Email</Typography>
            )}
            <Typography variant="caption" sx={{ width: isMobile ? 60 : 80, fontWeight: 600, textAlign: "center" }}>Social</Typography>
            {!isMobile && (
              <Typography variant="caption" sx={{ width: 90, fontWeight: 600 }}>Last Login</Typography>
            )}
            <Typography variant="caption" sx={{ width: isMobile ? 50 : 80, fontWeight: 600, textAlign: "center" }}>Profile</Typography>
          </Box>
          {processedProfiles.map((profile) => {
            const completeness = calculateProfileCompleteness(profile);
            const completenessPercent = Math.round((completeness / 7) * 100);
            return (
              <CompactRow
                key={profile.id || profile.email_address}
                onClick={() => handleProfileClick(profile.id)}
              >
                <Avatar
                  src={profile.profile_image}
                  alt={profile.name || profile.nickname}
                  sx={{ width: 32, height: 32, fontSize: "0.85rem" }}
                >
                  {(profile.name || profile.nickname || "?").charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile.name || profile.nickname || "Unknown"}
                    {completeness >= 6 && (
                      <VerifiedIcon color="success" sx={{ fontSize: 14, ml: 0.5, verticalAlign: "text-bottom" }} />
                    )}
                  </Typography>
                  {isMobile && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {profile.email_address}
                    </Typography>
                  )}
                </Box>

                {!isMobile && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      "&:hover": { color: "primary.main" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(profile.email_address);
                      setSnackbar({
                        open: true,
                        message: "Email copied to clipboard",
                        severity: "success",
                      });
                    }}
                  >
                    {profile.email_address}
                  </Typography>
                )}

                {/* Social Links */}
                <Stack direction="row" spacing={0} sx={{ width: isMobile ? 60 : 80, justifyContent: "center" }}>
                  {profile.github && (
                    <Tooltip title={`GitHub: ${profile.github}`}>
                      <SocialIconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://github.com/${profile.github}`, "_blank", "noopener,noreferrer");
                        }}
                        sx={{ color: "#333" }}
                      >
                        <GitHubIcon sx={{ fontSize: 18 }} />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {profile.linkedin_url && (
                    <Tooltip title="LinkedIn">
                      <SocialIconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(profile.linkedin_url, "_blank", "noopener,noreferrer");
                        }}
                        sx={{ color: "#0A66C2" }}
                      >
                        <LinkedInIcon sx={{ fontSize: 18 }} />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                  {profile.instagram_url && (
                    <Tooltip title="Instagram">
                      <SocialIconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(profile.instagram_url, "_blank", "noopener,noreferrer");
                        }}
                        sx={{ color: "#E4405F" }}
                      >
                        <InstagramIcon sx={{ fontSize: 18 }} />
                      </SocialIconButton>
                    </Tooltip>
                  )}
                </Stack>

                {!isMobile && (
                  <Typography variant="caption" color="text.secondary" sx={{ width: 90 }}>
                    {formatLastLogin(profile.last_login)}
                  </Typography>
                )}

                <Box sx={{ width: isMobile ? 50 : 80, textAlign: "center" }}>
                  <Tooltip title={`${completeness}/7 fields complete`}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: completeness >= 6 ? "success.main" : completeness >= 4 ? "warning.main" : "error.main",
                      }}
                    >
                      {completenessPercent}%
                    </Typography>
                  </Tooltip>
                </Box>
              </CompactRow>
            );
          })}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {processedProfiles.map((profile) => {
            const completeness = calculateProfileCompleteness(profile);
            const badgeCount = Array.isArray(profile.badges) ? profile.badges.length : 0;
            const teamCount = Array.isArray(profile.teams) ? profile.teams.length : 0;

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={profile.id || profile.email_address}>
                <StyledCard completeness={completeness}>
                  <CardActionArea onClick={() => handleProfileClick(profile.id)}>
                    <CardContent>
                      {/* Header with Avatar and Name */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                        <MuiBadge
                          badgeContent={badgeCount}
                          color="primary"
                          max={99}
                          invisible={badgeCount === 0}
                          overlap="circular"
                        >
                          <ProfileAvatar
                            src={profile.profile_image}
                            alt={profile.name || profile.nickname}
                          >
                            {(profile.name || profile.nickname || "?").charAt(0).toUpperCase()}
                          </ProfileAvatar>
                        </MuiBadge>

                        <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {profile.name || profile.nickname || "Unknown"}
                            </Typography>
                            {completeness >= 6 && (
                              <Tooltip title="Complete Profile">
                                <VerifiedIcon color="success" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>

                          {profile.nickname && profile.name !== profile.nickname && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              &quot;{profile.nickname}&quot;
                            </Typography>
                          )}

                          <Tooltip title="Click to copy email">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                                "&:hover": { color: "primary.main" },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(profile.email_address);
                                setSnackbar({
                                  open: true,
                                  message: "Email copied to clipboard",
                                  severity: "success",
                                });
                              }}
                            >
                              {profile.email_address}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Stats Row */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <StatBox sx={{ flex: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {formatLastLogin(profile.last_login)}
                          </Typography>
                        </StatBox>

                        {teamCount > 0 && (
                          <Tooltip title={`${teamCount} team${teamCount !== 1 ? 's' : ''}`}>
                            <StatBox>
                              <TeamIcon fontSize="small" color="secondary" />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {teamCount}
                              </Typography>
                            </StatBox>
                          </Tooltip>
                        )}
                      </Stack>

                      {/* Profile Completeness */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Profile Completeness
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {completeness}/7 - {getCompletenessLabel(completeness)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(completeness / 7) * 100}
                          color={getCompletenessColor(completeness)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>

                      {/* Social Links */}
                      {(profile.github || profile.linkedin_url || profile.instagram_url) && (
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                          {profile.github && (
                            <Tooltip title={`GitHub: ${profile.github}`}>
                              <SocialIconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://github.com/${profile.github}`, "_blank", "noopener,noreferrer");
                                }}
                                sx={{ color: "#333" }}
                              >
                                <GitHubIcon sx={{ fontSize: 20 }} />
                              </SocialIconButton>
                            </Tooltip>
                          )}
                          {profile.linkedin_url && (
                            <Tooltip title="LinkedIn Profile">
                              <SocialIconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(profile.linkedin_url, "_blank", "noopener,noreferrer");
                                }}
                                sx={{ color: "#0A66C2" }}
                              >
                                <LinkedInIcon sx={{ fontSize: 20 }} />
                              </SocialIconButton>
                            </Tooltip>
                          )}
                          {profile.instagram_url && (
                            <Tooltip title="Instagram Profile">
                              <SocialIconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(profile.instagram_url, "_blank", "noopener,noreferrer");
                                }}
                                sx={{ color: "#E4405F" }}
                              >
                                <InstagramIcon sx={{ fontSize: 20 }} />
                              </SocialIconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}

                      {/* Profile Details */}
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {profile.role && (
                          <Tooltip title="Role">
                            <InfoChip
                              icon={<WorkIcon fontSize="small" />}
                              label={profile.role}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}

                        {profile.company && (
                          <Tooltip title="Company">
                            <InfoChip
                              icon={<BusinessIcon fontSize="small" />}
                              label={profile.company}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}

                        {profile.education && (
                          <Tooltip title="Education">
                            <InfoChip
                              icon={<SchoolIcon fontSize="small" />}
                              label={profile.education}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}

                        {Array.isArray(profile.expertise) &&
                          profile.expertise.slice(0, 2).map((exp, idx) => (
                            <Tooltip key={idx} title="Expertise">
                              <InfoChip
                                icon={<CodeIcon fontSize="small" />}
                                label={exp}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Tooltip>
                          ))}

                        {Array.isArray(profile.expertise) && profile.expertise.length > 2 && (
                          <Tooltip title={profile.expertise.slice(2).join(", ")}>
                            <InfoChip
                              label={`+${profile.expertise.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>

                      {/* Why Section (if available) */}
                      {profile.why && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.6,
                            }}
                          >
                            {profile.why}
                          </Typography>
                        </Box>
                      )}

                      {/* Click to view indicator */}
                      <Box
                        sx={{
                          mt: 2,
                          pt: 1,
                          borderTop: 1,
                          borderColor: "divider",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                          Click to view full profile →
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </AdminPage>
  );
});

export default AdminProfilePage;
