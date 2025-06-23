import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 280,
  width: "300px"
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: "1rem",
  transform: "translate(14px, 14px) scale(1)",
  "&.Mui-focused, &.MuiInputLabel-shrink": {
    transform: "translate(14px, -6px) scale(0.75)",
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    paddingTop: "14px",
    paddingBottom: "14px",
  },
}));

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  id,
  multiple = false,
}) => {
  return (
    <StyledFormControl variant="outlined">
      <StyledInputLabel id={`${id}-label`}>{label}</StyledInputLabel>
      <StyledSelect
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={onChange}
        multiple={multiple}
        renderValue={multiple ? (selected) => selected.join(", ") : undefined}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {multiple && (
              <Checkbox checked={value.indexOf(option.value) > -1} />
            )}
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </StyledSelect>
    </StyledFormControl>
  );
};

export default CustomSelect;
