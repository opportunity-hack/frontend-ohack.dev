// Printable welcome guide for an event (issue #229).
//
// Coordinators pick which sections to include — schedule, mentors, judges,
// volunteers — and print a handout that carries a QR code back to the live
// event page (https://www.ohack.dev/hack/<event_id>). The selection lives in
// `?sections=schedule,mentors` so a prepared guide can be shared/bookmarked.
//
// Data is fetched server-side: the hackathon doc plus the three PUBLIC
// volunteer lists (filtered to isSelected — the same roster the event page
// shows). No client fetches, so the page prints deterministically.
// NavBar/Footer are suppressed for this route in _app.js; the toolbar
// provides its own "Back to event" link. Page is noindex.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { trackEvent, EventCategory } from "../../../lib/ga";
import {
  SITE_URL,
  DEFAULT_EVENT_TIMEZONE,
  GUIDE_SECTIONS,
  PERSON_TYPES,
  parseSections,
  serializeSections,
  pickEvent,
  pickPerson,
  groupAvailability,
  groupCountdownsByDay,
  timeZoneLabel,
  formatEventDates,
  initialsOf,
} from "../../../components/Hackathon/printGuideData";

const PEOPLE_COPY = {
  mentor: {
    title: "Mentors",
    lead:
      "Mentors float between teams all weekend. Grab one when you're stuck on scope, architecture, or your demo — or post in #ask-a-mentor on Slack.",
    showAvailability: true,
  },
  judge: {
    title: "Judges",
    lead:
      "Judges review every team's final demo and DevPost submission. Say hello if you see them, and make sure your pitch answers their scoring criteria.",
    showAvailability: false,
  },
  volunteer: {
    title: "Volunteers",
    lead:
      "Volunteers keep the event running — check-in, food, the venue, and logistics. Look for them when you need anything that isn't code.",
    showAvailability: true,
  },
};

const CSS = `
  .wg-root {
    --wg-ink: #16181d;
    --wg-muted: #5b6270;
    --wg-line: #e7e1d4;
    --wg-brand: #1b3a6b;
    --wg-accent: #e2552e;
    --wg-paper: #fbfaf6;
    --wg-surface-2: #f5f2ea;
    min-height: 100vh;
    background: var(--wg-paper);
    color: var(--wg-ink);
    font-family: var(--font-body, "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif);
    -webkit-font-smoothing: antialiased;
  }
  .wg-visually-hidden {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }

  /* ---- toolbar (screen only) ---- */
  .wg-toolbar {
    position: sticky; top: 0; z-index: 5;
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px;
    padding: 14px clamp(16px, 4vw, 32px);
    background: rgba(251, 250, 246, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--wg-line);
  }
  .wg-toolbar__left { display: flex; flex-direction: column; gap: 2px; min-width: 160px; }
  .wg-back { color: var(--wg-muted); font-size: 13px; text-decoration: none; }
  .wg-back:hover { color: var(--wg-brand); text-decoration: underline; }
  .wg-toolbar__title {
    font-family: var(--font-display, Fraunces, Georgia, serif);
    font-size: 18px; font-weight: 500; letter-spacing: -0.01em;
  }
  .wg-toggles {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    margin: 0; padding: 0; border: 0; flex: 1 1 320px;
  }
  .wg-toggles__label { font-size: 12px; color: var(--wg-muted); margin-right: 4px; }
  .wg-toggle {
    position: relative; display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border: 1px solid var(--wg-line); border-radius: 999px;
    background: #fff; color: var(--wg-ink); font-size: 13.5px; line-height: 1;
    cursor: pointer; user-select: none;
  }
  .wg-toggle input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; }
  .wg-toggle::before {
    content: ""; width: 8px; height: 8px; border-radius: 50%;
    border: 1px solid var(--wg-muted); background: transparent;
  }
  .wg-toggle.is-on { background: var(--wg-brand); border-color: var(--wg-brand); color: #fff; }
  .wg-toggle.is-on::before { background: #fff; border-color: #fff; }
  .wg-toggle:has(:focus-visible) { outline: 2px solid var(--wg-accent); outline-offset: 2px; }
  .wg-toggle--quiet { border-style: dashed; }
  .wg-toggle--quiet.is-on { background: var(--wg-surface-2); color: var(--wg-ink); border-color: var(--wg-muted); }
  .wg-toggle--quiet.is-on::before { background: var(--wg-brand); border-color: var(--wg-brand); }
  .wg-print-btn {
    appearance: none; border: 1px solid var(--wg-brand); background: var(--wg-brand); color: #fff;
    font: inherit; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 6px;
    cursor: pointer;
  }
  .wg-print-btn:hover { background: #142c52; }
  .wg-print-btn:focus-visible { outline: 2px solid var(--wg-accent); outline-offset: 2px; }
  .wg-hint { width: 100%; margin: -4px 0 0; font-size: 12.5px; color: var(--wg-muted); }

  /* ---- the sheet ---- */
  .wg-page {
    max-width: 8.5in; margin: 24px auto 48px; padding: 0.6in 0.65in;
    background: #fff; border: 1px solid var(--wg-line);
    font-size: 11.5px; line-height: 1.45;
  }
  .wg-eyebrow {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--wg-accent); margin-bottom: 10px;
  }
  .wg-title {
    font-family: var(--font-display, Fraunces, Georgia, serif);
    font-size: 30px; line-height: 1.1; font-weight: 500; letter-spacing: -0.015em;
    margin: 0 0 8px; color: var(--wg-ink);
  }
  .wg-meta { margin: 0 0 14px; font-size: 13px; color: var(--wg-muted); }
  .wg-desc { color: var(--wg-ink); font-size: 11.5px; max-width: 62ch; }
  .wg-desc p { margin: 0 0 6px; }
  .wg-desc a { color: var(--wg-brand); }
  .wg-qr {
    display: flex; align-items: center; gap: 18px;
    margin: 18px 0 14px; padding: 14px 16px;
    border: 1px solid var(--wg-line); background: var(--wg-surface-2); border-radius: 6px;
  }
  .wg-qr svg { flex: 0 0 auto; background: #fff; padding: 6px; border: 1px solid var(--wg-line); }
  .wg-qr__title { font-family: var(--font-display, Fraunces, Georgia, serif); font-size: 16px; margin-bottom: 4px; }
  .wg-qr__hint { color: var(--wg-muted); margin-bottom: 6px; }
  .wg-qr__url { font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 12px; word-break: break-all; }
  .wg-contents { margin: 0; padding: 0 0 0 18px; color: var(--wg-muted); }
  .wg-contents li { margin: 2px 0; }

  .wg-section { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--wg-line); }
  .wg-h2 {
    font-family: var(--font-display, Fraunces, Georgia, serif);
    font-size: 22px; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 4px;
  }
  .wg-h2 small { font-family: var(--font-body, inherit); font-size: 12px; color: var(--wg-muted); margin-left: 8px; font-weight: 400; }
  .wg-lead { margin: 0 0 14px; color: var(--wg-muted); max-width: 66ch; }
  .wg-h3 {
    font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    margin: 14px 0 6px; color: var(--wg-brand);
  }
  .wg-slot { display: grid; grid-template-columns: 78px 1fr; gap: 0 12px; padding: 6px 0; border-top: 1px dotted var(--wg-line); }
  .wg-slot:first-of-type { border-top: 0; }
  .wg-slot__time { font-variant-numeric: tabular-nums; font-weight: 600; white-space: nowrap; }
  .wg-slot__name { font-weight: 600; }
  .wg-slot__desc { color: var(--wg-muted); font-size: 10.5px; }
  .wg-slot__desc p { margin: 2px 0 0; }
  .wg-slot__desc a { color: inherit; }

  .wg-people { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .wg-person { display: flex; gap: 10px; align-items: flex-start; padding: 10px; border: 1px solid var(--wg-line); border-radius: 6px; min-width: 0; }
  .wg-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex: 0 0 44px; background: var(--wg-surface-2); }
  .wg-avatar--initials {
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display, Fraunces, Georgia, serif); font-size: 15px; color: var(--wg-brand);
    border: 1px solid var(--wg-line);
  }
  .wg-person__body { min-width: 0; }
  .wg-person__name { font-weight: 700; font-size: 12.5px; overflow-wrap: anywhere; }
  .wg-person__pronouns { font-weight: 400; color: var(--wg-muted); font-size: 11px; }
  .wg-person__line { color: var(--wg-ink); overflow-wrap: anywhere; }
  .wg-person__focus { color: var(--wg-muted); font-size: 10.5px; margin-top: 2px; overflow-wrap: anywhere; }
  .wg-person__tag {
    display: inline-block; margin-top: 5px; padding: 1px 7px; border-radius: 999px;
    border: 1px solid var(--wg-line); font-size: 9.5px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wg-muted);
  }
  .wg-person__avail { margin-top: 5px; font-size: 10px; color: var(--wg-muted); }
  .wg-person__avail div { margin-top: 1px; }
  .wg-empty { color: var(--wg-muted); font-style: italic; }
  .wg-foot { margin-top: 28px; padding-top: 10px; border-top: 1px solid var(--wg-line); font-size: 10px; color: var(--wg-muted); }

  @media (max-width: 720px) {
    .wg-page { margin: 12px; padding: 20px 16px; }
    .wg-people { grid-template-columns: 1fr; }
  }

  /* ---- print ---- */
  @page { size: letter; margin: 0.5in; }
  @media print {
    .no-print { display: none !important; }
    html, body { background: #fff !important; }
    .wg-root { background: #fff; min-height: 0; }
    .wg-page { max-width: none; margin: 0; padding: 0; border: 0; }
    .wg-people { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .wg-section { break-before: page; page-break-before: always; border-top: 0; margin-top: 0; padding-top: 0; }
    .wg-person, .wg-slot, .wg-qr { break-inside: avoid; page-break-inside: avoid; }
    .wg-h2, .wg-h3 { break-after: avoid; page-break-after: avoid; }
    .wg-qr, .wg-person, .wg-avatar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    a { color: inherit; text-decoration: none; }
  }
`;

const PersonAvatar = ({ person }) => {
  const [failed, setFailed] = useState(false);
  if (person.photoUrl && !failed) {
    return (
      <img
        className="wg-avatar"
        src={person.photoUrl}
        alt=""
        width={44}
        height={44}
        loading="eager"
        decoding="sync"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="wg-avatar wg-avatar--initials" aria-hidden="true">
      {initialsOf(person.name) || "•"}
    </div>
  );
};

const PersonCard = ({ person, showAvailability }) => {
  const availability = showAvailability ? groupAvailability(person.availableDays) : [];
  const line = [person.title, person.org].filter(Boolean).join(" · ");
  return (
    <li className="wg-person">
      <PersonAvatar person={person} />
      <div className="wg-person__body">
        <div className="wg-person__name">
          {person.name || "Volunteer"}
          {person.pronouns && (
            <span className="wg-person__pronouns"> {person.pronouns}</span>
          )}
        </div>
        {line && <div className="wg-person__line">{line}</div>}
        {person.focus && <div className="wg-person__focus">{person.focus}</div>}
        {person.inPerson != null && (
          <span className="wg-person__tag">
            {person.inPerson ? "In person" : "Virtual"}
          </span>
        )}
        {availability.length > 0 && (
          <div className="wg-person__avail">
            {availability.map((group) => (
              <div key={group.day}>
                <strong>{group.day}:</strong> {group.details.join(", ")}
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

const PeopleSection = ({ id, type, people }) => {
  const copy = PEOPLE_COPY[type];
  return (
    <section className="wg-section" id={id} aria-labelledby={`${id}-heading`}>
      <h2 className="wg-h2" id={`${id}-heading`}>
        {copy.title}
        <small>{people.length} confirmed</small>
      </h2>
      <p className="wg-lead">{copy.lead}</p>
      {people.length === 0 ? (
        <p className="wg-empty">
          No {copy.title.toLowerCase()} confirmed yet — check the event page for the latest.
        </p>
      ) : (
        <ul className="wg-people">
          {people.map((person, index) => (
            <PersonCard
              key={person.id || `${person.name}-${index}`}
              person={person}
              showAvailability={copy.showAvailability}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

const ScheduleSection = ({ event, eventDaysOnly }) => {
  const timeZone = event.timezone || DEFAULT_EVENT_TIMEZONE;
  const { groups, filtered, total } = useMemo(
    () =>
      groupCountdownsByDay(event.countdowns, timeZone, {
        eventDaysOnly,
        startDate: event.start_date,
        endDate: event.end_date,
      }),
    [event.countdowns, event.start_date, event.end_date, timeZone, eventDaysOnly],
  );
  const shown = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <section className="wg-section" id="schedule" aria-labelledby="schedule-heading">
      <h2 className="wg-h2" id="schedule-heading">
        Schedule
        <small>
          All times {timeZoneLabel(timeZone)}
          {filtered && shown < total ? ` · event days only` : ""}
        </small>
      </h2>
      <p className="wg-lead">
        The live schedule can shift during the weekend — scan the QR code on the
        front page for the current version.
      </p>
      {groups.length === 0 ? (
        <p className="wg-empty">No schedule has been published yet.</p>
      ) : (
        groups.map((group) => (
          <div key={group.key}>
            <h3 className="wg-h3">{group.label}</h3>
            {group.items.map((item, index) => (
              <div className="wg-slot" key={`${group.key}-${index}`}>
                <div className="wg-slot__time">{item.timeLabel}</div>
                <div>
                  <div className="wg-slot__name">{item.name}</div>
                  {item.description && (
                    <div className="wg-slot__desc">
                      <ReactMarkdown>{item.description}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </section>
  );
};

export default function PrintGuidePage({ event, people, initialSections }) {
  const router = useRouter();
  const [sections, setSections] = useState(() => new Set(initialSections));
  const [eventDaysOnly, setEventDaysOnly] = useState(true);
  // Stamped on the client only: the server and browser can sit on different
  // calendar dates around midnight, which would be a hydration mismatch.
  const [printedOn, setPrintedOn] = useState("");
  useEffect(() => {
    setPrintedOn(format(new Date(), "MMMM d, yyyy"));
  }, []);

  const eventId = event.event_id;
  const eventUrl = `${SITE_URL}/hack/${eventId}`;
  const dates = formatEventDates(event.start_date, event.end_date);

  const syncUrl = useCallback(
    (next) => {
      const value = serializeSections([...next]);
      const { sections: _omit, ...rest } = router.query;
      const query = value ? { ...rest, sections: value } : rest;
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  const toggleSection = (id) => {
    const next = new Set(sections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSections(next);
    syncUrl(next);
  };

  const handlePrint = () => {
    trackEvent({
      action: "print_welcome_guide",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: eventId,
        sections: serializeSections([...sections]) || "all",
      },
    });
    window.print();
  };

  const enabled = GUIDE_SECTIONS.filter((s) => sections.has(s.id));

  return (
    <>
      <Head>
        <title>{`${event.title} — Welcome guide`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content={`Printable welcome guide for ${event.title}: schedule, mentors, judges and volunteers.`}
        />
        <style>{CSS}</style>
      </Head>

      <div className="wg-root">
        <div className="wg-toolbar no-print" role="region" aria-label="Print options">
          <div className="wg-toolbar__left">
            <NextLink href={`/hack/${eventId}`} className="wg-back">
              ← Back to event page
            </NextLink>
            <div className="wg-toolbar__title">Welcome guide</div>
          </div>

          <fieldset className="wg-toggles">
            <legend className="wg-visually-hidden">Sections to include</legend>
            <span className="wg-toggles__label" aria-hidden="true">Include:</span>
            {GUIDE_SECTIONS.map((section) => {
              const on = sections.has(section.id);
              const count = section.type ? people[section.type].length : null;
              return (
                <label
                  key={section.id}
                  className={`wg-toggle${on ? " is-on" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleSection(section.id)}
                  />
                  {section.label}
                  {count != null ? ` (${count})` : ""}
                </label>
              );
            })}
            {sections.has("schedule") && (
              <label
                className={`wg-toggle wg-toggle--quiet${eventDaysOnly ? " is-on" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={eventDaysOnly}
                  onChange={() => setEventDaysOnly((v) => !v)}
                />
                Event days only
              </label>
            )}
          </fieldset>

          <button type="button" className="wg-print-btn" onClick={handlePrint}>
            Print guide
          </button>
          <p className="wg-hint">
            Each section starts on a new page. Choose &ldquo;Save as PDF&rdquo;
            in the print dialog to share it digitally.
          </p>
        </div>

        <main className="wg-page">
          <section className="wg-cover" aria-labelledby="guide-title">
            <div className="wg-eyebrow">Opportunity Hack · Welcome guide</div>
            <h1 className="wg-title" id="guide-title">
              {event.title}
            </h1>
            <p className="wg-meta">
              {[dates, event.location].filter(Boolean).join(" · ")}
            </p>
            {event.description && (
              <div className="wg-desc">
                <ReactMarkdown>{event.description}</ReactMarkdown>
              </div>
            )}

            <div className="wg-qr">
              <QRCodeSVG value={eventUrl} size={132} level="M" />
              <div>
                <div className="wg-qr__title">Scan for the live event page</div>
                <div className="wg-qr__hint">
                  Schedule, nonprofit briefs, teams, Slack and GitHub links —
                  always the latest version.
                </div>
                <div className="wg-qr__url">{eventUrl}</div>
              </div>
            </div>

            {enabled.length > 0 && (
              <>
                <div className="wg-h3">In this guide</div>
                <ul className="wg-contents">
                  {enabled.map((section) => (
                    <li key={section.id}>
                      {section.label}
                      {section.type ? ` — ${people[section.type].length} confirmed` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {sections.has("schedule") && (
            <ScheduleSection event={event} eventDaysOnly={eventDaysOnly} />
          )}
          {GUIDE_SECTIONS.filter((s) => s.type && sections.has(s.id)).map((section) => (
            <PeopleSection
              key={section.id}
              id={section.id}
              type={section.type}
              people={people[section.type]}
            />
          ))}

          <footer className="wg-foot">
            Printed{printedOn ? ` ${printedOn}` : ""} from {eventUrl}/print ·
            Details can change before and during the event — the QR code always
            has the latest.
          </footer>
        </main>
      </div>
    </>
  );
}

async function fetchPeople(api, eventId, type) {
  try {
    const res = await fetch(
      `${api}/api/messages/hackathon/${encodeURIComponent(eventId)}/${type}`,
    );
    if (!res.ok) return [];
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows
      .filter((v) => v && v.isSelected)
      .map(pickPerson)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`print guide: failed to fetch ${type}s for ${eventId}`, error);
    return [];
  }
}

export async function getServerSideProps({ params, query, res }) {
  const api = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const eventRes = await fetch(
    `${api}/api/messages/hackathon/${encodeURIComponent(params.event_id)}`,
  );
  if (eventRes.status === 404) return { notFound: true };
  if (!eventRes.ok) {
    throw new Error(`Failed to load hackathon ${params.event_id}: ${eventRes.status}`);
  }
  const raw = await eventRes.json();
  // Backend soft-404s unknown ids with 200 + {} — treat as a real 404.
  if (!raw || !raw.id) return { notFound: true };

  const event = pickEvent(raw, params.event_id);
  const lists = await Promise.all(
    PERSON_TYPES.map((type) => fetchPeople(api, event.event_id, type)),
  );
  const people = Object.fromEntries(PERSON_TYPES.map((type, i) => [type, lists[i]]));

  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return {
    props: {
      event,
      people,
      initialSections: parseSections(query.sections),
    },
  };
}
