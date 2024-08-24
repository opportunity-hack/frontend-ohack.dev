import dynamic from "next/dynamic";
import React, { Fragment } from "react";
import Head from "next/head";
import { GrowthBook } from "@growthbook/growthbook-react";
import { useEffect } from "react";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { useAuthInfo } from "@propelauth/react";

// Import ga
import * as ga from "../lib/ga";

const HeroBanner = dynamic(
  () => import("../components/HeroBanner/HeroBanner"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

const HackathonList = dynamic(
  () => import("../components/HackathonList/HackathonList"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-09TvTBUc2phrLe",
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    console.log("Viewed Experiment", {
      experimentId: experiment.key,
      variationId: result.key,
    });

    ga.event({
      action: "experiment_viewed",
      params: {
        experiment_id: experiment.key,
        variation_id: result.key,
      },
    });
  },
});

export default function Home() {
  const { user } = useAuthInfo();

  var experimentUserId = Math.random().toString(36).substring(7);
  if (user && user.userId) {
    experimentUserId = user.userId;
  }
  console.log(experimentUserId);

  growthbook.setAttributes({
    id: experimentUserId,
  });

  useEffect(() => {
    growthbook.init({ streaming: true });
  }, []);

  return (
    <Fragment>
      <Head>
        <title>
          Opportunity Hack: Tech Hackathons for Social Good, Empowering
          Nonprofits, Learn how to code, Solve end-to-end problems
        </title>

        {/* Font Preloading */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Your+Font+Family&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Your+Font+Family&display=swap"
          media="print"
          onLoad="this.media='all'"
        />

        {/* Inline Critical CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          /* Critical styles for TitleStyled component */
          .MuiTypography-root {
            font-display: swap;
            font-size: clamp(24px, 5vw, 48px);
            line-height: 1.2;
            font-weight: 400;
            color: #333333;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            letter-spacing: -0.05em;
            text-align: center;
            max-width: 100%;
            margin: 0 auto;
            padding: 16px;
          }
          @media (max-width: 900px) {
            .MuiTypography-root {
              font-size: clamp(20px, 8vw, 36px);
            }
          }
          /* Add other critical styles here */
        `,
          }}
        />
      </Head>
      <GrowthBookProvider growthbook={growthbook}>
        <HeroBanner />
      </GrowthBookProvider>
      <HackathonList />
    </Fragment>
  );
}

export const getStaticProps = async ({ params = {} } = {}) => {
  var title =
    "Opportunity Hack: Tech Hackathons for Social Good, Empowering Nonprofits, Learn how to code, Solve end-to-end problems";
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
