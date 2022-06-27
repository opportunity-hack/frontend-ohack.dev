import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { CodeSnippet } from "../components/code-snippet";
import { LinkedInButton } from "../components/buttons/linkedin-button";
import { AuthenticationButton } from "../components/buttons/authentication-button";


import { useState, useEffect } from "react";
// https://reactjs.org/docs/hooks-state.html

import { useProfileApi } from "../hooks/use-profile-api.js";
import { BadgeList } from "../components/badge-list";
import { HackathonList } from "../components/hackathon-list";

import './profile.styles.css'
import { FeedbackLite } from "./feedback-lite";

export const Profile = () => {
  const { user } = useAuth0();  
  const { getUserInfo } = useProfileApi();
  const userProfile = "temp";

  const [badges, setBadges] = useState(null)
  const [hackathons, setHackathons] = useState(null);

  const public_profile_url = () => {
    if(!user)
    {
      return "";
    }
    else
    {
      return window.location.href + "/" + user.sub;
    }
    
  }
  
  useEffect(() => {
    console.log("111----");
    getUserInfo()
      .then((response) => {
        if(response && response.text)
        {
          setBadges(response.text.badges);
          setHackathons(response.text.hackathons);
        }        
        else
        {
          setBadges([]);
          setHackathons([]);
        }
      })
      
    console.log("222----");
  },
    []  // Never trigger this again, don't give it any variables to watch
  );

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
  

  
  /*
    1. Make call to get app_metadata for a given user
    2. Populate State for user details
  */

  return (
    <div className="content-layout">
      <h1 className="content__title">Profile</h1>
      <div className="content__body">        
        <div className="profile-grid">
          <div className="profile__header">
            <img src={user.picture} alt="Profile" className="profile__avatar" />
            
            <div className="profile__headline">
              <h2 className="profile__title"><span className="material-symbols-outlined">verified_user</span>
                {user.name}</h2>                
              <span className="profile__description">
                <a href={public_profile_url}><button>Your Public Profile</button></a>
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
            
            <FeedbackLite/>

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
