import React, { Fragment } from "react";
import OHackFeatures from "../components/ohack-features";
import Head from "next/head";
import HackathonList from "../components/hackathon-list";
import HeroBanner from "../components/HeroBanner/HeroBanner";

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
