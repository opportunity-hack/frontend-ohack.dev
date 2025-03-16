import React, { useEffect, useState } from 'react';
import { TitleContainer, LayoutContainer } from '../../styles/nonprofit/styles';
import { Typography, Box, Chip, TextField, InputAdornment, Grid, Divider, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import News from '../News/News';
import * as ga from '../../lib/ga';
import { styled } from '@mui/material/styles';

// Styled components for better visual design
const BlogHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4, 0),
  backgroundImage: 'linear-gradient(120deg, #093170 0%, #0a4da8 100%)',
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const BlogPage = ({ posts }) => {
    const [newsData, setNewsData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Extract all unique tags from blog posts
    const getAllTags = (data) => {
        if (!data) return [];
        
        const tagsSet = new Set();
        data.forEach(post => {
            // Extract hashtags from the description
            const hashtagRegex = /#(\w+)/g;
            const matches = post.description?.match(hashtagRegex) || [];
            
            matches.forEach(tag => {
                tagsSet.add(tag.substring(1)); // Remove the # character
            });
            
            // Also include any Slack channels as tags
            post.links?.forEach(link => {
                if (link.url.startsWith('#')) {
                    tagsSet.add(link.name);
                }
            });
        });
        
        return Array.from(tagsSet);
    };

    useEffect(() => {
        // Use posts from props if available (for SSR/ISR) or fetch if not
        if (posts && posts.length > 0) {
            setNewsData(posts);
            setFilteredData(posts);
            setLoading(false);
        } else {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50`)
                .then(response => response.json())
                .then(data => {
                    const postsData = data.text || [];
                    setNewsData(postsData);
                    setFilteredData(postsData);
                    setLoading(false);
                })
                .catch(error => {
                    console.error(error);
                    setLoading(false);
                });
        }
    }, [posts]);

    useEffect(() => {
        // Filter data based on search term and selected tag
        if (newsData) {
            let filtered = [...newsData];
            
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(post => 
                    post.title?.toLowerCase().includes(term) || 
                    post.description?.toLowerCase().includes(term)
                );
                
                // Track search event
                ga.trackStructuredEvent(
                    ga.EventCategory.CONTENT,
                    'search',
                    'blog_content',
                    null,
                    { search_term: searchTerm }
                );
            }
            
            if (selectedTag) {
                filtered = filtered.filter(post => {
                    // Check description for hashtags
                    const hasTagInDescription = post.description?.toLowerCase().includes(`#${selectedTag.toLowerCase()}`);
                    
                    // Check if any Slack channel matches the tag
                    const hasTagInLinks = post.links?.some(link => 
                        link.url.startsWith('#') && link.name.toLowerCase() === selectedTag.toLowerCase()
                    );
                    
                    return hasTagInDescription || hasTagInLinks;
                });
                
                // Track tag selection event
                ga.trackStructuredEvent(
                    ga.EventCategory.CONTENT,
                    'filter',
                    'blog_tag',
                    null,
                    { selected_tag: selectedTag }
                );
            }
            
            setFilteredData(filtered);
        }
    }, [searchTerm, selectedTag, newsData]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    
    const handleTagClick = (tag) => {
        setSelectedTag(tag === selectedTag ? '' : tag);
    };
    
    const tags = getAllTags(newsData);

    return (
        <LayoutContainer key="blog" container>
            <BlogHeader>
                <Box textAlign="center">
                    <Typography variant="h2" component="h1" gutterBottom>
                        Opportunity Hack Blog
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Technology insights and stories from our community
                    </Typography>
                </Box>
            </BlogHeader>

            <SearchContainer elevation={1}>
                <TextField
                    fullWidth
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={handleSearch}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />
                
                <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                    {tags.map(tag => (
                        <Chip
                            key={tag}
                            label={`#${tag}`}
                            clickable
                            color={selectedTag === tag ? "primary" : "default"}
                            onClick={() => handleTagClick(tag)}
                        />
                    ))}
                </Box>
            </SearchContainer>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        {selectedTag ? `Posts tagged with #${selectedTag}` : 
                         searchTerm ? `Search results for "${searchTerm}"` : 
                         "Latest Updates"}
                    </Typography>
                    
                    {filteredData?.length === 0 && !loading && (
                        <Box py={4} textAlign="center">
                            <Typography variant="h6">
                                No blog posts found matching your criteria.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTag('');
                                }}
                                sx={{ mt: 2 }}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    )}
                    
                    <News newsData={filteredData} loading={loading} />
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <Box position="sticky" top={20}>
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h5" component="h3" gutterBottom>
                                About Our Blog
                            </Typography>
                            <Typography paragraph>
                                Our blog features AI-summarized content from the Opportunity Hack community Slack.
                                Discover valuable insights, project updates, and success stories from our volunteers.
                            </Typography>
                            <Button 
                                variant="outlined" 
                                href="https://github.com/opportunity-hack/ohack-slack-bot" 
                                target="_blank"
                                startIcon={<GitHubIcon />}
                                fullWidth
                                onClick={() => {
                                    ga.trackStructuredEvent(
                                        ga.EventCategory.NAVIGATION,
                                        ga.EventAction.CLICK,
                                        'github_code_link'
                                    );
                                }}
                            >
                                View Blog Code
                            </Button>
                        </Paper>
                        
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h5" component="h3" gutterBottom>
                                Get Involved
                            </Typography>
                            <Typography paragraph>
                                Join our Slack community to contribute to the conversation and be featured in our blog.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                href="https://opportunity-hack.slack.com/join/shared_invite/zt-n9qhf65h-eZYbdnrFAfeAiY1yjsYJsg" 
                                target="_blank"
                                fullWidth
                                onClick={() => {
                                    ga.trackStructuredEvent(
                                        ga.EventCategory.CONVERSION,
                                        ga.EventAction.CLICK,
                                        'join_slack'
                                    );
                                }}
                            >
                                Join Slack
                            </Button>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Button 
                                variant="outlined"
                                startIcon={<RssFeedIcon />}
                                fullWidth
                                href="/api/rss"
                                onClick={() => {
                                    ga.trackStructuredEvent(
                                        ga.EventCategory.CONTENT,
                                        ga.EventAction.DOWNLOAD,
                                        'rss_feed'
                                    );
                                }}
                            >
                                Subscribe via RSS
                            </Button>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </LayoutContainer>
    );
};

export default BlogPage;
