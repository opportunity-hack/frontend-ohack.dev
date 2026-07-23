import React, { useEffect, useMemo } from "react";
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

const parsePronouns = (value) => {
  if (!value) return { selected: "", other: "" };
  const raw = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((t) => t.trim());
  const tokens = raw.map((t) => t.trim()).filter(Boolean);
  let selected = "";
  const otherTokens = [];
  for (const t of tokens) {
    if (!selected && CURATED_PRONOUNS.includes(t)) selected = t;
    else otherTokens.push(t);
  }
  return { selected, other: selected ? "" : otherTokens.join(", ") };
};

const serializePronouns = (selected, other) => {
  if (selected) return selected;
  const trimmedOther = (other || "").trim();
  return trimmedOther;
};

const PronounsPicker = ({
  value,
  onChange,
  label = "Pronouns",
  helperText = "Choose one set. Use 'Add your own' if your pronouns aren't listed.",
  required = false,
  showAddYourOwn = true,
}) => {
  const { selected, other } = useMemo(() => parsePronouns(value), [value]);
  const [showOther, setShowOther] = React.useState(other.length > 0);

  useEffect(() => {
    setShowOther(other.length > 0);
  }, [other]);

  const emit = (nextSelected, nextOther) => {
    onChange(serializePronouns(nextSelected, nextOther));
  };

  const toggle = (option) => {
    const next = selected === option ? "" : option;
    setShowOther(false);
    emit(next, "");
  };

  const handleOtherChange = (e) => {
    emit("", e.target.value);
  };

  return (
    <FormControl fullWidth required={required} sx={{ mb: 3 }}>
      <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{label}</FormLabel>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
        {CURATED_PRONOUNS.map((option) => {
          const active = selected === option;
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
              if (next) {
                emit("", other);
              } else {
                emit(selected, "");
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
          helperText="Enter one set of pronouns."
          sx={{ mb: 1 }}
        />
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default PronounsPicker;
