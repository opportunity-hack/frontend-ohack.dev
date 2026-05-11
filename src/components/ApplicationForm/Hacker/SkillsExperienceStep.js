import React from "react";
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";
import { OHackParticipationSelect, ProfileAutofillNotice } from "../index";
import UploadPhoto from "../../UploadPhoto";
import {
  ALL_TECHNICAL_SKILLS,
  TECHNICAL_SKILLS_OPTIONS,
} from "./hackerFormConfig";

const SkillsExperienceStep = ({
  formData,
  handleChange,
  handleSkillsChange,
  handlePhotoUpload,
  handlePhotoError,
  profileAutofilled,
  profile,
  apiServerUrl,
  accessToken,
  user,
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
      Skills & Experience
    </Typography>

    <Box sx={{ mb: 3 }}>
      <FormControl
        fullWidth
        required
        sx={{ mb: formData.skills?.includes("Other") ? 1 : 3 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Technical Skills{" "}
          <Box component="span" color="error.main">
            *
          </Box>
        </Typography>

        <Autocomplete
          multiple
          id="skills-autocomplete"
          options={ALL_TECHNICAL_SKILLS}
          value={formData.skills || []}
          onChange={handleSkillsChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Search or select technical skills"
              helperText="Select your technical skills (select at least one)"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option} label={option} {...getTagProps({ index })} />
            ))
          }
          groupBy={(option) => {
            for (const [category, skills] of Object.entries(
              TECHNICAL_SKILLS_OPTIONS,
            )) {
              if (skills.includes(option)) {
                return category;
              }
            }
            return "Other Skills";
          }}
          renderGroup={(params) => (
            <li key={params.key}>
              <Box
                sx={{
                  position: "sticky",
                  top: -8,
                  pt: 1,
                  pb: 1,
                  bgcolor: "background.paper",
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  component="div"
                  sx={{ fontWeight: "bold", pl: 2 }}
                >
                  {params.group}
                </Typography>
              </Box>
              <ul style={{ padding: 0 }}>{params.children}</ul>
            </li>
          )}
          freeSolo
          filterSelectedOptions
          sx={{
            "& .MuiAutocomplete-tag": {
              margin: "2px",
            },
          }}
        />
      </FormControl>

      {formData.skills?.includes("Other") && (
        <TextField
          label="Please specify your other technical skills"
          name="otherSkills"
          required
          fullWidth
          value={formData.otherSkills || ""}
          onChange={handleChange}
          helperText="Tell us about your other technical skills"
          sx={{ mb: 3 }}
        />
      )}

      <ProfileAutofillNotice show={profileAutofilled} />

      <TextField
        label="Short bio"
        name="bio"
        multiline
        rows={3}
        fullWidth
        value={formData.bio || ""}
        onChange={handleChange}
        helperText="We use your bio to help match you with a team — and we share it publicly on the hackathon page so people can find you and connect. Aim for 100–200 words."
        sx={{ mb: 3 }}
      />

      <TextField
        label="LinkedIn Profile (Optional)"
        name="linkedin"
        type="url"
        fullWidth
        value={formData.linkedin || ""}
        onChange={handleChange}
        sx={{ mb: 3 }}
        placeholder="https://linkedin.com/in/yourprofile"
        helperText={
          profileAutofilled && profile?.linkedin_url
            ? "Auto-filled from your profile — edit your profile to update everywhere."
            : undefined
        }
      />

      <TextField
        label="GitHub Profile (Optional)"
        name="github"
        type="url"
        fullWidth
        value={formData.github || ""}
        onChange={handleChange}
        sx={{ mb: 3 }}
        placeholder="https://github.com/yourusername"
        helperText={
          profileAutofilled && profile?.github
            ? "Auto-filled from your profile — edit your profile to update everywhere."
            : undefined
        }
      />

      <TextField
        label="Portfolio/Personal Website (Optional)"
        name="portfolio"
        type="url"
        fullWidth
        value={formData.portfolio || ""}
        onChange={handleChange}
        sx={{ mb: 3 }}
        placeholder="https://yourwebsite.com"
      />

      <UploadPhoto
        value={formData.photoUrl || ""}
        onChange={handlePhotoUpload}
        onError={handlePhotoError}
        label="Your Profile Photo (Optional)"
        helperText="Please upload a professional photo of yourself, we'd like to add this to our website so people can see who is participating."
        directory="hackers"
        apiServerUrl={apiServerUrl}
        accessToken={accessToken}
        orgId={user?.orgId}
        userId={user?.userId}
        sx={{ mb: 3 }}
      />

      <OHackParticipationSelect
        value={formData.participationCount}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
    </Box>
  </Box>
);

export default SkillsExperienceStep;
