import React from "react";

import { useState } from 'react'

import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import TextField from '@mui/material/TextField';
import Link from 'next/link'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


import {  
    Snackbar 
} from '@mui/material'
import PrivacyToggle from './PrivacyToggle/PrivacyToggle';
import usePrivacySettings from '../hooks/use-privacy-settings';


const StyledRating = styled(Rating)(({ theme }) => ({
    '& .MuiRating-iconFilled': {
        color: '#ff6d75',
    },
    '& .MuiRating-iconHover': {
        color: '#ff3d47',
    },
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        '& .MuiRating-icon': {
            fontSize: '1.2rem',
        },
    },
}));

function RatingItem({ label, description, value, maxHearts }) {
    return (
        <Box sx={{
            py: { xs: 1, sm: 1.5 },
            '&:not(:last-child)': {
                borderBottom: '1px solid',
                borderColor: 'divider',
            },
        }}>
            <Typography
                variant="body2"
                component="div"
                sx={{
                    fontWeight: 'bold',
                    mb: 0.25,
                    wordBreak: 'break-word',
                }}
            >
                {label}
            </Typography>
            {description && (
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{ mb: 0.5, wordBreak: 'break-word' }}
                >
                    {description}
                </Typography>
            )}
            <StyledRating
                readOnly
                name="customized-color"
                defaultValue={value}
                getLabelText={(v) => `${v} Heart${v !== 1 ? "s" : ""}`}
                precision={0.5}
                max={maxHearts}
                icon={<FavoriteIcon fontSize="inherit" />}
                emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
            />
        </Box>
    );
}

// TODO: Is this part of a dead tree?
export default function FeedbackLite ( {feedback_url, history} ){
    const [open, setOpen] = useState(false);
    const { privacySettings, togglePrivacySetting } = usePrivacySettings();

    const whatPrivate = privacySettings.what === 'private';
    const howPrivate = privacySettings.how === 'private';


    const defaultHistory = {
        "what": {
            "productionalized_projects": 0.5,
            "requirements_gathering": 0,
            "documentation": 0,
            "design_architecture": 0,
            "code_quality": 0,
            "unit_test_writing": 0,
            "unit_test_coverage": 0,
            "observability": 0,
            "judge": 0,
            "mentor": 0
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

    /*
    This is meant to be embedded on other pages which is why it's called "Lite"
    The more correct term is likely Fragment
    */    
    
    const handleClick = () => {
        setOpen(true);

        if (feedback_url != null) {            
            navigator.clipboard.writeText(feedback_url);
        }        
    }

    return (
      <Box sx={{
        mt: { xs: 2, sm: 4 },
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField
            onClick={handleClick}
            sx={{ width: '100%', maxWidth: { xs: '100%', sm: 350 } }}
            id="outlined-basic"
            label="Your feedback link"
            defaultValue="..."
            size="small"
            variant="outlined"
            value={feedback_url}
          />
          <CopyAllIcon onClick={handleClick} sx={{ cursor: 'pointer', flexShrink: 0 }} />

          <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            autoHideDuration={2000}
            message="Copied link to clipboard"
          />
        </Box>
        <Stack spacing={2} direction={{ xs: "column", sm: "row" }} sx={{ mb: 3 }}>
          <Link href="/cert">
            <Button variant="contained" fullWidth>
              See all certificates
            </Button>
          </Link>
          <Link href="/about/hearts">
            <Button variant="contained" fullWidth>
              Why we give out hearts
            </Button>
          </Link>
        </Stack>

        {/* What section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            flexWrap: 'wrap',
            gap: 1,
          }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              What
            </Typography>
            <PrivacyToggle
              field="what"
              isPrivate={whatPrivate}
              onToggle={togglePrivacySetting}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            What you&apos;ve completed for nonprofits
          </Typography>

          <Box sx={{
            px: { xs: 0, sm: 2 },
          }}>
            <RatingItem
              label="Productionalized Projects"
              description="The number of projects that have been operationalized."
              value={history.what.productionalized_projects}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Requirements Gathering"
              description="The number of projects where you gathered requirements."
              value={history.what.requirements_gathering}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Documentation"
              description="The number of projects where you wrote awesome documentation for developers and nonprofits."
              value={history.what.documentation}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Design Architecture"
              description="UML-like diagrams like: sequence, deployment, ERD, etc."
              value={history.what.design_architecture}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Code Quality"
              value={history.what.code_quality}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Unit Test Writing"
              value={history.what.unit_test_writing}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Unit Test Coverage"
              value={history.what.unit_test_coverage}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label={<>Observability</>}
              description={<>You added monitoring capabilities to your software{" "}
                <a
                  href="https://orangematter.solarwinds.com/2017/10/05/monitoring-and-observability-with-use-and-red/"
                  rel="noreferrer"
                  target="_blank"
                >
                  like USE and RED.
                </a>
              </>}
              value={history.what.observability}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Judge"
              description="You judged other people's work."
              value={history.what.judge}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Mentor"
              description="You mentored other people."
              value={history.what.mentor}
              maxHearts={MAX_HEARTS}
            />
          </Box>
        </Box>

        {/* How section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            flexWrap: 'wrap',
            gap: 1,
          }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              How
            </Typography>
            <PrivacyToggle
              field="how"
              isPrivate={howPrivate}
              onToggle={togglePrivacySetting}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            How you went about it
          </Typography>

          <Box sx={{
            px: { xs: 0, sm: 2 },
          }}>
            <RatingItem
              label="Standups Completed"
              description="You provided updates on your work and communicated to your team."
              value={history.how.standups_completed}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Code Reliability"
              description="The code you write doesn't crash and is available for people to use."
              value={history.how.code_reliability}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label={<>
                <a
                  href="https://www.linkedin.com/pulse/cdi-customer-driven-innovation-fredrik-haren/"
                  rel="noreferrer"
                  style={{ color: "inherit" }}
                  target="_blank"
                >
                  Customer Driven Innovation (CDI)
                </a>{" "}
                and{" "}
                <a
                  href="https://designthinking.ideo.com/"
                  rel="noreferrer"
                  style={{ color: "inherit" }}
                  target="_blank"
                >
                  Design Thinking
                </a>
              </>}
              description="You have consistent conversations with your customer to get feedback on what you're building."
              value={history.how.customer_driven_innovation_and_design_thinking}
              maxHearts={MAX_HEARTS}
            />
            <RatingItem
              label="Iterations of code pushed to production"
              description="You iterated on the final product."
              value={history.how.iterations_of_code_pushed_to_production}
              maxHearts={MAX_HEARTS}
            />
          </Box>
        </Box>
      </Box>
    );
};
