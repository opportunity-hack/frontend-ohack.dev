// Access-code unlock form for a closed application (Nov 2026). Organizers set
// a code per event (constraints.application_<type>_enabled_code) and share it
// with late applicants or people updating after the form was locked. The
// compare is client-side (same as the judge form's passcode) — it is a nudge
// gate, not a security boundary; the backend still accepts submissions.
//
// Extracted from judge-application.js's passcode form. The judge page keeps
// its own copy for now; migrating it here is opportunistic.

import React, { useId, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { primaryButtonSx, refinedFieldSx, stepTitleSx } from "./refinedStyles";

export const ACCESS_CODE_EMPTY_ERROR = "Please enter the access code.";
export const ACCESS_CODE_WRONG_ERROR =
  "That code didn't match. Double-check it with the event organizers and try again.";

export default function AccessCodeForm({
  passcode,
  onUnlock,
  title = "Enter your access code",
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    const entered = value.trim();
    if (!entered) {
      setError(ACCESS_CODE_EMPTY_ERROR);
      return;
    }
    if (entered === String(passcode || "").trim()) {
      setError("");
      setValue("");
      onUnlock?.();
      return;
    }
    setError(ACCESS_CODE_WRONG_ERROR);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mb: 1 }}>
      <Typography
        component="h2"
        sx={{ ...stepTitleSx, fontSize: { xs: "21px", sm: "24px" } }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <TextField
          id={inputId}
          label="Access code"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          error={Boolean(error)}
          helperText={error || " "}
          type="password"
          autoComplete="off"
          placeholder="The code the organizers shared with you"
          sx={{ ...refinedFieldSx, flexGrow: 1, maxWidth: 400 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!value.trim()}
          sx={{ ...primaryButtonSx, alignSelf: "flex-start", mt: "4px" }}
        >
          Unlock application
        </Button>
      </Box>
    </Box>
  );
}
