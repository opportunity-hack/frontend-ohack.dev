/**
 * SSR card permalink — /hack/{event_id}/plan/c/{card_id}
 *
 * Why this exists separately from /plan?card=…:
 *   The /plan page is statically generated with revalidate (ISR). Slack /
 *   Twitter / LinkedIn unfurl scrapers read meta tags from the initial HTML
 *   response — they don't execute the client JS that opens the dialog from a
 *   query param. So we need a server-rendered route that emits per-card OG
 *   meta tags before the client takes over.
 *
 * The body just renders the same plan page UI with the card pre-opened, so a
 * user clicking the share link gets the canonical board view with that card
 * up.
 */
import Head from "next/head";
import PlanPage from "../../plan";

const SITE_URL = "https://www.ohack.dev";

export default function CardPermalink({ eventData, initialBoard, card, eventId, cardId }) {
  const cardTitle = card?.title || "Card";
  const eventTitle = eventData?.title || eventId;
  const pageTitle = `${cardTitle} — ${eventTitle} planning board`;

  // Strip mention markup + truncate for OG description
  const rawDesc = (card?.description || "").replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1").trim();
  const ogDesc = rawDesc
    ? rawDesc.slice(0, 200) + (rawDesc.length > 200 ? "…" : "")
    : `Planning board for ${eventTitle} on Opportunity Hack — view this card and the full event plan.`;

  // Use first image attachment as OG image, otherwise let crawlers fall back
  // to whatever site-wide image the global Head emits.
  const firstImage = (card?.attachments || []).find((a) => /^image\//.test(a.content_type || ""));
  const ogImage = firstImage?.url;

  const url = `${SITE_URL}/hack/${eventId}/plan/c/${cardId}`;

  return (
    <>
      <Head>
        <title>{`${pageTitle} | Opportunity Hack`}</title>
        <meta name="description" content={ogDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={ogDesc} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <link rel="canonical" href={url} />
      </Head>
      <PlanPage eventData={eventData} initialBoard={initialBoard} initialCardId={cardId} />
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const { event_id: eventId, card_id: cardId } = params;

  // Cache permalink HTML for 60s on Vercel/CDN — repeated unfurl scrapes hit
  // the same URL and we don't need fresh-per-second data for the meta tags.
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  try {
    const [eventRes, boardRes, cardRes] = await Promise.all([
      fetch(`${API}/api/messages/hackathon/${eventId}`),
      fetch(`${API}/api/planning/${eventId}`),
      fetch(`${API}/api/planning/${eventId}/cards/${cardId}`),
    ]);

    const eventData = eventRes.ok ? await eventRes.json() : null;
    const initialBoard = boardRes.ok ? await boardRes.json() : null;
    const card = cardRes.ok ? await cardRes.json() : null;

    if (!card) {
      return { notFound: true };
    }

    return {
      props: { eventData, initialBoard, card, eventId, cardId },
    };
  } catch {
    return { notFound: true };
  }
}
