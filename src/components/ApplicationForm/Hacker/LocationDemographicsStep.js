import React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { MealMenu } from "../index";
import {
  AGE_RANGE_OPTIONS,
  ARIZONA_COUNTY_OPTIONS,
  COUNTRY_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  US_STATE_OPTIONS,
} from "./hackerFormConfig";

const LocationDemographicsStep = ({
  formData,
  setFormData,
  handleChange,
  eventData,
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
      Location & Demographics
    </Typography>

    <Box sx={{ mb: 3 }}>
      {/* In-person events: confirm on-site attendance commitment */}
      {!eventData?.isOnlineEvent && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            This is an in-person event
            {eventData?.location ? ` in ${eventData.location}` : ""}.
          </Typography>
          <Typography variant="body1">
            We ask hackers to be on-site for the entire hackathon. You're
            welcome to go home to sleep overnight if you prefer, but we expect
            you with us during the build, demos, and judging. Virtual
            participation isn't supported for this event.
          </Typography>
        </Alert>
      )}

      <Autocomplete
        options={COUNTRY_OPTIONS}
        value={formData.country || null}
        onChange={(_e, newValue) => {
          setFormData((prev) => ({
            ...prev,
            country: newValue || "",
            state: "",
            county: "",
          }));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Country" required />
        )}
        sx={{ mb: 3 }}
      />

      {formData.country === "United States" ? (
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="state-label">State</InputLabel>
          <Select
            labelId="state-label"
            id="state"
            name="state"
            value={formData.state || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                state: value,
                county: value === "Arizona" ? prev.county : "",
              }));
            }}
            label="State"
          >
            {US_STATE_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : formData.country ? (
        <TextField
          label="State / Province / Region"
          name="state"
          required
          fullWidth
          value={formData.state || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
      ) : null}

      {formData.country === "United States" &&
        formData.state === "Arizona" && (
          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel id="county-label">County</InputLabel>
            <Select
              labelId="county-label"
              id="county"
              name="county"
              value={formData.county || ""}
              onChange={handleChange}
              label="County"
            >
              {ARIZONA_COUNTY_OPTIONS.map((county) => (
                <MenuItem key={county} value={county}>
                  {county}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select your county in Arizona</FormHelperText>
          </FormControl>
        )}

      <FormControl fullWidth required sx={{ mb: 3 }}>
        <InputLabel id="age-range-label">Age Range</InputLabel>
        <Select
          labelId="age-range-label"
          id="age-range"
          name="ageRange"
          value={formData.ageRange || ""}
          onChange={handleChange}
          label="Age Range"
        >
          {AGE_RANGE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          This helps us understand our participant demographics
        </FormHelperText>
      </FormControl>

      {formData.ageRange === "Under 18" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="parentalPermission"
                checked={!!formData.parentalPermission}
                onChange={handleChange}
                color="primary"
                required
              />
            }
            label={
              <Typography variant="body1">
                I confirm I have permission from a parent or legal guardian to
                attend and participate in this hackathon.
              </Typography>
            }
            sx={{ alignItems: "flex-start" }}
          />
        </Alert>
      )}

      <FormControl
        fullWidth
        required
        sx={{ mb: formData.referralSource === "Other" ? 1 : 3 }}
      >
        <InputLabel id="referral-source-label">
          How did you hear about Opportunity Hack?
        </InputLabel>
        <Select
          labelId="referral-source-label"
          id="referral-source"
          name="referralSource"
          value={formData.referralSource || ""}
          onChange={handleChange}
          label="How did you hear about Opportunity Hack?"
        >
          {REFERRAL_SOURCE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formData.referralSource === "Other" && (
        <TextField
          label="Please specify how you heard about us"
          name="referralSourceOther"
          required
          fullWidth
          value={formData.referralSourceOther || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="shirt-size-label">T-Shirt Size (Optional)</InputLabel>
        <Select
          labelId="shirt-size-label"
          id="shirt-size"
          name="shirtSize"
          value={formData.shirtSize || ""}
          onChange={handleChange}
          label="T-Shirt Size (Optional)"
        >
          <MenuItem value="XS">XS</MenuItem>
          <MenuItem value="S">S</MenuItem>
          <MenuItem value="M">M</MenuItem>
          <MenuItem value="L">L</MenuItem>
          <MenuItem value="XL">XL</MenuItem>
          <MenuItem value="XXL">XXL</MenuItem>
          <MenuItem value="3XL">3XL</MenuItem>
          <MenuItem value="4XL">4XL</MenuItem>
        </Select>
        <FormHelperText>
          For people who complete the hackathon (subject to availability)
        </FormHelperText>
      </FormControl>

      {/* Only show dietary restrictions for non-online events */}
      {!eventData?.isOnlineEvent && (
        <TextField
          label="Dietary Restrictions (Optional)"
          name="dietaryRestrictions"
          fullWidth
          value={formData.dietaryRestrictions || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
          helperText="Please let us know about any dietary restrictions for in-person attendees"
        />
      )}

      {!eventData?.isOnlineEvent &&
        Array.isArray(eventData?.constraints?.meals) &&
        eventData.constraints.meals.length > 0 && (
          <MealMenu
            meals={eventData.constraints.meals}
            selections={formData.mealSelections || {}}
            onChange={(next) =>
              setFormData((prev) => ({ ...prev, mealSelections: next }))
            }
          />
        )}
    </Box>
  </Box>
);

export default LocationDemographicsStep;
