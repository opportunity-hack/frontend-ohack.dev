import "../styles/styles.css";
import dynamic from 'next/dynamic'
import Head from "next/head";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "@propelauth/react";




import { ThemeProvider } from "@mui/material/styles";
import theme from "../assets/theme";



// TODO: What is this component? What does it do? Is it needed?
// import { Loader } from "../components/loader";

// import NavBar from "../components/nav-bar";
// import NavBar from "../components/Navbar/Navbar";

// TODO: Set up MUI for server side rendering: https://github.com/mui/material-ui/tree/HEAD/examples/material-next



// NOTE: Load dynamics below static imports to avoid eslint errors.

const AxiosWrapper = dynamic(() => import('../components/axios-wrapper'), {
  ssr: false,
})

const NavBar = dynamic(() => import('../components/Navbar/Navbar'), {
  ssr: false,
})

const Footer = dynamic(() => import('../components/Footer/Footer'), {
  ssr: false
});

const GA = dynamic(() => import('../components/GA/GA'), {
  ssr: false
});

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  const { openGraphData = [] } = pageProps;
  

  // Helpful Docs:
  // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
  // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
  return (
    
    <span>
      {/* TODO: Why do we have block level elements inside a <span>? */}
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TODO: Better meta tags for SEO: https://developers.google.com/search/docs/crawling-indexing/special-tags */}

        {openGraphData.map((og) => (
          <meta {...og} />
        ))}

        <title>{pageProps.title}</title>
      </Head>
       <AuthProvider authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}>
          <AxiosWrapper>
            <ThemeProvider theme={theme}>
            <CssBaseline>
              <div className="page-layout">
                <NavBar />
                <Component {...pageProps} />
                <Footer />              
              </div>
            </CssBaseline>
          </ThemeProvider>
        </AxiosWrapper>
      </AuthProvider>
      <GA/>
    </span>
  );
}
