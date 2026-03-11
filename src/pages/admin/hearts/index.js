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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

const AdminHeartsPage = withRequiredAuthInfo(({ userClass }) => {
  const { user, accessToken } = useAuthInfo();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedHearts, setSelectedHearts] = useState([]);
  const [heartCount, setHeartCount] = useState(0.5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [usersHearts, setUsersHearts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState("totalHearts");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [awardHeartsButtonDisabled, setAwardHeartsButtonDisabled] =
    useState(false);
  const [slackUsers, setSlackUsers] = useState([]);
  const [loadingSlackUsers, setLoadingSlackUsers] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org.orgId;
  const isAdmin = org.hasPermission("heart.admin");

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

  useEffect(() => {
    if (isAdmin) {
      fetchUsersHearts();
      fetchSlackUsers();
    }
  }, [isAdmin, fetchUsersHearts, fetchSlackUsers]);

  const handleSubmit = async (event) => {
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
      <AdminPage title="Award Hearts" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Award Hearts"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 3, display: "flex", alignItems: "center" }}
        >
          🏆 Award Hearts to Team Members
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Select multiple users and award hearts for their contributions. You
          can select multiple recipients and heart types at once.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
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

            {/* Summary Card */}
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
      </Paper>

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
    </AdminPage>
  );
});

export default AdminHeartsPage;
