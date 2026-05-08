/**
 * 412 conflict resolution dialog.
 *
 * Shows three options when a card PATCH returns 412 (another editor changed the same field):
 *   Mine    — force-save the user's version (PATCH with force=1)
 *   Theirs  — discard local draft, reload server state
 *   Side-by-side — display both values so the user can manually merge
 *
 * localStorage draft preservation: if the user closes without choosing,
 * their draft is preserved at localStorage key "plan_draft:{card_id}:{field}".
 */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

const DRAFT_KEY = (cardId, field) => `plan_draft:${cardId}:${field}`;

export function saveDraftToStorage(cardId, field, value) {
  try {
    localStorage.setItem(DRAFT_KEY(cardId, field), JSON.stringify(value));
  } catch {}
}

export function loadDraftFromStorage(cardId, field) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY(cardId, field));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraftFromStorage(cardId, field) {
  try {
    localStorage.removeItem(DRAFT_KEY(cardId, field));
  } catch {}
}

/**
 * Props:
 *   cardId       — string
 *   field        — which field conflicted (e.g. "description")
 *   myValue      — the value the user typed
 *   theirValue   — the current server value
 *   onMine       — async fn(value) → call force-PATCH, return result
 *   onTheirs     — fn() → discard local, reload
 *   onClose      — fn() → close without deciding (draft is preserved)
 */
export default function PlanningCardConflictDialog({
  cardId,
  field,
  myValue,
  theirValue,
  onMine,
  onTheirs,
  onClose,
}) {
  const [view, setView] = useState("choose"); // "choose" | "sidebyside"
  const [loading, setLoading] = useState(false);

  // Persist draft on mount so closing without choosing doesn't lose work
  useEffect(() => {
    saveDraftToStorage(cardId, field, myValue);
  }, [cardId, field, myValue]);

  async function handleMine() {
    setLoading(true);
    await onMine(myValue);
    clearDraftFromStorage(cardId, field);
    setLoading(false);
    onClose();
  }

  function handleTheirs() {
    clearDraftFromStorage(cardId, field);
    onTheirs();
    onClose();
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editing conflict</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Another editor changed <strong>{field}</strong> while you were editing.
          Choose how to resolve:
        </Typography>

        {view === "sidebyside" ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Your version</Typography>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "warning.50",
                  border: "1px solid",
                  borderColor: "warning.300",
                  borderRadius: 1,
                  minHeight: 100,
                  whiteSpace: "pre-wrap",
                  fontSize: "0.875rem",
                }}
              >
                {String(myValue ?? "")}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Their version (server)</Typography>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "info.50",
                  border: "1px solid",
                  borderColor: "info.300",
                  borderRadius: 1,
                  minHeight: 100,
                  whiteSpace: "pre-wrap",
                  fontSize: "0.875rem",
                }}
              >
                {String(theirValue ?? "")}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your draft is preserved. Click <strong>Mine</strong> to overwrite,{" "}
            <strong>Theirs</strong> to discard your changes, or{" "}
            <strong>Side-by-side</strong> to compare both versions.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setView("sidebyside")} disabled={view === "sidebyside"}>
          Side-by-side
        </Button>
        <Button onClick={handleTheirs} color="secondary">
          Use theirs
        </Button>
        <Button onClick={handleMine} variant="contained" disabled={loading}>
          {loading ? "Saving…" : "Use mine"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
