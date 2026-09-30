import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import * as ga from '../../lib/ga';
import ScrollTracker from '../../components/ScrollTracker';
import { serializeJsonLd } from '../../lib/jsonLd';
import { buildBlogPostingJsonLd } from '../../lib/blogJsonLd';
import { fetchForStaticProps, NOT_FOUND_REVALIDATE } from '../../lib/ssgFetch';

const SingleBlogPost = dynamic(() => import('../../components/Blog/SingleBlogPost'), {
    ssr: true // Enable SSR for better indexing
});

export default function BlogPostPage({ title, openGraphData, blogData }) {
    const router = useRouter();
    const { blog_id } = router.query;
  
    useEffect(() => {
        if (blog_id) {
            // Track page view with enhanced metadata
            const pageMetadata = {
                page_type: 'content_detail',
                content_section: 'blog',
                content_id: blog_id,
                content_title: title,
                referrer: document.referrer || 'direct'
            };
    
            // Track this page view as part of the content engagement journey
            ga.trackJourneyStep(
                'content_engagement',
                'view_blog_post',
                pageMetadata
            );
    
            // Track as content engagement
            ga.trackContentEngagement(
                'blog_post',
                blog_id,
                ga.EventAction.VIEW,
                { 
                    entry_source: document.referrer || 'direct',
                    post_title: title
                }
            );

            // Set reading timer to track engagement time
            const startTime = new Date();
            const timer = setTimeout(() => {
                const readTime = Math.round((new Date() - startTime) / 1000);
                if (readTime > 10) { // Only track meaningful reads (>10 seconds)
                    ga.trackContentEngagement(
                        'blog_post',
                        blog_id,
                        'read',
                        { read_time_seconds: readTime }
                    );
                }
            }, 30000); // Check after 30 seconds
            
            return () => clearTimeout(timer);
        }
    }, [blog_id, title]);

    // Show loading state
    if (router.isFallback) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh' 
            }}>
                <p>Loading blog post...</p>
            </div>
        );
    }

    const canonicalUrl = blogData?.seo?.canonical || `https://www.ohack.dev/blog/${blog_id}`;
    const ogImage = openGraphData?.find((og) => og.property === "og:image")?.content || "";
    const ogDescription = openGraphData?.find((og) => og.property === "og:description")?.content || "";
    const blogPostingJsonLd = buildBlogPostingJsonLd(blogData, {
      canonicalUrl,
      ogImage,
      ogDescription,
      title,
    });

    return (
      <>
        <Head>
          <title>{title}</title>
          {openGraphData?.map((og) => (
            <meta
              key={og.key}
              name={og.name}
              property={og.property}
              content={og.content}
            />
          ))}
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonicalUrl} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingJsonLd) }}
          />
        </Head>

        <ScrollTracker pageType="blog_post" contentId={blog_id} />

        <SingleBlogPost blog_id={blog_id} initialData={blogData} />
      </>
    );
}

// No build-time prerender: enumerating posts here fired ~50 backend fetches
// per deploy, and a throw from getStaticProps during `next build` fails the
// whole Vercel build. "blocking" still serves full SSR HTML on first request;
// crawlers find posts via /server-sitemap.xml and the /blog list.
export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking'
    };
}

export const getStaticProps = async ({ params = {} } = {}) => {
    // 404 / empty payload ({} or {text: {}} — the backend's unknown/draft
    // answer) -> real 404, retried after 60s. NOTE: the single-post payload
    // has no `text.id` (only the list route adds it), so don't test for it.
    // Any other upstream failure THROWS so ISR keeps the last good copy.
    const result = await fetchForStaticProps(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news/${params.blog_id}`,
        {
            isEmpty: (d) =>
                !d?.text || typeof d.text !== 'object' || Object.keys(d.text).length === 0,
        }
    );
    if (result.kind === 'not_found') {
        return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
    }
    const data = result.data;

    const blogPost = data.text;
    const seo = blogPost.seo || {};
    const title = seo.title || ("OHack Blog: " + blogPost.title);
    const rawDescription = seo.description || blogPost.description;
    const metaDescription = rawDescription ?
        (rawDescription.length > 160 ?
            rawDescription.substring(0, 157) + '...' :
            rawDescription) :
        'Read the latest insights from Opportunity Hack, where tech volunteers create solutions for nonprofits.';
    const image =
      seo.og_image ||
      blogPost.featured_image ||
      blogPost.image ||
      "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";
    const canonicalUrl = seo.canonical || `https://www.ohack.dev/blog/${params.blog_id}`;
    const publishedTime = blogPost.published_at || blogPost.slack_ts_human_readable || new Date().toISOString();
    const authorName = blogPost.author?.name || 'Opportunity Hack';
    
    // Extract keywords from the blog post content
    const extractKeywords = (text) => {
        if (!text) return '';
        
        // Remove common words and keep meaningful phrases
        const words = text.toLowerCase()
            .replace(/[^\w\s#]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['this', 'that', 'with', 'from'].includes(word));
        
        // Extract hashtags
        const hashtags = text.match(/#\w+/g) || [];
        const hashtagWords = hashtags.map(tag => tag.substring(1));
        
        // Combine and remove duplicates
        const allWords = [...words, ...hashtagWords];
        const uniqueWords = [...new Set(allWords)];
        
        // Take top 8 keywords
        return uniqueWords.slice(0, 8).join(', ');
    };
    
    const seoKeywords = Array.isArray(seo.keywords) ? seo.keywords.join(', ') : (typeof seo.keywords === 'string' ? seo.keywords : '');
    const tagKeywords = Array.isArray(blogPost.tags) ? blogPost.tags.join(', ') : '';
    const keywords = seoKeywords || tagKeywords || extractKeywords((blogPost.description || '') + ' ' + (blogPost.title || ''));

    return {
        props: {
            title: title,
            blogData: blogPost,
            openGraphData: [
                {
                    name: 'title',
                    content: title,
                    key: 'title',
                },
                {
                    property: 'og:title',
                    content: title,
                    key: 'ogtitle',
                },
                {
                    name: 'description',
                    content: metaDescription,
                    key: 'desc',
                },
                {
                    property: 'og:description',
                    content: metaDescription,
                    key: 'ogdesc',
                },
                {
                    name: 'keywords',
                    content: keywords + ', opportunity hack, nonprofit tech, social good, tech volunteering',
                    key: 'keywords',
                },
                {
                    property: 'og:type',
                    content: 'article',
                    key: 'ogtype',
                },
                {
                    property: 'og:image',
                    content: image,
                    key: 'ogimage',
                },
                {
                    property: 'og:url',
                    content: canonicalUrl,
                    key: 'ogurl',
                },
                {
                    property: 'twitter:image',
                    content: image,
                    key: 'twitterimage',
                },
                {
                    property: 'og:site_name',
                    content: 'Opportunity Hack Developer Portal',
                    key: 'ogsitename',
                },
                {
                    property: 'twitter:card',
                    content: 'summary_large_image',
                    key: 'twittercard',
                },
                {
                    property: 'twitter:domain',
                    content: 'ohack.dev',
                    key: 'twitterdomain',
                },
                {
                    property: 'twitter:title',
                    content: title,
                    key: 'twittertitle',
                },
                {
                    property: 'twitter:description',
                    content: metaDescription,
                    key: 'twitterdesc',
                },
                {
                    property: 'article:published_time',
                    content: publishedTime,
                    key: 'articlepublished',
                },
                {
                    property: 'article:author',
                    content: authorName,
                    key: 'articleauthor',
                },
            ],
        },
        // Re-generate at most once per week for blog posts
        revalidate: 604800,
    };
};