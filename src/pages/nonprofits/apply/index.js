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
                    property: "title",
                    content: "Nonprofit Application for Opportunity Hack 2023",
                    key: "title"
                },
                {
                    name: "og:title",
                    property: "og:title",
                    content: "Nonprofit Application for Opportunity Hack 2023!",
                    key: "ogtitle"
                },
                {
                    name: "author",
                    property: "author",
                    content: "Opportunity Hack",
                    key: "author"
                },
                {
                    name: "author",
                    property: "author",
                    content: "Opportunity Hack",
                    key: "author"
                },
                {
                    name: "publish_date",
                    property: "og:publish_date",
                    content: "2023-06-04T00:00:00-0700",
                    key: "publishdate"
                },
                {
                    name: "og:description",
                    property: "og:description",
                    content: "Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem!",
                    key: "ogdescription"
                },                                
                {
                    name: "image",
                    property: "og:image",
                    content: "https://ohack.dev/OHack_NonProfit_Application.png",
                    key: "ognameimage"
                },
                {
                    property: "og:image:width",
                    content: "400",
                    key: "ogimagewidth",
                },
                {
                    property: "og:image:height",
                    content: "300",
                    key: "ogimageheight",
                },
                {
                    name: "url",
                    property: "url",
                    content: "https://ohack.dev/nonprofits/apply",
                    key: "url"
                },
                {
                    name: "org:url",
                    property: "org:url",
                    content: "https://ohack.dev/nonprofits/apply",
                    key: "ogurl"
                },
                {
                    name: "twitter:card",
                    property: "twitter:card",
                    content: "summary_large_image",
                    key: "twittercard"
                },
                {
                    name: "twitter:site",
                    property: "twitter:site",
                    content: "@opportunityhack",
                    key: "twittersite"
                },
                {
                    name: "twitter:title",
                    property: "twitter:title",
                    content: "Nonprofit Application for Opportunity Hack 2023",
                    key: "twittertitle"
                },
                {
                    name: "twitter:description",
                    property: "twitter:description",
                    content: "Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem.",
                    key: "twitterdesc"
                },
                {
                    name: "twitter:image",
                    property: "twitter:image",
                    content: "https://i.imgur.com/hE3wm7M.png",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Opportunity Hack logo for nonprofit applications",
                    key: "twitterimagealt"
                },
                {
                    name: "twitter:creator",
                    property: "twitter:creator",
                    content: "@opportunityhack",
                    key: "twittercreator"
                },
                {
                    name: "twitter:label1",
                    property: "twitter:label1",
                    value: "Status",
                    key: "twitterlabel1"
                },
                {
                    name: "twitter:data1",
                    property: "twitter:data1",
                    value: "Accepting Applications",
                    key: "twitterdata1"
                },
                {
                    name: "twitter:label2",
                    property: "twitter:label2",
                    value: "Application Deadline",
                    key: "twitterlabel2"
                },
                {
                    name: "twitter:data2",
                    property: "twitter:data2",
                    value: "August 1, 2023",
                    key: "twitterdata2"
                }                
            ]
        },
    };
};