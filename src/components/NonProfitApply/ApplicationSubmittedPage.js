import React from "react";

import Head from "next/head";

import {
  LayoutContainer,
  DetailsContainer,
  TitleBanner,
  DescriptionStyled,
} from "../../styles/nonprofits/apply/styles";

export default function ApplicationSubmittedPage() {
  return (
    <LayoutContainer key="apply_form" container>
      <Head>
        <title>Nonprofit Application</title>
        <meta />
      </Head>

      <TitleBanner>
        <Parallax bgImage={image} strength={300}></Parallax>
      </TitleBanner>

      <DetailsContainer container>
        <DescriptionStyled>
          <h1 className="content__title">Nonprofit Project Application</h1>
          <h2>Your applicaiton has been submitted.</h2>
        </DescriptionStyled>
      </DetailsContainer>
    </LayoutContainer>
  );
}
