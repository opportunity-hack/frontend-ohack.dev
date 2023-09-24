import dynamic from "next/dynamic";

const Mentorship = dynamic(
    () => import("../../../components/About/Mentorship/Mentorship"),
    {
        ssr: false,
    }
);


export default function Mentors() {        
    return <Mentorship />;
}

export const getStaticProps = async () => {    
    const title = "How to Become a Mentor for Opportunity Hack and Help Nonprofits";
    const description =  "Opportunity Hack is an event where mentors guide participants to create solutions for nonprofits. Join us as a Software Engineer, Product Manager, UX Designer, or Project Manager and make a difference.";
    return {
        props: {
            title: "Opportunity Hack Mentorship",
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
                    content: "2023-09-23T00:00:00-0700",
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
                    content: "https://cdn.ohack.dev/ohack.dev/mentor_1.jpg",
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
                    content: "https://cdn.ohack.dev/ohack.dev/mentor_1.jpg",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Opportunity Hack mentorship needed!",
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
                    value: "Accepting Mentors of all backgrounds",
                    key: "twitterdata1"
                },
                {
                    name: "twitter:label2",
                    property: "twitter:label2",
                    value: "Signup Deadline",
                    key: "twitterlabel2"
                },
                {
                    name: "twitter:data2",
                    property: "twitter:data2",
                    value: "October 1, 2023",
                    key: "twitterdata2"
                }                
            ]
        },
    };
};