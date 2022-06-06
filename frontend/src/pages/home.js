import React, { Fragment } from "react";
import { HeroBanner } from "../components/hero-banner";
import { Auth0Features } from "../components/auth0-features";


export const Home = () => (
  <Fragment>
    <HeroBanner />
    <Auth0Features />
  </Fragment>
);
