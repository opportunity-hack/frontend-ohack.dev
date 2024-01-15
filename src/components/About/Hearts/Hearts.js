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
    <title>Opportunity Hack - Hearts System</title>
    <meta name="description" content="Join Opportunity Hack and earn hearts by contributing to open source projects for nonprofits around the world." />
    <meta name="keywords" content="Opportunity Hack, Hackathon, Hearts System, Nonprofits, Software Engineers, Product Managers, UX Designers, Project Managers" />
    <meta property="og:title" content="Opportunity Hack - Hearts System" />
    <meta property="og:description" content="Join Opportunity Hack and earn hearts by contributing to open source projects for nonprofits around the world. The Hearts System recognizes and rewards your contributions, allowing you to make a positive impact on the lives of others." />
    <meta property="og:image" content="https://i.imgur.com/pzcF1aj.jpg" />
    <meta property="og:url" content="https://hearts.ohack.dev" />
</Head>
      
        <TitleContainer container>  
            <Typography variant="h3" component="h1">
            Opportunity Hack Hearts System
            </Typography>
                    
            <Grid container spacing={1}>            
                <Grid item xs={12} sm={6} md={8}>
                    <Typography variant="body1" style={style} paragraph>
                    Welcome to the Opportunity Hack Hearts System! By contributing to open source projects for nonprofits, you can earn hearts and make a positive impact on the world. Whether you are a Software Engineer, Product Manager, UX Designer, or Project Manager, your skills are valuable in creating solutions that help nonprofits achieve their goals.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button variant="contained" color="primary" href="https://docs.google.com/document/d/1J-1o5YOpdt4slyd_PxitNN0gZe7UcI1GjyTbhTem2qU/edit?usp=sharing" target="_blank">
                                See the Original RFC
                            </Button>
                        </Grid>

                        <Grid item>
                            <Button variant="outlined" color="primary" href="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8" target="_blank">
                                GitHub Issue #8
                            </Button>
                        </Grid>

                        <Grid item>
                            <Button variant="outlined" color="primary" href="https://github.com/opportunity-hack/frontend-ohack.dev/issues/7" target="_blank">
                                GitHub Issue #7
                            </Button>
                        </Grid>
                    </Grid>
                    
                
                    <Grid container direction="column" alignItems="center" spacing={1} style={{ marginTop: '10px' }}>
                        <Grid item>                            
                                <Image 
                                    src="https://cdn.ohack.dev/8d2a68667a6911ee9e03e2f442f28a46.png"
                                    width={971/2}
                                    height={971/2}
                                    alt="Opportunity Hack Hearts Certificate Example"
                                />                                                                                
                        </Grid>
                        <Grid item>
                            <Typography variant="caption" align="center">
                                Example Hearts Certificate
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>                
                    <InstagramEmbed url="https://www.instagram.com/p/CoupvGxuiLX/" maxWidth={328} height={500} />
                </Grid>                                
            </Grid>
            
        </TitleContainer>
        

        
        <ProjectsContainer style={{marginTop: 10}} >
            <Typography variant="h4" component="h1">
                Earn Hearts and Make a Difference
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                Are you passionate about making a tangible, meaningful difference in the world through open source projects? The Opportunity Hack Hearts System offers you the chance to earn hearts by contributing to projects for nonprofits. Your skills and expertise can transform ideas into impactful solutions that benefit communities worldwide.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                As a contributor, you play a vital role in the hearts system. Your contributions help nonprofits address real-world challenges and create sustainable solutions. By earning hearts, you not only showcase your skills but also make a lasting impact on the lives of others. Join us and be part of a community that uses technology to drive positive change.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                The Opportunity Hack Hearts System goes beyond coding. It's about collaboration, learning, and growth. As you contribute to projects, you'll have the opportunity to connect with like-minded individuals, expand your network, and gain valuable experience in working on real-world projects.
            </Typography>
            <Typography variant="h4" gutterBottom>
                How the Hearts System Works
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                The hearts system is designed to recognize and reward your contributions. Here's how it works:
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                1. Choose a project: Browse through the available open source projects for nonprofits and select one that aligns with your interests and skills.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                2. Contribute: Dive into the project and start contributing. Whether it's writing code, designing user interfaces, or managing project tasks, your contributions are valuable.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                3. Earn hearts: As you make contributions, you'll earn hearts. The more impactful your contributions, the more hearts you'll earn.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                4. Level up: As you accumulate hearts, you'll level up in the hearts system. Higher levels unlock additional benefits and recognition within the Opportunity Hack community.
            </Typography>
            <Typography variant="h4" gutterBottom>
                Types of Contributions
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                The hearts system recognizes various types of contributions. Here are some examples:
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                - Code contributions: Writing and improving code to enhance the functionality and performance of the project.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                - Design contributions: Creating visually appealing and user-friendly interfaces for the project.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                - Documentation contributions: Writing clear and comprehensive documentation to help others understand and use the project.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                - Project management contributions: Organizing and coordinating project tasks, ensuring smooth progress and timely delivery.
            </Typography>
            <Typography variant="body1" paragraph style={style}>
                - Testing and bug fixing contributions: Identifying and fixing bugs, ensuring the project functions correctly.
            </Typography>
            <Button variant="contained" color="primary" href="https://docs.google.com/document/d/1J-1o5YOpdt4slyd_PxitNN0gZe7UcI1GjyTbhTem2qU/edit?usp=sharing" target="_blank">
                See the Original RFC for more details
            </Button>

        
        
        <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>Reward Structure</Typography>
        
        <Grid container spacing={1}>        
            <Grid item xs={12} sm={6}>
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            Reward: 0.5 heart
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Partially met goal
                        </Typography>
                        <Typography variant="body1" paragraph style={style}>
                            <strong>What</strong>
                            <ul>                 
                                <li>Productionalized projects: Code complete, but not pushed to production</li>               
                                <li>Requirements Gathering: Requirements not fully collected</li>
                                <li>Documentation: Documentation not fully completed</li>
                                <li>Design architecture: Partial architecture less than 50% of overall system</li>
                                <li>Code quality: Code has P0-level lint warnings, errors or security bugs, has outstanding PR comments and outstanding PRs to be merged</li>
                                <li>Unit tests written: Some unit tests improved</li>
                                <li>Unit test coverage: Unit test coverage less than 50%</li>
                                <li>Observability: Less than 50% of the system is instrumented for monitoring with decent logging</li>
                            </ul>
                            <strong>How</strong>
                            <ul>
                                <li>Standups completed: for a single project, attended at least 1 standup with the team</li>
                                <li>Code reliability: for a single project, developed code that is not consistently reliable - has errors, takes more than 10 seconds to load, has obvious bugs</li>
                                <li>Customer Driven Innovation (CDI) and Design Thinking: for a single project, spoke to customer at least one time to gather more information on their problem</li>
                                <li>Iterations of code pushed to production: single project, pushed code to production at least one time</li>
                            </ul>
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            Reward: 1 heart
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Met goal
                        </Typography>
                        <Typography variant="body1" paragraph style={style}>
                            <strong>What</strong>
                            <ul>
                                <li>Criteria from above, but more than 90% completion</li>
                            </ul>
                            <strong>How</strong>
                            <ul>
                                <li>Standups completed: for a single project, at least 3 standups</li>
                                <li>Code reliability: for a single project, code works without errors, can consistently be pushed to production, nothing takes more than 10 seconds to load, no obvious bugs</li>
                                <li>Customer Driven Innovation (CDI) and Design Thinking: for a single project, worked with customer more than 3 times and gathered significant documentation on how to build the solution</li>
                                <li>Iterations of code pushed to production: single project, pushed code to production at least 3 times</li>
                            </ul>
                            <ul>
                                <li><strong>Why 3?</strong>: If 1 time is a point, and 2 points is a line, 3 points shows a trend - we want consistency</li>
                            </ul>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            Reward: 1.5 hearts
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Exceeded goal
                        </Typography>
                        <Typography variant="body1" paragraph style={style}>
                            <strong>What</strong>
                            <ul>
                                <li>More than 100% completion (more things completed than expected) and work done 25% faster than expected</li>
                            </ul>
                            <strong>How</strong>
                            <ul>
                                <li>Standups completed: 8 standups</li>
                                <li>Code reliability: No outstanding issues, obvious signs of reliability like fault tolerance, retries, exception handling, caching for performance, etc. over 1 week of usage</li>
                                <li>Customer Driven Innovation (CDI) and Design Thinking: 8 times</li>
                                <li>Iterations of code pushed to production: 8 times</li>
                            </ul>
                        </Typography>
                    </CardContent>
                </Card>            

                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            Reward: 2 hearts
                        </Typography>
                        <Typography variant="h6" component="h4" gutterBottom>
                            Greatly exceeded goal
                        </Typography>
                        <Typography variant="body1" paragraph style={style}>
                            <strong>What</strong>
                            <ul>
                                <li>More than 100% completion (more things completed than expected) and work done 50% faster than expected</li>
                            </ul>
                            <strong>How</strong>
                            <ul>
                                <li>Standups completed: &gt; 15 standups</li>
                                <li>Code reliability: Includes all previous expectations and has outstanding reliability over 2 weeks of usage</li>
                                <li>Customer Driven Innovation (CDI) and Design Thinking: &gt; 15 times</li>
                                <li>Iterations of code pushed to production: &gt; 15 times</li>
                            </ul>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

                
        <Typography variant="body1" paragraph style={style}>
            After reading above, let's look at how many hearts someone is likely to receive working on a single project.
        </Typography>

        <Typography variant="body1" paragraph style={style}>
            <strong>Most likely:</strong> 7 hearts - working on a project likely won’t allow all areas to be completed, but likely 6 areas can be completed with 2 partial completions that would gather 0.5 heart each.
        </Typography>

        <Typography variant="body1" paragraph style={style}>
            <strong>The baseline:</strong> 12 hearts as long as all categories are fulfilled
        </Typography>

        <Typography variant="body1" paragraph style={style}>
            <strong>The most someone could obtain for a single project:</strong> 2*12 = 24 hearts
        </Typography>

        <Typography variant="body1" paragraph style={style}>
            <strong>The least:</strong> 0 - each person on the team must show some aspect of What and How. If someone on the team doesn’t provide any impact for What and How, they would obtain 0 hearts.
        </Typography>

        <Typography variant="body1" paragraph style={style}>
            Remember, every contribution counts. Together, we can create a better world through technology and the power of hearts. Sign up now and be part of the Opportunity Hack community.
        </Typography>

        <LoginOrRegister introText="Ready to join us?" previousPage={"/about/hearts"} />

        </ProjectsContainer>
      </LayoutContainer>
    );

    export default Hearts;
