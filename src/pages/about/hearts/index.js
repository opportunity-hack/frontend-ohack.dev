import dynamic from "next/dynamic";

const Hearts = dynamic(
    () => import("../../../components/About/Hearts/Hearts"),
    {
        ssr: false,
    }
);


export default function Mentors() {        
    return <Hearts />;
}

export const getStaticProps = async () => {    
    const title = "Earn Hearts, Make Impact: The Opportunity Hack Rewards System";
    const description = "Opportunity Hack Hearts is a page dedicated to showcasing the hearts of Opportunity Hack participants. Join us and see the impact we're making together.";
    
    return {
        props: {
            title: title,
            description: description,
            openGraphData: [
                {
                    name: "title",
                    property: "title",
                    content: title,
                    key: "title"
                },
                {
                    name: "og:title",
                    property: "og:title",
                    content: title,
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
                    content: "2023-12-29T00:00:00-0700",
                    key: "publishdate"
                },
                {
                    name: "og:description",
                    property: "og:description",
                    content: description,
                    key: "ogdescription"
                },                                
                {
                    name: "image",
                    property: "og:image",
                    content: "https://cdn.ohack.dev/ohack.dev/icon-of-hearts-surrounding-a-technological-cyberpunk-heart-supernova-in-space-.jpeg",
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
                    content: "https://mentor.ohack.dev",
                    key: "url"
                },
                {
                    name: "org:url",
                    property: "org:url",
                    content: "https://mentor.ohack.dev",
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
                    content: title,
                    key: "twittertitle"
                },
                {
                    name: "twitter:description",
                    property: "twitter:description",
                    content: description,
                    key: "twitterdesc"
                },
                {
                    name: "twitter:image",
                    property: "twitter:image",
                    content: "https://cdn.ohack.dev/ohack.dev/icon-of-hearts-surrounding-a-technological-cyberpunk-heart-supernova-in-space-.jpeg",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Opportunity Hack hearts system",
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
                    value: "Hearts",
                    key: "twitterlabel1"
                },
                {
                    name: "twitter:data1",
                    property: "twitter:data1",
                    value: "Our incentive system for Opportunity Hack participants",
                    key: "twitterdata1"
                },
                {
                    name: "twitter:label2",
                    property: "twitter:label2",
                    value: "Status",
                    key: "twitterlabel2"
                },
                {
                    name: "twitter:data2",
                    property: "twitter:data2",
                    value: "Active",
                    key: "twitterdata2"
                }                
            ]
        },
    };
};