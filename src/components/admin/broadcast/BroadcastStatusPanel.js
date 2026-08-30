import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import BroadcastService from "../../../lib/broadcastService";

const STATUS_COLORS = {
  sent: "success",
  queued: "info",
  scheduled: "info",
  draft: "default",
  canceled: "warning",
};

const BroadcastStatusPanel = ({
  apiServerUrl,
  accessToken,
  orgId,
  onSnack,
  refreshToken,
}) => {
  const service = useMemo(
    () => new BroadcastService(apiServerUrl, accessToken, orgId),
    [apiServerUrl, accessToken, orgId],
  );
  const [broadcasts, setBroadcasts] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.listBroadcasts();
      setBroadcasts(data.broadcasts || []);
    } catch (error) {
      onSnack?.(`Failed to load broadcasts: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [service, onSnack]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6">Recent broadcasts</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Link
            href="https://resend.com/broadcasts"
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
          >
            Open Resend dashboard
          </Link>
          <Button
            size="small"
            startIcon={
              loading ? <CircularProgress size={14} /> : <RefreshIcon />
            }
            onClick={load}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 2 }}
      >
        Unsubscribed contacts are excluded automatically — delivered count can
        be lower than segment size.
      </Typography>

      {broadcasts === null ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : broadcasts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No broadcasts yet.
        </Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Sent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {broadcasts.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name || b.subject || b.id}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={b.status || "unknown"}
                      color={STATUS_COLORS[b.status] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {b.created_at
                      ? new Date(b.created_at).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {b.sent_at ? new Date(b.sent_at).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};

export default BroadcastStatusPanel;
