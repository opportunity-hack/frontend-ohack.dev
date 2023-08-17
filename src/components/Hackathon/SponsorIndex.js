import { TitleContainer, LayoutContainer, ProjectsContainer, DetailsContainer} from '../../styles/nonprofit/styles';
import HackathonList from '../HackathonList/HackathonList';
import { Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ProjectsGrid } from '../../styles/nonprofit/styles';



export default function SponsorIndex()
{
    // Get the props for event_id from the URL
    const router = useRouter();
    const { event_id } = router.query;
    const style = { fontSize: '15px' };

    // Define a sponsorship form to collect the sponsor's information and what level of support they are willing to provide
    // The form should be submitted to the backend and the backend should send an email to the sponsor with a link to the payment page
    // The payment page should be a Stripe checkout page that collects the payment and sends a confirmation email to the sponsor
    // Use MUI components for the form and the Stripe checkout page

    const sponsorshipForm = (
        <div>
            <Typography variant="h3" component="h1">
                Sponsorship Form
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Please fill out the form below to sponsor our event.
            </Typography>
            <form>
                <label>
                    Name:
                    <input type="text" name="name" />
                </label>
                <label>
                    Email:
                    <input type="text" name="email" />
                </label>
                <label>
                    Company:
                    <input type="text" name="company" />
                </label>
                <label>
                    Support Level:
                    <select>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                    </select>
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );

    // Print out the levels of sponorship and what each level provides
    const sponsorshipLevels = (
        <div>
            <Typography variant="h3" component="h1">
                Sponsorship Levels
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Bronze: $500
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Silver: $1000
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Gold: $2000
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Platinum: $5000
            </Typography>
        </div>
    );

    // Print out the list of sponsors
    const sponsorList = (
        <div>
            <Typography variant="h3" component="h1">
                Sponsors
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Bronze:
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Silver:
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Gold:
            </Typography>
            <Typography variant="body1" style={style} paragraph>
                Platinum:
            </Typography>
        </div>
    );


    return(
        <LayoutContainer key="hackathons" container>    
            <TitleContainer container>  
               Help sponsor our event! {event_id}          
            </TitleContainer>   
            <Typography variant="body1" style={style} paragraph>
            Sponsoring our event is a great way to get your company's name out there and help the community. There are various support levels available to help you get the most out of your sponsorship.
            </Typography>

            <ProjectsContainer style={{marginTop: 20, width: '100%'}} >
                <ProjectsGrid container direction="column">
                <DetailsContainer>
                {sponsorshipForm}
                </DetailsContainer>
                {sponsorshipLevels}
                {sponsorList}
                </ProjectsGrid>
                

                
            </ProjectsContainer> 
        </LayoutContainer>
    );
}