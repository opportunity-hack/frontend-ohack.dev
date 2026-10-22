import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import ReCaptchaProvider from "../../components/ReCaptchaProvider";
import { useRecaptcha } from "../../hooks/use-recaptcha";
import { useEnv } from "../../context/env.context";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { RefinedPage, PageMasthead } from "../../components/design/RefinedPage";
import { Eyebrow } from "../../components/design/refined";
import {
  refinedFormTheme,
  refinedFieldSx,
  refinedChoiceSx,
  refinedSelectMenuProps,
} from "../../components/ApplicationForm/refinedStyles";

// Inquiry types with associated links and content. Keep in sync with
// `INQUIRY_TYPE_OPTIONS` in admin/broadcast/BroadcastSourcePicker.js and the
// backend's INQUIRY_TYPE_DISPLAY map (reply threading).
const INQUIRY_TYPES = [
  {
    value: "general",
    label: "General Question",
    description: "For general inquiries about Opportunity Hack",
  },
  {
    value: "claim_reward",
    label: "Claim Reward",
    description: "Request to claim rewards for hearts milestones achieved",
    icon: "🎁",
  },
  {
    value: "hackathon",
    label: "Hackathon Information",
    description: "Questions about upcoming or past hackathons",
    link: "/hack",
    linkText: "View Current Hackathons",
  },
  {
    value: "mentor",
    label: "Mentor Opportunities",
    description: "Information about becoming a mentor",
    link: "/hack",
    linkText: "Apply to Mentor",
    confirmUrl: "/about/mentors",
    confirmUrlText: "Mentor Guide",
  },
  {
    value: "judge",
    label: "Judge Opportunities",
    description: "Information about becoming a judge",
    link: "/hack",
    linkText: "Apply to Judge",
    confirmUrl: "/about/judges",
    confirmUrlText: "Judge Guide",
  },
  {
    value: "sponsor",
    label: "Sponsorship Opportunities",
    description: "Information about sponsoring Opportunity Hack",
    link: "/sponsor",
    linkText: "Sponsorship Details",
  },
  {
    value: "recruit",
    label: "Recruiting / Hiring Talent",
    description:
      "Hire engineers, PMs, TPMs & designers who ship real software. Sponsor for résumé access & on-site recruiting",
    link: "/sponsor",
    linkText: "See Sponsorship & Résumé Access",
  },
  {
    value: "nonprofit",
    label: "Nonprofit Information",
    description: "Information for nonprofits interested in participating",
    link: "/nonprofits/apply",
    linkText: "Apply as a Nonprofit",
  },
  {
    value: "technical",
    label: "Technical Support",
    description: "Help with website issues or technical problems",
  },
  {
    value: "other",
    label: "Other",
    description: "Any other inquiries not covered above",
  },
];

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
  inquiryType: "",
  message: "",
  receiveUpdates: false,
};

const fieldSx = { ...refinedFieldSx, mb: 0 };
const noteCardStyle = { padding: "14px 16px", background: "var(--surface-2)" };
const asideCardStyle = { padding: 20 };

/**
 * Contact form page. Logic (validation, reCAPTCHA, mentor/judge read-first
 * confirmation, ?type= prefill, GA events) is unchanged from the previous
 * version — only the presentation moved to the refined design.
 */
const ContactPage = () => {
  const router = useRouter();
  const { apiServerUrl } = useEnv();
  const {
    getRecaptchaToken,
    isLoading: recaptchaLoading,
    error: recaptchaError,
  } = useRecaptcha();
  const formRef = useRef(null);

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    pendingType: null,
  });
  const pendingConfirmType =
    INQUIRY_TYPES.find((t) => t.value === confirmDialog.pendingType) ?? null;

  // Get inquiry type from URL query if available
  useEffect(() => {
    if (
      router.query.type &&
      INQUIRY_TYPES.some((type) => type.value === router.query.type)
    ) {
      const inquiryType = router.query.type;
      const hearts = router.query.hearts;
      let message = "";
      if (inquiryType === "claim_reward" && hearts) {
        message = `Hello! I have earned ${hearts} hearts and would like to claim my milestone rewards. Please let me know what steps I need to take to receive my earned rewards.\n\nThank you!`;
      }
      setFormState((prev) => ({
        ...prev,
        inquiryType,
        ...(message && { message }),
      }));
    }
  }, [router.query]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === "checkbox" ? checked : value;

    // Intercept mentor/judge selection — show confirmation dialog first
    if (name === "inquiryType") {
      const selectedType = INQUIRY_TYPES.find((t) => t.value === value);
      if (selectedType?.confirmUrl) {
        setConfirmDialog({ open: true, pendingType: value });
        return;
      }
    }

    setFormState((prev) => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleConfirmRead = () => {
    setFormState((prev) => ({
      ...prev,
      inquiryType: String(confirmDialog.pendingType),
    }));
    setFormErrors((prev) => ({ ...prev, inquiryType: "" }));
    setConfirmDialog({ open: false, pendingType: null });
  };

  const handleCancelConfirm = () =>
    setConfirmDialog({ open: false, pendingType: null });

  const validateForm = () => {
    const errors = {};
    if (!formState.firstName.trim())
      errors.firstName = "First name is required";
    if (!formState.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!formState.inquiryType)
      errors.inquiryType = "Please select an inquiry type";
    if (!formState.message.trim()) {
      errors.message = "Message is required";
    } else if (formState.message.trim().length < 10) {
      errors.message = "Message is too short (minimum 10 characters)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const recaptchaToken = await getRecaptchaToken();
      if (!recaptchaToken && process.env.NODE_ENV !== "development") {
        setSubmitError("Failed to verify you are human. Please try again.");
        setIsSubmitting(false);
        return;
      }
      await axios.post(`${apiServerUrl}/api/contact`, {
        ...formState,
        recaptchaToken,
      });
      setSubmitSuccess(true);
      trackEvent({
        action: "contact_form_submit",
        params: { event_label: formState.inquiryType, page: "contact" },
      });
      setFormState(initialFormState);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      trackEvent({
        action: "contact_form_error",
        params: { event_label: error.message, page: "contact" },
      });
      setSubmitError("Failed to submit your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Same rules as the dropdown: mentor/judge go through the read-first
  // dialog instead of being set directly.
  const pickInquiry = (value) => {
    const type = INQUIRY_TYPES.find((t) => t.value === value);
    if (type?.confirmUrl) {
      setConfirmDialog({ open: true, pendingType: value });
    } else {
      setFormState((prev) => ({ ...prev, inquiryType: value }));
      setFormErrors((prev) => ({ ...prev, inquiryType: "" }));
    }
    // Below the md breakpoint the form sits above the aside; bring it back into view.
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const selectedInquiryType = INQUIRY_TYPES.find(
    (type) => type.value === formState.inquiryType,
  );

  return (
    <>
      <Head>
        <title>Contact Us - Opportunity Hack</title>
        <meta
          name="description"
          content="Contact Opportunity Hack for questions about hackathons, mentorship, sponsorship, or general inquiries. We're here to help!"
        />
        <link rel="canonical" href="https://www.ohack.dev/contact" />
      </Head>

      <ThemeProvider theme={refinedFormTheme}>
        <RefinedPage>
          <PageMasthead
            eyebrow="Contact"
            title="We'd love to"
            italic="hear from you."
            lead="Questions about hackathons, mentoring, judging, sponsorship or anything else — tell us what you need. We do our best to answer within 48 hours."
            style={{ marginTop: 0 }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 2fr) minmax(280px, 1fr)",
              },
              gap: 3,
              mt: 4.5,
              alignItems: "start",
            }}
          >
            {/* ---- Form ---- */}
            <div
              ref={formRef}
              className="ohx-card"
              style={{
                padding: "26px 28px",
                gridColumn: "span 1",
                scrollMarginTop: 88,
              }}
            >
              {submitSuccess ? (
                <div
                  style={{ padding: "24px 0", textAlign: "center" }}
                  role="status"
                >
                  <p className="ohx-eyebrow">Message sent</p>
                  <h2
                    className="ohx-display"
                    style={{ fontSize: 26, marginTop: 8 }}
                  >
                    Thank you for reaching out.
                  </h2>
                  <p
                    style={{
                      margin: "10px auto 0",
                      fontSize: 15.5,
                      color: "var(--muted)",
                      maxWidth: "46ch",
                    }}
                  >
                    We've received your message and will get back to you soon.
                  </p>
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--ghost"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                      setSubmitSuccess(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  style={{ display: "grid", gap: 18 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                      gap: 18,
                    }}
                  >
                    <TextField
                      label="First name"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      disabled={isSubmitting}
                      sx={fieldSx}
                    />
                    <TextField
                      label="Last name"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange}
                      fullWidth
                      disabled={isSubmitting}
                      sx={fieldSx}
                    />
                  </div>
                  <TextField
                    label="Email address"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Organization or company (optional)"
                    name="organization"
                    value={formState.organization}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Where are you from?"
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                  <TextField
                    select
                    label="What are you contacting us about?"
                    name="inquiryType"
                    value={formState.inquiryType}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!formErrors.inquiryType}
                    helperText={
                      formErrors.inquiryType ||
                      "Pick the option that best matches your inquiry"
                    }
                    disabled={isSubmitting}
                    sx={fieldSx}
                    SelectProps={{ MenuProps: refinedSelectMenuProps }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select an option</em>
                    </MenuItem>
                    {INQUIRY_TYPES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  {selectedInquiryType?.link && (
                    <div className="ohx-card" style={noteCardStyle}>
                      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }}>
                        Looking for information about{" "}
                        {selectedInquiryType.label.toLowerCase()}? We have a
                        page for that:{" "}
                        <Link
                          href={selectedInquiryType.link}
                          className="ohx-link"
                        >
                          {selectedInquiryType.linkText}{" "}
                          <span className="ohx-arrow" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </p>
                    </div>
                  )}

                  {selectedInquiryType?.value === "claim_reward" && (
                    <div className="ohx-card" style={noteCardStyle}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
                        Congratulations on reaching your heart milestones! 🎉
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 14.5,
                          color: "var(--muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        Tell us your current heart count and any specific
                        rewards you'd like to claim. We'll review your
                        achievements and guide you through the claiming process.
                      </p>
                      {router.query.hearts && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 14,
                            fontStyle: "italic",
                          }}
                        >
                          Current hearts: {router.query.hearts} ❤️
                        </p>
                      )}
                    </div>
                  )}

                  <TextField
                    label="Message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    fullWidth
                    required
                    error={!!formErrors.message}
                    helperText={
                      formErrors.message ||
                      "Please provide details about your inquiry"
                    }
                    disabled={isSubmitting}
                    placeholder="How can we help you?"
                    sx={fieldSx}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formState.receiveUpdates}
                        onChange={handleChange}
                        name="receiveUpdates"
                        disabled={isSubmitting}
                        sx={refinedChoiceSx}
                      />
                    }
                    label="I'd like to receive updates about upcoming Opportunity Hack events"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: 14.5 } }}
                  />

                  {(submitError || recaptchaError) && (
                    <p
                      role="alert"
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "var(--danger)",
                      }}
                    >
                      {submitError || recaptchaError}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {isSubmitting && <CircularProgress size={18} />}
                    <button
                      type="submit"
                      className="ohx-btn ohx-btn--primary"
                      disabled={isSubmitting || recaptchaLoading}
                      style={
                        isSubmitting || recaptchaLoading
                          ? { opacity: 0.6, cursor: "not-allowed" }
                          : undefined
                      }
                    >
                      {isSubmitting ? "Sending…" : "Send message"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ---- Aside ---- */}
            <aside
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="ohx-card" style={asideCardStyle}>
                <Eyebrow>Quick links</Eyebrow>
                <ul
                  style={{
                    listStyle: "none",
                    margin: "10px 0 0",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {[
                    ["/hack", "Current hackathons"],
                    ["/nonprofits", "For nonprofits"],
                    ["/sponsor", "Sponsorship opportunities"],
                    ["/about", "About Opportunity Hack"],
                    ["/blog", "Blog & news"],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="ohx-link"
                        style={{ fontSize: 15 }}
                      >
                        {label}{" "}
                        <span className="ohx-arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ohx-card" style={asideCardStyle}>
                <Eyebrow>Common inquiries</Eyebrow>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {INQUIRY_TYPES.slice(0, 6).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`ohx-tag${formState.inquiryType === type.value ? " ohx-tag--accent" : ""}`}
                      onClick={() => pickInquiry(type.value)}
                      style={{
                        cursor: "pointer",
                        fontSize: 12.5,
                        padding: "0.35em 0.9em",
                      }}
                      aria-pressed={formState.inquiryType === type.value}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="ohx-card"
                style={{ ...asideCardStyle, background: "var(--surface-2)" }}
              >
                <Eyebrow>Response time</Eyebrow>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                  }}
                >
                  We do our best to respond within 48 hours. For urgent matters,
                  say so in your message. Replies can take longer during
                  hackathon weekends.
                </p>
              </div>
            </aside>
          </Box>
        </RefinedPage>

        {/* Mentor / Judge read-confirmation dialog (Portal — plain MUI) */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelConfirm}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Before you apply as a {pendingConfirmType?.label}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please take a moment to read our{" "}
              <strong>{pendingConfirmType?.confirmUrlText}</strong> so you know
              what to expect. It covers the responsibilities, time commitment,
              and selection criteria.
            </DialogContentText>
            {pendingConfirmType?.confirmUrl && (
              <Button
                variant="outlined"
                component="a"
                href={pendingConfirmType.confirmUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the {pendingConfirmType.confirmUrlText} ↗
              </Button>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCancelConfirm} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRead}
              variant="contained"
              sx={{ bgcolor: "#1B3A6B", "&:hover": { bgcolor: "#0E2547" } }}
            >
              I&apos;ve read it — continue
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </>
  );
};

export default function ContactPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <ContactPage {...props} />
    </ReCaptchaProvider>
  );
}
