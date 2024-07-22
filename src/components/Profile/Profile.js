import { useAuthInfo } from '@propelauth/react'
import React from "react";
import { FormControl, TextField, InputLabel, MenuItem, Select } from "@mui/material";
import useProfileApi from "../../hooks/use-profile-api.js";
import BadgeList from "../../components/badge-list";
import ProfileHackathonList from "../../components/profile-hackathon-list";
import FeedbackLite from "../../components/feedback-lite";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import HeartGauge from '../HeartGauge/HeartGauge';

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
import { Link, Typography, useTheme, useMediaQuery } from "@mui/material";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack.js";

export default function Profile(props) {
  const { isLoggedIn, user } = useAuthInfo();
  const { badges, hackathons, profile, feedback_url, update_profile_metadata } = useProfileApi({ });  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [role, setRole] = React.useState("");
  const [expertise, setExpertise] = React.useState([]);
  const [education, setEducation] = React.useState("");
  const [shirtSize, setShirtSize] = React.useState("");
  const [why, setWhy] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [lastGithubUpdate, setLastGithubUpdate] = React.useState(0);

  const [lastCompanyUpdate, setLastCompanyUpdate] = React.useState(0);
  const [lastWhyUpdate, setLastWhyUpdate] = React.useState(0);
  const [company, setCompany] = React.useState("");

  // Update expertise, education, and shirt size from the profile
  React.useEffect(() => {
    if (!profile || !profile?.role || !profile?.education || !profile?.shirt_size) {
      return;
    }
    
    setRole(profile?.role);    
    setEducation(profile?.education);
    setShirtSize(profile?.shirt_size);
    setWhy(profile?.why);
    setGithub(profile?.github);

    
    if (profile?.expertise) {
      setExpertise(profile?.expertise);
    }

    setCompany(profile?.company);    

  }, [profile]);


  const expertiseListLabels = [
    "Software Engineering",
    "Software Engineering: Front-end (CSS/JS, Node, Angular, React, etc)",
    "Software Engineering: Back-end (Java, Python, Ruby, etc)",
    "Software Engineering: Mobile (iOS, Android)",
    "Software Engineering: Data Science & Machine Learning",
    "DevOps: AWS, Fly.io, Google Cloud, Heroku",
    "GitHub ninja",
    "Product Management",
    "Project Manager",
    "User Experience",
    "Data Science",
    "Data Analysis",
    "Nonprofit Mindset",
    "Marketing",
    "Business",
    "Finance",
  ];

  const onRoleChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile role updated");
    }

    update_profile_metadata({ "role": event.target.value }, onComplete );    

    setRole(event.target.value);
  }

  const handleExpertiseChange = (event) => {
    const {
      target: { value },
    } = event;

    // On autofill we get the stringified value.
    const toSet = typeof value === "string" ? value.split(",") : value;

    setExpertise(toSet);

    // Call the API to save the user's profile
    console.log("Save to backend", {
      toSet
    });

    const onComplete = () => {
      console.log("Profile expertise updated");
    }

    update_profile_metadata({ "expertise": toSet }, onComplete );
  }
  

  const handleEducationChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile education updated");
    }

    update_profile_metadata({ "education": event.target.value }, onComplete );

    setEducation(event.target.value);
  }

  const handleShirtSizeChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile shirt size updated");
    }

    update_profile_metadata({ "shirt_size": event.target.value }, onComplete );

    setShirtSize(event.target.value);
  }

  const handleCompanyChange = (event) => {
   // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile company updated");
    }

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setCompany(event.target.value);

    // Clear the last timeout
    clearTimeout(lastCompanyUpdate);

    // Set a new timeout
    setLastCompanyUpdate(setTimeout(() => {
      update_profile_metadata({ "company": event.target.value }, onComplete );
    }, 2000));
  }

  const handleGithubChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("GitHub updated");
    }

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setGithub(event.target.value);

    // Clear the last timeout
    clearTimeout(lastGithubUpdate);

    // Set a new timeout
    setLastGithubUpdate(setTimeout(() => {
      update_profile_metadata({ "github": event.target.value }, onComplete );
    }, 2000));
  }



   const handleWhyChange = (event) => {
   // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Why updated");
    }

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setWhy(event.target.value);

    // Clear the last timeout
    clearTimeout(lastWhyUpdate);

    // Set a new timeout
    setLastWhyUpdate(setTimeout(() => {
      update_profile_metadata({ "why": event.target.value }, onComplete );
    }, 2000));
  }



  const style = {
    fontSize: 14
  };

  return (
    <LayoutContainer container>
      <InnerContainer container sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <Head>
          <title>Profile - Opportunity Hack Developer Portal</title>
        </Head>
        
        {isLoggedIn && (
          <ProfileContainer sx={{ width: '100%', maxWidth: '100%', px: isMobile ? 2 : 4 }}>
            <ProfileHeader container>
              <ProfileAvatar
                src={user?.pictureUrl}
                alt="Profile"
                width={60}
                height={60}
              />

              <ProfileHeadline>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? "2rem" : "3rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {user?.firstName} {user?.lastName}{" "}
                  <VerifiedUserIcon color="success" fontSize="large" />
                </Typography>
                <ProfileDetailText>{user?.email}</ProfileDetailText>
                <ProfileDetailText>
                  Created: <Moment fromNow>{user?.createdAt * 1000}</Moment>
                </ProfileDetailText>
              </ProfileHeadline>
            </ProfileHeader>
            
            <HeartGauge history={profile.history} />

            <Link href={profile.profile_url}>
              <ProfileButton className="button button--compact button--primary">
                See Your Public Profile
              </ProfileButton>
            </Link>

            <Typography variant="h2" mt={2} sx={{ fontWeight: 600, fontSize: isMobile ? "1.5rem" : "2rem" }}>
              Tell us more about yourself and why you're here
            </Typography>
            <Typography variant="body1" mt={2}>
              We ask because we want to make sure we're providing the right resources and opportunities for you.
            </Typography>

            <Stack direction="column" spacing={2} mt={2} sx={{ width: '100%' }}>
              <FormControl>
            <InputLabel id="role-label" style={style}>What hat are you currently wearing?</InputLabel>
            <Select
              labelId="role-label"
              id="role-select"
              value={role}
              label="Role"
              style={{ width: "300px" }}
              onChange={(event) => onRoleChange( event ) }
            >
              <MenuItem value="">Select a role</MenuItem>
              <MenuItem value="hacker_in_school">Hacker (In School)</MenuItem>
              <MenuItem value="hacker_pro">Hacker (working in industry)</MenuItem>
              <MenuItem value="mentor">Mentor</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
              <MenuItem value="judge">Judge</MenuItem>
              <MenuItem value="nonprofit">Nonprofit</MenuItem>
              <MenuItem value="sponsor">Sponsor</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
            </Select>
            </FormControl>


            <FormControl>            
            <TextField
              id="github"
              onChange={handleGithubChange}
              aria-describedby="github-helper-text"
              label="What's your GitHub username? (not email)"
              value={github}              
              style={{
                  width: "300px",                                    
                }}                        
            />
          </FormControl>

            <FormControl>
              <InputLabel id="expertise-label" style={style}>Areas of Expertise</InputLabel>
              <Select
                labelId="expertise-label"
                id="expertise-select"
                value={expertise}
                onChange={handleExpertiseChange}
                label="Area of Expertise"
                style={{ width: "300px" }}
                multiple                
                renderValue={(selected) => selected.join(', ')}
              >
                
                { expertiseListLabels.map((e, index) => (
                  <MenuItem key={e} value={e}>
                    <Checkbox checked={expertise.indexOf(e) > -1} />
                    <ListItemText primary={e} />
                    
                  </MenuItem>
                ))}


              </Select>
            </FormControl>

          <FormControl>  
              <InputLabel id="education-label" style={style}>Level of Education</InputLabel>
              <Select
                labelId="education-label"
                id="education-select"
                value={education}
                label="Level of Education"
                style={{ width: "300px" }}
                onChange={(event) => handleEducationChange(event)}
              >
                <MenuItem value="">Select a level of education</MenuItem>
                <MenuItem value="high-school">High School</MenuItem>
                <MenuItem value="some-college">Some College</MenuItem>
                <MenuItem value="completed-undergraduate-school">Completed Undergraduate</MenuItem>
                
                <MenuItem value="some-graduate-school">Some Graduate School</MenuItem>
                <MenuItem value="completed-graduate-school">Completed Graduate School</MenuItem>
                
                <MenuItem value="coding-bootcamp">Some Coding Bootcamp</MenuItem>
                <MenuItem value="coding-bootcamp">Completed Coding Bootcamp</MenuItem>
                
                <MenuItem value="other">Other</MenuItem>

              </Select>        
          </FormControl>
          
          <FormControl>            
            <TextField
              id="company"
              onChange={handleWhyChange}
              aria-describedby="learning-helper-text"
              label="Why are you here with us at OHack?"
              value={why}
              style={{
                  width: "400px",                                    
                }}     
            />
          </FormControl>

          <FormControl>            
            <TextField
              id="company"
              onChange={handleCompanyChange}
              aria-describedby="company-helper-text"
              label="If you're working, what company do you work for?"
              value={company}
              style={{
                  width: "300px",                                    
                }}     
            />
          </FormControl>

          <FormControl>
            <InputLabel id="shirt-label" style={style}>Shirt Size</InputLabel>
            <Select
              labelId="shirt-label"
              id="shirt-select"
              value={shirtSize}
              label="Shirt Size"
              style={{ width: "300px" }}
              onChange={(event) => handleShirtSizeChange(event)}
            >
              <MenuItem value="">Select a shirt size</MenuItem>
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
              <MenuItem value="x-large">X-Large</MenuItem>
              <MenuItem value="xx-large">XX-Large</MenuItem> 
            </Select>          
          </FormControl>
            </Stack>

            <HelpUsBuildOHack
              github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/6"
              github_name="Issue #6"
            />

            <div className="profile__details">
          <h2 className="profile__title">Badges</h2>
          <BadgeList badges={badges} />

          <h1 className="profile__title">Volunteer History</h1>
          <br />

          <h2 className="profile__title">Feedback</h2>
          Feedback you give and receive
          <FeedbackLite feedback_url={feedback_url} history={profile.history} />

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
          <HelpUsBuildOHack
            github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8"
            github_name="Issue #8"
          />
        </div>
          </ProfileContainer>
        )}

        {!isLoggedIn && (
          <div>
            <h1>Not logged in</h1>
            <p>
              You must be logged in to view this page.{" "}
              <LoginOrRegister introText="Ready to join us?" previousPage={"/profile"} />
            </p>
          </div>
        )}
      </InnerContainer>
    </LayoutContainer>
  );
}