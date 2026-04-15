import { Container, Typography, Box } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import LoginOrRegister from '../components/LoginOrRegister/LoginOrRegister2'

export default function LoginAndSignup({ seoMetadata }) {
    const router = useRouter()
    const [previousPage, setPreviousPage] = useState('/')
    const [isClient, setIsClient] = useState(false)
    
    // Safely handle URL parameters on client side only with proper error handling
    useEffect(() => {
        setIsClient(true)
        
        if (typeof window !== 'undefined') {
            try {
                const params = new URLSearchParams(window.location.search)
                let page = params.get('previousPage') || '/'
                
                // Security: Validate and sanitize the previousPage parameter
                // Only allow internal URLs to prevent open redirect vulnerabilities
                if (page && !page.startsWith('/') && !page.startsWith('https://ohack.dev')) {
                    console.warn('Invalid previousPage parameter detected, using default')
                    page = '/'
                }
                
                // Additional security: Prevent XSS by encoding special characters
                if (page.includes('<') || page.includes('>') || page.includes('"') || page.includes("'")) {
                    console.warn('Potentially malicious previousPage parameter detected, using default')
                    page = '/'
                }
                
                setPreviousPage(page)
            } catch (error) {
                console.error('Error parsing URL parameters:', error)
                setPreviousPage('/')
            }
        }
    }, [])
    
    // Prevent hydration mismatches
    if (!isClient) {
        return null
    }

    return (
      <>
        {/* Comprehensive SEO metadata */}
        <Head>
          <title>{seoMetadata.title}</title>
          <meta name="description" content={seoMetadata.description} />
          <meta name="keywords" content={seoMetadata.keywords} />
          <link rel="canonical" href={seoMetadata.canonicalUrl} />

          {/* DNS prefetch and preconnect for performance */}
          <link rel="dns-prefetch" href="//cdn.ohack.dev" />
          <link
            rel="preconnect"
            href="https://cdn.ohack.dev"
            crossOrigin="anonymous"
          />

          {/* Open Graph tags for social media */}
          <meta property="og:title" content={seoMetadata.title} />
          <meta property="og:description" content={seoMetadata.description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={seoMetadata.canonicalUrl} />
          <meta property="og:image" content={seoMetadata.imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:image:alt"
            content="Join Opportunity Hack community - Tech for Good"
          />
          <meta property="og:site_name" content="Opportunity Hack" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoMetadata.title} />
          <meta name="twitter:description" content={seoMetadata.description} />
          <meta name="twitter:image" content={seoMetadata.imageUrl} />
          <meta
            name="twitter:image:alt"
            content="Join Opportunity Hack community - Tech for Good"
          />
          <meta name="twitter:creator" content="@opportunityhack" />
          <meta name="twitter:site" content="@opportunityhack" />

          {/* Additional SEO and UX meta tags */}
          <meta
            name="robots"
            content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
          />
          <meta name="googlebot" content="index, follow" />
          <meta name="author" content="Opportunity Hack" />
          <meta name="theme-color" content="#1976d2" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          {/* Additional metadata for better indexing */}
          <meta name="language" content="en" />
          <meta name="coverage" content="Worldwide" />
          <meta name="distribution" content="Global" />
          <meta name="rating" content="General" />
          <meta name="revisit-after" content="7 days" />

          {/* Favicon and app icons */}
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>

        {/* Structured Data for SEO */}
        <Script
          id="signup-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: seoMetadata.title,
              description: seoMetadata.description,
              url: seoMetadata.canonicalUrl,
              inLanguage: "en-US",
              isPartOf: {
                "@type": "WebSite",
                name: "Opportunity Hack",
                alternateName: "OHack",
                url: "https://ohack.dev",
                description:
                  "Building a global community where individuals can accelerate their career growth while making a lasting impact for nonprofits",
              },
              breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://ohack.dev",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Sign Up",
                    item: seoMetadata.canonicalUrl,
                  },
                ],
              },
              mainEntity: {
                "@type": "Organization",
                name: "Opportunity Hack",
                alternateName: "OHack",
                url: "https://ohack.dev",
                logo: {
                  "@type": "ImageObject",
                  url: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
                  width: 512,
                  height: 512,
                },
                description:
                  "A global community building tech solutions for nonprofits",
                foundingDate: "2013",
                sameAs: [
                  "https://twitter.com/opportunityhack",
                  "https://linkedin.com/company/opportunity-hack",
                  "https://github.com/opportunity-hack",
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  email: "hi@ohack.org",
                },
                memberOf: {
                  "@type": "ProgramMembership",
                  programName: "Tech for Good Community",
                  hostingOrganization: {
                    "@type": "Organization",
                    name: "Opportunity Hack",
                  },
                },
              },
              potentialAction: {
                "@type": "JoinAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: seoMetadata.canonicalUrl,
                  actionPlatform: [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform",
                  ],
                },
                name: "Join Opportunity Hack Community",
              },
            }),
          }}
        />

        <Container maxWidth="md">
          <Box sx={{ mt: 8, py: 4 }}>
            <Typography
              variant="h1"
              component="h1"
              align="center"
              gutterBottom
              sx={{ fontSize: "2.5rem" }}
            >
              Join Opportunity Hack
            </Typography>

            <Typography
              variant="h2"
              component="h2"
              align="center"
              color="text.secondary"
              sx={{ mb: 4, fontSize: "1.5rem", fontWeight: 400 }}
            >
              Connect with our community to start making a difference through
              technology
            </Typography>

            <LoginOrRegister
              introText="Ready to use your skills for social good? Join our community of developers, designers, and changemakers."
              previousPage={previousPage}
            />
          </Box>
        </Container>
      </>
    );
}

// Server-side props for SEO metadata generation
export async function getServerSideProps(context) {
    try {
        // Extract and validate query parameters for context
        const { previousPage } = context.query;
        
        // Generate dynamic SEO metadata with defaults
        const seoMetadata = {
            title: "Join Opportunity Hack | Tech for Good Community Signup",
            description: "Join Opportunity Hack's global community of developers, designers, and changemakers. Use your skills to build technology solutions for nonprofits and create lasting social impact.",
            keywords: "opportunity hack signup, tech for good, nonprofit technology, developer community, social impact, volunteer programming, hackathon registration, join tech community",
            canonicalUrl: "https://ohack.dev/signup2",
            imageUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
        };

        // Safely customize metadata based on previous page context
        if (previousPage && typeof previousPage === 'string') {
            // Security: Validate previousPage parameter to prevent injection attacks
            const sanitizedPreviousPage = previousPage.toLowerCase().replace(/[^a-z0-9\-\/]/g, '');
            
            if (sanitizedPreviousPage.includes('hack') || sanitizedPreviousPage.includes('hackathon')) {
                seoMetadata.title = "Join Opportunity Hack | Hackathon Community Signup";
                seoMetadata.description = "Sign up to participate in our tech for good hackathons. Join developers building innovative solutions for nonprofits and making real social impact.";
                seoMetadata.keywords += ", hackathon participation, hackathon signup, coding for nonprofits";
            } else if (sanitizedPreviousPage.includes('mentor')) {
                seoMetadata.title = "Join Opportunity Hack | Mentor Community Signup";
                seoMetadata.description = "Sign up to become a mentor at Opportunity Hack. Guide development teams building tech solutions for nonprofits and share your expertise for social good.";
                seoMetadata.keywords += ", mentoring, tech mentorship, volunteer mentor";
            } else if (sanitizedPreviousPage.includes('judge')) {
                seoMetadata.title = "Join Opportunity Hack | Judge Community Signup";
                seoMetadata.description = "Sign up to become a judge at Opportunity Hack. Evaluate innovative tech solutions for nonprofits and help select projects with the greatest impact potential.";
                seoMetadata.keywords += ", judging, project evaluation, tech evaluation";
            } else if (sanitizedPreviousPage.includes('volunteer')) {
                seoMetadata.title = "Join Opportunity Hack | Volunteer Community Signup";
                seoMetadata.description = "Sign up to volunteer with Opportunity Hack. Support our tech for good events and help teams building solutions for nonprofits succeed.";
                seoMetadata.keywords += ", volunteering, event support, community volunteering";
            } else if (sanitizedPreviousPage.includes('sponsor')) {
                seoMetadata.title = "Join Opportunity Hack | Sponsor Community Signup";
                seoMetadata.description = "Sign up to learn about sponsoring Opportunity Hack. Partner with us to support innovation in the nonprofit technology sector.";
                seoMetadata.keywords += ", sponsorship, corporate partnership, tech for good sponsorship";
            }
        }

        return {
            props: {
                seoMetadata
            }
        };
    } catch (error) {
        // Error handling: Log the error and return default metadata
        console.error('Error in getServerSideProps for signup2:', error);
        
        return {
            props: {
                seoMetadata: {
                    title: "Join Opportunity Hack | Tech for Good Community Signup",
                    description: "Join Opportunity Hack's global community of developers, designers, and changemakers. Use your skills to build technology solutions for nonprofits and create lasting social impact.",
                    keywords: "opportunity hack signup, tech for good, nonprofit technology, developer community, social impact, volunteer programming, hackathon registration, join tech community",
                    canonicalUrl: "https://ohack.dev/signup2",
                    imageUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
                }
            }
        };
    }
}
