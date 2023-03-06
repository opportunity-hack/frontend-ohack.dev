import dynamic from 'next/dynamic'
import React, { Fragment } from "react";
import Head from "next/head";
const HeroBanner = dynamic(() => import('../components/HeroBanner/HeroBanner'), {
  ssr: false,
});
const OHackFeatures = dynamic(() => import('../components/OHackFeatures/OHackFeatures'), { 
  ssr: false
});
const HackathonList = dynamic(() => import('../components/HackathonList/HackathonList'), {
  ssr: false
});

const PreviousHackathonList = dynamic(() =>  import('../components/HackathonList/PreviousHackathonList'), {
  ssr: false
});

export default function Home() {
  return (
    <Fragment>
      <Head>
        <title>Opportunity Hack Developer Portal</title>
      </Head>

      <HeroBanner />
      <HackathonList />
      <PreviousHackathonList />  
      
      <OHackFeatures />
    </Fragment>
  );
}
