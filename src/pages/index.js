import React, { Fragment, Suspense } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useAuthInfo } from "@propelauth/react";
// Separate GrowthBook initialization
import { initGrowthBook } from "../lib/growthbook";
import { Skeleton, Box, Grid, Container } from "@mui/material";

// Dynamically import GrowthBook components
const GrowthBookProvider = dynamic(
  () =>
    import("@growthbook/growthbook-react").then(
      (mod) => mod.GrowthBookProvider
    ),
  { ssr: false }
);

// Simplified loading placeholder - avoiding detailed skeletons to prevent layout shifts
const SimplePlaceholder = () => (
  <Box sx={{ width: "100%", height: "100%", opacity: 0 }} />
);

// Using the simplified placeholder for all components
const HeroBannerSkeleton = SimplePlaceholder;
const LogoSkeleton = SimplePlaceholder;
const TitleSkeleton = SimplePlaceholder;
const FormSkeleton = SimplePlaceholder;

// Lazy load components with SSR enabled for critical components
const HeroBanner = dynamic(
  () => import("../components/HeroBanner/HeroBanner"),
  {
    loading: () => <HeroBannerSkeleton />,
    ssr: true, // Enable SSR for critical component
  }
);

const Logo = dynamic(() => import("../components/HeroBanner/Logo"), {
  loading: () => <LogoSkeleton />,
  ssr: true, // Enable SSR to reduce CLS
});

const HackathonList = dynamic(
  () => import("../components/HackathonList/HackathonList"),
  {
    loading: () => <SimplePlaceholder />,
    ssr: true, // Enable SSR for critical component
  }
);

const TitleStyled = dynamic(
  () => import("../components/HeroBanner/TitleStyledComponent"),
  {
    loading: () => <TitleSkeleton />,
    ssr: true, // Enable SSR to reduce CLS
  }
);

const LeadForm = dynamic(() => import("../components/LeadForm/LeadForm"), {
  loading: () => <FormSkeleton />,
  ssr: true, // Enable SSR to reduce CLS
});

// Lower priority component, can load client-side
const BackgroundGrid = dynamic(
  () => import("../components/HeroBanner/BackgroundGridComponent"),
  {
    loading: () => null,
    ssr: false, // Keep as client-side only since it's decorative
  }
);

// Much simpler page skeleton to avoid layout shifts
const PageSkeleton = () => (
  <Box 
    sx={{ 
      width: "100%", 
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#ffffff"
    }}
  >
    {/* Minimize skeleton usage to reduce layout shifts */}
    <Skeleton 
      variant="rectangular" 
      width={120} 
      height={60} 
      animation="wave"
      sx={{ borderRadius: 1 }}
    />
  </Box>
);

// Main Home component
export default function Home() {
  const { user } = useAuthInfo();
  const growthbook = React.useMemo(() => initGrowthBook(user?.userId), [user]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    growthbook.init({ streaming: true });
    
    // Don't delay rendering to improve FCP
    setIsLoading(false);
  }, [growthbook]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <Fragment>
      <Head>
        <title>Opportunity Hack: Tech Hackathons for Social Good</title>
        <meta
          name="description"
          content="Empowering volunteers to create tech solutions for nonprofits, fostering community bonds."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://cdn.growthbook.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical assets with higher fetchpriority */}
        <link 
          rel="preload" 
          href="/ohack.png" 
          as="image" 
          fetchpriority="high" 
          type="image/png"
        />
        
        {/* For better caching */}
        <meta httpEquiv="Cache-Control" content="max-age=86400" />
      </Head>
      <GrowthBookProvider growthbook={growthbook}>
        {/* Eliminate Suspense outer wrapper - rely on SSR instead */}
        <BackgroundGrid />
        <LeadForm />
        <Logo />
        <TitleStyled />
        <HeroBanner />
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
