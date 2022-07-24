import React from "react";
import '../styles/profile.styles.css'


import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';



export const FeedbackLite = ( { feedback_url } ) => {

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
    

    return (                 
        <div className="profile__details">            
            
            <p className="indent">
            <Box
                sx={{                    
                    width: 400,                                        
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                        opacity: [0.9, 0.8, 0.7],
                    },
                }}
            >
                <TextField sx={{width:350}} id="outlined-basic" label="Your feedback link" defaultValue="..." size="small" variant="outlined" value={feedback_url} />
                <CopyAllIcon />                
            </Box>
            </p>


            <h2 className="profile__title">What</h2>
            
            <p className="indent">
                <Typography component="legend"><b>Productionalized Projects:</b> The number of projects that have been operationalized.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={1}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={20}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Requirements Gathering:</b> The number of projects where you gathered requirements.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={1}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={20}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Documentation:</b> The number of projects where you wrote awesome documentation for developers and nonprofits.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={1}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    max={20}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Design Architecture:</b> UML-like diagrams like: sequence, deployment, ERD, etc.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={4}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />
                
                <Typography component="legend">Code Quality</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={2}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend">Unit Test Writing</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={3}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend">Unit Test Coverage</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={2}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Observability:</b> You added monitoring capabilities to your software <a href="https://orangematter.solarwinds.com/2017/10/05/monitoring-and-observability-with-use-and-red/" rel="noreferrer" target="_black">like USE and RED.</a></Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={2}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />  
            </p>


            
            <h2 className="profile__title">How</h2>
            <p className="indent">
                <Typography component="legend"><b>Standups Completed:</b> You provided updates on your work and communicated to your team.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={4}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Code Reliability:</b> the code you write doesn't crash and is available for people to use.</Typography>                
                <StyledRating
                    name="customized-color"
                    defaultValue={2}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b><a href="https://www.linkedin.com/pulse/cdi-customer-driven-innovation-fredrik-haren/" target="_blank">Customer Driven Innovation (CDI)</a> and <a href="https://designthinking.ideo.com/" rel="noreferrer" target="_blank">Design Thinking</a>:</b> You have consistent conversations with your customer to get feedback on what you're building.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={5}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />

                <Typography component="legend"><b>Iterations of code pushed to production:</b> You iterated on the final product.</Typography>
                <StyledRating
                    name="customized-color"
                    defaultValue={2}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                    precision={0.5}
                    icon={<FavoriteIcon fontSize="inherit" />}
                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                />
            </p>


        </div>

    );
};
