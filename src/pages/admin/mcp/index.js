import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AdminPage from "../../../components/admin/AdminPage";
import SectionContainer from "../../../components/admin/hackathon-edit/SectionContainer";
import mcpTokensApi, { mcpServerUrl } from "../../../lib/mcpTokensApi";

// Personal access tokens for the admin MCP server (POST /api/mcp). An admin
// creates a token here and pastes it into their MCP client; the backend
// stores only a hash, so the token is shown exactly once. A token has no
// permissions of its own: the backend checks its owner's current roles on
// every call.

const EXPIRY_OPTIONS = [7, 30, 90];
const MAX_NAME_LENGTH = 60;

const formatDate = (iso) => {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const addCommand = (token) =>
  `claude mcp add --transport http ohack-admin ${mcpServerUrl()} --header "Authorization: Bearer ${token}"`;

const CopyBlock = ({ label, value, onCopied }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        p: 1.5,
        borderRadius: 1,
        bgcolor: "#F4F5F7",
      }}
    >
      <Typography
        component="code"
        sx={{
          flex: 1,
          minWidth: 0,
          fontFamily: "monospace",
          fontSize: "0.85rem",
          wordBreak: "break-all",
        }}
      >
        {value}
      </Typography>
      <Tooltip title="Copy">
        <IconButton
          size="small"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              onCopied(true);
            } catch (error) {
              onCopied(false);
            }
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

const AdminMcpPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const org = userClass.getOrgByName("Opportunity Hack Org");
  // Same any-of gate as the backend endpoint.
  const isAdmin = Boolean(
    org?.hasPermission("volunteer.admin") ||
      org?.hasPermission("checkin.admin"),
  );
  const orgId = org?.orgId;
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  // listState: loading | ready | error. An error never renders "no tokens".
  const [listState, setListState] = useState("loading");
  const [tokens, setTokens] = useState([]);
  const [maxActive, setMaxActive] = useState(5);
  const [name, setName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const notify = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const fetchTokens = useCallback(async () => {
    try {
      const data = await mcpTokensApi.list(tokenRef.current, orgId);
      setTokens(Array.isArray(data?.data) ? data.data : []);
      if (data?.max_active) setMaxActive(data.max_active);
      setListState("ready");
    } catch (error) {
      setListState("error");
    }
  }, [orgId]);

  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (isAdmin && hasToken) fetchTokens();
  }, [isAdmin, hasToken, fetchTokens]);

  const activeCount = tokens.filter((t) => t.status === "active").length;
  const atLimit = activeCount >= maxActive;
  const trimmedName = name.trim();

  const handleCreate = async () => {
    setBusy(true);
    try {
      const data = await mcpTokensApi.create(
        { name: trimmedName, expiresInDays },
        tokenRef.current,
        orgId,
      );
      setCreated(data);
      setName("");
      fetchTokens();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    setBusy(true);
    try {
      await mcpTokensApi.revoke(revokeTarget.id, tokenRef.current, orgId);
      notify("Token revoked.");
      setRevokeTarget(null);
      fetchTokens();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminPage title="MCP access" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="MCP access"
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      isAdmin={isAdmin}
    >
      <SectionContainer title="Personal access tokens">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A token lets an MCP client such as Claude Code use the admin tools as
          you. It can do whatever your account can do right now: if a role is
          removed from your account, the token loses it too. Treat it like a
          password, and revoke it here if it leaks.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 1,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <TextField
            label="Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Work laptop"
            inputProps={{ maxLength: MAX_NAME_LENGTH }}
            helperText="Where you'll use it"
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            label="Expires in"
            size="small"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            {EXPIRY_OPTIONS.map((days) => (
              <MenuItem key={days} value={days}>
                {days} days
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            disabled={busy || !trimmedName || atLimit || listState !== "ready"}
            onClick={handleCreate}
            sx={{ height: 40 }}
          >
            Create token
          </Button>
        </Box>
        {atLimit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have {maxActive} active tokens, which is the limit. Revoke one
            to create another.
          </Alert>
        )}

        {listState === "loading" && <CircularProgress size={24} />}
        {listState === "error" && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchTokens}>
                Retry
              </Button>
            }
          >
            Could not load your tokens.
          </Alert>
        )}
        {listState === "ready" && tokens.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            You have no tokens yet.
          </Typography>
        )}
        {listState === "ready" && tokens.length > 0 && (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Token</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Last used</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>{token.name}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {token.token_hint}…
                    </TableCell>
                    <TableCell>{formatDate(token.created_at)}</TableCell>
                    <TableCell>{formatDate(token.expires_at)}</TableCell>
                    <TableCell>{formatDate(token.last_used_at)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={token.status === "active" ? "Active" : "Expired"}
                        color={token.status === "active" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setRevokeTarget(token)}
                      >
                        {token.status === "active" ? "Revoke" : "Remove"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionContainer>

      <Dialog open={Boolean(created)} maxWidth="md" fullWidth>
        <DialogTitle>Copy your token now</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This is the only time the token is shown. If you lose it, revoke it
            and create a new one.
          </Alert>
          {created && (
            <>
              <CopyBlock
                label="Token"
                value={created.token}
                onCopied={(ok) =>
                  notify(
                    ok ? "Token copied." : "Could not copy. Select it by hand.",
                    ok ? "success" : "error",
                  )
                }
              />
              <CopyBlock
                label="Add it to Claude Code"
                value={addCommand(created.token)}
                onCopied={(ok) =>
                  notify(
                    ok
                      ? "Command copied."
                      : "Could not copy. Select it by hand.",
                    ok ? "success" : "error",
                  )
                }
              />
              <Typography variant="body2" color="text.secondary">
                Run the command in a terminal, then restart Claude Code. Other
                MCP clients: use the server URL {mcpServerUrl()} with the
                header Authorization: Bearer &lt;token&gt;.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCreated(null)}>
            I&apos;ve copied it
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
      >
        <DialogTitle>Revoke this token?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            &ldquo;{revokeTarget?.name}&rdquo; will stop working right away.
            Any MCP client using it will need a new token.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)} color="inherit">
            Keep it
          </Button>
          <Button color="error" disabled={busy} onClick={handleRevoke}>
            Revoke token
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
});

export default AdminMcpPage;
