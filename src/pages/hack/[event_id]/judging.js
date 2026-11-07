import Head from "next/head";
import { Shell } from "../../../components/Teams/RefinedTeamShell";
import TeamBreadcrumbs from "../../../components/Teams/TeamBreadcrumbs";
import { PageMasthead } from "../../../components/design/RefinedPage";
import JudgingSchedule from "../../../components/JudgingSchedule/JudgingSchedule";
import { projectEventForSchedule } from "../../../lib/judgingSchedule";
import { eventDisplayName } from "../../../lib/shareCard";
import {
  fetchForStaticProps,
  NOT_FOUND_REVALIDATE,
} from "../../../lib/ssgFetch";

// Public judging schedule: which room each panel is in, who judges it, and
// how ready every assigned team is (commits, demo video, write-up,
// submission). Replaces the per-event Google Doc organizers used to keep.
// Empty until an admin flips constraints.judging_schedule_published.
// noindex: an event-day utility page, not search content.

const SITE = "https://www.ohack.dev";
const OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

const JudgingPage = ({ eventData, schedule }) => {
  const eventId = eventData.event_id || eventData.id;
  // SEO event titles run long ("ASU Fall Hackathon 2026 | Phoenix …") —
  // the short display name reads better in a masthead and buttons.
  const eventTitle = eventDisplayName(eventData);
  const eventHref = `/hack/${eventId}`;
  const pageUrl = `${SITE}${eventHref}/judging`;
  const description = `Judging panels, rooms, judges and team readiness for ${eventTitle}.`;

  return (
    <>
      <Head>
        <title>{`Judging schedule · ${eventTitle} | Opportunity Hack`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`Judging schedule · ${eventTitle}`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Shell maxWidth={1180}>
        <TeamBreadcrumbs
          items={[
            { name: "Hackathons", href: "/hack" },
            { name: eventTitle, href: eventHref },
          ]}
          current="Judging"
        />

        <PageMasthead
          eyebrow="Judging"
          title="Judging schedule"
          italic={`for ${eventTitle}.`}
          lead="Which room each panel is in, who's judging it, and how ready every team is — updated live through the day."
          style={{ marginBottom: 28 }}
        />

        <JudgingSchedule
          eventId={eventId}
          eventData={eventData}
          eventTitle={eventTitle}
          initialSchedule={schedule}
        />
      </Shell>
    </>
  );
};

export async function getStaticProps({ params }) {
  // Same SSG error semantics as /hack/[event_id]/media: 404 / empty body →
  // real 404; any other upstream failure throws so ISR keeps the last good
  // copy (safe: paths: [] + fallback "blocking" never runs at build time).
  const result = await fetchForStaticProps(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${encodeURIComponent(params.event_id)}`,
    { isEmpty: (data) => !data || !data.id },
  );
  if (result.kind === "not_found") {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
  }
  const eventData = projectEventForSchedule(result.data);

  // The schedule is best-effort at build/ISR time: any failure (older
  // backend 404, timeout, 5xx) → null and the client fetches it.
  let schedule = null;
  try {
    const sched = await fetchForStaticProps(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/schedule/${encodeURIComponent(eventData.event_id || params.event_id)}`,
      { timeoutMs: 8000 },
    );
    if (sched.kind === "ok" && sched.data && typeof sched.data === "object")
      schedule = sched.data;
  } catch {
    schedule = null;
  }

  return { props: { eventData, schedule }, revalidate: 30 };
}

export async function getStaticPaths() {
  // Rendered on demand (ISR) — never prerendered at build time.
  return { paths: [], fallback: "blocking" };
}

export default JudgingPage;
