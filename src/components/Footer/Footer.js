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

// Define high contrast colors for accessibility
const accessibilityStyles = {
  linkColor: "#FFFFFF", // Bright white for better contrast
  mutedTextColor: "#E0E0E0", // Lighter gray that meets contrast requirements
  hashtagColor: "#FFFFFF", // Bright white
  hashtagBackground: "rgba(255, 255, 255, 0.2)", // Slightly visible background
  iconHoverColor: "#FFEB3B", // Bright yellow for hover state
}

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
          <Typography as="span" display="inline" fontFamily="mono" color={accessibilityStyles.linkColor}>
            {commitSHA ? commitSHA.slice(0, 7) : ""}
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
        width: "40px",
        height: "40px", 
        marginRight: "1rem",
        color: accessibilityStyles.linkColor,
        textDecoration: "none",
        borderRadius: "50%",
        transition: "all 0.2s ease",
        "&:hover, &:focus": {
          color: accessibilityStyles.iconHoverColor,
          transform: "scale(1.1)",
          outline: `2px solid ${accessibilityStyles.linkColor}`,
        },
      }}
    >
      <Icon style={{ width: "28px", height: "28px" }} />
    </a>
  );

  return (
    <FooterContainer container style={{ 
      backgroundColor: "#1A1A2E", // Darker background for better contrast
      color: accessibilityStyles.linkColor,
    }}>
      <InnerContainer container>
        <TextContainer container item xs={12} md={7} lg={8} style={{ minHeight: '220px' }}>
          <div style={{ width: '100%' }}>
            <StyledText style={{ color: accessibilityStyles.linkColor, fontWeight: "600" }}>Our Mission</StyledText>
            <MutedText style={{ 
              height: '70px',
              color: accessibilityStyles.mutedTextColor,
              fontSize: "1.05rem", // Slightly larger for better readability
            }}>
              <p style={{ margin: '0' }}>
                To empower students, professionals, and nonprofits to collaboratively 
                create sustainable tech solutions that drive social impact and foster learning.
              </p>
            </MutedText>

            <StyledText style={{ 
              marginTop: "2rem", 
              color: accessibilityStyles.linkColor,
              fontWeight: "600" 
            }}>Our Vision</StyledText>
            <MutedText style={{ 
              height: '70px',
              color: accessibilityStyles.mutedTextColor,
              fontSize: "1.05rem", // Slightly larger for better readability
            }}>
              <p style={{ margin: '0' }}>
                To build a global community where individuals can accelerate their career 
                growth while making a lasting impact for nonprofits.
              </p>
            </MutedText>
          </div>

          <StyledText style={{ 
            marginTop: "2rem",
            color: accessibilityStyles.linkColor,
            fontWeight: "600" 
          }}>Follow Us</StyledText>
          <nav aria-label="Social media links" style={{ height: '48px' }}> 
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
          <div style={{ marginTop: "2rem", minHeight: '60px' }}>
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500", // Medium weight for better readability
              padding: "0.35rem 0.6rem", // Slightly larger padding
            }}>#socialgood</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#nonprofit</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#volunteer</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#socialimpact</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#communitybuilding</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#technicalsolutions</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#skillsbasedvolunteering</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#makeadifference</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#givingback</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#changemakers</Hashtag> &nbsp;
            <Hashtag style={{ 
              color: accessibilityStyles.hashtagColor,
              backgroundColor: accessibilityStyles.hashtagBackground,
              fontWeight: "500",
              padding: "0.35rem 0.6rem",
            }}>#empowerment</Hashtag> &nbsp;
          </div>
          <MutedText style={{ 
            marginTop: "3rem",
            color: accessibilityStyles.mutedTextColor,
            fontSize: "1rem",
          }}>
            Opportunity Hack Inc. EIN: 84-5113049
          </MutedText>
        </TextContainer>
        <TextContainer container item xs={12} md={5} lg={4} style={{ minHeight: '320px' }}>
          <LinkList style={{ width: '100%' }}>
            {/* Link integration with icons for a single-click interaction */}
            <LinkListItem key="whatisohack">
              <StyledLink href="https://www.ohack.org/" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
                "&:hover, &:focus": {
                  color: accessibilityStyles.iconHoverColor,
                  textDecoration: "underline",
                }
              }}>
                What's Opportunity Hack? <OpenInNewIcon />
              </StyledLink>
            </LinkListItem>
            <LinkListItem key="sponsor">
              <StyledLink href="https://www.ohack.org/about/sponsorship" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
              }}>
                Sponsor Social Good
              </StyledLink>{" "}
              <OpenInNewIcon style={{ color: accessibilityStyles.linkColor }} />
            </LinkListItem>            
            <LinkListItem key="faqohack">
              <StyledLink href="https://www.ohack.org/about/faq" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
              }}>
                FAQ
              </StyledLink>{" "}
              <OpenInNewIcon style={{ color: accessibilityStyles.linkColor }} />
            </LinkListItem>
            <LinkListItem key="historyohack">
              <StyledLink href="https://www.ohack.org/about/history" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
              }}>
                Our History
              </StyledLink>{" "}
              <OpenInNewIcon style={{ color: accessibilityStyles.linkColor }} />
            </LinkListItem>
            <LinkListItem key="slackohack">
              <StyledLink href="https://opportunity-hack.slack.com/" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
              }}>
                Join Us on Slack
              </StyledLink>{" "}
              <FaSlack style={{ color: accessibilityStyles.linkColor }} />
            </LinkListItem>
            <LinkListItem key="privacypolicy">
              <StyledLink href="/about/privacy-policy" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
              }}>
                Privacy Policy
              </StyledLink>
            </LinkListItem>
            <LinkListItem key="githubpublicgood" style={{ color: accessibilityStyles.mutedTextColor }}>
              This website is a public good.&nbsp; 
              <br />
              <StyledLink href="https://github.com/opportunity-hack/frontend-ohack.dev" style={{ 
                color: accessibilityStyles.linkColor,
                fontWeight: "500",
                fontSize: "1.05rem",
              }}>
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
