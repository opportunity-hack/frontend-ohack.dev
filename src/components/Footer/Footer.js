import React from "react";
import FooterHyperlink from "../footer-hyperlink";
import Link from "next/link";
import Image from "next/image";
import GitHubIcon from "@mui/icons-material/GitHub";
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

  return (
    <FooterContainer container>
      <InnerContainer container>
        <TextContainer container xs={12} md={7} lg={8}>
          <Link href="/">
            <>
              <StyledText>Our Mission</StyledText>
              <MutedText>
                We exist to create simple technical solutions for nonprofit
                organizations. We utilize volunteers, who are industry
                professionals or local students to the area in order to provide
                them valuable experience as they create these solutions for
                nonprofit organizations. We also look to create durable bonds
                between volunteers, mentors, and their local communities as they
                work together to create a meaningful change to society.<br></br>
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
              </IconLink>
              <MutedText style={{ marginTop: "3rem" }}>
                Opportunity Hack Inc. EIN: 84-5113049
              </MutedText>
            </>
          </Link>
        </TextContainer>
        <TextContainer container xs={12} md={5} lg={4}>
          <LinkList>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/">What's Opportunity Hack?</StyledLink>
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/projects">Projects</StyledLink>
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://github.com/opportunity-hack/">GitHub</StyledLink>
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/about/faq">FAQ</StyledLink>
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://www.ohack.org/about/history">Our History</StyledLink>
            </LinkListItem>
            <LinkListItem>
              <StyledLink href="https://github.com/opportunity-hack/frontend-ohack.dev">Fork on GitHub</StyledLink>
            </LinkListItem>
          </LinkList>
        </TextContainer>
      </InnerContainer>
    </FooterContainer>
  );
}
