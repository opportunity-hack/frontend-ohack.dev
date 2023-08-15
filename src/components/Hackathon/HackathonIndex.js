import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../styles/nonprofit/styles';
import HackathonList from '../../components/HackathonList/HackathonList';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


export default function HackathonIndex()
{
    const style = { fontSize: '15px' };

    return(
        <LayoutContainer key="hackathons" container>    
            <TitleContainer container>  
                <Typography variant="h3" component="h1">
                Hackathons
                </Typography>
                
                <Typography variant="body1" style={style} paragraph>
                Opportunity Hack's longstanding tradition is hosting hackathons, uniting the community to devise solutions for nonprofits. 
                We not only create solutions but ensure their sustained implementation with our developer platform on ohack.dev.                             
                </Typography>
                <Typography variant="body1" style={style} paragraph>
                With over 20 events since 2013, we continuously innovate for an enhanced hackathon experience. Join us!
                </Typography>                 
            </TitleContainer>   

            <ProjectsContainer style={{marginTop: 20, width: '100%'}} >
                <HackathonList />
            </ProjectsContainer> 
        </LayoutContainer>
    );
}