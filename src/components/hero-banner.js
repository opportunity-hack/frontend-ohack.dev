import React from "react";
import Link from 'next/link'
import Head from 'next/head';
import Stack from '@mui/material/Stack';
import Image from 'next/image'
import { useEnv } from '../context/env.context'

import * as ga from '../lib/ga'


export default function HeroBanner(){
  const logo = "https://i.imgur.com/Ih0mbYx.png";
  const { slackSignupUrl } = useEnv();

  
  const openCodeSample = () => {
    gaButton("open_code_sample");
    window.open(
      slackSignupUrl,
      "_blank",
      "noopener noreferrer"
    );
  };

  const gaButton = (actionName) => {
    ga.event({
      action: "button",
      params: {
        action_name: actionName
      }
    })
  }

  return (    
    <div className="hero-banner" style={{paddingTop: 100, position: "relative"}}>
      <Head>
        <meta charSet="utf-8" />
        <meta property="og:site_name" content="Opportunity Hack Portal" />        
      </Head>  
      
      <Image width={384} height={183} className="hero-banner__logo" src={logo} alt="Opportunity Hack logo" />
      
      <p className="hero-banner__description">Using technology that helps nonprofits succeed</p>
      
      

      <Stack direction="row" spacing={2} marginTop={0}>
      <Link href="/nonprofit/tRK5YPrc8vpHQabMYIDO">
        <button onClick={gaButton("find_a_problem")}  className="button button--primary">
          Step 1: Join our Hackathon →
        </button>
      </Link>
      
      <button onClick={openCodeSample} className="button button--primary">
       Step 2: Join us on Slack to get involved →
      </button>
      </Stack>
    </div>
  );
};
