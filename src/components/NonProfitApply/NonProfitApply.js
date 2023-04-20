// TODO: We should probably get away from importing the entire react module
import React, { 
    useState, 
    // useCallback 
} from "react";

import useNonprofit from "../../hooks/use-nonprofit";

// import { Puff } from "react-loading-icons";
import { Parallax } from "react-parallax";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';


import Head from "next/head";

import {
    LayoutContainer,
    DetailsContainer,   
    // TitleContainer,     
    TitleBanner,    
    DescriptionStyled
} from "../../styles/nonprofits/apply/styles";

// import { Deck, Details } from "@mui/icons-material";

export default function NonProfitApply() {
    let { nonprofits } = useNonprofit();

    var image = "/npo_placeholder.png"
    var nonProfitOptions = ["TBD", "This is currently in development", "One", "Two"]
    
    nonprofits.forEach( (item) => {
        nonProfitOptions.push(item.name);
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
    const [formState, setFormState] = useState({
        charityName: "",
        location: "",
        understandProjectUncertainty: false, 
        areasOfFocus: [], 
        servedPopulations: [], 
        contanctName: "",
        contactPhone: "", 
        organizationPurposeAndHistory: "", 
        technicalProblem: "",
        solutionBenefits: "",
        familiarWithSlack: false, 
        keyStaffAvailability: []
    }); 

    function handleClick() {
        setLoading(true);
        setSubmitStatus("");
        setTimeout(function () {            
            setLoading(false);            
            setSubmitStatus("This doesn't do anything yet");
        }, 1111);        
    }
    
    return (        
        <LayoutContainer key="apply_form" container>
            <Head>
                <title>
                    Nonprofit Application
                </title>
                <meta
                    name="description"
                    content="Have a problem where you think software could help? Submit your application today!"
                />
            </Head>

            
            <TitleBanner>
                <Parallax bgImage={image} strength={300}></Parallax>
            </TitleBanner>
            
            
            <DetailsContainer container>
                <DescriptionStyled>
                <h1 className="content__title">Nonprofit Project Application</h1>
                <div className="content__body">

                    <Alert severity="error">Don't use this yet! We're still working on it.</Alert>
                       
                    <div className="profile__header">
                      
                        <div className="profile__headline">
                            <h4 className="profile__title">
                                Opportunity Hack is a 48-hour hackathon that brings together software developers,
                                designers, and project managers to solve technical problems for public charities,
                                non-profit organizations (NPOs), and non-government organizations (NGOs).                                
                            </h4>                            
                            This form helps us to find the charities that are the right fit for our event. 
                        </div>                    
                    </div>                                    
                </div>       
                
                
                </DescriptionStyled>
                <DescriptionStyled>
                    <p>
                        🥇We're able to sponsor top prizes for teams who are selected by the judges to
                        complete your project post-hackathon.  We only can sponsor teams if we have sponsors,
                        if you know of any companies would would be willing to sponsor a prize, please share
                        https://www.ohack.org/sponsorship within your network to help us complete as many projects
                        as possible!
                    </p>
                    <p>
                        Sponsorship allows us to incentivize teams to complete their hackathon projects.
                        From our previous experience over the last 9 years, in order for projects to reach completion
                        states, we need to provide a prize with monetary value that attracts the attention of the team
                        to follow-through.
                    </p>
                    <p>
                        We support charities including non-profits (NPOs) and non-government organizations (NGOs)
                    </p>
                
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        freeSolo
                        options={nonProfitOptions}
                        sx={{ width: 300 }}
                        formState={formState}
                        setFormState={setFormState}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Name of Charity Organization"
                                value={formState.charityName}
                                onChange={(event) => {
                                    console.log("onChange"); 
                                    setFormState({
                                        ...formState, 
                                        charityName: event.target.value
                                    }); 
                                }} 
                            />
                        )}
                    />
                                                        
                    <p>
                    Complete transparency: Not all projects will be completed after the hackathon <br/>
                    </p>
                    <FormControlLabel control={<Checkbox/>} label="I understand that my project may not be completed during this hackathon" />                        
                    
                </DescriptionStyled>
                <DescriptionStyled>
                    Areas of focus for your non-profit?
                    <FormGroup>
                        <FormControlLabel control={<Checkbox/>} label="Economic Empowerment" />
                        <FormControlLabel control={<Checkbox />} label="Education" />
                        <FormControlLabel control={<Checkbox />} label="Animals" />
                        <FormControlLabel control={<Checkbox />} label="Environmental Sustainability" />
                        <FormControlLabel control={<Checkbox />} label="Career Mentoring" />
                        <FormControlLabel control={<Checkbox />} label="Hunger & Homelessness" />
                        <FormControlLabel control={<Checkbox />} label="Arts & Culture" />
                        <FormControlLabel control={<Checkbox />} label="Health and Human Services" />                        
                        <FormControlLabel control={<Checkbox />} label="Other areas" />
                    </FormGroup>                                        
                </DescriptionStyled>

                <DescriptionStyled>
                Does your organization or program serve a majority (51% or more) of any of the following populations?
                <FormGroup>
                    <FormControlLabel control={<Checkbox />} label="Women" />
                    <FormControlLabel control={<Checkbox />} label="Black" />
                    <FormControlLabel control={<Checkbox />} label="Indigenous" />
                    <FormControlLabel control={<Checkbox />} label="Asian" />
                    <FormControlLabel control={<Checkbox />} label="LatinX" />
                    <FormControlLabel control={<Checkbox />} label="Disabled" />
                    <FormControlLabel control={<Checkbox />} label="LGBTQIA+" />
                    <FormControlLabel control={<Checkbox />} label="Veterans" />
                    <FormControlLabel control={<Checkbox />} label="Immigrants/Refugees" />
                    <FormControlLabel control={<Checkbox />} label="Other" />                        
                </FormGroup>                                        
                </DescriptionStyled>
                </DetailsContainer>

                <DetailsContainer container>
                <DescriptionStyled>
                    Contact People                    
                    Who is the best person we can contact to better understand your problem statements?  Feel free to include as many people as possible.
                    <br/>
                    <TextField sx={{ width: 250 }} id="outlined-basic" label="Contact Name" variant="filled" required />                    
                </DescriptionStyled>                
                </DetailsContainer>
            
                <DetailsContainer container>
                <DescriptionStyled>                    
                    Contact phone number(s)

                    We'd like to ensure our hackers (the people writing the code) have your contact information
                    for any questions they have, we'd also like to have this number so that we can reach out to you
                    before you are able to join us on Slack. Feel free to include as many phone numbers as possible.
                    <br />
                    <TextField sx={{ width: 250 }} id="outlined-basic" label="Contact Phone" variant="filled" required />
                </DescriptionStyled>
            </DetailsContainer>


                <DetailsContainer container>
                <DescriptionStyled>
                    Please provide a brief summary or your organization’s purpose and history.
                    Feel free to include a link to this if it's easier for us to read it on your website or social media account
                    <br />                    
                    <TextField
                        fullWidth
                        id="filled-textarea"
                        label="Tell us more"
                        placeholder="Tell us more about your organization"
                        multiline
                        rows={2}
                        variant="filled"
                    />
                </DescriptionStyled>
                </DetailsContainer>

                <DetailsContainer container>
                <DescriptionStyled>
                    Describe what technical problem would you like hackathon participants to solve.
                    Try to think only about the problem you are trying to solve, and not how you want to solve it. 
                    The more specific you can get with your problem(s), the better scoped your project will be.
                    Given that this problem is solved, how can it help you and your non-profit in terms of cost savings, people served, time saved, etc.?
                    <br/>
                    <TextField
                        fullWidth
                        id="filled-textarea"
                        label="What problem do you have?"
                        placeholder="Give an overview of your problem: painpoints, things that could be better, etc."
                        multiline
                        rows={4}
                        variant="filled"
                    />
                </DescriptionStyled>
                </DetailsContainer>
                
                <DetailsContainer container>
                <DescriptionStyled>                     
                    We use Slack as our only mechanism for communication for Opportunity Hack, we ask this question to better understand your knowledge of using Slack (see Slack.com for more info)
                    <FormControlLabel control={<Checkbox />} label="I am familiar with what Slack is" />                        
                </DescriptionStyled>
                </DetailsContainer>
                
                <DetailsContainer container>
                <DescriptionStyled>
                    Is at least one key staff person who is knowledgeable about the project and your needs available to attend the event? This would include providing an email and phone number for questions during times when the staff isn't physically available.                    
                    We use Slack.com as our primary communication platform both before the hackathon starts and during the hackathon.  We'll send you a link with additional details a few months leading up to the hackathon.
                    <FormGroup>
                        <FormControlLabel control={<Checkbox />} label="They will be available remotely throughout the entire period by phone" />
                        <FormControlLabel control={<Checkbox />} label="They will be available remotely throughout the entire period by email and Slack" />
                        <FormControlLabel control={<Checkbox />} label="Yes, they will be able to attend the final presentations and judging on Monday October 25th" />                        
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
                        onClick={handleClick}
                        loading={loading}
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="contained"
                    >
                        <span>Save</span>
                    </LoadingButton>
                    {submitStatus}
                </DescriptionStyled>
            </DetailsContainer>
            
            
        </LayoutContainer>
    );
}
