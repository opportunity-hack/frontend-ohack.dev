import React, { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Grid, Card, CardContent, TextField, 
  InputAdornment, Button, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import grantsData from "../../data/opportunity_hack_grants_20250316_211052.json";
import reportData from '../../data/report_data_20250316_212212.json';

const NonprofitGrants = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');

  // Format date from timestamp
  const formatReportDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format currency with commas
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter grants based on search
  const filteredGrants = grantsData.filter(grant => {
    return searchTerm === '' || 
      grant.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.source_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get top nonprofit sectors from the report data
  const topNonprofitSectors = Object.entries(reportData.nonprofit_sectors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sector, count]) => ({ sector, count }));

  return (
    <>
      <Head>
        <title>Free Software Development for Nonprofits (a Grant Alternative) | Opportunity Hack</title>
        <meta name="description" content="Not a cash grant — something better. Opportunity Hack connects 501(c)(3) nonprofits with volunteer developers who build free, custom software. No cost, no strings. Apply to get matched with a team." />
        <meta name="keywords" content="nonprofit grants, free software for nonprofits, nonprofit technology funding, grant alternative, free custom software, nonprofit tech development, Opportunity Hack" />
        <meta property="og:title" content="Free Software Development for Nonprofits (a Grant Alternative) | Opportunity Hack" />
        <meta property="og:description" content="Not a cash grant — something better. Volunteer developers build free custom software for your nonprofit. No cost to your organization." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/nonprofit-grants" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Software Development for Nonprofits (a Grant Alternative) | Opportunity Hack" />
        <meta name="twitter:description" content="Not a cash grant — something better. Volunteer developers build free custom software for your nonprofit. No cost to your organization." />
        <link rel="canonical" href="https://www.ohack.dev/nonprofit-grants" />
      </Head>

      <Navbar />
      
      <Box 
        sx={{
          bgcolor: theme.palette.background.default,
          pt: 8,
          pb: 4
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" align="center" gutterBottom>
            Nonprofit Technology Grants Directory
          </Typography>
          
          <Typography variant="h5" component="h2" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
            Free access to technology grant opportunities for nonprofits - no paywall, no fees
          </Typography>

          {/* Report Summary Stats */}
          {reportData.summary && (
            <Box sx={{ mb: 6 }}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Grants Report Summary
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Last updated: {formatReportDate(reportData.summary.timestamp)}
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Card elevation={0} sx={{ bgcolor: 'primary.light', p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" color="black">Available Grants</Typography>
                        </Box>
                        <Typography variant="h4">{reportData.summary.total_grants}</Typography>
                      </Card>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Card elevation={0} sx={{ bgcolor: 'success.light', p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <MonetizationOnIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" color="black">Average Funding</Typography>
                        </Box>
                        <Typography variant="h4">{formatCurrency(reportData.summary.average_funding)}</Typography>
                      </Card>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Card elevation={0} sx={{ bgcolor: 'info.light', p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <VolunteerActivismIcon color="info" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" color="black">Volunteer Opportunities</Typography>
                        </Box>
                        <Typography variant="h4">{reportData.summary.volunteer_opportunities}</Typography>
                      </Card>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Card elevation={0} sx={{ bgcolor: 'warning.light', p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EventAvailableIcon color="warning" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" color="black">Hackathon Eligible</Typography>
                        </Box>
                        <Typography variant="h4">{reportData.summary.hackathon_eligible}</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Top Nonprofit Sectors Receiving Grants
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {topNonprofitSectors.map(({ sector, count }) => (
                      <Grid size={{ xs: 6, md: 2.4 }} key={sector}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="primary">{count}</Typography>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{sector}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          <Box sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            <Typography paragraph>
              At Opportunity Hack, we believe in empowering nonprofits with the technology resources they need to succeed. 
              This curated list of grants is freely available to all nonprofit organizations looking for funding opportunities.
            </Typography>
            <Typography paragraph>
              Unlike many grant directories that charge subscription fees, we're committed to providing this information at no cost
              to help your organization leverage technology and make a greater impact in the communities you serve.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search grants by keyword, source, or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" component="h3" gutterBottom>
            Showing {filteredGrants.length} of {grantsData.length} grants
          </Typography>

          <Grid container spacing={3}>
            {filteredGrants.map((grant, index) => (
              <Grid size={{ xs: 12 }} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                  }
                }}>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h3">
                      {grant.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mr: 1 }}>
                        {grant.source_name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {grant.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      {grant.funding_amount && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              <strong>Amount:</strong> {grant.funding_amount.amount} {grant.funding_amount.currency}
                              {grant.funding_amount.range_max && ` - ${grant.funding_amount.range_max} ${grant.funding_amount.currency}`}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {grant.deadline && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              <strong>Deadline:</strong> {grant.deadline}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {grant.application_url && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<LinkIcon />}
                            href={grant.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth={isMobile}
                          >
                            Apply Now
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                    
                    {grant.eligibility && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2">
                          <strong>Eligibility:</strong> {grant.eligibility}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredGrants.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No grants found matching your criteria</Typography>
              <Typography variant="body1" color="textSecondary">Try adjusting your search</Typography>
            </Box>
          )}

          <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              How Opportunity Hack Helps Nonprofits
            </Typography>
            <Typography paragraph>
              Beyond this grants directory, Opportunity Hack connects nonprofit organizations with volunteer technologists
              who build software solutions to help you increase your impact. Our hackathons and ongoing projects help nonprofits
              leverage technology to solve their most pressing challenges.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              href="/nonprofits"
            >
              Learn How We Can Help Your Nonprofit
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default NonprofitGrants;