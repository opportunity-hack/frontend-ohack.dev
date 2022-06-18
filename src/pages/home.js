import React, { Fragment } from "react";
import { HeroBanner } from "../components/hero-banner";
import { OHackFeatures } from "../components/ohack-features";


export const Home = () => (
  <Fragment>
    <HeroBanner />
    <OHackFeatures />
  </Fragment>
);
