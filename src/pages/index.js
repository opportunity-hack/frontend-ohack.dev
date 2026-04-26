import React, { Fragment, Suspense } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useAuthInfo } from "@propelauth/react";

import { Skeleton, Box, Container, Typography } from "@mui/material";

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

// Reserve above-the-fold space so the leaderboard popping in doesn't shove
// HeroBanner/LeadForm/HackathonList down on first paint.
const HeartsLeaderboardPlaceholder = () => (
  <Box
    aria-hidden="true"
    sx={{ minHeight: { xs: 128, md: 172 }, mb: { xs: 1.5, md: 2 } }}
  />
);

const HeartsLeaderboard = dynamic(
  () => import("../components/Hearts/HeartsLeaderboard"),
  {
    loading: () => <HeartsLeaderboardPlaceholder />,
    ssr: false, // Not critical for first paint
  }
);

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

  const [isLoading, setIsLoading] = React.useState(false);



  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <Fragment>
      <Head>
        <title>Opportunity Hack — Hackathons Where Developers Build Free Software for Nonprofits</title>
        <meta
          name="description"
          content="Since 2013, Opportunity Hack has connected 3,000+ developers with 200+ nonprofits to build free software for social good. Join our annual hackathon at ASU."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        
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
      
        {/* Optimized layout for better above-the-fold content */}
        <BackgroundGrid />
        <Container maxWidth="xl" sx={{ mt: { xs: 9, md: 10 }, px: { xs: 1.5, sm: 3, md: 4 } }}>
          {/* 1. Brand — attention */}
          <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 1.5 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                mb: 1,
                textAlign: 'center'
              }}
            >
              Tech Hackathons for Social Good
            </Typography>
            <Logo />
            <TitleStyled />
          </Box>

          {/* 2. Social proof — trust (Cialdini: people follow people) */}
          <HeartsLeaderboard />

          {/* 3. CTAs — action (visitor is now primed) */}
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <HeroBanner />
          </Box>

          {/* 4. Newsletter — stay connected */}
          <LeadForm />

          {/* 5. Events */}
          <HackathonList compact={true} />
        </Container>      
    </Fragment>
  );
}

export async function getStaticProps() {
  const title =
    "Opportunity Hack — Hackathons Where Developers Build Free Software for Nonprofits";
  const metaDescription =
    "Since 2013, Opportunity Hack has connected 3,000+ developers with 200+ nonprofits to build free software for social good. Join our annual hackathon at ASU.";

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
