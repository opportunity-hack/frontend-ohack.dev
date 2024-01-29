import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';


const SingleBlogPost = dynamic(() => import('../../components/Blog/SingleBlogPost'), {
    ssr: false
});

export default function NonProfitProfile() {
    const router = useRouter();
    const { blog_id } = router.query;
  
    return (
        <SingleBlogPost
          blog_id={blog_id}
        />
    );
}

export async function getStaticPaths(blog_id) {

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=1000`
    );
    const data = await res.json();
    
    const newsList = data.text;

    
    const paths = newsList.map((news) => ({
        params: { blog_id: news.id },
    }))

    return {
        paths: paths,
        fallback: true
    }
}

export const getStaticProps = async ({ params = {} } = {}) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news/${params.blog_id}`
    );
    const data = await res.json();
    

    var title = "News: " + data.text.title;
    var metaDescription = data.text.description;
    var image = data.text.image || 'https://i.imgur.com/Ff801O6.png';
    

    return {
        props: {
            title: title,
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
                    property: 'og:type',
                    content: 'website',
                    key: 'website',
                },
                {
                    property: 'og:image',
                    content: image,
                    key: 'ogimage',
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
            ],
        },
    };
};