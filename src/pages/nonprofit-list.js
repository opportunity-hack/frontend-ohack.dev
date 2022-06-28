import React from "react";


import './profile.styles.css'

import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { NonProfitListTile } from "./nonprofit-list-tile";


export const NonProfitList = () => {
    
    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));   
    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }));

    return (
        <div className="content-layout">
            <h1 className="content__title">Nonprofits</h1>
            <div className="content__body">
                <div className="profile-grid">
                    <div className="profile__header">
                        <div className="profile__headline">
                            <h2 className="profile__title">This page will contain a list of nonprofits and the problem statements we have worked on</h2>                            
                        </div>
                    </div>

                    <div className="profile__details">
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </Search>
    

                        <div className="ohack-features">                            
                            <div className="ohack-features__grid">
                                <NonProfitListTile
                                    title="Matthew's Crossing"
                                    description="At Matthew’s Crossing Food Bank, we strive to serve our neighbors in need with compassion, so they can preserve their dignity, and have hope for a healthier and happier future."
                                    resourceUrl="/nonprofit/1"
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />
                                <NonProfitListTile
                                    title="Neurologic Music Therapy Services of Arizona"
                                    description="Neurologic Music Therapy Services of Arizona’s (NMTSA) vision is to unleash the unique potential of individuals with disabilities."
                                    resourceUrl="/nonprofit/11"
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />
                                <NonProfitListTile
                                    title="Neurologic Music Therapy Services of Arizona"
                                    description="Neurologic Music Therapy Services of Arizona’s (NMTSA) vision is to unleash the unique potential of individuals with disabilities."
                                    resourceUrl="/nonprofit/111"
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />
                                <NonProfitListTile
                                    title="Tranquility Trail Animal Sanctuary"
                                    description="We believe it is of the utmost importance to not only care for the animals’ physical well-being but their emotional well-being as well. "
                                    resourceUrl="/nonprofit/1111"
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />
                                <NonProfitListTile
                                    title="Million Dollar Teacher Project"
                                    description="Million Dollar Teacher Project is aimed at increasing support for teachers inside and outside of the classroom, raising the profile of highly effective teachers and drastically improving teacher compensation to bring the teaching profession to the prestigious level it deserves so ALL students are able to receive excellent instruction every day."
                                    resourceUrl="/nonprofit/11111"
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />
                                <NonProfitListTile
                                    title="Zuri's Circle"
                                    description="Zuri’s Circle (My Beautiful Circle) began as a simple dream that grew into a reality as Co-Founder Zuri Muhammad had ideas of how we could help a classmate in her school that was struggling with basic needs. Later Zuri would draw a picture that would become the logo we use to this day, creating the foundation for Zuri’s Circle."
                                    resourceUrl="/nonprofit/111111"
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />
                            </div>
                        </div>
                        

                    </div>
                </div>
            </div>
        </div>
    );
};
