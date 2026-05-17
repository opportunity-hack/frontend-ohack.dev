import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import * as ga from '../../lib/ga';
import ScrollTracker from '../../components/ScrollTracker';

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

    const canonicalUrl = blogData?.seo?.canonical || `https://ohack.dev/blog/${blog_id}`;
    const datePublished = blogData?.published_at || blogData?.slack_ts_human_readable || new Date().toISOString();
    const dateModified = blogData?.last_updated || datePublished;
    const ogImage = openGraphData?.find((og) => og.property === "og:image")?.content || "";
    const ogDescription = openGraphData?.find((og) => og.property === "og:description")?.content || "";
    const safeHeadline = String(title).replace("News: ", "").replace(/"/g, '\\"');
    const safeDescription = String(ogDescription).replace(/"/g, '\\"');
    const authorBlock = blogData?.author?.name
      ? `, "author": { "@type": "Person", "name": "${String(blogData.author.name).replace(/"/g, '\\"')}" }`
      : '';

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
          <script type="application/ld+json">
            {`
                    {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": "${safeHeadline}",
                        "image": "${ogImage}",
                        "datePublished": "${datePublished}",
                        "dateModified": "${dateModified}",
                        "description": "${safeDescription}",
                        "url": "${canonicalUrl}"${authorBlock},
                        "publisher": {
                            "@type": "Organization",
                            "name": "Opportunity Hack",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
                            }
                        },
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": "${canonicalUrl}"
                        }
                    }
                    `}
          </script>
        </Head>

        <ScrollTracker pageType="blog_post" contentId={blog_id} />

        <SingleBlogPost blog_id={blog_id} initialData={blogData} />
      </>
    );
}

export async function getStaticPaths() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50` // Reduced to 50 most recent for better build performance
        );
        const data = await res.json();
        
        if (!data || !data.text) {
            return {
                paths: [],
                fallback: true
            };
        }
        
        const newsList = data.text;
        
        const paths = newsList.map((news) => ({
            params: { blog_id: news.id },
        }));

        return {
            paths: paths,
            fallback: true
        };
    } catch (error) {
        console.error("Failed to fetch blog posts for static paths:", error);
        return {
            paths: [],
            fallback: true
        };
    }
}

export const getStaticProps = async ({ params = {} } = {}) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news/${params.blog_id}`
        );
        
        if (!res.ok) {
            throw new Error(`Failed to fetch blog post ${params.blog_id}: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Check if we got valid data
        if (!data || !data.text) {
            return {
                notFound: true // This will show the 404 page
            };
        }

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
        const canonicalUrl = seo.canonical || `https://ohack.dev/blog/${params.blog_id}`;
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
    } catch (error) {
        console.error(`Failed to fetch blog post:`, error);
        return {
            notFound: true
        };
    }
};