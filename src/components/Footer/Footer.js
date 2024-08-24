import React from "react";
import Link from "next/link";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
  Instagram,
  Facebook,
  LinkedIn,
  Twitter,
  GitHub,
} from "@mui/icons-material";

import { FaThreads, FaSlack } from "react-icons/fa6";

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
import { Typography } from "@mui/material";
import { Tooltip } from "@mui/material";

export default function Footer() {
  // Learned about this on Threads at https://www.threads.net/@0xjessel/post/C-1AHyASoGl?xmt=AQGzgMCcyL7ymZPssMP_acQCi8nCAcqe9jxxnM10JdQGdg
  const commitSHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  let commitMessage = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE;

  let commitURL = null;
  if (commitMessage) {
    const messageMatch = commitMessage.match(/^.*/g); // grabs commit title only
    commitMessage = messageMatch.length > 0 ? messageMatch[0] : "";
    commitURL = (
      <Link
        data-umami-event="click--github_commit"
        href={`https://github.com/opportunity-hack/frontend-ohack.dev/commit/${commitSHA}`}
        isExternal
      >
        <Tooltip
          hasArrow
          title={commitMessage}
          gutter={12}          
          placement="top"
          color="black"
          bg="white"
          fontSize="md"          
        >
          <Typography as="span" display="inline" fontFamily="mono" color="white">
            {commitSHA.slice(0, 7)}
          </Typography>
        </Tooltip>
      </Link>
    );
  }

  const SocialIcon = ({ href, ariaLabel, icon: Icon }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        marginRight: "1rem",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <Icon style={{ width: "24px", height: "24px" }} />
    </a>
  );

  return (
    <FooterContainer container>
      <InnerContainer container>
        <TextContainer container xs={12} md={7} lg={8}>
          <StyledText>Our Mission</StyledText>
          <MutedText>
            <p>
              We empower volunteers to make a difference by creating technical
              solutions for nonprofit organizations while fostering lasting
              connections within their communities.
            </p>
          </MutedText>

          <StyledText style={{ marginTop: "2rem" }}>Follow Us</StyledText>
          <nav aria-label="Social media links">
          <SocialIcon 
            href="https://www.instagram.com/opportunityhack/" 
            ariaLabel="Follow us on Instagram"
            icon={Instagram}
          />
          <SocialIcon 
            href="https://www.facebook.com/OpportunityHack/" 
            ariaLabel="Follow us on Facebook"
            icon={Facebook}
          />
          <SocialIcon 
            href="https://www.linkedin.com/company/opportunity-hack/" 
            ariaLabel="Connect with us on LinkedIn"
            icon={LinkedIn}
          />
          <SocialIcon 
            href="https://www.threads.net/@opportunityhack" 
            ariaLabel="Follow us on Threads"
            icon={FaThreads}
          />
          <SocialIcon 
            href="https://opportunity-hack.slack.com" 
            ariaLabel="Join our Slack community"
            icon={FaSlack}
          />
          <SocialIcon 
            href="https://twitter.com/opportunityhack" 
            ariaLabel="Follow us on Twitter"
            icon={Twitter}
          />
          <SocialIcon 
            href="https://github.com/opportunity-hack/" 
            ariaLabel="View our projects on GitHub"
            icon={GitHub}
          />
        </nav>
          <div style={{ marginTop: "1rem" }}>
            <Hashtag>#socialgood</Hashtag> &nbsp;
            <Hashtag>#nonprofit</Hashtag> &nbsp;
            <Hashtag>#volunteer</Hashtag> &nbsp;
            <Hashtag>#socialimpact</Hashtag> &nbsp;
            <Hashtag>#communitybuilding</Hashtag> &nbsp;
            <Hashtag>#technicalsolutions</Hashtag> &nbsp;
            <Hashtag>#skillsbasedvolunteering</Hashtag> &nbsp;
            <Hashtag>#makeadifference</Hashtag> &nbsp;
            <Hashtag>#givingback</Hashtag> &nbsp;
            <Hashtag>#changemakers</Hashtag> &nbsp;
            <Hashtag>#empowerment</Hashtag> &nbsp;
          </div>
          <MutedText style={{ marginTop: "3rem" }}>
            Opportunity Hack Inc. EIN: 84-5113049
          </MutedText>
        </TextContainer>
        <TextContainer container xs={12} md={5} lg={4}>
          <LinkList>
            {/* Link integration with icons for a single-click interaction */}
            <LinkListItem key="whatisohack">
              <StyledLink href="https://www.ohack.org/">
                What's Opportunity Hack? <OpenInNewIcon />
              </StyledLink>
            </LinkListItem>
            <LinkListItem key="sponsor">
              <StyledLink href="https://www.ohack.org/about/sponsorship">
                Sponsor Social Good
              </StyledLink>{" "}
              <OpenInNewIcon />
            </LinkListItem>            
            <LinkListItem key="faqohack">
              <StyledLink href="https://www.ohack.org/about/faq">
                FAQ
              </StyledLink>{" "}
              <OpenInNewIcon />
            </LinkListItem>
            <LinkListItem key="historyohack">
              <StyledLink href="https://www.ohack.org/about/history">
                Our History
              </StyledLink>{" "}
              <OpenInNewIcon />
            </LinkListItem>
            <LinkListItem key="slackohack">
              <StyledLink href="https://opportunity-hack.slack.com/">
                Join Us on Slack
              </StyledLink>{" "}
              <FaSlack />
            </LinkListItem>
            <LinkListItem key="privacypolicy">
              <StyledLink href="/about/privacy-policy">
                Privacy Policy
              </StyledLink>
            </LinkListItem>
            <LinkListItem key="githubpublicgood">
              This website is a public good
              <br />
              <StyledLink href="https://github.com/opportunity-hack/frontend-ohack.dev">
                Fork this on GitHub
              </StyledLink>
            </LinkListItem>
            {commitURL}
          </LinkList>
        </TextContainer>
      </InnerContainer>
    </FooterContainer>
  );
}
