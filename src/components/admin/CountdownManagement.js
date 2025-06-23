import React, { useState } from "react";
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ReactMarkdown from "react-markdown";
import TimezoneSelect from "react-timezone-select";

const CountdownManagement = ({ countdowns, onChange }) => {
  const [editingCountdown, setEditingCountdown] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState("America/Phoenix");

  const formatDateForDisplay = (dateString, timezone) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "long",
    });
  };

  const formatDateForSave = (dateInput, timezone) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.error("Invalid date input:", dateInput);
      return "";
    }

    const pad = (num) => num.toString().padStart(2, "0");

    // Use the Intl API to get the correct offset for the selected timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    const dateParts = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    const year = dateParts.year;
    const month = dateParts.month;
    const day = dateParts.day;
    const hour = dateParts.hour;
    const minute = dateParts.minute;
    const second = dateParts.second;

    // Extract the timezone offset
    const timeZonePart = parts.find((part) => part.type === "timeZoneName");
    let offset;
    if (timeZonePart) {
      const offsetMatch = timeZonePart.value.match(/([+-])(\d{2})(\d{2})/);
      if (offsetMatch) {
        offset = offsetMatch[0];
      } else {
        // Fallback for named time zones (e.g., MST)
        const tzOffset = date.getTimezoneOffset();
        const offsetHours = pad(Math.abs(Math.floor(tzOffset / 60)));
        const offsetMinutes = pad(Math.abs(tzOffset % 60));
        const offsetSign = tzOffset <= 0 ? "+" : "-";
        offset = `${offsetSign}${offsetHours}${offsetMinutes}`;
      }
    } else {
      offset = "+0000"; // UTC if no offset found
    }

    return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
  };

  const handleAddCountdown = () => {
    setEditingCountdown({
      name: "",
      description: "",
      time: new Date(),
      timezone: selectedTimezone,
    });
    setDialogOpen(true);
  };

  const handleEditCountdown = (countdown, index) => {
    setEditingCountdown({
      ...countdown,
      index,
      time: new Date(countdown.time),
    });
    setSelectedTimezone(countdown.timezone || "America/Phoenix");
    setDialogOpen(true);
  };

  const handleDeleteCountdown = (index) => {
    const newCountdowns = countdowns.filter((_, i) => i !== index);
    onChange(newCountdowns);
  };

  const handleSaveCountdown = () => {
    const formattedTime = formatDateForSave(
      editingCountdown.time,
      selectedTimezone
    );

    const savedCountdown = {
      name: editingCountdown.name,
      description: editingCountdown.description,
      time: formattedTime,
    };

    let newCountdowns;
    if (editingCountdown.index !== undefined) {
      newCountdowns = countdowns.map((c, i) =>
        i === editingCountdown.index ? savedCountdown : c
      );
    } else {
      newCountdowns = [...countdowns, savedCountdown];
    }

    onChange(newCountdowns);
    setDialogOpen(false);
  };

  const handleInputChange = (field, value) => {
    setEditingCountdown((prev) => ({
      ...prev,
      [field]:
        field === "time"
          ? value instanceof Date
            ? value
            : new Date(value)
          : value,
    }));
  };

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone.value);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Countdowns
      </Typography>
      <List>
        {countdowns.map((countdown, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={countdown.name}
              secondary={formatDateForDisplay(
                countdown.time,
                "America/Phoenix"
              )}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleEditCountdown(countdown, index)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteCountdown(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button startIcon={<AddIcon />} onClick={handleAddCountdown}>
        Add Countdown
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCountdown?.index !== undefined
            ? "Edit Countdown"
            : "Add Countdown"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editingCountdown?.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description (Markdown supported)"
            value={editingCountdown?.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <Typography variant="subtitle1" gutterBottom>
            Preview:
          </Typography>
          <Box sx={{ border: "1px solid #ccc", padding: 2, marginBottom: 2 }}>
            <ReactMarkdown>{editingCountdown?.description || ""}</ReactMarkdown>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Time"
              value={editingCountdown?.time || null}
              onChange={(date) => handleInputChange("time", date)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />
          </LocalizationProvider>
          <Box sx={{ marginTop: 2, marginBottom: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Timezone
            </Typography>
            <TimezoneSelect
              value={{ value: selectedTimezone, label: selectedTimezone }}
              onChange={handleTimezoneChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCountdown} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CountdownManagement;
