import React from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  Alert,
  Paper,
} from "@mui/material";
import {
  ROLE_OPTIONS,
  IMMIGRATION_OPTIONS,
  OPT_TYPE_OPTIONS,
  OPT_ACKNOWLEDGMENTS,
  LETTER_LABELS,
} from "./letterConfig";

function Question({ label, children }) {
  return (
    <FormControl component="fieldset" sx={{ display: "block", mb: 2.5 }}>
      <FormLabel
        component="legend"
        sx={{ fontWeight: 700, color: "text.primary", mb: 1, "&.Mui-focused": { color: "text.primary" } }}
      >
        {label}
      </FormLabel>
      {children}
    </FormControl>
  );
}

export default function LetterChecklist({ answers, setAnswers, result }) {
  const { role, needsImmigration, optType, ack = {} } = answers;

  const setField = (key, value) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const setAck = (key, checked) =>
    setAnswers((prev) => ({ ...prev, ack: { ...prev.ack, [key]: checked } }));

  // Branching: reset downstream answers when an upstream answer changes.
  const onRole = (value) =>
    setAnswers((prev) => ({ ...prev, role: value, needsImmigration: "", optType: "", ack: {} }));
  const onImmigration = (value) =>
    setAnswers((prev) => ({ ...prev, needsImmigration: value, optType: "", ack: {} }));
  const onOptType = (value) =>
    setAnswers((prev) => ({ ...prev, optType: value, ack: {} }));

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Which letter do you need?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Answer a few questions and we'll pick the right letter for you.
      </Typography>

      {/* Q1 */}
      <Question label="1. What was your role at this event?">
        <RadioGroup value={role || ""} onChange={(e) => onRole(e.target.value)}>
          {ROLE_OPTIONS.map((o) => (
            <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
          ))}
        </RadioGroup>
      </Question>

      {/* Q2 — software branch only */}
      {role === "software" && (
        <Question label="2. Do you need this letter to count as employment for an immigration status (for example, F-1 OPT)?">
          <RadioGroup
            value={needsImmigration || ""}
            onChange={(e) => onImmigration(e.target.value)}
          >
            {IMMIGRATION_OPTIONS.map((o) => (
              <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
            ))}
          </RadioGroup>
        </Question>
      )}

      {/* Q3 — OPT branch */}
      {role === "software" && needsImmigration === "yes" && (
        <Question label="3. Which OPT are you on?">
          <RadioGroup value={optType || ""} onChange={(e) => onOptType(e.target.value)}>
            {OPT_TYPE_OPTIONS.map((o) => (
              <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
            ))}
          </RadioGroup>
        </Question>
      )}

      {/* Block / advisory messages */}
      {result.block && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          {result.blockMessage} We've selected the <strong>General Volunteer</strong> letter
          for you instead.
        </Alert>
      )}
      {result.advisory && !result.block && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          {result.advisory}
        </Alert>
      )}

      {/* Q4 — only for initial post-completion OPT */}
      {role === "software" && needsImmigration === "yes" && optType === "initial" && (
        <Question label="4. Please confirm all of the following to generate the OPT letter:">
          <Box>
            {OPT_ACKNOWLEDGMENTS.map((a) => (
              <FormControlLabel
                key={a.key}
                sx={{ alignItems: "flex-start", mb: 1, display: "flex" }}
                control={
                  <Checkbox
                    checked={Boolean(ack[a.key])}
                    onChange={(e) => setAck(a.key, e.target.checked)}
                    sx={{ pt: 0 }}
                  />
                }
                label={<Typography variant="body2">{a.label}</Typography>}
              />
            ))}
          </Box>
          {result.needsAck && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Check all four boxes above to unlock the OPT letter.
            </Alert>
          )}
        </Question>
      )}

      {result.letterType && (
        <Alert severity="success" sx={{ mt: 1 }}>
          We'll generate your <strong>{LETTER_LABELS[result.letterType]}</strong> letter. Fill
          in the details below to complete it.
        </Alert>
      )}
    </Paper>
  );
}
