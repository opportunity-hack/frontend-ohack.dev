import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

const HackathonDuplicator = ({
  hackathon,
  onDuplicate,
  accessToken,
  orgId,
}) => {
  const [open, setOpen] = useState(false);
  const [newHackathon, setNewHackathon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    // Create a deep copy of the hackathon and initialize new values
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 1);

    const duplicatedHackathon = {
      ...hackathon,
      id: undefined, // Remove ID so a new one is generated
      title: `${hackathon.title} (Copy)`,
      event_id: `${hackathon.event_id}_copy`,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      // Reset certain fields that should start fresh
      teams: [],
      donation_current: {
        food: "0",
        prize: "0",
        swag: "0",
        thank_you: "",
      },
    };

    setNewHackathon(duplicatedHackathon);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleInputChange = (field, value) => {
    setNewHackathon((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify(newHackathon),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate hackathon");
      }

      const data = await response.json();
      onDuplicate(data);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        startIcon={<ContentCopy />}
        onClick={handleOpen}
        size="small"
        variant="outlined"
      >
        Duplicate
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Duplicate Hackathon</DialogTitle>
        <DialogContent>
          {error && (
            <Box mb={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Review and modify the details for the new hackathon:
          </Typography>

          <TextField
            fullWidth
            label="Title"
            value={newHackathon?.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Event ID"
            value={newHackathon?.event_id || ""}
            onChange={(e) => handleInputChange("event_id", e.target.value)}
            margin="normal"
            required
            helperText="This must be unique"
          />

          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={newHackathon?.start_date || ""}
            onChange={(e) => handleInputChange("start_date", e.target.value)}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={newHackathon?.end_date || ""}
            onChange={(e) => handleInputChange("end_date", e.target.value)}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? "Duplicating..." : "Create Copy"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HackathonDuplicator;
