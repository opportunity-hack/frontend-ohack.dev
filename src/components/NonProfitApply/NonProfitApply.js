
import React, { useState, useCallback, useEffect, useMemo } from "react";

import { useRouter } from "next/router";


import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Puff } from "react-loading-icons";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import useNonprofit from "../../hooks/use-nonprofit";
import { useAuth0 } from "@auth0/auth0-react";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";


import Moment from 'moment';
import Image from 'next/image';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WarningIcon from '@mui/icons-material/Warning';
import Autocomplete from "@mui/material/Autocomplete";

import ReactRecaptcha3 from 'react-google-recaptcha3';

import axios from "axios";

import {
  LayoutContainer,
  DetailsContainer,
  DescriptionStyled  
} from "../../styles/nonprofits/apply/styles";


import LoginOrRegister from "../LoginOrRegister/LoginOrRegister";
import ReactPixel from 'react-facebook-pixel';
import * as ga from '../../lib/ga';
import { Typography } from "@mui/material";


export default function NonProfitApply() {
  const router = useRouter();
  let { nonprofits, handle_get_npo_form, handle_npo_form_submission } = useNonprofit();
  
  const { user } = useAuth0();
  var image = "/OHack_NonProfit_Application.png";
  var nonProfitOptions = [];
  

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  var advancedMatching = undefined; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
  if( user && user.email )
  {
    advancedMatching = { em: user.email };
  }
  

  useEffect(() => {
     if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    }

    ReactRecaptcha3.init(process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY).then(
      (status) => {
        // console.log(status); // Should log SUCCESS
      }
    );
  }, []);

  const START_DATE = "Saturday, Oct 7th";
  const END_DATE = "Sunday, Oct 8th 2023";
  const LOCATION_ARIZONA = "Phoenix, Arizona"
  const LOCATION = LOCATION_ARIZONA + " and virtual";

  nonprofits && nonprofits.forEach((item) => {
    if( item.name )
    {
      nonProfitOptions.push(item.name);
    }
  });
  
  const [token, setToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [formState, setFormState] = useState({
    charityName: "",
    charityLocation: "",
    understandProjectUncertainty: false,
    joiningInPerson: false,
    areasOfFocus: [],
    servedPopulations: [],
    contactName: "",
    contactPhone: "",
    organizationPurposeAndHistory: "",
    technicalProblem: "",
    solutionBenefits: "",
    familiarWithSlack: false,
    keyStaffAvailability: [],
  });

  const [ip, setIP] = useState(null);

  const getIP = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIP(res.data.ip);
  };

  useEffect(() => {
    //passing getData method to the lifecycle method
    getIP();
  }, []);

  // Do this once on load with useEffect
  useEffect(() => {        
    const handleFormLoad = (data) => {      
      setLoading(false);

      if(data.status != null && data.status === 404)
      {
        console.log("No application yet.  Returning empty form.");
      } else if( data !== undefined && data !== null) {
        console.log("Found application.  Setting form state.");        
        setFormState(data);
      }      

    };

    handle_get_npo_form(ip, handleFormLoad);
  }, [user, ip]);  

  var formSubmissionDate = null;
  if( formState.timeStamp ){
    // console.log("formState.timeStamp: ", formState.timeStamp);
    formSubmissionDate = new Date(formState.timeStamp._seconds * 1000);
  }


  var loginCallToAction = <LoginOrRegister 
      introText={"Please consider logging in or creating an account. You'll need a Slack account for the hackathon."} 
      previousPage={router.pathname}
      />;

  const areasOfFocusSetState = (event) => {
    ReactPixel.track('NPO: Area of Focus', {
      content_name: 'Nonprofit Application',
      status: event.target.checked,
      content_category: 'Nonprofit Application',
      value: 0.00,
      currency: 'USD',
    });

    if (event.target.checked) {
      const areasOfFocus = [...formState.areasOfFocus, event.target.name];
      setFormState({
        ...formState,
        areasOfFocus: areasOfFocus,
      });
    } else {
      const areasOfFocus = [...formState.areasOfFocus];
      const removeAreasOfFocus = areasOfFocus.filter((areaOfFocus) => {
        return areaOfFocus !== event.target.name;
      });
      setFormState({
        ...formState,
        areasOfFocus: removeAreasOfFocus,
      });
    }
  };

  const servedPopulationsSetState = (event) => {
    ReactPixel.track('NPO: Served Populations', {
      content_name: 'Nonprofit Application',
      status: event.target.checked,
      content_category: 'Nonprofit Application',
      value: 0.00,
      currency: 'USD',
    });

    if (event.target.checked) {
      const servedPopulations = [
        ...formState.servedPopulations,
        event.target.name,
      ];
      setFormState({
        ...formState,
        servedPopulations: servedPopulations,
      });
    } else {
      const servedPopulations = [...formState.servedPopulations];
      const removeServerdPopulations = servedPopulations.filter(
        (population) => {
          return population !== event.target.name;
        }
      );
      setFormState({
        ...formState,
        servedPopulations: removeServerdPopulations,
      });
    }
  };

  const keyStaffAvailabilitySetState = (event) => {
    ReactPixel.track('NPO: Key Staff Available', {
      content_name: 'Nonprofit Application',
      status: event.target.checked,
      content_category: 'Nonprofit Application',
      value: 0.00,
      currency: 'USD',
    });

    if (event.target.checked) {
      const keyStaffAvailability = [
        ...formState.keyStaffAvailability,
        event.target.name,
      ];
      setFormState({
        ...formState,
        keyStaffAvailability: keyStaffAvailability,
      });
    } else {
      const keyStaffAvailability = [...formState.keyStaffAvailability];
      const removeKeyStaffAvailability = keyStaffAvailability.filter(
        (availability) => {
          return availability !== event.target.name;
        }
      );
      setFormState({
        ...formState,
        keyStaffAvailability: removeKeyStaffAvailability,
      });
    }
  };

  const onComplete = (response, success) => {        
    setShowLogin(true);
    if( success )
    {        
      setSubmitStatus(
        <div><CheckCircleOutlineIcon sx={{
        color: 'green',
        fontSize: 50        
      }} />
      <Typography fontSize={15}>Saved Successfully</Typography>
      
      </div>);
      

      ReactPixel.track('NonProfit Form Submitted', {
        content_name: 'Nonprofit Application',
        status: "Submitted",
        content_category: 'Nonprofit Application',
        value: 1.00,
        currency: 'USD',
      });

      ga.event({
        action: 'NonProfit Form Submitted',
        params: {
          content_name: 'Nonprofit Application',
          status: "Submitted",
          content_category: 'Nonprofit Application',
          value: 1.00,
          currency: 'USD',
        }
      });
    }
    else
    {
      ReactPixel.track('NonProfit Form Error Submitting', {
        content_name: 'Nonprofit Application',
        status: "Error",
        content_category: 'Nonprofit Application',
        value: 0.50,
        currency: 'USD',
      });

      ga.event({
        action: 'NonProfit Form Error Submitting',
        params: {
          content_name: 'Nonprofit Application',
          status: "Error",
          content_category: 'Nonprofit Application',
          value: 0.50,
          currency: 'USD',
        }
      });

      setSubmitStatus(<div><WarningIcon sx={{
        color: 'red',
        fontSize: 20
      }}/> Error Saving form: {response}</div>);
      // router.push("/nonprofits/errorOnSubmit");
    }
  }

  


  const handleFormSubmit = async () => {    
    setSubmitStatus(<Puff stroke="#0000FF" />);
    

    ReactRecaptcha3.getToken().then(
      (atoken) => {        
        setToken(atoken);
        formState.token = atoken;
        formState.ip = ip;        
        return handle_npo_form_submission(formState, onComplete)
      },
      (error) => {
        // console.log(error);
      }
    );

  };
  
  const style = { fontSize: '15px' };

  return (   
    <LayoutContainer key="apply_form" container>            
      <DetailsContainer container>        
        <DescriptionStyled>          
          {
            !loading && formSubmissionDate &&
            <Alert severity="success">
              <h4>You've already submitted this form on {Moment(formSubmissionDate.toLocaleString()).format('MMMM Do YYYY @ hh:mma')}</h4>
              <div className={'image-container'}>
                <Image src={"https://media0.giphy.com/media/k6r6lTYIL9j9ZeRT51/giphy.gif"} layout="responsive" width="320" height="266" />
              </div>

              <h4>Be sure to save any changes you make.</h4>
            </Alert>

          }
          <h1 className="content__title">Nonprofit Project Application</h1>          

          <div className="content__body">
            <div className="profile__header">
              <div className="profile__headline">
             
                <Typography variant="h2">Applications are closed as of August 1st 2023</Typography>
                <Image src="https://media4.giphy.com/media/ysu9eOMkhYa7YyE70J/giphy.gif" width="480" height="270" />
                <Typography variant="h3">Any forms submitted now will not be considered for our October hackathon.</Typography>
                <br />
                <Typography variant="h4">Here's what you can expect:</Typography>
                <ul>
                <li>August: We'll review applications - expect some questions sent via email or Slack.</li>
                <li>September: Nonprofits will be notified, we'll spend a couple hours to refine your pitches for the hackathon.</li>
                <li>October: Hackathon! We meet over a weekend and hackers write software to solve your problem.</li>
                </ul>
                <Typography variant="body4">Still have a problem for us? Submit it! We're a 24x7 platform and we always welcome your partnership. We likely won't be able to get working on it until after our hackathon in October.</Typography>
                <br />
                <Image src={image} width="400" height="300" />
                <div className="profile__header"><CalendarMonthIcon />{START_DATE} to {END_DATE}</div>
                <div className="profile__header"><PlaceIcon />{LOCATION}</div>
                                
                               
                
                <br />
                This form helps us to find the charities that are the right fit
                for our event.                             
                <br /><br />
              </div>
            </div>
          </div>
          {
            user && loading && (
              <DetailsContainer container>
                Loading ...
                <Puff stroke="#0000FF" />
                <Puff stroke="#0000FF" />
              </DetailsContainer>
            )
          } 
        </DescriptionStyled>
        
      </DetailsContainer>

      
      <DetailsContainer container>   
                     
        <DescriptionStyled>
          
          <p>
            <Typography style={style}><b>Name of Charity Organization:</b></Typography>
            <br />
            <Typography style={style}>We support charities including non-profits (NPOs) and non-government
            organizations (NGOs).</Typography>
          </p>
           
        
        <Autocomplete
              disablePortal
              value={formState.charityName}
              onChange={(event, newValue) => {                
                ReactPixel.track('NPO: Charity Name', {
                  content_name: 'Nonprofit Application',
                  status: newValue,
                  content_category: 'Nonprofit Application',
                  value: 0.02,
                  currency: 'USD',
                });

                ga.event({
                  action: 'NPO: Charity Name',
                  params: {
                    content_name: 'Nonprofit Application',
                    status: newValue,
                    content_category: 'Nonprofit Application',
                    value: 0.02,
                    currency: 'USD',
                  }
                });                

                if( newValue == null )
                {
                  newValue = "";
                }

                setFormState({
                  ...formState,
                  charityName: newValue,
                });
                // console.log(`onChange Charity name changed to ${newValue}`);
              }}
              inputValue={formState.charityName}
              onInputChange={(event, newInputValue) => {                

                ReactPixel.track('oic NPO: Charity Name', {
                  content_name: 'Nonprofit Application',
                  status: newInputValue,
                  content_category: 'Nonprofit Application',
                  value: 0.01,
                  currency: 'USD',
                });

                ga.event({
                  action: 'oic NPO: Charity Name',
                  params: {
                    content_name: 'Nonprofit Application',
                    status: newInputValue,
                    content_category: 'Nonprofit Application',
                    value: 0.01,
                    currency: 'USD',
                  }
                });   

                if( newInputValue == null )
                {
                  newInputValue = "";
                }
                
                setFormState({
                  ...formState,
                  charityName: newInputValue,
                });
                // console.log(`Input Change Charity name changed to ${newInputValue}`);
              }}
              id="controllable-states-demo"
              freeSolo                            
              options={nonProfitOptions}
              
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Name of Charity Organization" />}
            />
          
          

          <br />
          <p>
            <b>Charity Location:</b>
          </p>
          <TextField
            label="City, State, Country"
            sx={{ width: 300 }}
            required
            defaultValue={formState.charityLocation}
            onChange={(event) => {
              setFormState({
                ...formState,
                charityLocation: event.target.value,
              });
            }}
          />
          <br /><br />
            <Alert severity="warning">
              <Typography style={style}><b>Complete transparency:</b> Not all projects will be completed after the hackathon is over.<br/>Your time is commitment is 10-20 hours over the course of the weekend, and a few hours of prep work before the event.<br/>Winning teams will be invited to continue working on their projects after the hackathon is over and this typically takes 3 months.</Typography>
              <br/>
              <br />
            <FormControlLabel              
              control={
                <Checkbox                  
                  type="checkbox"
                  name="understandProjectUncertainty"
                  formState={formState}
                  setFormState={setFormState}
                  checked={formState.understandProjectUncertainty}
                  onChange={(event) => {
                    setFormState({
                      ...formState,
                      understandProjectUncertainty: event.target.checked,
                    });
                    
                  }}
                />
              }
              label={<Typography style={style}>I understand that not all projects will be completed after the hackathon is over.</Typography>}
            />
            </Alert>
          
        </DescriptionStyled>
        
        <Stack direction="row" spacing={2}  alignItems="flex-start" mt={3}>
        <DescriptionStyled>          
          <b>Areas of focus for your non-profit?</b>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Economic Empowerment"                  
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Economic Empowerment") }                  
                />
              }
              label={<Typography style={style}>Economic Empowerment</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Education"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Education") }
                />
              }
              label={<Typography style={style}>Education</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Animals"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Animals") }
                />
              }
              label={<Typography style={style}>Animals</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Environmental Sustainability"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Environmental Sustainability") }
                />
              }
              label={<Typography style={style}>Environmental Sustainability</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Career Mentoring"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Career Mentoring")}
                />
              }
              label={<Typography style={style}>Career Mentoring</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Arts & Culture"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Arts & Culture")}
                />
              }
              label={<Typography style={style}>Arts & Culture</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Health and Human Services"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Health and Human Services")}
                />
              }
              label={<Typography style={style}>Health and Human Services</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Other areas"
                  onChange={areasOfFocusSetState}
                    checked={formState.areasOfFocus && formState.areasOfFocus.includes("Other areas")}
                />
              }
              label={<Typography style={style}>Other areas</Typography>}
            />
          </FormGroup>
        </DescriptionStyled>

        <DescriptionStyled>          
          <b>
            Does your organization or program serve a majority (51% or more) of
            any of the following populations?
          </b>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Women"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Women") }
                />
              }
              label={<Typography style={style}>Women</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Black"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Black") }
                />
              }
              label={<Typography style={style}>Black</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Indigenous"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Indigenous") }
                />
              }
              label={<Typography style={style}>Indigenous</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Asian"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Asian") }
                />
              }
              label={<Typography style={style}>Asian</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="LatinX"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("LatinX") }
                />
              }
              label={<Typography style={style}>LatinX</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Disabled"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Disabled") }
                />
              }
              label={<Typography style={style}>Disabled</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="LGBTQUIA+"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("LGBTQUIA+") }
                />
              }
              label={<Typography style={style}>LGBTQUIA+</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Veterans"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Veterans") }
                />
              }
              label={<Typography style={style}>Veterans</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Immigrants/ Refugees"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Immigrants/ Refugees")}
                />
              }
              label={<Typography style={style}>Immigrants/Refugees</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Other"
                  onChange={servedPopulationsSetState}
                    checked={formState.servedPopulations && formState.servedPopulations.includes("Other") }
                />
              }
              label={<Typography style={style}>Other</Typography>}
            />
          </FormGroup>
        </DescriptionStyled>
        </Stack>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <Typography style={style}><b>Contact Name:</b></Typography>
          <br />
          <Typography style={style}>
          Who is the best person we can contact to better understand your
          problem statements? Feel free to include multiple people.
          </Typography>
          <br />
          <TextField
            sx={{ width: 250 }}
            id="outlined-basic"
            label="Contact Name(s)"
            variant="filled"
            required
            multiline
            rows={4}
            defaultValue={formState.contactName}
            onChange={(event) => {
              setFormState({
                ...formState,
                contactName: event.target.value,
              });
            }}
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <Typography style={style}><b>Contact Email(s) or Phone Number(s):</b></Typography>
          <br />
          <Typography style={style}>
          We'd like to ensure our hackers (the people writing the code) have
          your contact information for any questions they have. We'd also like
          to have this number so that we can reach out to you before you are
          able to join us on Slack. Feel free to include multiple email addresses and/or phone numbers.
          </Typography>
          <br />
          <TextField
            sx={{ width: 250 }}
            id="outlined-basic"
            label="Contact Email or Phone"
            variant="filled"
            required
            multiline
            rows={4}
            defaultValue={formState.contactPhone}
            onChange={(event) => {
              setFormState({
                ...formState,
                contactPhone: event.target.value,
              });
            }}
          />
        </DescriptionStyled>
      </DetailsContainer>
    

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <Typography style={style}><b>Technical Problem:</b></Typography>
          <br />
          <Typography style={style}>
          Describe what technical problem would you like hackathon participants
          to solve.
          </Typography>
          <br />
          <Typography style={style}>
          Try to think only about the problem you are trying to solve,
            and <em><strong>not</strong> how you want to solve it</em>.                     
          </Typography>
          <br />
          <TextField
            fullWidth
            id="filled-textarea"
            label="What problem do you have?"
            placeholder="Give an overview of your problem: painpoints, things that could be better, etc."
            multiline
            rows={4}
            variant="filled"
            required
            defaultValue={formState.technicalProblem}
            onChange={(event) => {
              setFormState({
                ...formState,
                technicalProblem: event.target.value,
              });
            }}
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <Typography style={style}><b>Benefit(s) to Organization:</b></Typography>
          <br />
          <Typography style={style}>How would a solution to these challenges help further your work,
          mission, strategy, or growth?
          </Typography>
          <br />
          <TextField
            fullWidth
            id="filled-textarea"
            label="How can a solution help you and your non-profit?"
            placeholder="Given that this problem is solved, how can it help you and your non-profit?"
            multiline
            rows={4}
            variant="filled"
            required
            defaultValue={formState.solutionBenefits}
            onChange={(event) => {
              ReactPixel.track('NPO: Solution Benefits', {
                content_name: 'Nonprofit Application',
                status: event.target.value,
                content_category: 'Nonprofit Application',
                value: 0.01,
                currency: 'USD',
              });

              setFormState({
                ...formState,
                solutionBenefits: event.target.value,
              });
            }}
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <Typography style={style}><b>Slack Familiarity:</b></Typography>
          <br />
          <Typography style={style}>
          We use Slack as our only mechanism for communication for Opportunity
          Hack, we ask this question to better understand your knowledge of
          using Slack (see{" "}
          
          <a
            href="https://slack.com/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#0000EE", textDecoration: "underline" }}
          >
            <b>Slack.com</b>
          </a>{" "}
          for more info).
          </Typography>
          <br/>
          <FormControlLabel
            control={
              <Checkbox
                type="checkbox"
                name="familiarWithSlack"
                checked={formState.familiarWithSlack}
                onChange={(event) => {
                  ReactPixel.track('NPO: Familiar with Slack', {
                    content_name: 'Nonprofit Application',
                    status: event.target.checked,
                    content_category: 'Nonprofit Application',
                    value: 0.05,
                    currency: 'USD',
                  });

                  ga.event({
                    action: 'NPO: Familiar with Slack',
                    params: {
                      content_name: 'Nonprofit Application',
                      status: event.target.checked,
                      content_category: 'Nonprofit Application',
                      value: 0.05,
                      currency: 'USD',
                    }
                  });                  

                  setFormState({
                    ...formState,
                    familiarWithSlack: event.target.checked,
                  });
                }}
              />
            }
            label={<Typography style={style}>I am familiar with Slack</Typography>}
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <Typography style={style}><b>Key Staff Availability:</b></Typography>
          <br />
          <Typography style={style}>
          Is at least one key staff person who is knowledgeable about the
          project and your needs available to attend the event?
          <br />
          This would include providing an email and phone number for questions
          during times when the staff isn't physically available. 
          <br />
          We use Slack as our primary communication platform both before the
          hackathon starts and during the hackathon.
          </Typography>
          
          <FormGroup>
            <FormControlLabel
            sx={{ padding: "5px"}}
              control={
                <Checkbox
                  type="checkbox"
                  name="They will be available remotely throughout the entire period by phone"
                  checked={formState.keyStaffAvailability && formState.keyStaffAvailability.includes("They will be available remotely throughout the entire period by phone")}
                  onChange={keyStaffAvailabilitySetState}
                />
              }
              label={<Typography style={style}>They will be available remotely throughout the entire period by <b>phone</b></Typography>}
            />
            <FormControlLabel
              sx={{ padding: "5px"}}
              control={
                <Checkbox
                  type="checkbox"
                  name="They will be available remotely throughout the entire period by email and Slack"
                  checked={formState.keyStaffAvailability && formState.keyStaffAvailability.includes("They will be available remotely throughout the entire period by email and Slack")}
                  onChange={keyStaffAvailabilitySetState}
                />
              }
              label={<Typography style={style}>They will be available remotely throughout the entire period by <b>email and Slack</b></Typography>}
            />
            <FormControlLabel
              sx={{ padding: "5px"}}
              control={
                <Checkbox
                  type="checkbox"
                  name="Yes, they will be able to attend for nonprofit presentations the morning of Saturday, October 7th"
                  checked={formState.keyStaffAvailability && formState.keyStaffAvailability.includes("Yes, they will be able to attend for nonprofit presentations the morning of Saturday, October 7th")}
                  onChange={keyStaffAvailabilitySetState}
                />
              }
                label={<Typography style={style}>Yes, they will be able to attend for nonprofit presentations the morning of Saturday, October 7th</Typography>}
            />
            <FormControlLabel
              sx={{ padding: "5px"}}
              control={
                <Checkbox
                  type="checkbox"
                  name="Yes, they will be able to attend the final presentations and judging the afternoon of Sunday, October 8th"
                  checked={formState.keyStaffAvailability && formState.keyStaffAvailability.includes("Yes, they will be able to attend the final presentations and judging the afternoon of Sunday, October 8th")}
                  onChange={keyStaffAvailabilitySetState}
                />
              }
                label={<Typography style={style}>Yes, they will be able to attend the final presentations and judging the afternoon of Sunday, October 8th</Typography>}
            />
          </FormGroup>
          <br />
          <Typography style={style}><b>Coming Onsite?</b></Typography>
          <br />
          <Typography style={style}>
            Are you planning to join us in person at {LOCATION_ARIZONA}? <a target="_blank"
              rel="noreferrer"
              style={{ color: "#0000EE", textDecoration: "underline" }} 
              href="https://forms.gle/ByDbHo1eqEaxZB1v7">Suggest a location for the hackathon here.</a>
          </Typography>
          <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    type="checkbox"
                    name="Yes, either myself or a point of contact from our nonprofit is planning to attend in-person"
                    checked={formState.joiningInPerson}
                    onChange={(event) => {
                      setFormState({
                        ...formState,
                        joiningInPerson: event.target.checked,
                      });
                    }}
                  />
                }
                label={<Typography style={style}>Yes, either myself or a point of contact from our nonprofit is planning to attend in-person</Typography>}
              />
          </FormGroup>
        </DescriptionStyled>
      </DetailsContainer>      
      <DetailsContainer container>                
      <br/>
        <DescriptionStyled>         
            <LoadingButton
              color="secondary"
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleFormSubmit}
            >
              <span>Save</span>
            </LoadingButton>
          &nbsp;{submitStatus}
          {!user && showLogin && loginCallToAction}
          <br/><br/>
          <hr/>
          <h4 className="profile__title">
            <b>What is Opportunity Hack?</b>
          </h4>
          <Typography style={style}>
            Opportunity Hack is a 48-hour hackathon that brings together
            software developers, designers, and project managers to solve
            technical problems for public charities, non-profit
            organizations (NPOs), and non-government organizations (NGOs).
          </Typography>
          <br/>
          <h4 className="profile__title">
            <b>What is a hackathon?</b>
          </h4>
          <Typography style={style}>
            A hackathon is a 48-hour event where teams of 3-6 people work
            together to solve a problem. The teams are made up of
            developers, designers, and project managers. The teams are
            given a problem statement from a non-profit organization and
            they work together to solve the problem. At the end of the
            hackathon, the teams present their solutions to a panel of
            judges. The judges will select the top three teams and award
            them prizes.
          </Typography>
        </DescriptionStyled>        
        
      </DetailsContainer>
      
    </LayoutContainer>
  );
}
