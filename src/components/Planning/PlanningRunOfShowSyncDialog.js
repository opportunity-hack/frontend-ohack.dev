/**
 * Confirm dialog for syncing Run of Show cards to hackathon.countdowns.
 *
 * Shows a diff preview (incoming planning entries vs preserved manual entries)
 * and requires explicit user confirmation before calling /run-of-show/sync.
 */
import React from "react";
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
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Check, Lock, Schedule } from "@mui/icons-material";

function CountdownRow({ entry, source }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
      {source === "planning" ? (
        <Schedule fontSize="small" color="primary" />
      ) : (
        <Lock fontSize="small" color="action" />
      )}
      <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80 }}>
        {entry.time ? new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
      </Typography>
      <Typography variant="body2">{entry.name}</Typography>
      {source !== "planning" && (
        <Chip label="preserved" size="small" variant="outlined" sx={{ ml: "auto" }} />
      )}
    </Stack>
  );
}

export default function PlanningRunOfShowSyncDialog({
  eventId,
  accessToken,
  orgId,
  diff,
  onSynced,
  onClose,
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSync() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/planning/${eventId}/run-of-show/sync`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      onSynced(result);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const incoming = diff?.incoming || [];
  const preserved = diff?.preserved || [];

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sync Run of Show to public timeline</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will replace{" "}
          <strong>{diff?.current_planning_count ?? "?"} existing planning entries</strong> with{" "}
          <strong>{incoming.length} entries from the board</strong>. Manual entries are preserved.
        </Typography>

        {incoming.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              From board ({incoming.length})
            </Typography>
            <Box sx={{ bgcolor: "primary.50", borderRadius: 1, p: 1, mb: 2 }}>
              {incoming.map((e, i) => (
                <CountdownRow key={i} entry={e} source="planning" />
              ))}
            </Box>
          </>
        )}

        {preserved.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Preserved manual entries ({preserved.length})
            </Typography>
            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, p: 1, mb: 2 }}>
              {preserved.map((e, i) => (
                <CountdownRow key={i} entry={e} source="manual" />
              ))}
            </Box>
          </>
        )}

        {incoming.length === 0 && (
          <Alert severity="warning">
            No Run of Show cards with sync_to_countdowns enabled. Mark cards in a Run of Show list
            and set sync_to_countdowns = true before syncing.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSync}
          variant="contained"
          disabled={loading || incoming.length === 0}
          startIcon={loading ? <CircularProgress size={14} /> : <Check />}
        >
          Confirm sync
        </Button>
      </DialogActions>
    </Dialog>
  );
}

