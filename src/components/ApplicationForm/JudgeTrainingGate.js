import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import { Eyebrow } from "../design/refined";
import { trackEvent } from "../../lib/ga";
import {
  emphasisPanelSx,
  ghostButtonSx,
  infoAlertSx,
  primaryButtonSx,
  refinedFieldSx,
  stepLeadSx,
  stepTitleSx,
  successAlertSx,
  warningAlertSx,
} from "./refinedStyles";

// The judge-training bundle on the OHack LMS (two videos, each with a
// knowledge check that issues a shareable certificate on a passing score).
export const JUDGE_TRAINING_BUNDLE_URL =
  "https://lms.ohack.dev/bundles/kn7ect1nhxqkcn2tp32tbypzdx8ckjx6";

// Anonymous certificate verification — the LMS's Convex deployment exposes
// certificates:getCertificateByShareToken publicly (same query its own
// /certificate/:token page and unfurl bot use). CORS is open, so we can
// verify pasted links straight from the browser.
const LMS_CONVEX_QUERY_URL = `${
  process.env.NEXT_PUBLIC_LMS_CONVEX_URL ||
  "https://majestic-trout-419.convex.cloud"
}/api/query`;

// Accepts a full LMS certificate URL or a bare 64-hex share token.
const CERT_TOKEN_RE = /^[0-9a-f]{64}$/i;
const CERT_URL_RE = /lms\.ohack\.dev\/certificate\/([0-9a-f]{64})/i;

export const extractCertToken = (input) => {
  const value = (input || "").trim();
  if (!value) return null;
  if (CERT_TOKEN_RE.test(value)) return value.toLowerCase();
  const match = CERT_URL_RE.exec(value);
  return match ? match[1].toLowerCase() : null;
};

// The two required certificates. `match` runs against the certificate's
// quizTitle + targetTitle (snapshotted at issuance), so it keeps working if
// the LMS titles get lightly reworded — keep these in sync with the bundle's
// video/quiz names ("Judge Intro" / "Using the judging tool").
export const JUDGE_TRAINING_CERTS = [
  {
    field: "judgeTrainingIntroCertUrl",
    key: "intro",
    videoTitle: "Judge Intro",
    match: /judge\s*intro/i,
  },
  {
    field: "judgeTrainingToolCertUrl",
    key: "tool",
    videoTitle: "Using the judging tool",
    match: /judging\s*tool/i,
  },
];

const verifyCertToken = async (token) => {
  const response = await fetch(LMS_CONVEX_QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "certificates:getCertificateByShareToken",
      args: { shareToken: token },
      format: "json",
    }),
  });
  if (!response.ok) {
    throw new Error(`Certificate lookup failed: ${response.status}`);
  }
  const body = await response.json();
  if (body?.status !== "success") {
    throw new Error("Certificate lookup failed");
  }
  // null value = token doesn't resolve to a certificate
  return body.value || null;
};

const slotStatusMessage = (slot, spec) => {
  switch (slot.status) {
    case "invalid":
      return "That doesn't look like an LMS certificate link — it should look like https://lms.ohack.dev/certificate/…";
    case "notfound":
      return "We couldn't find a certificate at that link. Open your certificate on the LMS and copy its exact URL.";
    case "duplicate":
      return "This is the same certificate as the other field — each video issues its own certificate.";
    case "mismatch":
      return slot.cert
        ? `This certificate is for “${slot.cert.targetTitle || slot.cert.quizTitle}” — paste the certificate from the “${spec.videoTitle}” video here.`
        : `This certificate isn't for the “${spec.videoTitle}” video.`;
    case "error":
      return "We couldn't reach the LMS to verify this certificate. Check your connection and try again.";
    default:
      return "";
  }
};

/**
 * Hard gate for the judge application: links applicants to the LMS judge
 * training bundle and verifies both quiz certificates live before the
 * application form is allowed to render. Certificate URLs live in the
 * parent's formData (so they persist and submit with the application);
 * verification state lives here.
 *
 * Judge-form only — rendered inside RefinedRoot, so .ohx-* classes and CSS
 * vars are safe to use directly.
 */
const JudgeTrainingGate = ({
  values,
  onValueChange,
  onVerifiedChange,
  eventId,
}) => {
  // slot state per field: { status, cert }
  // status: empty | invalid | checking | verified | mismatch | duplicate | notfound | error
  const [slots, setSlots] = useState(() =>
    Object.fromEntries(
      JUDGE_TRAINING_CERTS.map((spec) => [
        spec.field,
        { status: "empty", cert: null },
      ]),
    ),
  );
  const [showInputs, setShowInputs] = useState(true);
  const tokenCacheRef = useRef(new Map()); // token -> cert | null
  const evaluateRunRef = useRef(0);
  const verifiedRef = useRef(false);
  const trackedVerifiedRef = useRef(new Set());

  const introValue = values[JUDGE_TRAINING_CERTS[0].field] || "";
  const toolValue = values[JUDGE_TRAINING_CERTS[1].field] || "";

  const evaluate = useCallback(async () => {
    const runId = ++evaluateRunRef.current;
    const rawValues = [introValue, toolValue];
    const tokens = rawValues.map(extractCertToken);

    const nextSlots = {};
    const toFetch = [];

    JUDGE_TRAINING_CERTS.forEach((spec, i) => {
      const raw = (rawValues[i] || "").trim();
      const token = tokens[i];
      if (!raw) {
        nextSlots[spec.field] = { status: "empty", cert: null };
      } else if (!token) {
        nextSlots[spec.field] = { status: "invalid", cert: null };
      } else if (i > 0 && tokens.slice(0, i).includes(token)) {
        nextSlots[spec.field] = { status: "duplicate", cert: null };
      } else if (tokenCacheRef.current.has(token)) {
        const cert = tokenCacheRef.current.get(token);
        nextSlots[spec.field] = resolveCertSlot(spec, cert);
      } else {
        nextSlots[spec.field] = { status: "checking", cert: null };
        toFetch.push({ spec, token });
      }
    });

    setSlots(nextSlots);
    if (toFetch.length === 0) return;

    const results = await Promise.all(
      toFetch.map(async ({ spec, token }) => {
        try {
          const cert = await verifyCertToken(token);
          tokenCacheRef.current.set(token, cert);
          return { spec, slot: resolveCertSlot(spec, cert) };
        } catch (err) {
          console.error("LMS certificate verification failed:", err);
          return { spec, slot: { status: "error", cert: null } };
        }
      }),
    );

    if (evaluateRunRef.current !== runId) return; // stale — inputs changed
    setSlots((prev) => {
      const merged = { ...prev };
      results.forEach(({ spec, slot }) => {
        merged[spec.field] = slot;
      });
      return merged;
    });
  }, [introValue, toolValue]);

  // Debounced re-verification whenever either link changes (covers typing,
  // paste, localStorage restore, and previous-submission hydration).
  useEffect(() => {
    const handle = setTimeout(() => {
      evaluate();
    }, 600);
    return () => clearTimeout(handle);
  }, [evaluate]);

  const allVerified = useMemo(
    () =>
      JUDGE_TRAINING_CERTS.every(
        (spec) => slots[spec.field]?.status === "verified",
      ),
    [slots],
  );

  useEffect(() => {
    if (verifiedRef.current === allVerified) return;
    verifiedRef.current = allVerified;
    onVerifiedChange(allVerified);
    if (allVerified) {
      setShowInputs(false);
      trackEvent({
        action: "judge_app_training_unlocked",
        params: { event_id: eventId, page: "judge_application" },
      });
    } else {
      setShowInputs(true);
    }
  }, [allVerified, onVerifiedChange, eventId]);

  // One GA ping per certificate the first time it verifies
  useEffect(() => {
    JUDGE_TRAINING_CERTS.forEach((spec) => {
      if (
        slots[spec.field]?.status === "verified" &&
        !trackedVerifiedRef.current.has(spec.key)
      ) {
        trackedVerifiedRef.current.add(spec.key);
        trackEvent({
          action: "judge_app_training_cert_verified",
          params: {
            event_label: spec.key,
            event_id: eventId,
            page: "judge_application",
          },
        });
      }
    });
  }, [slots, eventId]);

  const anyChecking = JUDGE_TRAINING_CERTS.some(
    (spec) => slots[spec.field]?.status === "checking",
  );

  const renderCertField = (spec) => {
    const slot = slots[spec.field] || { status: "empty", cert: null };
    const message = slotStatusMessage(slot, spec);
    const hasError = Boolean(message);
    return (
      <Box key={spec.field} sx={{ mb: 1 }}>
        <TextField
          label={`Certificate link — ${spec.videoTitle}`}
          name={spec.field}
          fullWidth
          value={values[spec.field] || ""}
          onChange={(e) => onValueChange(spec.field, e.target.value)}
          placeholder="https://lms.ohack.dev/certificate/…"
          error={hasError}
          helperText={
            message ||
            (slot.status === "checking"
              ? "Verifying with the LMS…"
              : `Paste the certificate link you received for passing the “${spec.videoTitle}” knowledge check`)
          }
          sx={refinedFieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {slot.status === "checking" ? (
                  <CircularProgress size={18} sx={{ color: "var(--brand)" }} />
                ) : slot.status === "verified" ? (
                  <CheckCircleRounded sx={{ color: "#1b7f3b" }} />
                ) : null}
              </InputAdornment>
            ),
          }}
        />
        {slot.status === "verified" && slot.cert && (
          <Typography
            variant="body2"
            sx={{ mt: -2, mb: 2, color: "#1b7f3b", fontWeight: 600 }}
          >
            ✓ Verified — {slot.cert.recipientName}, “{slot.cert.quizTitle}”,
            score {Math.round(slot.cert.score)}%
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 }, mb: 3 }}>
      {allVerified && !showInputs ? (
        <>
          <Alert
            severity="success"
            icon={<CheckCircleRounded />}
            sx={{ ...successAlertSx, mb: 2 }}
          >
            <Typography variant="body1">
              <strong>Judge training verified.</strong>{" "}
              {JUDGE_TRAINING_CERTS.map((spec) => `“${spec.videoTitle}”`).join(
                " and ",
              )}{" "}
              are both complete — your certificates will be included with your
              application.
            </Typography>
          </Alert>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowInputs(true)}
            sx={{ ...ghostButtonSx, border: "none" }}
          >
            View or change certificate links
          </Button>
        </>
      ) : (
        <>
          <Eyebrow>Before you apply</Eyebrow>
          <Typography component="h2" sx={{ ...stepTitleSx, mt: 1 }}>
            Complete judge training first
          </Typography>
          <Typography variant="body1" sx={stepLeadSx}>
            Every judge completes two short training videos before applying —{" "}
            <strong>Judge Intro</strong> and{" "}
            <strong>Using the judging tool</strong>. Watch both, pass each
            knowledge check, and paste your two certificate links below to
            unlock the application.
          </Typography>

          <Box sx={{ ...emphasisPanelSx, mb: 3 }}>
            <Box component="ol" sx={{ m: 0, pl: 3, color: "var(--ink)" }}>
              <Typography component="li" variant="body1" sx={{ mb: 0.75 }}>
                Open the judge training on our learning site (a free account —
                any email works).
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 0.75 }}>
                Watch both videos and pass each short knowledge check.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 0.75 }}>
                Each pass earns a certificate — open it and copy its link
                (lms.ohack.dev/certificate/…).
              </Typography>
              <Typography component="li" variant="body1">
                Paste both links below. We verify them instantly.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              href={JUDGE_TRAINING_BUNDLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<SchoolRounded />}
              endIcon={<OpenInNewRounded />}
              sx={primaryButtonSx}
              onClick={() =>
                trackEvent({
                  action: "judge_app_training_link_click",
                  params: { event_id: eventId, page: "judge_application" },
                })
              }
            >
              Open judge training
            </Button>
          </Box>

          {renderCertField(JUDGE_TRAINING_CERTS[0])}
          {renderCertField(JUDGE_TRAINING_CERTS[1])}

          {anyChecking && (
            <Alert severity="info" sx={{ ...infoAlertSx, mb: 2 }}>
              <Typography variant="body2">
                Verifying your certificates with the LMS…
              </Typography>
            </Alert>
          )}

          {allVerified ? (
            <Alert
              severity="success"
              icon={<CheckCircleRounded />}
              sx={successAlertSx}
            >
              <Typography variant="body1">
                <strong>Both certificates verified</strong> — the application is
                unlocked below.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="warning" sx={warningAlertSx} icon={false}>
              <Typography variant="body2">
                The rest of the application stays locked until both certificates
                are verified. Questions? Ask in{" "}
                <a
                  href="https://opportunity-hack.slack.com/archives/C01E5CGDQ74"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit" }}
                >
                  #ask-a-mentor on Slack
                </a>{" "}
                or email{" "}
                <a
                  href="mailto:questions@ohack.org"
                  style={{ color: "inherit" }}
                >
                  questions@ohack.org
                </a>
                .
              </Typography>
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

// Does this certificate satisfy this slot? Order matters: a real cert for
// the wrong video is a "mismatch" so the message can say what it IS for.
function resolveCertSlot(spec, cert) {
  if (!cert) return { status: "notfound", cert: null };
  const haystack = `${cert.quizTitle || ""} ${cert.targetTitle || ""}`;
  if (!spec.match.test(haystack)) return { status: "mismatch", cert };
  return { status: "verified", cert };
}

export default JudgeTrainingGate;
