import React, { useState, useEffect, useCallback } from "react";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin  } from "@propelauth/react";

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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Group as TeamsIcon,
  VolunteerActivism as VolunteerIcon,
  CheckCircle as CheckInIcon,
  Gavel as JudgingIcon,
  Launch as LaunchIcon,
  QuizOutlined as QuizIcon,
  ToggleOn as ToggleIcon,
  Groups as TeamSettingsIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useRouter } from "next/router";
import AdminPage from "../../../components/admin/AdminPage";
import DonationManagement from "../../../components/admin/DonationManagement";
import CountdownManagement from "../../../components/admin/CountdownManagement";
import LinkManagement from "../../../components/admin/LinkManagement";
import HackathonDuplicator from "../../../components/admin/HackathonDuplicator";
import NonprofitManagement from "../../../components/admin/NonprofitManagement";
import MealManagement from "../../../components/admin/MealManagement";
import EventMediaManagement from "../../../components/admin/EventMediaManagement";
import TimezoneSelect from "react-timezone-select";
import { DEFAULT_EVENT_TIMEZONE } from "../../../lib/timezoneUtils";

const AdminHackathonPage = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [editDialogTabValue, setEditDialogTabValue] = useState(0);

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Sort hackathons by start_date in descending order (newest first)
        const sortedHackathons = [...(data.hackathons || [])].sort((a, b) => {
          return new Date(b.start_date) - new Date(a.start_date);
        });
        setHackathons(sortedHackathons);
      } else {
        throw new Error("Failed to fetch hackathons");
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch hackathons. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId]);

  useEffect(() => {
    if (isAdmin) {
      fetchHackathons();
    }
  }, [isAdmin]);

  const handleCountdownsChange = (newCountdowns) => {
    setEditingHackathon((prev) => ({
      ...prev,
      countdowns: newCountdowns,
    }));
  };

  const handleEditHackathon = (hackathon) => {
    setEditingHackathon({
      ...hackathon,
      start_date: hackathon.start_date ? hackathon.start_date.split('T')[0] : '',
      end_date: hackathon.end_date ? hackathon.end_date.split('T')[0] : '',
    });
    setEditDialogTabValue(0); // Reset to first tab
    setEditDialogOpen(true);
  };

  const handleAddHackathon = () => {
    setEditingHackathon({
      title: "",
      description: "",
      start_date: null,
      end_date: null,
      event_id: "",
      location: "",
      image_url: "",
      type: "",
      links: [],
      countdowns: [],
      event_photos: [],
      social_posts: [],
      constraints: {
        max_people_per_team: 5,
        max_teams_per_problem: 10,
        min_people_per_team: 2,
        hacker_required_questions: { questions: [] },
      },
      donation_current: {
        food: '0',
        prize: '0',
        swag: '0',
        thank_you: '',
      },
      donation_goals: {
        food: '0',
        prize: '0',
        swag: '0',
      },
    });
    setEditDialogTabValue(0); // Reset to first tab
    setEditDialogOpen(true);
  };

  const handleDonationDataChange = (newDonationData) => {
    setEditingHackathon((prev) => ({
      ...prev,
      donation_current: newDonationData.donation_current,
      donation_goals: newDonationData.donation_goals,
    }));
  };

  const handleSaveHackathon = async () => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon`;
      const method = editingHackathon.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(editingHackathon),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingHackathon.id
            ? "Hackathon updated successfully"
            : "Hackathon created successfully",
          severity: "success",
        });
        fetchHackathons();
      } else {
        throw new Error(
          editingHackathon.id
            ? "Failed to update hackathon"
            : "Failed to create hackathon"
        );
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${
          editingHackathon.id ? "update" : "create"
        } hackathon. Please try again.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditingHackathon((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLink = () => {
    setEditingHackathon((prev) => ({
      ...prev,
      links: [...prev.links, { name: "", link: "", color: "", open_new: false, size: "medium", variant: "text" }],
    }));
  };

  const handleUpdateLink = (index, field, value) => {
    setEditingHackathon((prev) => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
  };

  const handleRemoveLink = (index) => {
    setEditingHackathon((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleAddCountdown = () => {
    setEditingHackathon((prev) => ({
      ...prev,
      countdowns: [...prev.countdowns, { name: "", description: "", time: new Date() }],
    }));
  };

  const handleUpdateCountdown = (index, field, value) => {
    setEditingHackathon((prev) => {
      const newCountdowns = [...prev.countdowns];
      newCountdowns[index] = { ...newCountdowns[index], [field]: value };
      return { ...prev, countdowns: newCountdowns };
    });
  };

  const handleRemoveCountdown = (index) => {
    setEditingHackathon((prev) => ({
      ...prev,
      countdowns: prev.countdowns.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateConstraint = (field, value) => {
    setEditingHackathon((prev) => ({
      ...prev,
      constraints: { ...prev.constraints, [field]: value },
    }));
  };

  const handleUpdateDeposit = (field, value) => {
    setEditingHackathon((prev) => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        hacker_deposit: {
          enabled: false,
          default_amount_cents: 500,
          ...(prev.constraints?.hacker_deposit || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleAddRequiredQuestion = () => {
    setEditingHackathon((prev) => {
      const questions = prev.constraints?.hacker_required_questions?.questions || [];
      return {
        ...prev,
        constraints: {
          ...prev.constraints,
          hacker_required_questions: {
            questions: [...questions, { question: "", required_answer: true, error: "" }],
          },
        },
      };
    });
  };

  const handleUpdateRequiredQuestion = (index, field, value) => {
    setEditingHackathon((prev) => {
      const questions = [...(prev.constraints?.hacker_required_questions?.questions || [])];
      questions[index] = { ...questions[index], [field]: value };
      return {
        ...prev,
        constraints: {
          ...prev.constraints,
          hacker_required_questions: { questions },
        },
      };
    });
  };

  const handleRemoveRequiredQuestion = (index) => {
    setEditingHackathon((prev) => {
      const questions = (prev.constraints?.hacker_required_questions?.questions || []).filter(
        (_, i) => i !== index
      );
      return {
        ...prev,
        constraints: {
          ...prev.constraints,
          hacker_required_questions: { questions },
        },
      };
    });
  };

  const handleNonprofitUpdate = useCallback(() => {
    setSnackbar({
      open: true,
      message: "Nonprofit settings updated successfully",
      severity: "success",
    });

    fetchHackathons(); // Refresh the hackathon list after updating nonprofit settings    
  }, []);

  const handleNonprofitError = useCallback((errorMsg) => {
    setSnackbar({
      open: true,
      message: errorMsg || "Failed to update nonprofit settings",
      severity: "error",
    });
  }, []);

  if (!isAdmin) {
    return (        
        <RequiredAuthProvider
            authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
            displayIfLoggedOut={<RedirectToLogin
      postLoginRedirectUrl={typeof window !== 'undefined' ? window.location.href : ''}
    />}
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
            displayIfLoggedOut={
                <RedirectToLogin
      postLoginRedirectUrl={typeof window !== 'undefined' ? window.location.href : ''}
    />
            }
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
            <Button
              onClick={handleAddHackathon}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
            >
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
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {hackathon.title}
                      </Typography>
                      <Chip
                        label={hackathon.event_id}
                        color="primary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleEditHackathon(hackathon)} size="small">
                        <EditIcon />
                      </IconButton>
                      <HackathonDuplicator
                        hackathon={hackathon}
                        onDuplicate={(newHackathon) => {
                          fetchHackathons();
                          setSnackbar({
                            open: true,
                            message: "Hackathon duplicated successfully",
                            severity: "success",
                          });
                        }}
                        accessToken={accessToken}
                        orgId={orgId}
                      />
                    </Box>
                  </Box>

                  {/* Event Details */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📅 {hackathon.start_date} to {hackathon.end_date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📍 {hackathon.location}
                    </Typography>
                    {hackathon.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {hackathon.description.length > 100
                          ? `${hackathon.description.substring(0, 100)}...`
                          : hackathon.description
                        }
                      </Typography>
                    )}
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 1.5, pt: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', textAlign: 'left' }}>
                    Admin Tools:
                  </Typography>

                  {/* Admin Tool Buttons - Compact Stack Layout */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<TeamsIcon />}
                        variant="outlined"
                        onClick={() => router.push(`/admin/teams?event_id=${hackathon.event_id}`)}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          minHeight: 32,
                          px: 0.5,
                          '& .MuiButton-startIcon': {
                            mr: 0.5
                          }
                        }}
                      >
                        Teams
                      </Button>
                      <Button
                        size="small"
                        startIcon={<VolunteerIcon />}
                        variant="outlined"
                        onClick={() => router.push(`/admin/volunteer?event_id=${hackathon.event_id}`)}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          minHeight: 32,
                          px: 0.5,
                          '& .MuiButton-startIcon': {
                            mr: 0.5
                          }
                        }}
                      >
                        Volunteer
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<CheckInIcon />}
                        variant="outlined"
                        onClick={() => router.push(`/admin/check-in?event_id=${hackathon.event_id}`)}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          minHeight: 32,
                          px: 0.5,
                          '& .MuiButton-startIcon': {
                            mr: 0.5
                          }
                        }}
                      >
                        Check-in
                      </Button>
                      <Button
                        size="small"
                        startIcon={<JudgingIcon />}
                        variant="outlined"
                        onClick={() => router.push(`/admin/judging?event_id=${hackathon.event_id}`)}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          minHeight: 32,
                          px: 0.5,
                          '& .MuiButton-startIcon': {
                            mr: 0.5
                          }
                        }}
                      >
                        Judging
                      </Button>
                    </Box>
                  </Stack>

                  {/* View Event Link */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LaunchIcon />}
                    onClick={() => window.open(`/hack/${hackathon.event_id}`, '_blank')}
                    sx={{ textTransform: 'none', minHeight: 36 }}
                  >
                    View Event Page
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingHackathon?.id ? "Edit Hackathon" : "Add Hackathon"}
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={editDialogTabValue}
            onChange={(e, newValue) => setEditDialogTabValue(newValue)}
            aria-label="hackathon edit tabs"
            sx={{ mb: 3 }}
          >
            <Tab label="Basic Info" value={0} />
            <Tab label="Nonprofits" value={1} disabled={!editingHackathon?.id} />
            <Tab label="Advanced Settings" value={2} />
          </Tabs>

          {editDialogTabValue === 0 && (
            <>
              <TextField
                fullWidth
                label="Title"
                value={editingHackathon?.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={editingHackathon?.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                margin="normal"
                multiline
                rows={4}
              />
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={editingHackathon?.start_date || ""}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={editingHackathon?.end_date || ""}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                margin="normal"
                />
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Event Timezone
                </Typography>
                <TimezoneSelect
                  value={{ value: editingHackathon?.timezone || DEFAULT_EVENT_TIMEZONE, label: editingHackathon?.timezone || DEFAULT_EVENT_TIMEZONE }}
                  onChange={(tz) => handleInputChange("timezone", tz.value)}
                />
              </Box>
              <TextField
                fullWidth
                label="Event ID"
                value={editingHackathon?.event_id || ""}
                onChange={(e) => handleInputChange("event_id", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Location"
                value={editingHackathon?.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Image URL"
                value={editingHackathon?.image_url || ""}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Type"
                value={editingHackathon?.type || ""}
                onChange={(e) => handleInputChange("type", e.target.value)}
                margin="normal"
              />
            </>
          )}

          {editDialogTabValue === 1 && editingHackathon?.id && (
            <NonprofitManagement 
              hackathon={editingHackathon}
              accessToken={accessToken}
              orgId={orgId}
              onUpdate={handleNonprofitUpdate}
              onError={handleNonprofitError}
            />
          )}

          {editDialogTabValue === 2 && (
            <>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Links</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <LinkManagement
                    links={editingHackathon?.links || []}
                    onChange={(newLinks) => handleInputChange('links', newLinks)}
                    />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Countdowns</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CountdownManagement
                    countdowns={editingHackathon?.countdowns || []}
                    onChange={handleCountdownsChange}
                    eventTimezone={editingHackathon?.timezone || DEFAULT_EVENT_TIMEZONE}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Constraints</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    label="Max People Per Team"
                    type="number"
                    value={editingHackathon?.constraints.max_people_per_team || ""}
                    onChange={(e) => handleUpdateConstraint("max_people_per_team", parseInt(e.target.value, 10))}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Max Teams Per Problem"
                    type="number"
                    value={editingHackathon?.constraints.max_teams_per_problem || ""}
                    onChange={(e) => handleUpdateConstraint("max_teams_per_problem", parseInt(e.target.value, 10))}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Min People Per Team"
                    type="number"
                    value={editingHackathon?.constraints.min_people_per_team || ""}
                    onChange={(e) => handleUpdateConstraint("min_people_per_team", parseInt(e.target.value, 10))}
                    fullWidth
                    margin="normal"
                  />

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <ToggleIcon fontSize="small" /> Application Toggles
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ml: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.application_hacker_enabled}
                            onChange={(e) => handleUpdateConstraint("application_hacker_enabled", e.target.checked)}
                          />
                        }
                        label="Hacker Applications"
                      />
                      {!!editingHackathon?.constraints?.application_hacker_enabled && (
                        <TextField
                          label="External Hacker Application URL"
                          value={editingHackathon?.constraints?.application_hacker_external_url || ""}
                          onChange={(e) => handleUpdateConstraint("application_hacker_external_url", e.target.value)}
                          fullWidth
                          margin="dense"
                          helperText="Leave blank to use built-in form. Must start with http:// or https://"
                          error={
                            !!editingHackathon?.constraints?.application_hacker_external_url &&
                            !editingHackathon.constraints.application_hacker_external_url.match(/^https?:\/\//)
                          }
                          sx={{ ml: 4, maxWidth: 500 }}
                        />
                      )}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.application_mentor_enabled}
                            onChange={(e) => handleUpdateConstraint("application_mentor_enabled", e.target.checked)}
                          />
                        }
                        label="Mentor Applications"
                      />
                      {!!editingHackathon?.constraints?.application_mentor_enabled && (
                        <TextField
                          label="External Mentor Application URL"
                          value={editingHackathon?.constraints?.application_mentor_external_url || ""}
                          onChange={(e) => handleUpdateConstraint("application_mentor_external_url", e.target.value)}
                          fullWidth
                          margin="dense"
                          helperText="Leave blank to use built-in form. Must start with http:// or https://"
                          error={
                            !!editingHackathon?.constraints?.application_mentor_external_url &&
                            !editingHackathon.constraints.application_mentor_external_url.match(/^https?:\/\//)
                          }
                          sx={{ ml: 4, maxWidth: 500 }}
                        />
                      )}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.application_judge_enabled}
                            onChange={(e) => handleUpdateConstraint("application_judge_enabled", e.target.checked)}
                          />
                        }
                        label="Judge Applications"
                      />
                      {!!editingHackathon?.constraints?.application_judge_enabled && (
                        <TextField
                          label="External Judge Application URL"
                          value={editingHackathon?.constraints?.application_judge_external_url || ""}
                          onChange={(e) => handleUpdateConstraint("application_judge_external_url", e.target.value)}
                          fullWidth
                          margin="dense"
                          helperText="Leave blank to use built-in form. Must start with http:// or https://"
                          error={
                            !!editingHackathon?.constraints?.application_judge_external_url &&
                            !editingHackathon.constraints.application_judge_external_url.match(/^https?:\/\//)
                          }
                          sx={{ ml: 4, maxWidth: 500 }}
                        />
                      )}
                      <TextField
                        label="Judge Access Code"
                        value={editingHackathon?.constraints?.application_judge_enabled_code || ""}
                        onChange={(e) => handleUpdateConstraint("application_judge_enabled_code", e.target.value)}
                        fullWidth
                        margin="dense"
                        helperText="Judges enter this code to access the application, even when judge applications are disabled"
                        sx={{ ml: 4, maxWidth: 400 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.application_nonprofit_enabled}
                            onChange={(e) => handleUpdateConstraint("application_nonprofit_enabled", e.target.checked)}
                          />
                        }
                        label="Nonprofit Applications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.application_sponsor_enabled}
                            onChange={(e) => handleUpdateConstraint("application_sponsor_enabled", e.target.checked)}
                          />
                        }
                        label="Sponsor Applications"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <TeamSettingsIcon fontSize="small" /> Team Settings
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ml: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.team_creation_enabled}
                            onChange={(e) => handleUpdateConstraint("team_creation_enabled", e.target.checked)}
                          />
                        }
                        label="Team Creation"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.team_join_enabled}
                            onChange={(e) => handleUpdateConstraint("team_join_enabled", e.target.checked)}
                          />
                        }
                        label="Team Joining"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editingHackathon?.constraints?.team_find_a_team_enabled}
                            onChange={(e) => handleUpdateConstraint("team_find_a_team_enabled", e.target.checked)}
                          />
                        }
                        label="Find a Team"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                      <QuizIcon fontSize="small" /> Hacker Screening Questions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add eligibility questions that applicants must answer correctly to proceed with their hacker application.
                      Use this for event-specific gates (e.g., "Are you a member of ASU WiCS?").
                    </Typography>

                    {(editingHackathon?.constraints?.hacker_required_questions?.questions || []).map((q, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Question {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveRequiredQuestion(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <TextField
                          label="Question Text"
                          fullWidth
                          value={q.question || ""}
                          onChange={(e) => handleUpdateRequiredQuestion(index, "question", e.target.value)}
                          margin="dense"
                          placeholder="e.g., Are you a current member of ASU WiCS?"
                        />
                        <FormControl fullWidth margin="dense">
                          <InputLabel id={`required-answer-label-${index}`}>Required Answer</InputLabel>
                          <Select
                            labelId={`required-answer-label-${index}`}
                            value={q.required_answer === true || q.required_answer === "true" ? "yes" : "no"}
                            label="Required Answer"
                            onChange={(e) => handleUpdateRequiredQuestion(index, "required_answer", e.target.value === "yes")}
                          >
                            <MenuItem value="yes">Yes (applicant must answer Yes)</MenuItem>
                            <MenuItem value="no">No (applicant must answer No)</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Error Message"
                          fullWidth
                          value={q.error || ""}
                          onChange={(e) => handleUpdateRequiredQuestion(index, "error", e.target.value)}
                          margin="dense"
                          placeholder="e.g., This hackathon is only open to ASU WiCS members."
                          helperText="Shown when an applicant gives the wrong answer"
                        />
                      </Card>
                    ))}

                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddRequiredQuestion}
                      variant="outlined"
                      size="small"
                    >
                      Add Question
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Judges — Venue Arrival Time</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The time judges should arrive at the venue (24-hour, HH:MM, in the event's timezone). When set, the judge application's Availability step displays this time. Leave blank to use the default copy.
                  </Typography>
                  <TextField
                    label="Judge venue arrival time"
                    placeholder="16:00"
                    type="time"
                    value={editingHackathon?.constraints?.judge_venue_arrival_time || ""}
                    onChange={(e) => handleUpdateConstraint("judge_venue_arrival_time", e.target.value || null)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    margin="normal"
                    sx={{ maxWidth: 240 }}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Hackers — Deposit (Stripe)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    When enabled, hackers pay a small deposit at application time. They can choose to donate it or request a refund after completing the hackathon. They can also choose to pay more than the default amount.
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!editingHackathon?.constraints?.hacker_deposit?.enabled}
                        onChange={(e) => handleUpdateDeposit("enabled", e.target.checked)}
                      />
                    }
                    label="Require hacker deposit"
                  />
                  {!!editingHackathon?.constraints?.hacker_deposit?.enabled && (
                    <TextField
                      label="Default deposit amount (USD)"
                      type="number"
                      value={(((editingHackathon?.constraints?.hacker_deposit?.default_amount_cents ?? 500) / 100)).toString()}
                      onChange={(e) => {
                        const dollars = parseFloat(e.target.value);
                        const cents = Number.isFinite(dollars) ? Math.round(dollars * 100) : 500;
                        handleUpdateDeposit("default_amount_cents", cents);
                      }}
                      inputProps={{ min: 1, max: 500, step: 1 }}
                      helperText="Defaults to $5. Hackers can choose to pay more on the form."
                      sx={{ ml: 4, mt: 1, maxWidth: 240 }}
                    />
                  )}
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Meals & Catering</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MealManagement
                    meals={editingHackathon?.constraints?.meals || []}
                    onChange={(newMeals) => handleUpdateConstraint("meals", newMeals)}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Event Photos & Social Posts</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <EventMediaManagement
                    eventId={editingHackathon?.event_id}
                    accessToken={accessToken}
                    orgId={orgId}
                    photos={editingHackathon?.event_photos || []}
                    onPhotosChange={(p) => handleInputChange("event_photos", p)}
                    socialPosts={editingHackathon?.social_posts || []}
                    onSocialPostsChange={(s) => handleInputChange("social_posts", s)}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Donations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DonationManagement
                    initialDonationData={{
                      donation_current: editingHackathon?.donation_current,
                      donation_goals: editingHackathon?.donation_goals,
                    }}
                    onDonationDataChange={handleDonationDataChange}
                  />
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          {editDialogTabValue !== 1 && (
            <Button onClick={handleSaveHackathon} color="primary">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AdminPage>
    </RequiredAuthProvider>
  );
}

export default AdminHackathonPage;