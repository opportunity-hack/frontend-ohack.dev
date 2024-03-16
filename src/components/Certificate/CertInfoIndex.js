import React, { useEffect } from 'react';
import { TitleContainer, LayoutContainer, ProjectsContainer, LinkStyled} from './styles';
import Head from 'next/head';
import Image from 'next/image';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
 

const CertInfoIndex = () => {
    const router = useRouter()
    const { cert_id } = router.query
    const style = { fontSize: '15px' };


    const [certInfo, setCertInfo] = useState({});

    // certInfo will have 
    /*
    {
        "author_email": "123714233+aitzeng@users.noreply.github.com",
        "author_name": "Anthony Tzeng",
        "certificate_url": "https://cdn.ohack.dev//certificates/certificate_4186886b2aca11a005b826c8e878e904e1e8224857771c21c12e05d83bbbe9e5.png",
        "date": "2024-02-12T09:38:19.851425-07:00",
        "file_id": "4186886b2aca11a005b826c8e878e904e1e8224857771c21c12e05d83bbbe9e5",
        "file_id_hash": "Anthony Tzenghttps://github.com/2023-opportunity-hack/CodeFusion-Collective--MobileAppforTeens-RebuildaprototypewithSecurityandUsability851",
        "repository_url": "https://github.com/2023-opportunity-hack/CodeFusion-Collective--MobileAppforTeens-RebuildaprototypewithSecurityandUsability",
        "stats": {
            "commits": 8,
            "files": 1,
            "hours": 2,
            "lines_of_code": 5
        },
        "totals": {
            "commits": 193,
            "files": 176,
            "hours": 42.6,
            "lines_of_code": 82750
        }
        }
        */

    // Use useEffect to make call to backend /api/certificates/:cert_id to get certificate info
    useEffect(() => {
        // Make call to backend to get certificate info
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/${cert_id}`)        
        .then(response => response.json())
        .then(data => setCertInfo(data));     
    }
    , [cert_id]);

        

    return (
    <LayoutContainer key="certificate" container>
      
        <TitleContainer container padding={0} margin={0} style={{margin: '0px', padding:'1em'}}>  
            <Typography variant="h3" component="h1">
            Opportunity Hack Certificate
            </Typography>
                    
            <Grid container spacing={0} margin={0}>        
                <Grid item xs={12} sm={12} md={12} padding={0} margin={0}>
                    <Typography style={style} marginTop={1}>
                        Congratulations <b>{certInfo.author_name}</b>! You've earned a certificate for your contributions. 
                        <br/>
                        Your dedication and hard work have made a meaningful impact on the project and the community. We appreciate your commitment to creating positive change through technology.
                    </Typography>                                                        
                </Grid>                   
            </Grid>            
        </TitleContainer>
                
        <ProjectsContainer container style={{ marginTop: '2em'}}>                    
            <Grid item xs={12} sm={6} md={6} style={{margin: '0.5em'}}>                            
                    { certInfo && certInfo.certificate_url && <Link href={certInfo.certificate_url}><Image 
                        src={certInfo.certificate_url}
                        width={1024/3}
                        height={1024/3}
                        alt="Your certificate"
                    />            
                    </Link>
                    }                                                                    
            </Grid>  
            
            { certInfo && certInfo.stats && 
            <Grid item xs={12} sm={6} md={6}>
                <Card style={{ border: '1px solid lightblue', marginBottom: '10px' }}>
                    <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom>
                            GitHub Repository: <LinkStyled href={certInfo.repository_url}>{certInfo.repository_url}</LinkStyled>
                        </Typography>                        
                        <Typography variant="body1" paragraph style={style}>                                                    
                        <b>Certificate created:</b> { certInfo.date }
                        </Typography>
                        <Typography variant="body1" paragraph style={style}>                            
                            <strong>{ certInfo.author_name }'s Contributions</strong>
                            <ul>                 
                                <li>Hours: { certInfo.stats.hours }</li>
                                <li>Commits: { certInfo.stats.commits }</li>                                               
                                <li>Lines of Code: { certInfo.stats.lines_of_code }</li>   
                                <li>Files: { certInfo.stats.files }</li>                                                                                             
                            </ul>
                            <strong>Team Totals</strong>
                            <ul>
                                <li>Hours: { certInfo.totals.hours }</li>
                                <li>Commits: { certInfo.totals.commits }</li>                                
                                <li>Lines of Code: { certInfo.totals.lines_of_code }</li>                                
                                <li>Files: { certInfo.totals.files }</li>                                
                            </ul>
                        </Typography>
                    </CardContent>
                </Card>                
            </Grid>                                
        }          
        
        <Grid item xs={12} sm={12} md={12} style={{margin: '0.5em'}}>
            <LoginOrRegister introText="Ready to join us?" previousPage={"/about/hearts"} />
        </Grid>
        </ProjectsContainer>
      </LayoutContainer> 
    

    );

};

export default CertInfoIndex;
    
    