import React from "react";
import Image from 'next/image'
import Link from "next/link";

import * as ga from '../lib/ga'


import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function EventFeature({ title, type, nonprofits, start_date, end_date, location, devpostUrl, eventLinks, donationUrl, donationGoals, donationCurrent, icon }) {


    var anIcon = "https://i.imgur.com/Ih0mbYx.png";
    if (icon != null && icon != "")
    {
        anIcon = icon;
    }

    const gaButton = (action, actionName) => {
        ga.event({
            action: action,
            params: {
                action_name: actionName,
                event_title: title,
                event_type: type,
                event_start: start_date,
                event_location: location
            }
        })
    }

    var donation = "";    

    var prize, swag, food, thankYou = ""
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
                        <Button onClick={() => gaButton("event_button_click", npo.name)} size="large" variant="contained">{npo.name}</Button>
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
            alignItems="center"
            direction="row">
            <span>Prizes</span>
            <Box sx={{ width: '60%' }}>
                <LinearProgressWithLabel value={prizePercent} />
            </Box> Current: ${prizeCurrent}<br />Goal: ${prizeGoal}
        </Stack>
    }

    if ("swag" in donationGoals && "swag" in donationCurrent) {
        swagPercent = 100 * (donationCurrent["swag"] / donationGoals["swag"]);
        swagGoal = donationGoals["swag"];
        swagCurrent = donationCurrent["swag"];
        swag = <Stack
            spacing={1}
            alignItems="center"
            direction="row">
            <span>Swag</span>
            <Box sx={{ width: '60%' }}>

                <LinearProgressWithLabel value={swagPercent} />
            </Box> Current: ${swagCurrent}<br />Goal: ${swagGoal}
        </Stack>
    }
    if ("food" in donationGoals && "food" in donationCurrent) {
        foodPercent = 100 * (donationCurrent["food"] / donationGoals["food"]);
        foodGoal = donationGoals["food"];
        foodCurrent = donationCurrent["food"];
        food = <Stack
            spacing={1}
            alignItems="center"
            direction="row">
            <span>Food</span>
            <Box sx={{ width: '60%' }}>
                <LinearProgressWithLabel value={foodPercent} />
            </Box> Current: ${foodCurrent}<br/>Goal: ${foodGoal}

        </Stack>
    }


    if( "thank_you" in donationCurrent )
    {
        const ty = donationCurrent["thank_you"];
        thankYou = <div><b>Thank you</b> {ty}</div>;

        donation = <span><h5>Funding Goals</h5>           
        <Stack spacing={2}>
        {prize}            
        {swag}
        {food}
        </Stack>
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

    var linksContent = "";    

    if( eventLinks != null && eventLinks.length > 0 )
    {
        linksContent = eventLinks.map( link => {
            const alink = link.link;
            const name = link.name;

            var icon = "";
            if( link.open_new != null && link.open_new === "True" )
            {
                icon = <span>&nbsp;<OpenInNewIcon /></span>
            }

            var size = "";
            if( link.size != null )
            {
                size = link.size;
            }

            var variant = "";
            if( link.variant != null )
            {
                variant = link.variant;
            }

            var color = "primary";
            if( link.color != null )
            {
                color = link.color;
            }

            return(                
                <a
                href={link.link}            
                target="_blank"
                rel="noopener noreferrer">
                        <Button onClick={() => gaButton("more_details_button_click", alink)} color={color} size={size} variant={variant}>{name}{icon}</Button>
                </a> 
            )
        })
    }



    return (
        <Box className="ohack-feature">
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
                {linksContent}               
                </Stack>
                
                {thankYou}
            </Stack>

            
        </Box>
    );
}
