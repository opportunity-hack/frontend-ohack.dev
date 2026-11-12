import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import axios from "axios";
import { useEnv } from "../../../context/env.context";
import LoginOrRegister from "../../../components/LoginOrRegister/LoginOrRegister2";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import SlackIcon from "@mui/icons-material/Chat";
import InfoIcon from "@mui/icons-material/Info";
import { RefinedRoot, Eyebrow } from "../../../components/design/refined";
import TeamBreadcrumbs from "../../../components/Teams/TeamBreadcrumbs";
import MentorTeamsTable from "../../../components/Mentor/MentorTeamsTable";
import SurveyCTA from "../../../components/Survey/SurveyCTA";
import useMentorCheckin from "../../../hooks/use-mentor-checkin";
import {
  effectiveWindowState,
  isCheckinRefusal,
  relativeOpening,
} from "../../../lib/mentorCheckinGate";
import {
  parseAvailabilitySlots,
  findCurrentSlot,
  isDateInThePast,
} from "../../../lib/mentorAvailabilitySlots";
import { applicationState } from "../../../lib/mentorEvents";
import { formatDeadlineMoment } from "../../../lib/timezoneUtils";
import { isHackathonExpired } from "../../../lib/dateUtils";
import { KEY_CHANNELS, slackChannelUrl } from "../../../lib/slackLinks";
import { trackEvent } from "../../../lib/ga";

// The clock that drives the check-in window + "current shift" highlight.
// Null until mount so nothing time-dependent renders during SSR (hydration).
const CLOCK_TICK_MS = 30000;

const displaySx = { mt: 1.5, mb: 2, fontSize: "clamp(2.2rem, 5vw, 3.4rem)" };
const panelHeadingSx = {
  fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)",
  color: "var(--ink)",
  m: 0,
  mb: 1.25,
};
const panelBodySx = {
  color: "var(--muted)",
  maxWidth: "62ch",
  lineHeight: 1.6,
  mb: 2.5,
};
const actionRowSx = {
  display: "flex",
  gap: 1.5,
  flexWrap: "wrap",
  alignItems: "center",
};

function formatEventDay(iso, timezone) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      timeZone: timezone || "America/Phoenix",
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "";
  }
}

// ---- Refined shell for the simple gate states (module scope: a component
// defined inside the page was a new type every render and remounted its
// children). <Head> renders in every branch. ----
function Shell({ head, children, maxWidth = 1200 }) {
  return (
    <RefinedRoot>
      <Head>
        <title>{head.title}</title>
        <meta name="description" content={head.description} />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={head.canonical} />
      </Head>
      <Box
        className="ohx-wrap"
        sx={{ maxWidth, pt: "clamp(96px, 12vh, 150px)", pb: { xs: 8, md: 12 } }}
      >
        {children}
      </Box>
    </RefinedRoot>
  );
}

function GateMasthead({ eventId, eventName, eyebrow = "Mentors" }) {
  return (
    <>
      {eventName && (
        <TeamBreadcrumbs
          items={[{ name: eventName, href: `/hack/${eventId}` }]}
          current="Mentor check-in"
        />
      )}
      <Eyebrow>{eyebrow}</Eyebrow>
      <Box component="h1" className="ohx-display" sx={displaySx}>
        Mentor check-in
      </Box>
    </>
  );
}

function LoadingPanel() {
  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        minHeight: "40vh",
      }}
    >
      <CircularProgress sx={{ color: "var(--brand)" }} />
      <Box sx={{ color: "var(--muted)" }}>Loading mentor check-in…</Box>
    </Box>
  );
}

function ErrorPanel({ onRetry }) {
  return (
    <Box
      className="ohx-card"
      role="alert"
      sx={{
        p: { xs: 2.5, md: 3 },
        borderLeft: "3px solid var(--accent)",
      }}
    >
      <Box component="h2" className="ohx-display" sx={panelHeadingSx}>
        We couldn&apos;t load your mentor details
      </Box>
      <Box sx={panelBodySx}>
        Something went wrong on our side — your application is safe. Give it
        another try in a moment.
      </Box>
      <Box sx={actionRowSx}>
        <Box
          component="button"
          type="button"
          onClick={onRetry}
          className="ohx-btn ohx-btn--primary"
        >
          Retry
        </Box>
        <NextLink href="/mentor" className="ohx-link">
          Your mentor dashboard →
        </NextLink>
      </Box>
    </Box>
  );
}

function PendingPanel({ eventId, waitlisted, slackSignupUrl }) {
  return (
    <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Box className="ohx-eyebrow" sx={{ mb: 1.25 }}>
        Application received
      </Box>
      <Box component="h2" className="ohx-display" sx={panelHeadingSx}>
        Your mentor application is awaiting confirmation
      </Box>
      <Box sx={panelBodySx}>
        {waitlisted
          ? "Thanks for offering your time. You're on the waitlist — we'll email you if a mentor spot opens up."
          : "Thanks for offering your time. We review mentor applications by hand, usually within about a week, and we'll email you as soon as you're confirmed. Check-in appears here once you are."}
      </Box>
      <Box sx={actionRowSx}>
        <NextLink
          href={`/hack/${eventId}/mentor-application`}
          className="ohx-btn ohx-btn--primary"
        >
          Review your application
        </NextLink>
        <NextLink href="/mentor" className="ohx-link">
          Your mentor dashboard
        </NextLink>
        {slackSignupUrl && (
          <a
            href={slackSignupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ohx-link"
          >
            Join us on Slack
          </a>
        )}
      </Box>
      <Box sx={{ mt: 2.5, fontSize: 14, color: "var(--faint)" }}>
        Just got your confirmation email? Refresh this page.
      </Box>
    </Box>
  );
}

function NotSelectedPanel({ eventId, eventName, eventOver }) {
  return (
    <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Box className="ohx-eyebrow" sx={{ mb: 1.25 }}>
        Mentoring · {eventName}
      </Box>
      <Box component="h2" className="ohx-display" sx={panelHeadingSx}>
        We couldn&apos;t offer you a mentor spot this time
      </Box>
      <Box sx={panelBodySx}>
        Thank you for applying — we had more mentors than spots for this event,
        and this isn&apos;t a reflection on you. We&apos;d still love your help:
      </Box>
      <Box sx={actionRowSx}>
        <NextLink href="/projects" className="ohx-btn ohx-btn--primary">
          Help on a year-round project
        </NextLink>
        {!eventOver && (
          <NextLink
            href={`/hack/${eventId}/volunteer-application`}
            className="ohx-btn ohx-btn--ghost"
          >
            Volunteer at this event
          </NextLink>
        )}
        <NextLink href="/hack" className="ohx-btn ohx-btn--ghost">
          See upcoming hackathons
        </NextLink>
      </Box>
      <Box sx={{ mt: 2.5, fontSize: 15 }}>
        <NextLink href="/contact" className="ohx-link">
          Questions? Contact us
        </NextLink>
      </Box>
    </Box>
  );
}

// State A — approved, event hasn't started. Sits in the check-in band's slot
// so nothing jumps when the button replaces it.
function UpcomingCheckinCard({ checkinWindow, timezone, firstSlot, now }) {
  const opensAt = checkinWindow?.opens_at;
  const day = formatEventDay(opensAt, timezone);
  const relative = now != null ? relativeOpening(opensAt, now) : null;
  const moment = opensAt ? formatDeadlineMoment(opensAt, timezone) : "";
  return (
    <Box
      className="ohx-card"
      data-testid="checkin-upcoming"
      sx={{
        p: { xs: 2.5, md: 3 },
        mb: { xs: 4, md: 5 },
        borderLeft: "3px solid var(--brand)",
      }}
    >
      <Box className="ohx-eyebrow" sx={{ mb: 1 }}>
        You&apos;re confirmed
      </Box>
      <Box component="h2" className="ohx-display" sx={panelHeadingSx}>
        {day ? `Check-in opens ${day}` : "Check-in opens when the event starts"}
        {relative ? (
          <Box component="span" sx={{ color: "var(--muted)" }}>
            {" "}
            · {relative}
          </Box>
        ) : null}
      </Box>
      <Box sx={{ ...panelBodySx, mb: 1.5 }}>
        You&apos;re all set — there&apos;s nothing to do until the event starts.
        Check-in opens at the start of day one so teams only see mentors who are
        available right now.
      </Box>
      {moment && (
        <Box sx={{ color: "var(--muted)", fontSize: 14.5, mb: 1 }}>
          Opens {moment}
        </Box>
      )}
      {firstSlot && (
        <Box sx={{ color: "var(--ink)", fontSize: 15, mb: 2 }}>
          Your first shift: {firstSlot.date}
          {firstSlot.time ? ` · ${firstSlot.time}` : ""}
        </Box>
      )}
      <Box sx={{ ...actionRowSx, mt: 1 }}>
        <Box sx={{ color: "var(--faint)", fontSize: 14, mr: 0.5 }}>
          While you wait:
        </Box>
        <NextLink href="/about/mentors/overview" className="ohx-link">
          Read the mentor guide
        </NextLink>
        <a
          href={slackChannelUrl(KEY_CHANNELS.askAMentor)}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link"
        >
          Join #ask-a-mentor
        </a>
        <a href="#teams" className="ohx-link">
          Meet the teams ↓
        </a>
      </Box>
    </Box>
  );
}

// State C — approved, event over, not checked in.
function EventCompleteCard({ eventId, eventName }) {
  return (
    <Box
      className="ohx-card"
      sx={{ p: { xs: 2.5, md: 3 }, mb: { xs: 4, md: 5 } }}
    >
      <Box className="ohx-eyebrow" sx={{ mb: 1 }}>
        Event complete
      </Box>
      <Box component="h2" className="ohx-display" sx={panelHeadingSx}>
        Thanks for mentoring {eventName}.
      </Box>
      <Box sx={actionRowSx}>
        <NextLink
          href={`/hack/${eventId}/results`}
          className="ohx-btn ohx-btn--primary"
        >
          See the results
        </NextLink>
        <NextLink href={`/hack/${eventId}/survey`} className="ohx-link">
          Share your feedback
        </NextLink>
      </Box>
    </Box>
  );
}

// Refined mentor profile card
function MentorProfileCard({ mentor }) {
  if (!mentor) return null;

  return (
    <Box className="ohx-card" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box className="ohx-eyebrow" sx={{ mb: 1.5 }}>
        Your profile
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
        <Box sx={{ fontWeight: 600, color: "var(--ink)" }}>{mentor.name}</Box>
        <Box sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          {mentor.email}
        </Box>
        {mentor.company && (
          <Box sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {mentor.company}
          </Box>
        )}
      </Box>

      {mentor.expertise && (
        <>
          <Box
            sx={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
              color: "var(--faint)",
              mb: 0.75,
            }}
          >
            Expertise
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              mb: mentor.engineeringSpecifics ? 1.5 : 0,
            }}
          >
            {String(mentor.expertise)
              .split(", ")
              .map((skill, index) => (
                <span key={index} className="ohx-tag">
                  {skill}
                </span>
              ))}
          </Box>
        </>
      )}

      {Array.isArray(mentor.engineeringSpecifics) &&
        mentor.engineeringSpecifics.length > 0 && (
          <>
            <Box
              sx={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
                color: "var(--faint)",
                mb: 0.75,
              }}
            >
              Software specialties
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {mentor.engineeringSpecifics.map((specialty, index) => (
                <span key={index} className="ohx-tag ohx-tag--accent">
                  {specialty}
                </span>
              ))}
            </Box>
          </>
        )}
    </Box>
  );
}

const MentorCheckinPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { apiServerUrl, slackSignupUrl } = useEnv();
  const {
    gate,
    event: eventData,
    teams,
    nonprofits,
    mentor: mentorData,
    checkedIn,
    checkinWindow,
    refreshStatus,
    retry,
    setCheckedIn,
    tokenRef,
  } = useMentorCheckin(event_id);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [slackNotificationSent, setSlackNotificationSent] = useState(null);
  const [showPreviousSlots, setShowPreviousSlots] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmCheckoutDialogOpen, setConfirmCheckoutDialogOpen] =
    useState(false);

  // Mount-gated clock (hydration) that also flips "Check-in opens …" to the
  // button when opens_at passes while the tab is open.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const availabilitySlots = useMemo(
    () => parseAvailabilitySlots(mentorData?.availability),
    [mentorData?.availability],
  );
  const currentActiveSlot = useMemo(
    () =>
      now == null ? null : findCurrentSlot(availabilitySlots, new Date(now)),
    [availabilitySlots, now],
  );
  const windowState =
    now == null ? null : effectiveWindowState(checkinWindow, now);

  // GA: once per distinct state per visit — how many mentors arrive early.
  const seenGateRef = useRef(new Set());
  const gateLabel =
    gate === "ready" ? (windowState ? `ready_${windowState}` : null) : gate;
  useEffect(() => {
    if (!gateLabel || gateLabel === "loading") return;
    if (seenGateRef.current.has(gateLabel)) return;
    seenGateRef.current.add(gateLabel);
    trackEvent({
      action: "mentor_checkin_gate_view",
      params: { page: "mentor_checkin", event_label: gateLabel, event_id },
    });
  }, [gateLabel, event_id]);

  // Group slots by date for better display
  const groupedAvailabilitySlots = useMemo(() => {
    const groups = {};

    availabilitySlots.forEach((slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
    });

    const sortedGroups = {};

    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      const datePatternA = a.match(/([A-Za-z]+)\s+(\d+)/);
      const datePatternB = b.match(/([A-Za-z]+)\s+(\d+)/);

      if (datePatternA && datePatternB) {
        const monthOrder = {
          Jan: 1,
          Feb: 2,
          Mar: 3,
          Apr: 4,
          May: 5,
          Jun: 6,
          Jul: 7,
          Aug: 8,
          Sep: 9,
          Oct: 10,
          Nov: 11,
          Dec: 12,
        };

        const monthOrderA = monthOrder[datePatternA[1]] || 0;
        const monthOrderB = monthOrder[datePatternB[1]] || 0;

        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }

        const dayA = parseInt(datePatternA[2], 10);
        const dayB = parseInt(datePatternB[2], 10);
        return dayA - dayB;
      }

      return a.localeCompare(b);
    });

    sortedDateKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [availabilitySlots]);

  // A backend refusal (not approved / not open yet / closed) means this tab
  // is stale: re-read /status and let the page settle into that state
  // instead of showing an error.
  const settleOnRefusal = (err) => {
    if (!isCheckinRefusal(err)) return false;
    refreshStatus();
    return true;
  };

  const backendMessage = (err, fallback) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message;
    return status >= 400 && status < 500 && message ? message : fallback;
  };

  // Handle check-in confirmation
  const handleCheckinClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmCheckin = async () => {
    setConfirmDialogOpen(false);

    if (!mentorData) {
      setError("You must be logged in as a registered mentor to check in.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await axios({
        url: `${apiServerUrl}/api/mentor/checkin/${event_id}/in`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef.current}`,
        },
        data: {
          timeSlot: currentActiveSlot
            ? currentActiveSlot.displayText
            : "Custom time slot",
        },
      });

      if (response.data) {
        setCheckedIn(true);
        setSuccess("You have successfully checked in as a mentor!");
        const notified = response.data.slackNotificationSent;
        setSlackNotificationSent(notified);
        if (notified) {
          setSnackbarMessage(
            "Checked in! Teams in #ask-a-mentor on Slack have been notified you are available.",
          );
        } else {
          setSnackbarMessage(
            "Checked in! See below for how to be announced in #ask-a-mentor.",
          );
        }
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Error checking in:", err);
      if (!settleOnRefusal(err)) {
        setError(backendMessage(err, "Failed to check in. Please try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCheckin = () => {
    setConfirmDialogOpen(false);
  };

  // Handle check-out
  const handleCheckoutClick = () => {
    setConfirmCheckoutDialogOpen(true);
  };

  const handleConfirmCheckout = async () => {
    setConfirmCheckoutDialogOpen(false);

    if (!mentorData) {
      setError("You must be logged in as a registered mentor to check out.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await axios({
        url: `${apiServerUrl}/api/mentor/checkin/${event_id}/out`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });

      if (response.data) {
        setCheckedIn(false);
        setSuccess("You have successfully checked out as a mentor.");
        setSnackbarMessage(
          "Checked out successfully! Teams have been notified in #ask-a-mentor that you are no longer available.",
        );
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Error checking out:", err);
      if (err?.response?.status === 400) {
        // "Mentor is not checked in" — e.g. an admin reset it meanwhile.
        refreshStatus();
      }
      setError(backendMessage(err, "Failed to check out. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCheckout = () => {
    setConfirmCheckoutDialogOpen(false);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // SEO metadata and descriptions
  const pageTitle = eventData
    ? `Mentor Check-in for ${eventData.name} - Opportunity Hack`
    : "Mentor Check-in - Opportunity Hack";
  const pageDescription = eventData
    ? `Check in as a mentor for ${eventData.name} in ${eventData.location}. Help teams of technologists create solutions for nonprofits and make a real impact.`
    : "Check in as a mentor for our social good hackathon. Help teams of technologists create solutions for nonprofits and make a real impact.";
  const canonicalUrl = `https://www.ohack.dev/hack/${event_id}/mentor-checkin`;
  const head = {
    title: pageTitle,
    description: pageDescription,
    canonical: canonicalUrl,
  };
  const eventName = eventData?.name || event_id;

  // ---- One ladder, in this order. Nothing below renders until the gate for
  // the CURRENT identity has settled. ----
  if (gate === "loading") {
    return (
      <Shell head={head} maxWidth={760}>
        <LoadingPanel />
      </Shell>
    );
  }

  if (gate === "logged_out") {
    return (
      <Shell head={head} maxWidth={760}>
        <Eyebrow>Mentors</Eyebrow>
        <Box component="h1" className="ohx-display" sx={displaySx}>
          Mentor check-in
        </Box>
        <Box className="ohx-lead" sx={{ mb: 3 }}>
          Log in to check in, see which teams need help, and jump into a team's
          mentor panel.
        </Box>
        <LoginOrRegister
          introText="You need to be logged in to check in as a mentor."
          previousPage={`/hack/${event_id}/mentor-checkin`}
        />
      </Shell>
    );
  }

  if (gate === "event_error" || gate === "mentor_error") {
    return (
      <Shell head={head} maxWidth={760}>
        <GateMasthead
          eventId={event_id}
          eventName={eventData ? eventName : null}
        />
        <ErrorPanel onRetry={retry} />
      </Shell>
    );
  }

  if (gate === "not_applied") {
    return (
      <Shell head={head} maxWidth={760}>
        <GateMasthead eventId={event_id} eventName={eventName} />
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are not registered as a mentor for this event.
        </Alert>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <NextLink
            href={`/hack/${event_id}/mentor-application`}
            className="ohx-btn ohx-btn--primary"
          >
            Apply to be a mentor
          </NextLink>
          <NextLink
            href={`/hack/${event_id}`}
            className="ohx-btn ohx-btn--ghost"
          >
            Back to event
          </NextLink>
        </Box>
        <Box sx={{ mt: 3, fontSize: 15 }}>
          <NextLink href="/mentor" className="ohx-link">
            See every event you&apos;ve signed up to mentor →
          </NextLink>
        </Box>
      </Shell>
    );
  }

  if (gate === "pending") {
    return (
      <Shell head={head} maxWidth={760}>
        <GateMasthead eventId={event_id} eventName={eventName} />
        <PendingPanel
          eventId={event_id}
          waitlisted={applicationState(mentorData) === "waitlisted"}
          slackSignupUrl={slackSignupUrl}
        />
      </Shell>
    );
  }

  if (gate === "not_selected") {
    const eventOver = checkinWindow
      ? effectiveWindowState(checkinWindow, now ?? Date.now()) === "closed"
      : isHackathonExpired(eventData?.endDate, eventData?.timezone);
    return (
      <Shell head={head} maxWidth={760}>
        <GateMasthead eventId={event_id} eventName={eventName} />
        <NotSelectedPanel
          eventId={event_id}
          eventName={eventName}
          eventOver={eventOver}
        />
      </Shell>
    );
  }

  // gate === "ready": an approved mentor. The band shows the check-in button
  // only while the window is open (or to check OUT anyone still checked in);
  // otherwise its slot holds a calm status card.
  const showCheckinBand = checkedIn || windowState === "open";
  const firstSlot = availabilitySlots[0] || null;

  return (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex,follow" />
        <meta
          name="keywords"
          content="hackathon mentor, mentor check-in, tech for good, nonprofit hackathon, opportunity hack, mentorship, volunteer, tech mentoring"
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={
            eventData?.image ||
            "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
          }
        />
      </Head>

      <Box
        className="ohx-wrap"
        sx={{
          maxWidth: 1200,
          pt: "clamp(96px, 12vh, 150px)",
          pb: { xs: 8, md: 12 },
        }}
      >
        <TeamBreadcrumbs
          items={[{ name: eventName, href: `/hack/${event_id}` }]}
          current="Mentor check-in"
        />

        {/* Masthead */}
        <Box component="header" className="rise" sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow>
            {eventName}
            {eventData?.formattedStartDate
              ? ` · ${eventData.formattedStartDate}`
              : ""}
          </Eyebrow>
          <Box
            component="h1"
            className="ohx-display"
            sx={{ mt: 1.5, mb: 2, fontSize: "clamp(2.2rem, 5.4vw, 4rem)" }}
          >
            Mentor check-in
          </Box>
          <Box className="ohx-lead">
            Tell teams you're available, scan who needs help, and jump straight
            into a team's mentor panel — all in one place.
          </Box>
          <Box sx={{ mt: 2, fontSize: 15 }}>
            <NextLink href="/mentor" className="ohx-link">
              ← All your mentoring events
            </NextLink>
          </Box>
          <hr className="ohx-rule" style={{ marginTop: 24 }} />
        </Box>

        <SurveyCTA
          eventId={event_id}
          startDate={eventData?.startDate}
          endDate={eventData?.endDate}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        {slackNotificationSent === false && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Your check-in was not announced in #ask-a-mentor</strong>{" "}
            because we could not find a Slack account matching your application
            email. To be reachable by teams:{" "}
            <a href={slackSignupUrl} target="_blank" rel="noopener noreferrer">
              join our Slack workspace
            </a>{" "}
            using the same email address, then check in again.
          </Alert>
        )}

        {/* Check-in band — the primary action (or the status card in its slot) */}
        {windowState === null && !checkedIn ? (
          <Box sx={{ minHeight: 120, mb: { xs: 4, md: 5 } }} />
        ) : !showCheckinBand && windowState === "upcoming" ? (
          <UpcomingCheckinCard
            checkinWindow={checkinWindow}
            timezone={eventData?.timezone}
            firstSlot={firstSlot}
            now={now}
          />
        ) : !showCheckinBand && windowState === "closed" ? (
          <EventCompleteCard eventId={event_id} eventName={eventName} />
        ) : (
          <Box
            className="ohx-card"
            data-testid="checkin-band"
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: { xs: 4, md: 5 },
              borderLeft: `3px solid ${checkedIn ? "#3a7d44" : "var(--brand)"}`,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
              }}
            >
              {checkedIn ? (
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 38, color: "#3a7d44" }}
                />
              ) : (
                <CancelOutlinedIcon
                  sx={{ fontSize: 38, color: "var(--faint)" }}
                />
              )}
              <Box>
                <Box
                  className="ohx-display"
                  sx={{ fontSize: "1.3rem", color: "var(--ink)" }}
                >
                  {checkedIn ? "You are checked in" : "You are not checked in"}
                </Box>
                <Box
                  sx={{
                    color: "var(--muted)",
                    fontSize: "0.92rem",
                    mt: 0.25,
                    maxWidth: "52ch",
                  }}
                >
                  {checkedIn
                    ? "Teams have been notified in #ask-a-mentor that you are available."
                    : "Checking in posts to #ask-a-mentor so teams know you can help."}
                </Box>
              </Box>
            </Box>
            <Box
              component="button"
              type="button"
              onClick={checkedIn ? handleCheckoutClick : handleCheckinClick}
              disabled={isSubmitting}
              className={`ohx-btn ${checkedIn ? "ohx-btn--ghost" : "ohx-btn--primary"}`}
              sx={{ flexShrink: 0, opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <CircularProgress size={18} sx={{ color: "inherit" }} />
              ) : (
                <SlackIcon sx={{ fontSize: 18 }} />
              )}
              {checkedIn
                ? "Check out & notify teams"
                : "Check in & notify teams"}
            </Box>
          </Box>
        )}

        {/* ===== The one-stop-shop: all teams ===== */}
        <Box
          component="section"
          id="teams"
          sx={{ mb: { xs: 5, md: 6 }, scrollMarginTop: 96 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 0.5,
            }}
          >
            <Box
              component="h2"
              className="ohx-display"
              sx={{
                fontSize: "clamp(1.5rem, 2.8vw, 2rem)",
                color: "var(--ink)",
                m: 0,
              }}
            >
              Teams at a glance
            </Box>
            <Box className="ohx-tag">
              {teams.length} team{teams.length === 1 ? "" : "s"}
            </Box>
          </Box>
          <Box className="ohx-muted" sx={{ mb: 2.5, maxWidth: "70ch" }}>
            Every team for this event with mentor coverage, open flags, and
            last-touch so you can find who needs help. Open a team's mentor
            panel to mark coverage, raise a flag, or leave a note.
          </Box>
          <MentorTeamsTable
            teams={teams}
            eventId={event_id}
            nonprofits={nonprofits}
            endDate={eventData?.endDate}
            timezone={eventData?.timezone}
          />
        </Box>

        {/* ===== Secondary: your shift (availability) + profile ===== */}
        <Box
          component="section"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 4 },
            mb: { xs: 5, md: 6 },
          }}
        >
          <Box>
            <Box
              component="h2"
              className="ohx-display"
              sx={{ fontSize: "1.4rem", color: "var(--ink)", mb: 2 }}
            >
              Your availability
            </Box>

            {Object.keys(groupedAvailabilitySlots).length > 0 ? (
              <Box>
                {!showPreviousSlots &&
                  Object.entries(groupedAvailabilitySlots).filter(([date]) =>
                    isDateInThePast(new Date(date)),
                  ).length > 0 && (
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setShowPreviousSlots(true)}
                      className="ohx-link"
                      sx={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        p: 0,
                        mb: 1.5,
                        fontSize: "0.88rem",
                      }}
                    >
                      Show previous slots
                    </Box>
                  )}
                {Object.entries(groupedAvailabilitySlots)
                  .filter(
                    ([date]) =>
                      showPreviousSlots || isDateInThePast(new Date(date)),
                  )
                  .map(([date, slots]) => (
                    <Box
                      key={date}
                      className="ohx-card"
                      sx={{ mb: 2, overflow: "hidden" }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.25,
                          borderBottom: "1px solid var(--line)",
                          bgcolor: "var(--surface-2)",
                        }}
                      >
                        <Box sx={{ fontWeight: 600, color: "var(--ink)" }}>
                          {date}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {slots.map((slot) => {
                          const isCurrent =
                            currentActiveSlot &&
                            currentActiveSlot.displayText === slot.displayText;
                          return (
                            <Box
                              key={slot.id}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                px: 1.25,
                                py: 1,
                                borderRadius: "6px",
                                borderLeft: isCurrent
                                  ? "3px solid #3a7d44"
                                  : "3px solid transparent",
                                bgcolor: isCurrent
                                  ? "rgba(58,125,68,0.08)"
                                  : "transparent",
                              }}
                            >
                              <Box
                                sx={{ color: "var(--ink)", fontSize: "0.9rem" }}
                              >
                                {slot.timePeriod}
                              </Box>
                              {isCurrent && (
                                <Chip
                                  icon={<HourglassFullIcon />}
                                  label="Now"
                                  color="success"
                                  size="small"
                                  sx={{ height: 24 }}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                {!currentActiveSlot && windowState === "open" && (
                  <Box
                    sx={{ mt: 1, color: "var(--muted)", fontSize: "0.92rem" }}
                  >
                    None of your registered time slots are active right now. You
                    can still check in if you're available outside your
                    scheduled times.
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ color: "var(--muted)", fontSize: "0.95rem" }}>
                No availability slots found yet. You can add your shifts on your
                mentor application.
              </Box>
            )}

            <Box sx={{ mt: 2.5 }}>
              <NextLink
                href={`/hack/${event_id}/mentor-application`}
                className="ohx-btn ohx-btn--ghost"
              >
                Update mentor application
              </NextLink>
            </Box>
          </Box>

          <Box>
            <Box
              component="h2"
              className="ohx-display"
              sx={{ fontSize: "1.4rem", color: "var(--ink)", mb: 2 }}
            >
              You
            </Box>
            <MentorProfileCard mentor={mentorData} />
          </Box>
        </Box>

        {/* ===== Guidelines (condensed) ===== */}
        <Box
          component="section"
          className="ohx-card"
          sx={{ p: { xs: 2.5, md: 3.5 } }}
        >
          <Box
            component="h2"
            className="ohx-display"
            sx={{ fontSize: "1.4rem", color: "var(--ink)", mb: 2 }}
          >
            Mentor guidelines
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: 3, sm: 4 },
            }}
          >
            <Box>
              <Box className="ohx-eyebrow" sx={{ mb: 1, color: "#3a7d44" }}>
                Do
              </Box>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 2.5,
                  color: "var(--muted)",
                  "& li": { mb: 0.75, lineHeight: 1.5 },
                }}
              >
                <li>
                  Check in so teams see you're available in{" "}
                  <strong>#ask-a-mentor</strong>
                </li>
                <li>
                  Use the table above to find teams with open flags or no recent
                  touch
                </li>
                <li>Provide guidance rather than writing their code</li>
                <li>Help teams scope and prioritize features</li>
                <li>Check out when you leave</li>
              </Box>
            </Box>
            <Box>
              <Box
                className="ohx-eyebrow"
                sx={{ mb: 1, color: "var(--accent)" }}
              >
                Don't
              </Box>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 2.5,
                  color: "var(--muted)",
                  "& li": { mb: 0.75, lineHeight: 1.5 },
                }}
              >
                <li>Take over implementation of code or design</li>
                <li>Favor certain teams over others</li>
                <li>Spend the whole event with a single team</li>
                <li>Impose your ideas on teams</li>
                <li>Forget to check out</li>
              </Box>
            </Box>
          </Box>
          <hr className="ohx-rule" style={{ margin: "24px 0" }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ color: "var(--muted)", maxWidth: "60ch" }}>
              New to mentoring, or want tips on running a great shift? Our
              mentor resources cover roles, best practices, and team-pairing
              approaches.
            </Box>
            <NextLink href="/about/mentors" className="ohx-btn ohx-btn--ghost">
              Mentor resources
            </NextLink>
          </Box>
        </Box>
      </Box>

      {/* Check-in Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelCheckin}
        aria-labelledby="checkin-confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          id="checkin-confirm-dialog-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SlackIcon color="primary" />
          Confirm mentor check-in
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you ready to check in as a mentor? This will:
          </DialogContentText>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <SlackIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <span>
                Send a message to <strong>#ask-a-mentor</strong> on Slack
              </span>
            </Box>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <span>Notify teams that you are available to help</span>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleOutlineIcon
                sx={{ fontSize: 16, color: "primary.main" }}
              />
              <span>Mark you as "Available" in the mentor system</span>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancelCheckin} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCheckin}
            variant="contained"
            color="success"
            startIcon={<SlackIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Checking in…" : "Check in & send notification"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Confirmation Dialog */}
      <Dialog
        open={confirmCheckoutDialogOpen}
        onClose={handleCancelCheckout}
        aria-labelledby="checkout-confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          id="checkout-confirm-dialog-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SlackIcon color="error" />
          Confirm mentor check-out
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you ready to check out as a mentor? This will:
          </DialogContentText>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <SlackIcon sx={{ fontSize: 16, color: "error.main" }} />
              <span>
                Send a message to <strong>#ask-a-mentor</strong> on Slack
              </span>
            </Box>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon sx={{ fontSize: 16, color: "error.main" }} />
              <span>Notify teams that you are no longer available</span>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CancelOutlinedIcon sx={{ fontSize: 16, color: "error.main" }} />
              <span>Mark you as "Unavailable" in the mentor system</span>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancelCheckout} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCheckout}
            variant="contained"
            color="error"
            startIcon={<SlackIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Checking out…" : "Check out & send notification"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </RefinedRoot>
  );
};

export default MentorCheckinPage;
