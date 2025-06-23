import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Typography, Box } from '@mui/material';
import Link from 'next/link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Head from 'next/head';

const Breadcrumbs = ({ items, currentPage }) => {
  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.ohack.dev/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": `https://www.ohack.dev${item.href}`
      })),
      ...(currentPage ? [{
        "@type": "ListItem",
        "position": items.length + 2,
        "name": currentPage,
        "item": typeof window !== 'undefined' ? window.location.href : ''
      }] : [])
    ]
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Head>
      <Box sx={{ py: 1, px: 0 }}>
        <MUIBreadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'wrap',
            },
            '& .MuiBreadcrumbs-li': {
              fontSize: '0.875rem',
            }
          }}
        >
          <Link href="/" passHref>
            <Typography
              component="a"
              sx={{ 
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Home
            </Typography>
          </Link>
          
          {items.map((item, index) => (
            <Link href={item.href} key={item.href} passHref>
              <Typography
                component="a"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {item.name}
              </Typography>
            </Link>
          ))}
          
          {currentPage && (
            <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
              {currentPage}
            </Typography>
          )}
        </MUIBreadcrumbs>
      </Box>
    </>
  );
};

export default Breadcrumbs;