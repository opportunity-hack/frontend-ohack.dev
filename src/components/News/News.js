import React, { useState, useEffect } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Alert, Snackbar, Skeleton, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  BlankContainer,
  ButtonContainersSmall,
  CaptionContainer,
  EventCards,
  MoreNewsStyle,
  NewsLinkButton,
  SlackButton,
  StyledTextLink,
  TextMuted,
  TitleContainer,
  TitleStyled,
} from "./styles";

import { Divider } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

function News({ newsData, frontpage, loading }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    initFacebookPixel();
  }, []);
  

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage("Text copied!");
    setSnackbarOpen(true);
    gaButton("button_copy", text);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const gaButton = async (action, actionName) => {
    console.log("gaButton", "action:", action, "actionName:", actionName);
    trackEvent({ action, params: { action_name: actionName } });
  };

  const renderSkeleton = () => (
    <BlankContainer>
      <Box display="flex" gap={2}>
        <Skeleton variant="rectangular" width={70} height={70} />
        <Box flex={1}>
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="60%" />
        </Box>
      </Box>
      <Skeleton variant="text" width="90%" height={60} style={{ marginTop: '16px' }} />
      <Skeleton variant="rectangular" width="100%" height={40} style={{ marginTop: '16px' }} />
    </BlankContainer>
  );

  return (
    <EventCards container direction="column" frontpage={frontpage}>
      {frontpage && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Link prefetch={false} href="/blog">
            <MoreNewsStyle>
              More news
              <ArrowForwardIcon />
            </MoreNewsStyle>
          </Link>
        </Box>
      )}

      {loading ? (
        Array(3).fill(0).map((_, index) => (
          <React.Fragment key={`news-skeleton-${index}`}>
            {renderSkeleton()}
          </React.Fragment>
        ))
      ) : (
        newsData?.map((newsItem) => (
          <BlankContainer key={newsItem.id}>
            <TitleContainer>
              <Box display="flex" alignItems="center" mb={1}>
                {newsItem.image && (
                  <Box
                    style={{
                      width: "70px",
                      height: "70px",
                      position: "relative",
                      marginRight: "1em",
                    }}
                  >
                    <Image
                      src={newsItem.image}
                      alt={newsItem.title}                          
                      objectFit="cover"
                      width={50}
                      height={50}
                    />
                  </Box>
                )}
                <TitleStyled variant="h1" style={{ flex: 1 }}>
                  <Link prefetch={false} href={`/blog/${newsItem.id}`}>
                    <StyledTextLink>{newsItem.title}</StyledTextLink>
                  </Link>
                  <SlackButton
                    onClick={() => gaButton("button_slack_post", newsItem.slack_permalink)}
                    target="_blank"
                    variant="outlined"
                  >
                    <Link href={newsItem.slack_permalink} target="_blank">
                      Original Slack Post
                    </Link>
                  </SlackButton>
                  <FileCopyIcon
                    onClick={() => handleCopy(
                      `${newsItem.title} ${newsItem.description} More at https://ohack.dev/blog/${newsItem.id}`
                    )}
                    style={{ cursor: "pointer", marginLeft: "5px" }}
                  />
                </TitleStyled>
              </Box>
              <TextMuted>
                <CalendarTodayIcon style={{ marginRight: "5px" }} />
                {newsItem.slack_ts_human_readable}
              </TextMuted>
            </TitleContainer>

            <CaptionContainer>{newsItem.description}</CaptionContainer>
            
            <ButtonContainersSmall>
              {newsItem.links?.filter(
                link => !link.url.startsWith("#") && !link.name.startsWith("@")
              ).map((link) => (
                <NewsLinkButton
                  key={link.name}
                  onClick={() => gaButton("button_news", link.name + ":" + link.url)}
                  variant="contained"
                  href={link.url}
                  target="_blank"
                >
                  {link.name}
                </NewsLinkButton>
              ))}
            </ButtonContainersSmall>

            <ButtonContainersSmall
              style={{
                marginTop: "10px"
              }}
            >
              {newsItem.links?.filter(
                link => link.url.startsWith("#")
              ).map((link) => (
                <SlackButton
                  key={link.name}
                  onClick={() => gaButton("button_slack", link.name + ":" + link.url)}
                  variant="outlined"
                  size="small"
                  href={`https://opportunity-hack.slack.com/app_redirect?channel=${link.name}`}
                  target="_blank"
                >
                  #{link.name}
                </SlackButton>
              ))}
            </ButtonContainersSmall>
            <Divider style={{ marginTop: "2em" }} />
          </BlankContainer>
        ))
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </EventCards>
  );
}

export default News;
