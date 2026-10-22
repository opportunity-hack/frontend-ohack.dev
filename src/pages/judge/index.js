import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ThemeProvider } from "@mui/material/styles";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import judgeApi from "../../lib/judgeApi";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { RefinedRoot, Eyebrow } from "../../components/design/refined";
import {
  judgeTheme,
  judgeSectionStyle,
} from "../../components/Judge/judgeTheme";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const pct = (completed, total) =>
  total > 0 ? Math.round((completed / total) * 100) : 0;

// Module scope — a thin navy progress rail (no colored chips).
const RoundProgress = ({ label, completed, total }) => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13.5,
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span
        style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}
      >
        {total === 0 ? "No teams yet" : `${completed} of ${total} scored`}
      </span>
    </div>
    <div
      role="progressbar"
      aria-label={`${label} progress`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct(completed, total)}
      style={{
        height: 6,
        background: "var(--surface-2)",
        borderRadius: 3,
        marginTop: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct(completed, total)}%`,
          height: "100%",
          background: "var(--brand)",
          transition: "width .3s ease",
        }}
      />
    </div>
  </div>
);

const HackathonCard = ({ hackathon, onOpen }) => {
  const r1 = hackathon.judging_status?.round1 || { completed: 0, total: 0 };
  const r2 = hackathon.judging_status?.round2 || { completed: 0, total: 0 };
  const allDone =
    r1.total + r2.total > 0 &&
    r1.completed >= r1.total &&
    r2.completed >= r2.total;
  return (
    <article
      className="ohx-card"
      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        <span className={`ohx-tag${allDone ? "" : " ohx-tag--accent"}`}>
          {allDone ? "Judging complete" : "In progress"}
        </span>
        {(hackathon.start_date || hackathon.end_date) && (
          <span className="ohx-tag">
            {formatDate(hackathon.start_date)}
            {hackathon.end_date ? ` – ${formatDate(hackathon.end_date)}` : ""}
          </span>
        )}
      </div>
      <h2 className="ohx-display" style={{ fontSize: 24, lineHeight: 1.15 }}>
        {hackathon.title || hackathon.event_id}
      </h2>
      <RoundProgress
        label="Round 1 · find the top teams"
        completed={r1.completed}
        total={r1.total}
      />
      <RoundProgress
        label="Round 2 · rank the finalists"
        completed={r2.completed}
        total={r2.total}
      />
      <div style={{ marginTop: 4 }}>
        <Link
          href={`/judge/${encodeURIComponent(hackathon.event_id)}`}
          className="ohx-btn ohx-btn--primary"
          onClick={() => onOpen(hackathon)}
        >
          {allDone ? "Review your scores" : "Open judging"}
        </Link>
      </div>
    </article>
  );
};

const JudgeDashboard = withRequiredAuthInfo(() => {
  const { accessToken, user } = useAuthInfo();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [assignments, setAssignments] = useState([]);

  const tokenRef = useRef(accessToken);
  const userIdRef = useRef(user?.userId);
  tokenRef.current = accessToken;
  userIdRef.current = user?.userId;

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const load = useCallback(async () => {
    if (!tokenRef.current || !userIdRef.current) return;
    setStatus("loading");
    try {
      const data = await judgeApi.getJudgeAssignments(
        userIdRef.current,
        tokenRef.current,
      );
      setAssignments(data?.hackathons || []);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err?.message || "Couldn't load your judging assignments");
      setStatus("error");
    }
  }, []);

  const hasToken = Boolean(accessToken);
  const hasUser = Boolean(user?.userId);
  useEffect(() => {
    if (hasToken && hasUser) load();
  }, [hasToken, hasUser, load]);

  const onOpen = (hackathon) => {
    trackEvent({
      action: "judge_dash_start",
      params: { event_label: hackathon.event_id, page: "judge_dashboard" },
    });
  };

  return (
    <>
      <Head>
        <title>
          Judge Dashboard - Evaluate Hackathon Projects | Opportunity Hack
        </title>
        <meta
          name="description"
          content="Access your judge assignments and evaluate innovative nonprofit technology solutions. Complete dashboard tutorial available to guide you through Round 1 and Round 2 judging."
        />
        <meta name="robots" content="noindex, follow" />
        <meta
          property="og:title"
          content="Judge Dashboard - Evaluate Hackathon Projects | Opportunity Hack"
        />
        <meta
          property="og:description"
          content="Access your judge assignments and evaluate innovative nonprofit technology solutions."
        />
        <meta property="og:url" content="https://www.ohack.dev/judge" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Judge Dashboard - Evaluate Hackathon Projects | Opportunity Hack"
        />
        <meta
          name="twitter:image"
          content="https://cdn.ohack.dev/ohack.dev/judge_1.jpg"
        />
      </Head>

      <ThemeProvider theme={judgeTheme}>
        <RefinedRoot>
          <section className="ohx-wrap" style={judgeSectionStyle}>
            <header>
              <Eyebrow>Judge dashboard</Eyebrow>
              <h1 className="ohx-display" style={{ marginTop: 8 }}>
                Welcome{user?.firstName ? `, ${user.firstName}` : ""}.{" "}
                <span className="ohx-italic">Your judging assignments.</span>
              </h1>
              <p
                className="ohx-lead"
                style={{ marginTop: 12, maxWidth: "58ch" }}
              >
                Each hackathon you're judging is listed below with your progress
                in both rounds. Open one to score your assigned teams.
              </p>
            </header>

            <div style={{ marginTop: 28, minHeight: 200 }}>
              {status === "loading" && (
                <div
                  aria-busy="true"
                  aria-label="Loading assignments"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
                    gap: 20,
                  }}
                >
                  <div className="ohx-card" style={{ minHeight: 260 }} />
                  <div className="ohx-card" style={{ minHeight: 260 }} />
                </div>
              )}

              {status === "error" && (
                <div className="ohx-card" role="alert" style={{ padding: 24 }}>
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

              {status === "ready" && assignments.length === 0 && (
                <div className="ohx-card" style={{ padding: 24 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
                    No judging assignments yet
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 14.5,
                      color: "var(--muted)",
                      maxWidth: "60ch",
                    }}
                  >
                    Organizers assign judges to teams shortly before judging
                    starts. If you've been approved as a judge and expected an
                    event here, ask in the judges channel on Slack.
                  </p>
                </div>
              )}

              {status === "ready" && assignments.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
                    gap: 20,
                  }}
                >
                  {assignments.map((h) => (
                    <HackathonCard
                      key={h.event_id}
                      hackathon={h}
                      onOpen={onOpen}
                    />
                  ))}
                </div>
              )}
            </div>

            <div
              className="ohx-card"
              style={{
                marginTop: 40,
                padding: "26px 28px",
                background: "var(--brand)",
                color: "#fff",
                borderColor: "var(--brand)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
              }}
            >
              <div style={{ maxWidth: "56ch" }}>
                <p
                  className="ohx-eyebrow"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  New to the judge dashboard?
                </p>
                <h2
                  className="ohx-display"
                  style={{ fontSize: 24, marginTop: 8, color: "#fff" }}
                >
                  A five-minute tutorial covers both rounds.
                </h2>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14.5,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.55,
                  }}
                >
                  See how to navigate the dashboard, evaluate projects in Round
                  1 and Round 2, and write feedback teams can act on.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/judge/overview"
                  className="ohx-btn"
                  style={{ background: "#fff", color: "var(--brand)" }}
                >
                  Watch the tutorial
                </Link>
                <Link
                  href="/about/judges#judging-criteria"
                  className="ohx-btn ohx-btn--ghost"
                  style={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                >
                  Scoring criteria
                </Link>
              </div>
            </div>

            <section
              style={{ marginTop: 36, maxWidth: "70ch" }}
              aria-labelledby="quick-ref"
            >
              <Eyebrow>Quick reference</Eyebrow>
              <h2
                id="quick-ref"
                className="ohx-display"
                style={{ fontSize: 22, marginTop: 8 }}
              >
                How judging works
              </h2>
              <ol
                style={{
                  margin: "12px 0 0",
                  paddingLeft: 20,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "var(--ink)",
                }}
              >
                <li>
                  <strong>Round 1 — find the top teams.</strong> Watch each
                  team's demo video and look through their GitHub repository,
                  then score the four criteria.
                </li>
                <li>
                  <strong>Round 2 — rank the finalists.</strong> Finalists demo
                  live and answer questions; you score them again with fresh
                  information.
                </li>
              </ol>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 14.5,
                  color: "var(--muted)",
                }}
              >
                Every project is scored on Scope, Documentation, Polish and
                Security, 1–5 per criterion, 40 points in total. Accessibility
                is a separate special-category prize.
              </p>
            </section>
          </section>
        </RefinedRoot>
      </ThemeProvider>
    </>
  );
});

export default JudgeDashboard;
