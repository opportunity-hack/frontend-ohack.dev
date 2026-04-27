import React, { useMemo } from "react";
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from "@mui/material";

export const CURATED_PRONOUNS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "xe/xem",
  "ze/zir",
  "Prefer not to say",
];

const EXCLUSIVE = "Prefer not to say";

const parsePronouns = (value) => {
  if (!value) return { selected: [], other: "" };
  const raw = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((t) => t.trim());
  const tokens = raw.map((t) => t.trim()).filter(Boolean);
  const selected = [];
  const otherTokens = [];
  for (const t of tokens) {
    if (CURATED_PRONOUNS.includes(t)) selected.push(t);
    else otherTokens.push(t);
  }
  return { selected, other: otherTokens.join(", ") };
};

const serializePronouns = (selected, other) => {
  const all = [...selected];
  const trimmedOther = (other || "").trim();
  if (trimmedOther) all.push(trimmedOther);
  return all.join(", ");
};

const PronounsPicker = ({
  value,
  onChange,
  label = "Pronouns",
  helperText = "Select all that apply. Use 'Add your own' if your pronouns aren't listed.",
  required = false,
  showAddYourOwn = true,
}) => {
  const { selected, other } = useMemo(() => parsePronouns(value), [value]);
  const [showOther, setShowOther] = React.useState(other.length > 0);

  const emit = (nextSelected, nextOther) => {
    onChange(serializePronouns(nextSelected, nextOther));
  };

  const toggle = (option) => {
    if (option === EXCLUSIVE) {
      // Choosing "Prefer not to say" clears everything else.
      const isOn = selected.includes(EXCLUSIVE);
      const next = isOn ? [] : [EXCLUSIVE];
      setShowOther(false);
      emit(next, "");
      return;
    }
    // Choosing any other option also clears "Prefer not to say".
    const without = selected.filter((s) => s !== EXCLUSIVE);
    const next = without.includes(option)
      ? without.filter((s) => s !== option)
      : [...without, option];
    emit(next, other);
  };

  const handleOtherChange = (e) => {
    // Adding a custom pronoun also clears "Prefer not to say".
    const without = selected.filter((s) => s !== EXCLUSIVE);
    emit(without, e.target.value);
  };

  return (
    <FormControl fullWidth required={required} sx={{ mb: 3 }}>
      <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{label}</FormLabel>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
        {CURATED_PRONOUNS.map((option) => {
          const active = selected.includes(option);
          return (
            <Chip
              key={option}
              label={option}
              clickable
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
              onClick={() => toggle(option)}
              sx={{ fontSize: "0.95rem" }}
            />
          );
        })}
        {showAddYourOwn && (
          <Chip
            label={showOther ? "Hide custom" : "+ Add your own"}
            clickable
            variant="outlined"
            onClick={() => {
              const next = !showOther;
              setShowOther(next);
              if (!next) {
                const without = selected.filter((s) => s !== EXCLUSIVE);
                emit(without, "");
              }
            }}
            sx={{ fontSize: "0.95rem" }}
          />
        )}
      </Box>
      {showOther && (
        <TextField
          size="small"
          label="Your pronouns"
          placeholder="e.g. ey/em, fae/faer"
          value={other}
          onChange={handleOtherChange}
          helperText="Separate multiple sets with commas."
          sx={{ mb: 1 }}
        />
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default PronounsPicker;
