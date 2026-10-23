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
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import judgeApi, { isRoundLocked } from "../../lib/judgeApi";
import { RefinedRoot, Eyebrow, Stat } from "../../components/design/refined";
import {
  judgeTheme,
  judgeSectionStyle,
} from "../../components/Judge/judgeTheme";
import JudgeTeamCard from "../../components/Judge/JudgeTeamCard";
import {
  calculateTotal,
  normalizeScores,
  roundLabel,
  MAX_TOTAL,
} from "../../components/Judge/judgingCriteria";
import { trackEvent } from "../../lib/ga";

const VideoDisplay = dynamic(
  () => import("../../components/VideoDisplay/VideoDisplay"),
  { ssr: false },
);

const ROUNDS = ["round1", "round2"];
const scoreKey = (teamId, round) => `${teamId}_${round}`;
const REFOCUS_THROTTLE_MS = 15000;

const ROUND_COPY = {
  round1: {
    title: "Round 1",
    blurb:
      "Watch each team's demo video and look through their code, then score every criterion from 1 to 5.",
  },
  round2: {
    title: "Round 2",
    blurb:
      "Finalist live demos. Score each team right after its presentation — you can adjust any score from here until the round is locked.",
  },
};

// Skeleton that reserves the card grid's space while the first fetch runs.
const CardSkeleton = () => (
  <div
    className="ohx-card"
    aria-hidden="true"
    style={{ padding: 20, minHeight: 236 }}
  >
    <div
      style={{
        height: 10,
        width: "28%",
        background: "var(--surface-2)",
        borderRadius: 4,
      }}
    />
    <div
      style={{
        height: 22,
        width: "70%",
        background: "var(--surface-2)",
        borderRadius: 4,
        marginTop: 14,
      }}
    />
    <div
      style={{
        height: 12,
        width: "50%",
        background: "var(--surface-2)",
        borderRadius: 4,
        marginTop: 12,
      }}
    />
    <div
      style={{
        height: 12,
        width: "85%",
        background: "var(--surface-2)",
        borderRadius: 4,
        marginTop: 10,
      }}
    />
    <div
      style={{
        height: 36,
        width: 140,
        background: "var(--surface-2)",
        borderRadius: 4,
        marginTop: 28,
      }}
    />
  </div>
);

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
  gap: 20,
  marginTop: 20,
  alignItems: "start",
};

const HackathonJudgePage = withRequiredAuthInfo(() => {
  const { accessToken, user } = useAuthInfo();
  const router = useRouter();
  const { event_id } = router.query;

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState(null); // { round1_teams, round2_teams, event, locks }
  const [scoresByKey, setScoresByKey] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [adjustingKey, setAdjustingKey] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [video, setVideo] = useState(null);
  const [toast, setToast] = useState(null);

  // Token/user read through refs so PropelAuth's token rotation on tab
  // refocus never re-triggers the load effect (and never wipes an open
  // inline editor).
  const tokenRef = useRef(accessToken);
  const userIdRef = useRef(user?.userId);
  tokenRef.current = accessToken;
  userIdRef.current = user?.userId;
  const adjustingRef = useRef(null);
  adjustingRef.current = adjustingKey;
  const lastRefocusRef = useRef(0);

  // Tab from the URL, once the router is ready.
  useEffect(() => {
    if (!router.isReady) return;
    const tab = router.query.tab;
    if (tab === "round2") setActiveTab(1);
    else if (tab === "round1") setActiveTab(0);
  }, [router.isReady, router.query.tab]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!event_id || !tokenRef.current || !userIdRef.current) return;
      if (!silent) setStatus("loading");
      try {
        const [teams, scores] = await Promise.all([
          judgeApi.getJudgeTeams(userIdRef.current, event_id, tokenRef.current),
          judgeApi.getJudgeScores(
            userIdRef.current,
            event_id,
            tokenRef.current,
          ),
        ]);
        const map = {};
        (scores?.scores || []).forEach((s) => {
          if (!s?.team_id || !s?.round) return;
          map[scoreKey(s.team_id, s.round)] = {
            scores: normalizeScores(s.scores, s.round),
            feedback: s.feedback,
            submitted_at: s.submitted_at,
          };
        });
        setScoresByKey(map);
        setData({
          round1_teams: teams?.round1_teams || [],
          round2_teams: teams?.round2_teams || [],
          event: teams?.event || null,
          locks: teams?.locks || null,
        });
        setStatus("ready");
      } catch (err) {
        if (silent) return; // keep what we have
        setErrorMessage(err?.message || "Couldn't load your assignments");
        setStatus("error");
      }
    },
    [event_id],
  );

  const hasToken = Boolean(accessToken);
  const hasUser = Boolean(user?.userId);
  useEffect(() => {
    if (router.isReady && hasToken && hasUser) load();
  }, [router.isReady, hasToken, hasUser, load]);

  // Pick up lock changes / new assignments when the judge comes back to the
  // tab — but never while an inline editor is open.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      if (adjustingRef.current) return;
      const now = Date.now();
      if (now - lastRefocusRef.current < REFOCUS_THROTTLE_MS) return;
      lastRefocusRef.current = now;
      load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const handleTabChange = (_e, newValue) => {
    setActiveTab(newValue);
    setAdjustingKey(null);
    setSaveError(null);
    const currentPath = router.asPath.split("?")[0];
    router.replace(`${currentPath}?tab=${ROUNDS[newValue]}`, undefined, {
      shallow: true,
    });
  };

  const openAdjust = (team, round) => {
    const key = scoreKey(team.id, round);
    setSaveError(null);
    setAdjustingKey(key);
    trackEvent({
      action: "judge_inline_adjust_open",
      params: { event_id, round, page: "judge_event" },
    });
  };

  const closeAdjust = () => {
    setAdjustingKey(null);
    setSaveError(null);
  };

  const saveAdjust = async (team, round, draftScores, feedbackString) => {
    const key = scoreKey(team.id, round);
    const total = calculateTotal(draftScores);
    const payload = { ...draftScores, total };
    const feedback = { general: feedbackString };
    setSavingKey(key);
    setSaveError(null);
    try {
      await judgeApi.submitScore(
        userIdRef.current,
        team.id,
        event_id,
        payload,
        round,
        tokenRef.current,
        feedback,
      );
      const submittedAt = new Date().toISOString();
      setScoresByKey((prev) => ({
        ...prev,
        [key]: {
          scores: normalizeScores(payload, round),
          feedback,
          submitted_at: submittedAt,
        },
      }));
      setData((prev) => {
        if (!prev) return prev;
        const listKey = `${round}_teams`;
        return {
          ...prev,
          [listKey]: prev[listKey].map((t) =>
            t.id === team.id
              ? {
                  ...t,
                  judged: true,
                  score: total,
                  specialCategoryScores:
                    round === "round1"
                      ? {
                          ...(t.specialCategoryScores || {}),
                          accessibility: draftScores.accessibility ?? null,
                        }
                      : t.specialCategoryScores,
                }
              : t,
          ),
        };
      });
      if (adjustingRef.current === key) setAdjustingKey(null);
      // No numbers in the toast — it's a big filled bar anyone nearby can read.
      setToast({
        severity: "success",
        message: `Saved your changes for ${team.name}.`,
      });
      trackEvent({
        action: "judge_inline_adjust_saved",
        params: { event_id, round, page: "judge_event" },
      });
    } catch (err) {
      if (isRoundLocked(err)) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                locks: {
                  ...(prev.locks || {}),
                  [round]: { ...(prev.locks?.[round] || {}), locked: true },
                },
              }
            : prev,
        );
        if (adjustingRef.current === key) setAdjustingKey(null);
        setToast({
          severity: "warning",
          message: `${roundLabel(round)} scoring was just closed by the organizers — your change wasn't saved.`,
        });
      } else {
        const message =
          err?.message || "Couldn't save your changes. Please try again.";
        if (adjustingRef.current === key) {
          setSaveError(message);
        } else {
          // Defensive: the editor can't normally close mid-save (buttons are
          // disabled), but a failure must never be silent.
          setToast({
            severity: "error",
            message: `Couldn't save your changes for ${team.name}: ${message}`,
          });
        }
      }
    } finally {
      setSavingKey(null);
    }
  };

  const title =
    data?.event?.title ||
    (typeof event_id === "string" ? event_id.replace(/[_-]/g, " ") : "");

  const counts = useMemo(() => {
    const r1 = data?.round1_teams || [];
    const r2 = data?.round2_teams || [];
    const done = (teams, round) =>
      teams.filter((t) => t.judged || scoresByKey[scoreKey(t.id, round)])
        .length;
    return {
      r1: r1.length,
      r2: r2.length,
      r1Done: done(r1, "round1"),
      r2Done: done(r2, "round2"),
    };
  }, [data, scoresByKey]);

  const renderRound = (round) => {
    const teams = data?.[`${round}_teams`] || [];
    const locked = Boolean(data?.locks?.[round]?.locked);
    const done = round === "round1" ? counts.r1Done : counts.r2Done;
    const copy = ROUND_COPY[round];
    return (
      <section aria-labelledby={`${round}-heading`} style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <h2
            id={`${round}-heading`}
            className="ohx-display"
            style={{ fontSize: 24 }}
          >
            {copy.title}
            <span style={{ color: "var(--muted)", fontWeight: 400 }}>
              {" "}
              · {done} of {teams.length} scored
            </span>
          </h2>
          {locked && <span className="ohx-tag">Scoring closed</span>}
          {round === "round2" && !locked && (
            <span className="ohx-tag">Live demos</span>
          )}
        </div>
        <p className="ohx-lead" style={{ marginTop: 8, maxWidth: "60ch" }}>
          {copy.blurb}
        </p>

        {locked && (
          <div
            className="ohx-card"
            role="status"
            style={{
              marginTop: 16,
              padding: "14px 18px",
              background: "var(--surface-2)",
            }}
          >
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>{copy.title} scoring is closed.</strong> The organizers
              have locked this round, so scores can no longer be changed. You
              can still open any team to review what you submitted.
            </p>
          </div>
        )}

        {teams.length === 0 ? (
          <div className="ohx-card" style={{ marginTop: 20, padding: 24 }}>
            <p style={{ margin: 0, fontSize: 15 }}>
              You have no teams assigned for {copy.title} yet.
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13.5,
                color: "var(--muted)",
              }}
            >
              Organizers assign teams shortly before judging starts. If you
              expected teams here, ask in the judges channel on Slack.
            </p>
          </div>
        ) : (
          <div style={gridStyle}>
            {teams.map((team) => {
              const key = scoreKey(team.id, round);
              return (
                <JudgeTeamCard
                  key={key}
                  team={team}
                  round={round}
                  eventId={event_id}
                  scoreEntry={scoresByKey[key] || null}
                  locked={locked}
                  isAdjusting={adjustingKey === key}
                  onOpenAdjust={() => openAdjust(team, round)}
                  onCloseAdjust={closeAdjust}
                  onSaveAdjust={(draft, fb) =>
                    saveAdjust(team, round, draft, fb)
                  }
                  saving={savingKey === key}
                  anySaving={Boolean(savingKey)}
                  saveError={adjustingKey === key ? saveError : null}
                  onWatchVideo={(url, name) => setVideo({ url, title: name })}
                />
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <Head>
        <title>{`Judging ${title || ""} - Opportunity Hack`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Score your assigned hackathon teams against the Opportunity Hack judging criteria."
        />
      </Head>

      <ThemeProvider theme={judgeTheme}>
        <RefinedRoot>
          <section className="ohx-wrap" style={judgeSectionStyle}>
            <Link href="/judge" className="ohx-link" style={{ fontSize: 13 }}>
              ← All judging assignments
            </Link>

            <header style={{ marginTop: 18 }}>
              <Eyebrow>Judging</Eyebrow>
              <h1 className="ohx-display" style={{ marginTop: 8 }}>
                {title || "Hackathon"}
              </h1>
              <p
                className="ohx-lead"
                style={{ marginTop: 12, maxWidth: "58ch" }}
              >
                Score each assigned team against the four criteria. You can
                adjust a score from this page any time before the round is
                locked — nothing changes until you press Save.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px 40px",
                  marginTop: 22,
                  paddingTop: 18,
                  borderTop: "1px solid var(--line)",
                  minHeight: 54,
                }}
              >
                <Stat
                  value={status === "ready" ? counts.r1 : "–"}
                  label="Round 1 teams"
                />
                <Stat
                  value={status === "ready" ? counts.r2 : "–"}
                  label="Round 2 teams"
                />
                <Stat
                  value={
                    status === "ready" ? counts.r1Done + counts.r2Done : "–"
                  }
                  label="Scored"
                />
              </div>
            </header>

            <div
              style={{ borderBottom: "1px solid var(--line)", marginTop: 24 }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="Judging rounds"
              >
                <Tab
                  id="tab-round1"
                  aria-controls={activeTab === 0 ? "judging-panel" : undefined}
                  label={`Round 1${status === "ready" ? ` (${counts.r1Done}/${counts.r1})` : ""}`}
                />
                <Tab
                  id="tab-round2"
                  aria-controls={activeTab === 1 ? "judging-panel" : undefined}
                  label={`Round 2${status === "ready" ? ` (${counts.r2Done}/${counts.r2})` : ""}`}
                />
              </Tabs>
            </div>

            {status === "loading" && (
              <div
                style={gridStyle}
                aria-busy="true"
                aria-label="Loading your teams"
              >
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            )}

            {status === "error" && (
              <div
                className="ohx-card"
                role="alert"
                style={{ marginTop: 24, padding: 24 }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>
                  We couldn't load your assignments.
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
                <button
                  type="button"
                  className="ohx-btn ohx-btn--primary"
                  onClick={() => load()}
                >
                  Try again
                </button>
              </div>
            )}

            {status === "ready" && (
              <div
                id="judging-panel"
                role="tabpanel"
                aria-labelledby={`tab-${ROUNDS[activeTab]}`}
              >
                {renderRound(ROUNDS[activeTab])}
              </div>
            )}
          </section>
        </RefinedRoot>

        <Dialog
          open={Boolean(video)}
          onClose={() => setVideo(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pr: 6 }}>
            {video?.title ? `Demo — ${video.title}` : "Demo video"}
            <IconButton
              aria-label="Close"
              onClick={() => setVideo(null)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {video?.url && <VideoDisplay url={video.url} title="" />}
          </DialogContent>
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

export default HackathonJudgePage;
