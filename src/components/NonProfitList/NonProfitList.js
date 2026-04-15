import useNonprofit from "../../hooks/use-nonprofit";
import Moment from "moment";

import Chip from "@mui/material/Chip";
import BuildIcon from "@mui/icons-material/Build";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import NonProfitListTile from "../NonProfitListTile/NonProfitListTile";
import SearchIcon from '@mui/icons-material/Search';

import { useState, useCallback } from "react";
import { Puff } from "react-loading-icons";

import { NonProfitContainer, NonProfitGrid } from "../../styles/nonprofits/styles";
import useProfileApi from "../../hooks/use-profile-api";
import useHackathonEvents from "../../hooks/use-hackathon-events";

import {
  ContentContainer,
  InnerContainer,
} from "../../styles/nonprofits/styles";
import { Search, SearchIconWrapper, StyledInputBase } from "./styles";
import { 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip as MuiChip
} from "@mui/material";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";
import {
  LaunchRounded,
  EventRounded,
  TrendingUpRounded,
  FavoriteRounded,
  GroupsRounded,
  CheckCircleRounded,
  AccessTimeRounded,
  RocketLaunchRounded
} from "@mui/icons-material";

function NonProfitList() {
    let { nonprofits } = useNonprofit();    
    const { profile } = useProfileApi();
    const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

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
    }, [nonprofits, needs_help_flag, production_flag, searchString, profile]);

    const formatEventDate = (startDate, endDate) => {
      const start = Moment(startDate);
      const end = Moment(endDate);
      
      if (start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
        return start.format('dddd, MMMM Do YYYY');
      }
      
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    };

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

          {/* Call to Action Section */}
          <Box sx={{ mb: 4 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  opacity: 0.1,
                  transform: 'rotate(15deg)'
                }}
              >
                <RocketLaunchRounded sx={{ fontSize: 150 }} />
              </Box>
              
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}
              >
                <FavoriteRounded sx={{ mr: 2, verticalAlign: 'bottom' }} />
                Ready to Make a Difference?
              </Typography>
              
              <Typography
                variant="h6"
                sx={{ mb: 3, opacity: 0.9, position: 'relative', zIndex: 1 }}
              >
                🚀 Join our mission to empower nonprofits with technology solutions
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LaunchRounded color="primary" sx={{ mr: 2 }} />
                        <Typography variant="h6" color="text.primary">
                          Submit Your Project
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Have a nonprofit that needs tech help? Get matched with skilled 
                        developers who want to create social impact.
                      </Typography>
                      <MuiChip
                        label="Free Service"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <MuiChip
                        label="Ongoing Support"
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EventRounded color="secondary" sx={{ mr: 2 }} />
                        <Typography variant="h6" color="text.primary">
                          Join Upcoming Hackathons
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Participate in our global hackathons where your project could 
                        be built by passionate developers in just 48 hours.
                      </Typography>
                      <MuiChip
                        label="Global Events"
                        color="info"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <MuiChip
                        label="Fast Results"
                        color="warning"
                        size="small"
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5
                  }}
                  href="/nonprofits/apply"
                  startIcon={<LaunchRounded />}
                >
                  Apply Now - It's Free!
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    },
                    px: 4,
                    py: 1.5
                  }}
                  href="/hack"
                  startIcon={<EventRounded />}
                >
                  View Hackathons
                </Button>
              </Box>
            </Paper>

            {/* Upcoming Events Preview */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': { width: '100%' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      <AccessTimeRounded sx={{ mr: 1, verticalAlign: 'bottom' }} />
                      Upcoming Hackathon Alert!
                    </Typography>
                    <Typography variant="body2">
                      <strong>{upcomingEvents[0].title}</strong> - {formatEventDate(upcomingEvents[0].start_date, upcomingEvents[0].end_date)}
                      <br />
                      📍 {upcomingEvents[0].location} • Perfect timing to submit your project!
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      href={`/hack/${upcomingEvents[0].event_id}`}
                      sx={{ minWidth: 120 }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Box>
              </Alert>
            )}

            {/* Success Stories Call to Action */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  opacity: 0.1,
                  transform: 'rotate(-15deg)'
                }}
              >
                <TrendingUpRounded sx={{ fontSize: 120 }} />
              </Box>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
                <CheckCircleRounded sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Proven Impact: Real Success Stories
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.95, position: 'relative', zIndex: 1 }}>
                See how our platform has transformed nonprofits worldwide with innovative technology solutions. 
                From AI-powered adoption systems to automated data management - discover the real impact we're making together.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                <MuiChip
                  label="🏆 200+ nonprofits helped"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  size="small"
                />
                <MuiChip
                  label="💰 $2M+ in free development"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  size="small"
                />
                <MuiChip
                  label="🌍 50+ countries reached"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  size="small"
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'success.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  position: 'relative',
                  zIndex: 1
                }}
                href="/about/success-stories"
                startIcon={<TrendingUpRounded />}
              >
                View Success Stories
              </Button>
            </Paper>
          </Box>
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

      <HelpUsBuildOHack github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/204" github_name="Issue #204" />
    </ContentContainer>
    );
}

export default NonProfitList;