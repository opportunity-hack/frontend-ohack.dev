import React, { useMemo } from "react";
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

// Common dietary restrictions offered across the application forms.
// "None" is exclusive; "Other" reveals a short free-text detail field.
// The stored value is a human-readable comma-joined string (the same
// shape the legacy free-text hacker field produced), so old submissions
// still parse and admins/caterers can read it directly.
export const DIETARY_RESTRICTION_OPTIONS = [
  "None",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Dairy-free",
  "Nut allergy",
  "Shellfish allergy",
  "Egg allergy",
  "Soy allergy",
  "Other",
];

const OPTION_BY_LOWER = new Map(
  DIETARY_RESTRICTION_OPTIONS.map((o) => [o.toLowerCase(), o]),
);

// A few aliases so values from other parts of the system (meal
// dietary_tags, legacy free text) map onto the curated options.
const ALIASES = new Map([
  ["gluten free", "Gluten-free"],
  ["dairy free", "Dairy-free"],
  ["nut-free", "Nut allergy"],
  ["nut free", "Nut allergy"],
  ["no restrictions", "None"],
  ["n/a", "None"],
  ["na", "None"],
]);

export const parseDietaryRestrictions = (value) => {
  if (!value) return { selected: [], other: "" };
  const tokens = String(value)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const selected = [];
  const otherTokens = [];
  for (const token of tokens) {
    const lower = token.toLowerCase();
    const match = OPTION_BY_LOWER.get(lower) || ALIASES.get(lower);
    if (match) {
      if (!selected.includes(match)) selected.push(match);
    } else {
      otherTokens.push(token);
    }
  }
  const other = otherTokens.join(", ");
  if (other && !selected.includes("Other")) selected.push("Other");
  return { selected, other };
};

export const serializeDietaryRestrictions = (selected, other) => {
  const trimmedOther = (other || "").trim();
  const ordered = DIETARY_RESTRICTION_OPTIONS.filter((o) =>
    (selected || []).includes(o),
  );
  // Swap "Other" for its free-text detail when provided (mirrors the
  // expertise/skills "Other" submit pattern used across the forms).
  const parts = ordered.map((o) =>
    o === "Other" && trimmedOther ? trimmedOther : o,
  );
  return parts.join(", ");
};

const DietaryRestrictionsSelect = ({
  value,
  onChange,
  label = "Dietary restrictions (optional)",
  helperText = "Select all that apply so we can plan meals for in-person attendees.",
  required = false,
  MenuProps,
  sx = { mb: 3 },
}) => {
  const { selected, other } = useMemo(
    () => parseDietaryRestrictions(value),
    [value],
  );

  const emit = (nextSelected, nextOther) => {
    onChange(serializeDietaryRestrictions(nextSelected, nextOther));
  };

  const handleSelectChange = (event) => {
    const raw = event.target.value;
    let next = typeof raw === "string" ? raw.split(",") : raw;
    if (next.includes("None") && !selected.includes("None")) {
      // "None" was just picked — it stands alone.
      next = ["None"];
    } else if (next.length > 1) {
      next = next.filter((o) => o !== "None");
    }
    emit(next, next.includes("Other") ? other : "");
  };

  const handleOtherChange = (event) => {
    emit(selected, event.target.value);
  };

  const labelId = "dietary-restrictions-label";

  return (
    <Box sx={sx}>
      <FormControl fullWidth required={required}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          id="dietary-restrictions"
          multiple
          value={selected}
          onChange={handleSelectChange}
          label={label}
          MenuProps={MenuProps}
          renderValue={(vals) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {vals.map((v) => (
                <Chip
                  key={v}
                  size="small"
                  label={v === "Other" && other ? other : v}
                />
              ))}
            </Box>
          )}
        >
          {DIETARY_RESTRICTION_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={selected.includes(option)} size="small" />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
      {selected.includes("Other") && (
        <TextField
          size="small"
          fullWidth
          label="Tell us more about your dietary needs"
          placeholder="e.g. severe garlic allergy, low-sodium"
          value={other}
          onChange={handleOtherChange}
          sx={{ mt: 1.5 }}
        />
      )}
    </Box>
  );
};

export default DietaryRestrictionsSelect;
