import React, { useState, useEffect } from "react";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  TableSortLabel,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import AdminPage from "../../../components/admin/AdminPage";
import LinkManagement from "../../../components/admin/LinkManagement";

const AdminProblemsPage = () => {
  const { accessToken, userClass } = useAuthInfo();
  const [problems, setProblems] = useState(Array.isArray(null) ? null : []);
  const [loading, setLoading] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [order, setOrder] = useState("asc");

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");

  const fetchProblems = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();                
        setProblems(data.problem_statements || []);
      } else {
        throw new Error("Failed to fetch problems");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAdmin) {
      fetchProblems();
    }
  }, [isAdmin, fetchProblems]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredAndSortedProblems = Array.isArray(problems) ? problems
    .filter(
      (problem) =>
        problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        problem.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.first_thought_of?.toLowerCase().includes(searchQuery.toLowerCase()) 
    )
    .sort((a, b) => {
      const isAsc = order === "asc";
      

      // Handle case where column is a number or null/not set
        if (typeof a[orderBy] === "number") {
            return (a[orderBy] - b[orderBy]) * (isAsc ? 1 : -1);
        }

    // Handle case where column is a number but is a string
    if (typeof a[orderBy] === "string" && !isNaN(a[orderBy])) {
        return (parseInt(a[orderBy]) - parseInt(b[orderBy])) * (isAsc ? 1 : -1);
    }
    
      const aValue = String(a[orderBy]).toLowerCase();
      const bValue = String(b[orderBy]).toLowerCase();
      return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
    })
    : [];  

  const handleAddProblem = () => {
    setEditingProblem({
      title: "",
      description: "",
      status: "draft",
      first_thought_of: new Date().getFullYear().toString(),
      github: [],
      references: [],
      slack_channel: "",
      helping: [],
      rank: "",
    });
    setDialogOpen(true);
  };

  const handleEditProblem = (problem) => {
    const adaptedProblem = {
      ...problem,
      references: adaptReferencesToLinkFormat(problem.references)
    };
    setEditingProblem(adaptedProblem);
    setDialogOpen(true);
  };

  const handleSaveProblem = async () => {
    console.log(editingProblem);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": org.orgId,
          },
          body: JSON.stringify(editingProblem),
        }
      );
      if (response.ok) {
        fetchProblems();
        setDialogOpen(false);
      } else {
        throw new Error("Failed to save problem statement");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReferencesChange = (newReferences) => {
    setEditingProblem((prev) => ({
      ...prev,
      references: newReferences.map(ref => ({
        name: ref.name,
        link: ref.link
      }))
    }));
  };

  const adaptReferencesToLinkFormat = (references) => {
    return (references || []).map(ref => ({
      name: ref.name || '',
      link: ref.link || '',
      color: 'primary',
      size: 'medium',
      variant: 'text',
      open_new: 'True'
    }));
  };

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
      >
        <AdminPage title="Problem Statement Management" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
    >
      <AdminPage title="Problem Statement Management" isAdmin={isAdmin}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search Problems"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProblem}
          >
            Add Problem Statement
          </Button>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "title"}
                      direction={orderBy === "title" ? order : "asc"}
                      onClick={() => handleSort("title")}
                    >
                      Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "status"}
                      direction={orderBy === "status" ? order : "asc"}
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "rank"}
                      direction={orderBy === "rank" ? order : "asc"}
                      onClick={() => handleSort("rank")}
                    >
                      Rank
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "first_thought_of"}
                      direction={orderBy === "first_thought_of" ? order : "asc"}
                      onClick={() => handleSort("first_thought_of")}
                    >
                      First Thought Of
                    </TableSortLabel>
                  </TableCell>                                    
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedProblems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell>{problem.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={problem.status}
                        color={
                          problem.status === "production"
                            ? "success"
                            : problem.status === "active"
                            ? "primary"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{problem.rank}</TableCell>
                    <TableCell>{problem.first_thought_of}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditProblem(problem)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingProblem?.id ? "Edit Problem" : "Add Problem"}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={editingProblem?.title || ""}
              onChange={(e) =>
                setEditingProblem((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={editingProblem?.description || ""}
              onChange={(e) =>
                setEditingProblem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Status"
              value={editingProblem?.status || ""}
              onChange={(e) =>
                setEditingProblem((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              margin="normal" 
            />
            <TextField
              fullWidth
              label="First Thought Of"
              value={editingProblem?.first_thought_of || ""}
              onChange={(e) =>
                setEditingProblem((prev) => ({
                  ...prev,
                  first_thought_of: e.target.value,
                }))
              }
              margin="normal" 
            />

            <TextField
            label="Rank"
            value={editingProblem?.rank || ""}
            onChange={(e) =>
              setEditingProblem((prev) => ({
                ...prev,
                rank: e.target.value,
              }))
            }
            margin="normal"
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              References
            </Typography>
            <LinkManagement
              links={adaptReferencesToLinkFormat(editingProblem?.references)}
              onChange={handleReferencesChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProblem} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminProblemsPage;
