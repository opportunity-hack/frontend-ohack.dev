import React, { useState, useEffect, useCallback } from "react";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Group as TeamsIcon,
  VolunteerActivism as VolunteerIcon,
  CheckCircle as CheckInIcon,
  Gavel as JudgingIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import AdminPage from "../../../components/admin/AdminPage";
import HackathonDuplicator from "../../../components/admin/HackathonDuplicator";

const slugify = (raw) =>
  (raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);

const AdminHackathonPage = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState({ title: "", event_id: "", start_date: "", end_date: "", location: "" });
  const [creating, setCreating] = useState(false);

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch hackathons");
      const data = await response.json();
      const sorted = [...(data.hackathons || [])].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      setHackathons(sorted);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      setSnackbar({ open: true, message: "Failed to fetch hackathons. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId]);

  useEffect(() => {
    if (isAdmin) fetchHackathons();
  }, [isAdmin, fetchHackathons]);

  const handleEdit = (hackathon) => {
    router.push(`/admin/hackathons/${hackathon.event_id || hackathon.id}`);
  };

  const handleOpenCreate = () => {
    setCreateDraft({ title: "", event_id: "", start_date: "", end_date: "", location: "" });
    setCreateOpen(true);
  };

  const updateDraft = (field, value) => {
    setCreateDraft((d) => {
      if (field === "title" && (!d.event_id || d.event_id === slugify(d.title))) {
        return { ...d, title: value, event_id: slugify(value) };
      }
      return { ...d, [field]: value };
    });
  };

  const canCreate = createDraft.title.trim() && createDraft.event_id.trim() && createDraft.start_date && createDraft.end_date;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const payload = {
        ...createDraft,
        event_id: slugify(createDraft.event_id),
        description: "",
        type: "",
        image_url: "",
        links: [],
        countdowns: [],
        event_photos: [],
        social_posts: [],
        constraints: { max_people_per_team: 5, max_teams_per_problem: 10, min_people_per_team: 2, hacker_required_questions: { questions: [] } },
        donation_current: { food: "0", prize: "0", swag: "0", thank_you: "" },
        donation_goals: { food: "0", prize: "0", swag: "0" },
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create hackathon");
      setCreateOpen(false);
      router.push(`/admin/hackathons/${payload.event_id}`);
    } catch (err) {
      console.error("Failed to create hackathon:", err);
      setSnackbar({ open: true, message: "Failed to create hackathon.", severity: "error" });
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />}
      >
        <AdminPage title="Hackathon Management" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />}
    >
      <AdminPage
        title="Hackathon Management"
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar({ ...snackbar, open: false })}
        isAdmin={isAdmin}
      >
        <Box sx={{ mb: 3, width: "100%" }}>
          <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
            <Grid>
              <Button onClick={handleOpenCreate} variant="contained" color="primary" startIcon={<AddIcon />}>
                Add Hackathon
              </Button>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {hackathons.map((hackathon) => (
              <Grid size={{ xs: 12, lg: 6 }} key={hackathon.id}>
                <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: "bold" }}>
                          {hackathon.title}
                        </Typography>
                        <Chip label={hackathon.event_id} color="primary" size="small" sx={{ mb: 1 }} />
                      </Box>
                      <Box>
                        <IconButton onClick={() => handleEdit(hackathon)} size="small" aria-label="Edit hackathon">
                          <EditIcon />
                        </IconButton>
                        <HackathonDuplicator
                          hackathon={hackathon}
                          onDuplicate={() => {
                            fetchHackathons();
                            setSnackbar({ open: true, message: "Hackathon duplicated successfully", severity: "success" });
                          }}
                          accessToken={accessToken}
                          orgId={orgId}
                        />
                      </Box>
                    </Box>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        📅 {hackathon.start_date} to {hackathon.end_date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📍 {hackathon.location}
                      </Typography>
                      {hackathon.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {hackathon.description.length > 100 ? `${hackathon.description.substring(0, 100)}…` : hackathon.description}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ p: 1.5, pt: 0, flexDirection: "column", alignItems: "stretch" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: "bold", textAlign: "left" }}>
                      Admin Tools:
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(hackathon)}
                      sx={{ textTransform: "none", mb: 1.5, minHeight: 36 }}
                    >
                      Edit hackathon
                    </Button>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<TeamsIcon />}
                          variant="outlined"
                          onClick={() => router.push(`/admin/teams?event_id=${hackathon.event_id || hackathon.id}`)}
                          sx={{ flex: 1, textTransform: "none", fontSize: "0.7rem", minHeight: 32, px: 0.5, "& .MuiButton-startIcon": { mr: 0.5 } }}
                        >
                          Teams
                        </Button>
                        <Button
                          size="small"
                          startIcon={<VolunteerIcon />}
                          variant="outlined"
                          onClick={() => router.push(`/admin/volunteer?event_id=${hackathon.event_id || hackathon.id}`)}
                          sx={{ flex: 1, textTransform: "none", fontSize: "0.7rem", minHeight: 32, px: 0.5, "& .MuiButton-startIcon": { mr: 0.5 } }}
                        >
                          Volunteer
                        </Button>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<CheckInIcon />}
                          variant="outlined"
                          onClick={() => router.push(`/admin/check-in?event_id=${hackathon.event_id || hackathon.id}`)}
                          sx={{ flex: 1, textTransform: "none", fontSize: "0.7rem", minHeight: 32, px: 0.5, "& .MuiButton-startIcon": { mr: 0.5 } }}
                        >
                          Check-in
                        </Button>
                        <Button
                          size="small"
                          startIcon={<JudgingIcon />}
                          variant="outlined"
                          onClick={() => router.push(`/admin/judging?event_id=${hackathon.event_id || hackathon.id}`)}
                          sx={{ flex: 1, textTransform: "none", fontSize: "0.7rem", minHeight: 32, px: 0.5, "& .MuiButton-startIcon": { mr: 0.5 } }}
                        >
                          Judging
                        </Button>
                      </Box>
                    </Stack>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LaunchIcon />}
                      onClick={() => window.open(`/hack/${hackathon.event_id || hackathon.id}`, "_blank")}
                      sx={{ textTransform: "none", minHeight: 36 }}
                    >
                      View public event page
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Hackathon</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Just enough to bootstrap the event. You'll be taken to the editor for everything else.
            </Alert>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={createDraft.title}
                onChange={(e) => updateDraft("title", e.target.value)}
                placeholder="Opportunity Hack Fall 2026"
                required
              />
              <TextField
                label="Event ID (URL slug)"
                fullWidth
                value={createDraft.event_id}
                onChange={(e) => updateDraft("event_id", e.target.value)}
                helperText="Auto-generated from the title. Lowercase, underscores only."
                required
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Start date"
                  type="date"
                  fullWidth
                  value={createDraft.start_date}
                  onChange={(e) => updateDraft("start_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  label="End date"
                  type="date"
                  fullWidth
                  value={createDraft.end_date}
                  onChange={(e) => updateDraft("end_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Stack>
              <TextField
                label="Location"
                fullWidth
                value={createDraft.location}
                onChange={(e) => updateDraft("location", e.target.value)}
                placeholder="ASU Tempe, Arizona"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreate} variant="contained" disabled={!canCreate || creating}>
              {creating ? "Creating…" : "Create & open editor"}
            </Button>
          </DialogActions>
        </Dialog>
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminHackathonPage;
