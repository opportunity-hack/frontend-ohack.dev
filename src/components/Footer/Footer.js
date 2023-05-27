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
  

  const hashtags = [
    "#socialgood", "#nonprofit", "#volunteer", "#socialimpact", "#communitybuilding", "#technicalsolutions", "#skillsbasedvolunteering", "#makeadifference", "#givingback", "#changemakers", "#empowerment"
  ]

  return (
    <FooterContainer container>
      <InnerContainer container>
        <TextContainer container xs={12} md={7} lg={8}>
          <Link key="mission" href="/">
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
                Join us in our mission to create a brighter future for all.                
                <br /><br />
                🧑🏿‍💻 As computer science students or software engineers, we have a moral and ethical obligation to use our skills to make a positive impact on the world. One way to do this is by contributing to Opportunity Hack, a hackathon focused on creating technology solutions for social good.
                <br /><br />
                💡 By participating in Opportunity Hack, you have the opportunity to use your technical skills to make a real difference in the lives of others. 
                In addition to the personal satisfaction of using your skills for good, participating in Opportunity Hack can also help you build your resume and portfolio. 
                Demonstrating your ability to create technology solutions that have a positive impact on society can be a powerful way to stand out to potential employers and make a name for yourself in the industry.
                <br /><br />
                ❤️ But perhaps most importantly, contributing to Opportunity Hack can evoke a sense of purpose and fulfillment that is often missing from traditional software engineering jobs. 
                By using your skills to help others, you can find meaning and satisfaction in your work that goes beyond just writing code.
                <br /><br />
                💻 So if you're looking for a way to make a difference with your skills, consider participating in Opportunity Hack. 
                Not only will you be able to contribute to social good, but you'll also be able to build your skills, your resume, and your sense of purpose and fulfillment.
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
            <LinkListItem key="whatisohack">
              <StyledLink href="https://www.ohack.org/">What's Opportunity Hack?</StyledLink> <OpenInNewIcon />
            </LinkListItem>            
            <LinkListItem key="sponsor">
              <StyledLink href="https://www.ohack.org/about/sponsorship">Sponsor Social Good</StyledLink> <OpenInNewIcon />
            </LinkListItem>                        
            <LinkListItem key="githubohack">
              <StyledLink href="https://github.com/opportunity-hack/">GitHub</StyledLink> <GitHubIcon />
            </LinkListItem>
            <LinkListItem key="faqohack">
              <StyledLink href="https://www.ohack.org/about/faq">FAQ</StyledLink> <OpenInNewIcon />
            </LinkListItem>
            <LinkListItem key="historyohack">
              <StyledLink href="https://www.ohack.org/about/history">Our History</StyledLink> <OpenInNewIcon />
            </LinkListItem>
            <LinkListItem key="githubpublicgood">
              This website is a public good<br/><StyledLink href="https://github.com/opportunity-hack/frontend-ohack.dev">Fork this on GitHub</StyledLink>              
            </LinkListItem>
          </LinkList>
        </TextContainer>
      </InnerContainer>
    </FooterContainer>
  );
}
