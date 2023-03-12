import dynamic from 'next/dynamic'
import React, { Fragment, useState } from "react";
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

const FormApp = dynamic(() =>  import('../components/FormApp/FormApp'), {
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
      <FormApp/>

    </Fragment>

  );
}


