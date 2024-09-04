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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { is } from "date-fns/locale";

const VolunteerEditDialog = ({
  open,
  onClose,
  volunteer,
  onSave,
  onChange,
  isAdding,
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

  const typeSpecificFields = (() => {
    switch (volunteer.type) {
      case "mentors":
        return [
          { name: "expertise", label: "Expertise", type: "text" },
          { name: "company", label: "Company", type: "text" },
        ];
      case "judges":
        return [
          { name: "title", label: "Title", type: "text" },
          { name: "companyName", label: "Company Name", type: "text" },
          { name: "whyJudge", label: "Why Judge", type: "text" },
        ];
      case "volunteers":
        return [{ name: "company", label: "Company", type: "text" }];
      default:
        return [];
    }
  })();

  const fields = [...commonFields, ...typeSpecificFields];

  const handleArtifactChange = (index, field, value) => {
    const newArtifacts = [...volunteer.artifacts];
    newArtifacts[index] = { ...newArtifacts[index], [field]: value };
    onChange("artifacts", newArtifacts);
  };

  const addArtifact = () => {
    const newArtifacts = [
      ...(volunteer.artifacts || []),
      { type: "", label: "", comment: "", url: [""] },
    ];
    onChange("artifacts", newArtifacts);
  };

  const removeArtifact = (index) => {
    const newArtifacts = volunteer.artifacts.filter((_, i) => i !== index);
    onChange("artifacts", newArtifacts);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isAdding
          ? `Add ${volunteer.type.slice(0, -1)}`
          : `Edit ${volunteer.type.slice(0, -1)}`}
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
              disabled={field.name === "name" && !isAdding}
            />
          )
        )}
        {volunteer.type === "volunteers" && (
          <>
            <Typography variant="h6" style={{ marginTop: 16 }}>
              Artifacts
            </Typography>
            {volunteer.artifacts?.map((artifact, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                marginBottom={2}
              >
                <TextField
                  label="Type"
                  value={artifact.type}
                  onChange={(e) =>
                    handleArtifactChange(index, "type", e.target.value)
                  }
                  style={{ marginRight: 8 }}
                />
                <TextField
                  label="Label"
                  value={artifact.label}
                  onChange={(e) =>
                    handleArtifactChange(index, "label", e.target.value)
                  }
                  style={{ marginRight: 8 }}
                />
                <TextField
                  label="Comment"
                  value={artifact.comment}
                  onChange={(e) =>
                    handleArtifactChange(index, "comment", e.target.value)
                  }
                  style={{ marginRight: 8 }}
                />
                <TextField
                  label="URL"
                  value={artifact.url?.[0] || ""}
                  onChange={(e) =>
                    handleArtifactChange(index, "url", [e.target.value])
                  }
                  style={{ marginRight: 8 }}
                />
                <IconButton onClick={() => removeArtifact(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addArtifact}>
              Add Artifact
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} color="primary">
          {isAdding ? "Add" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerEditDialog;
