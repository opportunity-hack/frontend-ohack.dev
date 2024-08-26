import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Typography, TextField, Button, FormControlLabel, Checkbox, Container, Box, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Parallax } from "react-parallax";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReactRecaptcha3 from 'react-google-recaptcha3';
import { initFacebookPixel, trackEvent, set } from '../../../lib/ga';

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


  useEffect(() => {
    initFacebookPixel();

    // Initialize Google reCAPTCHA v3
    ReactRecaptcha3.init(process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY).then(
      (status) => {
        console.log(status);
      }
    );
    
  }, []);


  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'isNonProfit' ? checked : value }));
    
    trackEvent({
        action: "npo_form_field_change",
        params: {
            field_name: name,
            field_value: name === 'isNonProfit' ? checked : value
        }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get reCAPTCHA token
      const token = await ReactRecaptcha3.getToken();
      
      // Add token to form data
      const formDataWithToken = { ...formData, token };
    

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/submit-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithToken),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
        console.log(result);
      

      // Here you would typically send the form data to your server
      // console.log(formDataWithToken);

      // Track form submission with ReactPixel and GA      
      trackEvent({
        action: "npo_form_submit",
        params: {
            form_data: formDataWithToken
        }
      });

      // if formData has email then call set function
      if (formData.email) {
        set(formData.email);
      }


      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        organization: '',
        idea: '',
        isNonProfit: false,
      });

     alert('Form submitted successfully!');


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
                <div style={{
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
                    Opportunity Hack 2024
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
                    October 12-13, 2024 • ASU, Tempe, Arizona
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
                    Submit Your Nonprofit Project Today!
                </Typography>
                </div>
            </Parallax>
        </Box>

        <Box my={4}>
          <Typography variant="h3" component="h3" gutterBottom>
            Why Apply to Opportunity Hack?
          </Typography>
          <List>
            {[
              'Free software development for your nonprofit or social good project',
              'Connect with skilled tech volunteers passionate about social impact',
              'Transform your ideas into real-world solutions',
              'Boost your organization\'s efficiency and reach',
              'No technical expertise required - we\'ll guide you through the process'
            ].map((text, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Paper elevation={3} sx={{ p: isMobile ? 3 : 4 }}>
          <Typography variant="h4" component="h4" gutterBottom>
            Submit Your Project for Opportunity Hack 2024
          </Typography>
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
        </Paper>

        <Box my={4}>
          <Typography variant="body1" align="center" sx={{ fontSize: '1.25rem' }}>
            Join us on October 12-13, 2024 at Arizona State University in Tempe for an incredible weekend of innovation and impact. From small local charities to global initiatives, we're here to help bring your vision to life through technology.
          </Typography>
        </Box>      
        

        <Box mb={4}>
          <Typography variant="h5" component="h5" gutterBottom align="center" sx={{ fontSize: '1.5rem' }}>
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

export const getStaticProps = async () => {
    //const data = await fetch('/api/metadata');
    //const metadata = await data.json(); 
    return {
        props: {
            title: "Apply for Opportunity Hack 2024 - Free Tech Solutions for Nonprofits",
            description: "Submit your nonprofit project for Opportunity Hack 2024, happening October 12-13 at ASU in Tempe, Arizona. Get free software development support and connect with skilled tech volunteers.",
            openGraphData: [
                {
                    name: "og:title",
                    property: "og:title",
                    content: "Apply Now: Opportunity Hack 2024 - October 12-13 at ASU, Tempe",
                    key: "ogtitle"
                },
                {
                    name: "og:description",
                    property: "og:description",
                    content: "Submit your nonprofit project for Opportunity Hack 2024! Join us on October 12-13 at ASU in Tempe, Arizona for a weekend of free software development and innovation.",
                    key: "ogdescription"
                },
                {
                    name: "title",
                    property: "title",
                    content: "NApply Now: Opportunity Hack 2024 - October 12-13 at ASU, Tempe",
                    key: "title"
                },
                {
                    name: "og:title",
                    property: "og:title",
                    content: "Nonprofit Application for Opportunity Hack 2024!",
                    key: "ogtitle"
                },
                {
                    name: "author",
                    property: "author",
                    content: "Opportunity Hack",
                    key: "author"
                },
                {
                    name: "author",
                    property: "author",
                    content: "Opportunity Hack",
                    key: "author"
                },
                {
                    name: "publish_date",
                    property: "og:publish_date",
                    content: "2024-08-01T00:00:00-0700",
                    key: "publishdate"
                },                                        
                {
                    name: "image",
                    property: "og:image",
                    content: "https://ohack.dev/OHack_NonProfit_Application.png",
                    key: "ognameimage"
                },
                {
                    property: "og:image:width",
                    content: "400",
                    key: "ogimagewidth",
                },
                {
                    property: "og:image:height",
                    content: "300",
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
                    content: "Nonprofit Application for Opportunity Hack 2024",
                    key: "twittertitle"
                },
                {
                    name: "twitter:description",
                    property: "twitter:description",
                    content: "Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem.",
                    key: "twitterdesc"
                },
                {
                    name: "twitter:image",
                    property: "twitter:image",
                    content: "https://i.imgur.com/hE3wm7M.png",
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
                },
                {
                    name: "twitter:label1",
                    property: "twitter:label1",
                    value: "Status",
                    key: "twitterlabel1"
                },
                {
                    name: "twitter:data1",
                    property: "twitter:data1",
                    value: "Accepting Applications",
                    key: "twitterdata1"
                },
                {
                    name: "twitter:label2",
                    property: "twitter:label2",
                    value: "Application Deadline",
                    key: "twitterlabel2"
                },
                {
                    name: "twitter:data2",
                    property: "twitter:data2",
                    value: "September 15, 2024",
                    key: "twitterdata2"
                }                
            ]
        },
    };
};