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
          <link rel="canonical" href={`https://ohack.dev/blog/${blog_id}`} />
          <script type="application/ld+json">
            {`
                    {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": "${title.replace("News: ", "")}",
                        "image": "${openGraphData?.find((og) => og.property === "og:image")?.content || ""}",
                        "datePublished": "${blogData?.slack_ts_human_readable || new Date().toISOString()}",
                        "dateModified": "${blogData?.slack_ts_human_readable || new Date().toISOString()}",
                        "description": "${openGraphData?.find((og) => og.property === "og:description")?.content || ""}",
                        "url": "https://ohack.dev/blog/${blog_id}",
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
                            "@id": "https://ohack.dev/blog/${blog_id}"
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
        const title = "OHack Blog: " + blogPost.title; // Improved title format
        const metaDescription = blogPost.description ? 
            (blogPost.description.length > 160 ? 
                blogPost.description.substring(0, 157) + '...' : 
                blogPost.description) : 
            'Read the latest insights from Opportunity Hack, where tech volunteers create solutions for nonprofits.';
        const image =
          blogPost.image ||
          "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";
        
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
        
        const keywords = extractKeywords(blogPost.description + ' ' + blogPost.title);

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
                        content: `https://ohack.dev/blog/${params.blog_id}`,
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
                        content: blogPost.slack_ts_human_readable || new Date().toISOString(),
                        key: 'articlepublished',
                    },
                    {
                        property: 'article:author',
                        content: 'Opportunity Hack',
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