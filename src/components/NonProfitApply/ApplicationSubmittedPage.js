import React from "react";

import Head from "next/head";
import { Parallax } from 'react-parallax';

import {
  LayoutContainer,
  DetailsContainer,
  TitleBanner,
  DescriptionStyled,
} from "../../styles/nonprofits/apply/styles";

export default function ApplicationSubmittedPage() {  
  const image = "https://images.pexels.com/photos/236603/pexels-photo-236603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

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
