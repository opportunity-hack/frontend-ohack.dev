import React, { useEffect, useMemo, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import useMentorEvents, {
  useMentorEventProbe,
} from "../../hooks/use-mentor-events";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import {
  APPLICATION_STATE_LABELS,
  applicationState,
  attendanceMode,
  eventPhase,
  formatEventDates,
  partitionMentorEvents,
  splitAvailability,
  upcomingNotApplied,
} from "../../lib/mentorEvents";
import { KEY_CHANNELS, slackChannelUrl } from "../../lib/slackLinks";
import { parseLocalDate } from "../../lib/dateUtils";
import { RefinedRoot, Eyebrow, Arrow } from "../../components/design/refined";
import { formSectionStyle } from "../../components/ApplicationForm/refinedStyles";

// The mentor counterpart of /judge: one place that lists every event you've
// applied to mentor, with the check-in page for each, plus the mentor guide.
// Everything below the masthead is client-rendered behind the auth gate; the
// <Head> sits outside it so crawlers see the noindex.

const PAGE_TITLE =
  "Mentor Dashboard - Your Hackathon Events | Opportunity Hack";
const PAGE_DESCRIPTION =
  "See every Opportunity Hack hackathon you've signed up to mentor, your shifts, and the check-in page for event day.";
const OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
  gap: 20,
};

const MAX_SHIFTS = 4;

const PHASE_LABELS = {
  live: "Happening now",
  upcoming: "Upcoming",
  past: "Past",
};

const track = (action, params) =>
  trackEvent({ action, params: { page: "mentor_dashboard", ...params } });

// --- module-scope pieces (SectionBlock remount lesson) ---------------------

const TagRow = ({ children }) => (
  <div
    style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}
  >
    {children}
  </div>
);

const Shifts = ({ availability }) => {
  const slots = splitAvailability(availability);
  if (slots.length === 0) return null;
  const shown = slots.slice(0, MAX_SHIFTS);
  const extra = slots.length - shown.length;
  return (
    <div>
      <p
        className="ohx-eyebrow"
        style={{ margin: 0, fontSize: 11.5, color: "var(--muted)" }}
      >
        Your shifts
      </p>
      <ul
        style={{
          margin: "6px 0 0",
          paddingLeft: 18,
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--ink)",
        }}
      >
        {shown.map((slot) => (
          <li key={slot}>{slot}</li>
        ))}
      </ul>
      {extra > 0 && (
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
          +{extra} more
        </p>
      )}
    </div>
  );
};

function checkinOpensLabel(startDate) {
  const d = parseLocalDate(startDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const EventCard = ({ event, phase, onOpenCheckin, onEditApplication }) => {
  const app = event.application || {};
  const state = applicationState(app);
  const mode = attendanceMode(app);
  const eventId = event.event_id;
  const checkinHref = `/hack/${encodeURIComponent(eventId)}/mentor-checkin`;
  const applicationHref = `/hack/${encodeURIComponent(eventId)}/mentor-application`;
  const eventHref = `/hack/${encodeURIComponent(eventId)}`;
  const dates = formatEventDates(event.start_date, event.end_date);

  let actions;
  let note = null;
  if (state === "approved" && phase !== "past") {
    // Check-in opens when the event starts (backend-enforced) — say so up
    // front so nobody arrives early expecting a button.
    if (phase === "upcoming") {
      const opens = checkinOpensLabel(event.start_date);
      note = opens
        ? `Check-in opens ${opens}, when the event starts.`
        : "Check-in opens when the event starts.";
    }
    actions = (
      <>
        <Link
          href={checkinHref}
          className="ohx-btn ohx-btn--primary"
          onClick={() => onOpenCheckin(event, phase)}
        >
          {phase === "live" ? "Check in & see teams" : "Mentor page"}
        </Link>
        <Link href={eventHref} className="ohx-btn ohx-btn--ghost">
          Event page
        </Link>
        {app.id && (
          <Link
            href={`/hack/${encodeURIComponent(eventId)}/share/mentor/${encodeURIComponent(app.id)}#kit`}
            className="ohx-link"
            onClick={() =>
              trackEvent({
                action: "share_card_promo_click",
                params: { event_label: "mentor", event_id: eventId, page: "mentor_dashboard" },
              })
            }
          >
            Share that you're mentoring <Arrow />
          </Link>
        )}
      </>
    );
  } else if (state === "approved") {
    actions = (
      <>
        <Link
          href={checkinHref}
          className="ohx-btn ohx-btn--ghost"
          onClick={() => onOpenCheckin(event, phase)}
        >
          Mentor page
        </Link>
        <Link href={`${eventHref}/results`} className="ohx-link">
          Results <Arrow />
        </Link>
      </>
    );
  } else if (state === "not_selected") {
    note =
      "We couldn't place you at this event. Thanks for offering — other events are listed below.";
    actions = (
      <Link href={eventHref} className="ohx-link">
        Event page <Arrow />
      </Link>
    );
  } else if (phase === "past") {
    actions = (
      <Link href={eventHref} className="ohx-link">
        Event page <Arrow />
      </Link>
    );
  } else {
    note =
      state === "waitlisted"
        ? "You're on the waitlist. We'll email you if a mentor spot opens up."
        : "We review every mentor application by hand — you'll get an email when you're approved.";
    actions = (
      <>
        <Link
          href={applicationHref}
          className="ohx-btn ohx-btn--primary"
          onClick={() => onEditApplication(event)}
        >
          Review your application
        </Link>
        <Link href={eventHref} className="ohx-btn ohx-btn--ghost">
          Event page
        </Link>
      </>
    );
  }

  return (
    <article
      className="ohx-card"
      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
      data-testid={`mentor-event-${eventId}`}
    >
      <TagRow>
        <span
          className={`ohx-tag${phase === "live" ? " ohx-tag--accent" : ""}`}
        >
          {PHASE_LABELS[phase]}
        </span>
        <span className="ohx-tag">{APPLICATION_STATE_LABELS[state]}</span>
        {mode && (
          <span className="ohx-tag">
            {mode === "in_person" ? "In person" : "Virtual"}
          </span>
        )}
        {app.isCheckedIn && <span className="ohx-tag">Checked in</span>}
      </TagRow>
      <div>
        <h3
          className="ohx-display"
          style={{ fontSize: 24, lineHeight: 1.15, margin: 0 }}
        >
          {event.title || eventId}
        </h3>
        {(dates || event.location) && (
          <p
            style={{ margin: "6px 0 0", fontSize: 14.5, color: "var(--muted)" }}
          >
            {dates}
            {dates && event.location ? " · " : ""}
            {event.location}
          </p>
        )}
      </div>
      {state === "approved" && <Shifts availability={app.availability} />}
      {note && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--muted)",
          }}
        >
          {note}
        </p>
      )}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}
      >
        {actions}
      </div>
    </article>
  );
};

const EventGroup = ({ id, phase, title, lead, events, ...handlers }) => {
  if (!events.length) return null;
  return (
    <section aria-labelledby={id} style={{ marginTop: 32 }}>
      <Eyebrow>
        {events.length === 1 ? "1 event" : `${events.length} events`}
      </Eyebrow>
      <h2
        id={id}
        className="ohx-display"
        style={{ fontSize: 26, marginTop: 6, marginBottom: 4 }}
      >
        {title}
      </h2>
      {lead && (
        <p
          style={{ margin: "0 0 16px", fontSize: 14.5, color: "var(--muted)" }}
        >
          {lead}
        </p>
      )}
      <div style={{ ...GRID, marginTop: lead ? 0 : 16 }}>
        {events.map((event) => (
          <EventCard
            key={event.event_id}
            event={event}
            phase={phase}
            {...handlers}
          />
        ))}
      </div>
    </section>
  );
};

const ApplyRow = ({ hackathon, onApply }) => {
  const dates = formatEventDates(hackathon.start_date, hackathon.end_date);
  return (
    <li
      className="ohx-card"
      style={{
        padding: "16px 20px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        listStyle: "none",
      }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
          {hackathon.title || hackathon.event_id}
        </p>
        {(dates || hackathon.location) && (
          <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--muted)" }}>
            {dates}
            {dates && hackathon.location ? " · " : ""}
            {hackathon.location}
          </p>
        )}
      </div>
      <Link
        href={`/hack/${encodeURIComponent(hackathon.event_id)}/mentor-application`}
        className="ohx-btn ohx-btn--ghost"
        onClick={() => onApply(hackathon)}
      >
        Apply to mentor
      </Link>
    </li>
  );
};

const OtherUpcoming = ({ hackathons, onApply, heading }) => {
  if (!hackathons.length) return null;
  return (
    <section aria-labelledby="other-upcoming" style={{ marginTop: 32 }}>
      <Eyebrow>Also happening</Eyebrow>
      <h2
        id="other-upcoming"
        className="ohx-display"
        style={{ fontSize: 22, marginTop: 6 }}
      >
        {heading}
      </h2>
      <ul
        style={{
          margin: "14px 0 0",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {hackathons.map((h) => (
          <ApplyRow key={h.event_id} hackathon={h} onApply={onApply} />
        ))}
      </ul>
    </section>
  );
};

const EmptyState = ({ hackathons, hackathonsLoading, onApply }) => (
  <div className="ohx-card" style={{ padding: 24 }}>
    <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
      No mentoring events yet
    </p>
    <p
      style={{
        margin: "6px 0 0",
        fontSize: 14.5,
        color: "var(--muted)",
        maxWidth: "60ch",
        lineHeight: 1.55,
      }}
    >
      Apply to mentor at an upcoming hackathon and it shows up here with your
      shifts and the check-in page for event day. Already applied with a
      different email? Ask in Slack and we'll link it.
    </p>
    {hackathonsLoading && hackathons.length === 0 ? (
      <div style={{ minHeight: 72 }} aria-busy="true" />
    ) : hackathons.length > 0 ? (
      <ul
        style={{
          margin: "18px 0 0",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {hackathons.map((h) => (
          <ApplyRow key={h.event_id} hackathon={h} onApply={onApply} />
        ))}
      </ul>
    ) : (
      <p style={{ margin: "14px 0 0", fontSize: 14.5 }}>
        No events are taking mentor applications right now.{" "}
        <Link href="/hack" className="ohx-link">
          See all hackathons <Arrow />
        </Link>
      </p>
    )}
  </div>
);

const GuideBand = ({ onGuide }) => (
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
      <p className="ohx-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
        New to mentoring, or want a refresher?
      </p>
      <h2
        className="ohx-display"
        style={{ fontSize: 24, marginTop: 8, color: "#fff" }}
      >
        How mentoring works at Opportunity Hack.
      </h2>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 14.5,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.55,
        }}
      >
        What mentors do (and don't do), how teams find you, Heart certificates,
        and a live demo of the per-team mentor panel you'll use on the day.
      </p>
    </div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Link
        href="/about/mentors"
        className="ohx-btn"
        style={{ background: "#fff", color: "var(--brand)" }}
        onClick={() => onGuide("about")}
      >
        Read the mentor guide
      </Link>
      <Link
        href="/about/mentors/overview"
        className="ohx-btn ohx-btn--ghost"
        style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
        onClick={() => onGuide("overview")}
      >
        Watch the overview
      </Link>
    </div>
  </div>
);

const QuickReference = ({ onGuide }) => (
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
      Your event day in four steps
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
        <strong>Check in on the event's mentor page.</strong> It announces you
        in Slack so teams know you're around. Check out when you leave.
      </li>
      <li>
        <strong>Scan the teams table.</strong> Teams with open flags or the
        least mentor coverage come first — start there.
      </li>
      <li>
        <strong>Open a team's mentor panel.</strong> Sign off what you covered,
        flag concerns for the next mentor, and rate how ready they are for
        judging.
      </li>
      <li>
        <strong>Stuck on something?</strong> Other mentors hang out in{" "}
        <a
          href={slackChannelUrl(KEY_CHANNELS.askAMentor)}
          className="ohx-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onGuide("slack")}
        >
          #ask-a-mentor
        </a>
        .
      </li>
    </ol>
    <p style={{ margin: "12px 0 0", fontSize: 14.5, color: "var(--muted)" }}>
      Mentors guide the build and never score it — judging is a separate role,
      and you can't do both at the same event.
    </p>
  </section>
);

// --- page ------------------------------------------------------------------

const MentorDashboard = withRequiredAuthInfo(() => {
  const { user } = useAuthInfo();
  const mine = useMentorEvents();
  const { hackathons, loading: hackathonsLoading } =
    useHackathonEvents("current");
  const probe = useMentorEventProbe({
    enabled: mine.status === "ready" && !mine.available,
    hackathons,
  });

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const probing = mine.status === "ready" && !mine.available;
  const status = probing
    ? probe.status === "ready"
      ? "ready"
      : hackathonsLoading || probe.status === "loading"
        ? "loading"
        : "ready"
    : mine.status;
  const events = probing ? probe.events : mine.events;

  // One clock per load (keyed on status) so every card agrees on the phase.
  const now = useMemo(() => new Date(), [status]);
  const groups = useMemo(
    () => partitionMentorEvents(events, now),
    [events, now],
  );
  const alsoHappening = useMemo(
    () => upcomingNotApplied(hackathons, events, now),
    [hackathons, events, now],
  );

  const viewedRef = useRef(false);
  useEffect(() => {
    if (status !== "ready" || viewedRef.current) return;
    viewedRef.current = true;
    track("mentor_dash_view", {
      event_label: probing ? "probe" : "api",
      value: events.length,
    });
  }, [status, probing, events.length]);

  const onOpenCheckin = (event, phase) =>
    track("mentor_dash_open_checkin", { event_label: event.event_id, phase });
  const onEditApplication = (event) =>
    track("mentor_dash_edit_application", { event_label: event.event_id });
  const onApply = (hackathon) =>
    track("mentor_dash_apply_click", { event_label: hackathon.event_id });
  const onGuide = (which) =>
    track("mentor_dash_guide_click", { event_label: which });

  const handlers = { onOpenCheckin, onEditApplication };
  const liveCount = groups.live.length;

  return (
    <RefinedRoot>
      <section className="ohx-wrap" style={formSectionStyle}>
        <header>
          <Eyebrow>Mentor dashboard</Eyebrow>
          <h1 className="ohx-display" style={{ marginTop: 8 }}>
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}.{" "}
            <span className="ohx-italic">Your mentoring events.</span>
          </h1>
          <p className="ohx-lead" style={{ marginTop: 12, maxWidth: "58ch" }}>
            Every hackathon you've signed up to mentor, with your shifts and the
            check-in page you'll use on the day. Check in there and teams can
            find you.
          </p>
        </header>

        <div style={{ marginTop: 28, minHeight: 200 }}>
          {status === "loading" && (
            <div aria-busy="true" aria-label="Loading your events" style={GRID}>
              <div className="ohx-card" style={{ minHeight: 260 }} />
              <div className="ohx-card" style={{ minHeight: 260 }} />
            </div>
          )}

          {status === "error" && (
            <div className="ohx-card" role="alert" style={{ padding: 24 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                We couldn't load your mentoring events.
              </p>
              <p
                style={{
                  margin: "6px 0 14px",
                  fontSize: 14,
                  color: "var(--muted)",
                }}
              >
                {mine.error}
              </p>
              <button
                type="button"
                className="ohx-btn ohx-btn--primary"
                onClick={() => mine.reload()}
              >
                Try again
              </button>
            </div>
          )}

          {status === "ready" && events.length === 0 && (
            <EmptyState
              hackathons={alsoHappening}
              hackathonsLoading={hackathonsLoading}
              onApply={onApply}
            />
          )}

          {status === "ready" && events.length > 0 && (
            <>
              {probing && (
                <p
                  role="status"
                  style={{
                    margin: "0 0 4px",
                    fontSize: 13.5,
                    color: "var(--muted)",
                  }}
                >
                  Showing current events only.
                </p>
              )}
              <EventGroup
                id="events-live"
                phase="live"
                title={liveCount === 1 ? "Happening now" : "Happening now"}
                lead="Check in so teams know you're available, then pick a team that needs help."
                events={groups.live}
                {...handlers}
              />
              <EventGroup
                id="events-upcoming"
                phase="upcoming"
                title="Coming up"
                lead="The mentor page opens for check-in once the event starts; until then it shows your shifts and the teams list."
                events={groups.upcoming}
                {...handlers}
              />
              <EventGroup
                id="events-past"
                phase="past"
                title="Past events"
                events={groups.past}
                {...handlers}
              />
              <OtherUpcoming
                hackathons={alsoHappening}
                onApply={onApply}
                heading="Events you haven't applied to yet"
              />
            </>
          )}
        </div>

        <GuideBand onGuide={onGuide} />
        <QuickReference onGuide={onGuide} />
      </section>
    </RefinedRoot>
  );
});

export default function MentorPage() {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.ohack.dev/mentor" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content="https://www.ohack.dev/mentor" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <MentorDashboard />
    </>
  );
}
