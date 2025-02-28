import React, { useState, useEffect } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import NonprofitEditDialog from "../../../components/admin/NonprofitEditDialog";

const AdminNonprofitPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [nonprofits, setNonprofits] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filter, setFilter] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNonprofit, setEditingNonprofit] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const fetchNonprofits = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`,
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
        setNonprofits(data.nonprofits || []);
      } else {
        throw new Error("Failed to fetch nonprofits");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch nonprofits. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemStatements = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`,
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
        setProblemStatements(data.problem_statements || []);
      } else {
        throw new Error("Failed to fetch problem statements");
      }
    } catch (error) {
      console.error("Error fetching problem statements:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchNonprofits();
      fetchProblemStatements();
    }
  }, [isAdmin, accessToken]);

  const handleEditNonprofit = (nonprofit) => {
    setEditingNonprofit(nonprofit);
    setEditDialogOpen(true);
  };

  const handleAddNonprofit = () => {
    setEditingNonprofit(null);
    setEditDialogOpen(true);
  };

  const handleSaveNonprofit = async (nonprofit) => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo`;
      const method = nonprofit.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(nonprofit),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: nonprofit.id
            ? "Nonprofit updated successfully"
            : "Nonprofit added successfully",
          severity: "success",
        });
        fetchNonprofits();
      } else {
        throw new Error(
          nonprofit.id
            ? "Failed to update nonprofit"
            : "Failed to add nonprofit"
        );
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${
          nonprofit.id ? "update" : "add"
        } nonprofit. Please try again.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredNonprofits = nonprofits.filter(
    (nonprofit) =>
      nonprofit.name.toLowerCase().includes(filter.toLowerCase()) ||
      nonprofit.description.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <AdminPage title="Nonprofit Management" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Nonprofit Management"
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
      isAdmin={isAdmin}
    >
      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button onClick={fetchNonprofits} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={handleAddNonprofit}
              variant="contained"
              color="primary"
            >
              Add Nonprofit
            </Button>
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="Filter by Name or Description"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Slack Channel</TableCell>
                <TableCell>Contact People</TableCell>
                <TableCell>Problem Statements</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Rank</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNonprofits.map((nonprofit) => (
                <TableRow key={nonprofit.id}>
                  <TableCell>{nonprofit.name}</TableCell>
                  <TableCell>{nonprofit.description}</TableCell>
                  <TableCell>{nonprofit.website}</TableCell>
                  <TableCell>{nonprofit.slack_channel}</TableCell>
                  <TableCell>{nonprofit.contact_people?.join(", ")}</TableCell>
                  
                  <TableCell>
                    {nonprofit.problem_statements?.map((ps) => (
                      <Chip
                        key={ps}
                        label={
                          problemStatements.find((p) => p.id === ps)?.title ||
                          ps
                        }
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {nonprofit.image && (
                      <img
                        src={nonprofit.image}
                        alt={nonprofit.name}
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{nonprofit.rank}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditNonprofit(nonprofit)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <NonprofitEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        nonprofit={editingNonprofit}
        onSave={handleSaveNonprofit}
        problemStatements={problemStatements}
      />
    </AdminPage>
  );
});

export default AdminNonprofitPage;
