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

export const getStaticProps = async ({ params = {} } = {}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`
  );
  const data = await res.json();
  const nonprofits = data.nonprofits;
  // Number of nonprofits
  var countOfNonProfits = nonprofits.length;

  var title = "Nonprofit Project List: Opportunity Hack Developer Portal";
  var metaDescription = 'A listing of ' + countOfNonProfits + ' nonprofits and projects we have worked on from hackathons, senior capstone projects, and internships.';
  
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
        {
          property: 'twitter:label1',
          value: 'Nonprofits',
          key: 'twitterlabel1',
        },
        {
          property: 'twitter:data1',
          value: countOfNonProfits,
          key: 'twitterdata1',
        }        
      ],
    },
  };
};