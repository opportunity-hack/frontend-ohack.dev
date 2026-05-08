import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, PersonAdd } from "@mui/icons-material";

export default function PlanningEditorsManager({ editors = [], onUpdateEditors }) {
  const [newEditorId, setNewEditorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    const id = newEditorId.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    const result = await onUpdateEditors([id], []);
    if (result?.ok) {
      setNewEditorId("");
    } else {
      setError(result?.error || "Failed to add editor");
    }
    setLoading(false);
  }

  async function handleRemove(userId) {
    setLoading(true);
    await onUpdateEditors([], [userId]);
    setLoading(false);
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Board editors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Editors can create, edit, and move cards. Admins always have full access.
      </Typography>

      <Stack spacing={1} sx={{ mb: 2 }}>
        {editors.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No editors yet.
          </Typography>
        )}
        {editors.map((userId) => (
          <Stack key={userId} direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
              {userId}
            </Typography>
            <IconButton size="small" onClick={() => handleRemove(userId)} disabled={loading}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="PropelAuth user ID"
          value={newEditorId}
          onChange={(e) => setNewEditorId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button
          startIcon={loading ? <CircularProgress size={14} /> : <PersonAdd />}
          variant="outlined"
          onClick={handleAdd}
          disabled={loading || !newEditorId.trim()}
          size="small"
        >
          Add
        </Button>
      </Stack>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
