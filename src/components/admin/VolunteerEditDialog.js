import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Switch,
} from "@mui/material";

const VolunteerEditDialog = ({
  open,
  onClose,
  volunteer,
  onSave,
  onChange,
}) => {
  if (!volunteer) return null;

  const commonFields = [
    { name: "name", label: "Name", type: "text" },
    { name: "photoUrl", label: "Photo URL", type: "text" },
    { name: "linkedinProfile", label: "LinkedIn Profile", type: "text" },
    { name: "isInPerson", label: "In Person", type: "switch" },
    { name: "isSelected", label: "Selected", type: "switch" },
    { name: "pronouns", label: "Pronouns", type: "text" },
    { name: "slack_user_id", label: "Slack User ID", type: "text" },
  ];

  const mentorFields = [
    { name: "expertise", label: "Expertise", type: "text" },
    { name: "company", label: "Company", type: "text" },
  ];

  const judgeFields = [
    { name: "title", label: "Title", type: "text" },
    { name: "companyName", label: "Company Name", type: "text" },
    { name: "whyJudge", label: "Why Judge", type: "text" },
  ];

  const fields =
    volunteer.type === "mentors"
      ? [...commonFields, ...mentorFields]
      : [...commonFields, ...judgeFields];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit {volunteer.type === "mentors" ? "Mentor" : "Judge"}
      </DialogTitle>
      <DialogContent>
        {fields.map((field) =>
          field.type === "switch" ? (
            <Box key={field.name} display="flex" alignItems="center">
              <Typography>{field.label}:</Typography>
              <Switch
                checked={volunteer[field.name] || false}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
            </Box>
          ) : (
            <TextField
              key={field.name}
              margin="dense"
              label={field.label}
              type={field.type}
              fullWidth
              value={volunteer[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              disabled={field.name === "name"}
            />
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerEditDialog;
