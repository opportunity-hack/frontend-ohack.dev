import React from "react";
import {
  Box,
  Button,
  Fade,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
  ThemeProvider,
  Alert,
} from "@mui/material";
import { Puff } from "react-loading-icons";
import {
  refinedFormTheme,
  refinedStepperSx,
} from "../ApplicationForm/refinedStyles";

const STEP_HELP = [
  "Please complete your team details to continue",
  "Please provide a valid GitHub username",
  "Please select a nonprofit organization",
  "",
];

/**
 * The team-creation stepper shell — JSX only. All form state/handlers stay
 * in the page (`manageteam.js`); this just renders them.
 */
export default function CreateTeamFlow({
  steps,
  activeStep,
  loading,
  formError,
  isNextDisabled,
  handleNext,
  handleBack,
  handleSubmit,
  children,
}) {
  const nextDisabled = isNextDisabled();

  return (
    <ThemeProvider theme={refinedFormTheme}>
      <Box className="ohx-card" sx={{ mt: 3, p: { xs: 2, md: 3 } }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ mb: 4, ...refinedStepperSx }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {children}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              type="button"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ textTransform: "none" }}
            >
              Back
            </Button>
            <Button
              // Explicit "button" (not the HTML default of "submit" a
              // button gets inside a <form>) — `handleNext`/`handleBack`
              // don't call preventDefault, so an implicit-submit button
              // here also fires the form's onSubmit={handleSubmit} right
              // after its own onClick. On the confirmation step, where
              // every field already passes validateForm(), clicking "Back"
              // would have silently created the team a second way.
              type="button"
              variant="contained"
              onClick={
                activeStep === steps.length - 1 ? handleSubmit : handleNext
              }
              disabled={
                activeStep === steps.length - 1 ? loading : nextDisabled
              }
              sx={{
                textTransform: "none",
                bgcolor: "var(--brand, #1B3A6B)",
                "&:hover": { bgcolor: "var(--brand-ink, #0E2547)" },
                "&:disabled": {
                  bgcolor: "rgba(27,58,107,0.4)",
                  color: "white",
                },
              }}
            >
              {activeStep === steps.length - 1 ? "Create Team" : "Next"}
              {loading && (
                <Puff
                  stroke="#fff"
                  width={20}
                  height={20}
                  style={{ marginLeft: "8px" }}
                />
              )}
            </Button>
          </Box>
        </form>

        {nextDisabled && !formError && (
          <Typography
            color="textSecondary"
            align="right"
            sx={{ mt: 1, fontSize: "0.875rem", fontStyle: "italic" }}
          >
            {STEP_HELP[activeStep] || ""}
          </Typography>
        )}

        {loading && (
          <Fade in={loading}>
            <Box sx={{ mt: 3 }}>
              <LinearProgress
                sx={{ "& .MuiLinearProgress-bar": { bgcolor: "var(--brand)" } }}
              />
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 1, color: "var(--muted)" }}
              >
                Creating your Slack channel and GitHub repo — this takes up to a
                minute…
              </Typography>
            </Box>
          </Fade>
        )}

        {formError && (
          <Fade in={!!formError}>
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          </Fade>
        )}
      </Box>
    </ThemeProvider>
  );
}
