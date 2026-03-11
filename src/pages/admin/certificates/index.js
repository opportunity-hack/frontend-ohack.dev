import React, { useState, useEffect, useCallback } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  TableSortLabel,
  Autocomplete,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import GitHubIcon from "@mui/icons-material/GitHub";
import { styled } from "@mui/system";
import AdminPage from "../../../components/admin/AdminPage";

const heartOptions = [
  { value: "productionalized_projects", label: "Productionalized Projects" },
  { value: "requirements_gathering", label: "Requirements Gathering" },
  { value: "documentation", label: "Documentation" },
  { value: "design_architecture", label: "Design Architecture" },
  { value: "code_quality", label: "Code Quality" },
  { value: "unit_test_coverage", label: "Unit Test Coverage" },
  { value: "unit_test_writing", label: "Unit Test Writing" },
  { value: "observability", label: "Observability" },
  { value: "standups_completed", label: "Standups Completed" },
  { value: "code_reliability", label: "Code Reliability" },
  {
    value: "customer_driven_innovation_and_design_thinking",
    label: "Customer Driven Innovation and Design Thinking",
  },
  {
    value: "iterations_of_code_pushed_to_production",
    label: "Code Iterations Pushed to Production",
  },
  {
    value: "judge",
    label: "Judging Projects",
  },
  {
    value: "mentor",
    label: "Mentoring Teams",
  },
];

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
  "& .MuiTable-root": {
    minWidth: "100%",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    borderBottom: "none",
    padding: "8px 16px",
    "&:before": {
      content: "attr(data-label)",
      fontWeight: "bold",
      marginBottom: "4px",
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "column",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`certificates-tabpanel-${index}`}
      aria-labelledby={`certificates-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `certificates-tab-${index}`,
    'aria-controls': `certificates-tabpanel-${index}`,
  };
}

const AdminCertificatesPage = withRequiredAuthInfo(({ userClass }) => {
  const { user, accessToken } = useAuthInfo();
  const [activeTab, setActiveTab] = useState(0);
  
  // Hearts certificates state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedHearts, setSelectedHearts] = useState([]);
  const [heartCount, setHeartCount] = useState(0.5);
  const [slackChannel, setSlackChannel] = useState("");
  const [usersHearts, setUsersHearts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState("totalHearts");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [awardHeartsButtonDisabled, setAwardHeartsButtonDisabled] = useState(false);
  const [slackUsers, setSlackUsers] = useState([]);
  const [loadingSlackUsers, setLoadingSlackUsers] = useState(true);
  
  // GitHub certificates state
  const [githubUsername, setGithubUsername] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org.orgId;
  const isAdmin = org.hasPermission("heart.admin");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleHeartChange = (event) => {
    setSelectedHearts(event.target.value);
  };

  const fetchSlackUsers = useCallback(async () => {
    if (user === null) {
      return;
    }

    setLoadingSlackUsers(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/slack/users/active?active_days=10000`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.users) {
          const formattedUsers = data.users.map((user) => ({
            id: user.id,
            name: user.name,
            real_name: user.real_name,
            tz: user.tz,
            label: user.real_name
              ? `${user.real_name} (@${user.name})`
              : `@${user.name}`,
          }));
          setSlackUsers(formattedUsers);
        }
      } else {
        throw new Error("Failed to fetch Slack users");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch Slack users. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingSlackUsers(false);
    }
  }, [user, accessToken]);

  const fetchUsersHearts = useCallback(async () => {
    if (user === null) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hearts`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUsersHearts(data.hearts);
      } else {
        throw new Error("Failed to fetch users hearts");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch users hearts. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

  const fetchRecentCertificates = useCallback(async () => {
    if (user === null) {
      return;
    }

    setLoadingCertificates(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/recent`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setRecentCertificates(data.certs || []);
      } else {
        throw new Error("Failed to fetch recent certificates");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch recent certificates. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingCertificates(false);
    }
  }, [user, accessToken]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsersHearts();
      fetchSlackUsers();
      fetchRecentCertificates();
    }
  }, [isAdmin, fetchUsersHearts, fetchSlackUsers, fetchRecentCertificates]);

  const handleHeartsSubmit = async (event) => {
    setAwardHeartsButtonDisabled(true);
    event.preventDefault();

    if (selectedUsers.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one user to award hearts to.",
        severity: "error",
      });
      setAwardHeartsButtonDisabled(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hearts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({
            slack_user_ids: selectedUsers.map((user) => user.id),
            reasons: selectedHearts,
            amount: heartCount,
          }),
        },
      );

      if (response.ok) {
        setAwardHeartsButtonDisabled(false);
        const userCount = selectedUsers.length;
        setSnackbar({
          open: true,
          message: `Hearts awarded successfully to ${userCount} user${userCount > 1 ? "s" : ""}!`,
          severity: "success",
        });
        setSelectedUsers([]);
        setSelectedHearts([]);
        setHeartCount(0.5);
        fetchUsersHearts();
      } else {
        throw new Error("Failed to award hearts");
      }
    } catch (error) {
      setAwardHeartsButtonDisabled(false);
      setSnackbar({
        open: true,
        message: "Failed to award hearts. Please try again.",
        severity: "error",
      });
    }
  };

  const handleGitHubCertificateSubmit = async (event) => {
    event.preventDefault();
    setGeneratingCertificate(true);

    if (!githubUsername || !repoUrl) {
      setSnackbar({
        open: true,
        message: "Please provide both GitHub username and repository URL.",
        severity: "error",
      });
      setGeneratingCertificate(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            repoURL: repoUrl,
            username: githubUsername,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: "GitHub certificate generated successfully!",
          severity: "success",
        });
        setGithubUsername("");
        setRepoUrl("");
        fetchRecentCertificates();
      } else {
        throw new Error("Failed to generate certificate");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to generate GitHub certificate. Please try again.",
        severity: "error",
      });
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleSlackCertificateSubmit = async (slackChannel) => {
    setGeneratingCertificate(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            slack_channel: slackChannel,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: "Hearts certificate generated successfully!",
          severity: "success",
        });
        setSlackChannel("");
        fetchRecentCertificates();
      } else {
        throw new Error("Failed to generate certificate");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to generate hearts certificate. Please try again.",
        severity: "error",
      });
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = usersHearts
    .sort((a, b) => {
      if (orderBy === "totalHearts") {
        return order === "asc"
          ? a.totalHearts - b.totalHearts
          : b.totalHearts - a.totalHearts;
      } else {
        return order === "asc"
          ? a.slackUsername.localeCompare(b.slackUsername)
          : b.slackUsername.localeCompare(a.slackUsername);
      }
    })
    .filter((user) =>
      user.slackUsername.toLowerCase().includes(filter.toLowerCase()),
    );

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Manage Certificates" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Manage Certificates"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            aria-label="certificate tabs"
          >
            <Tab 
              icon={<VolunteerActivismIcon />} 
              label="Hearts Certificates" 
              {...a11yProps(0)} 
              sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center', 
                gap: 1 
              }} 
            />
            <Tab 
              icon={<GitHubIcon />} 
              label="GitHub Certificates" 
              {...a11yProps(1)} 
              sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center', 
                gap: 1 
              }} 
            />
          </Tabs>
        </Box>

        {/* Hearts Certificates Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ mb: 3, display: "flex", alignItems: "center" }}
            >
              🏆 Award Hearts to Team Members
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Select multiple users and award hearts for their contributions. Hearts certificates can be viewed by users in their profile page.
            </Typography>

            <Box component="form" onSubmit={handleHeartsSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    multiple
                    fullWidth
                    options={slackUsers}
                    loading={loadingSlackUsers}
                    value={selectedUsers}
                    onChange={(event, newValue) => {
                      setSelectedUsers(newValue);
                    }}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Slack Users"
                        placeholder="Search and select users..."
                        required={selectedUsers.length === 0}
                        helperText={
                          loadingSlackUsers
                            ? "Loading users..."
                            : `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""} selected`
                        }
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option.id}
                          label={option.real_name || option.name}
                          {...getTagProps({ index })}
                          size="small"
                          variant="outlined"
                        />
                      ))
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {option.real_name || option.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            @{option.name} {option.tz && `• ${option.tz}`}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    noOptionsText={
                      loadingSlackUsers ? "Loading..." : "No users found"
                    }
                    loadingText="Loading Slack users..."
                    disabled={loadingSlackUsers}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Heart Types</InputLabel>
                    <Select
                      multiple
                      value={selectedHearts}
                      onChange={handleHeartChange}
                      renderValue={(selected) => selected.join(", ")}
                    >
                      {heartOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Heart Count"
                    value={heartCount}
                    onChange={(e) => setHeartCount(parseFloat(e.target.value))}
                    inputProps={{ min: 0.5, step: 0.5 }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      awardHeartsButtonDisabled ||
                      selectedUsers.length === 0 ||
                      selectedHearts.length === 0
                    }
                    fullWidth
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    {awardHeartsButtonDisabled ? (
                      <>Awarding Hearts...</>
                    ) : (
                      <>
                        Award Hearts to{" "}
                        {selectedUsers.length > 0
                          ? `${selectedUsers.length} User${selectedUsers.length > 1 ? "s" : ""}`
                          : "Selected Users"}
                      </>
                    )}
                  </Button>
                </Grid>

                {(selectedUsers.length > 0 ||
                  selectedHearts.length > 0 ||
                  heartCount !== 0.5) && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Award Summary
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        <li>
                          <Typography variant="body2">
                            <strong>Recipients:</strong>{" "}
                            {selectedUsers.length > 0
                              ? selectedUsers
                                  .map((user) => user.real_name || user.name)
                                  .join(", ")
                              : "No users selected"}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Heart Count per User:</strong> {heartCount}{" "}
                            hearts
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Total Hearts to Award:</strong>{" "}
                            {selectedUsers.length * heartCount} hearts
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Heart Types:</strong>{" "}
                            {selectedHearts.length > 0
                              ? selectedHearts
                                  .map(
                                    (heart) =>
                                      heartOptions.find((h) => h.value === heart)
                                        ?.label || heart,
                                  )
                                  .join(", ")
                              : "No heart types selected"}
                          </Typography>
                        </li>
                      </Box>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        {/* GitHub Certificates Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ mb: 3, display: "flex", alignItems: "center" }}
            >
              🎓 Generate GitHub Certificates
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Generate certificates for GitHub repository contributions. Generated certificates can be viewed at /cert.
            </Typography>

            <Box component="form" onSubmit={handleGitHubCertificateSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="GitHub Username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g., johndoe"
                    required
                    helperText="GitHub username (not email)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Repository URL"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="e.g., https://github.com/owner/repo"
                    required
                    helperText="Full GitHub repository URL"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={generatingCertificate || !githubUsername || !repoUrl}
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    {generatingCertificate ? (
                      <>Generating Certificate...</>
                    ) : (
                      <>Generate GitHub Certificate</>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography
              variant="h5"
              gutterBottom
              sx={{ mb: 3, display: "flex", alignItems: "center" }}
            >
              📜 Generate Hearts Certificate from Slack Channel
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Generate a hearts certificate based on Slack channel - we look up the team associated with this channel and then the github usernames. This will create a certificate viewable in profiles.
            </Typography>

            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              if (slackChannel.trim()) {
                handleSlackCertificateSubmit(slackChannel.trim());
              }
            }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    fullWidth
                    label="Slack Channel"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    placeholder="e.g., general, team-alpha, project-discussion"
                    required
                    helperText="Enter the Slack channel name (without #)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={generatingCertificate || !slackChannel.trim()}
                    size="large"
                    sx={{ py: 1.5 }}
                    fullWidth
                  >
                    {generatingCertificate ? (
                      <>Generating Certificate...</>
                    ) : (
                      <>Generate Hearts Certificate</>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Hearts Leaderboard (only show on Hearts tab) */}
      {activeTab === 0 && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            📊 Hearts Leaderboard
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Button
                onClick={() => {
                  fetchUsersHearts();
                  fetchSlackUsers();
                }}
                variant="outlined"
                disabled={loading || loadingSlackUsers}
              >
                {loading || loadingSlackUsers ? "Refreshing..." : "Refresh Data"}
              </Button>
            </Grid>
            <Grid size={{ xs: true }}>
              <TextField
                fullWidth
                label="Filter by Slack Username"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Type to filter users..."
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Box sx={{ mb: 3 }} />

          {loading ? (
            <CircularProgress />
          ) : (
            <StyledTableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "slackUsername"}
                        direction={orderBy === "slackUsername" ? order : "asc"}
                        onClick={() => handleRequestSort("slackUsername")}
                      >
                        Slack Username
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "totalHearts"}
                        direction={orderBy === "totalHearts" ? order : "asc"}
                        onClick={() => handleRequestSort("totalHearts")}
                      >
                        Total Hearts
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>Details</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <StyledTableRow key={user.slackUsername}>
                      <StyledTableCell data-label="Slack Username">
                        {user.slackUsername}
                      </StyledTableCell>
                      <StyledTableCell data-label="Total Hearts">
                        {user.totalHearts}
                      </StyledTableCell>
                      <StyledTableCell data-label="Details">
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>View Details</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="h6">How</Typography>
                            <Table size="small">
                              <TableBody>
                                {Object.entries(user.history.how).map(
                                  ([key, value]) => (
                                    <TableRow key={key}>
                                      <TableCell>{key}</TableCell>
                                      <TableCell>{value}</TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                            <Typography variant="h6" sx={{ mt: 2 }}>
                              What
                            </Typography>
                            <Table size="small">
                              <TableBody>
                                {Object.entries(user.history.what).map(
                                  ([key, value]) => (
                                    <TableRow key={key}>
                                      <TableCell>{key}</TableCell>
                                      <TableCell>{value}</TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </AccordionDetails>
                        </Accordion>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </Paper>
      )}

      {/* Recent Certificates (only show on GitHub tab) */}
      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            📜 Recent Certificates
          </Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid>
              <Button
                onClick={fetchRecentCertificates}
                variant="outlined"
                disabled={loadingCertificates}
              >
                {loadingCertificates ? "Refreshing..." : "Refresh Certificates"}
              </Button>
            </Grid>
          </Grid>

          {loadingCertificates ? (
            <CircularProgress />
          ) : (
            <StyledTableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Repository</StyledTableCell>
                    <StyledTableCell>Author</StyledTableCell>
                    <StyledTableCell>Date Created</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCertificates.map((cert) => (
                    <StyledTableRow key={cert.file_id}>
                      <StyledTableCell data-label="Repository">
                        <Typography variant="body2" noWrap>
                          {cert.repository_url}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell data-label="Author">
                        {cert.author_name}
                      </StyledTableCell>
                      <StyledTableCell data-label="Date Created">
                        {cert.date}
                      </StyledTableCell>
                      <StyledTableCell data-label="Actions">
                        <Button
                          variant="outlined"
                          size="small"
                          href={`/cert/${cert.file_id}`}
                          target="_blank"
                        >
                          View Certificate
                        </Button>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </Paper>
      )}
    </AdminPage>
  );
});

export default AdminCertificatesPage;