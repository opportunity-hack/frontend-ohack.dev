import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import { fetchForStaticProps, NOT_FOUND_REVALIDATE } from "../../lib/ssgFetch";
import {
  RefinedPage,
  BackLink,
  PageMasthead,
} from "../../components/design/RefinedPage";

const PraiseCard = dynamic(() => import("../../components/Praise/PraiseCard"), {
  ssr: true,
});

export default function PraiseDetailPage({ title, openGraphData, praiseData }) {
  const router = useRouter();
  const { id } = router.query;

  // Fallback pages: reserve the card's space while the first request SSRs it.
  if (router.isFallback) {
    return (
      <RefinedPage narrow>
        <div className="ohx-card" aria-busy="true" style={{ minHeight: 320 }} />
      </RefinedPage>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        {openGraphData?.map((og) => (
          <meta
            key={og.key}
            name={og.name}
            property={og.property}
            content={og.content}
          />
        ))}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.ohack.dev/praise/${id}`} />
      </Head>

      <RefinedPage narrow>
        <BackLink href="/praise">Praise board</BackLink>
        <PageMasthead
          eyebrow="Praise"
          title={
            String(title || "").replace(/\s*\|\s*Opportunity Hack$/, "") ||
            "Praise"
          }
        />
        <div style={{ marginTop: 28 }}>
          {praiseData ? (
            <PraiseCard praise={praiseData} />
          ) : (
            <div className="ohx-card" style={{ padding: 24 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Praise not found.</p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 14,
                  color: "var(--muted)",
                }}
              >
                It may have been removed. The board has plenty more.
              </p>
            </div>
          )}
        </div>
      </RefinedPage>
    </>
  );
}

// No build-time prerender: a throw from getStaticProps during `next build`
// fails the whole Vercel build, and enumerating praises cost a backend fetch
// per id per deploy. "blocking" still serves full SSR HTML on first request.
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export const getStaticProps = async ({ params = {} } = {}) => {
  // Unknown id -> 404 retried after 60s. Upstream 429/5xx/network errors
  // THROW so ISR keeps the last good copy instead of caching a 404.
  const findPraise = (d) => (d?.text || []).find((p) => p.id === params.id);
  const result = await fetchForStaticProps(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/praises`,
    { isEmpty: (d) => !findPraise(d) },
  );
  if (result.kind === "not_found") {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
  }
  const praise = findPraise(result.data);

  const senderName = praise.praise_sender_details?.real_name || "Someone";
  const receiverName =
    praise.praise_receiver_details?.real_name || "a teammate";
  const title = `${senderName} praised ${receiverName} | Opportunity Hack`;

  const description = praise.praise_message
    ? praise.praise_message.length > 160
      ? praise.praise_message.substring(0, 157) + "..."
      : praise.praise_message
    : "See this praise on the Opportunity Hack community board.";

  const image =
    praise.praise_gif ||
    "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

  return {
    props: {
      title,
      praiseData: praise,
      openGraphData: [
        {
          name: "title",
          content: title,
          key: "title",
        },
        {
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "description",
          content: description,
          key: "desc",
        },
        {
          property: "og:description",
          content: description,
          key: "ogdesc",
        },
        {
          property: "og:type",
          content: "article",
          key: "ogtype",
        },
        {
          property: "og:image",
          content: image,
          key: "ogimage",
        },
        {
          property: "og:url",
          content: `https://www.ohack.dev/praise/${params.id}`,
          key: "ogurl",
        },
        {
          property: "og:site_name",
          content: "Opportunity Hack Developer Portal",
          key: "ogsitename",
        },
        {
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard",
        },
        {
          property: "twitter:domain",
          content: "ohack.dev",
          key: "twitterdomain",
        },
        {
          property: "twitter:title",
          content: title,
          key: "twittertitle",
        },
        {
          property: "twitter:description",
          content: description,
          key: "twitterdesc",
        },
        {
          property: "twitter:image",
          content: image,
          key: "twitterimage",
        },
      ],
    },
    revalidate: 3600, // Re-generate at most once per hour
  };
};
