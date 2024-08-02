import dynamic from "next/dynamic";

const ProjectCompletion = dynamic(
    () => import("../../../components/About/Completion/ProjectCompletion"),
    {
        ssr: false,
    }
);


export default function Mentors() {        
    return <ProjectCompletion />;
}

export const getStaticProps = async () => {    
    const title = "Definition of Done: Opportunity Hack Project Completion Checklist";
    const description = "In software engineering, the definition of done is a checklist of things that need to be completed before a project can be considered finished. This page is a checklist of things that need to be completed before a project can be considered finished for Opportunity Hack.";
    
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
                    content: "2024-01-30T00:00:00-0700",
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
                    content: "https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp",
                    key: "ognameimage"
                },
                {
                    property: "og:image:width",
                    content: "400",
                    key: "ogimagewidth",
                },
                {
                    property: "og:image:height",
                    content: "400",
                    key: "ogimageheight",
                },
                {
                    name: "url",
                    property: "url",
                    content: "https://www.ohack.dev/about/completion",
                    key: "url"
                },
                {
                    name: "org:url",
                    property: "org:url",
                    content: "https://www.ohack.dev/about/completion",
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
                    content: "https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Opportunity Hack definition of done",
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
                    value: "Definition of Done (DoD)",
                    key: "twitterlabel1"
                },
                {
                    name: "twitter:data1",
                    property: "twitter:data1",
                    value: "How we define a project as complete",
                    key: "twitterdata1"
                }                            
            ]
        },
    };
};