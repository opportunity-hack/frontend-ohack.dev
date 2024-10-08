import React, { useState } from "react";
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
  TextareaAutosize,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  mentorHeaderMapping,
  transformMentorData,
} from "./mentorHeaderMappings";
import { judgeHeaderMapping, transformJudgeData } from "./judgeHeaderMappings";

const VolunteerEditDialog = ({
  open,
  onClose,
  volunteer,
  onSave,
  onChange,
  isAdding,
}) => {
  const [bulkData, setBulkData] = useState("");

  if (!volunteer) return null;

  const transformPhotoUrl = (url) => {
    return url.replace(
      "https://storage.googleapis.com/ohack-dev_cdn",
      "https://cdn.ohack.dev"
    );
  };

  const handlePhotoUrlChange = (e) => {
    const transformedUrl = transformPhotoUrl(e.target.value);
    onChange("photoUrl", transformedUrl);
  };

  const commonFields = [
    { name: "name", label: "Name", type: "text" },
    {
      name: "photoUrl",
      label: "Photo URL",
      type: "text",
      onChange: handlePhotoUrlChange,
    },
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
          { name: "shortBio", label: "Short Bio", type: "textarea" },
          {
            name: "participationCount",
            label: "Participation Count",
            type: "text",
          },
          { name: "country", label: "Country", type: "text" },
          { name: "state", label: "State", type: "text" },
          { name: "availability", label: "Availability", type: "text" },
          {
            name: "softwareEngineeringSpecifics",
            label: "Software Engineering Specifics",
            type: "text",
          },
          {
            name: "agreedToCodeOfConduct",
            label: "Agreed to Code of Conduct",
            type: "switch",
          },
          { name: "shirtSize", label: "Shirt Size", type: "text" },
        ];
      case "judges":
        return [
          { name: "title", label: "Title", type: "text" },
          { name: "companyName", label: "Company Name", type: "text" },
          { name: "whyJudge", label: "Why Judge", type: "textarea" },
          {
            name: "shortBiography",
            label: "Short Biography",
            type: "textarea",
          },
          { name: "background", label: "Background", type: "text" },
          { name: "hasHelpedBefore", label: "Has Helped Before", type: "text" },
          { name: "availability", label: "Availability", type: "text" },
          {
            name: "additionalInfo",
            label: "Additional Info",
            type: "textarea",
          },
          {
            name: "agreedToCodeOfConduct",
            label: "Agreed to Code of Conduct",
            type: "switch",
          },
        ];
      case "volunteers":
        return [
          { name: "company", label: "Company", type: "text" },
          { name: "shortBio", label: "Short Bio", type: "textarea" },
          { name: "hasHelpedBefore", label: "Has Helped Before", type: "text" },
        ];
      default:
        return [];
    }
  })();

  const fields = [...commonFields, ...typeSpecificFields];

  const handleArtifactChange = (index, field, value) => {
    const newArtifacts = [...(volunteer.artifacts || [])];
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

  const handleBulkDataChange = (e) => {
    setBulkData(e.target.value);
  };

  const processBulkData = () => {
    const lines = bulkData.trim().split("\n");
    const headers = lines[0].split("\t").map((header) => header.trim());

    let dataValues = [];
    let currentValue = "";
    let inQuotes = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "\t" && !inQuotes) {
          dataValues.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      if (inQuotes) {
        currentValue += "\n";
      } else {
        dataValues.push(currentValue.trim());
        break;
      }
    }

    const rawData = {};
    headers.forEach((header, index) => {
      if (index < dataValues.length) {
        let value = dataValues[index];
        // Remove surrounding quotes and replace double quotes with single quotes
        value = value.replace(/^"(.*)"$/, "$1").replace(/""/g, '"');
        rawData[header] = value;
      }
    });

    console.log("Raw data:", rawData); // For debugging

    let transformedData;
    if (volunteer.type === "mentors") {
      transformedData = transformMentorData(rawData);
    } else if (volunteer.type === "judges") {
      transformedData = transformJudgeData(rawData);
    } else {
      transformedData = rawData;
    }

    console.log("Transformed data:", transformedData); // For debugging

    Object.keys(transformedData).forEach((key) => {
      onChange(key, transformedData[key]);
    });

    setBulkData("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isAdding ? `Add ${volunteer.type}` : `Edit ${volunteer.type}`}
      </DialogTitle>
      <DialogContent>
        {isAdding && (
          <Box mb={2}>
            <Typography variant="h6">Bulk Add from Google Sheets</Typography>
            <TextareaAutosize
              minRows={3}
              placeholder="Paste tab-separated data here..."
              value={bulkData}
              onChange={handleBulkDataChange}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <Button
              onClick={processBulkData}
              variant="contained"
              color="primary"
            >
              Process Bulk Data
            </Button>
          </Box>
        )}
        {fields.map((field) =>
          field.type === "switch" ? (
            <Box key={field.name} display="flex" alignItems="center">
              <Typography>{field.label}:</Typography>
              <Switch
                checked={volunteer[field.name] || false}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
            </Box>
          ) : field.type === "textarea" ? (
            <TextField
              key={field.name}
              margin="dense"
              label={field.label}
              multiline
              rows={4}
              fullWidth
              value={volunteer[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          ) : (
            <TextField
              key={field.name}
              margin="dense"
              label={field.label}
              type={field.type}
              fullWidth
              value={volunteer[field.name] || ""}
              onChange={
                field.onChange || ((e) => onChange(field.name, e.target.value))
              }
              InputProps={{
                readOnly: field.readOnly,
              }}
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
