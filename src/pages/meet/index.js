import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthInfo } from "@propelauth/react";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import ReCaptchaProvider from "../../components/ReCaptchaProvider";
import { useRecaptcha } from "../../hooks/use-recaptcha";
import { trackEvent } from "../../lib/ga";
import { RefinedPage, PageMasthead } from "../../components/design/RefinedPage";
import {
  refinedFormTheme,
  refinedFieldSx,
  refinedSelectMenuProps,
} from "../../components/ApplicationForm/refinedStyles";
import meetApi from "../../lib/meetApi";
import {
  ANSWER_LABELS,
  ANSWER_SYMBOLS,
  bestSlotIds,
  browserTimeZone,
  isEmail,
  nextAnswer,
  slotLongLabel,
  slotParts,
  tallyVotes,
  timeZoneOptions,
} from "../../lib/meetTime";

// Public "find a time" page: /meet?code=<code>. Anyone with the code marks
// each time yes / if need be / no, in their own timezone, and sees what
// everyone else answered. No login. The Meet link is never shown here — it
// arrives in the calendar invitation once an organizer picks the time.

const fieldSx = { ...refinedFieldSx, mb: 0 };

const ANSWER_STYLES = {
  yes: {
    background: "#E3F1E8",
    color: "var(--success)",
    borderColor: "#B9DBC6",
  },
  maybe: { background: "#FBF1D9", color: "#7A5A12", borderColor: "#EBD79B" },
  no: {
    background: "var(--surface)",
    color: "var(--faint)",
    borderColor: "var(--line)",
  },
};

const storageKey = (code) => `ohack.meet.${code}`;

function readSaved(code) {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(code)) || "null");
  } catch (e) {
    return null;
  }
}

function writeSaved(code, value) {
  try {
    window.localStorage.setItem(storageKey(code), JSON.stringify(value));
  } catch (e) {
    // Private window / blocked storage: the response is saved server-side,
    // it just can't be edited later from this browser.
  }
}

const cellBase = {
  minWidth: 92,
  padding: "8px 6px",
  textAlign: "center",
  borderBottom: "1px solid var(--line)",
  borderLeft: "1px solid var(--line)",
  fontSize: 14,
};

const nameCell = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  background: "var(--surface)",
  padding: "8px 12px",
  textAlign: "left",
  borderBottom: "1px solid var(--line)",
  minWidth: 132,
  maxWidth: 200,
  fontSize: 15,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

const AnswerMark = ({ answer }) => (
  <span
    title={ANSWER_LABELS[answer]}
    style={{
      display: "inline-block",
      minWidth: 38,
      padding: "3px 6px",
      borderRadius: 6,
      border: "1px solid",
      fontWeight: 600,
      ...ANSWER_STYLES[answer],
    }}
  >
    <span aria-hidden="true">{ANSWER_SYMBOLS[answer]}</span>
    <span style={srOnly}>{ANSWER_LABELS[answer]}</span>
  </span>
);

const CodeEntry = ({ onSubmit }) => {
  const [value, setValue] = useState("");
  return (
    <form
      className="ohx-card"
      style={{ padding: "26px 28px", marginTop: 36, maxWidth: 460 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <TextField
        label="Meeting code"
        name="code"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
        autoFocus
        sx={fieldSx}
        helperText="The organizer sent it with the link."
      />
      <div style={{ marginTop: 16 }}>
        <button type="submit" className="ohx-btn ohx-btn--primary">
          Open poll
        </button>
      </div>
    </form>
  );
};

const MeetPage = () => {
  const router = useRouter();
  const { user } = useAuthInfo();
  const { getRecaptchaToken, isLoading: recaptchaLoading } = useRecaptcha();
  const code = router.isReady
    ? String(router.query.code || "")
        .trim()
        .toLowerCase()
    : "";

  // status: idle (no code) | loading | ready | not_found | error
  const [status, setStatus] = useState("idle");
  const [poll, setPoll] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [timeZone, setTimeZone] = useState("UTC");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [choices, setChoices] = useState({});
  const [saved, setSaved] = useState(null); // { voteId, editToken }
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const seededRef = useRef("");

  // Browser timezone is only known on the client; set after mount so the
  // server render and first client render agree.
  useEffect(() => {
    setTimeZone(browserTimeZone());
  }, []);

  const load = useCallback(async (pollCode, { quiet = false } = {}) => {
    if (!quiet) setStatus("loading");
    try {
      const data = await meetApi.getPoll(pollCode);
      setPoll(data.poll);
      setVotes(data.votes || []);
      setStatus("ready");
    } catch (error) {
      if (quiet) return; // keep what is on screen
      if (error.status === 404) {
        setStatus("not_found");
      } else {
        setLoadError(error.message);
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (!code) {
      setStatus("idle");
      return;
    }
    load(code);
  }, [router.isReady, code, load]);

  // Seed the form once per poll: this browser's earlier response if it is
  // still there, otherwise the logged-in person's name and email.
  useEffect(() => {
    if (status !== "ready" || !poll || seededRef.current === poll.code) return;
    seededRef.current = poll.code;
    const stored = readSaved(poll.code);
    const mine = stored && votes.find((v) => v.id === stored.voteId);
    if (mine) {
      setSaved({ voteId: stored.voteId, editToken: stored.editToken });
      setName(mine.name || stored.name || "");
      setEmail(stored.email || "");
      setChoices(mine.choices || {});
    } else {
      setSaved(null);
      setChoices({});
    }
    trackEvent({ action: "meet_poll_view", params: { poll_code: poll.code } });
  }, [status, poll, votes]);

  useEffect(() => {
    if (!user) return;
    setName(
      (current) =>
        current || [user.firstName, user.lastName].filter(Boolean).join(" "),
    );
    setEmail((current) => current || user.email || "");
  }, [user]);

  const slots = poll?.slots || [];
  const isOpen = poll?.status === "open";
  const others = useMemo(
    () => votes.filter((v) => !saved || v.id !== saved.voteId),
    [votes, saved],
  );
  const myVote = useMemo(() => ({ id: "me", name, choices }), [name, choices]);
  const hasAnswered = saved || dirty;
  const tally = useMemo(
    () => tallyVotes(slots, hasAnswered ? [...others, myVote] : others),
    [slots, others, myVote, hasAnswered],
  );
  const best = useMemo(() => bestSlotIds(slots, tally), [slots, tally]);
  const zones = useMemo(() => timeZoneOptions(timeZone), [timeZone]);
  const finalSlot = slots.find((s) => s.id === poll?.final_slot_id);
  const respondents = others.length + (saved ? 1 : 0);

  const cycle = (slotId) => {
    setChoices((current) => ({
      ...current,
      [slotId]: nextAnswer(current[slotId]),
    }));
    setDirty(true);
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setNotice("");
    if (!name.trim()) {
      setFormError("Add your name so the others know who answered.");
      return;
    }
    if (!isEmail(email)) {
      setFormError("Add a valid email. The calendar invite is sent there.");
      return;
    }
    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken("meet_vote");
      if (!recaptchaToken && process.env.NODE_ENV !== "development") {
        setFormError("We couldn't verify your browser. Reload and try again.");
        return;
      }
      const result = await meetApi.submitVote(poll.code, {
        name: name.trim(),
        email: email.trim(),
        choices: Object.fromEntries(
          slots.map((s) => [s.id, choices[s.id] || "no"]),
        ),
        editToken: saved?.editToken,
        recaptchaToken,
      });
      const next = { voteId: result.voteId, editToken: result.editToken };
      setSaved(next);
      writeSaved(poll.code, {
        ...next,
        name: name.trim(),
        email: email.trim(),
      });
      setDirty(false);
      setNotice(
        result.updated
          ? "Your answers were updated."
          : "Thanks, your answers are saved.",
      );
      trackEvent({
        action: result.updated ? "meet_vote_updated" : "meet_vote_submitted",
        params: { poll_code: poll.code },
      });
      load(poll.code, { quiet: true });
    } catch (error) {
      if (error.code === "poll_closed") load(poll.code, { quiet: true });
      setFormError(error.message || "Could not save your answers.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = poll?.title ? `${poll.title} - Find a time` : "Find a time";

  return (
    <>
      <Head>
        <title>{`${title} - Opportunity Hack`}</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta
          name="description"
          content="Pick the meeting times that work for you."
        />
      </Head>

      <ThemeProvider theme={refinedFormTheme}>
        <RefinedPage>
          <PageMasthead
            eyebrow="Find a time"
            title={poll?.title || "Pick the times"}
            italic={poll ? undefined : "that work for you."}
            lead={
              poll
                ? poll.description ||
                  "Mark every time that works for you. Times are shown in your timezone."
                : "Enter the meeting code you were sent to see the proposed times."
            }
            style={{ marginTop: 0 }}
          />

          {status === "idle" && router.isReady && (
            <CodeEntry
              onSubmit={(value) =>
                router.push({ pathname: "/meet", query: { code: value } })
              }
            />
          )}

          {(status === "loading" || !router.isReady) && (
            <div style={{ marginTop: 36, minHeight: 240 }}>
              <CircularProgress size={24} aria-label="Loading poll" />
            </div>
          )}

          {status === "not_found" && (
            <div
              className="ohx-card"
              style={{ padding: "26px 28px", marginTop: 36, maxWidth: 520 }}
            >
              <p style={{ margin: 0 }}>
                No meeting poll matches the code <strong>{code}</strong>. Check
                the link you were sent.
              </p>
              <CodeEntry
                onSubmit={(value) =>
                  router.push({ pathname: "/meet", query: { code: value } })
                }
              />
            </div>
          )}

          {status === "error" && (
            <div
              className="ohx-card"
              role="alert"
              style={{ padding: "26px 28px", marginTop: 36, maxWidth: 520 }}
            >
              <p style={{ margin: "0 0 14px" }}>
                We couldn&apos;t load this poll. {loadError}
              </p>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={() => load(code)}
              >
                Retry
              </button>
            </div>
          )}

          {status === "ready" && poll && (
            <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
              {poll.status === "finalized" && finalSlot && (
                <div
                  className="ohx-card"
                  role="status"
                  style={{
                    padding: "20px 24px",
                    marginBottom: 20,
                    borderColor: "var(--success)",
                  }}
                >
                  <p className="ohx-eyebrow">Meeting scheduled</p>
                  <p
                    className="ohx-display"
                    style={{ fontSize: 24, margin: "6px 0 8px" }}
                  >
                    {slotLongLabel(
                      finalSlot.start,
                      poll.duration_minutes,
                      timeZone,
                    )}
                  </p>
                  <p className="ohx-muted" style={{ margin: 0, fontSize: 15 }}>
                    {poll.invites_sent
                      ? "A calendar invite with the Google Meet link was emailed to the people invited. Check your inbox (and spam) for an invite from Opportunity Hack."
                      : "The organizer will send the meeting details."}
                  </p>
                </div>
              )}
              {poll.status === "closed" && (
                <p
                  className="ohx-card"
                  role="status"
                  style={{ padding: "14px 18px", marginBottom: 20 }}
                >
                  This poll is closed. The organizer is picking a time.
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <p className="ohx-muted" style={{ margin: 0, fontSize: 15 }}>
                  {poll.duration_minutes} min ·{" "}
                  {respondents === 1
                    ? "1 response"
                    : `${respondents} responses`}
                  {isOpen &&
                    " · tap a box to switch between yes, if need be and no"}
                </p>
                <TextField
                  select
                  size="small"
                  label="Timezone"
                  name="timeZone"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  sx={{ ...fieldSx, minWidth: 240 }}
                  SelectProps={{ MenuProps: refinedSelectMenuProps }}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone} value={zone}>
                      {zone.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div
                className="ohx-card"
                style={{ padding: 0, overflowX: "auto" }}
                tabIndex={0}
                role="region"
                aria-label="Proposed times and responses"
              >
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        style={{
                          ...nameCell,
                          fontWeight: 600,
                          verticalAlign: "bottom",
                        }}
                      >
                        Name
                      </th>
                      {slots.map((slot) => {
                        const parts = slotParts(
                          slot.start,
                          poll.duration_minutes,
                          timeZone,
                        );
                        const isFinal = slot.id === poll.final_slot_id;
                        const isBest =
                          !poll.final_slot_id && best.includes(slot.id);
                        return (
                          <th
                            key={slot.id}
                            scope="col"
                            style={{
                              ...cellBase,
                              fontWeight: 500,
                              background:
                                isFinal || isBest
                                  ? "var(--accent-soft)"
                                  : "var(--surface)",
                            }}
                          >
                            <div
                              className="ohx-eyebrow"
                              style={{ fontSize: 11 }}
                            >
                              {parts.weekday}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>
                              {parts.date}
                            </div>
                            <div
                              style={{
                                fontSize: 12.5,
                                color: "var(--muted)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {parts.time}
                            </div>
                            {(isFinal || isBest) && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--accent)",
                                  fontWeight: 700,
                                  marginTop: 2,
                                }}
                              >
                                {isFinal ? "Chosen" : "Best so far"}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {isOpen && (
                      <tr>
                        <th
                          scope="row"
                          style={{ ...nameCell, fontWeight: 700 }}
                        >
                          {name.trim() || "You"}
                          <span
                            className="ohx-faint"
                            style={{ fontWeight: 400 }}
                          >
                            {" "}
                            · you
                          </span>
                        </th>
                        {slots.map((slot) => {
                          const answer = choices[slot.id] || "no";
                          return (
                            <td
                              key={slot.id}
                              style={{ ...cellBase, padding: 4 }}
                            >
                              <button
                                type="button"
                                onClick={() => cycle(slot.id)}
                                aria-label={`${slotLongLabel(slot.start, poll.duration_minutes, timeZone)}: ${ANSWER_LABELS[answer]}. Press to change.`}
                                style={{
                                  width: "100%",
                                  minHeight: 44,
                                  borderRadius: 8,
                                  border: "1.5px solid",
                                  cursor: "pointer",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  ...ANSWER_STYLES[answer],
                                }}
                              >
                                <span aria-hidden="true">
                                  {ANSWER_SYMBOLS[answer]}
                                </span>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: 11,
                                    fontWeight: 500,
                                  }}
                                >
                                  {ANSWER_LABELS[answer]}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    )}
                    {(isOpen ? others : votes).map((vote) => (
                      <tr key={vote.id}>
                        <th
                          scope="row"
                          style={{ ...nameCell, fontWeight: 500 }}
                          title={vote.name}
                        >
                          {vote.name}
                          {!isOpen && saved?.voteId === vote.id && (
                            <span className="ohx-faint"> · you</span>
                          )}
                        </th>
                        {slots.map((slot) => (
                          <td key={slot.id} style={cellBase}>
                            <AnswerMark
                              answer={vote.choices?.[slot.id] || "no"}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {votes.length === 0 && !isOpen && (
                      <tr>
                        <td
                          style={{ ...nameCell, position: "static" }}
                          colSpan={slots.length + 1}
                        >
                          Nobody responded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th
                        scope="row"
                        style={{
                          ...nameCell,
                          borderBottom: "none",
                          fontWeight: 600,
                        }}
                      >
                        Can make it
                      </th>
                      {slots.map((slot) => {
                        const t = tally[slot.id] || { yes: 0, maybe: 0 };
                        return (
                          <td
                            key={slot.id}
                            style={{
                              ...cellBase,
                              borderBottom: "none",
                              fontWeight: 700,
                            }}
                          >
                            {t.yes}
                            {t.maybe > 0 && (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "var(--muted)",
                                }}
                              >
                                {" "}
                                +{t.maybe} maybe
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {isOpen && (
                <div
                  className="ohx-card"
                  style={{
                    padding: "22px 24px",
                    marginTop: 20,
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    alignItems: "start",
                  }}
                >
                  <TextField
                    label="Your name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    sx={fieldSx}
                    inputProps={{ maxLength: 80 }}
                    helperText="Shown to everyone with this link."
                  />
                  <TextField
                    label="Your email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    disabled={Boolean(saved)}
                    sx={fieldSx}
                    inputProps={{ maxLength: 254 }}
                    helperText={
                      saved
                        ? "The invite goes here. To use another email, ask the organizer."
                        : "Only the organizer sees it. The calendar invite goes here."
                    }
                  />
                  <div style={{ gridColumn: "1 / -1" }}>
                    {formError && (
                      <p
                        role="alert"
                        style={{
                          margin: "0 0 10px",
                          fontSize: 14,
                          color: "var(--danger)",
                        }}
                      >
                        {formError}
                      </p>
                    )}
                    {notice && (
                      <p
                        role="status"
                        style={{
                          margin: "0 0 10px",
                          fontSize: 14,
                          color: "var(--success)",
                        }}
                      >
                        {notice}
                      </p>
                    )}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <button
                        type="submit"
                        className="ohx-btn ohx-btn--primary"
                        disabled={submitting || recaptchaLoading}
                        style={
                          submitting || recaptchaLoading
                            ? { opacity: 0.6, cursor: "not-allowed" }
                            : undefined
                        }
                      >
                        {submitting
                          ? "Saving…"
                          : saved
                            ? "Update my answers"
                            : "Save my answers"}
                      </button>
                      {submitting && <CircularProgress size={18} />}
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </RefinedPage>
      </ThemeProvider>
    </>
  );
};

export default function MeetPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <MeetPage {...props} />
    </ReCaptchaProvider>
  );
}
