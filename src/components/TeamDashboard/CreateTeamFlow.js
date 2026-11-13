import React, { useEffect, useRef } from "react";
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
import { scrollToStepContent } from "../ApplicationForm/stepScroll";

// One hint per step, shown while Next is disabled. Index-aligned with the
// page's `steps` array (Team details → GitHub → Choose projects →
// Teammates & notes → Confirm).
const STEP_HELP = [
  "Enter a team name and a new Slack channel name to continue",
  "Enter a GitHub username we can find to continue",
  "Rank the projects you want to build to continue",
  "",
  "",
];

/**
 * The team-creation stepper shell — JSX only. All form state/handlers stay
 * in the page (`manageteam.js`); this just renders them.
 *
 * Enter-to-submit: the browser submits a <form> when Enter is pressed in a
 * text field. That used to call handleSubmit directly, so Enter on the
 * GitHub step could create a team without ever reaching Confirm. Now the
 * form's submit only ever means "Next"; the team is created ONLY by the
 * Confirm step's explicit "Create team" button.
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
  const isLastStep = activeStep === steps.length - 1;
  const stepContentRef = useRef(null);
  const firstRenderRef = useRef(true);

  // Move focus + scroll to the new step on Next/Back (not on first mount).
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    scrollToStepContent(stepContentRef);
  }, [activeStep]);

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!isLastStep && !nextDisabled && !loading) handleNext();
  };

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

        <form onSubmit={onFormSubmit} noValidate>
          <Box
            ref={stepContentRef}
            tabIndex={-1}
            sx={{ scrollMarginTop: 96, outline: "none" }}
          >
            {children}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              type="button"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ textTransform: "none" }}
            >
              Back
            </Button>
            <Button
              // Explicit "button": the create action must be a deliberate
              // click, never an implicit form submit.
              type="button"
              variant="contained"
              onClick={isLastStep ? handleSubmit : handleNext}
              disabled={isLastStep ? loading : nextDisabled}
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
              {isLastStep ? "Create team" : "Next"}
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

        {nextDisabled && !formError && !isLastStep && STEP_HELP[activeStep] && (
          <Typography
            color="textSecondary"
            align="right"
            sx={{ mt: 1, fontSize: "0.875rem", fontStyle: "italic" }}
          >
            {STEP_HELP[activeStep]}
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
                Creating your team and its Slack channel — this can take up to a
                minute…
              </Typography>
            </Box>
          </Fade>
        )}

        {formError && (
          <Fade in={!!formError}>
            <Alert severity="error" role="alert" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          </Fade>
        )}
      </Box>
    </ThemeProvider>
  );
}
