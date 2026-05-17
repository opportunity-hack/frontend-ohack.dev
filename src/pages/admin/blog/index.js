import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
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
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import AdminPage from "../../../components/admin/AdminPage";
import * as ga from "../../../lib/ga";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

const statusChipColor = (status) => {
  if (status === "draft") return "warning";
  if (status === "archived") return "default";
  return "success";
};

const formatDate = (post) => {
  const raw = post.published_at || post.slack_ts_human_readable || post.last_updated;
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return raw;
  }
};

const AdminBlogList = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = !!org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [creating, setCreating] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;

  const fetchPosts = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/messages/admin/news?limit=2000`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          ...(orgId ? { "X-Org-Id": orgId } : {}),
        },
      });
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      const data = await res.json();
      setPosts(data.text || []);
    } catch (err) {
      console.error("Blog list fetch failed:", err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiBase, accessToken, orgId, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_view_list", "list");
    }
  }, [isAdmin, fetchPosts]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const postStatus = p.status || "published";
      if (statusFilter !== "all" && postStatus !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        p.title,
        p.description,
        p.slug,
        p.author?.name,
        p.author?.email,
        Array.isArray(p.tags) ? p.tags.join(" ") : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, search, statusFilter]);

  const pagedPosts = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPosts.slice(start, start + rowsPerPage);
  }, [filteredPosts, page, rowsPerPage]);

  const statusCounts = useMemo(() => {
    const counts = { all: posts.length, published: 0, draft: 0, archived: 0 };
    posts.forEach((p) => {
      const s = p.status || "published";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const handleCreate = async () => {
    if (!accessToken) return;
    setCreating(true);
    try {
      const res = await fetch(`${apiBase}/api/messages/admin/news`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          ...(orgId ? { "X-Org-Id": orgId } : {}),
        },
        body: JSON.stringify({
          title: "Untitled draft",
          description: "",
          content_format: "markdown",
          content_markdown: "",
          status: "draft",
          tags: [],
        }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      const data = await res.json();
      const newId = data?.id;
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_create", newId);
      if (newId) {
        router.push(`/admin/blog/${newId}`);
      } else {
        await fetchPosts();
      }
    } catch (err) {
      console.error("Create draft failed:", err);
      setSnackbar({ open: true, message: err.message || "Create failed", severity: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      const res = await fetch(`${apiBase}/api/messages/admin/news/${target.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
          ...(orgId ? { "X-Org-Id": orgId } : {}),
        },
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setPosts((prev) => prev.filter((p) => p.id !== target.id));
      setSnackbar({ open: true, message: `Deleted "${target.title}"`, severity: "success" });
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_delete", target.id);
    } catch (err) {
      console.error("Delete failed:", err);
      setSnackbar({ open: true, message: err.message || "Delete failed", severity: "error" });
    }
  };

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />}
      >
        <AdminPage title="Blog" isAdmin={false}>
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
        title="Blog"
        isAdmin={isAdmin}
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
              Write, edit, and manage every blog post. New posts start as drafts so you can polish before publishing.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={creating}
              size="large"
            >
              {creating ? "Creating…" : "New post"}
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search title, description, author, tag…"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch("")} aria-label="Clear search">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {STATUS_FILTERS.map((f) => (
                  <Chip
                    key={f.value}
                    label={`${f.label} (${statusCounts[f.value] ?? 0})`}
                    onClick={() => {
                      setStatusFilter(f.value);
                      setPage(0);
                    }}
                    color={statusFilter === f.value ? "primary" : "default"}
                    variant={statusFilter === f.value ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>

          {loading && (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && (
            <Alert severity="error">{error}</Alert>
          )}

          {!loading && !error && (
            <Paper variant="outlined">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell>Published</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedPosts.map((post) => {
                      const status = post.status || "published";
                      return (
                        <TableRow key={post.id} hover>
                          <TableCell sx={{ maxWidth: 360 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {post.title || "(untitled)"}
                            </Typography>
                            {post.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {post.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status}
                              size="small"
                              color={statusChipColor(status)}
                              variant={status === "draft" ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{post.author?.name || "—"}</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {(post.tags || []).slice(0, 3).map((t) => (
                                <Chip key={t} label={`#${t}`} size="small" variant="outlined" />
                              ))}
                              {(post.tags || []).length > 3 && (
                                <Chip label={`+${post.tags.length - 3}`} size="small" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDate(post)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => router.push(`/admin/blog/${post.id}`)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View public page">
                              <IconButton size="small" href={`/blog/${post.id}`} target="_blank" rel="noopener noreferrer">
                                <LaunchIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => setConfirmDelete(post)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {pagedPosts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            {posts.length === 0 ? "No posts yet — click New post to start." : "No posts match the current filters."}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredPosts.length}
                page={page}
                onPageChange={(_e, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Paper>
          )}
        </Stack>

        <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This permanently deletes <strong>{confirmDelete?.title || "this post"}</strong> from Firestore. The public page will start returning 404 immediately.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminBlogList;
