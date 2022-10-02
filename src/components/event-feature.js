import React from "react";
import Image from 'next/image'
import Link from "next/link";


import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function EventFeature({ title, type, nonprofits, start_date, end_date, location, devpostUrl, donationUrl, donationGoals, donationCurrent, icon }) {


    var anIcon = "https://i.imgur.com/Ih0mbYx.png";
    if (icon != null && icon != "")
    {
        anIcon = icon;
    }


    var donation = "";
    var donationButton = <a
                            href="https://www.paypal.com/donate/?hosted_button_id=CUJRGJHUKST9L"
                            target="_blank"
                            rel="noopener noreferrer">
                            <Button size="large" variant="contained">Support</Button>
                        </a>;


    var prize, swag, food = ""
    var prizePercent, prizeCurrent, prizeGoal = 0;
    var swagPercent, swagCurrent, swagGoal = 0;
    var foodPercent, foodCurrent, foodGoal = 0;
    var aTitle = "";
    
    
    var nonProfitButtons = "";
    if( nonprofits != null && nonprofits.length > 0 )
    {                
        nonProfitButtons = nonprofits.map( npo => {
            return(
                <Link href={`/nonprofit/${npo.id}`}>
                    <Box sx={{ width: '60%' }}>
                        <Button size="large" variant="contained">{npo.name}</Button>
                    </Box>
                </Link>
            );
        });

    }

    if( title != null && title != "" )
    {
        aTitle = <h5>{title}</h5>;
    }

    if( "prize" in donationGoals && "prize" in donationCurrent ){
        prizePercent = 100 * (donationCurrent["prize"] / donationGoals["prize"]);
        prizeGoal = donationGoals["prize"];
        prizeCurrent = donationCurrent["prize"];
        prize = <Stack
            spacing={1}
            direction="row">
            <span>Prizes</span>
            <Box sx={{ width: '60%' }}>
                <LinearProgressWithLabel value={prizePercent} />
            </Box> Current: ${prizeCurrent}  Goal: ${prizeGoal}
        </Stack>
    }

    if ("swag" in donationGoals && "swag" in donationCurrent) {
        swagPercent = 100 * (donationCurrent["swag"] / donationGoals["swag"]);
        swagGoal = donationGoals["swag"];
        swagCurrent = donationCurrent["swag"];
        swag = <Stack
            spacing={1}
            direction="row">
            <span>Swag</span>
            <Box sx={{ width: '60%' }}>

                <LinearProgressWithLabel value={swagPercent} />
            </Box> Current: ${swagCurrent}  Goal: ${swagGoal}
        </Stack>
    }
    if ("food" in donationGoals && "food" in donationCurrent) {
        foodPercent = 100 * (donationCurrent["food"] / donationGoals["food"]);
        foodGoal = donationGoals["food"];
        foodCurrent = donationCurrent["food"];
        food = <Stack
            spacing={1}
            direction="row">
            <span>Food</span>
            <Box sx={{ width: '60%' }}>
                <LinearProgressWithLabel value={foodPercent} />
            </Box> Current: ${foodCurrent}  Goal: ${foodGoal}

        </Stack>
    }


    if (donationUrl != null && donationUrl != "")
    {        
        donationButton = <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer">
            <Button size="large" variant="contained">Donate</Button>
        </a>;

        donation = <span><h5>Funding Goals</h5>           
            {prize}
            {swag}
            {food}
            </span>
            ;
    }


    function LinearProgressWithLabel(props) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                        props.value,
                    )}%`}</Typography>
                </Box>
            </Box>
        );
    }



    return (
        <Box className="ohack-event-feature">
            <Image
                className="ohack-feature__icon"
                src={anIcon}
                alt={`${location} ${type} ${start_date}`}
                width={100}
                height={48}
            />
            <span className="ohack-feature__headline">                
                {location} {type}
            </span>

            <Stack
                direction="column"
                spacing={2}>
                
                <p className="ohack-feature__description">{start_date} to {end_date}</p>
                {aTitle}
                {nonProfitButtons}

                {donation}

                <Stack
                    direction="row"
                    spacing={2}>
                {donationButton}
            
   
                <a
                href={devpostUrl}            
                target="_blank"
                rel="noopener noreferrer">
                    <Button size="large" variant="outlined">More Details&nbsp;<OpenInNewIcon /></Button>
                </a>
                </Stack>
            </Stack>

            
        </Box>
    );
}
