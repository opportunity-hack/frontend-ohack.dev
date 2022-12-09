import "../styles/styles.css";
import CssBaseline from '@mui/material/CssBaseline';
import { Auth0ProviderWithHistory } from "../auth0-provider-with-history";
import { useAuth0 } from "@auth0/auth0-react";

import { Loader } from "../components/loader";
// import NavBar from "../components/nav-bar";
import NavBar from "../components/Navbar/Navbar";
import Footer from "../components/footer";
import Head from 'next/head';

import * as ga from '../lib/ga'
import { useRouter } from 'next/router'
import { useEffect } from 'react'


// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    let { isLoading } = useAuth0();
    const { openGraphData = [] } = pageProps;
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = (url) => {
            ga.pageview(url)
        }
        //When the component is mounted, subscribe to router changes
        //and log those page views
        router.events.on('routeChangeComplete', handleRouteChange)

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events])

    // Helpful Docs:
    // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
    // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
    return(
    <span>
        <Head>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            
            {openGraphData.map((og) => (
                <meta {...og} />                
            ))}

            <title>{pageProps.title}</title>


        </Head>
    <Auth0ProviderWithHistory>        
        <CssBaseline>            
                <div className="page-layout">                                         
                    <NavBar />     
                    <Component {...pageProps} />
                    <Footer />                
                </div>
        </CssBaseline>
    </Auth0ProviderWithHistory>
    </span>
    );
}