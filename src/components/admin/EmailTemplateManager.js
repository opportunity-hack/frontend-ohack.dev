import React, { useMemo, useState, useCallback } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Restore as RestoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import useEmailTemplates from "../../hooks/use-email-templates";
import {
  detectPlaceholders,
  PLACEHOLDER_LABELS,
} from "../../lib/messageTemplates";
import * as ga from "../../lib/ga";

const KNOWN_ROLES = [
  "hacker",
  "hackers",
  "mentor",
  "mentors",
  "judge",
  "judges",
  "volunteer",
  "volunteers",
  "sponsor",
  "sponsors",
  "community members",
  "community",
  "slack",
];

const EMPTY_EDITOR = {
  title: "",
  category: "Custom",
  category_key: "CUSTOM",
  applicable_roles: [],
  icon: "✉️",
  message: "",
  change_note: "",
};

const formatWhen = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const actorLabel = (actor) =>
  actor?.name || actor?.email || actor?.propel_user_id || "Unknown";

const EmailTemplateManager = ({ accessToken, orgId, onSnack }) => {
  const { rawTemplates, loading, error, refresh } = useEmailTemplates({
    accessToken,
    orgId,
  });

  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState(null); // null = create
  const [editorDraft, setEditorDraft] = useState(EMPTY_EDITOR);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyVersions, setHistoryVersions] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [confirmRevert, setConfirmRevert] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const authHeaders = useMemo(
    () => ({
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(orgId ? { "X-Org-Id": orgId } : {}),
    }),
    [accessToken, orgId],
  );

  const snack = useCallback(
    (message, severity = "success") => {
      if (onSnack) onSnack(message, severity);
    },
    [onSnack],
  );

  const categories = useMemo(() => {
    const seen = new Map();
    (rawTemplates || []).forEach((t) => {
      const key = t.category_key || "CUSTOM";
      if (!seen.has(key)) seen.set(key, t.category || "Custom");
    });
    return seen;
  }, [rawTemplates]);

  const groupedRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = (rawTemplates || []).filter((t) => {
      if (!q) return true;
      return [t.title, t.message, t.category, ...(t.applicable_roles || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    const groups = new Map();
    filtered.forEach((t) => {
      const key = t.category_key || "CUSTOM";
      if (!groups.has(key)) {
        groups.set(key, { category: t.category || "Custom", templates: [] });
      }
      groups.get(key).templates.push(t);
    });
    return [...groups.entries()];
  }, [rawTemplates, search]);

  const openCreate = () => {
    setEditorTarget(null);
    setEditorDraft(EMPTY_EDITOR);
    setEditorOpen(true);
  };

  const openEdit = (template) => {
    setEditorTarget(template);
    setEditorDraft({
      title: template.title || "",
      category: template.category || "Custom",
      category_key: template.category_key || "CUSTOM",
      applicable_roles: template.applicable_roles || [],
      icon: template.icon || "✉️",
      message: template.message || "",
      change_note: "",
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isCreate = !editorTarget;
      const url = isCreate
        ? `${apiBase}/api/admin/templates`
        : `${apiBase}/api/admin/templates/${editorTarget.id}`;
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PATCH",
        headers: authHeaders,
        body: JSON.stringify(editorDraft),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.text || `Save failed (${res.status})`);
      }
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        isCreate ? "admin_template_create" : "admin_template_edit",
        isCreate ? editorDraft.title : editorTarget.id,
      );
      snack(isCreate ? "Template created" : "Template saved");
      setEditorOpen(false);
      await refresh(true);
    } catch (err) {
      console.error("Template save failed:", err);
      snack(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/templates/${target.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "admin_template_delete",
        target.id,
      );
      snack(`Deleted "${target.title}"`);
      await refresh(true);
    } catch (err) {
      console.error("Template delete failed:", err);
      snack(err.message || "Delete failed", "error");
    }
  };

  const openHistory = async (template) => {
    setHistoryTarget(template);
    setHistoryVersions(null);
    setHistoryLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/api/admin/templates/${template.id}/versions`,
        { headers: authHeaders },
      );
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const data = await res.json();
      setHistoryVersions(data.text || []);
    } catch (err) {
      console.error("Template history fetch failed:", err);
      snack(err.message || "Failed to load history", "error");
      setHistoryTarget(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRevert = async () => {
    const target = confirmRevert;
    setConfirmRevert(null);
    if (!target || !historyTarget) return;
    try {
      const res = await fetch(
        `${apiBase}/api/admin/templates/${historyTarget.id}/revert`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ version: target.version }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.text || `Revert failed (${res.status})`);
      }
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "admin_template_revert",
        `${historyTarget.id}@${target.version}`,
      );
      snack(`Reverted "${historyTarget.title}" to version ${target.version}`);
      setHistoryTarget(null);
      await refresh(true);
    } catch (err) {
      console.error("Template revert failed:", err);
      snack(err.message || "Revert failed", "error");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/templates/seed`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Restore failed (${res.status})`);
      const data = await res.json();
      snack(data.text || "Defaults restored");
      await refresh(true);
    } catch (err) {
      console.error("Template seed failed:", err);
      snack(err.message || "Restore failed", "error");
    } finally {
      setSeeding(false);
    }
  };

  const draftPlaceholders = detectPlaceholders(editorDraft.message);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <TextField
          size="small"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Reload templates from the server">
            <span>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => refresh(true)}
                disabled={loading}
              >
                Refresh
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Re-add any of the original default templates that were deleted. Never overwrites your edits.">
            <span>
              <Button
                size="small"
                startIcon={<RestoreIcon />}
                onClick={handleSeed}
                disabled={seeding}
              >
                Restore defaults
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            New template
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        These templates power the email buttons in the Volunteer admin sections
        (single and batch sends). Edits are versioned — use the history action
        to see who changed what and to roll back.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error} — the send-email dialogs will fall back to the built-in
          templates until this loads.
        </Alert>
      )}

      {loading && !rawTemplates && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {rawTemplates && groupedRows.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No templates match your search.
        </Typography>
      )}

      {groupedRows.map(([categoryKey, group]) => (
        <Box key={categoryKey} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {group.category}
          </Typography>
          <Stack spacing={1}>
            {group.templates.map((template) => (
              <Paper key={template.id} variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ md: "center" }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography component="span">{template.icon}</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {template.title}
                      </Typography>
                      <Chip label={`v${template.version || 1}`} size="small" />
                      {(template.applicable_roles || [])
                        .slice(0, 4)
                        .map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      {(template.applicable_roles || []).length > 4 && (
                        <Chip
                          label={`+${template.applicable_roles.length - 4}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {template.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated {formatWhen(template.updated_at)} by{" "}
                      {actorLabel(template.updated_by)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(template)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Version history">
                      <IconButton
                        size="small"
                        onClick={() => openHistory(template)}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setConfirmDelete(template)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      ))}

      {/* Create / Edit dialog */}
      <Dialog
        open={editorOpen}
        onClose={() => !saving && setEditorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editorTarget ? `Edit "${editorTarget.title}"` : "New template"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Title (used as email subject)"
                value={editorDraft.title}
                onChange={(e) =>
                  setEditorDraft((d) => ({ ...d, title: e.target.value }))
                }
                fullWidth
                required
              />
              <TextField
                label="Icon"
                value={editorDraft.icon}
                onChange={(e) =>
                  setEditorDraft((d) => ({ ...d, icon: e.target.value }))
                }
                sx={{ width: 90 }}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Autocomplete
                freeSolo
                options={[...categories.values()]}
                value={editorDraft.category}
                onInputChange={(e, value) => {
                  const existingKey = [...categories.entries()].find(
                    ([, label]) => label === value,
                  )?.[0];
                  setEditorDraft((d) => ({
                    ...d,
                    category: value,
                    category_key:
                      existingKey ||
                      value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]+/g, "_")
                        .replace(/^_|_$/g, "") ||
                      "CUSTOM",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    helperText="Pick an existing category or type a new one"
                  />
                )}
                fullWidth
              />
              <Autocomplete
                multiple
                freeSolo
                options={KNOWN_ROLES}
                value={editorDraft.applicable_roles}
                onChange={(e, value) =>
                  setEditorDraft((d) => ({ ...d, applicable_roles: value }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Applicable roles"
                    helperText="Controls which send-email dialogs offer this template"
                  />
                )}
                fullWidth
              />
            </Stack>
            <TextField
              label="Message body"
              value={editorDraft.message}
              onChange={(e) =>
                setEditorDraft((d) => ({ ...d, message: e.target.value }))
              }
              multiline
              rows={14}
              required
              helperText="Placeholders like [EVENT_ID], [VOLUNTEER_ID], [VOLUNTEER_TYPE] are auto-filled at send time; any other [UPPERCASE] placeholder prompts the sender for a value."
            />
            {draftPlaceholders.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Manual placeholders the sender will be asked to fill:
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}
                >
                  {draftPlaceholders.map((name) => (
                    <Chip
                      key={name}
                      size="small"
                      label={PLACEHOLDER_LABELS[name]?.label || name}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {editorTarget && (
              <TextField
                label="Change note (optional)"
                value={editorDraft.change_note}
                onChange={(e) =>
                  setEditorDraft((d) => ({ ...d, change_note: e.target.value }))
                }
                helperText="Shown in the version history, e.g. 'Updated venue details for Summer 2026'"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              saving || !editorDraft.title.trim() || !editorDraft.message.trim()
            }
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {editorTarget ? "Save new version" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete template?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes "{confirmDelete?.title}" and its entire
            version history.
            {confirmDelete?.origin === "seed" &&
              ' It is one of the original defaults, so "Restore defaults" can bring back the original version later (history will restart at v1).'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version history dialog */}
      <Dialog
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version history — {historyTarget?.title}</DialogTitle>
        <DialogContent>
          {historyLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {historyVersions && historyVersions.length === 0 && (
            <Typography color="text.secondary">
              No history recorded yet.
            </Typography>
          )}
          <Stack spacing={2}>
            {(historyVersions || []).map((v) => {
              const isCurrent = v.version === historyTarget?.version;
              return (
                <Paper key={v.version} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={`v${v.version}`}
                        size="small"
                        color={isCurrent ? "primary" : "default"}
                      />
                      {isCurrent && (
                        <Chip label="Current" size="small" color="success" />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {formatWhen(v.updated_at)} · {actorLabel(v.updated_by)}
                        {v.change_note ? ` · ${v.change_note}` : ""}
                      </Typography>
                    </Box>
                    {!isCurrent && (
                      <Button
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => setConfirmRevert(v)}
                      >
                        Revert to this
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="subtitle2">{v.title}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      maxHeight: 220,
                      overflow: "auto",
                    }}
                  >
                    {v.message}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryTarget(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Revert confirmation */}
      <Dialog open={!!confirmRevert} onClose={() => setConfirmRevert(null)}>
        <DialogTitle>Revert to version {confirmRevert?.version}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The content of version {confirmRevert?.version} will be saved as a
            new version. Nothing is deleted — you can always revert again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRevert(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleRevert}>
            Revert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplateManager;
