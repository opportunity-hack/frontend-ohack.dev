import React, { Fragment, Suspense } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useAuthInfo } from "@propelauth/react";
// Separate GrowthBook initialization
import { initGrowthBook } from "../lib/growthbook";


// Dynamically import GrowthBook components
const GrowthBookProvider = dynamic(
  () =>
    import("@growthbook/growthbook-react").then(
      (mod) => mod.GrowthBookProvider
    ),
  { ssr: false }
);

// Lazy load components
const HeroBanner = dynamic(
  () => import("../components/HeroBanner/HeroBanner"),
  {
    loading: () => (
      <div style={{ height: "400px", background: "#f0f0f0" }}>
        Loading Hero...
      </div>
    ),
    ssr: true,
  }
);

const HackathonList = dynamic(
  () => import("../components/HackathonList/HackathonList"),
  {
    loading: () => (
      <div style={{ height: "600px", background: "#f0f0f0" }}>
        Loading Hackathons...
      </div>
    ),
    ssr: true,
  }
);

const TitleStyled = dynamic(
  () => import("../components/HeroBanner/TitleStyledComponent"),
  {
    loading: () => (
      <div style={{ height: "55px", background: "#f0f0f0" }}>
        Loading Title...
      </div>
    ),
    ssr: false,
  }
);

const LeadForm = dynamic(() => import("../components/LeadForm/LeadForm"), {
  loading: () => (
    <div style={{ height: "55px", background: "#f0f0f0" }}>
      Loading Form...
    </div>
  ),
  ssr: false,
});


const BackgroundGrid = dynamic(
  () => import("../components/HeroBanner/BackgroundGridComponent"),
  {
    loading: () => null,
    ssr: false,
  }
);


export default function Home() {
  const { user } = useAuthInfo();
  const growthbook = React.useMemo(() => initGrowthBook(user?.userId), [user]);

  React.useEffect(() => {
    growthbook.init({ streaming: true });
  }, [growthbook]);

  return (
    <Fragment>
      <Head>
        <title>Opportunity Hack: Tech Hackathons for Social Good</title>
        <meta
          name="description"
          content="Empowering volunteers to create tech solutions for nonprofits, fostering community bonds."
        />
        <link rel="preconnect" href="https://cdn.growthbook.io" />
      </Head>
      <GrowthBookProvider growthbook={growthbook}>
        <Suspense
          fallback={
            <div style={{ height: "100vh", background: "#f0f0f0" }}>
              Loading...
            </div>
          }
        >
          <BackgroundGrid />

          <LeadForm />
          <TitleStyled />
          <HeroBanner />
        </Suspense>
      </GrowthBookProvider>
      <HackathonList />
    </Fragment>
  );
}

export async function getStaticProps() {
  const title =
    "Opportunity Hack: Tech Hackathons for Social Good, Empowering Nonprofits, Learn how to code, Solve end-to-end problems";
  const metaDescription =
    "Empowering volunteers to create tech solutions for nonprofits, fostering community bonds. Join us at Opportunity Hack to use your skills for good, boost your resume, and find purpose in work.";

  return {
    props: {
      title,
      openGraphData: [
        { name: "title", content: title, key: "title" },
        { property: "og:title", content: title, key: "ogtitle" },
        { name: "description", content: metaDescription, key: "desc" },
        { property: "og:description", content: metaDescription, key: "ogdesc" },
        { property: "og:type", content: "website", key: "website" },
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
}
