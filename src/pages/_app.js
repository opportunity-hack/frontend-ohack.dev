import "../styles/styles.css";
import CssBaseline from '@mui/material/CssBaseline';
import { Auth0ProviderWithHistory } from "../auth0-provider-with-history";
import { useAuth0 } from "@auth0/auth0-react";

import { Loader } from "../components/loader";
import NavBar from "../components/nav-bar";
import Footer from "../components/footer";


// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    let { isLoading } = useAuth0();

    return(
    <Auth0ProviderWithHistory>
            
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