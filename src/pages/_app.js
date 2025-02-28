import "../styles/styles.css";
import dynamic from 'next/dynamic'
import Head from "next/head";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "@propelauth/react";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import theme from "../assets/theme";

// Simple placeholder components to reduce CLS
const NavBarPlaceholder = () => <Box sx={{ height: '64px', width: '100%' }} />;
const FooterPlaceholder = () => <Box sx={{ height: '500px', width: '100%', bgcolor: theme.palette.primary.main }} />;

// NOTE: Load dynamics below static imports to avoid eslint errors.

const AxiosWrapper = dynamic(() => import('../components/axios-wrapper'), {
  ssr: false,
  loading: () => null
})

const NavBar = dynamic(() => import('../components/Navbar/Navbar'), {
  ssr: false,
  loading: () => <NavBarPlaceholder />
})

const Footer = dynamic(() => import('../components/Footer/Footer'), {
  ssr: false,
  loading: () => <FooterPlaceholder />
});

const GA = dynamic(() => import('../components/GA/GA'), {
  ssr: false
});

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  const { openGraphData = [] } = pageProps;
  
  return (
    <>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TODO: Better meta tags for SEO: https://developers.google.com/search/docs/crawling-indexing/special-tags */}

        {openGraphData.map((og, index) => (
          <meta key={index} {...og} />
        ))}

        <title>{pageProps.title}</title>
      </Head>
      <AuthProvider authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}>
        <AxiosWrapper>
          <ThemeProvider theme={theme}>
            <CssBaseline>
              <Box className="page-layout" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <NavBar />                
                <Component {...pageProps} />                
                <Footer />              
              </Box>
            </CssBaseline>
          </ThemeProvider>
        </AxiosWrapper>
      </AuthProvider>
      <GA/>
    </>
  );
}
