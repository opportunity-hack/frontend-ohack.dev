import React, { useEffect, useState } from 'react';
import { TitleContainer, LayoutContainer } from '../../styles/nonprofit/styles';
import Head from 'next/head';
import { Typography } from '@mui/material';
import News from '../News/News';

const BlogPage = () => {
    const [newsData, setNewsData] = useState([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=50`)
            .then(response => response.json())
            .then(data => setNewsData(data.text || null))
            .catch(error => console.error(error));
    }, []);

    return (
        <LayoutContainer key="blog" container>
            <Head>
                <title>Opportunity Hack - Blog</title>
                <meta property="og:title" content="Opportunity Hack - Blog" />
                <meta
                    name="description"
                    content={`Read the latest news and updates from Opportunity Hack. Join us as we harness the power of code for social good.`}
                />
                <meta
                    name="keywords"
                    content="Opportunity Hack, social good, non-profit technology, tech volunteering, coding for good, social impact, inclusive society, sustainable change, effective altruism, blog"
                />
                <meta
                    name="og:description"
                    content={`Read the latest news and updates from Opportunity Hack. Join us as we harness the power of code for social good.`}
                />
                <meta property="og:image" content="https://i.imgur.com/pzcF1aj.jpg" />
                <meta property="og:url" content="https://ohack.dev/blog" />
            </Head>

            <TitleContainer container>
                <Typography variant="h2">
                    Blog
                </Typography>
            </TitleContainer>

            <News newsData={newsData} />

        </LayoutContainer>
    );
};

export default BlogPage;
