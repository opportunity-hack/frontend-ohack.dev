// /hack/<event_id>/share/<type>/<volunteer_id> — a participant's share page.
//
// Two jobs: (1) the landing page behind every shared link — its OG tags
// unfurl the personalized card and the body recruits the viewer (apply CTAs);
// (2) the share kit (#kit) for the participant: download the card, copy a
// caption, post. Rendered on demand (ISR) from the SAME public roster data as
// the event page; only selected people have a page (else 404). `noindex`:
// thousands of thin per-person pages would dilute search, and unfurl
// scrapers ignore robots anyway.

import React, { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { RefinedPage, PageMasthead } from "../../../../../components/design/RefinedPage";
import { Arrow } from "../../../../../components/design/refined";
import TeamBreadcrumbs from "../../../../../components/Teams/TeamBreadcrumbs";
import ShareKit from "../../../../../components/ShareCard/ShareKit";
import useMyEventRoles from "../../../../../hooks/use-my-event-roles";
import { fetchForStaticProps, NOT_FOUND_REVALIDATE } from "../../../../../lib/ssgFetch";
import { trackEvent } from "../../../../../lib/ga";
import {
  ROLE_COPY,
  SHARE_FORMATS,
  SITE_URL,
  absoluteUrl,
  eventDisplayName,
  eventTense,
  formatEventDateRange,
  isShareType,
  leanEventForCard,
  publicVolunteerForCard,
  shareDescription,
  shareHeadline,
  shareImagePath,
  sharePagePath,
  shortLocation,
} from "../../../../../lib/shareCard";

const APPLY_LINKS = [
  { type: "hacker", label: "Hack", path: "hacker-application" },
  { type: "mentor", label: "Mentor", path: "mentor-application" },
  { type: "judge", label: "Judge", path: "judge-application" },
  { type: "volunteer", label: "Volunteer", path: "volunteer-application" },
];

const ga = (action, params) => trackEvent({ action, params: { page: "share_card", ...params } });

// Module-scope (SectionBlock remount lesson).
const CardFigure = ({ src, alt }) => {
  const { width, height } = SHARE_FORMATS.og;
  return (
    <figure
      style={{
        margin: "28px 0 0",
        width: "100%",
        maxWidth: 820,
        aspectRatio: `${width} / ${height}`,
        border: "1px solid var(--line)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--surface-2)",
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </figure>
  );
};

const WantIn = ({ event, tense }) => {
  const eventId = event.event_id;
  const eventHref = `/hack/${encodeURIComponent(eventId)}`;
  const past = tense === "past";
  const track = (label) => () => ga("share_card_landing_cta", { event_label: label, event_id: eventId });
  return (
    <section
      aria-labelledby="want-in"
      className="ohx-card"
      style={{ marginTop: 32, padding: "clamp(18px, 3vw, 28px)", display: "grid", gap: 14 }}
    >
      <p className="ohx-eyebrow" style={{ margin: 0 }}>
        {past ? "Next time" : "Want in?"}
      </p>
      <h2 id="want-in" className="ohx-display" style={{ fontSize: 24, margin: 0 }}>
        {past
          ? "Engineers built free software for nonprofits in one weekend. You could be next."
          : "Engineers build free software for nonprofits in one weekend. Join them."}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {past ? (
          <>
            <NextLink href="/hack" className="ohx-btn ohx-btn--primary" onClick={track("next_event")}>
              Find the next hackathon
            </NextLink>
            <NextLink href={`${eventHref}/results`} className="ohx-btn ohx-btn--ghost" onClick={track("results")}>
              See the results
            </NextLink>
          </>
        ) : (
          APPLY_LINKS.map((l, i) => (
            <NextLink
              key={l.type}
              href={`${eventHref}/${l.path}`}
              className={`ohx-btn ${i === 0 ? "ohx-btn--primary" : "ohx-btn--ghost"}`}
              onClick={track(l.type)}
            >
              {l.label}
            </NextLink>
          ))
        )}
        <NextLink href={eventHref} className="ohx-link" onClick={track("event")}>
          See the event <Arrow />
        </NextLink>
      </div>
    </section>
  );
};

export default function ShareCardPage({ event, type, person }) {
  const roles = useMyEventRoles(event?.event_id);
  const isOwner = Boolean(person) && roles.selectedIds.includes(String(person.id));
  const [kitOpen, setKitOpen] = useState(false);
  const [voice, setVoice] = useState("other");

  // Deep links from the application pages, the /mentor dashboard and the
  // event-page band arrive as #kit → open the kit in first person.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#kit") {
      setKitOpen(true);
      setVoice("self");
    }
  }, []);
  useEffect(() => {
    if (isOwner) {
      setKitOpen(true);
      setVoice("self");
    }
  }, [isOwner]);
  useEffect(() => {
    if (!event?.event_id) return;
    ga("share_card_view", {
      event_label: type,
      event_id: event.event_id,
      voice: typeof window !== "undefined" && window.location.hash === "#kit" ? "self" : "other",
    });
  }, [event?.event_id, type]);

  if (!event || !person) return null;

  const tense = eventTense(event);
  const role = ROLE_COPY[type];
  const eventName = eventDisplayName(event);
  const headline = shareHeadline({ type, name: person.name, event, tense });
  const description = shareDescription({ type, event, tense });
  const pageUrl = absoluteUrl(sharePagePath(event.event_id, type, person.id));
  const ogImage = absoluteUrl(shareImagePath(event.event_id, type, person.id, "og"), SITE_URL);
  const dates = formatEventDateRange(event.start_date, event.end_date);
  const where = shortLocation(event.location);
  const lead = [role.noun, dates, where].filter(Boolean).join(" · ");
  const verb = tense === "past" ? role.past : `is ${role.present}`;
  const alt = `${person.name} — ${role.noun} at ${eventName}`;
  const first = person.name.split(/\s+/)[0];

  const openKit = (nextVoice) => () => {
    setVoice(nextVoice);
    setKitOpen(true);
    ga("share_card_kit_open", { event_label: nextVoice, event_id: event.event_id });
  };

  return (
    <>
      <Head>
        <title>{`${headline} | Opportunity Hack`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={headline} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content={String(SHARE_FORMATS.og.width)} />
        <meta property="og:image:height" content={String(SHARE_FORMATS.og.height)} />
        <meta property="og:image:alt" content={alt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@OpportunityHack" />
        <meta name="twitter:title" content={headline} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={alt} />
      </Head>

      <RefinedPage as="article">
        <TeamBreadcrumbs
          items={[{ name: eventName, href: `/hack/${encodeURIComponent(event.event_id)}` }]}
          current="Share"
        />
        <PageMasthead
          eyebrow={eventName}
          title={`${person.name} ${verb}`}
          italic={`${eventName}.`}
          lead={lead}
        />
        <CardFigure src={shareImagePath(event.event_id, type, person.id, "og")} alt={alt} />

        <WantIn event={event} tense={tense} />

        <section id="kit" aria-labelledby="kit-heading" style={{ marginTop: 40, scrollMarginTop: 96 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <p className="ohx-eyebrow" style={{ margin: 0 }}>
                Share kit
              </p>
              <h2 id="kit-heading" className="ohx-display" style={{ fontSize: 26, margin: "6px 0 0" }}>
                {kitOpen ? (voice === "self" ? "Post it in a minute" : `Share ${first}'s card`) : "Share this card"}
              </h2>
            </div>
            {!kitOpen && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button type="button" className="ohx-btn ohx-btn--primary" onClick={openKit("self")}>
                  This is me — get my share kit
                </button>
                <button type="button" className="ohx-btn ohx-btn--ghost" onClick={openKit("other")}>
                  Share {first}'s card
                </button>
              </div>
            )}
          </div>
          {kitOpen && (
            <ShareKit
              event={event}
              type={type}
              volunteer={person}
              voice={voice}
              onVoiceChange={setVoice}
              tense={tense}
            />
          )}
        </section>
      </RefinedPage>
    </>
  );
}

export async function getStaticProps({ params }) {
  const { event_id: eventId, type, volunteer_id: volunteerId } = params;
  if (!isShareType(type)) return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
  const api = process.env.NEXT_PUBLIC_API_SERVER_URL;

  // Network failures THROW (ISR keeps the last good copy); only a real 404
  // or an unknown event/person becomes notFound. See CLAUDE.md "SSG error semantics".
  const ev = await fetchForStaticProps(`${api}/api/messages/hackathon/${encodeURIComponent(eventId)}`, {
    isEmpty: (d) => !d || !d.id,
  });
  if (ev.kind === "not_found") return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };

  const list = await fetchForStaticProps(
    `${api}/api/messages/hackathon/${encodeURIComponent(eventId)}/${encodeURIComponent(type)}`,
  );
  const rows = list.kind === "ok" && Array.isArray(list.data?.data) ? list.data.data : [];
  const person = publicVolunteerForCard(rows.find((r) => String(r?.id) === String(volunteerId)));
  if (!person) return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };

  return {
    props: { event: leanEventForCard(ev.data), type, person },
    revalidate: 300,
  };
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
