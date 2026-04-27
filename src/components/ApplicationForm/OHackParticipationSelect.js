import React from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export const OHACK_PARTICIPATION_OPTIONS = [
  "This is my first Opportunity Hack! 👆",
  "This will be my 2nd Opportunity Hack ✌️",
  "This will be my 3rd Opportunity Hack ☘️",
  "I've been to 4+ Opportunity Hacks 🔥",
];

const OHackParticipationSelect = ({
  value,
  onChange,
  name = "participationCount",
  required = true,
  sx,
}) => (
  <FormControl fullWidth required={required} sx={sx}>
    <InputLabel id={`${name}-label`}>
      How many Opportunity Hack hackathons have you attended?
    </InputLabel>
    <Select
      labelId={`${name}-label`}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      label="How many Opportunity Hack hackathons have you attended?"
    >
      {OHACK_PARTICIPATION_OPTIONS.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>
      Only count Opportunity Hack hackathons — not other hackathons or coding
      events. If this is your first time, that's great!
    </FormHelperText>
  </FormControl>
);

export default OHackParticipationSelect;
