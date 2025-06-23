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
    const title = "Mentor Guide - Shape the Future of Tech for Good | Opportunity Hack";
    const description = "Become a mentor at Opportunity Hack and guide talented teams building life-changing technology solutions for nonprofits. Share your expertise, develop leadership skills, and create lasting social impact through code.";
    return {
        props: {
            title: "Mentor Guide - Opportunity Hack",
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
                    name: "og:description",
                    property: "og:description",
                    content: description,
                    key: "ogdescription"
                },                                
                {
                    name: "image",
                    property: "og:image",
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
                    key: "ognameimage"
                },
                {
                    property: "og:image:width",
                    content: "1200",
                    key: "ogimagewidth",
                },
                {
                    property: "og:image:height",
                    content: "630",
                    key: "ogimageheight",
                },
                {
                    name: "url",
                    property: "url",
                    content: "https://ohack.dev/about/mentors",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://ohack.dev/about/mentors",
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",                    
                    content: "Mentor helping a participant at Opportunity Hack hackathon, demonstrating hands-on guidance and support",
                    key: "twitterimagealt"
                },
                {
                    name: "twitter:creator",
                    property: "twitter:creator",
                    content: "@opportunityhack",
                    key: "twittercreator"
                }               
            ],
            structuredData: {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Organization",
                        "@id": "https://ohack.dev/#organization",
                        "name": "Opportunity Hack",
                        "url": "https://ohack.dev",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp"
                        },
                        "sameAs": [
                            "https://twitter.com/opportunityhack",
                            "https://github.com/opportunity-hack"
                        ]
                    },
                    {
                        "@type": "WebPage",
                        "@id": "https://ohack.dev/about/mentors#webpage",
                        "url": "https://ohack.dev/about/mentors",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://ohack.dev/#website"
                        },
                        "about": {
                            "@type": "EducationalOrganization",
                            "name": "Opportunity Hack Mentorship Program",
                            "description": "A mentorship program connecting experienced technologists with teams building solutions for nonprofits"
                        }
                    },
                    {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://ohack.dev"
                            },
                            {
                                "@type": "ListItem", 
                                "position": 2,
                                "name": "About",
                                "item": "https://ohack.dev/about"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Mentors",
                                "item": "https://ohack.dev/about/mentors"
                            }
                        ]
                    }
                ]
            }
        },
    };
};