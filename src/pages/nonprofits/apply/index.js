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
                    name: "og:title",
                    content: "Nonprofit Application for Opportunity Hack 2023!",
                    key: "ogtitle"
                },
                {
                    name: "og:description",
                    content: "Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem!",
                    key: "ogdescription"
                },
                {
                    name: "image",
                    content: "https://i.imgur.com/hE3wm7M.png",
                    key: "image"
                },
                {
                    name: "og:image",
                    content: "https://i.imgur.com/hE3wm7M.png",
                    key: "ogimage"
                },
                {
                    name: "url",
                    content: "https://www.ohack.org/nonprofits/apply",
                    key: "url"
                },
                {
                    name: "twitter:card",
                    content: "summary_large_image",
                    key: "twittercard"
                },
                {
                    name: "twitter:site",
                    content: "@opportunityhack",
                    key: "twittersite"
                },
                {
                    name: "twitter:title",
                    content: "Nonprofit Application for Opportunity Hack 2023",
                    key: "twittertitle"
                },
                {
                    name: "twitter:description",
                    content: "Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem.",
                    key: "twitterdesc"
                },
                {
                    name: "twitter:image",
                    content: "https://i.imgur.com/hE3wm7M.png",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    content: "Opportunity Hack logo for nonprofit applications",
                    key: "twitterimagealt"
                },
                {
                    name: "twitter:creator",
                    content: "@opportunityhack",
                    key: "twittercreator"
                },
                {
                    name: "twitter:label1",
                    value: "Status",
                    key: "twitterlabel1"
                },
                {
                    name: "twitter:data1",
                    value: "Accepting Applications",
                    key: "twitterdata1"
                },
                {
                    name: "twitter:label2",
                    value: "Application Deadline",
                    key: "twitterlabel2"
                },
                {
                    name: "twitter:data2",
                    value: "August 1, 2023",
                    key: "twitterdata2"
                }                
            ]
        },
    };
};