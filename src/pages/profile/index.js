import { useAuth0 } from "@auth0/auth0-react";
import Router from "next/router.js";
import React, { useEffect } from "react";

import useProfileApi from "../../hooks/use-profile-api.js";

import BadgeList from "../../components/badge-list";
import ProfileHackathonList from "../../components/profile-hackathon-list";
import FeedbackLite from "../../components/feedback-lite";
import CodeSnippet from "../../components/code-snippet";
import AuthenticationButton from "../../components/buttons/authentication-button";
import Head from "next/head";
import Moment from "react-moment";

import {
  InnerContainer,
  LayoutContainer,
  ProfileAvatar,
  ProfileButton,
  ProfileContainer,
  ProfileDetailText,
  ProfileHeader,
  ProfileHeadline,
} from "../../styles/profile/styles";
import { Link, Typography } from "@mui/material";

export default function Profile() {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const { badges, hackathons, profile, feedback_url } = useProfileApi();

  if (!isLoading && !isAuthenticated) {
    Router.push("/");
  }

  return (
    <LayoutContainer container>
      <InnerContainer container>
        <Head>
          <title>Profile - Opportunity Hack Developer Portal</title>
        </Head>
        <ProfileContainer>
          <ProfileHeader container>
            <ProfileAvatar
              src={user?.picture}
              alt="Profile"
              width={60}
              height={60}
            />

            <ProfileHeadline>
              <Typography
                variant="h2"
                style={{
                  fontWeight: 600,
                  fontSize: "3rem",
                  marginBottom: "0.5rem",
                }}
              >
                {user?.name}{" "}
                <span className="material-symbols-outlined">verified_user</span>
              </Typography>
              <ProfileDetailText>{user?.email}</ProfileDetailText>
              <ProfileDetailText>
                Last login: <Moment fromNow>{user?.updated_at}</Moment>
              </ProfileDetailText>
            </ProfileHeadline>
          </ProfileHeader>
          <ProfileButton
            href={profile.profile_url}
            className="button button--compact button--primary"
          >
            Your Public Profile
          </ProfileButton>
        </ProfileContainer>

        <div className="profile__details">
          <h2 className="profile__title">Badges</h2>
          <BadgeList badges={badges} />

          <h1 className="profile__title">Volunteer History</h1>
          <br />

          <h1 className="profile__title">Feedback</h1>

          <FeedbackLite feedback_url={feedback_url} />

          <h2 className="profile__title">Hackathons</h2>
          <p>
            We've tried our best to keep track of each time you've volunteered,
            mentored, judged a hackathon. If not, please send us a Slack!
          </p>
          <ProfileHackathonList hackathons={hackathons} />

          <br />

          <h2 className="profile__title">Summer Internships</h2>
          <p>
            These are distinctly different than hackathons as they span over a
            couple months.
          </p>

          <h2 className="profile__title">Feedback</h2>
          <p>
            Feedback gathered from your mentors, peers, team members, nonprofits
          </p>

          <div className="profile__details">
            <CodeSnippet
              title="Decoded ID Token"
              code={JSON.stringify(user, null, 2)}
            />
          </div>
        </div>
      </InnerContainer>
    </LayoutContainer>
  );
}
