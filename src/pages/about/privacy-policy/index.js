import React from 'react';
import Head from 'next/head';
import { Typography, Box, Button, Divider, Link as MuiLink } from '@mui/material';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <LayoutContainer container>
      <Head>
        <title>Privacy Policy - Opportunity Hack</title>
        <meta name="description" content="Privacy policy for Opportunity Hack, a nonprofit organization dedicated to coding for social good. Includes information on GDPR compliance and cookie usage." />
        <meta name="keywords" content="Opportunity Hack, privacy policy, data protection, nonprofit, open source, hackathon, GDPR, cookies" />
      </Head>
      <TitleContainer>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '3rem' }}>
          Privacy Policy
        </Typography>
      </TitleContainer>
      <ProjectsContainer>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
          At Opportunity Hack, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines our practices concerning the collection, use, and protection of your data.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          1. About Opportunity Hack
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Opportunity Hack is a nonprofit organization dedicated to leveraging technology for social good. Our mission is to connect skilled volunteers with nonprofits to create innovative solutions that make a positive impact on society.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          2. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          We collect information that you provide directly to us, such as when you register for an event, sign up for our newsletter, or participate in our hackathons. This may include:
        </Typography>
        <Typography component="ul" sx={{ pl: 4, fontSize: '1.1rem' }}>
          <li>Name and contact information</li>
          <li>Skills and areas of expertise</li>
          <li>Demographic information</li>
          <li>Participation history in our events</li>
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          3. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          We use the information we collect to:
        </Typography>
        <Typography component="ul" sx={{ pl: 4, fontSize: '1.1rem' }}>
          <li>Organize and manage our hackathons and events</li>
          <li>Communicate with you about upcoming opportunities</li>
          <li>Improve our programs and services</li>
          <li>Analyze the impact of our initiatives</li>
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          4. Information Sharing and Disclosure
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          As a nonprofit organization committed to transparency and trust, we want to assure you that we will not share any information about our participants without their explicit agreement. Your privacy is paramount to us, and we treat your personal information with the utmost respect and confidentiality.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          5. Data Security
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          6. Open Source Commitment
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          At Opportunity Hack, we believe in the power of open source and transparency. We invite you to review our open-source GitHub code to help improve our security and privacy measures. As this is a public good, we welcome contributions from the community to enhance the protection of user data and the overall security of our platform.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          You can find our GitHub repository at:{' '}
          <MuiLink href="https://github.com/opportunity-hack" target="_blank" rel="noopener noreferrer">
            https://github.com/opportunity-hack
          </MuiLink>
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          7. Cookies and Website Analysis
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          We use cookies and similar tracking technologies to analyze the quality and impact of our website. These tools help us understand how visitors use our site, which pages are most popular, and how we can improve the user experience. The data collected is aggregated and anonymized, and we do not use it to identify individual users.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          By using our website, you consent to the use of cookies for these purposes. You can control and/or delete cookies as you wish through your browser settings. Removing or blocking cookies may impact your user experience on our site.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          8. GDPR Compliance
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Opportunity Hack is committed to complying with the General Data Protection Regulation (GDPR). If you are a resident of the European Economic Area (EEA), you have certain data protection rights, including:
        </Typography>
        <Typography component="ul" sx={{ pl: 4, fontSize: '1.1rem' }}>
          <li>The right to access, update, or delete your personal information</li>
          <li>The right to data portability</li>
          <li>The right to restrict or object to our processing of your personal data</li>
          <li>The right to withdraw consent at any time for data processing based on consent</li>
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          To exercise these rights, please contact us at privacy@ohack.org. We will respond to your request within 30 days.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          9. Your Rights
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Regardless of your location, you have the right to access, correct, or delete your personal information at any time. If you would like to exercise these rights or have any questions about our privacy practices, please contact us at privacy@ohack.org.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2rem' }}>
          10. Changes to This Policy
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date below.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" paragraph sx={{ fontSize: '1rem' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" component={Link} href="/sponsor" sx={{ fontSize: '1rem' }}>
            Become a Sponsor
          </Button>
          <Button variant="outlined" color="primary" component={Link} href="/about/mentors" sx={{ fontSize: '1rem' }}>
            Learn about Mentoring
          </Button>
          <Button variant="outlined" color="primary" component={Link} href="/about/judges" sx={{ fontSize: '1rem' }}>
            Become a Judge
          </Button>
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
};

export default PrivacyPolicy;