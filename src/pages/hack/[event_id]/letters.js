import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import {
  Typography,
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SendIcon from "@mui/icons-material/Send";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { format, parseISO } from "date-fns";
import { useEnv } from "../../../context/env.context";
import { useRecaptcha } from "../../../hooks/use-recaptcha";
import ReCaptchaProvider from "../../../components/ReCaptchaProvider";
import { ProfileAutofillNotice } from "../../../components/ApplicationForm";
import LetterChecklist from "../../../components/Letters/LetterChecklist";
import LetterPreview from "../../../components/Letters/LetterPreview";
import {
  runChecklist,
  EVENT_FIELDS,
  RECIPIENT_FIELDS,
  ROLE_FIELDS,
  SIGNER_FIELDS,
  LETTER_LABELS,
  encodeLetterState,
  decodeLetterState,
} from "../../../components/Letters/letterConfig";

function formatEventDates(start, end) {
  try {
    const s = start ? format(parseISO(start), "MMMM d, yyyy") : "";
    const e = end ? format(parseISO(end), "MMMM d, yyyy") : "";
    if (s && e && s !== e) return `${s} – ${e}`;
    return s || e || "";
  } catch {
    return "";
  }
}

const todayStr = () => format(new Date(), "yyyy-MM-dd");

function FieldInput({ def, value, onChange }) {
  return (
    <TextField
      fullWidth
      label={def.label}
      type={def.type === "date" ? "date" : "text"}
      value={value || ""}
      onChange={(e) => onChange(def.key, e.target.value)}
      multiline={Boolean(def.multiline)}
      minRows={def.multiline ? 2 : undefined}
      InputLabelProps={def.type === "date" ? { shrink: true } : undefined}
      sx={{ mb: 2 }}
    />
  );
}

function LettersComponent() {
  const router = useRouter();
  const { event_id } = router.query;
  const { user } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { getRecaptchaToken, error: recaptchaError } = useRecaptcha();

  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [answers, setAnswers] = useState({
    role: "",
    needsImmigration: "",
    optType: "",
    ack: {},
  });
  const [fields, setFields] = useState({ letterDate: todayStr() });
  const [signer, setSigner] = useState({});
  const [autofilled, setAutofilled] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const shareInputRef = useRef(null);

  const hydratedRef = useRef(false);
  const urlTimerRef = useRef(null);

  const result = useMemo(() => runChecklist(answers), [answers]);
  const letterType = result.letterType;

  const setField = (key, value) => setFields((p) => ({ ...p, [key]: value }));
  const setSignerField = (key, value) => setSigner((p) => ({ ...p, [key]: value }));

  // Hydrate from ?d= (shareable link) once on mount.
  useEffect(() => {
    if (hydratedRef.current || !router.isReady) return;
    hydratedRef.current = true;
    const d = router.query.d;
    if (d) {
      const decoded = decodeLetterState(Array.isArray(d) ? d[0] : d);
      if (decoded) {
        if (decoded.answers) setAnswers(decoded.answers);
        if (decoded.fields) setFields(decoded.fields);
        if (decoded.signer) setSigner(decoded.signer);
        setAutofilled(false);
      }
    }
  }, [router.isReady, router.query.d]);

  // Fetch event metadata and prefill editable event fields + recipient from profile.
  useEffect(() => {
    if (!event_id || !apiServerUrl) return;
    let cancelled = false;
    (async () => {
      setLoadingEvent(true);
      try {
        const res = await fetch(`${apiServerUrl}/api/messages/hackathon/${event_id}`);
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        setEventData(data);
        // Only prefill when not arriving via a shareable link (which already carries values).
        if (!router.query.d) {
          setFields((prev) => ({
            ...prev,
            eventName: prev.eventName || data?.title || "",
            eventDates:
              prev.eventDates || formatEventDates(data?.start_date, data?.end_date),
            eventLocation: prev.eventLocation || data?.location || "",
            eventHost: prev.eventHost || data?.host || "",
            eventTheme: prev.eventTheme || data?.theme || "",
            recipientName:
              prev.recipientName ||
              (user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || ""),
            recipientEmail: prev.recipientEmail || user?.email || "",
            letterDate: prev.letterDate || todayStr(),
          }));
          if (user?.email || user?.firstName) setAutofilled(true);
        }
      } catch {
        if (!cancelled) setEventData(null);
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_id, apiServerUrl, user]);

  // Mirror current state into ?d= (debounced, shallow) so the link is shareable.
  useEffect(() => {
    if (!router.isReady || !hydratedRef.current) return;
    if (urlTimerRef.current) clearTimeout(urlTimerRef.current);
    urlTimerRef.current = setTimeout(() => {
      const d = encodeLetterState({ answers, fields, signer });
      router.replace(
        { pathname: router.pathname, query: { ...router.query, d } },
        undefined,
        { shallow: true, scroll: false }
      );
    }, 400);
    return () => urlTimerRef.current && clearTimeout(urlTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, fields, signer]);

  // Keep the visible shareable link in sync with the encoded state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const d = encodeLetterState({ answers, fields, signer });
    setShareUrl(`${window.location.origin}${window.location.pathname}?d=${d}`);
  }, [answers, fields, signer]);

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (shareInputRef.current) {
        shareInputRef.current.select();
        document.execCommand("copy");
      }
      setCopied(true);
    } catch {
      // Fallback: select the field so the user can copy manually.
      shareInputRef.current?.select();
    }
  };

  const handlePrint = () => window.print();

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    const d = encodeLetterState({ answers, fields, signer });
    return `${window.location.origin}${window.location.pathname}?d=${d}`;
  };

  const buildMessage = () => {
    const roleFields = ROLE_FIELDS[letterType] || [];
    const lines = [
      `Volunteer letter request: ${LETTER_LABELS[letterType] || letterType}`,
      `Event: ${fields.eventName || event_id} (${fields.eventDates || "dates n/a"})`,
      `Location: ${fields.eventLocation || "n/a"}`,
      `Recipient: ${fields.recipientName || "n/a"} <${fields.recipientEmail || "n/a"}>`,
      `Address: ${(fields.recipientAddress || "n/a").replace(/\n/g, ", ")}`,
      `Letter date: ${fields.letterDate || "n/a"}`,
    ];
    roleFields.forEach((rf) => {
      lines.push(`${rf.label}: ${fields[rf.key] || "(blank)"}`);
    });
    lines.push("");
    lines.push("Reviewer: open this link to fill the signer block, then print/save as PDF:");
    lines.push(buildShareUrl());
    return lines.join("\n");
  };

  const recipientReady =
    Boolean(letterType) &&
    Boolean(fields.recipientName && fields.recipientName.trim()) &&
    Boolean(fields.recipientEmail && fields.recipientEmail.trim());

  const handleSubmit = async () => {
    setSubmitError("");
    if (!recipientReady) {
      setSubmitError("Please provide your name and email before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken("volunteer_letter");
      if (!recaptchaToken && process.env.NODE_ENV !== "development") {
        setSubmitError("Failed to verify you are human. Please try again.");
        setSubmitting(false);
        return;
      }
      const nameParts = (fields.recipientName || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "Volunteer";
      const lastName = nameParts.slice(1).join(" ") || "Volunteer";
      await axios.post(`${apiServerUrl}/api/contact`, {
        firstName,
        lastName,
        email: fields.recipientEmail,
        organization: fields.eventName || `Hackathon ${event_id}`,
        inquiryType: "volunteer_letter",
        message: buildMessage(),
        receiveUpdates: false,
        recaptchaToken,
      });
      setSuccess(true);
    } catch (e) {
      setSubmitError(
        "Failed to submit your request. Please try again or email volunteer@ohack.org."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const roleFields = ROLE_FIELDS[letterType] || [];

  return (
    <>
      <Head>
        <title>Volunteer Letter Generator | Opportunity Hack</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Print only the letter; hide nav/footer/form. */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #letter-print-root,
          #letter-print-root * {
            visibility: visible !important;
          }
          #letter-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        @page {
          size: Letter;
          margin: 1in;
        }
      `}</style>

      <Container maxWidth="xl" sx={{ pt: { xs: 10, md: 12 }, pb: 4 }}>
        <Box className="no-print">
          <Typography variant="h1" component="h1" sx={{ fontSize: "2.25rem", mb: 1 }}>
            Volunteer Letter Generator
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
            Answer a few questions and we'll generate the right confirmation letter for your
            volunteer work. Submit it to Opportunity Hack to review and sign, or print a draft
            for your records.
          </Typography>
        </Box>

        {success ? (
          <Alert severity="success" className="no-print" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Request submitted!
            </Typography>
            <Typography variant="body2">
              Opportunity Hack will review your letter, sign it, and follow up by email. You can
              still print a draft below for your own records.
            </Typography>
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* LEFT: form (hidden on print) */}
          <Box className="no-print" sx={{ flex: 1, width: "100%", minWidth: 0 }}>
            <LetterChecklist answers={answers} setAnswers={setAnswers} result={result} />

            {letterType && (
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                  Your details
                </Typography>
                <ProfileAutofillNotice show={autofilled} />

                {RECIPIENT_FIELDS.map((def) => (
                  <FieldInput key={def.key} def={def} value={fields[def.key]} onChange={setField} />
                ))}
                <TextField
                  fullWidth
                  label="Your email"
                  type="email"
                  value={fields.recipientEmail || ""}
                  onChange={(e) => setField("recipientEmail", e.target.value)}
                  helperText="Where we'll send the signed letter."
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Event details (pre-filled — edit if needed)
                </Typography>
                {EVENT_FIELDS.map((def) => (
                  <FieldInput key={def.key} def={def} value={fields[def.key]} onChange={setField} />
                ))}

                {roleFields.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {LETTER_LABELS[letterType]} details
                    </Typography>
                    {roleFields.map((def) => (
                      <FieldInput
                        key={def.key}
                        def={def}
                        value={fields[def.key] ?? def.default}
                        onChange={setField}
                      />
                    ))}
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Signer (Opportunity Hack use only)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Leave blank — OHack fills this in before signing.
                </Typography>
                {SIGNER_FIELDS.map((def) => (
                  <FieldInput
                    key={def.key}
                    def={def}
                    value={signer[def.key]}
                    onChange={setSignerField}
                  />
                ))}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                  <LinkIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Shareable link
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Everything you've entered is saved right inside this link — no draft to lose.
                  Copy it to finish later on any device, or share it with Opportunity Hack.
                </Typography>
                <TextField
                  fullWidth
                  inputRef={shareInputRef}
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: "monospace", fontSize: "0.8rem" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={copied ? "Copied!" : "Copy link"}>
                          <IconButton
                            onClick={handleCopyLink}
                            edge="end"
                            color={copied ? "success" : "default"}
                            aria-label="Copy shareable link"
                          >
                            {copied ? <CheckIcon /> : <ContentCopyIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {(submitError || recaptchaError) && (
                  <Alert severity="error" sx={{ my: 2 }}>
                    {submitError || recaptchaError}
                  </Alert>
                )}

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={18} /> : <SendIcon />}
                    onClick={handleSubmit}
                    disabled={submitting || !recipientReady}
                  >
                    {submitting ? "Submitting…" : "Submit to OHack"}
                  </Button>
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                    Print / Save as PDF
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>

          {/* RIGHT: live preview (the print surface) */}
          <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
            {loadingEvent && !letterType ? (
              <Box sx={{ textAlign: "center", py: 6 }} className="no-print">
                <CircularProgress />
              </Box>
            ) : (
              <LetterPreview letterType={letterType} fields={fields} signer={signer} />
            )}
          </Box>
        </Box>
      </Container>
      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Link copied — it saves everything you've entered"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}

export default function VolunteerLettersPage() {
  const router = useRouter();
  const { event_id } = router.query;
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/letters`
      : null;

  return (
    <ReCaptchaProvider>
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={
              currentUrl || (typeof window !== "undefined" ? window.location.href : "")
            }
          />
        }
      >
        <LettersComponent />
      </RequiredAuthProvider>
    </ReCaptchaProvider>
  );
}
