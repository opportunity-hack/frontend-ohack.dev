
import useNonprofit from "../../hooks/use-nonprofit";

import Chip from "@mui/material/Chip";
import BuildIcon from "@mui/icons-material/Build";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import NonProfitListTile from "../NonProfitListTile/NonProfitListTile";
import SearchIcon from '@mui/icons-material/Search';

import { useState, useCallback } from "react";
import { Puff } from "react-loading-icons";

import { NonProfitContainer, NonProfitGrid } from "../../styles/nonprofits/styles";
import useProfileApi from "../../hooks/use-profile-api";

import {
  ContentContainer,
  InnerContainer,
} from "../../styles/nonprofits/styles";
import { Search, SearchIconWrapper, StyledInputBase } from "./styles";
import { Typography } from "@mui/material";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";

function NonProfitList() {
    let { nonprofits } = useNonprofit();    
    const { profile } = useProfileApi();

    const [searchString, setSearchString] = useState('');
    const [needs_help_flag, setNeedsHelpFlag] = useState(true);
    const [production_flag, setProductionFlag] = useState(false);

    const showNeedsHelp = (event) => {
        setNeedsHelpFlag(!needs_help_flag);
    };
    
    const showProduction = (event) => {
        setProductionFlag(!production_flag);
    };

    const onChangeSearchHandler = (event) => {
      setSearchString(event.target.value);
    }

    const needsHelpButton = () => {
        if (needs_help_flag) {
          return (
            <Chip
              icon={<BuildIcon />}
              color="warning"
              style={{ fontSize: "1.5rem" }}
              onClick={showNeedsHelp}
              onDelete={showNeedsHelp}
              label="Needs Help"
            />
          );
        } else {
          return (
            <Chip
              icon={<BuildIcon />}
              color="default"
              variant="outlined"
              style={{ fontSize: "1.5rem" }}
              onClick={showNeedsHelp}
              label="Needs Help"
            />
          );
        }
    };
    

    const productionButton = () => {
        if (production_flag) {
            return (
            <Chip
                icon={<WorkspacePremiumIcon />}
                color="success"
                style={{ fontSize: "1.5rem", marginLeft: "0.5rem" }}
                onClick={showProduction}
                onDelete={showProduction}
                label="Live"
            />
            );
        } else {
            return (
            <Chip
                icon={<WorkspacePremiumIcon />}
                color="default"
                variant="outlined"
                style={{ fontSize: "1.5rem", marginLeft: "0.5rem" }}
                onClick={showProduction}
                label="Live"
            />
            );
        }
    };

    const nonProfitList = useCallback(() => {
      let result = nonprofits;
      
      if (result == null || result.length === 0) {
        return (
            <p>
            Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" />
            </p>
        );
      }
      
      if (searchString) {
        result = result.filter(
          nonprofit =>
            nonprofit.name.toLowerCase().includes(searchString.toLowerCase()) ||
            nonprofit.description.toLowerCase().includes(searchString.toLowerCase()) 
        );

        if (result == null || result.length === 0) {
          return (
            <Typography variant="h3" color="var(--dark-aluminium)">
              No matching Projects found!
            </Typography>
          )
        }
      }
        
      return result.map((npo) => {                                    
        return (
          <NonProfitListTile
            key={npo.id}     
            npo={npo}            
            profile={profile}
            needs_help_flag={needs_help_flag}
            production_flag={production_flag}         
            icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
          />
        );
        
      });
    }, [nonprofits, needs_help_flag, production_flag, searchString]);

    return(
        <ContentContainer container>      
      <InnerContainer container>
        <h1 className="content__title">Nonprofit Projects</h1>
        <div className="content__body">
          <div className="profile__header">
            <div className="profile__headline">
              <h3 className="profile__title">
                Review our catalog of nonprofit problems that need your help
              </h3>
              Here you'll find all nonprofits that we've worked with and those
              that need help, we hope that you find something that you'll love
              to work on.
            </div>
          </div>
        {/* TODO: Move everything above here and return to pages/nonprofits/index.js  once MUI has been set up to render server side. */}
        <div className="profile__details">
            {/* TODO: Get search working to make it easier to search all text for what the user is looking for */}
          <Search>
              <SearchIconWrapper>
                  <SearchIcon style={{ fontSize: "1.75rem" }} />
              </SearchIconWrapper>
              <StyledInputBase
                  style={{ fontSize: "1.75rem" }}
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={onChangeSearchHandler}
                  value={searchString}
                  autoFocus={true}
              />
          </Search>
                       
            {needsHelpButton()}
            &nbsp;
            {productionButton()}
            <NonProfitContainer>
              <NonProfitGrid>{nonProfitList()}</NonProfitGrid>
            </NonProfitContainer>
          </div>
        {/* TODO: Move everything below here and end of function to pages/nonprofits/index.js once MUI has been set up to render server side. */}
        </div>
      </InnerContainer>

      <HelpUsBuildOHack github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/4" github_name="Issue #4" />
    </ContentContainer>
    );
}

export default NonProfitList;