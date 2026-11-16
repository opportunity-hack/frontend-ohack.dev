import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ReCaptchaProvider from "../../components/ReCaptchaProvider";
import { useRecaptcha } from "../../hooks/use-recaptcha";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { RefinedPage, PageMasthead } from "../../components/design/RefinedPage";
import { Eyebrow } from "../../components/design/refined";
import {
  refinedFormTheme,
  refinedFieldSx,
  refinedChoiceSx,
  refinedSelectMenuProps,
} from "../../components/ApplicationForm/refinedStyles";
import ReceiptUploadField from "../../components/Reimbursement/ReceiptUploadField";
import reimbursementApi from "../../lib/reimbursementApi";
import {
  formatDollars,
  statusLabel,
  validateReimbursementForm,
} from "../../lib/reimbursementValidation";
import useHackathonEvents from "../../hooks/use-hackathon-events";

const initialFormState = {
  submitterName: "",
  submitterEmail: "",
  phone: "",
  expenseDate: "",
  vendor: "",
  amount: "",
  eventId: "",
  businessPurpose: "",
  fedDescription: "",
  paymentMethod: "",
  reimbursementMethod: "",
  attestation: false,
};

const fieldSx = { ...refinedFieldSx, mb: 0 };

const ReimbursementPage = () => {
  const {
    getRecaptchaToken,
    isLoading: recaptchaLoading,
    error: recaptchaError,
  } = useRecaptcha();
  const { hackathons = [] } = useHackathonEvents(false) || {};

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(null); // { referenceId }
  const [copied, setCopied] = useState(false);

  // Status lookup
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupReferenceId, setLookupReferenceId] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === "checkbox" ? checked : value;
    setFormState((prev) => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleReceiptChange = (next) => {
    setReceipt(next);
    if (formErrors.receipt) {
      setFormErrors((prev) => ({ ...prev, receipt: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateReimbursementForm(formState, receipt);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const recaptchaToken = await getRecaptchaToken();
      if (!recaptchaToken && process.env.NODE_ENV !== "development") {
        setSubmitError("Failed to verify you are human. Please try again.");
        setIsSubmitting(false);
        return;
      }
      const result = await reimbursementApi.submit({
        submitterName: formState.submitterName.trim(),
        submitterEmail: formState.submitterEmail.trim(),
        phone: formState.phone.trim() || undefined,
        expenseDate: formState.expenseDate,
        vendor: formState.vendor.trim(),
        amount: Number(formState.amount),
        eventId: formState.eventId || undefined,
        businessPurpose: formState.businessPurpose.trim(),
        fedDescription: formState.fedDescription.trim(),
        paymentMethod: formState.paymentMethod,
        reimbursementMethod: formState.reimbursementMethod,
        attestation: true,
        receiptBlobPath: receipt.blobPath,
        receiptFilename: receipt.filename,
        receiptContentType: receipt.contentType,
        recaptchaToken,
      });
      setSuccess({ referenceId: result.referenceId || result.reference_id });
      trackEvent({
        action: "reimbursement_submit",
        params: { page: "reimbursement" },
      });
      setFormState(initialFormState);
      setReceipt(null);
    } catch (error) {
      console.error("Error submitting reimbursement:", error);
      setSubmitError(
        error.message || "Failed to submit your request. Please try again.",
      );
      trackEvent({
        action: "reimbursement_submit_error",
        params: { event_label: error.message, page: "reimbursement" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    if (!lookupEmail.trim() || !lookupReferenceId.trim()) {
      setLookupError("Enter your email and reference ID.");
      return;
    }
    setLookupLoading(true);
    try {
      const result = await reimbursementApi.lookupStatus(
        lookupEmail.trim(),
        lookupReferenceId.trim(),
      );
      setLookupResult(result);
    } catch (error) {
      setLookupError(
        error.message ||
          "We could not find a reimbursement with those details. Check the reference ID and try again.",
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const copyReferenceId = async () => {
    if (!success?.referenceId) return;
    try {
      await navigator.clipboard.writeText(success.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const eventOptions = (hackathons || [])
    .map((ev) => ({
      id: ev.event_id || ev.id,
      label: ev.title || ev.event_id || ev.id,
    }))
    .filter((ev) => ev.id);

  return (
    <>
      <Head>
        <title>Request a Reimbursement - Opportunity Hack</title>
        <meta
          name="description"
          content="Bought food out of pocket for an Opportunity Hack event? Submit your itemized receipt and get paid back."
        />
        <link rel="canonical" href="https://www.ohack.dev/reimbursement" />
      </Head>

      <ThemeProvider theme={refinedFormTheme}>
        <RefinedPage>
          <PageMasthead
            eyebrow="Reimbursement"
            title="Get paid back"
            italic="for what you bought."
            lead="Bought food out of pocket for an Opportunity Hack event? Send us the itemized receipt and we will pay you back. Requests are reviewed by the treasurer."
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
            <div className="ohx-card" style={{ padding: "26px 28px" }}>
              {success ? (
                <div
                  style={{ padding: "24px 0", textAlign: "center" }}
                  role="status"
                >
                  <p className="ohx-eyebrow">Request received</p>
                  <h2
                    className="ohx-display"
                    style={{ fontSize: 26, marginTop: 8 }}
                  >
                    Thank you. We have your request.
                  </h2>
                  <p
                    style={{
                      margin: "10px auto 0",
                      fontSize: 15.5,
                      color: "var(--muted)",
                      maxWidth: "46ch",
                    }}
                  >
                    Save your reference ID. You will need it to check your
                    status.
                  </p>
                  {success.referenceId && (
                    <p
                      style={{
                        margin: "18px auto 0",
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {success.referenceId}{" "}
                      <button
                        type="button"
                        className="ohx-btn ohx-btn--ghost"
                        onClick={copyReferenceId}
                        style={{ padding: "6px 10px", fontSize: 13 }}
                        aria-label="Copy reference ID"
                      >
                        {copied ? (
                          <>
                            <CheckIcon fontSize="small" /> Copied
                          </>
                        ) : (
                          <>
                            <ContentCopyIcon fontSize="small" /> Copy
                          </>
                        )}
                      </button>
                    </p>
                  )}
                  <div
                    style={{
                      margin: "22px auto 0",
                      maxWidth: "52ch",
                      textAlign: "left",
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: "var(--muted)",
                    }}
                  >
                    <p style={{ margin: 0 }}>What happens next:</p>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                      <li>
                        The treasurer reviews your receipt and business purpose.
                      </li>
                      <li>
                        If anything is missing, we will email you for more
                        detail.
                      </li>
                      <li>
                        Once approved, the treasurer will contact you separately
                        to collect your ACH details. Never send bank details
                        through this form.
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--ghost"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                      setSuccess(null);
                      window.scrollTo(0, 0);
                    }}
                  >
                    Submit another request
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
                      label="Your name"
                      name="submitterName"
                      value={formState.submitterName}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.submitterName}
                      helperText={formErrors.submitterName}
                      disabled={isSubmitting}
                      sx={fieldSx}
                    />
                    <TextField
                      label="Email address"
                      name="email"
                      type="email"
                      value={formState.submitterEmail}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.submitterEmail}
                      helperText={formErrors.submitterEmail}
                      disabled={isSubmitting}
                      sx={fieldSx}
                    />
                  </div>
                  <TextField
                    label="Phone (optional)"
                    name="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.phone}
                    helperText={
                      formErrors.phone ||
                      "Only if we need to reach you fast about this request"
                    }
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                      gap: 18,
                    }}
                  >
                    <TextField
                      label="Date of purchase"
                      name="expenseDate"
                      type="date"
                      value={formState.expenseDate}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.expenseDate}
                      helperText={
                        formErrors.expenseDate ||
                        "Within the last 120 days, not in the future"
                      }
                      disabled={isSubmitting}
                      sx={fieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Amount ($)"
                      name="amount"
                      type="number"
                      inputProps={{ min: 0, step: "0.01" }}
                      value={formState.amount}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.amount}
                      helperText={
                        formErrors.amount || "More than $0, up to $10,000"
                      }
                      disabled={isSubmitting}
                      sx={fieldSx}
                    />
                  </div>
                  <TextField
                    label="Vendor"
                    name="vendor"
                    value={formState.vendor}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!formErrors.vendor}
                    helperText={
                      formErrors.vendor ||
                      "The store or restaurant on the receipt"
                    }
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                  <TextField
                    select
                    label="Hackathon event (optional)"
                    name="eventId"
                    value={formState.eventId}
                    onChange={handleChange}
                    fullWidth
                    disabled={isSubmitting}
                    sx={fieldSx}
                    SelectProps={{ MenuProps: refinedSelectMenuProps }}
                  >
                    <MenuItem value="">
                      <em>Not tied to a specific event</em>
                    </MenuItem>
                    {eventOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Business purpose"
                    name="businessPurpose"
                    value={formState.businessPurpose}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    required
                    error={!!formErrors.businessPurpose}
                    helperText={
                      formErrors.businessPurpose ||
                      "Why was this purchase needed for Opportunity Hack?"
                    }
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Who did this food feed?"
                    name="fedDescription"
                    value={formState.fedDescription}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    fullWidth
                    required
                    error={!!formErrors.fedDescription}
                    helperText={
                      formErrors.fedDescription ||
                      "Example: dinner for 12 volunteers at the Fall Hackathon"
                    }
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                      gap: 18,
                    }}
                  >
                    <TextField
                      select
                      label="How did you pay?"
                      name="paymentMethod"
                      value={formState.paymentMethod}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.paymentMethod}
                      helperText={formErrors.paymentMethod}
                      disabled={isSubmitting}
                      sx={fieldSx}
                      SelectProps={{ MenuProps: refinedSelectMenuProps }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select an option</em>
                      </MenuItem>
                      <MenuItem value="personal_card">Personal card</MenuItem>
                      <MenuItem value="personal_cash">Personal cash</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="How should we pay you back?"
                      name="reimbursementMethod"
                      value={formState.reimbursementMethod}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.reimbursementMethod}
                      helperText={formErrors.reimbursementMethod}
                      disabled={isSubmitting}
                      sx={fieldSx}
                      SelectProps={{ MenuProps: refinedSelectMenuProps }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select an option</em>
                      </MenuItem>
                      <MenuItem value="ach">Direct deposit (ACH)</MenuItem>
                      <MenuItem value="check">Check</MenuItem>
                    </TextField>
                  </div>

                  <ReceiptUploadField
                    value={receipt}
                    onChange={handleReceiptChange}
                    getRecaptchaToken={getRecaptchaToken}
                    error={formErrors.receipt}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formState.attestation}
                        onChange={handleChange}
                        name="attestation"
                        disabled={isSubmitting}
                        sx={refinedChoiceSx}
                      />
                    }
                    label="I confirm this purchase was for Opportunity Hack business, the amount is reasonable, and I have not already been reimbursed for it."
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: 14.5 } }}
                  />
                  {formErrors.attestation && (
                    <p
                      role="alert"
                      style={{
                        margin: "-8px 0 0",
                        fontSize: 14,
                        color: "var(--danger)",
                      }}
                    >
                      {formErrors.attestation}
                    </p>
                  )}

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
                      {isSubmitting ? "Submitting…" : "Submit request"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ---- Aside: status lookup + rules ---- */}
            <aside
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="ohx-card" style={{ padding: 20 }}>
                <Eyebrow>Check your status</Eyebrow>
                <form
                  onSubmit={handleLookup}
                  noValidate
                  style={{ display: "grid", gap: 12, marginTop: 12 }}
                >
                  <TextField
                    label="Email address"
                    type="email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    fullWidth
                    disabled={lookupLoading}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Reference ID"
                    value={lookupReferenceId}
                    onChange={(e) => setLookupReferenceId(e.target.value)}
                    fullWidth
                    disabled={lookupLoading}
                    sx={fieldSx}
                  />
                  <button
                    type="submit"
                    className="ohx-btn ohx-btn--ghost"
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? "Looking up…" : "Look up status"}
                  </button>
                </form>
                {lookupError && (
                  <p
                    role="alert"
                    style={{
                      margin: "12px 0 0",
                      fontSize: 14,
                      color: "var(--danger)",
                    }}
                  >
                    {lookupError}
                  </p>
                )}
                {lookupResult && (
                  <div
                    role="status"
                    style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.6 }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Status:</strong>{" "}
                      {statusLabel(lookupResult.status || lookupResult.status)}
                    </p>
                    {lookupResult.amountCents !== undefined && (
                      <p style={{ margin: "4px 0 0" }}>
                        <strong>Amount:</strong>{" "}
                        {formatDollars(lookupResult.amountCents)}
                      </p>
                    )}
                    {lookupResult.expenseDate && (
                      <p style={{ margin: "4px 0 0" }}>
                        <strong>Purchase date:</strong>{" "}
                        {lookupResult.expenseDate}
                      </p>
                    )}
                    {lookupResult.updatedAt && (
                      <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                        Last updated{" "}
                        {new Date(lookupResult.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div
                className="ohx-card"
                style={{ padding: 20, background: "var(--surface-2)" }}
              >
                <Eyebrow>What we need</Eyebrow>
                <ul
                  style={{
                    margin: "10px 0 0",
                    paddingLeft: 18,
                    fontSize: 14.5,
                    lineHeight: 1.6,
                  }}
                >
                  <li>An itemized receipt showing every line item.</li>
                  <li>
                    The purchase must be within the last 120 days and tied to
                    Opportunity Hack business.
                  </li>
                  <li>
                    Submit within 60 days of the purchase when you can, so the
                    records stay clean.
                  </li>
                  <li>
                    Do not send bank account or routing numbers here. The
                    treasurer collects ACH details separately after approval.
                  </li>
                </ul>
              </div>
            </aside>
          </Box>
        </RefinedPage>
      </ThemeProvider>
    </>
  );
};

export default function ReimbursementPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <ReimbursementPage {...props} />
    </ReCaptchaProvider>
  );
}
