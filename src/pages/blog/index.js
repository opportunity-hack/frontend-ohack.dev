import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from 'react';
import * as ga from '../../lib/ga';
import ScrollTracker from '../../components/ScrollTracker';
import { serializeJsonLd } from '../../lib/jsonLd';

const Blog = dynamic(
    () => import("../../components/Blog/BlogPage"),
    {
        ssr: true, // Enable SSR for better indexing
    }
);

const BLOG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Opportunity Hack Blog",
  "description": "Technology insights, success stories, and updates from Opportunity Hack's mission to create tech solutions for nonprofits.",
  "url": "https://www.ohack.dev/blog",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.ohack.dev/blog"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Opportunity Hack",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
    }
  }
};

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
          <title>OHack Blog - Tech for Social Good | Opportunity Hack</title>
          <meta
            name="description"
            content="Read the latest updates, success stories, and tech insights from Opportunity Hack. Learn how our volunteer developers build technology solutions for nonprofits and social good."
          />
          <meta
            name="keywords"
            content="opportunity hack blog, tech for nonprofits, coding for good, social impact technology, nonprofit tech solutions, volunteer tech projects, tech volunteering, social good coding"
          />
          <link rel="canonical" href="https://www.ohack.dev/blog" />
          <meta
            property="og:title"
            content="OHack Blog - Tech for Social Good | Opportunity Hack"
          />
          <meta
            property="og:description"
            content="Read the latest updates, success stories, and tech insights from Opportunity Hack. Learn how our volunteer developers build technology solutions for nonprofits."
          />
          <meta
            property="og:image"
            content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
          />
          <meta property="og:url" content="https://www.ohack.dev/blog" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@opportunityhack" />
          <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(BLOG_JSON_LD) }}
        />
        </Head>
        <ScrollTracker pageType="blog_listing" />
        <Blog posts={posts} />
      </>
    );
}

// Generate static props for SEO optimization
export async function getStaticProps() {
    try {
        // Builds at deploy time: MUST NEVER THROW. A non-2xx goes to the catch
        // below (empty list, retry in 60s) instead of caching [] for an hour.
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50`,
            { signal: AbortSignal.timeout(15000) }
        );
        if (!res.ok) throw new Error(`Upstream ${res.status} for /api/messages/news`);
        const data = await res.json();
        if (!Array.isArray(data?.text)) throw new Error("news payload missing text[]");
        
        return {
            props: {
                posts: data.text,
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
