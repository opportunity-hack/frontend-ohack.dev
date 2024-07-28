import React from 'react';
import { Typography, Grid, Button, Box } from '@mui/material';
import Head from 'next/head';
import { InstagramEmbed } from 'react-social-media-embed';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { LayoutContainer, InnerContainer, SlackSignupContainer, SlackLink } from "./styles";
import InfoIcon from '@mui/icons-material/Info';


export default function OfficeHours({ previousPage }) {    
    const style = { fontSize: '16px' };
    const notificationEmail = 'officehours@ohack.org';

    const generateICSContent = (isFirstWeek) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (5 + 7 - startDate.getDay()) % 7); // Next Friday
        if (!isFirstWeek) startDate.setDate(startDate.getDate() + 7); // Add a week for second Friday

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        const startTime = isFirstWeek ? '100000' : '140000';
        const endTime = isFirstWeek ? '110000' : '150000';

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Opportunity Hack//NONSGML Office Hours//EN
BEGIN:VEVENT
DTSTART;TZID=America/Los_Angeles:${formatDate(startDate)}T${startTime}
DTEND;TZID=America/Los_Angeles:${formatDate(startDate)}T${endTime}
RRULE:FREQ=WEEKLY;INTERVAL=2
SUMMARY:Opportunity Hack Office Hours
DESCRIPTION:Join us for weekly office hours to discuss your nonprofit coding projects!
LOCATION:Slack huddle in #general channel https://opportunity-hack.slack.com/archives/C1Q6YHXQU
ATTENDEE:mailto:${notificationEmail}
END:VEVENT
END:VCALENDAR`;
    };

    const downloadICS = (isFirstWeek) => {
        const icsContent = generateICSContent(isFirstWeek);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `OpportunityHack_OfficeHours_${isFirstWeek ? '10am' : '2pm'}_PST.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getGoogleCalendarLink = (isFirstWeek) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (5 + 7 - startDate.getDay()) % 7); // Next Friday
        if (!isFirstWeek) startDate.setDate(startDate.getDate() + 7); // Add a week for second Friday

        const formatDate = (date) => {
            const utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            return utc.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const startTime = isFirstWeek ? '10:00:00' : '14:00:00';
        const endTime = isFirstWeek ? '11:00:00' : '15:00:00';

        const start = `${formatDate(startDate).slice(0, 8)}T${startTime.replace(/:/g, '')}`;
        const end = `${formatDate(startDate).slice(0, 8)}T${endTime.replace(/:/g, '')}`;

        const rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2';

        const details = encodeURIComponent('Join us for weekly office hours to discuss your nonprofit coding projects!');
        const location = encodeURIComponent('Slack huddle in #general channel https://opportunity-hack.slack.com/archives/C1Q6YHXQU');
        const timeZone = encodeURIComponent('America/Los_Angeles');

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Opportunity Hack Office Hours')}&dates=${start}/${end}&details=${details}&location=${location}&recur=${encodeURIComponent(rrule)}&ctz=${timeZone}&add=${encodeURIComponent(notificationEmail)}`;
    };

    const CalendarOptions = ({ isFirstWeek }) => (
        <Box mt={2}>
            <Button
                variant="outlined"
                color="secondary"
                startIcon={<AppleIcon />}
                onClick={() => downloadICS(isFirstWeek)}
                fullWidth
                sx={{ mb: 1 }}
            >
                Apple Calendar / Outlook (PST)
            </Button>
            <Button
                variant="outlined"
                color="secondary"
                startIcon={<GoogleIcon />}
                href={getGoogleCalendarLink(isFirstWeek)}
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
            >
                Google Calendar (PST)
            </Button>
        </Box>
    );

    return (
        <LayoutContainer container>
            <Head>
                <title>Office Hours - Opportunity Hack Developer Portal</title>
                <meta name="description" content="Join Opportunity Hack's weekly office hours for guidance on nonprofit coding projects. Alternating every Friday between 10am and 2pm PST. Perfect for students, bootcampers, and experienced developers looking to give back." />
                <meta name="keywords" content="Opportunity Hack, office hours, nonprofit coding, volunteer coding, tech mentorship, coding bootcamp projects, Friday office hours" />
            </Head>
            <InnerContainer container>
                <SlackSignupContainer>
                    <Typography variant="h1" gutterBottom>Office Hours</Typography>
                    <Typography variant="body1" style={style} paragraph>
                        We provide weekly office hours using a <SlackLink target="_blank" href="https://opportunity-hack.slack.com/archives/C1Q6YHXQU">Slack huddle in #general</SlackLink> for anyone volunteering to write code for any nonprofit we support at Opportunity Hack.
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<InfoIcon />}
                            href="https://slack.com/features/huddles"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 1, verticalAlign: 'middle' }}
                        >
                            What's a Slack Huddle?
                        </Button>
                    </Typography>
                    <Typography variant="body1" style={style} paragraph>
                        Whether you're a student, bootcamp graduate, or experienced developer looking to give back, our office hours are the perfect opportunity to get guidance, share ideas, and make a real impact through coding.
                    </Typography>
                    
                    <Typography variant="h4" mt={4} mb={2}>Office Hours Schedule (PST)</Typography>
                    <Typography variant="body1" style={style} paragraph>
                        We hold office hours every Friday, alternating between 10am and 2pm PST each week.
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">10am to 11am PST</Typography>
                            <Typography variant="body1" style={style}>First and third Fridays of the month</Typography>
                            <CalendarOptions isFirstWeek={true} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">2pm to 3pm PST</Typography>
                            <Typography variant="body1" style={style}>Second and fourth Fridays of the month</Typography>
                            <CalendarOptions isFirstWeek={false} />
                        </Grid>
                    </Grid>

                    <Typography variant="body1" style={style} mt={4}>
                        Can't make it to our scheduled times? Don't worry! Reach out in the Slack channel, and we'll do our best to accommodate your schedule.
                    </Typography>

                    <Box mt={4} mb={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<InsertInvitationIcon />}
                            href="https://opportunity-hack.slack.com/archives/C1Q6YHXQU"
                            target="_blank"
                        >
                            Join Slack Channel
                        </Button>
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        width: '100%', 
                        maxWidth: '500px', 
                        margin: '30px auto' 
                    }}>
                        <InstagramEmbed 
                            url="https://www.instagram.com/p/CqFz5PWB9Og/" 
                            width="100%"
                            height="auto"
                        />
                    </Box>

                    <LoginOrRegister introText="Ready to make an impact? Join our community today!" previousPage={"/office-hours"} />
                </SlackSignupContainer>
            </InnerContainer>
        </LayoutContainer>
    );
}