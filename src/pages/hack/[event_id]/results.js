import { useMemo } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { serializeJsonLd } from "../../../lib/jsonLd";
import {
  RefinedPage,
  BackLink,
  PageMasthead,
  LinkRow,
} from "../../../components/design/RefinedPage";

const HackathonResults = dynamic(
  () => import("../../../components/Hackathon/HackathonResults"),
  { ssr: false },
);
const HackathonFunnel = dynamic(
  () => import("../../../components/Hackathon/HackathonFunnel"),
  { ssr: false },
);

const ResultsPage = ({ eventData, funnel }) => {
  const router = useRouter();
  const { event_id } = router.query;

  const nonprofitMap = useMemo(() => {
    if (!eventData?.nonprofits) return {};
    const map = {};
    eventData.nonprofits.forEach((npo) => {
      if (npo?.id) map[npo.id] = npo.name;
    });
    return map;
  }, [eventData?.nonprofits]);

  const hasResults = useMemo(
    () => Boolean(funnel?.winners?.won_prize),
    [funnel],
  );

  if (router.isFallback) {
    return (
      <RefinedPage>
        <div aria-busy="true" className="ohx-card" style={{ minHeight: 360 }} />
      </RefinedPage>
    );
  }

  if (!eventData) {
    return (
      <RefinedPage>
        <PageMasthead
          eyebrow="Hackathon outcomes"
          title="Event not found"
          style={{ marginTop: 0 }}
        />
        <LinkRow
          style={{ marginTop: 24 }}
          primary={{ href: "/hack", label: "All hackathons" }}
        />
      </RefinedPage>
    );
  }

  const eventTitle = eventData.title || `Event ${event_id}`;
  const pageUrl = `https://www.ohack.dev/hack/${event_id}/results`;
  const winnerCount = funnel?.winners?.won_prize || 0;
  const description =
    winnerCount > 0
      ? `Results and hacker funnel for ${eventTitle} — ${winnerCount} winning team${winnerCount === 1 ? "" : "s"}, plus how the field moved from registered to finished project.`
      : `Hacker funnel for ${eventTitle} — how participants moved from registration through project submission.`;
  const ogImage =
    eventData.image_url ||
    eventData.event_photos?.[0]?.url ||
    "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${eventTitle} – Results & Hacker Funnel`,
      url: pageUrl,
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.ohack.dev/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Hackathons",
          item: "https://www.ohack.dev/hack",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: eventTitle,
          item: `https://www.ohack.dev/hack/${event_id}`,
        },
        { "@type": "ListItem", position: 4, name: "Results", item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>{`${eventTitle} – Results & Hacker Funnel | Opportunity Hack`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta
          property="og:title"
          content={`${eventTitle} – Results & Hacker Funnel`}
        />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${eventTitle} – Results & Hacker Funnel`}
        />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {structuredData.map((sd, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(sd) }}
          />
        ))}
      </Head>

      <RefinedPage>
        <BackLink href={`/hack/${event_id}`}>Back to {eventTitle}</BackLink>
        <PageMasthead
          eyebrow="Hackathon outcomes"
          title={eventTitle}
          lead="Winning teams, and how the field of hackers narrowed from registration to a finished project."
        />

        <div style={{ marginTop: 32, minHeight: 320 }}>
          <HackathonResults
            teams={eventData.teams}
            nonprofitMap={nonprofitMap}
            eventId={event_id}
            eventTitle={eventTitle}
            githubOrg={eventData.github_org}
            peerVoteEnabled={!!eventData.constraints?.peer_vote_enabled}
          />
        </div>

        <div style={{ marginTop: 32, minHeight: 320 }}>
          <HackathonFunnel funnel={funnel} hasResults={hasResults} />
        </div>

        <LinkRow
          style={{ marginTop: 40 }}
          links={[
            { href: `/hack/${event_id}`, label: `Back to ${eventTitle}` },
            {
              href: "/hack/results",
              label: "All-time funnel across every hackathon",
            },
          ]}
        />
      </RefinedPage>
    </>
  );
};

export async function getStaticProps({ params }) {
  try {
    const [eventRes, funnelRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`,
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}/funnel`,
      ),
    ]);
    const eventData = eventRes.ok ? await eventRes.json() : null;
    const funnel = funnelRes.ok ? await funnelRes.json() : null;
    return { props: { eventData, funnel }, revalidate: 300 };
  } catch (error) {
    console.error("Error fetching results page data:", error);
    return { props: { eventData: null, funnel: null }, revalidate: 60 };
  }
}

export async function getStaticPaths() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`,
    );
    const data = await res.json();
    const hackathons = data?.hackathons || [];
    const paths = hackathons.map((event) => ({
      params: {
        event_id: event.event_id || event.id || event._id || "unknown-event",
      },
    }));
    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error fetching hackathon paths:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export default ResultsPage;
