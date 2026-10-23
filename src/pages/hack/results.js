import dynamic from "next/dynamic";
import Head from "next/head";
import { serializeJsonLd } from "../../lib/jsonLd";
import {
  RefinedPage,
  BackLink,
  PageMasthead,
  LinkRow,
} from "../../components/design/RefinedPage";
import { Stat } from "../../components/design/refined";

const HackathonFunnel = dynamic(
  () => import("../../components/Hackathon/HackathonFunnel"),
  { ssr: false },
);

const AggregateResultsPage = ({ funnel }) => {
  const pageUrl = "https://www.ohack.dev/hack/results";
  const eventsTotal = funnel?.events_total || 0;
  const eventsWithWinners = funnel?.events_with_winners || 0;
  const totalRegistered = funnel?.summary?.registered || 0;
  const totalSubmittedTeams = funnel?.summary?.submitted_project_teams || 0;
  const hasResults = Boolean(funnel?.winners?.won_prize);

  const description = `Aggregate hacker funnel across every Opportunity Hack hackathon — ${eventsTotal} events, ${totalRegistered.toLocaleString("en-US")} people registered, ${totalSubmittedTeams.toLocaleString("en-US")} projects submitted.`;
  const ogImage = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Opportunity Hack — All-Time Hacker Funnel",
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
        { "@type": "ListItem", position: 3, name: "Results", item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>Opportunity Hack – All-Time Hacker Funnel | Results</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta
          property="og:title"
          content="Opportunity Hack – All-Time Hacker Funnel"
        />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Opportunity Hack – All-Time Hacker Funnel"
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
        <BackLink href="/hack">All hackathons</BackLink>
        <PageMasthead
          eyebrow="All-time outcomes · every event combined"
          title="The Opportunity Hack"
          italic="funnel."
          lead="Every event narrows from broad interest down to a small group of people who push all the way through. Counts below are summed across every hackathon — a person who participated in three events is counted three times."
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px 40px",
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid var(--line)",
            }}
          >
            <Stat
              value={eventsTotal.toLocaleString("en-US")}
              label="Hackathons"
            />
            <Stat
              value={totalRegistered.toLocaleString("en-US")}
              label="People registered"
            />
            <Stat
              value={totalSubmittedTeams.toLocaleString("en-US")}
              label="Projects submitted"
            />
            <Stat
              value={eventsWithWinners.toLocaleString("en-US")}
              label="Events with winners"
            />
          </div>
        </PageMasthead>

        <div style={{ marginTop: 32, minHeight: 320 }}>
          <HackathonFunnel funnel={funnel} hasResults={hasResults} />
        </div>

        <LinkRow
          style={{ marginTop: 40 }}
          links={[{ href: "/hack", label: "Back to all hackathons" }]}
        />
      </RefinedPage>
    </>
  );
};

export async function getStaticProps() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons/funnel/aggregate`,
    );
    const funnel = res.ok ? await res.json() : null;
    return { props: { funnel }, revalidate: 600 };
  } catch (error) {
    console.error("Error fetching aggregate funnel:", error);
    return { props: { funnel: null }, revalidate: 60 };
  }
}

export default AggregateResultsPage;
