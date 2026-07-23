import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Chip,
} from "@mui/material";
import {
  GitHub as GitHubIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";

import AdminPage from "../../../components/admin/AdminPage";
import GithubWatcherEditDialog from "../../../components/admin/praisebot/GithubWatcherEditDialog";
import CalendarReminderEditDialog from "../../../components/admin/praisebot/CalendarReminderEditDialog";
import CronInput, { isValidCron } from "../../../components/admin/praisebot/CronInput";

const TAB_SLUGS = ["github", "calendar", "community", "global"];
const API_BASE = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/praise-bot/admin/config`;

const sourceSummary = (watcher) => {
  const source = watcher.source || {};
  if (source.mode === "hackathon") return `Hackathon: ${source.event_id}`;
  const repoCount = (source.repos || []).length;
  const channels = (source.channels || []).join(", #");
  return `${repoCount} repo${repoCount === 1 ? "" : "s"} → #${channels}`;
};

const PraiseBotAdminPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [watcherDialogOpen, setWatcherDialogOpen] = useState(false);
  const [editingWatcher, setEditingWatcher] = useState(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Local edit state for the singleton Community + Global forms
  const [communityForm, setCommunityForm] = useState(null);
  const [globalForm, setGlobalForm] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org?.orgId;
  const isAdmin = org?.hasPermission("volunteer.admin");

  const headers = {
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
    "X-Org-Id": orgId,
  };

  const handleSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const idx = TAB_SLUGS.indexOf(router.query.tab);
    if (idx >= 0) setActiveTab(idx);
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: TAB_SLUGS[newValue] } },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setConfig(data);
      setCommunityForm(
        data.community || {
          enabled: false,
          intro_channel: "introductions",
          matchmaker: { enabled: true, max_matches: 3 },
          digest: { enabled: false, cron: "0 17 * * 1", channel: "general" },
          lookback_days: 7,
          dry_run: true,
        }
      );
      setGlobalForm({
        dry_run: Boolean(data.global?.dry_run),
        llm_enabled: data.global?.llm_enabled !== false,
        timezone: data.global?.timezone || "",
      });
    } catch (error) {
      handleSnackbar("Failed to load praise-bot config. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId]);

  const fetchHackathons = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`
      );
      if (response.ok) {
        const data = await response.json();
        setHackathons(Array.isArray(data) ? data : data.hackathons || []);
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && accessToken) {
      fetchConfig();
      fetchHackathons();
    }
  }, [isAdmin, accessToken, fetchConfig, fetchHackathons]);

  const saveDoc = async (doc) => {
    const isUpdate = Boolean(doc.id);
    const url = isUpdate ? `${API_BASE}/${doc.id}` : API_BASE;
    const body = { ...doc };
    delete body.id;
    const response = await fetch(url, {
      method: isUpdate ? "PATCH" : "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      handleSnackbar(data.error || "Save failed", "error");
      return false;
    }
    handleSnackbar("Saved — the bot picks this up within ~1 minute", "success");
    fetchConfig();
    return true;
  };

  const deleteDoc = async (docId, label) => {
    if (!window.confirm(`Delete "${label}"? The bot will stop this job within a minute.`)) return;
    const response = await fetch(`${API_BASE}/${docId}`, { method: "DELETE", headers });
    if (response.ok) {
      handleSnackbar("Deleted", "success");
      fetchConfig();
    } else {
      const data = await response.json().catch(() => ({}));
      handleSnackbar(data.error || "Delete failed", "error");
    }
  };

  const toggleEnabled = async (doc) => {
    const response = await fetch(`${API_BASE}/${doc.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ enabled: !doc.enabled }),
    });
    if (response.ok) {
      fetchConfig();
    } else {
      handleSnackbar("Failed to toggle", "error");
    }
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Praise Bot" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const watchers = config?.github_watchers || [];
  const reminders = config?.calendar_reminders || [];

  const renderGithubTab = () => (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="body1">
          Each watcher posts a repo digest (and optional mentor rollup) on its own
          schedule — from a hackathon&apos;s team channels or an explicit repo → channel list.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingWatcher(null);
            setWatcherDialogOpen(true);
          }}
          sx={{ whiteSpace: "nowrap", ml: 2 }}
        >
          Add Watcher
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Digest cron (UTC)</TableCell>
              <TableCell>Rollup</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {watchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No watchers yet — the bot is running on its env-var defaults.
                    Add a watcher to take over from here.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {watchers.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{w.name}</TableCell>
                <TableCell>
                  <Switch checked={w.enabled !== false} onChange={() => toggleEnabled(w)} size="small" />
                </TableCell>
                <TableCell>{sourceSummary(w)}</TableCell>
                <TableCell>
                  {w.digest?.enabled ? <code>{w.digest.cron}</code> : <Chip label="off" size="small" />}
                </TableCell>
                <TableCell>
                  {w.rollup?.enabled ? (
                    <span>
                      <code>{w.rollup.cron}</code> → #{w.rollup.channel}
                    </span>
                  ) : (
                    <Chip label="off" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingWatcher(w);
                      setWatcherDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => deleteDoc(w.id, w.name)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderCalendarTab = () => (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="body1">
          Reminders are posted before events on a public Google Calendar (via its ICS feed).
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingReminder(null);
            setReminderDialogOpen(true);
          }}
          sx={{ whiteSpace: "nowrap", ml: 2 }}
        >
          Add Reminder
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Channels</TableCell>
              <TableCell>Lead</TableCell>
              <TableCell>Poll cron (UTC)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reminders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No reminders configured — env-var defaults apply.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {reminders.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>
                  <Switch checked={r.enabled !== false} onChange={() => toggleEnabled(r)} size="small" />
                </TableCell>
                <TableCell>#{(r.channels || []).join(", #")}</TableCell>
                <TableCell>{r.lead_minutes}m</TableCell>
                <TableCell>
                  <code>{r.poll_cron}</code>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingReminder(r);
                      setReminderDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => deleteDoc(r.id, r.name)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const setCommunity = (patch) => setCommunityForm((f) => ({ ...f, ...patch }));

  const saveCommunity = async () => {
    if (communityForm.digest?.enabled && !isValidCron(communityForm.digest?.cron || "")) {
      handleSnackbar("Community digest cron must be a 5-field expression", "error");
      return;
    }
    await saveDoc({
      id: config?.community?.id,
      type: "community",
      enabled: communityForm.enabled,
      intro_channel: communityForm.intro_channel,
      matchmaker: communityForm.matchmaker,
      digest: communityForm.digest,
      lookback_days: parseInt(communityForm.lookback_days, 10) || 7,
      dry_run: communityForm.dry_run,
    });
  };

  const renderCommunityTab = () =>
    communityForm && (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 720 }}>
        <Typography variant="body1">
          Community engagement: when someone posts in the intro channel, the bot
          replies in-thread with a welcome and &quot;you might want to meet&quot;
          suggestions based on earlier intros. A weekly digest highlights new
          members. Suggestions only use what members posted publicly in the intro channel.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(communityForm.enabled)}
              onChange={(e) => setCommunity({ enabled: e.target.checked })}
            />
          }
          label="Community features enabled"
        />
        <TextField
          label="Introductions channel (name or C… ID)"
          value={communityForm.intro_channel || ""}
          onChange={(e) => setCommunity({ intro_channel: e.target.value })}
          sx={{ maxWidth: 400 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(communityForm.matchmaker?.enabled)}
              onChange={(e) =>
                setCommunity({
                  matchmaker: { ...communityForm.matchmaker, enabled: e.target.checked },
                })
              }
            />
          }
          label="Intro matchmaker (threaded welcome + similar-member suggestions)"
        />
        {communityForm.matchmaker?.enabled && (
          <TextField
            label="Max matches per intro"
            type="number"
            value={communityForm.matchmaker?.max_matches ?? 3}
            onChange={(e) =>
              setCommunity({
                matchmaker: {
                  ...communityForm.matchmaker,
                  max_matches: parseInt(e.target.value, 10) || 3,
                },
              })
            }
            sx={{ maxWidth: 280 }}
          />
        )}
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(communityForm.digest?.enabled)}
              onChange={(e) =>
                setCommunity({ digest: { ...communityForm.digest, enabled: e.target.checked } })
              }
            />
          }
          label="Weekly community digest (new faces this week)"
        />
        {communityForm.digest?.enabled && (
          <>
            <CronInput
              label="Digest"
              value={communityForm.digest?.cron || ""}
              onChange={(cron) => setCommunity({ digest: { ...communityForm.digest, cron } })}
            />
            <TextField
              label="Digest channel (name or C… ID)"
              value={communityForm.digest?.channel || ""}
              onChange={(e) =>
                setCommunity({ digest: { ...communityForm.digest, channel: e.target.value } })
              }
              sx={{ maxWidth: 400 }}
            />
            <TextField
              label="Lookback days"
              type="number"
              value={communityForm.lookback_days ?? 7}
              onChange={(e) => setCommunity({ lookback_days: e.target.value })}
              sx={{ maxWidth: 280 }}
            />
          </>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(communityForm.dry_run)}
              onChange={(e) => setCommunity({ dry_run: e.target.checked })}
            />
          }
          label="Dry run (log instead of posting — recommended for the first week)"
        />
        <Box>
          <Button variant="contained" onClick={saveCommunity}>
            Save Community Settings
          </Button>
        </Box>
      </Box>
    );

  const saveGlobal = async () => {
    await saveDoc({ id: "global", type: "global", ...globalForm });
  };

  const renderGlobalTab = () =>
    globalForm && (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 720 }}>
        <FormControlLabel
          control={
            <Switch
              checked={globalForm.dry_run}
              onChange={(e) => setGlobalForm({ ...globalForm, dry_run: e.target.checked })}
            />
          }
          label="Global dry run — all features log to the bot console instead of posting"
        />
        <FormControlLabel
          control={
            <Switch
              checked={globalForm.llm_enabled}
              onChange={(e) => setGlobalForm({ ...globalForm, llm_enabled: e.target.checked })}
            />
          }
          label="LLM insights (digest narratives, matchmaker suggestions)"
        />
        <TextField
          label="Timezone for cron schedules (optional)"
          value={globalForm.timezone}
          onChange={(e) => setGlobalForm({ ...globalForm, timezone: e.target.value })}
          helperText='IANA name, e.g. "America/Phoenix". Leave empty for UTC.'
          sx={{ maxWidth: 400 }}
        />
        <Box>
          <Button variant="contained" onClick={saveGlobal}>
            Save Global Settings
          </Button>
        </Box>
      </Box>
    );

  return (
    <AdminPage
      title="Praise Bot"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        The Slack bot picks up changes within ~1 minute — no redeploy needed.
        Cron times are UTC unless a timezone is set in the Global tab.
        {config && !config.configured && (
          <strong>
            {" "}
            No config saved yet: the bot is running on its env-var defaults.
          </strong>
        )}
      </Alert>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }} variant="scrollable">
        <Tab icon={<GitHubIcon />} iconPosition="start" label="GitHub Digests" />
        <Tab icon={<EventIcon />} iconPosition="start" label="Calendar Reminders" />
        <Tab icon={<GroupsIcon />} iconPosition="start" label="Community" />
        <Tab icon={<SettingsIcon />} iconPosition="start" label="Global" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && renderGithubTab()}
          {activeTab === 1 && renderCalendarTab()}
          {activeTab === 2 && renderCommunityTab()}
          {activeTab === 3 && renderGlobalTab()}
        </>
      )}

      <GithubWatcherEditDialog
        open={watcherDialogOpen}
        onClose={() => setWatcherDialogOpen(false)}
        watcher={editingWatcher}
        hackathons={hackathons}
        onSave={async (doc) => {
          const ok = await saveDoc(doc);
          if (ok) setWatcherDialogOpen(false);
        }}
      />
      <CalendarReminderEditDialog
        open={reminderDialogOpen}
        onClose={() => setReminderDialogOpen(false)}
        reminder={editingReminder}
        onSave={async (doc) => {
          const ok = await saveDoc(doc);
          if (ok) setReminderDialogOpen(false);
        }}
      />
    </AdminPage>
  );
});

export default PraiseBotAdminPage;
