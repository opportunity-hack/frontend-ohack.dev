import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Typography, Grid, Paper, List, ListItem, ListItemText, Button, ThemeProvider, createTheme } from '@mui/material';
import { styled } from '@mui/system';

import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import { initFacebookPixel, trackEvent } from '../../lib/ga';
import dynamic from "next/dynamic";

const MermaidDiagram = dynamic(() => import("../../components/MermaidDiagram"), {
  ssr: false,
  loading: () => <p>Loading diagram...</p>,
});

const chart = `
                graph LR
                A[Nonprofit Application] --> B[Application Review]
                B --> C[Nonprofit Selection]
                C --> D[Problem Refinement]
                D --> E[Hackathon Event]
                E --> F[Project Continuation]
                F --> G[Long-term Impact]
              `;


const theme = createTheme({
  typography: {
    fontSize: 15,
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const MermaidWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '2rem',
});

const IconWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem',
});

export default function OpportunityHackProcess() {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const trackButtonClick = (buttonName) => {
    trackEvent({
      action: "click_process",
      params: {
        event_category: "button",
        event_label: buttonName,
      },
    });    
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Opportunity Hack Process: Empowering Nonprofits through Tech Innovation</title>
        <meta name="description" content="Discover how Opportunity Hack connects nonprofits with skilled volunteers to solve technological challenges. Learn about our unique hackathon process for social good." />
        <meta name="keywords" content="Opportunity Hack, nonprofit technology, hackathon, tech volunteers, social impact, open source, mentorship, software development, project management" />
        <meta property="og:title" content="Opportunity Hack: Bridging Nonprofits and Tech Innovators" />
        <meta property="og:description" content="Join Opportunity Hack to use your tech skills for social good. Whether you're a nonprofit, developer, designer, or sponsor, learn how you can make a difference." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/about/process" />
        <meta property="og:image" content="https://ohack.dev/images/opportunity-hack-banner.jpg" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <Typography mt={10} variant="h2" align="center" gutterBottom>
          Opportunity Hack: Innovating for Nonprofits
        </Typography>

        <Typography variant="h3" align="center" gutterBottom>
          Connecting Tech Talent with Nonprofit Needs
        </Typography>

        <StyledPaper>
          <Typography variant="h3" gutterBottom>Our Unique Process</Typography>
          <Typography paragraph>
            Opportunity Hack brings together nonprofits, developers, designers, and tech professionals to create innovative solutions for social good. Here's how we make it happen:
          </Typography>

          <MermaidDiagram chart={chart} />
        </StyledPaper>

        <Grid container spacing={3}>
          {[
            {
              title: "1. Nonprofit Application",
              content: "Nonprofits submit their ideas and challenges through our online form.",
              list: [
                "• Share your organization's mission and vision",
                "• Describe specific technical challenges you face",
                "• Explain how solving these challenges will amplify your impact",
                "• No tech expertise required - we're here to help!"
              ],
              link: { text: "Apply Now", href: "/nonprofits/apply" },
              icon: <AssignmentIcon fontSize="large" />
            },
            {
              title: "2. Application Review",
              content: "Our expert team carefully evaluates each application to ensure a good fit.",
              list: [
                "• Weekly review of new nonprofit applications",
                "• Follow-up questions via email or Slack for clarity",
                "• Assessment of project feasibility and potential impact",
                "• Consideration of available volunteer skills and resources"
              ],
              icon: <RateReviewIcon fontSize="large" />
            },
            {
              title: "3. Nonprofit Selection",
              content: "We choose diverse projects that can benefit most from our hackathon model.",
              list: [
                "• Notification sent to selected nonprofits",
                "• Warm welcome to the Opportunity Hack community",
                "• Access to our collaborative Slack workspace",
                "• Initial briefing on the hackathon process and expectations"
              ],
              icon: <GroupIcon fontSize="large" />
            },
            {
              title: "4. Problem Refinement",
              content: "We work closely with nonprofits to define clear, impactful project goals.",
              list: [
                "• One-on-one sessions with experienced Opportunity Hack mentors",
                "• Clarification of project scope, goals, and success criteria",
                "• Guidance on preparing an engaging 3-minute pitch video",
                "• Preliminary matching with potential skills and technologies"
              ],
              icon: <BuildIcon fontSize="large" />
            },
            {
              title: "5. Hackathon Event",
              content: "The main event where volunteers collaborate intensively on nonprofit projects.",
              list: [
                "• Kickoff with inspiring nonprofit pitches",
                "• Team formation based on skills and interests",
                "• 48 hours of focused project development and prototyping",
                "• Ongoing communication between nonprofits and dev teams",
                "• Final presentations and judging by industry experts"
              ],
              icon: <CodeIcon fontSize="large" />
            },
            {
              title: "6. Project Continuation",
              content: "We ensure projects have a path forward after the hackathon ends.",
              list: [
                "• Winning teams invited to continue development",
                "• Typically 3 months of additional refinement and implementation",
                "• Regular check-ins and progress updates",
                "• Support for deployment and handover to nonprofits",
                "• Documentation and open-sourcing of solutions for wider benefit"
              ],
              icon: <TimelineIcon fontSize="large" />
            }
          ].map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <StyledPaper>
                <IconWrapper>
                  {section.icon}
                  <Typography variant="h4" style={{ marginLeft: '1rem' }}>{section.title}</Typography>
                </IconWrapper>
                <Typography variant="h5" paragraph>{section.content}</Typography>
                <List>
                  {section.list.map((item, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
                {section.link && (
                  <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <Link href={section.link.href} passHref>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => trackButtonClick(section.link.text)}
                      >
                        {section.link.text}
                      </Button>
                    </Link>
                  </div>
                )}
              </StyledPaper>
            </Grid>
          ))}
        </Grid>

        <StyledPaper>
          <Typography variant="h3" gutterBottom>Opportunity Hack 2024 Timeline</Typography>
          <MermaidWrapper>
            <pre className="mermaid">
              {`
                gantt
                  title Opportunity Hack 2024 Timeline
                  dateFormat  YYYY-MM-DD
                  section Application
                  Nonprofit Applications    :a1, 2024-05-01, 2024-08-31
                  Weekly Application Review :a2, 2024-05-01, 2024-08-31
                  section Pre-Event
                  Nonprofit Notification    :2024-09-01, 7d
                  Problem Refinement        :2024-09-15, 14d
                  section Hackathon
                  Hackathon Event           :milestone, m1, 2024-10-12, 2d
                  section Post-Event
                  Project Continuation      :2024-10-13, 90d
              `}
            </pre>
          </MermaidWrapper>
        </StyledPaper>

        <StyledPaper>
          <Typography variant="h3" gutterBottom>Frequently Asked Questions</Typography>
          {[
            {
              q: "How can sponsors support Opportunity Hack?",
              a: <>Sponsors play a crucial role in making Opportunity Hack possible. You can contribute by providing funding, offering mentorship, donating technology resources, or hosting events. Your support directly enables nonprofits to leverage cutting-edge technology for social good. <Link href="/sponsor" style={{ color: '#1976d2', textDecoration: 'underline' }}>Learn more about sponsorship opportunities</Link>.</>
            },
            {
              q: "What skills are needed to participate as a hacker?",
              a: "We welcome a diverse range of skills! Software developers, UX/UI designers, data scientists, project managers, and anyone passionate about using technology for social impact can contribute. Whether you're a seasoned pro or just starting out, there's a place for you at Opportunity Hack."
            },
            {
              q: "How can nonprofits prepare for the hackathon?",
              a: "The key is to clearly define your challenges and goals. We'll guide you through the process, but it helps to think about your technical pain points, data you can share, and the impact a solution would have. Don't worry about the technical details – that's where our volunteers come in!"
            },
            {
              q: "Is the code developed during Opportunity Hack open source?",
              a: "Yes, all code developed during Opportunity Hack is open-source and falls under the MIT License. This approach allows for maximum collaboration, transparency, and the potential for solutions to benefit multiple organizations facing similar challenges."
            },
            {
              q: "What happens if our project isn't completed during the hackathon?",
              a: "The hackathon is just the beginning! While we aim to create working prototypes during the event, winning teams are invited to continue development for about 3 months post-event. This extended period allows for further refinement, testing, and implementation of the solution."
            }
          ].map((faq, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <Typography variant="h5">{faq.q}</Typography>
              <Typography>{faq.a}</Typography>
            </div>
          ))}
        </StyledPaper>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Typography variant="h3" gutterBottom>Ready to Make a Difference?</Typography>
          <Link href="/nonprofits/apply" passHref>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => trackButtonClick('Apply Now')}
            >
              Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </ThemeProvider>
  );
}