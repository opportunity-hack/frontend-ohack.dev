import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Container, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

const PraiseCard = dynamic(() => import('../../components/Praise/PraiseCard'), {
    ssr: true
});

export default function PraiseDetailPage({ title, openGraphData, praiseData }) {
    const router = useRouter();
    const { id } = router.query;

    // Show loading state for fallback pages
    if (router.isFallback) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
            }}>
                <p>Loading praise...</p>
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
                <link rel="canonical" href={`https://ohack.dev/praise/${id}`} />
            </Head>

            <Container maxWidth="sm" sx={{ py: 6 }}>
                <Box sx={{ mb: 3 }}>
                    <Link href="/praise" passHref legacyBehavior>
                        <Button
                            component="a"
                            startIcon={<ArrowBack />}
                            sx={{ textTransform: 'none' }}
                        >
                            Back to Praise Board
                        </Button>
                    </Link>
                </Box>

                {praiseData ? (
                    <PraiseCard praise={praiseData} />
                ) : (
                    <Typography variant="h6" align="center" color="text.secondary">
                        Praise not found.
                    </Typography>
                )}
            </Container>
        </>
    );
}

export async function getStaticPaths() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/praises`
        );
        const data = await res.json();

        if (!data || !data.text) {
            return {
                paths: [],
                fallback: true
            };
        }

        const paths = data.text.map((praise) => ({
            params: { id: praise.id },
        }));

        return {
            paths,
            fallback: true
        };
    } catch (error) {
        console.error("Failed to fetch praises for static paths:", error);
        return {
            paths: [],
            fallback: true
        };
    }
}

export const getStaticProps = async ({ params = {} } = {}) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/praises`
        );

        if (!res.ok) {
            throw new Error(`Failed to fetch praises: ${res.status}`);
        }

        const data = await res.json();
        const praises = data.text || [];
        const praise = praises.find((p) => p.id === params.id);

        if (!praise) {
            return { notFound: true };
        }

        const senderName = praise.praise_sender_details?.real_name || 'Someone';
        const receiverName = praise.praise_receiver_details?.real_name || 'a teammate';
        const title = `${senderName} praised ${receiverName} | Opportunity Hack`;

        const description = praise.praise_message
            ? (praise.praise_message.length > 160
                ? praise.praise_message.substring(0, 157) + '...'
                : praise.praise_message)
            : 'See this praise on the Opportunity Hack community board.';

        const image = praise.praise_gif || 'https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp';

        return {
            props: {
                title,
                praiseData: praise,
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
                        content: description,
                        key: 'desc',
                    },
                    {
                        property: 'og:description',
                        content: description,
                        key: 'ogdesc',
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
                        content: `https://ohack.dev/praise/${params.id}`,
                        key: 'ogurl',
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
                        content: description,
                        key: 'twitterdesc',
                    },
                    {
                        property: 'twitter:image',
                        content: image,
                        key: 'twitterimage',
                    },
                ],
            },
            revalidate: 3600, // Re-generate at most once per hour
        };
    } catch (error) {
        console.error('Failed to fetch praise:', error);
        return { notFound: true };
    }
};
