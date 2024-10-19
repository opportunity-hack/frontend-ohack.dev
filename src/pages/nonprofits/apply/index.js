import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Typography, TextField, Button, FormControlLabel, Checkbox, 
  Container, Box, Grid, Paper, List, ListItem, ListItemIcon, 
  ListItemText, CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Parallax } from "react-parallax";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import CloudIcon from '@mui/icons-material/Cloud';
import BuildIcon from '@mui/icons-material/Build';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useTheme } from '@mui/material/styles';
import ReactRecaptcha3 from 'react-google-recaptcha3';
import { initFacebookPixel, trackEvent, set } from '../../../lib/ga';

const InfoCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

const InfoCardContent = styled(CardContent)(({ theme }) => ({
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

export default function Apply({ title, description, openGraphData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    idea: '',
    isNonProfit: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    initFacebookPixel();
    ReactRecaptcha3.init(process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY);
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'isNonProfit' ? checked : value }));
    trackEvent({
      action: "npo_form_field_change",
      params: { field_name: name, field_value: name === 'isNonProfit' ? checked : value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = await ReactRecaptcha3.getToken();
      const formDataWithToken = { ...formData, token };
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/submit-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataWithToken),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      console.log(result);

      trackEvent({
        action: "npo_form_submit",
        params: { form_data: formDataWithToken }
      });

      if (formData.email) set(formData.email);

      setFormData({
        name: '',
        email: '',
        organization: '',
        idea: '',
        isNonProfit: false,
      });

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {openGraphData.map((og) => (
          <meta key={og.key} name={og.name} property={og.property} content={og.content} />
        ))}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Nonprofit and Social Good Project Application - Opportunity Hack",
              "description": "Submit your nonprofit project or social good idea for free software development support. Opportunity Hack connects innovators with skilled volunteers to create tech solutions for social impact.",
              "url": "https://ohack.dev/nonprofits/apply",
              "potentialAction": {
                "@type": "ApplyAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://ohack.dev/nonprofits/apply",
                  "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                  ]
                },
                "result": {
                  "@type": "CreativeWork",
                  "name": "Nonprofit Project Application"
                }
              }
            }
          `}
        </script>
      </Head>

      <Container maxWidth="md">
        <Box my={4}>
          <Parallax
            bgImage="https://cdn.ohack.dev/nonprofit_images/OHack_NonProfit_Application.webp"
            strength={300}
            style={{ height: '300px' }}
          >
            <Box sx={{
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }}>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontWeight: 'bold',
                  padding: '0 20px',
                }}
              >
                Opportunity Hack
              </Typography>
              <Typography 
                variant="h2" 
                component="h2" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  padding: '0 20px',
                }}
              >
                Submit Your Nonprofit Project Anytime
              </Typography>
              <Typography 
                variant="h3" 
                component="h3" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  padding: '0 20px',
                }}
              >
                We'll Respond Within a Week!
              </Typography>
            </Box>
          </Parallax>
        </Box>

        <Box my={4}>
          <Typography variant="h3" component="h2" gutterBottom>
            Why Apply to Opportunity Hack?
          </Typography>
          <List>
            {[
              'Free initial software development for your nonprofit or social good project',
              'Connect with skilled tech volunteers passionate about social impact',
              'Transform your ideas into real-world solutions',
              'Boost your organization\'s efficiency and reach',
              'No technical expertise required - we\'ll guide you through the process',
              '50% profit sharing for successful solutions'
            ].map((text, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={text} 
                  primaryTypographyProps={{ fontSize: '1.25rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box my={4}>
          <Typography variant="h4" component="h3" gutterBottom>
            Important Information for Applicants
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <InfoCard sx={{ height: '100%' }}>
          <InfoCardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <CodeIcon fontSize="large" />
              <Typography variant="h5" component="h4" ml={1}>
                Open-Source Solution
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '1.25rem' }}>
              All code developed is open-sourced under the MIT license, allowing free use, modification, and distribution.
            </Typography>
          </InfoCardContent>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <InfoCard sx={{ height: '100%' }}>
          <InfoCardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <CloudIcon fontSize="large" />
              <Typography variant="h5" component="h4" ml={1}>
                Hosting Costs
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
              We cover initial hosting costs up to $15/month and up to $250 to cover one-time costs. You may need to cover additional expenses as your project grows.
            </Typography>
          </InfoCardContent>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <InfoCard sx={{ height: '100%' }}>
          <InfoCardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <BuildIcon fontSize="large" />
              <Typography variant="h5" component="h4" ml={1}>
                Ongoing Support
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
              Quarterly check-ins for maintenance and updates. We'll try to find volunteers for urgent needs through our network.
            </Typography>
          </InfoCardContent>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <InfoCard sx={{ height: '100%' }}>
          <InfoCardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <MonetizationOnIcon fontSize="large" />
              <Typography variant="h5" component="h4" ml={1}>
                Profit Sharing
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
              50% of any profit generated from your solution will be shared with your nonprofit organization.
            </Typography>
          </InfoCardContent>
              </InfoCard>
            </Grid>
          </Grid>
        </Box>

        <Paper elevation={3} sx={{ p: isMobile ? 3 : 4, my: 4 }}>
          <Typography variant="h4" component="h3" gutterBottom>
            Submit Your Project for Opportunity Hack
          </Typography>
          {submitSuccess ? (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              Your application has been submitted successfully! We'll be in touch within a week.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Organization (if applicable)"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Idea or Problem to Solve"
                    name="idea"
                    multiline
                    rows={4}
                    value={formData.idea}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isNonProfit}
                        onChange={handleChange}
                        name="isNonProfit"
                        disabled={isSubmitting}
                      />
                    }
                    label="I represent a nonprofit organization - it's okay if you don't! We want to help all social good projects."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit" 
                    fullWidth 
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : null}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Your Project Idea'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>

        <Box my={4} mb={5}>
          <Typography variant="body1" align="center" sx={{ fontSize: '1.75rem' }}>
            From small local charities to global initiatives, we're here to help bring your vision to life through technology. Submit your project idea anytime, and we'll get back to you within a week to discuss how we can help.
          </Typography>
        </Box>

        <Box mb={4} mt={4}>
          <Typography variant="h3" component="h4" gutterBottom align="center">
            Learn More About Opportunity Hack
          </Typography>
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src="https://www.youtube.com/embed/Ia_xsX-318E"
              title="Opportunity Hack: Connecting Nonprofits with Tech Solutions"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
}


export async function getStaticProps() {
  return {
    props: {
      title: "Apply for Opportunity Hack - Free Tech Solutions for Nonprofits",
      description: "Submit your nonprofit project for Opportunity Hack anytime. Get free software development support, connect with skilled tech volunteers, and benefit from 50% profit sharing on successful solutions.",
      openGraphData: [
        {
          name: "og:title",
          property: "og:title",
          content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits",
          key: "ogtitle"
        },
        {
          name: "og:description",
          property: "og:description",
          content: "Submit your nonprofit project for Opportunity Hack! Get free software development, connect with skilled volunteers, and enjoy 50% profit sharing on successful solutions.",
          key: "ogdescription"
        },
        {
          name: "title",
          property: "title",
          content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits",
          key: "title"
        },
        {
          name: "author",
          property: "author",
          content: "Opportunity Hack",
          key: "author"
        },
        {
          name: "image",
          property: "og:image",
          content: "https://ohack.dev/OHack_NonProfit_Application.png",
          key: "ognameimage"
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          name: "url",
          property: "url",
          content: "https://ohack.dev/nonprofits/apply",
          key: "url"
        },
        {
          name: "org:url",
          property: "org:url",
          content: "https://ohack.dev/nonprofits/apply",
          key: "ogurl"
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard"
        },
        {
          name: "twitter:site",
          property: "twitter:site",
          content: "@opportunityhack",
          key: "twittersite"
        },
        {
          name: "twitter:title",
          property: "twitter:title",
          content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits",
          key: "twittertitle"
        },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: "Submit your nonprofit project anytime! Get free software development, connect with skilled volunteers, and enjoy 50% profit sharing on successful solutions.",
          key: "twitterdesc"
        },
        {
          name: "twitter:image",
          property: "twitter:image",
          content: "https://ohack.dev/OHack_NonProfit_Application.png",
          key: "twitterimage"
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",                    
          content: "Opportunity Hack logo for nonprofit applications",
          key: "twitterimagealt"
        },
        {
          name: "twitter:creator",
          property: "twitter:creator",
          content: "@opportunityhack",
          key: "twittercreator"
        }
      ]
    },
  };
}