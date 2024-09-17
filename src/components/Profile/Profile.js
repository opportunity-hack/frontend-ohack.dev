import React, { useState, useEffect } from 'react';
import { useAuthInfo } from '@propelauth/react';
import { 
  Typography, 
  FormControl, 
  TextField, 
  InputLabel, 
  MenuItem, 
  Select,
  Checkbox,
  ListItemText,
  Button,
  Stack,
  Link,
  useTheme,
  useMediaQuery
} from "@mui/material";
import useProfileApi from "../../hooks/use-profile-api.js";
import BadgeList from "../../components/badge-list";
import ProfileHackathonList from "../../components/profile-hackathon-list";
import FeedbackLite from "../../components/feedback-lite";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import HeartGauge from '../HeartGauge/HeartGauge';

import GitHubContributions from './GitHubContribution';

import ShareableGitHubContributions from './ShareableGitHubContributions';

import RaffleEntries from './RaffleEntries';
import CustomSelect from './CustomSelect';
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";
import { initFacebookPixel, trackEvent, set } from '../../lib/ga';
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



export default function Profile(props) {
  const { isLoggedIn, user } = useAuthInfo();
  const { badges, hackathons, profile, feedback_url, update_profile_metadata } =
    useProfileApi({});
  const theme = useTheme();
  const [githubHistory, setGithubHistory] = useState([]);


  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [role, setRole] = React.useState("");
  const [expertise, setExpertise] = React.useState([]);
  const [education, setEducation] = React.useState("");
  const [shirtSize, setShirtSize] = React.useState("");
  const [linkedInUrl, setLinkedInUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [why, setWhy] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [lastGithubUpdate, setLastGithubUpdate] = React.useState(0);

  const [lastCompanyUpdate, setLastCompanyUpdate] = React.useState(0);
  const [lastWhyUpdate, setLastWhyUpdate] = React.useState(0);
  const [company, setCompany] = React.useState("");

  // Update expertise, education, and shirt size from the profile
  React.useEffect(() => {
    if (
      !profile ||
      !profile?.role ||
      !profile?.education ||
      !profile?.shirt_size
    ) {
      return;
    }

    setInstagramUrl(profile?.instagram_url);
    setLinkedInUrl(profile?.linkedin_url);
    setRole(profile?.role);
    setEducation(profile?.education);
    setShirtSize(profile?.shirt_size);
    setWhy(profile?.why);
    setGithub(profile?.github);

    if (profile?.expertise) {
      setExpertise(profile?.expertise);
    }

    setCompany(profile?.company);

    initFacebookPixel();

    if (user && user.email) {
      set(user.email);
    }
  }, [profile]);

  useEffect(() => {
    if (github) {
      const github_history_url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/github/${github}`;
      
      fetch(github_history_url)
        .then((response) => response.json())
        .then((data) => {          
          setGithubHistory(data.github_history || []);
        })
        .catch((error) => {
          console.error("Error fetching GitHub history", error);
        });
    }
  }, [github]);
  
  const expertiseOptions = [
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Software Engineering: Front-end", label: "Software Engineering: Front-end (CSS/JS, Node, Angular, React, etc)" },
  { value: "Software Engineering: Back-end", label: "Software Engineering: Back-end (Java, Python, Ruby, etc)" },
  { value: "Software Engineering: Mobile", label: "Software Engineering: Mobile (iOS, Android)" },
  { value: "Software Engineering: Data Science & Machine Learning", label: "Software Engineering: Data Science & Machine Learning" },
  { value: "DevOps", label: "DevOps: AWS, Fly.io, Google Cloud, Heroku" },
  { value: "GitHub ninja", label: "GitHub ninja" },
  { value: "Product Management", label: "Product Management" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "User Experience", label: "User Experience" },
  { value: "Data Science", label: "Data Science" },
  { value: "Data Analysis", label: "Data Analysis" },
  { value: "Nonprofit Mindset", label: "Nonprofit Mindset" },
  { value: "Marketing", label: "Marketing" },
  { value: "Business", label: "Business" },
  { value: "Finance", label: "Finance" },
];

  const onRoleChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile role updated");
    };

    update_profile_metadata({ role: event.target.value }, onComplete);

    setRole(event.target.value);
  };

  const handleExpertiseChange = (event) => {
    const {
      target: { value },
    } = event;

    // On autofill we get the stringified value.
    const toSet = typeof value === "string" ? value.split(",") : value;

    setExpertise(toSet);

    // Call the API to save the user's profile
    console.log("Save to backend", {
      toSet,
    });

    const onComplete = () => {
      console.log("Profile expertise updated");
    };

    update_profile_metadata({ expertise: toSet }, onComplete);
  };

  const handleEducationChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile education updated");
    };

    update_profile_metadata({ education: event.target.value }, onComplete);

    setEducation(event.target.value);
  };

  const handleShirtSizeChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile shirt size updated");
    };

    update_profile_metadata({ shirt_size: event.target.value }, onComplete);

    setShirtSize(event.target.value);
  };

  const handleCompanyChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile company updated");
    };

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setCompany(event.target.value);

    // Clear the last timeout
    clearTimeout(lastCompanyUpdate);

    // Set a new timeout
    setLastCompanyUpdate(
      setTimeout(() => {
        update_profile_metadata({ company: event.target.value }, onComplete);
      }, 2000)
    );
  };

  const handleGithubChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("GitHub updated");
    };

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setGithub(event.target.value);

    // Clear the last timeout
    clearTimeout(lastGithubUpdate);

    // Set a new timeout
    setLastGithubUpdate(
      setTimeout(() => {
        update_profile_metadata({ github: event.target.value }, onComplete);
      }, 2000)
    );
  };

  const handleWhyChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Why updated");
    };

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setWhy(event.target.value);

    // Clear the last timeout
    clearTimeout(lastWhyUpdate);

    // Set a new timeout
    setLastWhyUpdate(
      setTimeout(() => {
        update_profile_metadata({ why: event.target.value }, onComplete);
      }, 2000)
    );
  };

  const handleLinkedInChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("LinkedIn updated");
    };

    setLinkedInUrl(event.target.value);

    update_profile_metadata({ linkedin_url: event.target.value }, onComplete);
  }

  const handleInstagramChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Instagram updated");
    };

    setInstagramUrl(event.target.value);

    update_profile_metadata({ instagram_url: event.target.value }, onComplete);
  }

  const roleOptions = [
    { value: "", label: "Select a role" },
    { value: "hacker_in_school", label: "Hacker (In School)" },
    { value: "hacker_pro", label: "Hacker (working in industry)" },
    { value: "mentor", label: "Mentor" },
    { value: "volunteer", label: "Volunteer" },
    { value: "judge", label: "Judge" },
    { value: "nonprofit", label: "Nonprofit" },
    { value: "sponsor", label: "Sponsor" },
    { value: "organizer", label: "Organizer" }
  ];

  const educationOptions = [
    { value: "", label: "Select a level of education" },
    { value: "high-school", label: "High School" },
    { value: "some-college", label: "Some College" },
    { value: "completed-undergraduate-school", label: "Completed Undergraduate" },
    { value: "some-graduate-school", label: "Some Graduate School" },
    { value: "completed-graduate-school", label: "Completed Graduate School" },
    { value: "coding-bootcamp", label: "Some Coding Bootcamp" },
    { value: "completed-coding-bootcamp", label: "Completed Coding Bootcamp" },
    { value: "other", label: "Other" }
  ];

  

  const shirtSizeOptions = [
    { value: "", label: "Select a shirt size" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "x-large", label: "X-Large" },
    { value: "xx-large", label: "XX-Large" },
    { value: "xxx-large", label: "XXX-Large" }
  ];

  const style = {
    fontSize: 14,
  };

  if (!isLoggedIn) {
    return (
      <LayoutContainer>
        <Typography variant="h4">You must be logged in to view this page.</Typography>
        <LoginOrRegister introText="Ready to join us?" previousPage="/profile" />
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer container>
  <InnerContainer container sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
    <Head>
      <title>Profile - Opportunity Hack Developer Portal</title>
    </Head>
    
    {isLoggedIn ? (
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

        <RaffleEntries profile={profile} githubHistory={githubHistory} />

        <ShareableGitHubContributions githubHistory={githubHistory} userName={github} />

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
          <CustomSelect
            label="What hat are you currently wearing?"
            value={role}
            onChange={onRoleChange}
            options={roleOptions}
            id="role-select"
          />        

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

          <CustomSelect
            label="Areas of Expertise"
            value={expertise}
            onChange={handleExpertiseChange}
            options={expertiseOptions}
            id="expertise-select"
            multiple
          />      

          <CustomSelect
            label="Level of Education"
            value={education}
            onChange={handleEducationChange}
            options={educationOptions}
            id="education-select"
          />
          
          <FormControl>            
            <TextField
              id="why"
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

          <CustomSelect
            label="Shirt Size"
            value={shirtSize}
            onChange={handleShirtSizeChange}
            options={shirtSizeOptions}
            id="shirt-size-select"
          />

          <FormControl>            
            <TextField
              id="linkedin"
              onChange={handleLinkedInChange}
              aria-describedby="linkedin-helper-text"
              label="LinkedIn Profile URL"
              value={linkedInUrl}
              style={{
                width: "300px",                                    
              }}
            />            
          </FormControl>

          <FormControl>
            <TextField
              id="instagram"
              onChange={handleInstagramChange}
              aria-describedby="instagram-helper-text"
              label="Instagram Profile URL"
              value={instagramUrl}
              style={{
                width: "300px",                                    
              }}
            />
          </FormControl>
        </Stack>

        <GitHubContributions githubHistory={githubHistory} />               

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
    ) : (
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
