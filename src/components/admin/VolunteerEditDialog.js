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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Helper function to render individual fields
  const renderField = (field, volunteer, onChange) => {
    const fieldSize = isMobile ? "medium" : "medium";
    const fieldMargin = isMobile ? "normal" : "dense";

    if (field.type === "switch") {
      return (
        <Box
          key={field.name}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            py: isMobile ? 1 : 0.5,
            px: isMobile ? 1 : 0,
            minHeight: isMobile ? 56 : 'auto',
          }}
        >
          <Typography variant={isMobile ? "body2" : "body2"}>
            {field.label}:
          </Typography>
          <Switch
            checked={volunteer[field.name] || false}
            onChange={(e) => onChange(field.name, e.target.checked)}
            size={isMobile ? "medium" : "small"}
          />
        </Box>
      );
    } else if (field.type === "select") {
      return (
        <FormControl key={field.name} fullWidth margin={fieldMargin} size={fieldSize}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={volunteer[field.name] || field.defaultValue || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            label={field.label}
            disabled={field.readOnly}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: isMobile ? 300 : 224,
                },
              },
            }}
          >
            {field.options && field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else if (field.type === "textarea") {
      return (
        <TextField
          key={field.name}
          margin={fieldMargin}
          label={field.label}
          multiline
          rows={isMobile ? 3 : 4}
          fullWidth
          size={fieldSize}
          value={volunteer[field.name] || ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          InputProps={{
            readOnly: field.readOnly,
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
            },
          }}
        />
      );
    } else {
      return (
        <TextField
          key={field.name}
          margin={fieldMargin}
          label={field.label}
          type={field.type}
          fullWidth
          size={fieldSize}
          value={volunteer[field.name] || ""}
          onChange={
            field.onChange || ((e) => onChange(field.name, e.target.value))
          }
          InputProps={{
            readOnly: field.readOnly,
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
            },
          }}
        />
      );
    }
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
        return {
          basic: [
            { name: "email", label: "Email", type: "email" },
            { name: "title", label: "Job Title", type: "text" },
            { name: "companyName", label: "Company Name", type: "text" },
            { name: "country", label: "Country", type: "text" },
            { name: "state", label: "State", type: "text" },
          ],
          experience: [
            { name: "background", label: "Background", type: "text" },
            { name: "backgroundAreas", label: "Background Areas", type: "text" },
            { name: "otherBackground", label: "Other Background", type: "text" },
            {
              name: "participationCount",
              label: "Participation Count",
              type: "text",
            },
          ],
          bios: [
            {
              name: "biography",
              label: "Biography",
              type: "textarea",
            },
            {
              name: "shortBio",
              label: "Short Bio",
              type: "textarea",
            },
            {
              name: "shortBiography",
              label: "Short Biography",
              type: "textarea",
            },
            { name: "whyJudge", label: "Why Judge", type: "textarea" },
          ],
          availability: [
            { name: "availability", label: "Availability", type: "text" },
            { name: "canAttendJudging", label: "Can Attend Judging", type: "text" },
            {
              name: "additionalInfo",
              label: "Additional Info",
              type: "textarea",
            },
          ],
          agreements: [
            {
              name: "agreedToCodeOfConduct",
              label: "Agreed to Code of Conduct",
              type: "switch",
            },
            {
              name: "codeOfConduct",
              label: "Code of Conduct",
              type: "switch",
            },
            { name: "selected", label: "Selected (Legacy)", type: "switch" },
            {
              name: "status",
              label: "Application Status",
              type: "select",
              defaultValue: "pending",
              options: [
                { value: "pending", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "denied", label: "Denied" },
                { value: "verified_travel", label: "Verified Travel" },
                { value: "confirmed", label: "Confirmed" },
                { value: "withdrew", label: "Withdrew" },
                { value: "no_show", label: "No Show" },
              ],
            },
          ],
          system: [
            { name: "user_id", label: "User ID", type: "text", readOnly: true },
            { name: "created_by", label: "Created By", type: "text", readOnly: true },
            { name: "updated_by", label: "Updated By", type: "text", readOnly: true },
            { name: "created_timestamp", label: "Created", type: "text", readOnly: true },
            { name: "updated_timestamp", label: "Updated", type: "text", readOnly: true },
            { name: "timestamp", label: "Timestamp", type: "text", readOnly: true },
            { name: "event_id", label: "Event ID", type: "text", readOnly: true },
            { name: "id", label: "ID", type: "text", readOnly: true },
            { name: "volunteer_type", label: "Volunteer Type", type: "text", readOnly: true },
            { name: "type", label: "Type", type: "text", readOnly: true },
          ],
        };
      case "volunteers":
        return [
          { name: "company", label: "Company", type: "text" },
          { name: "shortBio", label: "Short Bio", type: "textarea" },
          { name: "volunteerType", label: "Volunteer Type", type: "text" },
          { name: "skills", label: "Skills", type: "text" },
          { name: "country", label: "Country", type: "text" },
          { name: "state", label: "State", type: "text" },
          { name: "availability", label: "Availability", type: "text" },
          { name: "motivation", label: "Motivation", type: "textarea" },
          {
            name: "socialCauses",
            label: "Social Causes",
            type: "text",
          },
          {
            name: "agreedToCodeOfConduct",
            label: "Agreed to Code of Conduct",
            type: "switch",
          },
        ];
      case "hackers":
        return [
          { name: "participantType", label: "Participant Type", type: "text" },
          { name: "schoolOrganization", label: "School/Organization", type: "text" },
          { name: "experienceLevel", label: "Experience Level", type: "text" },
          { name: "primaryRoles", label: "Primary Roles", type: "text" },
          { name: "skills", label: "Skills", type: "text" },
          { name: "country", label: "Country", type: "text" },
          { name: "state", label: "State", type: "text" },
          { name: "teamStatus", label: "Team Status", type: "text" },
          { name: "teamCode", label: "Team Code", type: "text" },
          { name: "socialCauses", label: "Social Causes", type: "text" },
          { name: "bio", label: "Bio", type: "textarea" },
          {
            name: "agreedToCodeOfConduct",
            label: "Agreed to Code of Conduct",
            type: "switch",
          },
        ];
      case "sponsors":
        return [
          { name: "title", label: "Title", type: "text" },
          { name: "companyName", label: "Company Name", type: "text" },
          { name: "sponsorshipTier", label: "Sponsorship Tier", type: "text" },
          { name: "sponsorshipDetails", label: "Sponsorship Details", type: "textarea" },
          { name: "volunteerType", label: "Volunteer Roles", type: "text" },
          { name: "volunteerCount", label: "Volunteer Count", type: "text" },
          { name: "volunteerHours", label: "Volunteer Hours", type: "text" },
          { name: "howHeard", label: "How Heard", type: "text" },
          { name: "logoUrl", label: "Logo URL", type: "text" },
          {
            name: "additionalInfo",
            label: "Additional Info",
            type: "textarea",
          },
        ];
      default:
        return [];
    }
  })();

  // Handle different field structures
  const isJudgeWithSections = volunteer.type === "judges" && typeof typeSpecificFields === 'object' && !Array.isArray(typeSpecificFields);
  const fields = isJudgeWithSections ? commonFields : [...commonFields, ...typeSpecificFields];

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? false : "md"}
      fullWidth
      fullScreen={isSmallMobile}
      sx={{
        '& .MuiDialog-paper': {
          ...(isMobile && !isSmallMobile && {
            margin: theme.spacing(1),
            width: 'calc(100% - 16px)',
            maxHeight: 'calc(100% - 16px)',
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant={isMobile ? "h6" : "h5"} component="h2">
          {isAdding ? `Add ${volunteer.type}` : `Edit ${volunteer.type}`}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        {isAdding && (
          <Box mb={2}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 1 }}>
              Bulk Add from Google Sheets
            </Typography>
            <TextareaAutosize
              minRows={isMobile ? 2 : 3}
              placeholder="Paste tab-separated data here..."
              value={bulkData}
              onChange={handleBulkDataChange}
              style={{
                width: "100%",
                marginBottom: "10px",
                fontSize: isMobile ? '14px' : '16px',
                fontFamily: theme.typography.fontFamily,
                padding: theme.spacing(1),
                borderRadius: theme.spacing(0.5),
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Button
              onClick={processBulkData}
              variant="contained"
              color="primary"
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
            >
              Process Bulk Data
            </Button>
          </Box>
        )}
        {/* Render basic fields first */}
        {fields.map((field) => renderField(field, volunteer, onChange))}

        {/* Render judge-specific sections */}
        {isJudgeWithSections && (
          <Box mt={2}>
            {/* Basic Information */}
            <Accordion defaultExpanded={!isMobile}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Basic Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={isMobile ? 1.5 : 2}>
                  {typeSpecificFields.basic.map((field) =>
                    renderField(field, volunteer, onChange)
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Experience & Background */}
            <Accordion defaultExpanded={!isMobile}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Experience & Background
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={isMobile ? 1.5 : 2}>
                  {typeSpecificFields.experience.map((field) =>
                    renderField(field, volunteer, onChange)
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Biography & Motivation */}
            <Accordion defaultExpanded={!isMobile}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Biography & Motivation
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={isMobile ? 1.5 : 2}>
                  {typeSpecificFields.bios.map((field) =>
                    renderField(field, volunteer, onChange)
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Availability */}
            <Accordion defaultExpanded={!isMobile}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Availability & Additional Info
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={isMobile ? 1.5 : 2}>
                  {typeSpecificFields.availability.map((field) =>
                    renderField(field, volunteer, onChange)
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Agreements */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Agreements & Status
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                  {typeSpecificFields.agreements.map((field) =>
                    renderField(field, volunteer, onChange)
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* System Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">System Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                  {typeSpecificFields.system.map((field) =>
                    renderField(field, volunteer, onChange)
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
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
      <DialogActions
        sx={{
          px: 3,
          pb: isMobile ? 2 : 1,
          pt: 1,
          flexDirection: isMobile ? 'column-reverse' : 'row',
          gap: isMobile ? 1 : 0.5,
        }}
      >
        <Button
          onClick={onClose}
          size={isMobile ? "medium" : "medium"}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 2 : 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          color="primary"
          variant="contained"
          size={isMobile ? "medium" : "medium"}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 1 : 2 }}
        >
          {isAdding ? "Add" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerEditDialog;
