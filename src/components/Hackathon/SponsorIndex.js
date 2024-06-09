import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../styles/sponsors/styles';
import { Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { Grid, Card, Box, CardContent} from '@mui/material';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';


export default function SponsorIndex()
{
    // Get the props for event_id from the URL
    const router = useRouter();
    const { event_id } = router.query;
    const style = { fontSize: '15px' };
    const tableHeaderStyle = { fontSize: '15px', fontWeight: 'bold', backgroundColor: '#f0f0f0'};

    const largeStyle = { fontSize: '20px' };

    // Define a sponsorship form to collect the sponsor's information and what level of support they are willing to provide
    // The form should be submitted to the backend and the backend should send an email to the sponsor with a link to the payment page
    // The payment page should be a Stripe checkout page that collects the payment and sends a confirmation email to the sponsor
    // Use MUI components for the form and the Stripe checkout page

    const sponsors = [
      {
        name: "Meta",
        logo: "https://i.imgur.com/v1qjSIO.png",
        hours: 150,
        donations: 1000,
        website: "https://meta.com"
      },
      {
        name: "Spotify",
        logo: "https://i.imgur.com/r9qB2L4.png",
        hours: 150,
        donations: 0,
        website: "https://spotify.com"
      }
    ]
    
    const getSponsorCard = (sponsor, hourMin, hourMax) => {
      return (
        <Grid container spacing={0.5} mt={1} mb={1}>
                {
                  sponsors.map((sponsor) => {
                    // Make sure sponsor has >= hours
                    var donations = "";

                    if( sponsor.donations > 0 )
                    {
                      donations = <Typography variant="body2" color="text.secondary" style={style}>${sponsor.donations} donated</Typography>
                    }


                    if( sponsor.hours >= hourMin && sponsor.hours < hourMax)
                    {
                      return (
                        <Grid item key={sponsor.name}>
                        <Card sx={{ width: '200px', height: '250px', marginTop: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <CardMedia
                            sx={{ height: 100 }}
                            image={sponsor.logo}
                            title="green iguana"
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                              {sponsor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" style={style}>
                              {sponsor.hours} hours   
                              {donations}                           
                            </Typography>                            
                          </CardContent>
                          <CardActions style={{ marginTop: 'auto' }}>
                            <Button size="small" href={sponsor.website}>Learn More</Button>
                          </CardActions>
                        </Card>
                        </Grid>
                      )
                    }
                    else {
                      // Return an empty card with a link to donate money or time
                      return (
                        <Card sx={{ width: '200px', bgcolor: '#EEEEEE', borderStyle: 'outset'  }} >
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                              No sponsors yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Be the first!
                            </Typography>

                            <CardActions>
                              <Button size="small" variant="outlined" href={`/hack/${event_id}`}>Volunteer</Button>
                              <Button size="small" color="success" variant='outlined' href="https://www.paypal.com/donate?campaign_id=WWL4VPVBUS4SA">Donate</Button>
                            </CardActions>

                            
                          </CardContent>
                        </Card>
                      )
                    }
                  }
                  )
                }
                </Grid>  
      )
    }


    // Print out the levels of sponorship and what each level provides
    // Use MUI Card and CardContent to display the information
    const bronzeColor = '#e7cfae';
    const silverColor = '#f0f0f0';
    const goldColor = '#ffd700';
    const platinumColor = '#b3b3b3';

    const sponsorshipLevels = (
        <Grid item xs={10} sm={10} md={10} key="sponsorLevels">
            <Typography variant="h4" component="h1">
                Levels
            </Typography>

            <Card style={{backgroundColor : bronzeColor, margin:'2px' }}>
              <CardContent>
                <Typography variant="h4" component="h2">
                  Bronze
                </Typography>
                <Typography variant="body1" style={style} component="p">
                  Over $500 in support or over 10 hours of volunteering/mentoring.
                </Typography>

                <Typography variant="h4" style={{marginTop:'5px'}}>
                  Sponsors
                </Typography>
                {getSponsorCard(sponsors, 10, 20)} 
              </CardContent>
            </Card>
            <Card style={{backgroundColor : silverColor, margin:'2px' }}>
              <CardContent>
                <Typography variant="h4" component="h2">
                  Silver
                </Typography>
                <Typography variant="body1" style={style} component="p">
                  Over $800 in support or over 20 hours of volunteering/mentoring.  This helps to keep existing solutions running.
                </Typography>
                
                <Typography variant="h4" style={{marginTop:'5px'}}>
                  Sponsors
                </Typography>
                {getSponsorCard(sponsors, 20, 100)} 
              </CardContent>
            </Card>
            <Card style={{backgroundColor : goldColor, margin:'2px' }}>
              <CardContent>
                <Typography variant="h4" component="h2">
                  Gold
                </Typography>
                <Typography variant="body1" style={style} component="p">
                  Over $1,000 in support or over 80 hours of volunteering/mentoring.  This helps us partially fund a team to complete their projects.
                </Typography>

                <Typography variant="h4" style={{marginTop:'5px'}}>
                  Sponsors
                </Typography>
                {getSponsorCard(sponsors, 100, 150)} 
                
                <Typography variant="body1" style={style} component="p">
                  100 hours of volunteering this year
                </Typography>
              </CardContent>
            </Card>
            <Card style={{backgroundColor : platinumColor, margin:'2px'}}>
              <CardContent>
                <Typography variant="h4" component="h2">
                  Platinum
                </Typography>
                <Typography variant="body1" style={style} component="p">
                  Over $4,000 in support and over 150 hours of volunteering/mentoring.
                  $4,000 is the sweet-spot that we've found as a prize to ensure successful completion of the project after the hackathon.
                </Typography>

                <Typography variant="h4" style={{marginTop:'5px'}}>
                  Sponsors
                </Typography>
                {getSponsorCard(sponsors, 150, 150000)} 
              </CardContent>
            </Card>
          </Grid>
    );

    

    const sponsorLevelDescriptions = (
        <Grid item xs={11} sm={11} md={9} key="sponsorLevels" style={{margin: '1%'}}>
            <Typography variant="h3">👆 That table is pretty and all, but here are more specifics.</Typography>
                
            <Typography variant="h4" sx={{marginTop:'1%'}}>Logo on website</Typography>
            <Typography variant="body1" style={style}> 
            Your logo will be displayed on the event website, which is the main source of information and registration for the hackathon. 
            🌐 This is a great opportunity for you to increase your brand awareness and visibility among the potential participants and visitors of the website. 👀
            </Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Logo on shirts and event posters</Typography>
            <Typography variant="body1" style={style}>
            The sponsor's logo will be printed on the event t-shirts and posters, which are the main promotional materials for the hackathon. 👕🖼️
            This is a great way for you to create a lasting impression and recognition among the attendees and the public who see the t-shirts and posters. 😍
            </Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Hackathon table for recruiting</Typography>
            <Typography variant="body1" style={style}>
            You will have a booth or a table at the hackathon venue, where you can showcase your company or product, interact with the participants, and recruit potential talent. 
            🙌 This is a great chance for you to connect with the hackathon community and find candidates who share your vision and values. 💯</Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Judging panel</Typography>
            <Typography variant="body1" style={style}>
            You will have a representative on the panel of judges, who will evaluate and select the winning teams and projects. 🏆
            This is a great opportunity for you to demonstrate your expertise and leadership in the field, as well as influence the outcome and direction of the hackathon. 🚀
            </Typography>


            <Typography variant="h4" sx={{marginTop:'1%'}}>Opening or closing ceremony talk</Typography>
            <Typography variant="body1" style={style}>
            You will have a chance to pitch your company or product to the audience during the opening or closing ceremony of the hackathon. 
            🎤 This is a great way for you to capture the attention and interest of the attendees, as well as highlight your contribution and support for the hackathon. 👏</Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Hackathon badges</Typography>
            <Typography variant="body1" style={style}>
            Your name or logo will be featured on the badges that participants wear throughout the event. 🎫
            This is a great way for you to increase your visibility and recognition among the attendees, as well as create a sense of belonging and affiliation with your brand. 🤝
            </Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Workshops</Typography>
            <Typography variant="body1" style={style}>
            You will have an opportunity to host or lead a workshop or a session during the hackathon, where you can share your knowledge, skills, or insights with the participants. 📚
            This is a great way for you to showcase your value proposition and differentiation, as well as educate and inspire the attendees. 💡
            </Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Prize or award</Typography>
            <Typography variant="body1" style={style}>
            You will provide a prize or an award for one or more of the winning teams or projects. 🎁
            This can be in the form of cash, gift cards, products, services, or other incentives. 💵
            This is a great way for you to reward and motivate the participants, as well as associate your brand with excellence and innovation. 🏅
            </Typography>

            <Typography variant="h4" sx={{marginTop:'1%'}}>Winner networking</Typography>
            <Typography variant="body1" style={style}>
            You will have exclusive access to the top teams and projects, where you can network with them, offer feedback, mentorship, or collaboration opportunities. 🤳
            This is a great way for you to build relationships and partnerships with the winners, as well as support their growth and development. 🚀
            </Typography>

            </Grid>
    )

    function createData(level, logo_website, logo_shirt, hack_table, judge_panel, open_closing, badges, workshops, prize_award, winner_networking){
        return { level, logo_website, logo_shirt, hack_table, judge_panel, open_closing, badges, workshops, prize_award, winner_networking };
    }
    
    const rows = [
        createData(
            'Bronze',
            "3 months post-hack", // logo website
            "small 10%", // logo shirt
            "x", // Hackathon table
            "-", // Judging panel
            "-", // Open/Closing
            "-", // Badges
            "-", // Workshops
            "-", // Prize/Award
            "-" // Winner Networking
            ),
        createData(
            'Silver',
            "6 months post-hack",
            "medium 25%",
            "x", // Hackathon table
            "x", // Judging panel
            "x", // Open/Closing
            "-", // Badges
            "-", // Workshops
            "-", // Prize/Award
            "-" // Winner Networking
            ),
        createData(
            'Gold',
            "1 year post-hack",
            "large 50%",
            "x", // Hackathon table
            "x", // Judging panel
            "x", // Open/Closing
            "x", // Badges
            "x", // Workshops
            "x", // Prize/Award
            "-" // Winner Networking
            ),
        createData(
            'Platinum',
            "forever",
            "xlarge 80%",
            "x", // Hackathon table
            "x", // Judging panel
            "x", // Open/Closing
            "x", // Badges
            "x", // Workshops
            "x", // Prize/Award
            "x" // Winner Networking
            )        
    ];

    const sponsorshipTable = (
        
        <Grid sx={{ width: "90%", display: "table", tableLayout: "fixed", marginLeft: "15px", justifyContent: "center"}} mt={2} mb={2}>
        <Typography variant="h4" component="h1">
            Sponsorship Benefits
        </Typography>
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell style={tableHeaderStyle} width={90}><strong>Award</strong></TableCell>                            
                    <TableCell style={tableHeaderStyle} width={100} align="right">Logo on website</TableCell>
                    <TableCell style={tableHeaderStyle} width={100} align="right">Logo shirts & event posters</TableCell>
                    <TableCell style={tableHeaderStyle} width={100} align="right">Hackathon table</TableCell>
                    <TableCell style={tableHeaderStyle} width={100} align="right">Judging Panel</TableCell>
                    <TableCell style={tableHeaderStyle} width={100} align="right">Opening/Closing Ceremony</TableCell>
                    <TableCell style={tableHeaderStyle} width={150} align="right">Hackathon Badges</TableCell>
                    <TableCell style={tableHeaderStyle} width={100} align="right">Workshops</TableCell>
                    <TableCell style={tableHeaderStyle} width={100} align="right">Prize/Award</TableCell>                            
                    <TableCell style={tableHeaderStyle} width={100} align="right">Winner Networking</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.level} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell style={style} component="th" scope="row">{row.level}</TableCell>                    
                    <TableCell style={style} align="right">{row.logo_website}</TableCell>
                    <TableCell style={style} align="right">{row.logo_shirt}</TableCell>
                    <TableCell style={style} align="right">{row.hack_table}</TableCell>
                    <TableCell style={style} align="right">{row.judge_panel}</TableCell>
                    <TableCell style={style} align="right">{row.open_closing}</TableCell>
                    <TableCell style={style} align="right">{row.badges}</TableCell>
                    <TableCell style={style} align="right">{row.workshops}</TableCell>
                    <TableCell style={style} align="right">{row.prize_award}</TableCell>
                    <TableCell style={style} align="right">{row.winner_networking}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
        </Grid>
        
    )

    return(
        <LayoutContainer key="sponsorship" container>    
        <div>
            <TitleContainer container>
                <Grid xs={10}>
                <Button variant="outlined" href={`/hack/${event_id}`}>Back to the hack</Button>
                
                <Typography variant="h2" paragraph>Help sponsor our event!</Typography>

               <Typography variant="body1" style={style} paragraph>
                    Sponsoring our event is a great way to get your company's name out there and help the community. There are various support levels available to help you get the most out of your sponsorship.
                </Typography>
                </Grid>

                <Grid container spacing={0.5} mt={2} mb={2} xs={12} sm={12} md={12} direction="row">
                
                <Grid item xs={10} sm={6} md={6} lg={6}>
                  <Card>
                    <CardMedia
                      sx={{ height: 200 }}
                      image="https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp"
                      title="Option 1: Volunteer"
                    />
                    <CardContent>
                      <Typography variant="h3" paragraph>Option 1: Volunteer</Typography>
                      <Typography variant="body2" color="text.secondary" style={style}>
                        Mentor or volunteer before, during, or after the hackathon. Self-report your time spent.  Make a committment today.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" href="https://www.paypal.com/donate?campaign_id=WWL4VPVBUS4SA">Donate</Button>
                    </CardActions>                                
                  </Card>                  
                </Grid>

                <Grid item xs={10} sm={6} md={6} lg={6}>
                  <Card>
                    <CardMedia
                      sx={{ height: 200 }}
                      image="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
                      title="Option 2: Donate"
                    />
                    <CardContent>
                      <Typography variant="h3" paragraph>Option 2: Donate</Typography>
                      <Typography variant="body2" color="text.secondary" style={style}>
                        Support Opportunity Hack with a secure PayPal donation. Your donation will help us fund the hackathon and support the community.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" href="https://www.paypal.com/donate?campaign_id=WWL4VPVBUS4SA">Donate</Button>
                    </CardActions>                                
                  </Card>                  
                </Grid>
                </Grid>

            </TitleContainer>   
            

            <ProjectsContainer container style={{marginTop: 20}} xs={10} sm={12} md={12} lg={12} >                                
                {sponsorshipLevels}                            
                {sponsorshipTable}                
                {sponsorLevelDescriptions}
            </ProjectsContainer> 
            
            </div>
        </LayoutContainer>
    );
}