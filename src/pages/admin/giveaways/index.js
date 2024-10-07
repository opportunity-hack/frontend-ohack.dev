import React, { useState, useEffect } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Typography,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
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

const AdminGiveawaysPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderBy, setOrderBy] = useState("entries");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [randomSeed, setRandomSeed] = useState("");
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org.orgId;
  const isAdmin = org.hasPermission("volunteer.admin");

  const fetchGiveaways = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/giveaway/admin`,
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
        setGiveaways(data.giveaways);
      } else {
        throw new Error("Failed to fetch giveaways");
      }
    } catch (error) {
      console.error("Error fetching giveaways:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch giveaways. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchGiveaways();
    }
  }, [isAdmin]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedGiveaways = giveaways
    .sort((a, b) => {
      if (orderBy === "entries") {
        return order === "asc" ? a.entries - b.entries : b.entries - a.entries;
      } else if (orderBy === "name") {
        return order === "asc"
          ? (a.user?.name || "").localeCompare(b.user?.name || "")
          : (b.user?.name || "").localeCompare(a.user?.name || "");
      } else {
        return order === "asc"
          ? (a.user_id || "").localeCompare(b.user_id || "")
          : (b.user_id || "").localeCompare(a.user_id || "");
      }
    })
    .filter((giveaway) => {
      const searchTerm = filter.toLowerCase();
      return (
        (giveaway.user?.name || "").toLowerCase().includes(searchTerm) ||
        (giveaway.user?.nickname || "").toLowerCase().includes(searchTerm) ||
        (giveaway.user?.github || "").toLowerCase().includes(searchTerm)
      );
    });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const selectRandomWinner = () => {
    if (sortedGiveaways.length === 0 || !randomSeed) return;

    console.log("Random seed:", randomSeed);
    console.log("Sorted giveaways:", sortedGiveaways);

    const seed = parseInt(randomSeed, 10);
    let random = seed;

    // Create a pool of entries where each user appears as many times as their entry count
    const entryPool = sortedGiveaways.flatMap((giveaway) =>
      Array(giveaway.entries).fill(giveaway)
    );

    // Use the Fisher-Yates shuffle algorithm with our seeded random number generator
    for (let i = entryPool.length - 1; i > 0; i--) {
      random = (random * 1103515245 + 12345) & 0x7fffffff; // Linear congruential generator
      const j = random % (i + 1);
      [entryPool[i], entryPool[j]] = [entryPool[j], entryPool[i]];
    }

    // Select the first entry after shuffling
    setSelectedWinner(entryPool[0]);
    setWinnerDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Giveaway Management" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Giveaway Management"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <Box sx={{ mb: 3, width: "100%" }}>
        <Typography variant="h5" gutterBottom>
          Giveaway Entries
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button onClick={fetchGiveaways} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="Filter by Name, Nickname, or GitHub"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Random Seed"
              value={randomSeed}
              onChange={(e) => setRandomSeed(e.target.value)}
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={selectRandomWinner}
              disabled={!randomSeed || sortedGiveaways.length === 0}
            >
              Select Random Winner
            </Button>
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
                <StyledTableCell>Avatar</StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>Nickname</StyledTableCell>
                <StyledTableCell>GitHub</StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "entries"}
                    direction={orderBy === "entries" ? order : "asc"}
                    onClick={() => handleRequestSort("entries")}
                  >
                    Total Entries
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>GitHub Entries</StyledTableCell>
                <StyledTableCell>Profile Entries</StyledTableCell>
                <StyledTableCell>Timestamp</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGiveaways.map((giveaway) => (
                <StyledTableRow key={giveaway.user_id}>
                  <StyledTableCell data-label="Avatar">
                    <Avatar
                      src={giveaway.user.profile_image}
                      alt={giveaway.user.name}
                    />
                  </StyledTableCell>
                  <StyledTableCell data-label="Name">
                    {giveaway.user.name}
                  </StyledTableCell>
                  <StyledTableCell data-label="Nickname">
                    {giveaway.user.nickname}
                  </StyledTableCell>
                  <StyledTableCell data-label="GitHub">
                    {giveaway.user.github}
                  </StyledTableCell>
                  <StyledTableCell data-label="Total Entries">
                    {giveaway.entries}
                  </StyledTableCell>
                  <StyledTableCell data-label="GitHub Entries">
                    {giveaway.giveaway_data.githubEntries}
                  </StyledTableCell>
                  <StyledTableCell data-label="Profile Entries">
                    {giveaway.giveaway_data.profileEntries}
                  </StyledTableCell>
                  <StyledTableCell data-label="Timestamp">
                    {new Date(giveaway.timestamp).toLocaleString()}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      <Dialog
        open={winnerDialogOpen}
        onClose={() => setWinnerDialogOpen(false)}
      >
        <DialogTitle>Random Winner Selected</DialogTitle>
        <DialogContent>
          {selectedWinner && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={selectedWinner.user.profile_image}
                alt={selectedWinner.user.name}
                sx={{ width: 64, height: 64 }}
              />
              <Typography>
                Winner: {selectedWinner.user.name} (
                {selectedWinner.user.nickname})
                <br />
                GitHub: {selectedWinner.user.github}
                <br />
                Total Entries: {selectedWinner.entries}
                <br />
                GitHub Entries: {selectedWinner.giveaway_data.githubEntries}
                <br />
                Profile Entries: {selectedWinner.giveaway_data.profileEntries}
                <br />
                Timestamp: {new Date(selectedWinner.timestamp).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWinnerDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
});

export default AdminGiveawaysPage;
