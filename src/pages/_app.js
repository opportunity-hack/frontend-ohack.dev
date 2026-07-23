import "../styles/styles.css";
import dynamic from 'next/dynamic'
import Head from "next/head";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "@propelauth/react";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import theme from "../assets/theme";
import { ShoppingCartProvider } from "../context/ShoppingCartContext";
// Static import: SSR-safe (only registers axios interceptors in useEffect).
// IMPORTANT: must NOT be dynamic(ssr:false) — that disables SSR for the entire
// tree (empty <body>, empty titles, CWV collapse; June 2026 incident).
import AxiosWrapper from '../components/axios-wrapper';

// Placeholder heights tuned to match the rendered NavBar/Footer so the shell
// doesn't shift when these chunks load (major source of site-wide CLS).
const NavBarPlaceholder = () => <Box sx={{ height: '64px', width: '100%' }} />;
const FooterPlaceholder = () => (
  <Box sx={{ height: { xs: '760px', md: '560px' }, width: '100%', bgcolor: theme.palette.primary.main }} />
);

// NOTE: Load dynamics below static imports to avoid eslint errors.

// SSR the NavBar shell so the layout above the fold is stable before hydration.
// Auth-dependent avatar/login toggle is now wrapped in a fixed-width slot
// inside Navbar.js so the flip on hydration doesn't shift layout.
const NavBar = dynamic(() => import('../components/Navbar/Navbar'), {
  ssr: true,
  loading: () => <NavBarPlaceholder />
})

const Footer = dynamic(() => import('../components/Footer/Footer'), {
  ssr: true,
  loading: () => <FooterPlaceholder />
});

const GA = dynamic(() => import('../components/GA/GA'), {
  ssr: false
});

const OnboardingDialog = dynamic(() => import('../components/Onboarding/OnboardingDialog'), {
  ssr: false
});

const ProfileCompletionPrompt = dynamic(() => import('../components/ProfileCompletionPrompt/ProfileCompletionPrompt'), {
  ssr: false
});

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  const { openGraphData = [] } = pageProps;
  const router = useRouter();
  
  // Check if this is the print-timeline page
  const isPrintTimelinePage = router.pathname === '/hack/[event_id]/print-timeline';
  
  return (
    <>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TODO: Better meta tags for SEO: https://developers.google.com/search/docs/crawling-indexing/special-tags */}

        {openGraphData.map((og, index) => (
          <meta key={index} {...og} />
        ))}

        {pageProps.canonical && (
          <link rel="canonical" href={pageProps.canonical} />
        )}

        {pageProps.title && <title>{pageProps.title}</title>}

        {pageProps.structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(pageProps.structuredData),
            }}
          />
        )}

        {/* Global Organization schema — renders on every page so brand SERP
            features (knowledge panel eligibility, sameAs verification) work
            sitewide. Page-level WebPage / BreadcrumbList / FAQPage scripts
            reference this entity via @id. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.ohack.dev/#organization",
              name: "Opportunity Hack",
              alternateName: "OHack",
              url: "https://www.ohack.dev",
              logo: {
                "@type": "ImageObject",
                url: "https://cdn.ohack.dev/ohack.dev/ohack.png",
              },
              description:
                "501(c)(3) nonprofit connecting volunteer software developers with nonprofits to build free, custom software since 2013.",
              foundingDate: "2013",
              sameAs: [
                "https://www.linkedin.com/company/opportunity-hack/",
                "https://github.com/opportunity-hack",
                "https://twitter.com/opportunityhack",
                "https://www.instagram.com/opportunityhack/",
                "https://www.youtube.com/@OpportunityHack",
              ],
            }),
          }}
        />
      </Head>
      <AuthProvider authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}>
        <AxiosWrapper>
          <ThemeProvider theme={theme}>
            <ShoppingCartProvider>
            <CssBaseline>
              <Box className="page-layout" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {!isPrintTimelinePage && <NavBar />}
                <Component {...pageProps} />
                {!isPrintTimelinePage && <Footer />}
              </Box>
            </CssBaseline>
            <OnboardingDialog />
            <ProfileCompletionPrompt />
            </ShoppingCartProvider>
          </ThemeProvider>
        </AxiosWrapper>
      </AuthProvider>
      <GA/>
    </>
  );
}
