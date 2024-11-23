import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Typography, Grid, Button, Box, Skeleton } from '@mui/material';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { LayoutContainer, InnerContainer, SlackSignupContainer, SlackLink } from "../../components/OfficeHours/styles";
import InfoIcon from '@mui/icons-material/Info';
import dynamic from 'next/dynamic';

export default function OfficeHoursPage({ title, openGraphData }) {
    const style = { fontSize: '16px' };
    const notificationEmail = 'officehours@ohack.org';
    const [isLoading, setIsLoading] = useState(true);

    const LoginOrRegister = dynamic(() => import('../../components/LoginOrRegister/LoginOrRegister'), { ssr: false });
    const InstagramEmbed = dynamic(() => import('react-social-media-embed').then(mod => mod.InstagramEmbed), { ssr: false });

    useEffect(() => {
        const initFacebookPixel = async () => {
            const ReactPixelModule = await import('react-facebook-pixel');
            const options = {
                autoConfig: true,
                debug: false,
            };
            const advancedMatching = undefined;
            ReactPixelModule.default.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
        };
        initFacebookPixel();

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const generateICSContent = (isFirstWeek) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (5 + 7 - startDate.getDay()) % 7);
        if (!isFirstWeek) startDate.setDate(startDate.getDate() + 7);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        const startTime = isFirstWeek ? '120000' : '150000';
        const endTime = isFirstWeek ? '130000' : '160000';

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
                href={isFirstWeek 
                    ? "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=bXZ0bmRrZDdlMGlxMDZwYWJrZ3M4N2gzZWxfMjAyNDExMjJUMjAwMDAwWiBjXzE1YzZmMjVkZGM2MTEwODFhMWM1OWVmOTE3YzY0N2ZiNDhhNThhZTcxNjkxNmM1NzkyZWVkZTZhMjIzNmVkMTBAZw&tmsrc=c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com&scp=ALL"
                    : "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=Y3BoMzBwajRjcGltYWI5a2Nvc202YjlrNzBwbTRiOW9jNWkzYWI5aTZrcmppZHBnY2tvMzRwOW42NF8yMDI0MTEyOVQyMjAwMDBaIGNfMTVjNmYyNWRkYzYxMTA4MWExYzU5ZWY5MTdjNjQ3ZmI0OGE1OGFlNzE2OTE2YzU3OTJlZWRlNmEyMjM2ZWQxMEBn&tmsrc=c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com&scp=ALL"
                }
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
                <title>{title}</title>
                {openGraphData.map((og) => (
                    <meta key={og.key} {...og} />
                ))}
                <style>{`
                    body {
                        overflow-y: scroll;
                    }
                `}</style>
            </Head>
            <InnerContainer container>
                <SlackSignupContainer>
                    <Typography variant="h1" gutterBottom>Office Hours</Typography>
                    {isLoading ? (
                        <Skeleton variant="text" width="100%" height={40} />
                    ) : (
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
                    )}
                    {isLoading ? (
                        <Skeleton variant="text" width="100%" height={40} />
                    ) : (
                        <Typography variant="body1" style={style} paragraph>
                            Whether you're a student, bootcamp graduate, or experienced developer looking to give back, our office hours are the perfect opportunity to get guidance, share ideas, and make a real impact through coding.
                        </Typography>
                    )}
                    
                    <Typography variant="h4" mt={4} mb={2}>Office Hours Schedule</Typography>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height={400} />
                    ) : (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" style={style}>
                                    • First & Third Fridays: 12pm - 1pm PST
                                    <br />
                                    • Second & Fourth Fridays: 2pm - 3pm PST
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                width: '100%',
                                height: '600px',
                                mb: 4,
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <iframe 
                                    src="https://calendar.google.com/calendar/embed?src=c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com"
                                    style={{
                                        border: 0,
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0
                                    }}
                                    frameBorder="0"
                                    scrolling="no"
                                />
                            </Box>
                            <Box mt={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<InsertInvitationIcon />}
                                    href="https://calendar.google.com/calendar/ical/c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com/public/basic.ics"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    Subscribe to Calendar (iCal)
                                </Button>
                            </Box>
                        </>
                    )}
                    
                    {isLoading ? (
                        <Skeleton variant="text" width="100%" height={60} sx={{ mt: 4 }} />
                    ) : (
                        <Typography variant="body1" style={style} mt={4}>
                            Can't make it to our scheduled times? Don't worry! Reach out in the Slack channel, and we'll do our best to accommodate your schedule.
                        </Typography>
                    )}

                     <Box mt={4} mb={4}>
                        {isLoading ? (
                            <Skeleton variant="rectangular" width={200} height={40} />
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<InsertInvitationIcon />}
                                href="https://opportunity-hack.slack.com/archives/C1Q6YHXQU"
                                target="_blank"
                            >
                                Join Slack Channel
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        width: '100%', 
                        maxWidth: '500px', 
                        margin: '30px auto',
                        height: '500px'
                    }}>
                        {isLoading ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" />
                        ) : (
                            <InstagramEmbed 
                                url="https://www.instagram.com/p/CqFz5PWB9Og/" 
                                width="100%"
                                height="100%"
                            />
                        )}
                    </Box>

                    <LoginOrRegister introText="Ready to make an impact? Join our community today!" previousPage={"/office-hours"} />
                </SlackSignupContainer>
            </InnerContainer>
        </LayoutContainer>
    );
}

export const getStaticProps = async ({ params = {} } = {}) => {
    const title = "Code for Social Good: Free Developer Office Hours | Opportunity Hack";
    const metaDescription = 'Join our free weekly developer office hours to code for social good. Get mentorship, improve your coding skills, and help nonprofits. Perfect for students, bootcamp graduates, and experienced developers looking to make a social impact through technology.';
    const image = "https://cdn.ohack.dev/ohack.dev/officehours.webp";
    
    // Schema.org structured data for events
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Schedule",
        "scheduleTimezone": "America/Phoenix",
        "eventSchedule": {
            "@type": "Schedule",
            "byDay": ["Friday"],
            "startTime": "12:00",
            "endTime": "15:00",
            "repeatFrequency": "P1W",
            "scheduleTimezone": "America/Phoenix"
        },
        "subEvent": {
            "@type": "Event",
            "name": "Opportunity Hack Developer Office Hours",
            "description": "Free mentorship and guidance for developers working on nonprofit projects",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "organizer": {
                "@type": "Organization",
                "name": "Opportunity Hack",
                "url": "https://ohack.dev"
            }
        }
    };

    return {
        props: {
            title,
            openGraphData: [
                { name: "title", content: title, key: "title" },
                { property: "og:title", content: title, key: "ogtitle" },
                { name: "description", content: metaDescription, key: "desc" },
                { property: "og:description", content: metaDescription, key: "ogdesc" },
                { property: "og:type", content: "website", key: "website" },
                { property: "og:image", content: image, key: "ogimage" },
                { property: "twitter:image", content: image, key: "twitterimage" },
                { property: "og:site_name", content: "Opportunity Hack Developer Portal", key: "ogsitename" },
                { property: "twitter:card", content: "summary_large_image", key: "twittercard" },
                { property: "twitter:domain", content: "ohack.dev", key: "twitterdomain" },
                { property: "twitter:label1", value: "Free Developer Office Hours", key: "twitterlabel1" },
                { property: "twitter:data1", value: "Every Friday - Learn, Code, Make Impact", key: "twitterdata1" },
                // Additional meta tags for better SEO
                { name: "keywords", content: "code for social good, developer mentorship, nonprofit coding, tech volunteering, learn to code, social impact coding, free developer help, programming mentorship, tech for good, coding office hours", key: "keywords" },
                { name: "author", content: "Opportunity Hack", key: "author" },
                { property: "article:publisher", content: "https://www.linkedin.com/company/opportunity-hack", key: "publisher" },
                { property: "og:locale", content: "en_US", key: "locale" },
                { name: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
                { name: "twitter:site", content: "@opportunityhack", key: "twittersite" },
                // Additional social sharing optimizations
                { property: "og:url", content: "https://ohack.dev/office-hours", key: "ogurl" },
                { property: "og:image:alt", content: "Opportunity Hack Developer Office Hours - Code for Social Good", key: "ogimagealt" }
            ],
            // Add structured data for search engines
            structuredData: JSON.stringify(structuredData)
        },
    };
};