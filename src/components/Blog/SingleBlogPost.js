import React, { useEffect, useState } from 'react';
import { TitleContainer, LayoutContainer } from '../../styles/nonprofit/styles';
import { Box, Typography, Breadcrumbs, Chip, Button, Skeleton } from '@mui/material';
import Link from 'next/link';
import SingleNews from '../News/SingleNews';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import * as ga from '../../lib/ga';
import { styled } from '@mui/material/styles';

const RelatedPostsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const SingleBlogPage = ({ blog_id, initialData }) => {
    const [newsData, setNewsData] = useState(initialData);
    const [loading, setLoading] = useState(!initialData);
    const [relatedPosts, setRelatedPosts] = useState([]);
    
    // Extract tags from blog post content
    const extractTags = (post) => {
        if (!post?.description) return [];
        
        // Extract hashtags from description
        const hashtagRegex = /#(\w+)/g;
        const matches = post.description.match(hashtagRegex) || [];
        const hashtags = matches.map(tag => tag.substring(1));
        
        // Add Slack channels as tags
        const channelTags = post.links?.filter(link => link.url.startsWith('#'))
            .map(link => link.name) || [];
            
        // Combine unique tags
        return [...new Set([...hashtags, ...channelTags])];
    };
    
    useEffect(() => {
        // If no initial data, fetch the blog post
        if (!initialData && blog_id) {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news/${blog_id}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.text) {
                        setNewsData(data.text);
                        
                        // Track successful content load
                        ga.trackContentEngagement(
                            'blog_post',
                            blog_id,
                            'load_success',
                            { title: data.text.title }
                        );
                    }
                })
                .catch(error => {
                    console.error(error);
                    // Track error loading content
                    ga.trackError(
                        'content_load_error',
                        error.message,
                        `blog_post_${blog_id}`
                    );
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [blog_id, initialData]);
    
    // Fetch related posts once we have the main post data
    useEffect(() => {
        if (newsData) {
            const tags = extractTags(newsData);
            
            if (tags.length > 0) {
                // Track which tags were found
                ga.trackStructuredEvent(
                    ga.EventCategory.CONTENT,
                    'content_tags',
                    'blog_post',
                    tags.length,
                    { tags: tags.join(',') }
                );
                
                // Fetch related posts (if more than threshold tags)
                if (tags.length > 0) {
                    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=6`)
                        .then(response => response.json())
                        .then(data => {
                            if (data && data.text) {
                                // Filter for related posts by matching tags
                                const related = data.text
                                    .filter(post => post.id !== blog_id) // Exclude current post
                                    .filter(post => {
                                        const postTags = extractTags(post);
                                        // Check if any tags match
                                        return tags.some(tag => postTags.includes(tag));
                                    })
                                    .slice(0, 3); // Take top 3 related posts
                                
                                setRelatedPosts(related);
                                
                                if (related.length > 0) {
                                    // Track related posts found
                                    ga.trackStructuredEvent(
                                        ga.EventCategory.CONTENT,
                                        'related_content',
                                        'blog_post',
                                        related.length
                                    );
                                }
                            }
                        })
                        .catch(error => console.error(error));
                }
            }
        }
    }, [newsData, blog_id]);
    
    // Handle tag click for related content navigation
    const handleTagClick = (tag) => {
        ga.trackStructuredEvent(
            ga.EventCategory.NAVIGATION,
            ga.EventAction.CLICK,
            'content_tag',
            null,
            { tag: tag }
        );
    };
    
    // Handle click on related post
    const handleRelatedPostClick = (postId, postTitle) => {
        ga.trackStructuredEvent(
            ga.EventCategory.NAVIGATION,
            ga.EventAction.CLICK,
            'related_post',
            null,
            { 
                source_post_id: blog_id,
                target_post_id: postId,
                target_post_title: postTitle
            }
        );
    };

    return (
        <LayoutContainer key="blog" container>
            {/* Breadcrumb navigation for better UX and SEO */}
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="blog post navigation"
                sx={{ mb: 3 }}
            >
                <Link href="/" passHref>
                    <Typography 
                        color="text.primary" 
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Home
                    </Typography>
                </Link>
                <Link href="/blog" passHref>
                    <Typography 
                        color="text.primary" 
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Blog
                    </Typography>
                </Link>
                <Typography color="text.secondary">
                    {loading ? 'Loading...' : (newsData?.title || 'Blog Post')}
                </Typography>
            </Breadcrumbs>

            {loading ? (
                <Box sx={{ width: '100%' }}>
                    <Skeleton height={60} width="80%" />
                    <Skeleton height={40} width="60%" />
                    <Skeleton height={400} />
                </Box>
            ) : newsData ? (
                <>
                    <SingleNews newsItem={newsData} />
                    
                    {/* Display tags for the post */}
                    {extractTags(newsData).length > 0 && (
                        <Box mt={3}>
                            <Typography variant="subtitle1" gutterBottom>
                                Tags:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {extractTags(newsData).map(tag => (
                                    <Link 
                                        key={tag} 
                                        href={`/blog?tag=${tag}`} 
                                        passHref
                                        onClick={() => handleTagClick(tag)}
                                    >
                                        <Chip
                                            label={`#${tag}`}
                                            clickable
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Link>
                                ))}
                            </Box>
                        </Box>
                    )}
                    
                    {/* Related posts section */}
                    {relatedPosts.length > 0 && (
                        <RelatedPostsContainer>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Related Posts
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {relatedPosts.map(post => (
                                    <Box key={post.id} p={2} sx={{ 
                                        borderLeft: '3px solid',
                                        borderColor: 'primary.main',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}>
                                        <Link 
                                            href={`/blog/${post.id}`}
                                            passHref
                                            onClick={() => handleRelatedPostClick(post.id, post.title)}
                                        >
                                            <Typography 
                                                variant="h6" 
                                                component="h3"
                                                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                            >
                                                {post.title}
                                            </Typography>
                                        </Link>
                                        <Typography variant="body2" color="text.secondary">
                                            {post.slack_ts_human_readable}
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            mt: 1
                                        }}>
                                            {post.description}
                                        </Typography>
                                    </Box>
                                ))}
                                
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    component={Link} 
                                    href="/blog"
                                    onClick={() => {
                                        ga.trackStructuredEvent(
                                            ga.EventCategory.NAVIGATION,
                                            ga.EventAction.CLICK,
                                            'view_all_blog_posts'
                                        );
                                    }}
                                >
                                    View All Blog Posts
                                </Button>
                            </Box>
                        </RelatedPostsContainer>
                    )}
                </>
            ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        Blog post not found
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        component={Link} 
                        href="/blog"
                        sx={{ mt: 2 }}
                    >
                        Return to Blog
                    </Button>
                </Box>
            )}
        </LayoutContainer>
    );
};

export default SingleBlogPage;
