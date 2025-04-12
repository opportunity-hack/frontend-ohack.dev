import React, { memo } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  CircularProgress,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled animated button for better UX
const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

/**
 * Form stepper component for multi-step form navigation
 */
const FormStepper = memo(({ 
  steps, 
  activeStep, 
  handleNext, 
  handleBack, 
  handleSubmit, 
  isNextDisabled, 
  loading 
}) => {
  return (
    <>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <AnimatedButton
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={activeStep === steps.length - 1 ? loading : isNextDisabled}
          sx={{
            opacity: isNextDisabled ? 0.7 : 1,
            '&:disabled': {
              backgroundColor: 'rgba(25, 118, 210, 0.5)',
              color: 'white',
            },
          }}
        >
          {activeStep === steps.length - 1 ? "Create Team" : "Next"}
          {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
        </AnimatedButton>
      </Box>
      
      {isNextDisabled && (
        <Typography
          color="textSecondary"
          align="right"
          sx={{ mt: 2, fontSize: "0.875rem", fontStyle: "italic" }}
        >
          {activeStep === 0
            ? "Please complete your team details to continue"
            : activeStep === 1
            ? "Please provide a valid GitHub username"
            : activeStep === 2
            ? "Please select at least one nonprofit"
            : ""}
        </Typography>
      )}
    </>
  );
});

FormStepper.displayName = 'FormStepper';

export default FormStepper;