import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuthInfo } from "@propelauth/react";
import CircularProgress from "@mui/material/CircularProgress";

import { RefinedRoot, RefinedFonts } from "../design/refined";
import { useRecaptcha } from "../../hooks/use-recaptcha";
import {
  ROLE_OPTIONS,
  getSurveyQuestions,
  questionLabel,
} from "./surveyQuestions";

const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
const SCALE_VALUES = [1, 2, 3, 4, 5];

// --- input atoms (module scope so they don't remount on every answer keystroke)

function ChoiceInput({ options, value, onChange, multi }) {
  const selectedSet = multi ? new Set(value || []) : null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const selected = multi ? selectedSet.has(opt) : value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              if (!multi) {
                onChange(value === opt ? null : opt);
                return;
              }
              const next = new Set(value || []);
              if (next.has(opt)) next.delete(opt);
              else next.add(opt);
              onChange(Array.from(next));
            }}
            style={{
              fontFamily: "var(--body)",
              fontSize: "0.95rem",
              fontWeight: 600,
              padding: "0.55em 0.95em",
              borderRadius: 4,
              cursor: "pointer",
              transition: "all .15s ease",
              border: `1px solid ${selected ? "var(--brand)" : "var(--line)"}`,
              background: selected ? "var(--brand)" : "var(--surface)",
              color: selected ? "#fff" : "var(--ink)",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ScaleInput({ value, onChange, labels }) {
  const low = labels?.[1];
  const high = labels?.[5];
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {SCALE_VALUES.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} of 5`}
              aria-pressed={selected}
              onClick={() => onChange(value === n ? null : n)}
              style={{
                flex: "1 1 0",
                minWidth: 44,
                fontFamily: "var(--display)",
                fontSize: "1.25rem",
                fontWeight: 500,
                padding: "0.5em 0",
                borderRadius: 4,
                cursor: "pointer",
                transition: "all .15s ease",
                border: `1px solid ${selected ? "var(--brand)" : "var(--line)"}`,
                background: selected ? "var(--brand)" : "var(--surface)",
                color: selected ? "#fff" : "var(--ink)",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(low || high) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: "0.78rem",
            color: "var(--faint)",
          }}
        >
          <span>{low}</span>
          <span>{high}</span>
        </div>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        padding: "0.7em 0.85em",
        borderRadius: 4,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--ink)",
        fontFamily: "var(--body)",
        fontSize: "1rem",
        lineHeight: 1.5,
        resize: "vertical",
        boxSizing: "border-box",
      }}
    />
  );
}

const YESNO = ["Yes", "No"];
const YESNOMAYBE = ["Yes", "No", "Maybe"];

function isAnswered(v) {
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") {
    return (v.value !== null && v.value !== undefined) || !!v.note;
  }
  return true;
}

function QuestionField({ q, mode, value, onChange }) {
  const composite = value && typeof value === "object" && !Array.isArray(value);

  let control = null;
  switch (q.type) {
    case "scale":
      control = <ScaleInput value={value ?? null} onChange={onChange} labels={q.scaleLabels} />;
      break;
    case "single":
      control = <ChoiceInput options={q.options} value={value ?? null} onChange={onChange} />;
      break;
    case "yesno":
      control = <ChoiceInput options={YESNO} value={value ?? null} onChange={onChange} />;
      break;
    case "yesnomaybe":
      control = <ChoiceInput options={YESNOMAYBE} value={value ?? null} onChange={onChange} />;
      break;
    case "multi":
      control = <ChoiceInput options={q.options} value={value || []} onChange={onChange} multi />;
      break;
    case "text":
      control = <TextInput value={value ?? ""} onChange={onChange} placeholder={q.placeholder} />;
      break;
    case "scale_text": {
      const scaleVal = composite ? value.value ?? null : null;
      // `noteWhen` (e.g. onboarding) reveals the text box only on low scores;
      // without it the note is always shown.
      const showNote = !q.noteWhen || q.noteWhen(scaleVal);
      control = (
        <div style={{ display: "grid", gap: 12 }}>
          <ScaleInput
            value={scaleVal}
            onChange={(v) => {
              const keepNote = !q.noteWhen || q.noteWhen(v);
              onChange({ value: v, note: keepNote && composite ? value.note || "" : "" });
            }}
            labels={q.scaleLabels}
          />
          {showNote && (
            <TextInput
              value={composite ? value.note || "" : ""}
              onChange={(t) => onChange({ value: scaleVal, note: t })}
              placeholder={q.textLabel}
            />
          )}
        </div>
      );
      break;
    }
    case "yesno_text":
      control = (
        <div style={{ display: "grid", gap: 12 }}>
          <ChoiceInput
            options={YESNO}
            value={composite ? value.value : null}
            onChange={(v) => onChange({ value: v, note: composite ? value.note || "" : "" })}
          />
          <TextInput
            value={composite ? value.note || "" : ""}
            onChange={(t) => onChange({ value: composite ? value.value ?? null : null, note: t })}
            placeholder={q.textLabel}
          />
        </div>
      );
      break;
    default:
      control = null;
  }

  return (
    <div className="ohx-card" style={{ padding: "20px 22px", display: "grid", gap: 12 }}>
      <div>
        <label style={{ fontWeight: 600, fontSize: "1.05rem", display: "block" }}>
          {questionLabel(q, mode)}
          {q.required && <span style={{ color: "var(--accent)" }}> *</span>}
          {q.optional && (
            <span style={{ color: "var(--faint)", fontWeight: 400 }}> (optional)</span>
          )}
        </label>
        {q.helper && (
          <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 4 }}>{q.helper}</div>
        )}
      </div>
      {control}
    </div>
  );
}

const Card = ({ children, style }) => (
  <div
    className="ohx-card"
    style={{ padding: "24px 26px", maxWidth: 680, margin: "0 auto", ...style }}
  >
    {children}
  </div>
);

// Module scope: a Shell defined inside EventSurvey would be a new component type
// on every render, remounting the whole form (and dropping textarea focus mid-type).
function Shell({ eventTitle, children }) {
  return (
    <RefinedRoot>
      <Head>
        <title>
          {eventTitle ? `Feedback · ${eventTitle}` : "Event feedback"} — Opportunity Hack
        </title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <RefinedFonts />
      </Head>
      <div
        className="ohx-wrap"
        style={{ paddingTop: "clamp(80px, 12vh, 110px)", paddingBottom: 72 }}
      >
        {children}
      </div>
    </RefinedRoot>
  );
}

/**
 * Event feedback survey. Renders at /hack/[event_id]/survey and /feedback.
 * Public route: logged-in selected volunteers are verified server-side and
 * skip the CAPTCHA; nonprofit partners and anonymous visitors are CAPTCHA-gated.
 */
export default function EventSurvey({ source = "survey" }) {
  const router = useRouter();
  const { event_id: eventId } = router.query;
  const { isLoggedIn, accessToken } = useAuthInfo();
  const { getRecaptchaToken } = useRecaptcha();

  const [ctx, setCtx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [role, setRole] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const mode = ctx?.mode;
  const requiresCaptcha = ctx ? ctx.requires_captcha : true;
  const eventTitle = ctx?.event?.title;

  // Load survey context (mode + the caller's eligible roles). Re-runs when auth
  // resolves so a logged-in volunteer is recognized after token hydration.
  useEffect(() => {
    if (!eventId) return undefined;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    axios
      .get(`${apiServerUrl}/api/surveys/${eventId}/context`, { headers })
      .then((res) => {
        if (cancelled) return;
        const data = res.data || {};
        if (!data.success) {
          setLoadError(data.error || "Could not load the feedback form.");
        } else {
          setCtx(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err?.response?.status === 404
            ? "We couldn't find that event."
            : "Could not load the feedback form. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, isLoggedIn, accessToken]);

  // Keep the selected role within what the user is allowed to submit. A logged-in
  // volunteer can only choose a role they're isSelected for; everyone else → nonprofit.
  useEffect(() => {
    if (!ctx) return;
    const allowed = ctx.allowed_roles?.length ? ctx.allowed_roles : ["nonprofit"];
    setRole((prev) => (allowed.includes(prev) ? prev : ctx.primary_role || allowed[0] || ""));
  }, [ctx]);

  const visibleQuestions = useMemo(() => {
    if (!role || !mode) return [];
    return getSurveyQuestions(role, mode).filter(
      (q) => !q.showIf || q.showIf(answers, mode),
    );
  }, [role, mode, answers]);

  const setAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!role) {
      setError("Please choose your role.");
      return;
    }
    if (typeof answers.overall_rating !== "number") {
      setError(
        mode === "live"
          ? "Please rate how it's going (the starred question)."
          : "Please rate your experience (the starred question).",
      );
      return;
    }

    setSubmitting(true);
    try {
      let token = null;
      if (requiresCaptcha) {
        token = await getRecaptchaToken("event_survey");
        if (!token) {
          setError("We couldn't verify you're human. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      // Only send answers for currently-visible questions (so switching role
      // doesn't carry stale answers from another role's block).
      const out = { role };
      for (const q of visibleQuestions) {
        const v = answers[q.id];
        if (isAnswered(v)) out[q.id] = v;
      }

      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      await axios.post(
        `${apiServerUrl}/api/surveys/${eventId}/responses`,
        { role, mode, source, answers: out, recaptchaToken: token },
        { headers },
      );
      setSubmitted(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err?.response?.data?.error || "Something went wrong saving your feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [role, answers, mode, requiresCaptcha, visibleQuestions, accessToken, eventId, source, getRecaptchaToken]);

  // ----------------------------------------------------------------- rendering

  if (loading) {
    return (
      <Shell eventTitle={eventTitle}>
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
          <CircularProgress sx={{ color: "var(--brand)" }} />
        </div>
      </Shell>
    );
  }

  if (loadError) {
    return (
      <Shell eventTitle={eventTitle}>
        <Card>
          <h1 className="ohx-display" style={{ fontSize: "1.6rem" }}>Feedback</h1>
          <p className="ohx-muted" style={{ marginTop: 12 }}>{loadError}</p>
        </Card>
      </Shell>
    );
  }

  if (mode === "upcoming") {
    return (
      <Shell eventTitle={eventTitle}>
        <Card style={{ textAlign: "center" }}>
          <p className="ohx-eyebrow">{eventTitle}</p>
          <h1 className="ohx-display" style={{ fontSize: "1.8rem", marginTop: 8 }}>
            This event hasn't started yet
          </h1>
          <p className="ohx-lead" style={{ margin: "12px auto 0" }}>
            The feedback form opens once the event is underway. Check back during or after the event.
          </p>
        </Card>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell eventTitle={eventTitle}>
        <Card style={{ textAlign: "center" }}>
          <p className="ohx-eyebrow">{eventTitle}</p>
          <h1 className="ohx-display" style={{ fontSize: "2rem", marginTop: 8 }}>
            Thank you{" "}<span className="ohx-italic">truly</span>.
          </h1>
          <p className="ohx-lead" style={{ margin: "14px auto 0" }}>
            Your feedback goes straight to the organizing team and shapes the next event.
          </p>
        </Card>
      </Shell>
    );
  }

  const modeLabel = mode === "live" ? "Live check-in" : "Post-event survey";
  const isGuest = !ctx?.logged_in;
  const loggedInNotEligible = ctx?.logged_in && ctx?.eligible === false;

  // You may only give feedback for the role you were selected for; nonprofits
  // (and anyone not on the volunteer list) get the nonprofit form.
  const allowedRoleValues = ctx?.allowed_roles?.length ? ctx.allowed_roles : ["nonprofit"];
  const allowedRoleOptions = ROLE_OPTIONS.filter((r) => allowedRoleValues.includes(r.value));
  const fixedRole = allowedRoleOptions.length === 1 ? allowedRoleOptions[0] : null;

  return (
    <Shell eventTitle={eventTitle}>
      <header style={{ maxWidth: 680, margin: "0 auto 28px" }}>
        <p className="ohx-eyebrow">
          {eventTitle ? `${eventTitle} · ` : ""}
          {modeLabel}
        </p>
        <h1 className="ohx-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginTop: 10 }}>
          Share your feedback
        </h1>
        <p className="ohx-lead" style={{ marginTop: 14 }}>
          {mode === "live"
            ? "A quick pulse-check while the event is happening so we can fix things in real time."
            : "A few minutes to tell us how it went. Honest answers help us run better events."}
        </p>

        {ctx?.already_submitted && (
          <div
            className="ohx-card"
            style={{ marginTop: 16, padding: "12px 16px", borderColor: "var(--brand)" }}
          >
            You've already shared {modeLabel.toLowerCase()} feedback — thank you! Submitting again
            updates your previous response.
          </div>
        )}
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", display: "grid", gap: 16 }}>
        {/* Universal: role — limited to the role(s) you're selected for */}
        <div className="ohx-card" style={{ padding: "20px 22px", display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600, fontSize: "1.05rem" }}>
            {fixedRole ? "You're giving feedback as" : "What's your role today?"}
            <span style={{ color: "var(--accent)" }}> *</span>
          </label>

          {fixedRole ? (
            <div>
              <span
                style={{
                  display: "inline-block",
                  fontWeight: 600,
                  padding: "0.45em 0.9em",
                  borderRadius: 4,
                  background: "var(--brand)",
                  color: "#fff",
                }}
              >
                {fixedRole.label}
              </span>
            </div>
          ) : (
            <>
              <ChoiceInput
                options={allowedRoleOptions.map((r) => r.label)}
                value={allowedRoleOptions.find((r) => r.value === role)?.label ?? null}
                onChange={(label) => {
                  const found = allowedRoleOptions.find((r) => r.label === label);
                  setRole(found ? found.value : "");
                }}
              />
              <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                You were selected for more than one role — pick the one you're giving feedback as.
              </div>
            </>
          )}

          {loggedInNotEligible && (
            <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
              You're not listed as a selected volunteer for this event, so this form is for our
              nonprofit partners. If that's not right, reach out to the organizers.
            </div>
          )}
          {isGuest && (
            <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
              Nonprofit partner feedback — no login needed.
            </div>
          )}
        </div>

        {visibleQuestions.map((q) => (
          <QuestionField
            key={q.id}
            q={q}
            mode={mode}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}

        {error && (
          <div
            className="ohx-card"
            style={{ padding: "12px 16px", borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            className="ohx-btn ohx-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Sending…" : "Submit feedback"}
          </button>
          {(isGuest || requiresCaptcha) && (
            <span className="ohx-faint" style={{ fontSize: "0.82rem" }}>
              Protected by reCAPTCHA. Nonprofit partners — no login needed.
            </span>
          )}
        </div>
      </div>
    </Shell>
  );
}
