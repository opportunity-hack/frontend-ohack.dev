import React from 'react';
import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../../styles/nonprofit/styles';
import Head from 'next/head';
import Image from 'next/image';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import LoginOrRegister from '../../LoginOrRegister/LoginOrRegister';
import Button from '@mui/material/Button';
import * as ga from "../../../lib/ga";
import ReactPixel from 'react-facebook-pixel';
import { InstagramEmbed } from 'react-social-media-embed';
import TaskIcon from '@mui/icons-material/Task';

const style = { fontSize: '15px' };

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
    ga.event({
      action: "click",
      params: {
        event_category: "button",
        event_label: buttonName,
      },
    });
    ReactPixel.trackCustom(buttonName + ' Click', {});   
}
 

const Hearts = () => (
    <LayoutContainer key="mentorship" container>
      
<Head>
    <title>Opportunity Hack: Project Completion and Definition of Done</title>    
</Head>
      
        <TitleContainer container>  
            <Typography variant="h3" component="h1">
            Project Completion and Definition of Done
            </Typography>
                    
            <Grid container spacing={1}>            
                <Grid item xs={12} sm={6} md={8}>
                    <Typography variant="body1" style={style} paragraph>
                    In software engineering, the definition of done is a checklist of things that need to be completed before a project can be considered finished. This page is a checklist of things that need to be completed before a project can be considered finished for Opportunity Hack.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button variant="contained" color="primary" href="https://www.instagram.com/p/CVicxFMPiqo/" target="_blank">
                                Example statement of work prize
                            </Button>
                        </Grid>
                        
                    </Grid>
                    
                
                    <Grid container direction="column" alignItems="center" spacing={1} style={{ marginTop: '10px' }}>
                        <Grid item>                            
                                <Image 
                                    src="https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp"
                                    width={971/2}
                                    height={971/2}
                                    alt="A happy dog completing an Opportunity Hack project for social good"
                                />                                                                                
                        </Grid>
                        <Grid item>
                            <Typography variant="caption" align="center">
                                A happy dog completing an Opportunity Hack project for social good
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>                
                    <InstagramEmbed url="https://www.instagram.com/p/CoBFS8hvcnB/" maxWidth={328} height={500} />
                </Grid>
                                          

                
            </Grid>
            
        </TitleContainer>
    

        
        <ProjectsContainer style={{marginTop: 10}} >
        <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>Our Definition of Done</Typography>
        
        <Grid container spacing={1}>        
            <Grid item xs={12} sm={6}>
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            <TaskIcon/> Deployed
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Deployment of code so it can be used by others (not on your laptop but to AWS, fly.io, Google Cloud, etc)
                        </Typography>                                                
                    </CardContent>
                </Card>
                
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            <TaskIcon/> Login details for testing
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Any login details for the deployed application so it can be tested
                        </Typography>                        
                    </CardContent>
                </Card>

                 <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            <TaskIcon/> Code Updated
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            All code updated in GitHub for your hackathon repository
                        </Typography>                        
                    </CardContent>
                </Card>         
            </Grid>
            
            <Grid item xs={12} sm={6}>
                  

                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            <TaskIcon/> Tasks Closed
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            All GitHub tasks closed if you are using them
                        </Typography>                        
                    </CardContent>
                </Card>
                    
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            <TaskIcon/> Environment Variables and Sensitive Info should not be in GitHub
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Any environment variables or configuration that is sensitive should go into a Google doc and shared here in this channel so it's not in your public GitHub repo
                        </Typography>                        
                    </CardContent>
                </Card>            

                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            <TaskIcon/> Documentation
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Documentation either video or written that explains how to use your application
                        </Typography>                        
                    </CardContent>
                </Card>
            </Grid>

              
        </Grid>


        <Grid item xs={12} sm={6} md={4}>                
                    <InstagramEmbed url="https://www.instagram.com/p/CVicxFMPiqo/" maxWidth={328} height={500} />
                </Grid>    

      
        <LoginOrRegister introText="Ready to join us?" previousPage={"/about/completion"} />

        </ProjectsContainer>
      </LayoutContainer>
    );

    export default Hearts;
