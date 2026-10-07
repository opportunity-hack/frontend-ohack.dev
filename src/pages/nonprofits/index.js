import dynamic from "next/dynamic";

const NonProfitList = dynamic(
  () => import("../../components/NonProfitList/NonProfitList"),
  {
    ssr: false,
  }
);

// TODO: once MUI has been set up to render server side, pull outer markup from  NonProfitList back into here.
export default function NonProfits() {
  return <NonProfitList />;
}

// Builds at deploy time, so it MUST NEVER THROW (a throw fails the whole
// Vercel build). On any upstream failure, render count-free meta and retry
// after 60s instead of freezing the degraded copy until the next deploy.
export const getStaticProps = async ({ params = {} } = {}) => {
  let countOfNonProfits = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) throw new Error(`Upstream ${res.status} for /api/messages/npos`);
    const data = await res.json();
    if (!Array.isArray(data?.nonprofits)) throw new Error("npos payload missing nonprofits[]");
    countOfNonProfits = data.nonprofits.length;
  } catch (error) {
    console.error("Failed to fetch nonprofits:", error);
  }
  const degraded = countOfNonProfits === null;

  var title = "Nonprofit Project List: Opportunity Hack Developer Portal";
  var metaDescription = degraded
    ? 'A listing of nonprofits and projects we have worked on from hackathons, senior capstone projects, and internships.'
    : 'A listing of ' + countOfNonProfits + ' nonprofits and projects we have worked on from hackathons, senior capstone projects, and internships.';

  // Helpful Docs:
  // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
  // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
  // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
  return {
    props: {
      title: title,
      openGraphData: [
        {
          name: 'title',
          content: title,
          key: 'title',
        },
        {
          property: 'og:title',
          content: title,
          key: 'ogtitle',
        },
        {
          name: 'description',
          content: metaDescription,
          key: 'desc',
        },
        {
          property: 'og:description',
          content: metaDescription,
          key: 'ogdesc',
        },
        {
          property: 'og:type',
          content: 'website',
          key: 'website',
        },
        {
          property: 'og:image',
          content: 'https://i.imgur.com/hTpVsAX.png',
          key: 'ogimage',
        },
        {
          property: 'twitter:image',
          content: 'https://i.imgur.com/hTpVsAX.png',
          key: 'twitterimage',
        },
        {
          property: 'og:site_name',
          content: 'Opportunity Hack Developer Portal',
          key: 'ogsitename',
        },
        {
          property: 'twitter:card',
          content: 'summary_large_image',
          key: 'twittercard',
        },
        {
          property: 'twitter:domain',
          content: 'ohack.dev',
          key: 'twitterdomain',
        },
        ...(degraded
          ? []
          : [
              {
                property: 'twitter:label1',
                content: 'Nonprofits',
                key: 'twitterlabel1',
              },
              {
                property: 'twitter:data1',
                content: String(countOfNonProfits),
                key: 'twitterdata1',
              },
            ]),
      ],
    },
    revalidate: degraded ? 60 : 3600,
  };
};