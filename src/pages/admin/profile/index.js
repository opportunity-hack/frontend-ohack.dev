import React, { useState, useEffect } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Typography,
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
  TextField,
  TableSortLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import CodeIcon from "@mui/icons-material/Code";
import { styled } from "@mui/system";
import AdminPage from "../../../components/admin/AdminPage";

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

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const AdminProfilePage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderBy, setOrderBy] = useState("email");
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");

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
      "shirtSize",
      "github",
      "company",
      "why",
    ];
    const filledFields = fields.filter(
      (field) => profile[field] && profile[field] !== ""
    );
    return filledFields.length;
  };

  const renderProfileDetails = (profile) => {
    const details = [
      { label: "Role", value: profile.role, icon: <WorkIcon /> },
      { label: "Company", value: profile.company, icon: <BusinessIcon /> },
      { label: "Education", value: profile.education, icon: <SchoolIcon /> },
      {
        label: "Shirt Size",
        value: profile.shirt_size,
        icon: <CheckroomIcon />,
      },
    ];

    return (
      <Box>
        {details.map(
          (detail) =>
            detail.value && (
              <Tooltip key={detail.label} title={detail.label}>
                <StyledChip
                  icon={detail.icon}
                  label={detail.value}
                  variant="outlined"
                />
              </Tooltip>
            )
        )}
        {profile.expertise &&
          profile.expertise.map((exp) => (
            <Tooltip key={exp} title="Expertise">
              <StyledChip
                icon={<CodeIcon />}
                label={exp}
                color="primary"
                variant="outlined"
              />
            </Tooltip>
          ))}
        {profile.github && (
          <Tooltip title="GitHub Profile">
            <StyledChip
              icon={<GitHubIcon />}
              label={profile.github}
              clickable
              component="a"
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedProfiles = profiles
    .sort((a, b) => {
      if (orderBy === "email") {
        return order === "asc"
          ? (a.email_address || "").localeCompare(b.email_address || "")
          : (b.email_address || "").localeCompare(a.email_address || "");
      } else if (orderBy === "name") {
        return order === "asc"
          ? (a.name || "").localeCompare(b.name || "")
          : (b.name || "").localeCompare(a.name || "");
      } else if (orderBy === "last_login") {
        return order === "asc"
          ? (a.last_login || "").localeCompare(b.last_login || "")
          : (b.last_login || "").localeCompare(a.last_login || "");
      } else if (orderBy === "completeness") {
        const completenessA = calculateProfileCompleteness(a);
        const completenessB = calculateProfileCompleteness(b);
        return order === "asc"
          ? completenessA - completenessB
          : completenessB - completenessA;
      }
      return 0;
    })
    .filter(
      (profile) =>
        profile.email_address?.toLowerCase().includes(filter.toLowerCase()) ||
        profile.name?.toLowerCase().includes(filter.toLowerCase()) ||
        profile.last_login?.toLowerCase().includes(filter.toLowerCase())
    );

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
      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button onClick={fetchProfiles} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="Filter by Email, Last Login, or Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={() => handleRequestSort("email")}
                  >
                    Email
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "last_login"}
                    direction={orderBy === "last_login" ? order : "asc"}
                    onClick={() => handleRequestSort("last_login")}
                  >
                    Last Login
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "completeness"}
                    direction={orderBy === "completeness" ? order : "asc"}
                    onClick={() => handleRequestSort("completeness")}
                  >
                    Profile Completeness
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>Details</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProfiles.map((profile) => {
                const completeness = calculateProfileCompleteness(profile);
                return (
                  <StyledTableRow key={profile.email}>
                    <StyledTableCell data-label="Email">
                      {profile.email_address}
                    </StyledTableCell>
                    <StyledTableCell data-label="Last Login">
                      {profile.last_login}
                    </StyledTableCell>
                    <StyledTableCell data-label="Name">
                      {profile.name}
                    </StyledTableCell>
                    <StyledTableCell data-label="Profile Completeness">
                      {completeness}/7
                    </StyledTableCell>
                    <StyledTableCell data-label="Profile Details">
                      {renderProfileDetails(profile)}
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>More Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="subtitle1">
                            Why: {profile.why}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </AdminPage>
  );
});

export default AdminProfilePage;
