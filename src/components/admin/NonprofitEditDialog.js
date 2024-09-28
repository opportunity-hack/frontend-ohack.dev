import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const NonprofitEditDialog = ({
  open,
  onClose,
  nonprofit,
  onSave,
  problemStatements,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    slack_channel: "",
    contact_people: [],
    contact_email: [],
    problem_statements: [],
    image: "",
    rank: "",
  });

  useEffect(() => {
    if (nonprofit) {
      setFormData({
        ...nonprofit,
        contact_people: nonprofit.contact_people?.join(", ") || "",
        contact_email: nonprofit.contact_email?.join(", ") || "",
        problem_statements: nonprofit.problem_statements || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        website: "",
        slack_channel: "",
        contact_people: "",
        contact_email: "",
        problem_statements: [],
        image: "",
        rank: "",
      });
    }
  }, [nonprofit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProblemStatementChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      problem_statements: event.target.value,
    }));
  };

  const handleSave = () => {
    const savedData = {
      ...formData,
      contact_people: formData.contact_people
        .split(",")
        .map((item) => item.trim()),
      contact_email: formData.contact_email
        .split(",")
        .map((item) => item.trim()),
    };
    onSave(savedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {nonprofit ? "Edit Nonprofit" : "Add New Nonprofit"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Slack Channel"
            name="slack_channel"
            value={formData.slack_channel}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Contact People (comma-separated)"
            name="contact_people"
            value={formData.contact_people}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Contact Emails (comma-separated)"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Rank"
            name="rank"
            type="number"
            value={formData.rank}
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel>Problem Statements</InputLabel>
            <Select
              multiple
              value={formData.problem_statements}
              onChange={handleProblemStatementChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        problemStatements.find((ps) => ps.id === value)
                          ?.title || value
                      }
                    />
                  ))}
                </Box>
              )}
            >
              {problemStatements.map((ps) => (
                <MenuItem key={ps.id} value={ps.id}>
                  {ps.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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

export default NonprofitEditDialog;
