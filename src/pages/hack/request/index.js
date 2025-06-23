import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Typography,
  Box,
  Container,
  Paper,
  Grid,
  useTheme,
} from "@mui/material";
import HackathonRequestForm from "../../../components/HackathonRequest";
import PeopleIcon from "@mui/icons-material/People";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import * as ga from "../../../lib/ga";

export default function CreateHackathon() {
  const router = useRouter();
  const theme = useTheme();
  
  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/create-hackathon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      ga.event({
        action: "submit",
        category: "CreateHackathon",
        label: "form_submitted",
        value: formData.budget
      });
      
      return true;
    } catch (error) {
      console.error("Error submitting hackathon request:", error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>
          Host Your Own Opportunity Hack | Global Hackathon for Social Good
        </title>
        <meta
          name="description"
          content="Bring the power of Opportunity Hack to your region. Host a transformative hackathon connecting tech talent with nonprofits in your community. Create lasting tech solutions that drive social change and engage your employees or students in meaningful innovation."
        />
        <meta
          name="keywords"
          content="host hackathon, social impact hackathon, corporate social responsibility, university hackathon, tech for good, nonprofit technology, global hackathon, Opportunity Hack, social innovation, community tech event"
        />
      </Head>
      <Container maxWidth="lg">
        <Box mt={8} mb={6}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  mt: 4
                }}
              >
                Host Your Own 
                <br />
                <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                  Opportunity Hack
                </Box>
              </Typography>
              
              <Typography variant="h5" component="h2" gutterBottom>
                Bring the power of tech for good to your organization and community
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                Since 2013, Opportunity Hack has organized transformative hackathons worldwide, 
                connecting tech talent with nonprofits. Our hackathons have resulted in over 
                300 technology solutions that continue to serve communities today.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  mb: 4
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    borderRadius: 2
                  }}
                >
                  <PeopleIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    10,000+ Participants
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: theme.palette.secondary.light,
                    color: theme.palette.secondary.contrastText,
                    borderRadius: 2
                  }}
                >
                  <FavoriteIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    300+ Nonprofit Solutions
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    borderRadius: 2
                  }}
                >
                  <EmojiEventsIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    50+ Global Events
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom sx={{ color: theme.palette.primary.main }}>
                  Why Host an Opportunity Hack?
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <BusinessIcon sx={{ color: theme.palette.success.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    <strong>Drive Real-World Impact</strong> - Create technology solutions that help nonprofits overcome challenges and expand their reach
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <SchoolIcon sx={{ color: theme.palette.success.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    <strong>Boost Employee/Student Engagement</strong> - Provide meaningful opportunities for skill development while giving back
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <PeopleIcon sx={{ color: theme.palette.success.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    <strong>Recruit Top Tech Talent</strong> - Identify and connect with high-performing students and professionals who demonstrate excellence during the hackathon
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: theme.palette.success.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    <strong>Strengthen Community Connections</strong> - Build relationships with local nonprofits and changemakers
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FavoriteIcon sx={{ color: theme.palette.success.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    <strong>Showcase Your Values</strong> - Demonstrate your organization's commitment to social responsibility
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Render the reusable form component */}
        <HackathonRequestForm onSubmit={handleSubmit} />
        
        {/* Organizations that have hosted section */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Join These Organizations Who Have Hosted an Opportunity Hack
          </Typography>
          
          <Typography variant="body1" textAlign="center" paragraph sx={{ mb: 4 }}>
            Since 2013, we've partnered with leading organizations worldwide to create meaningful tech solutions for nonprofits.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <SchoolIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Cal Poly Humboldt
                </Typography>
                <Typography variant="body2">
                  The Computer Science Club at Cal Poly Humboldt University hosted an Opportunity Hack 
                  that engaged students to develop tech solutions for local environmental nonprofits.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <BusinessIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Major Tech Corporations
                </Typography>
                <Typography variant="body2">
                  Leading tech companies have partnered with us to host hackathons that mobilize 
                  their talented workforce to solve pressing challenges for social impact organizations.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <PeopleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Community Organizations
                </Typography>
                <Typography variant="body2">
                  Local tech communities and innovation hubs have successfully hosted Opportunity Hack events,
                  bringing together diverse talents to support nonprofits in their regions.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}