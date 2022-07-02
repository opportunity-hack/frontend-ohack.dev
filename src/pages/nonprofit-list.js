import React from "react";


import '../styles/profile.styles.css'

import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { NonProfitListTile } from "../components/nonprofit-list-tile";
import { useNonprofit } from "../hooks/use-nonprofit";


export const NonProfitList = () => {

    const { nonprofits } = useNonprofit();
    
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
                                {
                                    nonprofits.map(npo => {
                                        return <NonProfitListTile                                            
                                            key={npo.id}
                                            title={npo.name}
                                            description={npo.description}
                                            count_problem_statements={ npo.problem_statements.length }
                                            slack_channel={npo.slack_channel}
                                            resourceUrl={`/nonprofit/${npo.id}`}
                                            icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                        />;
                                    })
                                }                                                            
                            </div>
                        </div>
                        

                    </div>
                </div>
            </div>
        </div>
    );
};
