import React, { Fragment } from "react";
import HeroBanner from "../components/hero-banner";
import OHackFeatures from "../components/ohack-features";
import Head from 'next/head';

export default function Home() {

  return(
  <Fragment>
    <Head>
        <title>Opportunity Hack Developer Portal</title>
    </Head>
      
    <HeroBanner />
    <OHackFeatures />    
  </Fragment>
  );
}
