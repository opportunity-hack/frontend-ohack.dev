import React from "react";
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { PronounsPicker } from "../index";
import {
  EXPERIENCE_LEVEL_OPTIONS,
  PARTICIPANT_TYPE_OPTIONS,
  PRIMARY_ROLE_OPTIONS,
} from "./hackerFormConfig";

const RequiredQuestions = ({ formData, setFormData, eventData }) => {
  const questions = eventData?.requiredQuestions || [];
  if (questions.length === 0) return null;

  const handleRequiredQuestionAnswer = (index, value) => {
    setFormData((prev) => {
      const newAnswers = [...(prev.requiredQuestionAnswers || [])];
      newAnswers[index] = value;
      return { ...prev, requiredQuestionAnswers: newAnswers };
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      {questions.map((q, index) => {
        const answer = formData.requiredQuestionAnswers?.[index];
        const isWrongAnswer =
          answer !== null && answer !== undefined && answer !== q.required_answer;

        return (
          <Alert
            key={index}
            severity={isWrongAnswer ? "error" : "warning"}
            variant="outlined"
            sx={{ mb: 2, borderWidth: 2 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              {q.question}{" "}
              <Box component="span" color="error.main">
                *
              </Box>
            </Typography>
            <RadioGroup
              value={answer === true ? "yes" : answer === false ? "no" : ""}
              onChange={(e) =>
                handleRequiredQuestionAnswer(index, e.target.value === "yes")
              }
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            {isWrongAnswer && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                {q.error ||
                  "You do not meet the eligibility requirements for this event."}
              </Typography>
            )}
          </Alert>
        );
      })}
    </Box>
  );
};

const BasicInfoStep = ({
  formData,
  setFormData,
  handleChange,
  customHandleMultiSelectChange,
  eventData,
}) => (
  <Box sx={{ mb: 4 }}>
    <RequiredQuestions
      formData={formData}
      setFormData={setFormData}
      eventData={eventData}
    />

    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
      Basic Information
    </Typography>

    <Box sx={{ mb: 3 }}>
      <TextField
        label="Email Address"
        name="email"
        type="email"
        required
        fullWidth
        value={formData.email || ""}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Your Name"
        name="name"
        required
        fullWidth
        value={formData.name || ""}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <PronounsPicker
        value={formData.pronouns || ""}
        onChange={(next) =>
          setFormData((prev) => ({ ...prev, pronouns: next }))
        }
        required={false}
      />

      <FormControl fullWidth required sx={{ mb: 3 }}>
        <InputLabel id="participant-type-label">Participant Type</InputLabel>
        <Select
          labelId="participant-type-label"
          id="participant-type"
          name="participantType"
          value={formData.participantType || ""}
          onChange={handleChange}
          label="Participant Type"
        >
          {PARTICIPANT_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select what best describes you</FormHelperText>
      </FormControl>

      {formData.participantType === "Other" && (
        <TextField
          label="Please specify your participant type"
          name="participantTypeOther"
          required
          fullWidth
          value={formData.participantTypeOther || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
      )}

      <TextField
        label="School or Organization"
        name="schoolOrganization"
        required
        fullWidth
        value={formData.schoolOrganization || ""}
        onChange={handleChange}
        sx={{ mb: 3 }}
        helperText="Your school, university, company, or organization"
      />

      <FormControl fullWidth required sx={{ mb: 3 }}>
        <InputLabel id="experience-level-label">
          Hackathon Experience Level
        </InputLabel>
        <Select
          labelId="experience-level-label"
          id="experience-level"
          name="experienceLevel"
          value={formData.experienceLevel || ""}
          onChange={handleChange}
          label="Hackathon Experience Level"
        >
          {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          How much experience do you have with hackathons?
        </FormHelperText>
      </FormControl>

      <FormControl
        fullWidth
        required
        sx={{ mb: formData.primaryRoles?.includes("Other") ? 1 : 3 }}
      >
        <InputLabel id="primary-roles-label">Primary Role/Skill Set</InputLabel>
        <Select
          labelId="primary-roles-label"
          id="primary-roles"
          multiple
          value={formData.primaryRoles || []}
          onChange={(e) => customHandleMultiSelectChange(e, "primaryRoles")}
          input={<OutlinedInput label="Primary Role/Skill Set" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {PRIMARY_ROLE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox
                checked={(formData.primaryRoles || []).indexOf(option) > -1}
              />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Select your primary roles or skill sets (select at least one)
        </FormHelperText>
      </FormControl>

      {formData.primaryRoles?.includes("Other") && (
        <TextField
          label="Please specify your other role"
          name="otherRole"
          required
          fullWidth
          value={formData.otherRole || ""}
          onChange={handleChange}
          helperText="Tell us about your specific role or skill set"
          sx={{ mb: 3 }}
        />
      )}
    </Box>
  </Box>
);

export default BasicInfoStep;
