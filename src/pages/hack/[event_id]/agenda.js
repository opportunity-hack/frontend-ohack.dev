import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
import { styled } from "@mui/material/styles";
import { differenceInMilliseconds, differenceInHours } from "date-fns";
import ReactMarkdown from "react-markdown";
import PrintIcon from "@mui/icons-material/Print";
import { QRCodeSVG } from "qrcode.react";
import HackathonHeader from "../../../components/Hackathon/HackathonHeader";
import { Shell } from "../../../components/Teams/RefinedTeamShell";
import TeamBreadcrumbs from "../../../components/Teams/TeamBreadcrumbs";
import { parseLocalDate } from "../../../lib/dateUtils";
import {
  getEventTimezone,
  getUserTimezone,
  getTimezoneAbbreviation,
} from "../../../lib/timezoneUtils";
import {
  fetchForStaticProps,
  NOT_FOUND_REVALIDATE,
} from "../../../lib/ssgFetch";

// Printable event agenda. Refined chrome (Shell + breadcrumbs + the shared
// HackathonHeader masthead) over a day-grouped timeline of `countdowns`.
//
// Times are formatted in the EVENT timezone with Intl (deterministic on the
// server and in every browser), so the ISR HTML is correct for crawlers and
// never mismatches on hydration. The viewer's local time is added beside each
// item only after mount, and only when their timezone differs.
// See docs/agenda-data-structure.md for the optional per-item fields.

const SITE = "https://www.ohack.dev";
const DEFAULT_DESCRIPTION =
  "Join us for an exciting hackathon focused on creating technology solutions for nonprofits.";

const parseLocation = (locationStr) => {
  if (!locationStr) return { venue: "Virtual/TBA", address: "" };
  if (locationStr.includes(" - ")) {
    const [venue, ...rest] = locationStr.split(" - ");
    return { venue: venue.trim(), address: rest.join(" - ").trim() };
  }
  return { venue: locationStr, address: "" };
};

const hostnameOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const formatDateRange = (start, end) => {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const okS = !Number.isNaN(s.getTime());
  const okE = !Number.isNaN(e.getTime());
  if (!okS && !okE) return "";
  const full = { month: "long", day: "numeric", year: "numeric" };
  if (okS && okE && s.getTime() !== e.getTime()) {
    const sameMonth =
      s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
    const left = s.toLocaleDateString(
      "en-US",
      sameMonth ? { month: "long", day: "numeric" } : full,
    );
    const right = sameMonth
      ? `${e.getDate()}, ${e.getFullYear()}`
      : e.toLocaleDateString("en-US", full);
    return `${left} – ${right}`;
  }
  return (okS ? s : e).toLocaleDateString("en-US", full);
};

const dayKeyIn = (date, tz) =>
  date.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
const dayLabelIn = (date, tz) =>
  date.toLocaleDateString("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
const timeIn = (date, tz) =>
  date.toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  });

// Unchanged status logic: done more than 2h ago, "now" within ±2h, else upcoming.
const getEventStatus = (eventTime, now) => {
  if (!now) return null;
  const hoursDiff = differenceInHours(new Date(eventTime), now);
  if (hoursDiff < -2) return "past";
  if (hoursDiff <= 2 && hoursDiff >= -2) return "current";
  return "upcoming";
};

const STATUS_LABEL = { past: "Done", current: "Happening now" };

// Sort by time, then group by calendar day in the event timezone. Items with
// an unparseable time land in a trailing "Time TBA" group instead of vanishing.
const groupByDay = (countdowns, tz) => {
  const list = Array.isArray(countdowns) ? countdowns : [];
  const valid = [];
  const tba = [];
  list.forEach((item) => {
    if (!item) return;
    const d = new Date(item.time);
    (Number.isNaN(d.getTime()) ? tba : valid).push({ item, date: d });
  });
  valid.sort((a, b) => differenceInMilliseconds(a.date, b.date));
  const groups = [];
  valid.forEach((entry) => {
    const key = dayKeyIn(entry.date, tz);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else
      groups.push({ key, label: dayLabelIn(entry.date, tz), entries: [entry] });
  });
  if (tba.length) groups.push({ key: "tba", label: "Time TBA", entries: tba });
  return groups;
};

// --- Module-scope presentational pieces (never defined in the render body) ---

// HackathonHeader clears the fixed NavBar itself (pt 92/120px). Inside the
// Shell, which already does that, the breadcrumbs sit first, so neutralise
// the masthead's own clearance.
const MastheadFrame = styled("div")({
  "& > header": { paddingTop: "8px !important", minHeight: "0 !important" },
});

const Columns = styled("div")({
  display: "grid",
  gap: 28,
  gridTemplateColumns: "minmax(0, 1fr)",
  alignItems: "start",
  marginTop: 8,
  "@media (min-width: 960px)": {
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: 40,
  },
});

const Aside = styled("aside")({
  display: "grid",
  gap: 16,
  "@media (min-width: 960px)": { position: "sticky", top: 88 },
});

const ItemRow = styled("div")({
  display: "grid",
  gap: "4px 20px",
  gridTemplateColumns: "minmax(0, 1fr)",
  "@media (min-width: 600px)": {
    gridTemplateColumns: "118px minmax(0, 1fr)",
  },
});

const Description = styled("div")({
  marginTop: 8,
  fontSize: "0.95rem",
  lineHeight: 1.6,
  color: "var(--muted)",
  "& p": { margin: "0 0 8px" },
  "& p:last-child": { marginBottom: 0 },
  "& ul, & ol": { margin: "0 0 8px", paddingLeft: 20 },
  "& li::marker": { color: "var(--accent)" },
  "& a": {
    color: "var(--brand)",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  "& a:hover": { color: "var(--accent)" },
  "& strong": { color: "var(--ink)" },
});

const dotStyle = (status) => {
  const current = status === "current";
  const past = status === "past";
  const size = current ? 14 : 12;
  return {
    position: "absolute",
    top: 22,
    left: -(size / 2) - 0.5,
    width: size,
    height: size,
    borderRadius: 999,
    background: current
      ? "var(--accent)"
      : past
        ? "var(--brand)"
        : "var(--surface)",
    border: `2px solid ${current ? "var(--accent)" : past ? "var(--brand)" : "var(--line)"}`,
    boxShadow: current ? "0 0 0 4px var(--accent-soft)" : "none",
    boxSizing: "border-box",
  };
};

const ScheduleItem = ({ entry, status, etz, userTz, showLocal }) => {
  const { item, date } = entry;
  const valid = !Number.isNaN(date.getTime());
  const past = status === "past";
  const current = status === "current";
  const place = [item.location, item.room].filter(Boolean).join(" · ");
  const presenters = Array.isArray(item.presenters)
    ? item.presenters.filter(Boolean)
    : [];
  const tags = [
    item.event_type ? String(item.event_type) : null,
    place || null,
    item.duration_minutes ? `${item.duration_minutes} min` : null,
  ].filter(Boolean);

  return (
    <li
      className="agenda-item"
      style={{ position: "relative", padding: "14px 0 14px 26px" }}
    >
      <span aria-hidden="true" style={dotStyle(status)} />
      <ItemRow>
        <div style={{ paddingTop: 2 }}>
          <time
            dateTime={valid ? date.toISOString() : undefined}
            className="ohx-display"
            style={{
              display: "block",
              fontSize: "1.05rem",
              fontVariantNumeric: "tabular-nums",
              color: past ? "var(--muted)" : "var(--ink)",
            }}
          >
            {valid ? timeIn(date, etz) : "TBA"}
          </time>
          {valid && showLocal && (
            <span
              className="ohx-faint agenda-no-print"
              style={{ display: "block", fontSize: "0.78rem", marginTop: 2 }}
            >
              {timeIn(date, userTz)} {getTimezoneAbbreviation(date, userTz)}
            </span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "6px 10px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1.05rem",
                fontWeight: 600,
                lineHeight: 1.35,
                color: past ? "var(--muted)" : "var(--ink)",
              }}
            >
              {item.name}
            </h3>
            {(current || past) && (
              <span
                className={`ohx-tag agenda-no-print${current ? " ohx-tag--accent" : ""}`}
              >
                {STATUS_LABEL[status]}
              </span>
            )}
          </div>
          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 6,
              }}
            >
              {tags.map((t) => (
                <span key={t} className="ohx-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
          {presenters.length > 0 && (
            <p
              className="ohx-muted"
              style={{ margin: "6px 0 0", fontSize: "0.9rem" }}
            >
              With {presenters.join(", ")}
            </p>
          )}
          {item.description && (
            <Description>
              <ReactMarkdown>{item.description}</ReactMarkdown>
            </Description>
          )}
        </div>
      </ItemRow>
    </li>
  );
};

const DaySection = ({ group, now, etz, userTz, showLocal }) => (
  <section aria-labelledby={`day-${group.key}`} style={{ marginBottom: 36 }}>
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 10,
      }}
    >
      <h2
        id={`day-${group.key}`}
        className="ohx-display"
        style={{ fontSize: "clamp(20px, 2.6vw, 26px)" }}
      >
        {group.label}
      </h2>
      <span className="ohx-faint" style={{ fontSize: "0.85rem" }}>
        {group.entries.length} {group.entries.length === 1 ? "item" : "items"}
      </span>
    </div>
    <ol
      style={{
        listStyle: "none",
        margin: "0 0 0 8px",
        padding: 0,
        borderLeft: "1px solid var(--line)",
      }}
    >
      {group.entries.map((entry, index) => (
        <ScheduleItem
          key={`${entry.item.name}-${index}`}
          entry={entry}
          status={getEventStatus(entry.item.time, now)}
          etz={etz}
          userTz={userTz}
          showLocal={showLocal}
        />
      ))}
    </ol>
  </section>
);

const InfoRow = ({ label, children }) => (
  <div style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
    <p className="ohx-eyebrow" style={{ marginBottom: 4 }}>
      {label}
    </p>
    <div style={{ fontSize: "0.95rem", lineHeight: 1.5, color: "var(--ink)" }}>
      {children}
    </div>
  </div>
);

const EventInfoCard = ({ venue, address, dateRange, website, hashtag }) => (
  <div className="ohx-card" style={{ padding: "18px 20px 8px" }}>
    <h2
      className="ohx-display"
      style={{ fontSize: "1.15rem", marginBottom: 10 }}
    >
      Event information
    </h2>
    <InfoRow label="Location">
      {venue}
      {address && (
        <span
          className="ohx-muted"
          style={{ display: "block", fontSize: "0.88rem" }}
        >
          {address}
        </span>
      )}
    </InfoRow>
    {dateRange && <InfoRow label="Dates">{dateRange}</InfoRow>}
    <InfoRow label="Website">
      <a
        className="ohx-link"
        href={website}
        style={{ fontSize: "0.95rem", overflowWrap: "anywhere" }}
      >
        {hostnameOf(website)}
      </a>
    </InfoRow>
    <InfoRow label="Contact">
      <NextLink
        href="/contact"
        className="ohx-link"
        style={{ fontSize: "0.95rem" }}
      >
        Contact us
      </NextLink>
    </InfoRow>
    <InfoRow label="Social media">{hashtag}</InfoRow>
  </div>
);

const QrCard = ({ url }) => (
  <div
    className="ohx-card agenda-no-print"
    style={{
      padding: "18px 20px",
      display: "flex",
      gap: 16,
      alignItems: "center",
      background: "var(--surface-2)",
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 96,
        height: 96,
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 6,
        display: "grid",
        placeItems: "center",
      }}
    >
      <QRCodeSVG value={url} size={84} level="M" />
    </div>
    <div style={{ minWidth: 0 }}>
      <p className="ohx-eyebrow" style={{ marginBottom: 4 }}>
        Share this agenda
      </p>
      <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.5 }}>
        Scan to open the live schedule on your phone.
      </p>
    </div>
  </div>
);

const EmptySchedule = ({ eventHref }) => (
  <div
    className="ohx-card"
    style={{
      padding: "32px 28px",
      background: "var(--surface-2)",
      textAlign: "center",
    }}
  >
    <h2 className="ohx-display" style={{ fontSize: "1.4rem" }}>
      Schedule coming soon
    </h2>
    <p
      className="ohx-muted"
      style={{ margin: "10px auto 18px", maxWidth: "46ch" }}
    >
      The detailed schedule will be posted here closer to the event date. Check
      back soon or visit the event page for updates.
    </p>
    <NextLink href={eventHref} className="ohx-btn ohx-btn--primary">
      Back to the event
    </NextLink>
  </div>
);

const AgendaPage = ({ eventData }) => {
  const router = useRouter();
  // `now` stays null during SSR/hydration so item statuses, the local-time
  // hints and the print timestamp only ever render from the client clock.
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (router.isFallback) {
    return (
      <Shell maxWidth={760}>
        <Head>
          <title>Loading agenda… | Opportunity Hack</title>
        </Head>
        <div
          className="ohx-card"
          style={{ padding: "28px 30px", minHeight: 160 }}
        >
          <p className="ohx-eyebrow">Agenda</p>
          <p className="ohx-muted" style={{ margin: "10px 0 0" }}>
            Loading the schedule…
          </p>
        </div>
      </Shell>
    );
  }

  const event = eventData;
  if (!event) {
    return (
      <Shell maxWidth={760}>
        <div className="ohx-card" style={{ padding: "28px 30px" }}>
          <h1 className="ohx-display" style={{ fontSize: "1.6rem" }}>
            Event not found
          </h1>
          <p className="ohx-muted" style={{ margin: "10px 0 18px" }}>
            We couldn't find that hackathon.
          </p>
          <NextLink href="/hack" className="ohx-btn ohx-btn--primary">
            See all hackathons
          </NextLink>
        </div>
      </Shell>
    );
  }

  const eventId = event.event_id || router.query.event_id;
  const eventHref = `/hack/${eventId}`;
  const eventTitle = event.title || `Hackathon Event ${eventId}`;
  const eventLocation = event.location || "Virtual/TBA";
  const { venue, address } = parseLocation(event.location);
  const eventWebsite = event.website || `${SITE}${eventHref}`;
  const eventHashtag = event.hashtag || "#OpportunityHack";
  const dateRange = formatDateRange(event.start_date, event.end_date);
  const agendaUrl = `${SITE}${eventHref}/agenda`;

  const etz = getEventTimezone(event);
  const mounted = now !== null;
  const userTz = mounted ? getUserTimezone() : etz;
  const showLocal = mounted && userTz !== etz;
  const groups = groupByDay(event.countdowns, etz);
  // Abbreviation from a date on the schedule (DST-correct), never from the
  // live clock, so SSR and client print the same label.
  const abbrDate =
    groups[0]?.entries?.[0]?.date ?? parseLocalDate(event.start_date);
  const tzAbbr = getTimezoneAbbreviation(
    Number.isNaN(abbrDate.getTime()) ? new Date(0) : abbrDate,
    etz,
  );
  const itemCount = groups.reduce((n, g) => n + g.entries.length, 0);

  const pageTitle = `${eventTitle} - Event Agenda | Opportunity Hack`;
  const pageDescription = `Complete agenda for ${eventTitle} hackathon in ${eventLocation}`;
  const ogImage =
    event.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={agendaUrl} />
        <meta property="og:title" content={`${eventTitle} – Event Agenda`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={agendaUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${eventTitle} – Event Agenda`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          .agenda-no-print {
            display: none !important;
          }
          .agenda-print-only {
            display: block !important;
          }
          .agenda-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          h1,
          h2,
          h3 {
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>

      <Shell maxWidth={1120}>
        <div className="agenda-no-print">
          <TeamBreadcrumbs
            items={[
              { name: "Hackathons", href: "/hack" },
              { name: eventTitle, href: eventHref },
            ]}
            current="Agenda"
          />
        </div>

        <MastheadFrame>
          <HackathonHeader
            title={`${eventTitle} agenda`}
            startDate={event.start_date}
            endDate={event.end_date}
            location={eventLocation}
            description={event.description || DEFAULT_DESCRIPTION}
          />
        </MastheadFrame>

        {/* Print-only: how to get back to the live version. */}
        <div
          className="agenda-print-only"
          style={{
            display: "none",
            margin: "16px 0",
            padding: "12px 16px",
            border: "1px solid #999",
            borderRadius: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <QRCodeSVG value={agendaUrl} size={64} level="M" />
            <div style={{ fontSize: "0.85rem", lineHeight: 1.45 }}>
              <strong>View the latest agenda online:</strong>
              <br />
              <span
                style={{ fontFamily: "monospace", overflowWrap: "anywhere" }}
              >
                {agendaUrl}
              </span>
              <br />
              <span>This printout may not reflect real-time updates.</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px 20px",
            margin: "18px 0 22px",
          }}
        >
          <p className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem" }}>
            {itemCount > 0
              ? `${itemCount} scheduled ${itemCount === 1 ? "item" : "items"} · times in ${tzAbbr}`
              : `Times in ${tzAbbr}`}
            {showLocal && (
              <span className="ohx-faint">
                {" "}
                · your local time ({getTimezoneAbbreviation(now, userTz)}) is
                shown under each
              </span>
            )}
          </p>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost agenda-no-print"
            onClick={() => window.print()}
          >
            <PrintIcon sx={{ fontSize: 16 }} aria-hidden="true" />
            Print agenda
          </button>
        </div>

        <Columns>
          <div>
            {groups.length > 0 ? (
              groups.map((group) => (
                <DaySection
                  key={group.key}
                  group={group}
                  now={now}
                  etz={etz}
                  userTz={userTz}
                  showLocal={showLocal}
                />
              ))
            ) : (
              <EmptySchedule eventHref={eventHref} />
            )}
          </div>

          <Aside aria-label="Event information">
            <EventInfoCard
              venue={venue}
              address={address}
              dateRange={dateRange}
              website={eventWebsite}
              hashtag={eventHashtag}
            />
            <QrCard url={agendaUrl} />
          </Aside>
        </Columns>

        <div className="agenda-no-print" style={{ marginTop: 40 }}>
          <NextLink href={eventHref} className="ohx-btn ohx-btn--primary">
            ← Back to {eventTitle}
          </NextLink>
        </div>

        {mounted && (
          <p
            className="agenda-print-only ohx-faint"
            style={{
              display: "none",
              marginTop: 24,
              paddingTop: 10,
              borderTop: "1px solid #ddd",
              fontSize: "0.8rem",
            }}
          >
            Printed from {agendaUrl} ·{" "}
            {now.toLocaleString("en-US", {
              timeZone: etz,
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            {tzAbbr}
          </p>
        )}
      </Shell>
    </>
  );
};

// Only the fields this page renders — the full event payload (teams,
// nonprofits, volunteers…) is large and none of it is needed here.
const AGENDA_FIELDS = [
  "id",
  "event_id",
  "title",
  "location",
  "description",
  "start_date",
  "end_date",
  "timezone",
  "countdowns",
  "website",
  "hashtag",
  "image_url",
];

export async function getStaticProps({ params }) {
  // Same SSG error semantics as /hack/[event_id] (CLAUDE.md "SEO
  // infrastructure"): 404 or an empty `{}` body → real 404; any other upstream
  // failure throws so ISR keeps serving the last good copy instead of caching
  // an "Event not found" shell for 60s.
  const result = await fetchForStaticProps(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`,
    { isEmpty: (data) => !data || !data.id },
  );
  if (result.kind === "not_found") {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
  }
  const eventData = {};
  for (const key of AGENDA_FIELDS) {
    eventData[key] = result.data[key] === undefined ? null : result.data[key];
  }
  return { props: { eventData }, revalidate: 60 };
}

export async function getStaticPaths() {
  // On demand only — no build-time fetch of every event (see /hack/[event_id]
  // for why; a backend blip during `next build` must not fail the deploy).
  return { paths: [], fallback: true };
}

export default AgendaPage;
