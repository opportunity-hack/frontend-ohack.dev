import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Container } from '@mui/material';
import { styled } from '@mui/system';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { LayoutContainer, TitleContainer } from '../styles/nonprofit/styles';
import * as ga from '../lib/ga';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  textAlign: 'center',
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  width: '100%',
  maxWidth: '400px',
  height: 'auto',
}));

const sleepingImages = [
  'https://cdn.ohack.dev/ohack.dev/404/sleeping1.webp',
  'https://cdn.ohack.dev/ohack.dev/404/sleeping2.webp',
  'https://cdn.ohack.dev/ohack.dev/404/sleeping3.webp'
];

const Custom404 = () => {
  const [randomImage, setRandomImage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sleepingImages.length);
    setRandomImage(sleepingImages[randomIndex]);

    // Track the 404 error
    ga.event({
      action: "404_error",
      params : {
        page_path: router.asPath
      }
    });
  }, [router.asPath]);

  const pageTitle = `404 - Page Not Found | ${router.asPath} | Opportunity Hack`;
  const pageDescription = `The page ${router.asPath} could not be found. Explore other opportunities to hack for social good with Opportunity Hack.`;

  return (
    <LayoutContainer>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="robots" content="noindex,follow" />
      </Head>
      <TitleContainer>
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Oops! Page Not Found
        </Typography>
      </TitleContainer>
      <StyledContainer>
        <ImageContainer>
          {randomImage && (
            <Image
              src={randomImage}
              alt="Sleeping character"
              width={400}
              height={300}
              layout="responsive"
            />
          )}
        </ImageContainer>
        <Typography variant="body1" paragraph>
          It looks like this page is taking a little nap. But don't worry, there are still plenty of opportunities to hack for social good while we wake it up!
        </Typography>
        <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Link href="/" passHref>
            <Button variant="contained" color="primary" size="large">
              Go to Homepage
            </Button>
          </Link>
          <Box mt={2}>
            <Link href="/nonprofits" passHref>
              <Button variant="outlined" color="primary">
                Browse Nonprofit Projects
              </Button>
            </Link>
          </Box>
          <Box mt={2}>
            <Link href="/about" passHref>
              <Button variant="outlined" color="primary">
                Learn About Opportunity Hack
              </Button>
            </Link>
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            If you believe this is an error, please contact us at{' '}
            <Link href="mailto:support@ohack.dev">
              support@ohack.dev
            </Link>
          </Typography>
        </Box>
      </StyledContainer>
    </LayoutContainer>
  );
};

export default Custom404;