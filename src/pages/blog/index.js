import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from 'react';
import * as ga from '../../lib/ga';
import ScrollTracker from '../../components/ScrollTracker';

const Blog = dynamic(
    () => import("../../components/Blog/BlogPage"),
    {
        ssr: true, // Enable SSR for better indexing
    }
);

export default function BlogIndexPage({ posts }) {
    useEffect(() => {
        // Track page view with enhanced metadata
        const pageMetadata = {
            page_type: 'content_listing',
            content_section: 'blog',
            has_interactive_elements: true
        };

        // Track this page view as part of the content engagement journey
        ga.trackJourneyStep(
            'content_engagement',
            'view_blog_listing',
            pageMetadata
        );

        // Track as content engagement
        ga.trackContentEngagement(
            'blog',
            'listing_page',
            ga.EventAction.VIEW,
            { entry_source: document.referrer || 'direct' }
        );
    }, []);

    return (
      <>
        <Head>
          <title>O-Hack Blog - Tech for Social Good | Opportunity Hack</title>
          <meta
            name="description"
            content="Read the latest updates, success stories, and tech insights from Opportunity Hack. Learn how our volunteer developers build technology solutions for nonprofits and social good."
          />
          <meta
            name="keywords"
            content="opportunity hack blog, tech for nonprofits, coding for good, social impact technology, nonprofit tech solutions, volunteer tech projects, tech volunteering, social good coding"
          />
          <link rel="canonical" href="https://ohack.dev/blog" />
          <meta
            property="og:title"
            content="O-Hack Blog - Tech for Social Good | Opportunity Hack"
          />
          <meta
            property="og:description"
            content="Read the latest updates, success stories, and tech insights from Opportunity Hack. Learn how our volunteer developers build technology solutions for nonprofits."
          />
          <meta
            property="og:image"
            content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
          />
          <meta property="og:url" content="https://ohack.dev/blog" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@opportunityhack" />
          <script type="application/ld+json">
            {`
                    {
                        "@context": "https://schema.org",
                        "@type": "Blog",
                        "name": "Opportunity Hack Blog",
                        "description": "Technology insights, success stories, and updates from Opportunity Hack's mission to create tech solutions for nonprofits.",
                        "url": "https://ohack.dev/blog",
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": "https://ohack.dev/blog"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Opportunity Hack",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
                            }
                        }
                    }
                    `}
          </script>
        </Head>
        <ScrollTracker pageType="blog_listing" />
        <Blog posts={posts} />
      </>
    );
}

// Generate static props for SEO optimization
export async function getStaticProps() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50`);
        const data = await res.json();
        
        return {
            props: {
                posts: data.text || [],
            },
            // Re-generate at most once per hour
            revalidate: 3600,
        };
    } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        return {
            props: {
                posts: [],
            },
            revalidate: 60, // Try again sooner if there was an error
        };
    }
}
