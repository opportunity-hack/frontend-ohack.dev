import React, { useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Alert, Snackbar, Skeleton } from "@mui/material";
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
import * as ga from "../../lib/ga";

function News({ newsData, frontpage, loading }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

    const ReactPixel =  require('react-facebook-pixel');
    
    const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
    };
    var advancedMatching = null; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
    
    ReactPixel.default.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);

    ReactPixel.track(action, { action_name: actionName });

    ga.event({ 
        action: "conversion",
        params: {
          send_to: "AW-11474351176/JCk6COG-q4kZEMjost8q"  
        }      
      });

    ga.event({
      action: action,
      params: {
        action_name: actionName,
      },
    });    
  };

  const renderSkeleton = () => (
    <BlankContainer xs={12} md={12} lg={12}>
      <Skeleton
        variant="rectangular"
        width={70}
        height={70}
        style={{ marginBottom: "0.5em" }}
      />
      <Skeleton variant="text" width="80%" height={30} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="90%" height={60} />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={40}
        style={{ marginTop: "1em", marginBottom: "1em" }}
      />
      <Divider />
    </BlankContainer>
  );

  return (
    <EventCards
      container
      direction="row"
      frontpage={frontpage}
      style={{ margin: "1px", padding: "8px" }}
    >
      {frontpage && (
        <Link prefetch={false} href="/blog">
          <MoreNewsStyle>
            More news
            <ArrowForwardIcon />
          </MoreNewsStyle>
        </Link>
      )}

      {loading
        ? // Render skeletons while loading
          Array(3)
            .fill(0)
            .map((_, index) => (
              <React.Fragment key={`news-skeleton-${index}`}>
                {renderSkeleton()}
              </React.Fragment>
            ))
        : // Render actual news items
          newsData?.map((newsItem) => (
            <BlankContainer xs={12} md={12} lg={12} key={newsItem.id}>
              <TitleContainer container>
                <Grid item xs={12} md={12} lg={12}>
                  {newsItem.image && (
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        position: "relative",
                        marginBottom: "0.5em",
                      }}
                    >
                      <Image
                        src={newsItem.image}
                        alt={newsItem.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <TitleStyled variant="h1">
                    <Link prefetch={false} href={`/blog/${newsItem.id}`}>
                      <StyledTextLink>{newsItem.title}</StyledTextLink>
                    </Link>
                    <SlackButton
                      onClick={() =>
                        gaButton("button_slack_post", newsItem.slack_permalink)
                      }
                      target="_blank"
                      variant="outlined"
                    >
                      <Link href={newsItem.slack_permalink} target="_blank">
                        Original Slack Post
                      </Link>
                    </SlackButton>
                    <FileCopyIcon
                      onClick={() =>
                        handleCopy(
                          `${newsItem.title} ${newsItem.description} More at https://ohack.dev/blog/${newsItem.id}`
                        )
                      }
                      style={{ cursor: "pointer", marginLeft: "5px" }}
                    />
                  </TitleStyled>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                  <TextMuted>
                    <CalendarTodayIcon style={{ marginRight: "5px" }} />
                    {newsItem.slack_ts_human_readable}
                  </TextMuted>
                </Grid>
              </TitleContainer>
              <CaptionContainer>{newsItem.description}</CaptionContainer>
              <ButtonContainersSmall
                style={{
                  justifyContent: "center",
                  justifyItems: "center",
                  textAlign: "center",
                }}
              >
                {newsItem.links &&
                  newsItem.links
                    .filter(
                      (link) =>
                        !link.url.startsWith("#") && !link.name.startsWith("@")
                    )
                    .map((link) => (
                      <NewsLinkButton
                        key={link.name}
                        onClick={() =>
                          gaButton("button_news", link.name + ":" + link.url)
                        }
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
                  marginTop: "10px",
                  justifyContent: "center",
                  justifyItems: "center",
                  textAlign: "center",
                }}
              >
                {newsItem.links &&
                  newsItem.links
                    .filter((link) => link.url.startsWith("#"))
                    .map((link) => (
                      <SlackButton
                        key={link.name}
                        onClick={() =>
                          gaButton("button_slack", link.name + ":" + link.url)
                        }
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
          ))}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </EventCards>
  );
}

export default News;
