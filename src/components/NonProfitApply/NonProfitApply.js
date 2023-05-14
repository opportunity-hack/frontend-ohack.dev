
import { useState, useCallback, useEffect, useMemo } from "react";

import { useRouter } from "next/router";



// import { Puff } from "react-loading-icons";
import { Parallax } from "react-parallax";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Head from "next/head";
import useNonprofit from "../../hooks/use-nonprofit";
import { useAuth0 } from "@auth0/auth0-react";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Typography from "@mui/material/Typography";

import {
  LayoutContainer,
  DetailsContainer,
  TitleBanner,
  DescriptionStyled,
} from "../../styles/nonprofits/apply/styles";

export default function NonProfitApply() {
  const router = useRouter();
  let { nonprofits, handle_get_npo_form, handle_npo_form_submission } = useNonprofit();

  const { user, loginWithRedirect } = useAuth0();
  var image = "/npo_placeholder.png";
  var nonProfitOptions = [];

  const JOIN_SLACK_LINK =
    "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
  const createSlackAccount = () => {
    window.open(JOIN_SLACK_LINK, "_blank", "noopener noreferrer");
  };

  nonprofits.forEach((item) => {
    nonProfitOptions.push(item.name);
  });


  
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [formState, setFormState] = useState({
    charityName: "",
    charityLocation: "",
    understandProjectUncertainty: false,
    areasOfFocus: [],
    servedPopulations: [],
    contanctName: "",
    contactPhone: "",
    organizationPurposeAndHistory: "",
    technicalProblem: "",
    solutionBenefits: "",
    familiarWithSlack: false,
    keyStaffAvailability: [],
  });



  // Do this once on load with useEffect
  useEffect(() => {        
    const handleFormLoad = (data) => {
      console.log("handleFormLoad data: ", data);
      if (data) {
        setFormState(data);
      }
    };

    handle_get_npo_form(handleFormLoad);
  }, [user]);  



  var loginCallToAction = (
    <Stack alignItems="center" paddingTop={5}>
      <Alert variant="outlined" severity="warning">
        <AlertTitle>
          Whoa there - in order to submit this nonprofit form, you need to login or create an account first.
        </AlertTitle>

        <Stack alignItems="center" spacing={2}>
          <Stack direction="column" spacing={1}>
            <button
              className="button button--primary button--compact"
              onClick={() =>
                loginWithRedirect({
                  appState: {
                    returnTo: window.location.pathname,
                    redirectUri: window.location.pathname,
                  },
                })
              }
            >
              Log In
            </button>

            <Typography>
              We use Slack to collaborate, if you already have an account, login
              with Slack
            </Typography>
          </Stack>

          <Stack direction="column" spacing={1}>
            <button
              onClick={createSlackAccount}
              className="button button--primary"
            >
              Create a Slack account
            </button>

            <Typography>
              If you don't have an account, you will need to create an account
            </Typography>
          </Stack>
        </Stack>
      </Alert>
    </Stack>
  );

  const areasOfFocusSetState = (event) => {
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
    console.log("Response",response);
    setSubmitStatus(response);

    if( success )
    {
     //  router.push("/nonprofits/confirmation");
     console.log("success");
    }
    else
    {
      router.push("/nonprofits/errorOnSubmit");
    }
  }

  const handleSubmit = async () => {
    return handle_npo_form_submission(formState, onComplete)
  };
  

  return (
    <LayoutContainer key="apply_form" container>
      <Head>
        <title>Nonprofit Application</title>
        <meta
          name="description"
          content="Have a problem where you think software could help? Submit your application today!"
        />
      </Head>

      {!user && loginCallToAction}

      { user && <div>
      <TitleBanner>
        <Parallax bgImage={image} strength={300}></Parallax>
      </TitleBanner>
      <DetailsContainer container>        
        <DescriptionStyled>
          <h1 className="content__title">Nonprofit Project Application</h1>
          <div className="content__body">
            <div className="profile__header">
              <div className="profile__headline">
                <h4 className="profile__title">
                  Opportunity Hack is a 48-hour hackathon that brings together
                  software developers, designers, and project managers to solve
                  technical problems for public charities, non-profit
                  organizations (NPOs), and non-government organizations (NGOs).
                </h4>
                <br />
                This form helps us to find the charities that are the right fit
                for our event.
              </div>
            </div>
          </div>
        </DescriptionStyled>
        <DescriptionStyled>
          <p>
            <br />
            🥇 We're able to sponsor top prizes for teams who are selected by
            the judges to complete your project post-hackathon. We only can
            sponsor teams if we have sponsors, if you know of any companies
            would would be willing to sponsor a prize, please share{" "}
            <a
              href="https://www.ohack.org/sponsorship"
              target="_blank"
              style={{ color: "#0000EE", textDecoration: "underline" }}
            >
              <b>www.ohack.org/sponsorship</b>
            </a>{" "}
            within your network to help us complete as many projects as
            possible!
          </p>
          <p>
            Sponsorship allows us to incentivize teams to complete their
            hackathon projects. From our previous experience over the last 9
            years, in order for projects to reach completion states, we need to
            provide a prize with monetary value that attracts the attention of
            the team to follow-through.
          </p>
          <p>
            <b>Name of Charity Organization:</b>
            <br />
            We support charities including non-profits (NPOs) and non-government
            organizations (NGOs).
          </p>

          {/* <Autocomplete
            disablePortal
            id="combo-box-demo"
            freeSolo
            options={nonProfitOptions}
            sx={{ width: 300 }}
            required
            renderInput={(params) => ( */}
          <TextField
            // {...params}
            sx={{ width: 300 }}
            required
            label="Name of Charity Organization"
            defaultValue={formState.charityName}
            onChange={(event) => {
              setFormState({
                ...formState,
                charityName: event.target.value,
              });
              console.log(`Charity name changed to ${event.target.value}`);
            }}
          />
          <br />
          {/* )}
          /> */}
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

          <p>
            <br />
            <b>Complete transparency:</b> Not all projects will be completed
            after the hackathon <br />
          </p>
          <FormControlLabel
            control={
              <Checkbox
                type="checkbox"
                name="understandProjectUncertainty"
                formState={formState}
                setFormState={setFormState}
                onChange={(event) => {
                  setFormState({
                    ...formState,
                    understandProjectUncertainty: event.target.checked,
                  });
                }}
              />
            }
            label="I understand that my project may not be completed during this hackathon"
          />
        </DescriptionStyled>
        <DescriptionStyled>
          <br />
          <b>Areas of focus for your non-profit?</b>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Economic Empowerment"
                  onChange={areasOfFocusSetState}
                  checked={ formState.areasOfFocus.includes("Economic Empowerment") }                  
                />
              }
              label="Economic Empowerment"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Education"
                  onChange={areasOfFocusSetState}
                  checked={ formState.areasOfFocus.includes("Education") }
                />
              }
              label="Education"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Animals"
                  onChange={areasOfFocusSetState}
                  checked={ formState.areasOfFocus.includes("Animals") }
                />
              }
              label="Animals"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Environmental Sustainability"
                  onChange={areasOfFocusSetState}
                  checked={ formState.areasOfFocus.includes("Environmental Sustainability") }
                />
              }
              label="Environmental Sustainability"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Career Mentoring"
                  onChange={areasOfFocusSetState}
                  checked={ formState.areasOfFocus.includes("Career Mentoring")}
                />
              }
              label="Career Mentoring"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Arts & Culture"
                  onChange={areasOfFocusSetState}
                  checked={ formState.areasOfFocus.includes("Arts & Culture")}
                />
              }
              label="Arts & Culture"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Health and Human Services"
                  onChange={areasOfFocusSetState}
                />
              }
              label="Health and Human Services"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Other areas"
                  onChange={areasOfFocusSetState}
                />
              }
              label="Other areas"
            />
          </FormGroup>
        </DescriptionStyled>

        <DescriptionStyled>
          <br />
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
                />
              }
              label="Women"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Black"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Black"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Indigenous"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Indigenous"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Asian"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Asian"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="LatinX"
                  onChange={servedPopulationsSetState}
                />
              }
              label="LatinX"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Disabled"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Disabled"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="LGBTQUIA+"
                  onChange={servedPopulationsSetState}
                />
              }
              label="LGBTQIA+"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Veterans"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Veterans"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Immigrants/ Refugees"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Immigrants/Refugees"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Other"
                  onChange={servedPopulationsSetState}
                />
              }
              label="Other"
            />
          </FormGroup>
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <b>Contact Name:</b>
          <br />
          Who is the best person we can contact to better understand your
          problem statements? Feel free to include multiple people.
          <br />
          <TextField
            sx={{ width: 250 }}
            id="outlined-basic"
            label="Contact Name"
            variant="filled"
            required
            defaultValue={formState.contanctName}
            onChange={(event) => {
              setFormState({
                ...formState,
                contanctName: event.target.value,
              });
            }}
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <b>Contact Phone Number(s):</b>
          <br />
          We'd like to ensure our hackers (the people writing the code) have
          your contact information for any questions they have. We'd also like
          to have this number so that we can reach out to you before you are
          able to join us on Slack. Feel free to include multiple phone numbers
          separated by a comma(,).
          <br />
          <TextField
            sx={{ width: 250 }}
            id="outlined-basic"
            label="Contact Phone"
            variant="filled"
            required
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
          <b>Organization’s Purpose and History:</b>
          <br />
          Please provide a brief summary or your organization’s purpose and
          history. Feel free to include a link to your website or social media
          account.
          <br />
          <TextField
            fullWidth
            id="filled-textarea"
            label="Tell us more"
            placeholder="Tell us more about your organization"
            multiline
            rows={2}
            variant="filled"
            required
            defaultValue={formState.organizationPurposeAndHistory}
            onChange={(event) => {
              setFormState({
                ...formState,
                organizationPurposeAndHistory: event.target.value,
              });
            }}
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <b>Technical Problem:</b>
          <br />
          Describe what technical problem would you like hackathon participants
          to solve. Try to think only about the problem you are trying to solve,
          and not how you want to solve it. The more specific you can get with
          your problem(s), the better scoped your project will be. Given that
          this problem is solved, how can it help you and your non-profit in
          terms of cost savings, people served, time saved, etc.?
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
          <b>Benefit(s) to Organization:</b>
          <br />
          How would a solution to these challenges help further your work,
          mission, strategy, or growth?
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
          <b>Slack Familiarity:</b>
          <br />
          We use Slack as our only mechanism for communication for Opportunity
          Hack, we ask this question to better understand your knowledge of
          using Slack (see{" "}
          <a
            href="https://slack.com/"
            target="_blank"
            style={{ color: "#0000EE", textDecoration: "underline" }}
          >
            <b>Slack.com</b>
          </a>{" "}
          for more info).
          <FormControlLabel
            control={
              <Checkbox
                type="checkbox"
                name="familiarWithSlack"
                onChange={(event) => {
                  setFormState({
                    ...formState,
                    familiarWithSlack: event.target.checked,
                  });
                }}
              />
            }
            label="I am familiar with what Slack is"
          />
        </DescriptionStyled>
      </DetailsContainer>

      <DetailsContainer container>
        <DescriptionStyled>
          <br />
          <b>Key Staff Availability:</b>
          <br />
          Is at least one key staff person who is knowledgeable about the
          project and your needs available to attend the event?
          <br />
          This would include providing an email and phone number for questions
          during times when the staff isn't physically available. We use
          Slack.com as our primary communication platform both before the
          hackathon starts and during the hackathon. We'll send you a link with
          additional details a few months leading up to the hackathon.
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="They will be available remotely throughout the entire period by phone"
                  onChange={keyStaffAvailabilitySetState}
                />
              }
              label="They will be available remotely throughout the entire period by phone"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="They will be available remotely throughout the entire period by email and Slack"
                  onChange={keyStaffAvailabilitySetState}
                />
              }
              label="They will be available remotely throughout the entire period by email and Slack"
            />
            <FormControlLabel
              control={
                <Checkbox
                  type="checkbox"
                  name="Yes, they will be able to attend the final presentations and judging on Monday October 25th"
                  onChange={keyStaffAvailabilitySetState}
                />
              }
              label="Yes, they will be able to attend the final presentations and judging on Monday October 25th"
            />
          </FormGroup>
        </DescriptionStyled>
      </DetailsContainer>
      <DetailsContainer container>
        <DescriptionStyled>
          {
            // Loading/Save button with status uses MUI Lab
          }
            <LoadingButton
              color="secondary"
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSubmit}
            >
              <span>Submit</span>
            </LoadingButton>
          {submitStatus}
        </DescriptionStyled>
      </DetailsContainer>
      </div>}
    </LayoutContainer>
  );
}
