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
import RefreshRounded from "@mui/icons-material/RefreshRounded";
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

// The LMS's Convex deployment. Its Functions HTTP API is used two ways:
// - anonymously: certificates:getCertificateByShareToken verifies a pasted
//   link (same query the LMS's own /certificate/:token page uses);
// - authenticated: lms.ohack.dev signs in through the SAME PropelAuth
//   instance as www.ohack.dev (auth.ohack.dev, registered as a trusted
//   customJwt issuer with EXTERNAL_AUTH_TRUST_EMAILS=true), so the judge's
//   own accessToken can call externalAuth:ensureExternalUser and
//   certificates:getMyCertificates via `Authorization: Bearer` to
//   auto-detect earned certificates without any copy/paste.
// CORS is open on both. The LMS trusts BOTH our PropelAuth instances
// (auth.ohack.dev via PROPELAUTH_URL; the propelauthtest instance that
// test.ohack.dev/previews/localhost log into, via EXTERNAL_AUTH_ISSUERS —
// added 2026-08-18), so auto-detect works in every environment. If a login's
// issuer ever isn't trusted, the gate degrades to manual paste.
const LMS_CONVEX_BASE =
  process.env.NEXT_PUBLIC_LMS_CONVEX_URL ||
  "https://majestic-trout-419.convex.cloud";
const LMS_CONVEX_QUERY_URL = `${LMS_CONVEX_BASE}/api/query`;
const LMS_CONVEX_MUTATION_URL = `${LMS_CONVEX_BASE}/api/mutation`;

// Minimum gap between automatic checks (mount/refocus). The explicit
// "Check again" button bypasses it.
const AUTO_CHECK_THROTTLE_MS = 15000;

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

const certUrlForToken = (token) => `https://lms.ohack.dev/certificate/${token}`;

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

// Authenticated Convex function call. Throws { code: "auth"|"network"|"server" }
// so callers can tell "this login isn't trusted by the LMS" (expected in dev,
// or on an untrusted issuer) apart from transient failures.
const callLmsAuthed = async (url, path, accessToken) => {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ path, args: {}, format: "json" }),
    });
  } catch (err) {
    throw Object.assign(new Error(`LMS unreachable: ${err.message}`), {
      code: "network",
    });
  }
  if (response.status === 401 || response.status === 403) {
    throw Object.assign(new Error(`LMS auth rejected: ${response.status}`), {
      code: "auth",
    });
  }
  if (!response.ok) {
    throw Object.assign(new Error(`LMS call failed: ${response.status}`), {
      code: "server",
    });
  }
  const body = await response.json();
  if (body?.status !== "success") {
    const message = body?.errorMessage || "LMS call failed";
    throw Object.assign(new Error(message), {
      code: /auth|unauthenticated|identity/i.test(message) ? "auth" : "server",
    });
  }
  return body.value;
};

const ensureExternalUserOnLms = (accessToken) =>
  callLmsAuthed(
    LMS_CONVEX_MUTATION_URL,
    "externalAuth:ensureExternalUser",
    accessToken,
  );

const fetchMyLmsCertificates = (accessToken) =>
  callLmsAuthed(
    LMS_CONVEX_QUERY_URL,
    "certificates:getMyCertificates",
    accessToken,
  );

// Assign the caller's certificates to the two required slots. Pure so it's
// unit-testable: newest issuedAt wins when a quiz was passed more than once,
// and a shareToken is never assigned to two slots (mirrors the manual
// duplicate rule).
export const matchCertsToSlots = (certs) => {
  const used = new Set();
  const out = {};
  for (const spec of JUDGE_TRAINING_CERTS) {
    const candidates = (certs || [])
      .filter((c) =>
        spec.match.test(`${c.quizTitle || ""} ${c.targetTitle || ""}`),
      )
      .filter(
        (c) =>
          typeof c.shareToken === "string" &&
          !used.has(c.shareToken.toLowerCase()),
      )
      .sort((a, b) => (b.issuedAt || 0) - (a.issuedAt || 0));
    if (candidates[0]) {
      out[spec.field] = candidates[0];
      used.add(candidates[0].shareToken.toLowerCase());
    }
  }
  return out;
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

const SLOT_PROBLEM_STATUSES = [
  "invalid",
  "notfound",
  "duplicate",
  "mismatch",
  "error",
];

/**
 * Hard gate for the judge application: links applicants to the LMS judge
 * training bundle and confirms both quiz certificates before the application
 * form is allowed to render.
 *
 * Detection is automatic first: because both sites share one PropelAuth
 * login, the gate calls the LMS with the judge's own access token
 * (ensureExternalUser → getMyCertificates), fills the certificate URL fields
 * itself, and re-checks when the tab regains focus — the judge just finishes
 * the videos and comes back. Manual paste remains as a fallback (training
 * done under a different account, dev environments, LMS unreachable).
 *
 * Certificate URLs live in the parent's formData (so they persist and submit
 * with the application); verification state lives here. Judge-form only —
 * rendered inside RefinedRoot, so .ohx-* classes and CSS vars are safe.
 */
const JudgeTrainingGate = ({
  values,
  onValueChange,
  onVerifiedChange,
  eventId,
  accessToken,
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
  // Auto-detect state: is a check in flight, and what did the last one find?
  const [autoChecking, setAutoChecking] = useState(false);
  const [autoOutcome, setAutoOutcome] = useState(null); // null | matched | partial | none | unavailable
  const [autoErrorCode, setAutoErrorCode] = useState(null); // auth | network | server
  const [manualOpen, setManualOpen] = useState(false);

  const tokenCacheRef = useRef(new Map()); // token -> cert | null
  const evaluateRunRef = useRef(0);
  const verifiedRef = useRef(false);
  const trackedVerifiedRef = useRef(new Set());

  // Auto-detect plumbing. PropelAuth rotates the access token on tab refocus,
  // and the parent's onValueChange is an inline arrow — both are read through
  // refs so runAutoDetect stays identity-stable (CLAUDE.md token-rotation
  // pattern) and the mount/refocus triggers never refire on re-renders.
  const accessTokenRef = useRef(accessToken);
  const valuesRef = useRef(values);
  const slotsRef = useRef(slots);
  const onValueChangeRef = useRef(onValueChange);
  const ensureRanRef = useRef(false); // ensureExternalUser once per mount
  const autoInFlightRef = useRef(false); // single-flight (also StrictMode)
  const autoRunRef = useRef(0); // stale-response guard
  const lastAutoCheckRef = useRef(0); // throttle clock
  const authFailedRef = useRef(false); // stop refocus retries after an auth reject
  const autoDetectedFieldsRef = useRef(new Set()); // GA once per slot

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

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
  // paste, auto-detect fills, localStorage restore, and previous-submission
  // hydration). Auto-detected tokens verify straight from the seeded cache.
  useEffect(() => {
    const handle = setTimeout(() => {
      evaluate();
    }, 600);
    return () => clearTimeout(handle);
  }, [evaluate]);

  // Ask the LMS which certificates this login has already earned, seed the
  // verification cache, and fill the URL fields. All volatile inputs come
  // through refs — identity must stay stable across parent re-renders.
  const runAutoDetect = useCallback(
    async (reason /* "mount" | "refocus" | "manual" */) => {
      if (verifiedRef.current) return; // gate already open
      if (autoInFlightRef.current) return; // single-flight
      if (reason === "refocus" && authFailedRef.current) return; // untrusted issuer — don't spam
      if (
        reason !== "manual" &&
        Date.now() - lastAutoCheckRef.current < AUTO_CHECK_THROTTLE_MS
      ) {
        return;
      }
      const token = accessTokenRef.current;
      if (!token) return;

      const runId = ++autoRunRef.current;
      autoInFlightRef.current = true;
      setAutoChecking(true);
      try {
        // First-time identities need the account link before the query
        // returns anything. Idempotent server-side; once per mount here.
        if (!ensureRanRef.current) {
          await ensureExternalUserOnLms(token);
          ensureRanRef.current = true;
        }
        const certs = await fetchMyLmsCertificates(token);
        if (autoRunRef.current !== runId) return; // stale

        const matched = matchCertsToSlots(certs);
        for (const spec of JUDGE_TRAINING_CERTS) {
          const cert = matched[spec.field];
          if (!cert) continue;
          const shareToken = cert.shareToken.toLowerCase();
          tokenCacheRef.current.set(shareToken, cert);
          // A verified value wins regardless of source — never overwrite it.
          if (slotsRef.current[spec.field]?.status === "verified") continue;
          // No-op write guard (also prevents any write→effect loop).
          const currentToken = extractCertToken(valuesRef.current[spec.field]);
          if (currentToken === shareToken) continue;
          // Don't clobber a field the judge is actively typing in.
          if (
            typeof document !== "undefined" &&
            document.activeElement?.name === spec.field
          ) {
            continue;
          }
          onValueChangeRef.current(spec.field, certUrlForToken(shareToken));
          if (!autoDetectedFieldsRef.current.has(spec.key)) {
            autoDetectedFieldsRef.current.add(spec.key);
            trackEvent({
              action: "judge_app_training_autodetected",
              params: {
                event_label: spec.key,
                event_id: eventId,
                page: "judge_application",
              },
            });
          }
        }

        const matchedCount = Object.keys(matched).length;
        setAutoOutcome(
          matchedCount >= JUDGE_TRAINING_CERTS.length
            ? "matched"
            : matchedCount > 0
              ? "partial"
              : "none",
        );
        setAutoErrorCode(null);
        lastAutoCheckRef.current = Date.now();
        trackEvent({
          action: "judge_app_training_autocheck",
          params: {
            event_label: reason,
            value: matchedCount,
            event_id: eventId,
            page: "judge_application",
          },
        });
      } catch (err) {
        if (autoRunRef.current !== runId) return;
        if (err?.code === "auth") authFailedRef.current = true;
        setAutoOutcome("unavailable");
        setAutoErrorCode(err?.code || "unknown");
        lastAutoCheckRef.current = Date.now();
        trackEvent({
          action: "judge_app_training_autocheck_failed",
          params: {
            event_label: err?.code || "unknown",
            event_id: eventId,
            page: "judge_application",
          },
        });
        console.error("LMS auto-detect failed:", err);
      } finally {
        if (autoRunRef.current === runId) {
          autoInFlightRef.current = false;
          setAutoChecking(false);
        }
      }
    },
    [eventId],
  );

  // Kick off auto-detect when a login token becomes available. Keyed on
  // token PRESENCE, never its value — PropelAuth rotates it on every refocus.
  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (!hasToken) return;
    runAutoDetect("mount");
  }, [hasToken, runAutoDetect]);

  // The magic moment: the judge finishes a video on the LMS tab and comes
  // back here — re-check automatically (throttled).
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") runAutoDetect("refocus");
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [runAutoDetect]);

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
  const anySlotProblem = JUDGE_TRAINING_CERTS.some((spec) =>
    SLOT_PROBLEM_STATUSES.includes(slots[spec.field]?.status),
  );
  const verifiedSpecs = JUDGE_TRAINING_CERTS.filter(
    (spec) => slots[spec.field]?.status === "verified",
  );
  const remainingSpecs = JUDGE_TRAINING_CERTS.filter(
    (spec) => slots[spec.field]?.status !== "verified",
  );

  // Manual paste is the fallback, not the headline: collapsed until asked
  // for, but auto-expanded when auto-detect can't run or a value has a
  // problem the judge needs to see (and whenever re-opened post-verification).
  const manualVisible =
    manualOpen ||
    allVerified ||
    autoOutcome === "unavailable" ||
    anySlotProblem;

  const openLmsButton = (
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
      {verifiedSpecs.length === 1 && remainingSpecs.length === 1
        ? `Finish “${remainingSpecs[0].videoTitle}”`
        : "Open judge training"}
    </Button>
  );

  const checkAgainButton = (
    <Button
      variant="outlined"
      onClick={() => runAutoDetect("manual")}
      disabled={autoChecking || !hasToken}
      startIcon={
        autoChecking ? (
          <CircularProgress size={16} sx={{ color: "var(--brand)" }} />
        ) : (
          <RefreshRounded />
        )
      }
      sx={ghostButtonSx}
    >
      {autoChecking ? "Checking…" : "I'm done — check again"}
    </Button>
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
            {/* Auto-detected certs (getMyCertificates) carry no
                recipientName — render only the parts we have */}
            ✓ Verified —{" "}
            {[
              slot.cert.recipientName,
              `“${slot.cert.quizTitle}”`,
              Number.isFinite(slot.cert.score)
                ? `score ${Math.round(slot.cert.score)}%`
                : null,
            ]
              .filter(Boolean)
              .join(", ")}
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
            <strong>Using the judging tool</strong>. Pass both knowledge checks
            and we'll detect your certificates automatically.
          </Typography>

          <Box sx={{ ...emphasisPanelSx, mb: 3 }}>
            <Box component="ol" sx={{ m: 0, pl: 3, color: "var(--ink)" }}>
              <Typography component="li" variant="body1" sx={{ mb: 0.75 }}>
                Open the judge training on our learning site and sign in{" "}
                <strong>with the same account you use here</strong> — it's the
                same login.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 0.75 }}>
                Watch both videos and pass each short knowledge check.
              </Typography>
              <Typography component="li" variant="body1">
                Come back to this tab — we detect your certificates
                automatically. (You can also paste the certificate links
                manually.)
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mb: 3,
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {openLmsButton}
            {(autoOutcome !== null || autoChecking) && checkAgainButton}
          </Box>

          {/* Auto-detect status */}
          {autoChecking && autoOutcome === null && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <CircularProgress size={18} sx={{ color: "var(--brand)" }} />
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Checking your training record on the LMS…
              </Typography>
            </Box>
          )}
          {autoOutcome === "none" && !allVerified && (
            <Alert severity="info" sx={{ ...infoAlertSx, mb: 2 }}>
              <Typography variant="body2">
                No training certificates found on your LMS account yet. Finish
                both videos and come back to this tab — we'll pick them up
                automatically. Did the training under a different account? Paste
                your certificate links below instead.
              </Typography>
            </Alert>
          )}
          {autoOutcome === "unavailable" && (
            <Alert severity="warning" sx={{ ...warningAlertSx, mb: 2 }}>
              <Typography variant="body2">
                {autoErrorCode === "auth"
                  ? "Automatic detection isn't available here — this environment's login isn't linked to the LMS. Paste your certificate links below instead."
                  : "We couldn't reach the LMS to check your account automatically — paste your certificate links below instead."}
              </Typography>
            </Alert>
          )}
          {verifiedSpecs.length === 1 && (
            <Alert severity="success" sx={{ ...successAlertSx, mb: 2 }}>
              <Typography variant="body2">
                <strong>
                  “{verifiedSpecs[0].videoTitle}” verified — 1 of 2 complete.
                </strong>{" "}
                Finish “{remainingSpecs[0].videoTitle}” and come back.
              </Typography>
            </Alert>
          )}

          {manualVisible ? (
            <>
              {renderCertField(JUDGE_TRAINING_CERTS[0])}
              {renderCertField(JUDGE_TRAINING_CERTS[1])}

              {anyChecking && (
                <Alert severity="info" sx={{ ...infoAlertSx, mb: 2 }}>
                  <Typography variant="body2">
                    Verifying your certificates with the LMS…
                  </Typography>
                </Alert>
              )}
            </>
          ) : (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setManualOpen(true);
                  trackEvent({
                    action: "judge_app_training_manual_fallback_open",
                    params: { event_id: eventId, page: "judge_application" },
                  });
                }}
                sx={{ ...ghostButtonSx, border: "none" }}
              >
                Paste certificate links instead
              </Button>
            </Box>
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
