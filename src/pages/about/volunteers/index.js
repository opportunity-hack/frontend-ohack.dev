import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Moment from "moment";
import { Box } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import { RefinedRoot, Eyebrow, Stat, Arrow } from "../../../components/design/refined";
import VolunteerChecklist from "../../../components/About/Volunteering/VolunteerChecklist";
import {
  VOLUNTEER_ROLES,
  SHIFT_BLOCKS,
  CHECKIN_STEPS,
  CHECKIN_SITUATIONS,
  PHOTOGRAPHER_NOTES,
  SHIFT_PRINCIPLES,
  FOOD_AREA_RULES,
  FOOD_RHYTHM,
  SNACK_IDEAS,
  SNACK_INCLUSIVE_NOTE,
  WHAT_TO_BRING,
  FAQ_ITEMS,
} from "../../../components/About/Volunteering/volunteerGuideData";

// /about/volunteers — the event-volunteer guide (the volunteer counterpart of
// /about/mentors and /about/judges). Content lives in volunteerGuideData.js;
// the interactive checklist in VolunteerChecklist.js. Everything presentational
// here is module-scope so nothing remounts on an events refetch.

const track = (button, extra = {}) =>
  trackEvent({ action: "click_volunteers", params: { button, ...extra } });

const CANONICAL = "https://www.ohack.dev/about/volunteers";
const HERO_IMAGE = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

// Screenshots of the real tooling, captured from the admin check-in section
// and a volunteer application page. Each step in CHECKIN_STEPS can point at
// one by id; a step without a shot renders text-only.
const CHECKIN_SHOTS = {};

const sectionPad = {
  paddingTop: "clamp(48px, 7vh, 80px)",
  paddingBottom: "clamp(48px, 7vh, 80px)",
};

const formatEventDate = (s, e) => {
  const start = Moment(s);
  const end = Moment(e);
  if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
    return start.format("dddd, MMMM Do YYYY");
  }
  return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
};

const scrollTo = (id) =>
  setTimeout(
    () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
    50,
  );

const Disclosure = ({ summary, children }) => (
  <details
    className="ohx-card"
    style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}
  >
    <summary
      style={{
        listStyle: "none",
        cursor: "pointer",
        padding: "18px 22px",
        fontFamily: "var(--display)",
        fontSize: "1.05rem",
        fontWeight: 500,
        color: "var(--ink)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      {summary}
      <span
        className="ohx-faint"
        aria-hidden="true"
        style={{ fontSize: "1.4rem", lineHeight: 1, fontFamily: "var(--body)" }}
      >
        +
      </span>
    </summary>
    <div style={{ padding: "0 22px 22px" }}>{children}</div>
  </details>
);

const RoleCard = ({ role }) => (
  <article
    className="ohx-card"
    style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 10 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: "1.5rem", lineHeight: 1 }} aria-hidden="true">
        {role.icon}
      </span>
      <h3 className="ohx-display" style={{ fontSize: "1.2rem", margin: 0 }}>
        {role.title}
      </h3>
    </div>
    <p className="ohx-faint" style={{ margin: 0, fontSize: "0.85rem" }}>
      {role.when}
    </p>
    <p className="ohx-muted" style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}>
      {role.summary}
    </p>
    <ul
      className="ohx-muted"
      style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: "0.9rem", lineHeight: 1.55 }}
    >
      {role.tips.map((tip) => (
        <li key={tip}>{tip}</li>
      ))}
    </ul>
  </article>
);

const PhotographerNote = ({ note }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
      {note.title}
    </h4>
    <p className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6 }}>
      {note.body}
    </p>
    {note.links.length > 0 && (
      <p style={{ margin: "2px 0 0", fontSize: "0.9rem", display: "flex", gap: 14, flexWrap: "wrap" }}>
        {note.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="ohx-link"
            onClick={() => track("photographer_link", { href: link.href })}
          >
            {link.label}
          </Link>
        ))}
      </p>
    )}
  </div>
);

const PrincipleCard = ({ principle, index }) => (
  <article className="ohx-card" style={{ padding: "22px 24px" }}>
    <p className="ohx-eyebrow" style={{ margin: "0 0 8px" }}>
      {String(index + 1).padStart(2, "0")}
    </p>
    <h3 className="ohx-display" style={{ fontSize: "1.15rem", margin: "0 0 8px" }}>
      {principle.title}
    </h3>
    <p className="ohx-muted" style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>
      {principle.body}
    </p>
  </article>
);

const RhythmRow = ({ row }) => (
  <li
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(140px, 200px) 1fr",
      gap: 16,
      padding: "12px 0",
      borderTop: "1px solid var(--line)",
      fontSize: "0.95rem",
      lineHeight: 1.55,
    }}
  >
    <span style={{ fontWeight: 600 }}>{row.when}</span>
    <span className="ohx-muted">{row.what}</span>
  </li>
);

const ShiftDay = ({ day }) => (
  <div className="ohx-card" style={{ padding: 0, overflow: "hidden" }}>
    <div
      style={{
        padding: "14px 20px",
        background: "var(--brand)",
        color: "#fff",
        fontFamily: "var(--display)",
        fontSize: "1.05rem",
      }}
    >
      {day.day}
    </div>
    <ol style={{ listStyle: "none", margin: 0, padding: "4px 20px 10px" }}>
      {day.blocks.map((b) => (
        <li
          key={`${day.day}-${b.label}`}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(118px, 150px) 1fr",
            gap: 14,
            padding: "12px 0",
            borderTop: "1px solid var(--line)",
          }}
        >
          <span
            className="ohx-faint"
            style={{ fontSize: "0.85rem", fontVariantNumeric: "tabular-nums" }}
          >
            {b.time}
          </span>
          <span>
            <span style={{ fontWeight: 600, display: "block" }}>{b.label}</span>
            <span className="ohx-muted" style={{ fontSize: "0.88rem" }}>
              {b.roles}
            </span>
          </span>
        </li>
      ))}
    </ol>
  </div>
);

const CheckinStep = ({ step, index }) => {
  const shot = CHECKIN_SHOTS[step.id];
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr",
        gap: 18,
        padding: "22px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <span
        aria-hidden="true"
        className="ohx-display"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--brand)",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.05rem",
          fontWeight: 500,
        }}
      >
        {index + 1}
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 className="ohx-display" style={{ fontSize: "1.2rem", margin: 0 }}>
          {step.title}
        </h3>
        <p
          className="ohx-muted"
          style={{ margin: "8px 0 0", maxWidth: "68ch", lineHeight: 1.65 }}
        >
          {step.body}
        </p>
        {shot && (
          <figure
            className="ohx-card"
            style={{
              margin: "18px 0 0",
              padding: 0,
              overflow: "hidden",
              maxWidth: 760,
              background: "var(--surface-2)",
            }}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              sizes="(max-width: 800px) 100vw, 760px"
              style={{ width: "100%", height: "auto", display: "block" }}
              loading="lazy"
            />
            <figcaption
              className="ohx-faint"
              style={{ padding: "10px 14px", fontSize: "0.8rem" }}
            >
              {shot.alt}
            </figcaption>
          </figure>
        )}
      </div>
    </li>
  );
};

export default function VolunteersGuide() {
  const { hackathons: upcomingEvents, loading: loadingEvents } =
    useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <RefinedRoot>
      {/* HERO */}
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(104px, 13vh, 156px)",
          paddingBottom: "clamp(28px, 5vh, 48px)",
        }}
      >
        <Eyebrow>
          <span className="rise" style={{ display: "inline-block" }}>
            Volunteer · event crew
          </span>
        </Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}
        >
          Keep the hackathon <span className="ohx-italic">running.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}
        >
          Event volunteers are the reason a weekend with 200 people, 15
          nonprofits, and six meals feels effortless. This guide covers the
          roles, the shifts, exactly how check-in works, and what to do when
          something doesn&apos;t go to plan. No coding required.
        </p>
        <div
          className="rise"
          style={{
            marginTop: 30,
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            animationDelay: "230ms",
          }}
        >
          <a
            href="#upcoming-events"
            className="ohx-btn ohx-btn--primary"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("upcoming-events");
              track("find_events_hero");
            }}
          >
            Find events to volunteer <Arrow />
          </a>
          <a
            href="#check-in"
            className="ohx-btn ohx-btn--ghost"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("check-in");
              track("checkin_guide_hero");
            }}
          >
            How check-in works
          </a>
        </div>
        <hr className="ohx-rule rise" style={{ marginTop: 48, animationDelay: "320ms" }} />
        <div
          className="rise"
          style={{
            marginTop: 26,
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px, 6vw, 80px)",
            animationDelay: "380ms",
          }}
        >
          <Stat value="2–4 hrs" label="per shift" />
          <Stat value={String(VOLUNTEER_ROLES.length)} label="ways to help" />
          <Stat value="0" label="lines of code" />
          <Stat value="Meals + t-shirt" label="on us" />
        </div>
      </section>

      {/* HERO IMAGE */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
        <div
          className="rise"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--line)",
          }}
        >
          <Image
            src={HERO_IMAGE}
            alt="Volunteers and hackers at an Opportunity Hack event"
            fill
            sizes="(max-width: 1120px) 100vw, 1120px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section
        id="upcoming-events"
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          scrollMarginTop: 90,
        }}
      >
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Upcoming events</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
            Where you can help next
          </h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
            Pick an event, choose your shifts on the application, and we&apos;ll
            confirm you before the weekend.
          </p>
          <Box sx={{ minHeight: { xs: 0, md: 180 } }}>
            {loadingEvents ? (
              <p className="ohx-faint">Loading events…</p>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
              >
                {upcomingEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className="ohx-card"
                    style={{ padding: "24px", background: "var(--surface)" }}
                  >
                    <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>
                      {event.title}
                    </h3>
                    <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>
                      {event.location}
                    </p>
                    <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>
                      {formatEventDate(event.start_date, event.end_date)}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        marginTop: 18,
                        alignItems: "center",
                      }}
                    >
                      <Link
                        href={`/hack/${event.event_id}/volunteer-application`}
                        className="ohx-btn ohx-btn--primary"
                        style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }}
                        onClick={() => track("volunteer_apply_upcoming", { event_id: event.event_id })}
                      >
                        Apply to volunteer
                      </Link>
                      <Link
                        href={`/hack/${event.event_id}`}
                        className="ohx-link"
                        style={{ fontSize: "0.9rem" }}
                        onClick={() => track("event_details", { event_id: event.event_id })}
                      >
                        Details <Arrow />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ohx-card" style={{ padding: "32px 28px", background: "var(--surface)" }}>
                <p className="ohx-muted" style={{ margin: 0 }}>
                  No upcoming events scheduled right now.
                </p>
                <Link href="/hack" className="ohx-link" style={{ marginTop: 12 }}>
                  View all hackathons <Arrow />
                </Link>
              </div>
            )}
          </Box>
          <div style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/hack" className="ohx-link" onClick={() => track("all_hackathons")}>
              All hackathons <Arrow />
            </Link>
            <Link href="/volunteer" className="ohx-link" onClick={() => track("explore_roles")}>
              Every way to get involved <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="ohx-wrap" style={{ ...sectionPad, scrollMarginTop: 90 }}>
        <Eyebrow>What you&apos;ll do</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          The roles on the application
        </h2>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "62ch", lineHeight: 1.6 }}>
          These are the exact roles you&apos;ll see on the volunteer sign-up table.
          In-person events need all of them on site; online events swap the venue
          roles for moderation and content. You can pick more than one.
        </p>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {VOLUNTEER_ROLES.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>

        {/* PHOTOGRAPHERS CALLOUT */}
        <aside
          id="photographers"
          aria-labelledby="photographers-heading"
          className="ohx-card"
          style={{
            marginTop: 28,
            padding: "clamp(22px, 3vw, 32px)",
            background: "var(--surface-2)",
            borderLeft: "4px solid var(--accent)",
            scrollMarginTop: 90,
          }}
        >
          <Eyebrow>📸 For photographers &amp; videographers</Eyebrow>
          <h3
            id="photographers-heading"
            className="ohx-display"
            style={{ fontSize: "1.35rem", margin: "8px 0 6px" }}
          >
            Thank you for capturing the weekend
          </h3>
          <p className="ohx-muted" style={{ margin: "0 0 20px", maxWidth: "62ch", lineHeight: 1.6 }}>
            Your photos are how sponsors, nonprofits, and next year&apos;s
            volunteers see what happened. Four things to know before you start
            shooting.
          </p>
          <div
            style={{
              display: "grid",
              gap: "20px 28px",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            }}
          >
            {PHOTOGRAPHER_NOTES.map((note) => (
              <PhotographerNote key={note.id} note={note} />
            ))}
          </div>
        </aside>
      </section>

      {/* SHIFTS */}
      <section
        id="shifts"
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          scrollMarginTop: 90,
        }}
      >
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>A typical weekend</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
            The shift blocks you&apos;ll choose from
          </h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "62ch", lineHeight: 1.6 }}>
            The application lays shifts out like a sign-up sheet, one block at a
            time, and shows how many volunteers each block still needs. These are
            the default blocks for a two-day event — the event page and the
            calendar invites in your confirmation email have the exact times.
          </p>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            }}
          >
            {SHIFT_BLOCKS.map((day) => (
              <ShiftDay key={day.day} day={day} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOD AREA + SHARED SHIFT SHEET */}
      <section id="food-area" className="ohx-wrap" style={{ ...sectionPad, scrollMarginTop: 90 }}>
        <Eyebrow>On shift</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          The shared shift sheet and the food area
        </h2>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "64ch", lineHeight: 1.6 }}>
          Most of a volunteer weekend is keeping one room running: food out,
          food away, snacks topped up, trash gone. Organizers print a reference
          sheet for the event and leave it in the food area — here is how it
          works and the rules it carries, so nothing on this page surprises you
          on the day.
        </p>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {SHIFT_PRINCIPLES.map((principle, i) => (
            <PrincipleCard key={principle.id} principle={principle} index={i} />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            marginTop: 36,
            alignItems: "start",
          }}
        >
          <div className="ohx-card" style={{ padding: "24px 26px" }}>
            <h3 className="ohx-display" style={{ fontSize: "1.3rem", margin: "0 0 14px" }}>
              Food area rules
            </h3>
            <dl style={{ margin: 0 }}>
              {FOOD_AREA_RULES.map((rule) => (
                <div
                  key={rule.id}
                  style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}
                >
                  <dt style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>
                    {rule.label}
                  </dt>
                  <dd className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.55 }}>
                    {rule.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="ohx-card" style={{ padding: "24px 26px" }}>
              <h3 className="ohx-display" style={{ fontSize: "1.3rem", margin: "0 0 6px" }}>
                A day&apos;s rhythm
              </h3>
              <p className="ohx-faint" style={{ margin: "0 0 10px", fontSize: "0.85rem" }}>
                The printed sheet has the exact times for your event; meal times
                are confirmed on the day.
              </p>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {FOOD_RHYTHM.map((row) => (
                  <RhythmRow key={row.when} row={row} />
                ))}
              </ol>
            </div>

            <div className="ohx-card" style={{ padding: "22px 26px", background: "var(--surface-2)" }}>
              <h3 className="ohx-display" style={{ fontSize: "1.1rem", margin: "0 0 10px" }}>
                What we try to keep stocked
              </h3>
              <ul className="ohx-muted" style={{ margin: 0, paddingLeft: 18, fontSize: "0.9rem", lineHeight: 1.6 }}>
                {SNACK_IDEAS.map((group) => (
                  <li key={group.group}>
                    <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{group.group}:</strong>{" "}
                    {group.items}
                  </li>
                ))}
              </ul>
              <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.85rem", lineHeight: 1.5 }}>
                {SNACK_INCLUSIVE_NOTE}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHECK-IN WALKTHROUGH */}
      <section id="check-in" className="ohx-wrap" style={{ ...sectionPad, scrollMarginTop: 90 }}>
        <Eyebrow>Registration desk</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
          How check-in works
        </h2>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 8, maxWidth: "64ch", lineHeight: 1.6 }}>
          Check-in is the first thing every participant experiences, and the
          record it creates is what unlocks meals counts, certificates, and
          volunteer hours. Here is the whole process, start to finish, using the
          same tool organizers use.
        </p>
        <ol style={{ listStyle: "none", margin: "28px 0 0", padding: 0 }}>
          {CHECKIN_STEPS.map((step, i) => (
            <CheckinStep key={step.id} step={step} index={i} />
          ))}
        </ol>

        <h3 className="ohx-display" style={{ fontSize: "1.3rem", marginTop: 40, marginBottom: 14 }}>
          Common situations at the desk
        </h3>
        <div className="ohx-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th scope="col" style={{ textAlign: "left", padding: "12px 18px", fontWeight: 600, width: "38%" }}>
                  Situation
                </th>
                <th scope="col" style={{ textAlign: "left", padding: "12px 18px", fontWeight: 600 }}>
                  What you do
                </th>
              </tr>
            </thead>
            <tbody>
              {CHECKIN_SITUATIONS.map((row) => (
                <tr key={row.situation} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "14px 18px", verticalAlign: "top", fontWeight: 500 }}>
                    {row.situation}
                  </td>
                  <td className="ohx-muted" style={{ padding: "14px 18px", verticalAlign: "top", lineHeight: 1.55 }}>
                    {row.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ohx-muted" style={{ marginTop: 16, fontSize: "0.9rem", maxWidth: "64ch" }}>
          Everyone agreed to the{" "}
          <Link href="/hack/code-of-conduct" className="ohx-link">code of conduct</Link>,{" "}
          <Link href="/hack/liability-waiver" className="ohx-link">liability waiver</Link> and{" "}
          <Link href="/hack/photo-release" className="ohx-link">photo release</Link> when
          they applied — if someone asks what they signed, those are the pages.
        </p>
      </section>

      {/* CHECKLIST */}
      <section
        id="checklist"
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          scrollMarginTop: 90,
        }}
      >
        <div className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Your checklist</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
            Before, during, and after the event
          </h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "62ch", lineHeight: 1.6 }}>
            The same kind of checklist mentors and judges use. Tick things off
            as you go — it&apos;s saved in your browser so you can come back to it
            over the weekend.
          </p>
          <VolunteerChecklist />

          <h3 className="ohx-display" style={{ fontSize: "1.3rem", marginTop: 40, marginBottom: 12 }}>
            What to bring
          </h3>
          <ul className="ohx-muted" style={{ margin: 0, paddingLeft: 20, maxWidth: "62ch", lineHeight: 1.7 }}>
            {WHAT_TO_BRING.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="ohx-wrap" style={{ ...sectionPad, scrollMarginTop: 90 }}>
        <Eyebrow>FAQ for event volunteers</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>
          Questions, answered
        </h2>
        <div style={{ maxWidth: 820 }}>
          {FAQ_ITEMS.map((item) => (
            <Disclosure key={item.id} summary={item.question}>
              <p className="ohx-muted" style={{ margin: 0, fontSize: "0.96rem", lineHeight: 1.7 }}>
                {item.answer}
              </p>
            </Disclosure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(56px, 9vh, 104px)" }}>
        <div
          className="ohx-card"
          style={{
            padding: "clamp(32px, 5vw, 56px)",
            textAlign: "center",
            background: "var(--surface-2)",
          }}
        >
          <h2 className="ohx-display" style={{ marginBottom: 12 }}>Ready to help run one?</h2>
          <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "54ch" }}>
            Apply through any upcoming event above, or look at the other ways to
            get involved — hacking, mentoring, judging, and organizer roles.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/hack" className="ohx-btn ohx-btn--primary" onClick={() => track("cta_hackathons")}>
              See upcoming hackathons <Arrow />
            </Link>
            <Link href="/volunteer" className="ohx-btn ohx-btn--ghost" onClick={() => track("cta_all_roles")}>
              All ways to get involved
            </Link>
            <Link href="/jobs" className="ohx-btn ohx-btn--ghost" onClick={() => track("cta_jobs")}>
              Organizer roles
            </Link>
          </div>
        </div>
      </section>
    </RefinedRoot>
  );
}

export const getStaticProps = async () => {
  const title = "Event Volunteer Guide - Check-in, Shifts & Roles | Opportunity Hack";
  const description =
    "Everything an Opportunity Hack event volunteer needs: the roles on the sign-up form, the shift blocks, how the shared shift sheet and food area work, a step-by-step check-in walkthrough, a before-during-after checklist, and answers to the questions volunteers ask most.";
  const image = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";
  return {
    props: {
      title,
      description,
      canonical: CANONICAL,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: image, key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: CANONICAL, key: "url" },
        { name: "og:url", property: "og:url", content: CANONICAL, key: "ogurl" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: image, key: "twitterimage" },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content: "Volunteers and participants at an Opportunity Hack hackathon",
          key: "twitterimagealt",
        },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${CANONICAL}#webpage`,
            url: CANONICAL,
            name: title,
            description,
            isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
          },
          {
            "@type": "HowTo",
            name: "How to check participants in at an Opportunity Hack hackathon",
            description:
              "The registration-desk process volunteers follow: QR scan first, name lookup as the fallback, organizers for anything else.",
            step: CHECKIN_STEPS.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.title,
              text: s.body,
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "About", item: "https://www.ohack.dev/about" },
              { "@type": "ListItem", position: 3, name: "Volunteers", item: CANONICAL },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ],
      },
    },
  };
};
