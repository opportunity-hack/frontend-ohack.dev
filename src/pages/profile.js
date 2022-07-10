import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { CodeSnippet } from "../components/code-snippet";
import { AuthenticationButton } from "../components/buttons/authentication-button";


import { useProfileApi } from "../hooks/use-profile-api.js";
import { BadgeList } from "../components/badge-list";
import { HackathonList } from "../components/hackathon-list";

import '../styles/profile.styles.css';
import { FeedbackLite } from "./feedback-lite";

export const Profile = () => {
  const { user } = useAuth0();  
  const { badges, hackathons, profile, feedback_url } = useProfileApi();

  console.log("USER");
  console.log(user);



  if (!user) {
    return (
      <div className="content-layout">
        <h1 className="content__title">Please login</h1>
        <div className="content__body">  
          <AuthenticationButton/>
        </div>
      </div>
      );
  }

  return (
    <div className="content-layout">
      <h1 className="content__title">Profile</h1>
      <div className="content__body">        
        <div className="profile-grid">
          <div className="profile__header">
            <img src={profile.profile_image} alt="Profile" className="profile__avatar" />
            
            <div className="profile__headline">
              <h2 className="profile__title"><span className="material-symbols-outlined">verified_user</span>
                {user.name}</h2>                
              <span className="profile__description">
                <a href={profile.profile_url}><button>Your Public Profile</button></a>
              </span>
              <span className="profile__description">{user.email}</span>
              <span className="profile__last_updated">Last Login: {user.updated_at}</span>              
            </div>
          </div>

          <div className="profile__details">
            <h2 className="profile__title">Badges</h2>                        
            <BadgeList badges={badges}/>
                                            
            <br /><br />

            <h1 className="profile__title">Volunteer History</h1>
            <br/>

            <h1 className="profile__title">Feedback</h1>
            
            <FeedbackLite feedback_url={feedback_url} />

            <h2 className="profile__title">Hackathons</h2>
            <p>
              We've tried our best to keep track of each time you've volunteered, mentored, judged a hackathon.  If not, please send us a Slack!
            </p>
            <HackathonList hackathons={hackathons} />                     

            <br />

            <h2 className="profile__title">Summer Internships</h2>
            <p>
              These are distinctly different than hackathons as they span over a couple months.
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
        </div>
      </div>
    </div>
  );
};
