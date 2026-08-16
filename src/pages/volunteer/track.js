import { FONT_BODY } from "../../styles/fonts";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { withAuthInfo } from "@propelauth/react";
import FunVolunteerTimer from "../../components/FunVolunteerTimer/FunVolunteerTimer";
import VolunteerStatsTable from "../../components/VolunteerStatsTable/VolunteerStatsTable";
import {
  RefinedRoot,
  Eyebrow,
  Stat,
  Arrow,
} from "../../components/design/refined";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
  loading: () => null,
});
const LoginOrRegister = dynamic(
  () => import("../../components/LoginOrRegister/LoginOrRegister2"),
  { ssr: false },
);

const SESSION_KEY = "volunteeringSession";
const LEGACY_KEY = "volunteeringState";

const REASON_OPTIONS = [
  { value: "mentoring", label: "Mentoring" },
  { value: "event_organization", label: "Event organization" },
  { value: "judging", label: "Judging" },
  { value: "coding", label: "Coding (we also track this via GitHub commits)" },
  { value: "other", label: "Other" },
];

const COMMITMENT_OPTIONS = Array.from({ length: 49 }, (_, i) => i * 0.5 + 0.5);

const round2 = (n) => (isNaN(n) ? 0 : parseFloat(Number(n).toFixed(2)));

const toYMD = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Refined native form-control styles (avoid MUI's blue inside the calm scope).
const fieldStyle = {
  width: "100%",
  padding: "0.7em 0.85em",
  fontSize: "1rem",
  fontFamily: "var(--body)",
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--muted)",
  marginBottom: 6,
};

const PHOTOS = [
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
  "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
  "https://cdn.ohack.dev/ohack.dev/icon-of-hearts-surrounding-a-technological-cyberpunk-heart-supernova-in-space-.jpeg",
  "https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp",
];

export async function getStaticProps() {
  return {
    props: {
      metaTitle: "Volunteer Tracking & Time Management - Opportunity Hack",
      metaDescription:
        "Comprehensive volunteer tracking platform for managing volunteer hours, tracking community service, and measuring social impact. Perfect for nonprofits and volunteers.",
      metaKeywords:
        "volunteer tracking, volunteer time tracking, volunteer hours tracker, volunteer management, community service tracking, nonprofit volunteer tracking, volunteer hour management, volunteer time management system",
      ogImage: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
      canonicalUrl: "https://www.ohack.dev/volunteer/track",
    },
  };
}

const VolunteerTrackingPage = withAuthInfo(
  ({
    isLoggedIn,
    accessToken,
    metaTitle,
    metaDescription,
    metaKeywords,
    ogImage,
    canonicalUrl,
  }) => {
    // --- Live session (wall-clock based; persisted so it survives refresh) ---
    const [session, setSession] = useState(null); // { startEpoch, commitmentHours, reason }
    const [nowTs, setNowTs] = useState(() => Date.now());
    const endingRef = useRef(false);

    // --- Start-a-session form ---
    const [commitmentHours, setCommitmentHours] = useState(3);
    const [reason, setReason] = useState("mentoring");

    // --- Manual log form ---
    const [manualDate, setManualDate] = useState(() => toYMD(new Date()));
    const [manualHours, setManualHours] = useState(1);
    const [manualReason, setManualReason] = useState("mentoring");

    // --- Stats ---
    const [totalActiveHours, setTotalActiveHours] = useState(0);
    const [totalCommitmentHours, setTotalCommitmentHours] = useState(0);
    const [volunteerStats, setVolunteerStats] = useState([]);
    const [startDate, setStartDate] = useState(() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      return toYMD(d);
    });
    const [endDate, setEndDate] = useState(() => toYMD(new Date()));

    // --- UI state ---
    const [statsLoading, setStatsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [toast, setToast] = useState(null); // { message, severity }

    const isVolunteering = Boolean(session);
    const totalSeconds = (session?.commitmentHours || 0) * 3600;
    const rawElapsed = session
      ? Math.floor((nowTs - session.startEpoch) / 1000)
      : 0;
    const elapsed = Math.min(totalSeconds, Math.max(0, rawElapsed));
    const timeLeft = Math.max(0, totalSeconds - elapsed);

    const notify = useCallback((message, severity = "success") => {
      setToast({ message, severity });
    }, []);

    const triggerConfetti = () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    };

    // --- Data fetch ---
    const fetchVolunteerData = useCallback(
      async (rangeStart, rangeEnd) => {
        if (!isLoggedIn || !accessToken) return;
        const from = typeof rangeStart === "string" ? rangeStart : startDate;
        const to = typeof rangeEnd === "string" ? rangeEnd : endDate;
        setStatsLoading(true);
        setLoadError("");
        try {
          const startISO = new Date(`${from}T00:00:00`).toISOString();
          const endISO = new Date(`${to}T23:59:59.999`).toISOString();
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering?startDate=${startISO}&endDate=${endISO}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          if (!res.ok) throw new Error(`Server responded with ${res.status}`);
          const data = await res.json();
          setTotalActiveHours(data.totalActiveHours || 0);
          setTotalCommitmentHours(data.totalCommitmentHours || 0);
          setVolunteerStats(data.allVolunteering || []);
        } catch (err) {
          console.error("Error fetching volunteer data:", err);
          setLoadError(
            "We couldn't load your volunteer data just now. Please try again.",
          );
        } finally {
          setStatsLoading(false);
        }
      },
      [isLoggedIn, accessToken, startDate, endDate],
    );

    // --- Init: pixel, restore session, initial fetch (once) ---
    // (Fonts load globally via next/font in _document.js — the old per-page
    // Google Fonts DOM injection is gone.)
    useEffect(() => {
      initFacebookPixel();
    }, []);

    const didInit = useRef(false);
    useEffect(() => {
      if (!isLoggedIn || !accessToken || didInit.current) return;
      didInit.current = true;
      // Restore an in-progress session (wall-clock, so elapsed is recomputed).
      try {
        localStorage.removeItem(LEGACY_KEY);
        const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (saved && saved.startEpoch && saved.commitmentHours) {
          endingRef.current = false;
          setSession(saved);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
      fetchVolunteerData();
    }, [isLoggedIn, accessToken, fetchVolunteerData]);

    // --- 1s tick while volunteering (wall-clock; accurate across bg tabs) ---
    useEffect(() => {
      if (!isVolunteering) return undefined;
      const id = setInterval(() => setNowTs(Date.now()), 1000);
      return () => clearInterval(id);
    }, [isVolunteering]);

    // --- Rotate the encouragement photo during a session ---
    useEffect(() => {
      if (!isVolunteering) return undefined;
      const id = setInterval(
        () => setPhotoIndex((i) => (i + 1) % PHOTOS.length),
        60000,
      );
      return () => clearInterval(id);
    }, [isVolunteering]);

    const endVolunteering = useCallback(async () => {
      if (!session || endingRef.current) return;
      endingRef.current = true;
      setActionLoading(true);
      const sec = Math.min(
        session.commitmentHours * 3600,
        Math.max(0, Math.floor((Date.now() - session.startEpoch) / 1000)),
      );
      const finalHours = round2(sec / 3600);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ finalHours, reason: session.reason }),
          },
        );
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        trackEvent("volunteering_end", { finalHours, reason: session.reason });
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        triggerConfetti();
        notify(
          `Logged ${finalHours} ${finalHours === 1 ? "hour" : "hours"} — thank you!`,
        );
        await fetchVolunteerData();
      } catch (err) {
        console.error("Error ending session:", err);
        endingRef.current = false; // allow retry
        notify("Couldn't save your session. Please try ending again.", "error");
      } finally {
        setActionLoading(false);
      }
    }, [session, accessToken, fetchVolunteerData, notify]);

    // --- Auto-finalize when the committed time is reached ---
    useEffect(() => {
      if (isVolunteering && timeLeft <= 0 && !endingRef.current) {
        endVolunteering();
      }
    }, [isVolunteering, timeLeft, endVolunteering]);

    const startVolunteering = async () => {
      if (!reason) {
        notify("Please pick a reason for volunteering.", "error");
        return;
      }
      setActionLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ commitmentHours, reason }),
          },
        );
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const newSession = { startEpoch: Date.now(), commitmentHours, reason };
        endingRef.current = false;
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setNowTs(Date.now());
        setSession(newSession);
        trackEvent("volunteering_start", { commitmentHours, reason });
        notify("Your volunteering session has started. Go make an impact!");
        await fetchVolunteerData();
      } catch (err) {
        console.error("Error starting session:", err);
        notify("Couldn't start your session. Please try again.", "error");
      } finally {
        setActionLoading(false);
      }
    };

    const logManualTime = async () => {
      const hours = Number(manualHours);
      if (!hours || hours <= 0) {
        notify("Enter how many hours you volunteered.", "error");
        return;
      }
      if (!manualReason) {
        notify("Pick a reason for the time you're logging.", "error");
        return;
      }
      const when = new Date(`${manualDate}T12:00:00`);
      if (isNaN(when.getTime())) {
        notify("That date doesn't look right.", "error");
        return;
      }
      if (when.getTime() > Date.now() + 24 * 3600 * 1000) {
        notify("You can't log time in the future.", "error");
        return;
      }
      setActionLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              commitmentHours: hours,
              finalHours: hours,
              reason: manualReason,
              manual: true,
              timestamp: when.toISOString(),
            }),
          },
        );
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        trackEvent("volunteering_manual_log", { hours, reason: manualReason });
        notify(
          `Logged ${round2(hours)} ${hours === 1 ? "hour" : "hours"} for ${moment(manualDate).format("MMM D")}.`,
        );
        // Make sure the new entry is in the visible range, then refresh with the
        // widened range explicitly (state updates are async this tick).
        const newStart = manualDate < startDate ? manualDate : startDate;
        const newEnd = manualDate > endDate ? manualDate : endDate;
        if (newStart !== startDate) setStartDate(newStart);
        if (newEnd !== endDate) setEndDate(newEnd);
        await fetchVolunteerData(newStart, newEnd);
      } catch (err) {
        console.error("Error logging manual time:", err);
        notify("Couldn't log that time. Please try again.", "error");
      } finally {
        setActionLoading(false);
      }
    };

    const chartData = volunteerStats
      .slice()
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      .map((s) => ({
        label: moment.utc(s.timestamp).local().format("MMM D"),
        Committed: round2(s.commitmentHours || 0),
        Tracked: round2(s.finalHours || 0),
      }));

    return (
      <>
        <Head>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta name="keywords" content={metaKeywords} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:site_name" content="Opportunity Hack" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={ogImage} />
          <meta name="robots" content="index, follow" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Volunteer Tracking Platform",
                description: metaDescription,
                url: canonicalUrl,
                applicationCategory: "VolunteerManagement",
                operatingSystem: "Web",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                provider: { "@type": "Organization", name: "Opportunity Hack" },
              }),
            }}
          />
        </Head>

        {showConfetti && <Confetti recycle={false} numberOfPieces={220} />}

        <RefinedRoot>
          {/* HERO */}
          <section
            className="ohx-wrap ohx-narrow"
            style={{
              paddingTop: "clamp(104px, 13vh, 150px)",
              paddingBottom: "clamp(20px, 4vh, 36px)",
            }}
          >
            <Eyebrow>
              <span className="rise" style={{ display: "inline-block" }}>
                Volunteer tracking
              </span>
            </Eyebrow>
            <h1
              className="ohx-display rise"
              style={{ marginTop: 16, animationDelay: "60ms" }}
            >
              Track your time <span className="ohx-italic">for good.</span>
            </h1>
            <p
              className="ohx-lead rise"
              style={{
                marginTop: 20,
                animationDelay: "150ms",
                maxWidth: "58ch",
              }}
            >
              Record the hours you commit and the time you actually volunteer
              with Opportunity Hack — build a verified record for school, work,
              and your own milestones.
            </p>
            {isLoggedIn && (
              <>
                <hr
                  className="ohx-rule rise"
                  style={{ marginTop: 36, animationDelay: "280ms" }}
                />
                <div
                  className="rise"
                  style={{
                    marginTop: 24,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "clamp(28px, 6vw, 72px)",
                    animationDelay: "340ms",
                  }}
                >
                  <Stat
                    value={`${round2(totalCommitmentHours)}h`}
                    label="Committed (range)"
                  />
                  <Stat
                    value={`${round2(totalActiveHours)}h`}
                    label="Tracked (range)"
                  />
                </div>
              </>
            )}
          </section>

          {!isLoggedIn ? (
            <section
              className="ohx-wrap ohx-narrow"
              style={{ paddingBottom: "clamp(48px, 8vh, 96px)" }}
            >
              <div
                className="ohx-card"
                style={{ padding: "clamp(24px, 4vw, 40px)" }}
              >
                <h2
                  className="ohx-display"
                  style={{ fontSize: "1.4rem", marginBottom: 6 }}
                >
                  Log in to track your hours
                </h2>
                <p
                  className="ohx-muted"
                  style={{ marginTop: 0, marginBottom: 20 }}
                >
                  Sign in with Slack or Google to start a session and see your
                  volunteering history.
                </p>
                <LoginOrRegister
                  introText="Ready to track your volunteer hours?"
                  previousPage="/volunteer/track"
                />
              </div>
            </section>
          ) : (
            <>
              {/* LIVE SESSION */}
              {isVolunteering && (
                <section
                  className="ohx-wrap ohx-narrow"
                  style={{ paddingBottom: "clamp(20px, 4vh, 36px)" }}
                >
                  <div
                    className="ohx-card"
                    style={{
                      padding: "clamp(24px, 4vw, 40px)",
                      textAlign: "center",
                      borderColor: "var(--brand)",
                    }}
                  >
                    <Eyebrow>Session in progress</Eyebrow>
                    <p
                      className="ohx-muted"
                      style={{ marginTop: 6, marginBottom: 4 }}
                    >
                      {round2(session.commitmentHours)}h committed ·{" "}
                      {REASON_OPTIONS.find((r) => r.value === session.reason)
                        ?.label || session.reason}
                    </p>
                    <FunVolunteerTimer
                      timeLeft={timeLeft}
                      totalTime={totalSeconds}
                    />
                    <div style={{ marginTop: 20 }}>
                      <button
                        type="button"
                        className="ohx-btn ohx-btn--primary"
                        onClick={endVolunteering}
                        disabled={actionLoading}
                        aria-label="End volunteering session"
                        style={{ opacity: actionLoading ? 0.7 : 1 }}
                      >
                        {actionLoading ? "Saving…" : "End & log this session"}
                      </button>
                    </div>
                    <div
                      style={{
                        marginTop: 24,
                        position: "relative",
                        width: "100%",
                        maxWidth: 360,
                        aspectRatio: "16 / 10",
                        margin: "24px auto 0",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid var(--line)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={PHOTOS[photoIndex]}
                        alt="Opportunity Hack volunteers"
                        width="360"
                        height="225"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* START + MANUAL LOG (hidden during a live session) */}
              {!isVolunteering && (
                <section
                  className="ohx-wrap ohx-narrow"
                  style={{ paddingBottom: "clamp(20px, 4vh, 36px)" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 20,
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                    }}
                  >
                    {/* Start a live session */}
                    <div
                      className="ohx-card"
                      style={{ padding: "clamp(20px, 3vw, 28px)" }}
                    >
                      <h2
                        className="ohx-display"
                        style={{
                          fontSize: "1.25rem",
                          marginTop: 0,
                          marginBottom: 4,
                        }}
                      >
                        Start a live session
                      </h2>
                      <p
                        className="ohx-faint"
                        style={{
                          marginTop: 0,
                          marginBottom: 18,
                          fontSize: "0.85rem",
                        }}
                      >
                        A timer tracks your actual time. It keeps counting if
                        you switch tabs or refresh.
                      </p>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle} htmlFor="commit-hours">
                          Commitment
                        </label>
                        <select
                          id="commit-hours"
                          style={fieldStyle}
                          value={commitmentHours}
                          onChange={(e) =>
                            setCommitmentHours(Number(e.target.value))
                          }
                        >
                          {COMMITMENT_OPTIONS.map((h) => (
                            <option key={h} value={h}>
                              {h} {h === 1 ? "hour" : "hours"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={labelStyle} htmlFor="reason">
                          Reason
                        </label>
                        <select
                          id="reason"
                          style={fieldStyle}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        >
                          {REASON_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="ohx-btn ohx-btn--primary"
                        onClick={startVolunteering}
                        disabled={actionLoading}
                        aria-label="Start volunteering session"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        {actionLoading ? "Starting…" : "Start volunteering"}
                      </button>
                    </div>

                    {/* Log past time */}
                    <div
                      className="ohx-card"
                      style={{ padding: "clamp(20px, 3vw, 28px)" }}
                    >
                      <h2
                        className="ohx-display"
                        style={{
                          fontSize: "1.25rem",
                          marginTop: 0,
                          marginBottom: 4,
                        }}
                      >
                        Log time you already did
                      </h2>
                      <p
                        className="ohx-faint"
                        style={{
                          marginTop: 0,
                          marginBottom: 18,
                          fontSize: "0.85rem",
                        }}
                      >
                        Volunteered away from your computer? Add it here so your
                        record stays accurate.
                      </p>
                      <div
                        style={{ display: "flex", gap: 12, marginBottom: 14 }}
                      >
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle} htmlFor="manual-date">
                            Date
                          </label>
                          <input
                            id="manual-date"
                            type="date"
                            style={fieldStyle}
                            value={manualDate}
                            max={toYMD(new Date())}
                            onChange={(e) => setManualDate(e.target.value)}
                          />
                        </div>
                        <div style={{ width: 120 }}>
                          <label style={labelStyle} htmlFor="manual-hours">
                            Hours
                          </label>
                          <select
                            id="manual-hours"
                            style={fieldStyle}
                            value={manualHours}
                            onChange={(e) =>
                              setManualHours(Number(e.target.value))
                            }
                          >
                            {COMMITMENT_OPTIONS.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={labelStyle} htmlFor="manual-reason">
                          Reason
                        </label>
                        <select
                          id="manual-reason"
                          style={fieldStyle}
                          value={manualReason}
                          onChange={(e) => setManualReason(e.target.value)}
                        >
                          {REASON_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="ohx-btn ohx-btn--ghost"
                        onClick={logManualTime}
                        disabled={actionLoading}
                        aria-label="Log past volunteer time"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        {actionLoading ? "Logging…" : "Log this time"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* STATISTICS */}
              <section
                id="statistics"
                style={{
                  background: "var(--surface-2)",
                  borderTop: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  className="ohx-wrap ohx-narrow"
                  style={{
                    paddingTop: "clamp(40px, 6vh, 64px)",
                    paddingBottom: "clamp(40px, 6vh, 64px)",
                  }}
                >
                  <Eyebrow>Your record</Eyebrow>
                  <h2
                    className="ohx-display"
                    style={{ marginTop: 8, marginBottom: 6 }}
                  >
                    Volunteering statistics
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "clamp(28px, 6vw, 64px)",
                      margin: "18px 0 28px",
                    }}
                  >
                    <Stat
                      value={`${round2(totalCommitmentHours)}h`}
                      label="Total committed"
                    />
                    <Stat
                      value={`${round2(totalActiveHours)}h`}
                      label="Total tracked"
                    />
                    <Stat
                      value={volunteerStats.length}
                      label="Entries in range"
                    />
                  </div>

                  {/* Date range */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ flex: "1 1 150px" }}>
                      <label style={labelStyle} htmlFor="start-date">
                        From
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        style={fieldStyle}
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: "1 1 150px" }}>
                      <label style={labelStyle} htmlFor="end-date">
                        To
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        style={fieldStyle}
                        value={endDate}
                        min={startDate}
                        max={toYMD(new Date())}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="ohx-btn ohx-btn--ghost"
                      onClick={() => fetchVolunteerData()}
                      disabled={statsLoading}
                      aria-label="Fetch volunteer report"
                      style={{
                        flex: "0 0 auto",
                        opacity: statsLoading ? 0.7 : 1,
                      }}
                    >
                      {statsLoading ? "Loading…" : "Fetch report"}
                    </button>
                  </div>

                  {loadError && (
                    <div
                      role="alert"
                      style={{
                        marginTop: 18,
                        padding: "12px 16px",
                        borderRadius: 6,
                        background: "var(--accent-soft)",
                        border: "1px solid #f3d3c7",
                        color: "#b23a18",
                        fontSize: "0.9rem",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{loadError}</span>
                      <button
                        type="button"
                        className="ohx-link"
                        onClick={() => fetchVolunteerData()}
                        style={{ fontSize: "0.85rem" }}
                      >
                        Retry <Arrow />
                      </button>
                    </div>
                  )}

                  {chartData.length > 0 ? (
                    <>
                      <div style={{ height: 300, marginTop: 24 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{ top: 16, right: 8, left: -12, bottom: 4 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E7E1D4"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 12, fill: "#5B6270" }}
                              stroke="#E7E1D4"
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: "#5B6270" }}
                              stroke="#E7E1D4"
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 8,
                                border: "1px solid #E7E1D4",
                                fontSize: 13,
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: 13 }} />
                            <Bar
                              dataKey="Committed"
                              fill="#1B3A6B"
                              radius={[3, 3, 0, 0]}
                            />
                            <Bar
                              dataKey="Tracked"
                              fill="#E2552E"
                              radius={[3, 3, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p
                        className="ohx-faint"
                        style={{ marginTop: 8, fontSize: "0.82rem" }}
                      >
                        <strong style={{ color: "var(--brand)" }}>
                          Committed
                        </strong>{" "}
                        is time you set out to give;{" "}
                        <strong style={{ color: "var(--accent)" }}>
                          tracked
                        </strong>{" "}
                        is the time actually recorded.
                      </p>
                      <VolunteerStatsTable volunteerStats={volunteerStats} />
                    </>
                  ) : (
                    !statsLoading &&
                    !loadError && (
                      <div
                        className="ohx-card"
                        style={{
                          marginTop: 24,
                          padding: "28px 24px",
                          background: "var(--surface)",
                        }}
                      >
                        <p className="ohx-muted" style={{ margin: 0 }}>
                          No volunteering logged in this range yet. Start a live
                          session or log time you already did above — your hours
                          will show up here.
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* WHY TRACK (SEO + context) */}
              <section
                className="ohx-wrap ohx-narrow"
                style={{
                  paddingTop: "clamp(40px, 6vh, 64px)",
                  paddingBottom: "clamp(48px, 8vh, 88px)",
                }}
              >
                <Eyebrow>Why track volunteer hours?</Eyebrow>
                <h2
                  className="ohx-display"
                  style={{ marginTop: 8, marginBottom: 18 }}
                >
                  A verified record of your impact
                </h2>
                <div
                  style={{
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  }}
                >
                  {[
                    [
                      "Impact measurement",
                      "Quantify your contributions to community service and social causes.",
                    ],
                    [
                      "Professional recognition",
                      "Build a verified record of volunteer work for resumes and applications.",
                    ],
                    [
                      "Nonprofit support",
                      "Help organizations understand volunteer engagement and program reach.",
                    ],
                    [
                      "Personal growth",
                      "Watch your volunteer journey add up and celebrate the milestones.",
                    ],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="ohx-card"
                      style={{ padding: "20px 22px" }}
                    >
                      <h3
                        className="ohx-display"
                        style={{
                          fontSize: "1.05rem",
                          marginTop: 0,
                          marginBottom: 6,
                        }}
                      >
                        {title}
                      </h3>
                      <p
                        className="ohx-muted"
                        style={{ margin: 0, fontSize: "0.92rem" }}
                      >
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="ohx-muted" style={{ marginTop: 24 }}>
                  For coding contributions, we also track time through GitHub
                  commits. Learn about our{" "}
                  <Link href="/cert" className="ohx-link">
                    volunteer certification process
                  </Link>
                  .
                </p>
                <p
                  className="ohx-faint"
                  style={{ marginTop: 8, fontSize: "0.88rem" }}
                >
                  This platform is open source.{" "}
                  <a
                    href="https://github.com/opportunity-hack/frontend-ohack.dev/blob/main/src/pages/volunteer/track.js"
                    className="ohx-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View the source <Arrow />
                  </a>
                </p>
              </section>
            </>
          )}
        </RefinedRoot>

        {/* Toast */}
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </>
    );
  },
);

// Lightweight on-theme toast (auto-dismiss). Avoids pulling in MUI Snackbar.
function Toast({ toast, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [toast, onClose]);
  const isError = toast.severity === "error";
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 1400,
        maxWidth: "92vw",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 8,
        fontFamily: FONT_BODY,
        fontSize: "0.92rem",
        color: "#fff",
        background: isError ? "#b23a18" : "#1B3A6B",
        boxShadow: "0 14px 40px -16px rgba(22,24,29,0.5)",
      }}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: 0,
          color: "#fff",
          fontSize: "1.1rem",
          cursor: "pointer",
          lineHeight: 1,
          opacity: 0.85,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default VolunteerTrackingPage;
