import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import judgeApi, { isRoundLocked } from "../../../../lib/judgeApi";
import { trackEvent } from "../../../../lib/ga";
import { slackChannelUrl } from "../../../../lib/slackLinks";
import { RefinedRoot, Eyebrow } from "../../../../components/design/refined";
import {
  judgeTheme,
  judgeSectionStyle,
  quietTotalStyle,
  JUDGE_COLORS,
} from "../../../../components/Judge/judgeTheme";
import ScoreScale from "../../../../components/Judge/ScoreScale";
import {
  JUDGING_CRITERIA,
  SCORE_DESCRIPTIONS,
  MAX_TOTAL,
  FEEDBACK_MIN_CHARS,
  calculateTotal,
  categoryTotal,
  defaultScores,
  feedbackCharCount,
  feedbackCharsRemaining,
  feedbackText,
  hasAllCoreScores,
  isFeedbackValid,
  normalizeScores,
  roundLabel,
  specialCategoriesForRound,
} from "../../../../components/Judge/judgingCriteria";

const VideoDisplay = dynamic(
  () => import("../../../../components/VideoDisplay/VideoDisplay"),
  { ssr: false },
);

const AUTOSAVE_MS = 2000;

const formatWhen = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const cardStyle = { padding: "20px 22px" };
const sectionLabel = { fontSize: 13, fontWeight: 600, margin: 0 };
const muted = {
  color: "var(--muted)",
  fontSize: 13.5,
  margin: 0,
  lineHeight: 1.5,
};

// Module-scope (SectionBlock remount lesson): a criterion row with the
// segmented 1–5 control, the meaning of the chosen value, and a disclosure of
// the guiding questions.
const CriterionRow = ({ sub, value, onChange, disabled }) => (
  <div style={{ padding: "16px 0", borderTop: "1px solid var(--line)" }}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "10px 20px",
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 260px" }}>
        <p
          style={{
            margin: 0,
            fontSize: 15.5,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {sub.name}
        </p>
        <p style={{ ...muted, marginTop: 2 }}>{sub.description}</p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
        }}
      >
        <ScoreScale
          label={sub.name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <span
          style={{ fontSize: 12, color: "var(--muted)" }}
          aria-live="polite"
        >
          {value ? SCORE_DESCRIPTIONS[value] : "Pick a score"}
        </span>
      </div>
    </div>
    {sub.examples?.length > 0 && (
      <details style={{ marginTop: 8 }}>
        <summary
          style={{
            cursor: "pointer",
            fontSize: 13,
            color: "var(--brand)",
            fontWeight: 600,
          }}
        >
          Guiding questions
        </summary>
        <ul
          style={{
            margin: "8px 0 0",
            paddingLeft: 18,
            fontSize: 13.5,
            color: "var(--muted)",
            lineHeight: 1.55,
          }}
        >
          {sub.examples.map((ex) => (
            <li key={ex}>{ex}</li>
          ))}
        </ul>
      </details>
    )}
  </div>
);

const CategoryCard = ({ criterion, scores, onChange, disabled, note }) => (
  <section
    className="ohx-card"
    style={cardStyle}
    aria-labelledby={`cat-${criterion.category}`}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
      }}
    >
      <h2
        id={`cat-${criterion.category}`}
        className="ohx-display"
        style={{ fontSize: 20 }}
      >
        {criterion.name}
      </h2>
      <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
        {categoryTotal(criterion, scores)} of {criterion.maxPoints}
      </span>
    </div>
    {note && <p style={{ ...muted, marginTop: 6 }}>{note}</p>}
    {criterion.tip && !note && (
      <p style={{ ...muted, marginTop: 6 }}>{criterion.tip}</p>
    )}
    <div style={{ marginTop: 10 }}>
      {criterion.subCriteria.map((sub) => (
        <CriterionRow
          key={sub.key}
          sub={sub}
          value={scores[sub.key]}
          onChange={(v) => onChange(sub.key, v)}
          disabled={disabled}
        />
      ))}
    </div>
  </section>
);

const TeamScoringPage = withRequiredAuthInfo(() => {
  const { accessToken, user } = useAuthInfo();
  const router = useRouter();
  const { event_id, team_id } = router.query;
  const round = router.query.round === "round2" ? "round2" : "round1";
  const isRound2 = round === "round2";
  const backHref = `/judge/${encodeURIComponent(String(event_id || ""))}?tab=${round}`;

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");
  const [teamData, setTeamData] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState("");
  const [submittedAt, setSubmittedAt] = useState(null);
  const [locked, setLocked] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draftState, setDraftState] = useState({ status: "idle", at: null }); // idle|saving|saved|error
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const tokenRef = useRef(accessToken);
  const userIdRef = useRef(user?.userId);
  tokenRef.current = accessToken;
  userIdRef.current = user?.userId;
  const hydratedRef = useRef(false);

  const load = useCallback(async () => {
    if (!event_id || !team_id || !tokenRef.current || !userIdRef.current)
      return;
    hydratedRef.current = false;
    setStatus("loading");
    setDirty(false);
    setDraftState({ status: "idle", at: null });
    try {
      const [teamResponse, scoresResponse, locksResponse] = await Promise.all([
        judgeApi.getTeamDetails(team_id, tokenRef.current),
        judgeApi.getJudgeScores(userIdRef.current, event_id, tokenRef.current),
        judgeApi
          .getRoundLocks(event_id, tokenRef.current)
          .catch(() => ({ locks: null })),
      ]);
      if (!teamResponse?.team) throw new Error("This team could not be found.");
      setTeamData(teamResponse.team);
      setLocked(Boolean(locksResponse?.locks?.[round]?.locked));

      const existing = (scoresResponse?.scores || []).find(
        (s) => s.team_id === team_id && s.round === round,
      );
      if (existing) {
        setScores({
          ...defaultScores(round),
          ...normalizeScores(existing.scores, round),
        });
        setFeedback(feedbackText(existing.feedback));
        setSubmittedAt(existing.submitted_at || null);
      } else {
        setSubmittedAt(null);
        let restored = false;
        try {
          const draftResponse = await judgeApi.getDraft(
            userIdRef.current,
            team_id,
            event_id,
            round,
            tokenRef.current,
          );
          if (draftResponse?.draft?.scores) {
            const draftScores = normalizeScores(
              draftResponse.draft.scores,
              round,
            );
            setScores({ ...defaultScores(round), ...draftScores });
            setFeedback(feedbackText(draftResponse.draft.feedback));
            restored = true;
            setToast({
              severity: "info",
              message: "Your saved draft was restored.",
            });
          }
        } catch (draftError) {
          // A failed draft read is not fatal; we just start from defaults.
        }
        if (!restored) {
          setScores(defaultScores(round));
          setFeedback("");
        }
      }
      setStatus("ready");
      // Let the state above settle before autosave is allowed to notice changes.
      setTimeout(() => {
        hydratedRef.current = true;
      }, 0);
    } catch (err) {
      setErrorMessage(err?.message || "Couldn't load this team");
      setStatus("error");
    }
  }, [event_id, team_id, round]);

  const hasToken = Boolean(accessToken);
  const hasUser = Boolean(user?.userId);
  useEffect(() => {
    if (router.isReady && hasToken && hasUser) load();
  }, [router.isReady, hasToken, hasUser, load]);

  const markDirty = () => {
    if (!hydratedRef.current) return;
    setDirty(true);
    // Unsubmitted scores: "pending" until the debounced draft save lands.
    if (!submittedAt) setDraftState((s) => ({ ...s, status: "pending" }));
  };
  const setScore = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };
  const onFeedbackChange = (e) => {
    setFeedback(e.target.value);
    markDirty();
  };

  // Unsaved-changes guard. Edits to a SUBMITTED score are never autosaved,
  // so Back / the "← teams" link would silently drop them; for a new score
  // the 2s autosave window can lose the last change. Browser dialog on
  // unload, confirm() on in-app navigation. Suppressed for the post-submit
  // redirect.
  const hasUnsaved =
    !locked &&
    dirty &&
    (submittedAt
      ? true
      : ["pending", "saving", "error"].includes(draftState.status));
  const unsavedRef = useRef(false);
  unsavedRef.current = hasUnsaved;
  const leavingRef = useRef(false);
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!unsavedRef.current || leavingRef.current) return undefined;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    const onRouteChangeStart = () => {
      if (!unsavedRef.current || leavingRef.current) return;
      if (
        window.confirm(
          "You have unsaved changes to this score. Leave without saving?",
        )
      ) {
        leavingRef.current = true;
        return;
      }
      router.events?.emit?.("routeChangeError");
      // Next's documented way to abort a client-side navigation.
      throw new Error("Route change aborted: unsaved score changes");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    router.events?.on?.("routeChangeStart", onRouteChangeStart);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      router.events?.off?.("routeChangeStart", onRouteChangeStart);
    };
  }, [router.events]);

  // Draft autosave: only for scores that have NOT been submitted yet, only
  // after the judge actually changed something, never while the round is
  // locked. (Previously every page load wrote a draft — including for already
  // submitted scores, whose drafts were then never shown again.)
  useEffect(() => {
    if (status !== "ready" || !dirty || submittedAt || locked) return undefined;
    const timer = setTimeout(async () => {
      setDraftState((s) => ({ ...s, status: "saving" }));
      try {
        await judgeApi.saveDraft(
          userIdRef.current,
          team_id,
          event_id,
          scores,
          round,
          tokenRef.current,
          { general: feedback },
        );
        setDraftState({ status: "saved", at: new Date() });
      } catch (err) {
        if (isRoundLocked(err)) setLocked(true);
        setDraftState((s) => ({ ...s, status: "error" }));
      }
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [
    scores,
    feedback,
    dirty,
    status,
    submittedAt,
    locked,
    team_id,
    event_id,
    round,
  ]);

  const total = useMemo(() => calculateTotal(scores), [scores]);
  const specials = specialCategoriesForRound(round);
  const feedbackOk = isFeedbackValid(feedback);
  const complete = hasAllCoreScores(scores);
  const canSubmit =
    status === "ready" && !locked && feedbackOk && complete && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await judgeApi.submitScore(
        userIdRef.current,
        team_id,
        event_id,
        { ...scores, total },
        round,
        tokenRef.current,
        { general: feedback },
      );
      setConfirmOpen(false);
      trackEvent({
        action: "judge_score_submitted",
        params: {
          event_id,
          round,
          event_label: submittedAt ? "update" : "submit",
          page: "judge_team",
        },
      });
      setSubmittedAt(new Date().toISOString());
      setDirty(false);
      leavingRef.current = true; // the redirect below must not trip the guard
      router.push(backHref);
    } catch (err) {
      setConfirmOpen(false);
      if (isRoundLocked(err)) {
        setLocked(true);
        setToast({
          severity: "warning",
          message: `${roundLabel(round)} scoring was just closed by the organizers — your score was not changed.`,
        });
      } else {
        setToast({
          severity: "error",
          message:
            err?.message || "Couldn't submit your score. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const videoUrl = !isRound2
    ? teamData?.demo_video_url || teamData?.video_url
    : null;
  const pageTitle = teamData?.name ? `Judging ${teamData.name}` : "Judging";

  const statusLine = (() => {
    if (locked) return "Scoring closed — read only";
    if (submittedAt)
      return dirty
        ? "Edited — press Update score to save"
        : `Submitted ${formatWhen(submittedAt) || ""}`.trim();
    if (draftState.status === "pending") return "Unsaved changes…";
    if (draftState.status === "saving") return "Saving draft…";
    if (draftState.status === "saved")
      return `Draft saved ${draftState.at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    if (draftState.status === "error")
      return "Draft not saved — check your connection";
    return "Not submitted yet";
  })();

  return (
    <>
      <Head>
        <title>{`${pageTitle} - Opportunity Hack`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Score a hackathon team against the Opportunity Hack judging criteria."
        />
      </Head>

      <ThemeProvider theme={judgeTheme}>
        <RefinedRoot>
          <section className="ohx-wrap" style={judgeSectionStyle}>
            <Link href={backHref} className="ohx-link" style={{ fontSize: 13 }}>
              ← {roundLabel(round)} teams
            </Link>

            {status === "loading" && (
              <div
                aria-busy="true"
                aria-label="Loading team"
                style={{ marginTop: 18 }}
              >
                <div
                  style={{
                    height: 10,
                    width: 120,
                    background: "var(--surface-2)",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    height: 40,
                    width: "55%",
                    background: "var(--surface-2)",
                    borderRadius: 4,
                    marginTop: 14,
                  }}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                    gap: 20,
                    marginTop: 28,
                  }}
                >
                  <div className="ohx-card" style={{ minHeight: 360 }} />
                  <div className="ohx-card" style={{ minHeight: 360 }} />
                </div>
              </div>
            )}

            {status === "error" && (
              <div
                className="ohx-card"
                role="alert"
                style={{ marginTop: 24, padding: 24 }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>
                  We couldn't load this team.
                </p>
                <p
                  style={{
                    margin: "6px 0 14px",
                    fontSize: 14,
                    color: "var(--muted)",
                  }}
                >
                  {errorMessage}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--primary"
                    onClick={() => load()}
                  >
                    Try again
                  </button>
                  <Link href={backHref} className="ohx-btn ohx-btn--ghost">
                    Back to your teams
                  </Link>
                </div>
              </div>
            )}

            {status === "ready" && teamData && (
              <>
                <header style={{ marginTop: 18 }}>
                  <Eyebrow>
                    {roundLabel(round)} scoring
                    {teamData.problem_statement?.nonprofit
                      ? ` · ${teamData.problem_statement.nonprofit}`
                      : ""}
                  </Eyebrow>
                  <h1 className="ohx-display" style={{ marginTop: 8 }}>
                    {teamData.name}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    <span
                      className={`ohx-tag${!submittedAt && !locked ? " ohx-tag--accent" : ""}`}
                    >
                      {statusLine}
                    </span>
                    {submittedAt && !locked && (
                      <span className="ohx-tag">
                        You can still change this score
                      </span>
                    )}
                  </div>
                </header>

                {locked && (
                  <div
                    className="ohx-card"
                    role="status"
                    style={{
                      marginTop: 20,
                      padding: "14px 18px",
                      background: "var(--surface-2)",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14.5 }}>
                      <strong>{roundLabel(round)} scoring is closed.</strong>{" "}
                      The organizers have locked this round.
                      {submittedAt
                        ? " Your submitted score is shown below and can no longer be changed."
                        : " Scores can no longer be submitted for this round."}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                    gap: 24,
                    marginTop: 24,
                    alignItems: "start",
                  }}
                >
                  {/* ---- Team information (sticky on wide screens) ---- */}
                  <aside
                    style={{
                      position: "sticky",
                      top: 84,
                      maxHeight: "calc(100vh - 100px)",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Deliberately small and uncolored: no verdict readable
                        over a shoulder. First in the aside so it's always in
                        view while scoring. */}
                    <p style={{ ...quietTotalStyle, paddingLeft: 2 }}>
                      Total {total} of {MAX_TOTAL}
                      {specials.map((c) =>
                        c.subCriteria.map((sp) => (
                          <span key={sp.key}>
                            {" "}
                            · {c.name} {scores[sp.key] ?? "–"} of {c.maxPoints}{" "}
                            (separate prize)
                          </span>
                        )),
                      )}
                    </p>

                    <div className="ohx-card" style={cardStyle}>
                      {(teamData.problem_statement?.title ||
                        teamData.problem_statement?.description) && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={sectionLabel}>Problem</p>
                          {teamData.problem_statement.title && (
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: 15,
                                fontWeight: 500,
                              }}
                            >
                              {teamData.problem_statement.title}
                            </p>
                          )}
                          {teamData.problem_statement.description && (
                            <p style={{ ...muted, marginTop: 4 }}>
                              {teamData.problem_statement.description}
                            </p>
                          )}
                        </div>
                      )}
                      {teamData.description && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={sectionLabel}>About the project</p>
                          <p style={{ ...muted, marginTop: 4 }}>
                            {teamData.description}
                          </p>
                        </div>
                      )}
                      {teamData.members?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={sectionLabel}>Team</p>
                          <p style={{ ...muted, marginTop: 4 }}>
                            {teamData.members
                              .map((m) => m?.name)
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p style={sectionLabel}>What you're evaluating</p>
                        <p style={{ ...muted, marginTop: 4 }}>
                          The demo video, the code on GitHub and the DevPost
                          write-up, against the criteria on the right.
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px 18px",
                            marginTop: 10,
                          }}
                        >
                          {teamData.github_url && (
                            <a
                              className="ohx-link"
                              href={teamData.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 14 }}
                            >
                              GitHub ↗
                            </a>
                          )}
                          {teamData.devpost_url && (
                            <a
                              className="ohx-link"
                              href={teamData.devpost_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 14 }}
                            >
                              DevPost ↗
                            </a>
                          )}
                          {teamData.demo_url && (
                            <a
                              className="ohx-link"
                              href={teamData.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 14 }}
                            >
                              Live demo ↗
                            </a>
                          )}
                          {videoUrl && (
                            <a
                              className="ohx-link"
                              href={videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 14 }}
                            >
                              Open video ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {videoUrl && (
                      <div className="ohx-card" style={{ padding: 12 }}>
                        <p style={{ ...sectionLabel, padding: "4px 8px 10px" }}>
                          Demo video
                        </p>
                        <VideoDisplay url={videoUrl} title="" />
                      </div>
                    )}

                    {teamData.slack_channel && (
                      <div className="ohx-card" style={cardStyle}>
                        <p style={sectionLabel}>Questions for the team?</p>
                        <p style={{ ...muted, marginTop: 4 }}>
                          Ask in their Slack channel — that's where the team is.
                        </p>
                        <a
                          className="ohx-btn ohx-btn--ghost"
                          href={slackChannelUrl(teamData.slack_channel)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginTop: 12 }}
                        >
                          Open #
                          {String(teamData.slack_channel).replace(/^#/, "")}
                        </a>
                        <details style={{ marginTop: 12 }}>
                          <summary
                            style={{
                              cursor: "pointer",
                              fontSize: 13,
                              color: "var(--brand)",
                              fontWeight: 600,
                            }}
                          >
                            Tips for asking in Slack
                          </summary>
                          <ul
                            style={{
                              margin: "8px 0 0",
                              paddingLeft: 18,
                              fontSize: 13.5,
                              color: "var(--muted)",
                              lineHeight: 1.55,
                            }}
                          >
                            <li>
                              Use @here so every team member sees your question.
                            </li>
                            <li>
                              For anything complex, record a short{" "}
                              <a
                                className="ohx-link"
                                href="https://slack.com/help/articles/4406235165587-Create-audio-and-video-clips-in-Slack"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                audio or video clip
                              </a>
                              .
                            </li>
                            <li>
                              Screenshot the specific screen you're asking
                              about.
                            </li>
                          </ul>
                        </details>
                      </div>
                    )}
                  </aside>

                  {/* ---- Scoring ---- */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {submittedAt && !locked && (
                      <div
                        className="ohx-card"
                        style={{
                          padding: "12px 16px",
                          background: "var(--surface-2)",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: 13.5 }}>
                          You submitted this score
                          {formatWhen(submittedAt)
                            ? ` on ${formatWhen(submittedAt)}`
                            : ""}
                          . Changes are not saved until you press{" "}
                          <strong>Update score</strong>.
                        </p>
                      </div>
                    )}

                    {JUDGING_CRITERIA.map((criterion) => (
                      <CategoryCard
                        key={criterion.category}
                        criterion={criterion}
                        scores={scores}
                        onChange={setScore}
                        disabled={locked || submitting}
                      />
                    ))}

                    {specials.map((criterion) => (
                      <CategoryCard
                        key={criterion.category}
                        criterion={criterion}
                        scores={scores}
                        onChange={setScore}
                        disabled={locked || submitting}
                        note={
                          <>
                            Special-category prize — judged separately and not
                            part of the {MAX_TOTAL}-point total.{" "}
                            {criterion.description}
                            {criterion.reference && (
                              <>
                                {" "}
                                <a
                                  className="ohx-link"
                                  href={criterion.reference}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  W3C principles ↗
                                </a>
                              </>
                            )}
                          </>
                        }
                      />
                    ))}

                    <section
                      className="ohx-card"
                      style={cardStyle}
                      aria-labelledby="feedback-heading"
                    >
                      <h2
                        id="feedback-heading"
                        className="ohx-display"
                        style={{ fontSize: 20 }}
                      >
                        Feedback for the team
                      </h2>
                      <p style={{ ...muted, marginTop: 6 }}>
                        Shared with the team after judging, without your name.
                        Name one thing they did well and one concrete thing that
                        would make it better.
                      </p>
                      <label
                        htmlFor="team-feedback"
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          overflow: "hidden",
                          clip: "rect(0 0 0 0)",
                        }}
                      >
                        Feedback for the team
                      </label>
                      <textarea
                        id="team-feedback"
                        value={feedback}
                        onChange={onFeedbackChange}
                        disabled={locked || submitting}
                        rows={6}
                        placeholder="What works well, what's missing before the nonprofit could use it, and one suggestion for the next step…"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          marginTop: 12,
                          fontFamily: "inherit",
                          fontSize: 15,
                          lineHeight: 1.55,
                          padding: "12px 14px",
                          border: "1px solid var(--line)",
                          borderRadius: 6,
                          background: "var(--surface)",
                          color: "var(--ink)",
                          resize: "vertical",
                        }}
                      />
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 12.5,
                          color: feedbackOk ? "var(--muted)" : "var(--danger)",
                        }}
                        aria-live="polite"
                      >
                        {feedbackOk
                          ? `${feedbackCharCount(feedback)} characters`
                          : `${feedbackCharsRemaining(feedback)} more character${feedbackCharsRemaining(feedback) === 1 ? "" : "s"} needed (minimum ${FEEDBACK_MIN_CHARS})`}
                      </p>
                    </section>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 14,
                        marginTop: 4,
                      }}
                    >
                      {!locked && !feedbackOk && (
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--muted)",
                            marginRight: "auto",
                          }}
                        >
                          Add feedback to enable{" "}
                          {submittedAt ? "Update" : "Submit"}.
                        </span>
                      )}
                      <Link href={backHref} className="ohx-btn ohx-btn--ghost">
                        {locked ? "Back to your teams" : "Cancel"}
                      </Link>
                      {!locked && (
                        <button
                          type="button"
                          className="ohx-btn ohx-btn--primary"
                          onClick={() => setConfirmOpen(true)}
                          disabled={!canSubmit}
                          aria-disabled={!canSubmit}
                          style={
                            !canSubmit
                              ? { opacity: 0.5, cursor: "not-allowed" }
                              : undefined
                          }
                        >
                          {submittedAt
                            ? "Update score"
                            : "Submit score & feedback"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </RefinedRoot>

        {/* Confirm dialog renders through a Portal — plain MUI, literal colors. */}
        <Dialog
          open={confirmOpen}
          onClose={() => !submitting && setConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {submittedAt ? "Update your score" : "Submit your score"} for{" "}
            {teamData?.name}?
          </DialogTitle>
          <DialogContent>
            <p style={{ margin: 0, color: JUDGE_COLORS.muted, fontSize: 14.5 }}>
              {submittedAt
                ? "This replaces the score you submitted earlier. You can change it again until the round is locked."
                : "You can still change this score later from your dashboard until the round is locked."}
            </p>
            <div
              style={{
                marginTop: 16,
                borderTop: `1px solid ${JUDGE_COLORS.line}`,
              }}
            >
              {JUDGING_CRITERIA.map((criterion) => (
                <div
                  key={criterion.category}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: `1px solid ${JUDGE_COLORS.line}`,
                    fontSize: 14.5,
                  }}
                >
                  <span>{criterion.name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {categoryTotal(criterion, scores)} / {criterion.maxPoints}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  fontSize: 14.5,
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {total} / {MAX_TOTAL}
                </span>
              </div>
              {specials.map((c) =>
                c.subCriteria.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: 13.5,
                      color: JUDGE_COLORS.muted,
                    }}
                  >
                    <span>{c.name} (separate prize)</span>
                    <span>
                      {scores[s.key] ?? "–"} / {c.maxPoints}
                    </span>
                  </div>
                )),
              )}
            </div>
            <p style={{ margin: "16px 0 6px", fontSize: 13, fontWeight: 600 }}>
              Feedback
            </p>
            <div
              style={{
                maxHeight: 140,
                overflow: "auto",
                padding: "10px 12px",
                background: JUDGE_COLORS.surface2,
                border: `1px solid ${JUDGE_COLORS.line}`,
                borderRadius: 6,
                fontSize: 14,
                whiteSpace: "pre-wrap",
              }}
            >
              {feedback.trim() || "No feedback provided"}
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
              sx={{ color: JUDGE_COLORS.ink }}
            >
              Keep editing
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
              sx={{
                bgcolor: JUDGE_COLORS.brand,
                "&:hover": { bgcolor: JUDGE_COLORS.brandInk },
              }}
            >
              {submitting
                ? "Submitting…"
                : submittedAt
                  ? "Update score"
                  : "Submit score"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={5000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToast(null)}
            severity={toast?.severity || "info"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast?.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </>
  );
});

export default TeamScoringPage;
