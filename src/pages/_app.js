import "../styles/styles.css";
import CssBaseline from '@mui/material/CssBaseline';
import { Auth0ProviderWithHistory } from "../auth0-provider-with-history";
import { useAuth0 } from "@auth0/auth0-react";

import { Loader } from "../components/loader";
import NavBar from "../components/nav-bar";
import Footer from "../components/footer";
import Head from 'next/head';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    let { isLoading } = useAuth0();
    const { openGraphData = [] } = pageProps;

    return(
    <Auth0ProviderWithHistory>
        <Head>
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            
            {openGraphData.map((og) => (
                <meta {...og} />                
            ))}

                <title>{pageProps.title}</title>
        </Head>
        <CssBaseline>            
                <div className="page-layout">                                         
                    <NavBar />     
                    <Component {...pageProps} />
                    <Footer />                
                </div>
        </CssBaseline>
    </Auth0ProviderWithHistory>
    );
}