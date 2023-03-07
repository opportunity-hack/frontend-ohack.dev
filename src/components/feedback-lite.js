import React from "react";

import { useState } from 'react'

import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import TextField from '@mui/material/TextField';
// import Box from '@mui/material/Box';

import { 
//    Button, 
    Snackbar 
} from '@mui/material'
// import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
// import { Puff } from 'react-loading-icons'

// TODO: Is this part of a dead tree?
export default function FeedbackLite ( {feedback_url, history} ){
    const [open, setOpen] = useState(false);

    const [whatPrivate, setWhatPrivate] = useState(true);
    const [howPrivate, setHowPrivate] = useState(true);
    
    const whatPrivateText = whatPrivate ? "Private" : "Public";
    const howPrivateText = howPrivate ? "Private" : "Public";


    const defaultHistory = {
        "what": {
            "productionalized_projects": 0.5,
            "requirements_gathering": 0,
            "documentation": 0,
            "design_architecture": 0,
            "code_quality": 0,
            "unit_test_writing": 0,
            "unit_test_coverage": 0,
            "observability": 0
        },
        "how": {
            "standups_completed": 0,
            "code_reliability": 0,
            "customer_driven_innovation_and_design_thinking": 0, 
            "iterations_of_code_pushed_to_production": 0
        }
    };
    if( history === "" || history === undefined )
    {
        history = defaultHistory;
    }

    const MAX_HEARTS = 10;

    const StyledRating = styled(Rating)({
        '& .MuiRating-iconFilled': {
            color: '#ff6d75',
        },
        '& .MuiRating-iconHover': {
            color: '#ff3d47',
        },
    });

    /*
    This is meant to be embedded on other pages which is why it's called "Lite"
    The more correct term is likely Fragment
    */    
    
    const handleWhatPrivateClick = () => {
        setWhatPrivate( !whatPrivate );
    }

    const handleHowPrivateClick = () => {
        setHowPrivate(!howPrivate);
    }

    const handleClick = () => {
        setOpen(true);

        if (feedback_url != null) {            
            navigator.clipboard.writeText(feedback_url);
        }        
    }

    return (                 
        <div className="profile__details">            
            
            <p className="indent">
            
                <TextField onClick={handleClick} 
                    sx={{width:350}} id="outlined-basic" 
                    label="Your feedback link" defaultValue="..." 
                    size="small" variant="outlined" value={feedback_url} />
                <CopyAllIcon onClick={handleClick}  />    

                <Snackbar
                    open={open}
                    onClose={() => setOpen(false)}
                    autoHideDuration={2000}
                    message="Copied link to clipboard"
                />            
            </p>


            <h2 className="profile__title">What <FormControlLabel onClick={handleWhatPrivateClick} control={<Switch defaultChecked />} label={whatPrivateText} /></h2>
            What you've completed for nonprofits
            <p className="indent">
                <Typography component="legend"><b>Productionalized Projects:</b> The number of projects that have been operationalized.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.productionalized_projects}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Requirements Gathering:</b> The number of projects where you gathered requirements.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.requirements_gathering}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Documentation:</b> The number of projects where you wrote awesome documentation for developers and nonprofits.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.documentation}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Design Architecture:</b> UML-like diagrams like: sequence, deployment, ERD, etc.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.design_architecture}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />
                
                <Typography component="legend">Code Quality</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.code_quality}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend">Unit Test Writing</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.unit_test_writing}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend">Unit Test Coverage</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.unit_test_coverage}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Observability:</b> You added monitoring capabilities to your software <a href="https://orangematter.solarwinds.com/2017/10/05/monitoring-and-observability-with-use-and-red/" rel="noreferrer" target="_black">like USE and RED.</a></Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.what.observability}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />  
            </p>


            
            <h2 className="profile__title">How <FormControlLabel onClick={handleHowPrivateClick} control={<Switch defaultChecked />} label={howPrivateText}/></h2>
            How you went about it
            <p className="indent">
                <Typography component="legend"><b>Standups Completed:</b> You provided updates on your work and communicated to your team.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.how.standups_completed}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Code Reliability:</b> the code you write doesn't crash and is available for people to use.</Typography>                
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.how.code_reliability}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b><a href="https://www.linkedin.com/pulse/cdi-customer-driven-innovation-fredrik-haren/" rel="noreferrer" target="_blank">Customer Driven Innovation (CDI)</a> and <a href="https://designthinking.ideo.com/" rel="noreferrer" target="_blank">Design Thinking</a>:</b> You have consistent conversations with your customer to get feedback on what you're building.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.how.customer_driven_innovation_and_design_thinking}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Iterations of code pushed to production:</b> You iterated on the final product.</Typography>
                <StyledRating
                    readOnly
                    name="customized-color"
                    defaultValue={history.how.iterations_of_code_pushed_to_production}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={MAX_HEARTS}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />
            </p>


        </div>

    );
};
