import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";

const NonprofitApplicationEditDialog = ({
  open,
  onClose,
  application,
  onSave,
}) => {
  const [editedApplication, setEditedApplication] = useState(null);

  useEffect(() => {
    if (application) {
      setEditedApplication({ ...application });
    }
  }, [application]);

  if (!editedApplication) return null;

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setEditedApplication((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(editedApplication);
  };

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "organization", label: "Organization", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "isNonProfit", label: "Is Nonprofit", type: "checkbox" },
    { name: "idea", label: "Idea", type: "multiline" },
    { name: "notes", label: "Notes", type: "multiline" },
    // Add more fields here as needed
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Nonprofit Application</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} key={field.name}>
              {field.type === "checkbox" ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedApplication[field.name] || false}
                      onChange={handleChange}
                      name={field.name}
                    />
                  }
                  label={field.label}
                />
              ) : (
                <TextField
                  name={field.name}
                  label={field.label}
                  type={field.type === "multiline" ? "text" : field.type}
                  fullWidth
                  multiline={field.type === "multiline"}
                  rows={field.type === "multiline" ? 4 : 1}
                  value={editedApplication[field.name] || ""}
                  onChange={handleChange}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NonprofitApplicationEditDialog;
