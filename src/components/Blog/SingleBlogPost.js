import React, { useEffect, useState } from 'react';
import { TitleContainer, LayoutContainer } from '../../styles/nonprofit/styles';
import Head from 'next/head';
import { Typography } from '@mui/material';
import SingleNews from '../News/SingleNews';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';

const SingleBlogPage = ({blog_id}) => {
    const [newsData, setNewsData] = useState();
    
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news/${blog_id}`)
            .then(response => response.json())
            .then(data => setNewsData(data.text || null))
            .catch(error => console.error(error));
    }, [blog_id]);

    return (
        <LayoutContainer key="blog" container>
            <Head>
                <title>Opportunity Hack - Blog: {newsData?.title}</title>
                <meta property="og:title" content="Opportunity Hack - Blog: {newsData?.title}" />                                               
            </Head>
            

            {newsData && <SingleNews newsItem={newsData} />
            }

        </LayoutContainer>
    );
};

export default SingleBlogPage;
