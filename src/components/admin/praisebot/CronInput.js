import React from "react";
import { Box, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

// Cron entry with common presets. Times are UTC unless a timezone is set in
// the Global tab (Arizona = UTC-7 year-round, so 9 AM AZ = 16:00 UTC).
export const CRON_PRESETS = [
  { label: "Daily 9am Arizona", value: "0 16 * * *" },
  { label: "Weekdays 8am Arizona", value: "0 15 * * 1-5" },
  { label: "Weekly Monday 9am Arizona", value: "0 16 * * 1" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
];

export const isValidCron = (value) =>
  typeof value === "string" && value.trim().split(/\s+/).length === 5;

const CronInput = ({ label, value, onChange, error, helperText }) => {
  const presetMatch = CRON_PRESETS.find((p) => p.value === value);

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
      <FormControl sx={{ minWidth: 220 }}>
        <InputLabel>{label} preset</InputLabel>
        <Select
          label={`${label} preset`}
          value={presetMatch ? presetMatch.value : "custom"}
          onChange={(e) => {
            if (e.target.value !== "custom") onChange(e.target.value);
          }}
        >
          {CRON_PRESETS.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
          <MenuItem value="custom">Custom…</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={`${label} cron (UTC)`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={
          helperText ||
          (error ? "Must be a 5-field cron expression" : "min hour day month weekday")
        }
        sx={{ flexGrow: 1 }}
      />
    </Box>
  );
};

export default CronInput;
