import React from 'react';
import {
  Typography,
  Paper,
  Grid,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import NextLink from 'next/link';
import Link from '@mui/material/Link';

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '15px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const ItemBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const rewardStructure = [
  {
    hearts: 0.5,
    title: 'Partially met goal',
    what: [
      { primary: 'Productionalized projects', secondary: 'Code complete, but not pushed to production' },
      { primary: 'Requirements Gathering', secondary: 'Requirements not fully collected' },
      { primary: 'Documentation', secondary: 'Documentation not fully completed' },
      { primary: 'Design architecture', secondary: 'Partial architecture less than 50% of overall system' },
      { primary: 'Code quality', secondary: 'Code has P0-level lint warnings, errors or security bugs, has outstanding PR comments and outstanding PRs to be merged' },
      { primary: 'Unit tests written', secondary: 'Some unit tests improved' },
      { primary: 'Unit test coverage', secondary: 'Unit test coverage less than 50%' },
      { primary: 'Observability', secondary: 'Less than 50% of the system is instrumented for monitoring with decent logging' },
    ],
    how: [
      { primary: 'Standups completed', secondary: 'For a single project, attended at least 1 standup with the team' },
      { primary: 'Code reliability', secondary: 'For a single project, developed code that is not consistently reliable - has errors, takes more than 10 seconds to load, has obvious bugs' },
      { primary: 'Customer Driven Innovation (CDI) and Design Thinking', secondary: 'For a single project, spoke to customer at least one time to gather more information on their problem' },
      { primary: 'Iterations of code pushed to production', secondary: 'Single project, pushed code to production at least one time' },
    ],
  },
  {
    hearts: 1,
    title: 'Met goal',
    what: [
      { primary: 'All criteria from 0.5 hearts', secondary: 'But more than 90% completion' },
    ],
    how: [
      { primary: 'Standups completed', secondary: 'For a single project, at least 3 standups' },
      { primary: 'Code reliability', secondary: 'For a single project, code works without errors, can consistently be pushed to production, nothing takes more than 10 seconds to load, no obvious bugs' },
      { primary: 'Customer Driven Innovation (CDI) and Design Thinking', secondary: 'For a single project, worked with customer more than 3 times and gathered significant documentation on how to build the solution' },
      { primary: 'Iterations of code pushed to production', secondary: 'Single project, pushed code to production at least 3 times' },
    ],
  },
  {
    hearts: 1.5,
    title: 'Exceeded goal',
    what: [
      { primary: 'More than 100% completion', secondary: 'More things completed than expected and work done 25% faster than expected' },
    ],
    how: [
      { primary: 'Standups completed', secondary: '8 standups' },
      { primary: 'Code reliability', secondary: 'No outstanding issues, obvious signs of reliability like fault tolerance, retries, exception handling, caching for performance, etc. over 1 week of usage' },
      { primary: 'Customer Driven Innovation (CDI) and Design Thinking', secondary: '8 times' },
      { primary: 'Iterations of code pushed to production', secondary: '8 times' },
    ],
  },
  {
    hearts: 2,
    title: 'Greatly exceeded goal',
    what: [
      { primary: 'More than 100% completion', secondary: 'More things completed than expected and work done 50% faster than expected' },
    ],
    how: [
      { primary: 'Standups completed', secondary: '> 15 standups' },
      { primary: 'Code reliability', secondary: 'Includes all previous expectations and has outstanding reliability over 2 weeks of usage' },
      { primary: 'Customer Driven Innovation (CDI) and Design Thinking', secondary: '> 15 times' },
      { primary: 'Iterations of code pushed to production', secondary: '> 15 times' },
    ],
  },
];

const RewardStructure = () => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Detailed Reward Structure
      </Typography>
      <Box mt={1} mb={4}>
      
      <StyledTypography variant="body1" paragraph>
        The detailed heart reward structure serves as a guideline to recognize and incentivize valuable contributions in the things we build to support the world. It's designed to provide clear objectives and motivate continuous improvement. However, it's important to note that these criteria are not rigid rules, but flexible guidelines.
        </StyledTypography>
        <StyledTypography variant="body1" paragraph>
        Opportunity Hack retains discretion in awarding hearts, considering the unique aspects of each contribution. This approach, inspired by insights from decision-making research, allows for nuanced evaluation that accounts for context, creativity, and unexpected positive outcomes. It helps mitigate biases and 'noise' in decision-making while maintaining a fair and motivating system.
        </StyledTypography>
        <StyledTypography variant="body1">
        Remember, the heart system aims to encourage growth, collaboration, and impactful contributions. Focus on the spirit of these guidelines rather than treating them as a checklist. Your unique efforts and their real-world impact are what truly matter.
        </StyledTypography>

        <NextLink href="/about/completion" passHref>
      <Link color="primary" underline="hover">
        <StyledTypography variant="body1" style={{ fontWeight: 'bold', marginTop: '8px' }}>
          Read More About Project Completion →
        </StyledTypography>
      </Link>
    </NextLink>
        </Box>
      <Grid container spacing={3}>
        {rewardStructure.map((reward, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledPaper elevation={3}>
              <Typography variant="h5" gutterBottom>
                {reward.hearts} heart{reward.hearts !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {reward.title}
              </Typography>
              <CategoryTitle variant="subtitle1">What</CategoryTitle>
              {reward.what.map((item, itemIndex) => (
                <ItemBox key={itemIndex}>
                  <StyledTypography variant="body1" color="textSecondary">
                    {item.primary}
                  </StyledTypography>
                  <StyledTypography variant="body1">
                    {item.secondary}
                  </StyledTypography>
                </ItemBox>
              ))}
              <CategoryTitle variant="subtitle1">How</CategoryTitle>
              {reward.how.map((item, itemIndex) => (
                <ItemBox key={itemIndex}>
                  <StyledTypography variant="body1" color="textSecondary">
                    {item.primary}
                  </StyledTypography>
                  <StyledTypography variant="body1">
                    {item.secondary}
                  </StyledTypography>
                </ItemBox>
              ))}
            </StyledPaper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default RewardStructure;