import dynamic from 'next/dynamic';
import Head from 'next/head';

const NonProfitApply = dynamic(() =>  import('../../../components/NonProfitApply/NonProfitApply'), {
    ssr: false
});



export default function Apply() {
    

    return (     
        <NonProfitApply/>     
    );
}

export const getStaticProps = async () => {
    //const data = await fetch('/api/metadata');
    //const metadata = await data.json();
 

    return {
        props: {
            title: "Nonprofit Application for Opportunity Hack 2023",
            description: "Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem.",
            openGraphData: [
                {
                    name: "title",
                    content: "Nonprofit Application for Opportunity Hack 2023",
                    key: "title"
                },
                {
                    name: "image",
                    content: "https://i.imgur.com/hE3wm7M.png",
                    key: "image"
                },
                {
                    name: "url",
                    content: "https://www.ohack.org/nonprofits/apply",
                    key: "url"},
                {
                    name: "twitter:card",
                    content: "summary_large_image",
                    key: "twittercard"
                }                
            ]
        },
    };
};