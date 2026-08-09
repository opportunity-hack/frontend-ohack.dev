// Shared "civic editorial" (refined) style constants for the application
// forms (/hack/[event_id]/{mentor,judge,sponsor,volunteer,hacker}-application).
// Extracted verbatim from mentor-application.js — the canonical refined form.
// These sx objects assume the page body is wrapped in <RefinedRoot> (which
// defines the CSS variables) with <RefinedFonts/> in <Head>.

export const refinedFieldSx = {
  mb: 3,
  "& .MuiInputBase-root": {
    bgcolor: "var(--surface)",
    color: "var(--ink)",
    borderRadius: 2,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--line)",
  },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d5cdbd",
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--brand)",
  },
  "& .MuiInputLabel-root": {
    color: "var(--muted)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--brand)",
  },
  "& .MuiFormHelperText-root": {
    color: "var(--muted)",
  },
  "& textarea, & input": {
    color: "var(--ink)",
  },
};

export const refinedChoiceSx = {
  color: "var(--line)",
  "&.Mui-checked": {
    color: "var(--brand)",
  },
};

export const refinedChipSx = {
  border: "1px solid var(--line)",
  bgcolor: "var(--surface-2)",
  color: "var(--ink)",
  fontWeight: 500,
  "& .MuiChip-deleteIcon": {
    color: "var(--muted)",
  },
};

export const refinedAlertSx = {
  borderRadius: 2,
  border: "1px solid var(--line)",
  bgcolor: "var(--surface-2)",
  color: "var(--ink)",
  "& .MuiAlert-icon": {
    color: "var(--brand)",
    mt: 0.25,
  },
  "& .MuiAlert-message": {
    width: "100%",
  },
};

export const refinedInlineLinkSx = {
  color: "var(--brand)",
  fontWeight: 600,
  textDecorationColor: "#d5cdbd",
  "&:hover": {
    color: "var(--brand-ink)",
  },
};

export const refinedCardSx = {
  border: "1px solid var(--line)",
  borderRadius: 2,
  backgroundColor: "var(--surface)",
  boxShadow: "none",
};

export const refinedSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 1,
      borderRadius: 2,
      border: "1px solid var(--line)",
      boxShadow: "0 18px 40px -28px rgba(22,24,29,0.45)",
    },
  },
};

export const stepTitleSx = {
  fontFamily: "var(--display,'Fraunces',Georgia,serif)",
  fontSize: { xs: "1.65rem", sm: "2rem" },
  fontWeight: 500,
  letterSpacing: "-0.015em",
  color: "var(--ink)",
  mb: 1,
};

export const stepLeadSx = {
  color: "var(--muted)",
  maxWidth: "44rem",
  mb: 3,
  lineHeight: 1.7,
};

export const eventMarkdownSx = {
  color: "var(--muted)",
  lineHeight: 1.75,
  mt: 2,
  "& p": {
    my: 1.5,
  },
  "& h1, & h2, & h3, & h4": {
    fontFamily: "var(--display,'Fraunces',Georgia,serif)",
    fontWeight: 500,
    letterSpacing: "-0.015em",
    color: "var(--ink)",
    mt: 3,
    mb: 1,
  },
  "& h1": {
    fontSize: "1.4rem",
  },
  "& h2": {
    fontSize: "1.25rem",
  },
  "& h3, & h4": {
    fontSize: "1.1rem",
  },
  "& ul, & ol": {
    my: 1.5,
    pl: 3,
  },
  "& li": {
    mb: 0.6,
  },
  "& a": {
    color: "var(--brand)",
    fontWeight: 600,
    textDecorationColor: "#d5cdbd",
  },
  "& a:hover": {
    color: "var(--brand-ink)",
  },
  "& strong": {
    color: "var(--ink)",
  },
  "& code": {
    bgcolor: "var(--surface-2)",
    px: 0.5,
    py: 0.1,
    borderRadius: 0.75,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.95em",
  },
};

export const infoAlertSx = {
  ...refinedAlertSx,
};

export const warningAlertSx = {
  ...refinedAlertSx,
  borderColor: "#e7d1aa",
  bgcolor: "#faf3e5",
  "& .MuiAlert-icon": {
    color: "#9b5d05",
    mt: 0.25,
  },
};

export const successAlertSx = {
  ...refinedAlertSx,
  borderColor: "#c5dbc7",
  bgcolor: "#edf7f0",
  "& .MuiAlert-icon": {
    color: "#2f6e50",
    mt: 0.25,
  },
};

export const errorAlertSx = {
  ...refinedAlertSx,
  borderColor: "#e4c0ba",
  bgcolor: "#f9efed",
  "& .MuiAlert-icon": {
    color: "#b04a36",
    mt: 0.25,
  },
};

export const emphasisPanelSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 2,
  border: "1px solid var(--line)",
  backgroundColor: "var(--surface-2)",
};

export const primaryButtonSx = {
  backgroundColor: "var(--brand)",
  color: "#fff",
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "5px",
  px: 2.75,
  py: 1.15,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#16315a",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(27,58,107,0.35)",
    color: "rgba(255,255,255,0.72)",
  },
};

export const ghostButtonSx = {
  borderColor: "var(--line)",
  color: "var(--ink)",
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "5px",
  px: 2.5,
  py: 1.05,
  boxShadow: "none",
  "&:hover": {
    borderColor: "var(--ink)",
    backgroundColor: "rgba(0,0,0,0.02)",
    boxShadow: "none",
  },
};

export const refinedStepperSx = {
  "& .MuiStepLabel-label": {
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    fontSize: "0.92rem",
    fontWeight: 500,
    mt: 1,
    color: "#5B6270",
  },
  "& .MuiStepLabel-label.Mui-active": {
    color: "#1B3A6B",
    fontWeight: 700,
  },
  "& .MuiStepLabel-label.Mui-completed": {
    color: "#16181D",
  },
  "& .MuiStepIcon-root": {
    color: "#E7E1D4",
    width: 28,
    height: 28,
  },
  "& .MuiStepIcon-root.Mui-active": {
    color: "#1B3A6B",
  },
  "& .MuiStepIcon-root.Mui-completed": {
    color: "#1B3A6B",
  },
  "& .MuiStepIcon-text": {
    fill: "#fff",
  },
  "& .MuiStepConnector-line": {
    borderColor: "#E7E1D4",
  },
};

// Mobile variant: merge into refinedStepperSx when useMediaQuery(down("sm")).
// Matches the mentor form's horizontally-scrollable compact stepper.
export const refinedStepperMobileSx = {
  overflowX: "auto",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
  "& .MuiStep-root": {
    minWidth: 92,
  },
  "& .MuiStepLabel-root": {
    px: 0.5,
  },
  "& .MuiStepLabel-label": {
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
  },
  "& .MuiSvgIcon-root": {
    width: 20,
    height: 20,
  },
};
