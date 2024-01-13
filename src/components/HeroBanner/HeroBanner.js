import { LoginButton } from "../Navbar/styles";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";

import { useEnv } from '../../context/env.context';
import ReactPixel from 'react-facebook-pixel';
import { Grid } from "@mui/material";

import * as ga from '../../lib/ga';
import { useAuth0 } from '@auth0/auth0-react';
import dynamic from 'next/dynamic';

const ThePlaceWhere = dynamic(() => import('../HeroBanner/ThePlaceWhere'), {
  ssr: true
});

function HeroBanner() {
  const { slackSignupUrl } = useEnv();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = null; // { em: 'someemail@.com' }; // optional
  ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
  

  
  return (
    <Grid
      container
      direction='row'
      justifyContent='center'
      alignItem='center'
      style={{
        padding: "8rem 6rem 6rem 6rem",
        height: "100%",
        width: "80%",
        margin: "auto"    
      }}
    >
      <Grid style={{
        position: "absolute",
        width: "100%",
        height: "70rem",
        top: "-20rem",
        transform: "skewY(-10deg)",
        background: "linear-gradient(to bottom right, #58cffb 23%, #CCCCFF 89%)",
        zIndex: "-100",
      }} />

      
      {/* Left Container */}
      <ThePlaceWhere />
      {/* Right Container */}
      <Grid xs={12} md={5} lg={5} flex justifyContent="center" alignItems="center">
          
      </Grid>
    </Grid>
  );
}

export default HeroBanner;
