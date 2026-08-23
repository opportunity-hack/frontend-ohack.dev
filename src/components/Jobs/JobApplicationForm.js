import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useAuthInfo } from "@propelauth/react";
import ReactMarkdown from "react-markdown";

import { useEnv } from "../../context/env.context";
import { trackEvent } from "../../lib/ga";
import { useFormPersistence } from "../../hooks/use-form-persistence";
import { useRecaptcha } from "../../hooks/use-recaptcha";
import FormPersistenceControls from "../FormPersistenceControls";
import { IntroVideoField, PronounsPicker, scrollToStepContent } from "../ApplicationForm";
import {
  refinedFormTheme,
  refinedFieldSx,
  refinedChoiceSx,
  refinedSelectMenuProps,
  stepTitleSx,
  stepLeadSx,
  eventMarkdownSx,
  infoAlertSx,
  warningAlertSx,
  successAlertSx,
  errorAlertSx,
  emphasisPanelSx,
  primaryButtonSx,
  ghostButtonSx,
  refinedStepperSx,
  refinedStepperMobileSx,
  formProseSx,
} from "../ApplicationForm/refinedStyles";
import ResumeUploadField from "./ResumeUploadField";
import ShareRow from "./ShareRow";
import { Eyebrow } from "../design/refined";

// Volunteer job application form, rendered in the #apply section of
// /jobs/[slug] for logged-in users. Modeled on the mentor application
// (the canonical refined form): useFormPersistence for localStorage autosave,
// shared refinedStyles, step scroll via scrollToStepContent. The video is
// REQUIRED and one prompt references the work-sample answer — that pairing is
// the AI/low-effort filter, don't soften it.
// NOTE: loadPreviousSubmission is deliberately NOT used — the jobs API has its
// own GET /api/jobs/<slug>/applications/me for the already-applied panel.

const STEPS = ["About you", "Commitment", "Work sample", "Video & review"];

const HOURS_OPTIONS = [
  { label: "1–2 hours", floor: 1 },
  { label: "3–5 hours", floor: 3 },
  { label: "6–8 hours", floor: 6 },
  { label: "9+ hours", floor: 9 },
];

const DURATION_OPTIONS = [
  "Through the Fall 2026 event",
  "3–6 months",
  "6–12 months",
  "As long as I'm useful",
];

const CHANNEL_OPTIONS = ["Slack", "Email", "Either works"];

const SLACK_OPTIONS = ["Yes, I'm in the OHack Slack", "Not yet"];

const MIN_WORK_SAMPLE_CHARS = 200; // keep in sync with backend MIN_JOB_WORK_SAMPLE_LENGTH

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const hoursFloor = (label) =>
  HOURS_OPTIONS.find((o) => o.label === label)?.floor ?? 0;

const isLinkedInUrl = (value) => {
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname.toLowerCase().includes("linkedin.com")
    );
  } catch (e) {
    return false;
  }
};

const initialFormData = {
  name: "",
  email: "",
  pronouns: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  inPersonOk: "",
  visaAck: false,
  hoursPerWeek: "",
  durationCommitment: "",
  preferredChannel: "",
  slackMember: "",
  referralSource: "",
  workSampleAnswer: "",
  whyOhack: "",
  resumeUrl: "",
  videoUrl: "",
};

export default function JobApplicationForm({ listing }) {
  const { user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const { getRecaptchaToken } = useRecaptcha();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(null); // null | {status}
  const [checkingApplied, setCheckingApplied] = useState(true);

  const stepContentRef = useRef(null);
  const appliedCheckRanRef = useRef(false);
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const {
    formData,
    setFormData,
    formRef,
    handleFormChange,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearSavedData,
    notification,
    closeNotification,
  } = useFormPersistence({
    formType: "job",
    eventId: listing.slug,
    userId: user?.userId,
    initialFormData,
    apiServerUrl,
    accessToken,
  });

  const isPhoenixRole = listing.location_type === "phoenix_in_person";
  const minHours = listing.min_hours_per_week || 0;

  // Restore an in-progress draft, then prefill identity fields that are empty.
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: prev.email || user.email || "",
    }));
  }, [user?.userId]);

  // Already-applied check — gated on token PRESENCE (PropelAuth rotates the
  // token on refocus; the raw value must never key an effect), run once.
  useEffect(() => {
    if (!accessToken || appliedCheckRanRef.current) return;
    appliedCheckRanRef.current = true;
    const check = async () => {
      try {
        // Timeout so a slow backend can't pin the spinner forever — worst
        // case the form renders and the backend 409s a duplicate on submit.
        const res = await fetch(
          `${apiServerUrl}/api/jobs/${listing.slug}/applications/me`,
          {
            headers: { Authorization: `Bearer ${accessTokenRef.current}` },
            signal: AbortSignal.timeout(6000),
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.applied) setAlreadyApplied(data);
        }
      } catch (e) {
        // Non-fatal — worst case the backend 409s on submit
      } finally {
        setCheckingApplied(false);
      }
    };
    check();
  }, [accessToken, apiServerUrl, listing.slug]);

  useEffect(() => {
    if (!accessToken && checkingApplied) {
      // No token yet (auth still resolving) — don't block the form forever
      const t = setTimeout(() => setCheckingApplied(false), 4000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [accessToken, checkingApplied]);

  const setField = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });
  };

  const trackStep = (action, label) => {
    trackEvent({
      action,
      params: { event_label: label, page: "job_application", job: listing.slug },
    });
  };

  // ----- validation (single top-level error string, mentor-form style) -----

  const validateAboutYou = () => {
    if (!formData.name.trim()) {
      setError("Please tell us your name.");
      return false;
    }
    if (!EMAIL_RE.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!isLinkedInUrl(formData.linkedinUrl.trim())) {
      setError("Please paste your LinkedIn profile URL (it should look like linkedin.com/in/your-name).");
      return false;
    }
    if (isPhoenixRole && formData.inPersonOk !== "Yes") {
      setError(
        "This role requires being on-site in Phoenix/Tempe for the event weekend. If that's not possible for you, take a look at our remote roles — we'd still love your help.",
      );
      return false;
    }
    if (!formData.visaAck) {
      setError("Please confirm you understand this is an unpaid volunteer role and we cannot sponsor visas.");
      return false;
    }
    setError("");
    return true;
  };

  const validateCommitment = () => {
    if (!formData.hoursPerWeek) {
      setError("Please tell us how many hours a week you can give.");
      return false;
    }
    if (hoursFloor(formData.hoursPerWeek) < minHours) {
      setError(
        `This role really needs at least ${minHours} hours a week to succeed. If that's more than you can commit right now, volunteering at the hackathon itself is a great way to plug in — no hard feelings at all.`,
      );
      return false;
    }
    if (!formData.durationCommitment) {
      setError("Please tell us how long you can stick with us.");
      return false;
    }
    if (!formData.preferredChannel) {
      setError("Please pick a preferred communication channel.");
      return false;
    }
    setError("");
    return true;
  };

  const validateWorkSample = () => {
    const chars = formData.workSampleAnswer.trim().length;
    if (chars < MIN_WORK_SAMPLE_CHARS) {
      setError(
        `Your work sample needs a bit more depth — at least ${MIN_WORK_SAMPLE_CHARS} characters (you have ${chars}). This is the part we read most closely.`,
      );
      return false;
    }
    if (!formData.resumeUrl) {
      setError("Please upload your resume (PDF).");
      return false;
    }
    setError("");
    return true;
  };

  const validateVideo = () => {
    if (!formData.videoUrl) {
      setError("The video is required — it's how we know we're talking to you. Upload a file or paste a YouTube/Vimeo/Loom link.");
      return false;
    }
    setError("");
    return true;
  };

  const STEP_VALIDATORS = [validateAboutYou, validateCommitment, validateWorkSample, validateVideo];

  const handleNext = () => {
    if (!STEP_VALIDATORS[activeStep]()) return;
    if (activeStep === STEPS.length - 1) {
      handleSubmit();
      return;
    }
    const next = activeStep + 1;
    setActiveStep(next);
    trackStep("job_app_step", STEPS[next]);
    scrollToStepContent(stepContentRef);
  };

  const handleBack = () => {
    if (activeStep === 0) return;
    setActiveStep(activeStep - 1);
    scrollToStepContent(stepContentRef);
  };

  const handleSubmit = async () => {
    for (const validate of STEP_VALIDATORS) {
      if (!validate()) return;
    }
    setSubmitting(true);
    setError("");
    try {
      const recaptchaToken = await getRecaptchaToken("job_application");
      if (!recaptchaToken && process.env.NODE_ENV === "production") {
        setError("Could not verify you're human — please refresh and try again.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        pronouns: formData.pronouns,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        linkedin_url: formData.linkedinUrl.trim(),
        resume_url: formData.resumeUrl,
        video_url: formData.videoUrl,
        hours_per_week: formData.hoursPerWeek,
        duration_commitment: formData.durationCommitment,
        preferred_channel: formData.preferredChannel,
        slack_member: formData.slackMember,
        in_person_ok: formData.inPersonOk === "Yes",
        visa_ack: formData.visaAck,
        work_sample_answer: formData.workSampleAnswer.trim(),
        why_ohack: formData.whyOhack.trim(),
        referral_source: formData.referralSource.trim(),
        recaptchaToken,
      };

      const res = await fetch(`${apiServerUrl}/api/jobs/${listing.slug}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessTokenRef.current}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setAlreadyApplied({ applied: true, status: "submitted" });
        return;
      }
      if (!res.ok) {
        setError(data.error || "Something went wrong submitting your application — please try again.");
        trackStep("job_app_submit_error", data.error || String(res.status));
        return;
      }

      clearSavedData();
      setSuccess(true);
      trackStep("job_app_submit", listing.slug);
      scrollToStepContent(stepContentRef);
    } catch (e) {
      setError("Network error — please check your connection and try again.");
      trackStep("job_app_submit_error", "network");
    } finally {
      setSubmitting(false);
    }
  };

  // ----- step content -----

  const renderAboutYou = () => (
    <Box>
      <Eyebrow>Step 1 of 4</Eyebrow>
      <Typography component="h3" sx={stepTitleSx}>
        About you
      </Typography>
      <Typography variant="body1" sx={stepLeadSx}>
        The basics, plus where to find your professional footprint.
      </Typography>

      <TextField
        fullWidth
        required
        name="name"
        label="Your name"
        value={formData.name}
        onChange={handleFormChange}
        sx={refinedFieldSx}
      />
      <TextField
        fullWidth
        required
        name="email"
        type="email"
        label="Email"
        helperText="We'll send your confirmation here — and ask you to reply to it."
        value={formData.email}
        onChange={handleFormChange}
        sx={refinedFieldSx}
      />
      <PronounsPicker
        value={formData.pronouns}
        onChange={(value) => setField("pronouns", value)}
      />
      <TextField
        fullWidth
        required
        name="linkedinUrl"
        label="LinkedIn profile URL"
        placeholder="https://www.linkedin.com/in/your-name"
        value={formData.linkedinUrl}
        onChange={handleFormChange}
        sx={refinedFieldSx}
      />
      <TextField
        fullWidth
        name="location"
        label="Where are you based? (city, state)"
        value={formData.location}
        onChange={handleFormChange}
        sx={refinedFieldSx}
      />
      <TextField
        fullWidth
        name="phone"
        label="Phone (optional)"
        value={formData.phone}
        onChange={handleFormChange}
        sx={refinedFieldSx}
      />

      {isPhoenixRole && (
        <FormControl fullWidth required sx={refinedFieldSx}>
          <InputLabel id="in-person-label">
            Can you be on-site in Phoenix/Tempe, including the full event weekend?
          </InputLabel>
          <Select
            labelId="in-person-label"
            label="Can you be on-site in Phoenix/Tempe, including the full event weekend?"
            value={formData.inPersonOk}
            onChange={(e) => setField("inPersonOk", e.target.value)}
            MenuProps={refinedSelectMenuProps}
          >
            <MenuItem value="Yes">Yes — I'm local and available</MenuItem>
            <MenuItem value="No">No — I'd be remote</MenuItem>
          </Select>
          <FormHelperText>
            This role runs the physical event, so it can&apos;t be done remotely.
          </FormHelperText>
        </FormControl>
      )}

      <Alert severity="info" sx={{ ...infoAlertSx, mb: 2 }}>
        <Typography variant="body1">
          This is an <strong>unpaid volunteer role</strong> with a 501(c)(3)
          nonprofit. We are unable to sponsor visas. What we can offer:
          real portfolio work, Hearts toward certificates, and LinkedIn
          recommendations &amp; references from work that actually shipped.
        </Typography>
      </Alert>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.visaAck}
            onChange={(e) => setField("visaAck", e.target.checked)}
            sx={refinedChoiceSx}
          />
        }
        label="I understand this is an unpaid volunteer role and that Opportunity Hack cannot sponsor visas."
      />
    </Box>
  );

  const renderCommitment = () => (
    <Box>
      <Eyebrow>Step 2 of 4</Eyebrow>
      <Typography component="h3" sx={stepTitleSx}>
        Commitment &amp; communication
      </Typography>
      <Typography variant="body1" sx={stepLeadSx}>
        Honest numbers beat optimistic ones — we plan around what you tell us
        here.
      </Typography>

      <FormControl fullWidth required sx={refinedFieldSx}>
        <InputLabel id="hours-label">
          Hours per week you can reliably give
        </InputLabel>
        <Select
          labelId="hours-label"
          label="Hours per week you can reliably give"
          value={formData.hoursPerWeek}
          onChange={(e) => setField("hoursPerWeek", e.target.value)}
          MenuProps={refinedSelectMenuProps}
        >
          {HOURS_OPTIONS.map((o) => (
            <MenuItem key={o.label} value={o.label}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          This role needs about {listing.hours_per_week_label} hours a week.
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth required sx={refinedFieldSx}>
        <InputLabel id="duration-label">How long can you stick around?</InputLabel>
        <Select
          labelId="duration-label"
          label="How long can you stick around?"
          value={formData.durationCommitment}
          onChange={(e) => setField("durationCommitment", e.target.value)}
          MenuProps={refinedSelectMenuProps}
        >
          {DURATION_OPTIONS.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{listing.duration_ask}</FormHelperText>
      </FormControl>

      <FormControl fullWidth required sx={refinedFieldSx}>
        <InputLabel id="channel-label">Preferred way to coordinate</InputLabel>
        <Select
          labelId="channel-label"
          label="Preferred way to coordinate"
          value={formData.preferredChannel}
          onChange={(e) => setField("preferredChannel", e.target.value)}
          MenuProps={refinedSelectMenuProps}
        >
          {CHANNEL_OPTIONS.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          We run on Slack day-to-day, with email for anything formal.
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={refinedFieldSx}>
        <InputLabel id="slack-label">Are you in our Slack yet?</InputLabel>
        <Select
          labelId="slack-label"
          label="Are you in our Slack yet?"
          value={formData.slackMember}
          onChange={(e) => setField("slackMember", e.target.value)}
          MenuProps={refinedSelectMenuProps}
        >
          {SLACK_OPTIONS.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        name="referralSource"
        label="How did you hear about this role?"
        value={formData.referralSource}
        onChange={handleFormChange}
        sx={refinedFieldSx}
      />
    </Box>
  );

  const renderWorkSample = () => {
    const chars = formData.workSampleAnswer.trim().length;
    return (
      <Box>
        <Eyebrow>Step 3 of 4</Eyebrow>
        <Typography component="h3" sx={stepTitleSx}>
          The work sample
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          This is the fun part — and the part we read most closely. There&apos;s
          no single right answer; we want to see how you think.
        </Typography>

        <Box sx={{ ...emphasisPanelSx, mb: 3 }}>
          <Box sx={{ ...eventMarkdownSx, mt: 0, color: "var(--ink)" }}>
            <ReactMarkdown>{listing.work_sample_prompt || ""}</ReactMarkdown>
          </Box>
        </Box>

        <TextField
          fullWidth
          required
          multiline
          minRows={8}
          name="workSampleAnswer"
          label="Your answer"
          helperText={
            chars < MIN_WORK_SAMPLE_CHARS
              ? `${chars}/${MIN_WORK_SAMPLE_CHARS} characters minimum — specifics beat polish`
              : "Specifics beat polish."
          }
          value={formData.workSampleAnswer}
          onChange={handleFormChange}
          sx={refinedFieldSx}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          name="whyOhack"
          label="Why Opportunity Hack? (optional, but we do read it)"
          value={formData.whyOhack}
          onChange={handleFormChange}
          sx={refinedFieldSx}
        />

        <ResumeUploadField
          required
          value={formData.resumeUrl}
          onChange={(url) => {
            setField("resumeUrl", url);
            if (url) trackStep("job_app_resume_uploaded", listing.slug);
          }}
          accessToken={accessToken}
          apiServerUrl={apiServerUrl}
        />
      </Box>
    );
  };

  const renderVideoAndReview = () => (
    <Box>
      <Eyebrow>Step 4 of 4</Eyebrow>
      <Typography component="h3" sx={stepTitleSx}>
        Your video &amp; review
      </Typography>
      <Typography variant="body1" sx={stepLeadSx}>
        A short video (under 2 minutes) answering the prompts below. Phone
        camera is perfect — we care about the person, not the production.
      </Typography>

      <Box sx={{ ...emphasisPanelSx, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 700, color: "var(--ink)", mb: 1 }}>
          Answer these on camera:
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 3, color: "var(--ink)" }}>
          {(listing.video_prompts || []).map((prompt) => (
            <Box component="li" key={prompt} sx={{ mb: 0.75, lineHeight: 1.6 }}>
              {prompt}
            </Box>
          ))}
        </Box>
      </Box>

      <IntroVideoField
        required
        label="Your video answer"
        helperText="Upload a video file or paste a YouTube, Vimeo, or Loom link (an unlisted link is fine)."
        value={formData.videoUrl}
        onChange={(url) => setField("videoUrl", url)}
        accessToken={accessToken}
        apiServerUrl={apiServerUrl}
        onVideoAdded={(method) => trackStep("job_app_video_added", method)}
      />

      <Box sx={{ ...emphasisPanelSx, mt: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 700, color: "var(--ink)", mb: 1 }}>
          Quick review
        </Typography>
        <Typography variant="body1" sx={{ color: "var(--muted)", lineHeight: 1.8 }}>
          {formData.name} · {formData.email}
          <br />
          {formData.hoursPerWeek} per week · {formData.durationCommitment}
          <br />
          Resume {formData.resumeUrl ? "✓" : "✗"} · Video {formData.videoUrl ? "✓" : "✗"}
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--muted)", mt: 1.5, ...formProseSx }}>
          After you submit, we&apos;ll email a confirmation — <strong>reply to
          it within 5 days</strong> to confirm your application is active.
          Consider it the first task of the role.
        </Typography>
      </Box>
    </Box>
  );

  const stepRenderers = [renderAboutYou, renderCommitment, renderWorkSample, renderVideoAndReview];

  // ----- top-level render states -----

  if (checkingApplied) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: "var(--brand)" }} />
      </Box>
    );
  }

  if (alreadyApplied) {
    return (
      <ThemeProvider theme={refinedFormTheme}>
        <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Eyebrow>Application on file</Eyebrow>
          <Typography component="h3" sx={{ ...stepTitleSx, mt: 1 }}>
            You&apos;ve already applied — nice.
          </Typography>
          <Alert severity="info" sx={{ ...infoAlertSx, mt: 2 }}>
            <Typography variant="body1">
              We have your application for this role
              {alreadyApplied.status ? ` (status: ${alreadyApplied.status})` : ""}.
              Check your inbox for the confirmation email — if you haven&apos;t
              replied to it yet, doing so confirms your application is active.
              We&apos;ll reach out from questions@ohack.org for next steps.
            </Typography>
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  if (success) {
    return (
      <ThemeProvider theme={refinedFormTheme}>
        <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 } }} ref={stepContentRef}>
          <Eyebrow>Application received</Eyebrow>
          <Typography component="h3" sx={{ ...stepTitleSx, mt: 1 }}>
            Submitted — one thing left.
          </Typography>
          <Alert severity="success" sx={{ ...successAlertSx, my: 2 }}>
            <Typography variant="body1">
              Your application is in. We just sent a confirmation email —{" "}
              <strong>reply to it within 5 days</strong> to confirm your
              application is active. We review by hand and typically reach out
              within a week to set up a call.
            </Typography>
          </Alert>
          <Typography variant="body1" sx={{ color: "var(--muted)", mb: 3, ...formProseSx }}>
            While you wait: join our{" "}
            <a href="/signup" className="ohx-link">Slack community</a> and say
            hi in #introductions — it&apos;s where the actual work happens.
          </Typography>
          <ShareRow
            heading="Know someone great for one of our other roles?"
            url="https://www.ohack.dev/jobs"
            title="Volunteer with Opportunity Hack"
            slug="jobs-index"
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={refinedFormTheme}>
      <Box ref={formRef}>
        <FormPersistenceControls
          onSave={saveToLocalStorage}
          onRestore={loadFromLocalStorage}
          onClear={clearSavedData}
          notification={notification}
          onCloseNotification={closeNotification}
          sx={{ mt: 0, mb: 2 }}
        />

        <Box className="ohx-card" sx={{ p: { xs: 2, sm: 2.5 }, mb: 3 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            sx={{ ...refinedStepperSx, ...(isMobile ? refinedStepperMobileSx : {}) }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          {/* noValidate: the required MUI Selects render hidden native inputs;
              without it the browser's constraint validation silently blocks
              submit (invalid control not focusable → no submit event at all).
              Our per-step JS validators own all validation. */}
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <Box
              ref={stepContentRef}
              tabIndex={-1}
              sx={{ scrollMarginTop: "96px", outline: "none" }}
            >
              {stepRenderers[activeStep]()}
            </Box>

            {error && (
              <Alert severity="error" sx={{ ...errorAlertSx, mt: 3 }}>
                <Typography variant="body1">{error}</Typography>
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || submitting}
                sx={ghostButtonSx}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={primaryButtonSx}
              >
                {submitting
                  ? "Submitting…"
                  : activeStep === STEPS.length - 1
                    ? "Submit application"
                    : "Next"}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
