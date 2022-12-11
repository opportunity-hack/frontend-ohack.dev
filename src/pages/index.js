import React, { Fragment } from "react";
import Head from "next/head";
import HeroBanner from "../components/HeroBanner/HeroBanner";
import OHackFeatures from "../components/OHackFeatures/OHackFeatures";
import HackathonList from "../components/HackathonList/HackathonList";

export default function Home() {
  return (
    <Fragment>
      <Head>
        <title>Opportunity Hack Developer Portal</title>
      </Head>

      <HeroBanner />
      <HackathonList />
      <OHackFeatures />
    </Fragment>
  );
}
