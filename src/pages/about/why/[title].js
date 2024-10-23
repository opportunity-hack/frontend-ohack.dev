import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { Typography, Box, Skeleton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { whyPages } from '../../../data/why-content';
import { generateMetaTags, generateStructuredData } from '../../../data/why-pages';
import {
  TitleContainer,
  LayoutContainer,
  ProjectsContainer,
  MoreNewsStyle,
  LinkStyled
} from '../../../styles/nonprofit/styles';

const LoginOrRegister = dynamic(
  () => import("../../../components/LoginOrRegister/LoginOrRegister"),
  { 
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height={100} />
  }
);

const OptimizedImage = memo(({ src, alt }) => (
  <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, height: 300 }}>
    <Image
      src={src}
      alt={alt}
      fill
      style={{ objectFit: 'cover' }}
      priority
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      sizes="(max-width: 768px) 100vw, 300px"
    />
  </Box>
));

OptimizedImage.displayName = 'OptimizedImage';

const LoadingState = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
    <Skeleton variant="text" height={60} sx={{ mb: 1 }} />
    <Skeleton variant="text" height={20} count={3} />
  </Box>
);

const WhyPage = () => {
  const router = useRouter();
  const { title } = router.query;

  // Handle loading state
  if (router.isFallback || !title) {
    return <LoadingState />;
  }

  const pageData = whyPages[title];

  // Handle 404
  if (!pageData) {
    router.push('/404');
    return null;
  }

  const { Content } = pageData;

  return (
    <>
      <Head>
        <title>{`${pageData.title} | Opportunity Hack`}</title>
        {generateMetaTags(pageData).map(tag => (
          <meta {...tag} key={tag.key} />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData(pageData))
          }}
        />
        <link rel="canonical" href={`https://ohack.dev/about/why/${title}`} />
      </Head>

      <LayoutContainer key="why" container>
        <TitleContainer container>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4,
            mb: 4 
          }}>
            <OptimizedImage src={pageData.image} alt={pageData.title} />
            <Box>
              <Typography variant="h2" component="h1" gutterBottom>
                {pageData.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {pageData.subtitle}
              </Typography>
            </Box>
          </Box>

          <Link href="/about/why" prefetch={false} passHref>
            <MoreNewsStyle>
              <ArrowBackIcon />
              Back to why
            </MoreNewsStyle>
          </Link>
        </TitleContainer>

        <ProjectsContainer>
            
        {Content && <Content />}
        
          <Box sx={{ mt: 6 }}>
            <LoginOrRegister
              introText="Ready to start building your portfolio?"
              previousPage={`/about/why/${title}`}
            />
          </Box>
        </ProjectsContainer>
      </LayoutContainer>
    </>
  );
};

export async function getStaticPaths() {
  // Generate paths for all pages
  const paths = Object.keys(whyPages).map(slug => ({
    params: { title: slug }
  }));

  return {
    paths,
    fallback: true // Enable ISR
  };
}

export async function getStaticProps({ params = {} } = {}) {
  const pageData = whyPages[params.title];

  if (!pageData) {
    return { notFound: true };
  }

  return {
    props: {
      openGraphData: generateMetaTags(pageData)
    },
    revalidate: 3600 // Revalidate pages every hour
  };
}

export default WhyPage;