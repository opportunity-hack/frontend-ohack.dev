import dynamic from "next/dynamic";
import React, { Fragment } from "react";
import Head from "next/head";

const HeroBanner = dynamic(
  () => import("../components/HeroBanner/HeroBanner"),
  {
    ssr: false,
  }
);

const HackathonList = dynamic(
  () => import("../components/HackathonList/HackathonList"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <Fragment>
      <Head>
        <title></title>
      </Head>
      <HeroBanner />
      <HackathonList />
    </Fragment>
  );
}
export const getStaticProps = async ({ params = {} } = {}) => {
  var title = "Opportunity Hack Developer Portal";
  var metaDescription =
    "Empowering volunteers to create tech solutions for nonprofits, fostering community bonds. Join us at Opportunity Hack to use your skills for good, boost your resume, and find purpose in work.";

  // Helpful Docs:
  // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
  // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
  // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
  return {
    props: {
      title: title,
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
          content: metaDescription,
          key: "desc",
        },
        {
          property: "og:description",
          content: metaDescription,
          key: "ogdesc",
        },
        {
          property: "og:type",
          content: "website",
          key: "website",
        },
        {
          property: "og:image",
          content: "https://i.imgur.com/xYrA32J.png",
          key: "ogimage",
        },
        {
          property: "twitter:image",
          content: "https://i.imgur.com/xYrA32J.png",
          key: "twitterimage",
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
      ],
    },
  };
};
