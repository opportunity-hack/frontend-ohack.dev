import React from 'react';
import { ProjectsContainer, LinkStyled} from './styles';
import Image from 'next/image';
import { Typography, Grid, Card, CardContent } from '@mui/material';

import Link from 'next/link';
 
const CertInfoIndex = ( { 
    certInfo
}) => {
    const style = { fontSize: '15px' };

    return (                                
             
            <Grid item xs={5} sm={4} md={4} spacing={0.5}>
                { certInfo && certInfo.stats && <Card>
                    <CardContent>
                    { certInfo && certInfo.certificate_url && <Link href={`https://ohack.dev/cert/${certInfo.file_id}`} passHref><Image 
                        src={certInfo.certificate_url}
                        width={1024/4}
                        height={1024/4}
                        alt="Your certificate"
                    />            
                    </Link>
                    }      

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
                }
            </Grid>                                
        
    );

};

export default CertInfoIndex;
    
    