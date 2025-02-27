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

// Hero Banner Loading Skeleton
const HeroBannerSkeleton = () => (
  <Box sx={{ width: "100%", padding: 3 }}>
    <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="80%" height={60} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
    <Grid container spacing={1} sx={{ mt: 2 }}>
      <Grid item xs={6} sm={4} md={3}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Grid>
    </Grid>
  </Box>
);

// Logo Loading Skeleton
const LogoSkeleton = () => (
  <Box sx={{ width: "100%", display: "flex", justifyContent: "center", my: 2 }}>
    <Skeleton variant="rectangular" width={120} height={60} animation="wave" />
  </Box>
);

// Title Loading Skeleton
const TitleSkeleton = () => (
  <Box sx={{ width: "100%", textAlign: "center", my: 2 }}>
    <Skeleton variant="text" width="80%" height={60} sx={{ mx: "auto" }} />
  </Box>
);

// Form Loading Skeleton
const FormSkeleton = () => (
  <Box sx={{ width: "100%", maxWidth: 400, mx: "auto", my: 2, p: 2 }}>
    <Skeleton variant="text" width="100%" height={30} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={50} />
  </Box>
);

// Lazy load components
const HeroBanner = dynamic(
  () => import("../components/HeroBanner/HeroBanner"),
  {
    loading: () => <HeroBannerSkeleton />,
    ssr: true,
  }
);

const Logo = dynamic(() => import("../components/HeroBanner/Logo"), {
  loading: () => <LogoSkeleton />,
  ssr: false,
});

const HackathonList = dynamic(
  () => import("../components/HackathonList/HackathonList"),
  {
    loading: () => <Box sx={{ width: "100%" }}></Box>,
    ssr: true,
  }
);

const TitleStyled = dynamic(
  () => import("../components/HeroBanner/TitleStyledComponent"),
  {
    loading: () => <TitleSkeleton />,
    ssr: false,
  }
);

const LeadForm = dynamic(() => import("../components/LeadForm/LeadForm"), {
  loading: () => <FormSkeleton />,
  ssr: false,
});

const BackgroundGrid = dynamic(
  () => import("../components/HeroBanner/BackgroundGridComponent"),
  {
    loading: () => null,
    ssr: false,
  }
);

// Page skeleton to show when entire page is loading
const PageSkeleton = () => (
  <Box sx={{ width: "100%", pb: 4 }}>
    <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1100 }}>
      <Skeleton variant="rectangular" width="100%" height={64} />
    </Box>
    
    <Container maxWidth="lg" sx={{ pt: 8 }}>
      <LogoSkeleton />
      <TitleSkeleton />
      <FormSkeleton />
      <HeroBannerSkeleton />
      
      <Box sx={{ mt: 6 }}>
        <Skeleton variant="text" width="60%" height={50} sx={{ mx: "auto", mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  </Box>
);

// Main Home component
export default function Home() {
  const { user } = useAuthInfo();
  const growthbook = React.useMemo(() => initGrowthBook(user?.userId), [user]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Preload critical components
  React.useEffect(() => {
    // Preload important components in the background
    const preloadComponents = async () => {
      // Load in parallel
      const components = [
        import("../components/HeroBanner/HeroBanner"),
        import("../components/HeroBanner/Logo"),
        import("../components/HackathonList/HackathonList")
      ];
      
      await Promise.all(components);
    };
    
    // Preload without blocking
    preloadComponents();
  }, []);

  React.useEffect(() => {
    growthbook.init({ streaming: true });
    
    // Simulate page loading state, but keep it brief
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Small delay to avoid flash of loading state for fast connections
    
    return () => clearTimeout(timer);
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
        <link rel="preconnect" href="https://cdn.growthbook.io" />
        <link rel="preload" href="/ohack.png" as="image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </Head>
      <GrowthBookProvider growthbook={growthbook}>
        <Suspense
          fallback={
            <Container maxWidth="lg">
              <Box sx={{ width: "100%", py: 4 }}>
                <LogoSkeleton />
                <TitleSkeleton />
                <FormSkeleton />
                <HeroBannerSkeleton />
              </Box>
            </Container>
          }
        >
          <BackgroundGrid />
          <LeadForm />
          <Logo />
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
