import React from "react";
// import FooterHyperlink from "../footer-hyperlink";
import Link from "next/link";
// import Image from "next/image";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {
  FooterContainer,
  TextContainer,
  InnerContainer,
  MutedText,
  StyledLink,
  LinkList,
  LinkListItem,
  StyledText,
  IconLink,
  Hashtag,
} from "./styles";
import {
  Instagram,
  Facebook,
  LinkedIn,
  Twitter,
  GitHub,
} from "@mui/icons-material";

export default function Footer() {
  const resourceList = [
    {
      path: "https://www.ohack.org",
      label: "What's Opportunity Hack?",
    },
    {
      path: "https://www.ohack.org/projects",
      label: "Projects",
    },
    {
      path: "https://github.com/opportunity-hack/",
      label: "GitHub",
    },
    {
      path: "https://www.ohack.org/about/faq",
      label: "FAQ",
    },
    {
      path: "https://www.ohack.org/about/history",
      label: "Our history",
    },
    {
      path: "https://github.com/opportunity-hack/frontend-ohack.dev",
      label: (
        <span>
          <GitHubIcon /> Fork this on GitHub
        </span>
      ),
    },
  ];

  const hashtags = [
    "#socialgood", "#nonprofit", "#volunteer", "#socialimpact", "#communitybuilding", "#technicalsolutions", "#skillsbasedvolunteering", "#makeadifference", "#givingback", "#changemakers", "#empowerment"
  ]

  return (
    <FooterContainer container>
      <InnerContainer container>
        <TextContainer container xs={12} md={7} lg={8}>
          <Link href="/">
            <>
              <StyledText>Our Mission</StyledText>
              <MutedText>
                <p>
                We empower volunteers to make a difference by creating technical solutions for nonprofit organizations while fostering lasting connections within their communities.
                </p>
                We are driven by the desire to make a positive impact on the world. 
                Our mission is to bring together skilled volunteers and passionate nonprofit organizations to create simple yet effective technological solutions. 
                Through their dedicated work, our volunteers gain invaluable experience while making a tangible difference in the lives of those in need. 
                Together, we build more than just software – we forge powerful bonds that transcend the project and enrich our communities for years to come.
                Join us in our mission to create a brighter future for all.<br></br>
              </MutedText>

              <StyledText style={{ marginTop: "2rem" }}>Follow Us</StyledText>
              <IconLink href="https://www.instagram.com/opportunityhack/">
                <Instagram fontSize="large" style={{ marginRight: "2rem" }} />
              </IconLink>
              <IconLink href="https://www.facebook.com/OpportunityHack/">
                <Facebook fontSize="large" style={{ marginRight: "2rem" }} />
              </IconLink>
              <IconLink href="https://www.linkedin.com/company/opportunity-hack/">
                <LinkedIn fontSize="large" style={{ marginRight: "2rem" }} />
              </IconLink>
              <IconLink href="https://twitter.com/opportunityhack">
                <Twitter fontSize="large" style={{ marginRight: "2rem" }} />
              </IconLink>
              <IconLink href="https://github.com/opportunity-hack/">
                <GitHub fontSize="large" style={{ marginRight: "2rem" }} />
                <br></br>
              </IconLink>
              {hashtags.map((h) => {
                return <><Hashtag>{h}</Hashtag> &nbsp;</>
              })}
              <MutedText style={{ marginTop: "3rem" }}>
                Opportunity Hack Inc. EIN: 84-5113049
              </MutedText>                            
            </>
          </Link>
        </TextContainer>
        <TextContainer container xs={12} md={5} lg={4}>
          <LinkList>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/">What's Opportunity Hack?</StyledLink> <OpenInNewIcon />
            </LinkListItem>            
            <LinkListItem>
              <StyledLink href="https://github.com/opportunity-hack/">GitHub</StyledLink> <GitHubIcon />
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/about/faq">FAQ</StyledLink> <OpenInNewIcon />
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/about/history">Our History</StyledLink> <OpenInNewIcon />
            </LinkListItem>
            <LinkListItem>
              This website is a public good<br/><StyledLink href="https://github.com/opportunity-hack/frontend-ohack.dev">Fork this on GitHub</StyledLink>              
            </LinkListItem>
          </LinkList>
        </TextContainer>
      </InnerContainer>
    </FooterContainer>
  );
}
