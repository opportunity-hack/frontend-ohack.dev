import React, { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Grid, Card, CardContent, TextField, 
  InputAdornment, Button, Divider, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import grantsData from '../../data/opportunity_hack_grants_20250316_194609.json';

const NonprofitGrants = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechFocus, setSelectedTechFocus] = useState('');

  // Extract unique tech focus areas
  const techFocusAreas = [...new Set(grantsData.flatMap(grant => 
    grant.tech_focus ? grant.tech_focus : []))];

  // Filter grants based on search and tech focus
  const filteredGrants = grantsData.filter(grant => {
    const matchesSearch = searchTerm === '' || 
      grant.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.source_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTechFocus = selectedTechFocus === '' || 
      (grant.tech_focus && grant.tech_focus.includes(selectedTechFocus));
    
    return matchesSearch && matchesTechFocus;
  });

  return (
    <>
      <Head>
        <title>Free Nonprofit Grants | Opportunity Hack</title>
        <meta name="description" content="Discover free grant opportunities for nonprofits. No paywall, no fees - just a curated list of technology funding sources to help your nonprofit organization make a greater impact." />
        <meta name="keywords" content="nonprofit grants, free grants, nonprofit funding, charity grants, NGO grants, technology grants, nonprofit tech, Opportunity Hack" />
        <meta property="og:title" content="Free Nonprofit Grants | Opportunity Hack" />
        <meta property="og:description" content="Discover free technology grant opportunities for nonprofits. No paywall, no fees - just a curated list of funding sources." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/nonprofit-grants" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Nonprofit Grants | Opportunity Hack" />
        <meta name="twitter:description" content="Discover free technology grant opportunities for nonprofits. No paywall, no fees." />
        <link rel="canonical" href="https://ohack.dev/nonprofit-grants" />
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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<FilterListIcon />} 
                  label="All Technologies" 
                  onClick={() => setSelectedTechFocus('')}
                  color={selectedTechFocus === '' ? 'primary' : 'default'}
                />
                {techFocusAreas.slice(0, 10).map((tech) => (
                  <Chip 
                    key={tech}
                    label={tech}
                    onClick={() => setSelectedTechFocus(tech)}
                    color={selectedTechFocus === tech ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h6" component="h3" gutterBottom>
            Showing {filteredGrants.length} of {grantsData.length} grants
          </Typography>

          <Grid container spacing={3}>
            {filteredGrants.map((grant, index) => (
              <Grid item xs={12} key={index}>
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
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {grant.tech_focus && grant.tech_focus.slice(0, 5).map((tech) => (
                        <Chip size="small" label={tech} key={tech} />
                      ))}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      {grant.funding_amount && (
                        <Grid item xs={12} sm={4}>
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
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              <strong>Deadline:</strong> {grant.deadline}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {grant.application_url && (
                        <Grid item xs={12} sm={4}>
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
              <Typography variant="body1" color="textSecondary">Try adjusting your search or filter</Typography>
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