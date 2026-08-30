import React from "react";
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const VOLUNTEER_TYPE_OPTIONS = [
  { value: "", label: "All volunteer types" },
  { value: "mentor", label: "Mentors" },
  { value: "judge", label: "Judges" },
  { value: "sponsor", label: "Sponsors" },
  { value: "volunteer", label: "Volunteers" },
  { value: "hacker", label: "Hackers" },
];

// Union of the /contact page's INQUIRY_TYPES values, the programmatic
// volunteer_letter type (letters page), and legacy values seen in older
// contact_submissions docs. Keep in sync with src/pages/contact/index.js.
const INQUIRY_TYPE_OPTIONS = [
  { value: "general", label: "General Question" },
  { value: "hackathon", label: "Hackathon Information" },
  { value: "mentor", label: "Mentor Opportunities" },
  { value: "judge", label: "Judge Opportunities" },
  { value: "sponsor", label: "Sponsorship Opportunities" },
  { value: "recruit", label: "Recruiting / Hiring Talent" },
  { value: "nonprofit", label: "Nonprofit Information" },
  { value: "technical", label: "Technical Support" },
  { value: "volunteer", label: "Volunteer Opportunity" },
  { value: "volunteer_letter", label: "Volunteer Letter Request" },
  { value: "media", label: "Media Inquiry" },
  { value: "claim_reward", label: "Claim Reward" },
  { value: "other", label: "Other" },
];

export const DEFAULT_SOURCE_SELECTION = {
  profiles: false,
  leads: false,
  slack: false,
  slackIncludeInactive: false,
  volunteers: false,
  volunteerType: "",
  volunteerEventId: "",
  volunteerSelectedOnly: true,
  contacts: false,
  contactInquiryTypes: [],
  contactUpdatesOptInOnly: false,
  customText: "",
};

/**
 * Convert the picker's selection state into the backend sources spec
 * (services/broadcasts_service.collect_contacts). Custom emails are parsed
 * by the caller (shared emailParsing helpers) so invalid entries can be
 * surfaced next to the input.
 */
export const buildSourcesPayload = (selection) => {
  const sources = [];
  if (selection.profiles) sources.push({ type: "profiles" });
  if (selection.leads) sources.push({ type: "leads" });
  if (selection.slack) {
    sources.push({
      type: "slack",
      active_days: selection.slackIncludeInactive ? 10000 : 365,
    });
  }
  if (selection.volunteers) {
    sources.push({
      type: "volunteers",
      volunteer_type: selection.volunteerType || undefined,
      event_id: selection.volunteerEventId.trim() || undefined,
      selected_only: selection.volunteerSelectedOnly,
    });
  }
  if (selection.contacts) {
    sources.push({
      type: "contact_submissions",
      inquiry_types: selection.contactInquiryTypes,
      updates_opt_in_only: selection.contactUpdatesOptInOnly,
    });
  }
  return sources;
};

const BroadcastSourcePicker = ({ selection, onChange, disabled }) => {
  const set = (patch) => onChange({ ...selection, ...patch });

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={selection.profiles}
            onChange={(e) => set({ profiles: e.target.checked })}
            disabled={disabled}
          />
        }
        label="Registered ohack.dev users"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={selection.leads}
            onChange={(e) => set({ leads: e.target.checked })}
            disabled={disabled}
          />
        }
        label="Newsletter leads (signup form)"
      />

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={selection.slack}
              onChange={(e) => set({ slack: e.target.checked })}
              disabled={disabled}
            />
          }
          label="Slack workspace members"
        />
        {selection.slack && (
          <FormControlLabel
            sx={{ ml: 3 }}
            control={
              <Switch
                size="small"
                checked={selection.slackIncludeInactive}
                onChange={(e) =>
                  set({ slackIncludeInactive: e.target.checked })
                }
                disabled={disabled}
              />
            }
            label="Include inactive accounts (no activity in the last year)"
          />
        )}
      </Box>

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={selection.volunteers}
              onChange={(e) => set({ volunteers: e.target.checked })}
              disabled={disabled}
            />
          }
          label="Event volunteers (applications)"
        />
        {selection.volunteers && (
          <Box
            sx={{
              ml: 4,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Volunteer type</InputLabel>
              <Select
                value={selection.volunteerType}
                label="Volunteer type"
                onChange={(e) => set({ volunteerType: e.target.value })}
                disabled={disabled}
                displayEmpty
              >
                {VOLUNTEER_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Event ID (optional)"
              placeholder="e.g. 2026_fall"
              value={selection.volunteerEventId}
              onChange={(e) => set({ volunteerEventId: e.target.value })}
              disabled={disabled}
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={selection.volunteerSelectedOnly}
                  onChange={(e) =>
                    set({ volunteerSelectedOnly: e.target.checked })
                  }
                  disabled={disabled}
                />
              }
              label="Approved only"
            />
          </Box>
        )}
      </Box>

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={selection.contacts}
              onChange={(e) => set({ contacts: e.target.checked })}
              disabled={disabled}
            />
          }
          label="Contact form submissions (/contact)"
        />
        {selection.contacts && (
          <Box
            sx={{
              ml: 4,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel>Inquiry types (empty = all)</InputLabel>
              <Select
                multiple
                value={selection.contactInquiryTypes}
                label="Inquiry types (empty = all)"
                onChange={(e) => set({ contactInquiryTypes: e.target.value })}
                disabled={disabled}
                renderValue={(values) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {values.map((v) => (
                      <Chip
                        key={v}
                        size="small"
                        label={
                          INQUIRY_TYPE_OPTIONS.find((o) => o.value === v)
                            ?.label || v
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                {INQUIRY_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Checkbox
                      size="small"
                      checked={selection.contactInquiryTypes.includes(
                        opt.value,
                      )}
                    />
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={selection.contactUpdatesOptInOnly}
                  onChange={(e) =>
                    set({ contactUpdatesOptInOnly: e.target.checked })
                  }
                  disabled={disabled}
                />
              }
              label="Only people who opted into updates"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Additional emails (optional)
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Paste emails… (comma, semicolon, space, or newline separated)"
          value={selection.customText}
          onChange={(e) => set({ customText: e.target.value })}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export default BroadcastSourcePicker;
