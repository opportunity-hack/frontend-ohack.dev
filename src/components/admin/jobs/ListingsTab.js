import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Launch as LaunchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import * as ga from "../../../lib/ga";

// Volunteer job listings CRUD (job_listings collection via /api/jobs/admin/*).
// A simple table + edit Dialog — there are only ever a handful of listings, so
// no blog-style editor pages. Slug is create-only (it's the Firestore doc id
// and the public URL).

const STATUS_OPTIONS = ["draft", "published", "hidden", "closed"];
const LOCATION_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "phoenix_in_person", label: "Phoenix — in person" },
  { value: "hybrid", label: "Hybrid / remote-friendly" },
];

const statusChipColor = (status) => {
  if (status === "published") return "success";
  if (status === "draft") return "warning";
  if (status === "closed") return "default";
  return "default"; // hidden
};

const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EMPTY_LISTING = {
  slug: "",
  title: "",
  status: "draft",
  location_type: "remote",
  location_label: "",
  hours_per_week_label: "",
  min_hours_per_week: 0,
  duration_ask: "",
  summary: "",
  description_markdown: "",
  work_sample_prompt: "",
  video_prompts: [],
  valid_through: "",
};

export default function ListingsTab({ accessToken, orgId, isAdmin, onSnack }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | {isNew, draft}
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const authHeaders = useCallback(
    () => ({
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(orgId ? { "X-Org-Id": orgId } : {}),
    }),
    [accessToken, orgId],
  );

  const fetchListings = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/jobs/admin/listings`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to load listings (${res.status})`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiBase, accessToken, isAdmin, authHeaders]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const openNew = () => setEditing({ isNew: true, draft: { ...EMPTY_LISTING } });
  const openEdit = (listing) =>
    setEditing({
      isNew: false,
      draft: { ...EMPTY_LISTING, ...listing },
    });

  const setDraftField = (field, value) =>
    setEditing((prev) => ({ ...prev, draft: { ...prev.draft, [field]: value } }));

  const handleSave = async () => {
    const { isNew, draft } = editing;
    const payload = {
      title: draft.title,
      status: draft.status,
      location_type: draft.location_type,
      location_label: draft.location_label,
      hours_per_week_label: draft.hours_per_week_label,
      min_hours_per_week: Number(draft.min_hours_per_week) || 0,
      duration_ask: draft.duration_ask,
      summary: draft.summary,
      description_markdown: draft.description_markdown,
      work_sample_prompt: draft.work_sample_prompt,
      video_prompts: (Array.isArray(draft.video_prompts)
        ? draft.video_prompts
        : String(draft.video_prompts).split("\n")
      )
        .map((p) => p.trim())
        .filter(Boolean),
      valid_through: draft.valid_through,
    };
    setSaving(true);
    try {
      const res = isNew
        ? await fetch(`${apiBase}/api/jobs/admin/listings`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ ...payload, slug: draft.slug }),
          })
        : await fetch(`${apiBase}/api/jobs/admin/listings/${draft.slug}`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(payload),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
      onSnack(`Saved "${draft.title}"`, "success");
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_jobs_listing_save", draft.slug);
      setEditing(null);
      await fetchListings();
    } catch (err) {
      onSnack(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (listing, status) => {
    try {
      const res = await fetch(`${apiBase}/api/jobs/admin/listings/${listing.slug}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setListings((prev) =>
        prev.map((l) => (l.slug === listing.slug ? { ...l, status } : l)),
      );
      onSnack(`"${listing.title}" is now ${status}`, "success");
    } catch (err) {
      onSnack(err.message || "Update failed", "error");
    }
  };

  const handleDelete = async () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;
    try {
      const res = await fetch(`${apiBase}/api/jobs/admin/listings/${target.slug}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setListings((prev) => prev.filter((l) => l.slug !== target.slug));
      onSnack(`Deleted "${target.title}"`, "success");
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_jobs_listing_delete", target.slug);
    } catch (err) {
      onSnack(err.message || "Delete failed", "error");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
          Volunteer roles shown on{" "}
          <a href="/jobs" target="_blank" rel="noopener noreferrer">
            ohack.dev/jobs
          </a>
          . New listings start as drafts; publish when the copy is ready. Hide
          takes a listing off the site without deleting applications.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} size="large">
          New listing
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Hrs/wk</TableCell>
                  <TableCell>Valid through</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.slug} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {listing.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /jobs/{listing.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={listing.status}
                        color={statusChipColor(listing.status)}
                        variant={listing.status === "hidden" ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>{listing.location_label || listing.location_type}</TableCell>
                    <TableCell>{listing.hours_per_week_label}</TableCell>
                    <TableCell>{listing.valid_through || "—"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(listing)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View public page">
                        <IconButton
                          size="small"
                          href={`/jobs/${listing.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {listing.status === "published" ? (
                        <Tooltip title="Hide from the site">
                          <IconButton
                            size="small"
                            onClick={() => handleQuickStatus(listing, "hidden")}
                          >
                            <VisibilityOffIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Publish">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleQuickStatus(listing, "published")}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirmDelete(listing)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {listings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 4 }}
                      >
                        No listings yet — click New listing, or run{" "}
                        <code>scripts/seed_job_listings.py --apply</code> on the
                        backend to seed the three Fall 2026 roles.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* --------- Edit / create dialog --------- */}
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="md" fullWidth>
        <DialogTitle>{editing?.isNew ? "New listing" : `Edit: ${editing?.draft.title}`}</DialogTitle>
        {editing && (
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <TextField
                label="Title"
                required
                fullWidth
                value={editing.draft.title}
                onChange={(e) => {
                  setDraftField("title", e.target.value);
                  if (editing.isNew && !editing.draft.slugTouched) {
                    setEditing((prev) => ({
                      ...prev,
                      draft: {
                        ...prev.draft,
                        title: e.target.value,
                        slug: slugify(e.target.value),
                      },
                    }));
                  }
                }}
              />
              <TextField
                label="Slug (public URL: /jobs/<slug>)"
                required
                fullWidth
                disabled={!editing.isNew}
                helperText={
                  editing.isNew
                    ? "Lowercase letters, digits, hyphens. Cannot be changed after creation."
                    : "Slug is fixed after creation (it's the public URL)."
                }
                value={editing.draft.slug}
                onChange={(e) =>
                  setEditing((prev) => ({
                    ...prev,
                    draft: { ...prev.draft, slug: slugify(e.target.value), slugTouched: true },
                  }))
                }
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="listing-status-label">Status</InputLabel>
                  <Select
                    labelId="listing-status-label"
                    label="Status"
                    value={editing.draft.status}
                    onChange={(e) => setDraftField("status", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="listing-location-label">Location type</InputLabel>
                  <Select
                    labelId="listing-location-label"
                    label="Location type"
                    value={editing.draft.location_type}
                    onChange={(e) => setDraftField("location_type", e.target.value)}
                  >
                    {LOCATION_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Location label (shown on cards)"
                  fullWidth
                  placeholder="Remote (US time zones preferred)"
                  value={editing.draft.location_label}
                  onChange={(e) => setDraftField("location_label", e.target.value)}
                />
                <TextField
                  label="Hours/week label"
                  fullWidth
                  placeholder="3–5"
                  value={editing.draft.hours_per_week_label}
                  onChange={(e) => setDraftField("hours_per_week_label", e.target.value)}
                />
                <TextField
                  label="Min hours/week (gates the form)"
                  type="number"
                  fullWidth
                  value={editing.draft.min_hours_per_week}
                  onChange={(e) => setDraftField("min_hours_per_week", e.target.value)}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Duration ask"
                  fullWidth
                  placeholder="6+ months preferred — through Fall 2026 and beyond"
                  value={editing.draft.duration_ask}
                  onChange={(e) => setDraftField("duration_ask", e.target.value)}
                />
                <TextField
                  label="Valid through (for Google Jobs)"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={editing.draft.valid_through}
                  onChange={(e) => setDraftField("valid_through", e.target.value)}
                />
              </Stack>
              <TextField
                label="Summary (cards + meta description)"
                required
                fullWidth
                multiline
                minRows={2}
                value={editing.draft.summary}
                onChange={(e) => setDraftField("summary", e.target.value)}
              />
              <TextField
                label="Description (markdown)"
                required
                fullWidth
                multiline
                minRows={12}
                InputProps={{ sx: { fontFamily: "monospace", fontSize: 13 } }}
                value={editing.draft.description_markdown}
                onChange={(e) => setDraftField("description_markdown", e.target.value)}
              />
              <TextField
                label="Work sample prompt (markdown)"
                fullWidth
                multiline
                minRows={3}
                helperText="The role-specific exercise shown in step 3 of the application."
                value={editing.draft.work_sample_prompt}
                onChange={(e) => setDraftField("work_sample_prompt", e.target.value)}
              />
              <TextField
                label="Video prompts (one per line)"
                fullWidth
                multiline
                minRows={3}
                helperText="Shown above the required video field. Keep one prompt referencing the work-sample answer — that pairing is the AI filter."
                value={
                  Array.isArray(editing.draft.video_prompts)
                    ? editing.draft.video_prompts.join("\n")
                    : editing.draft.video_prompts
                }
                onChange={(e) => setDraftField("video_prompts", e.target.value)}
              />
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setEditing(null)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !editing?.draft.title || !editing?.draft.slug}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --------- Delete confirm --------- */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete this listing?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes <strong>{confirmDelete?.title}</strong>. The
            public page starts returning 404. Applications already submitted are
            kept. If you just want it off the site, use Hide instead.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
