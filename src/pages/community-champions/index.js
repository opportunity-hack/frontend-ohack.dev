import dynamic from "next/dynamic";

const CommunityChampions = dynamic(
  () => import("../../components/CommunityChampions/CommunityChampions"),
  { ssr: false }
);

export default function CommunityChampionsPage() {
  return <CommunityChampions />;
}

export const getStaticProps = async () => {
  const title =
    "Community Champions - Volunteers Powering Tech for Good | Opportunity Hack";
  const description =
    "Meet the Opportunity Hack community champions — volunteers, mentors, judges, and hackers who donate their skills to build technology solutions for nonprofits. See who is leading the charge for social good.";

  return {
    props: {
      title,
      description,
      openGraphData: [
        {
          name: "title",
          property: "title",
          content: title,
          key: "title",
        },
        {
          name: "og:title",
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "author",
          property: "author",
          content: "Opportunity Hack",
          key: "author",
        },
        {
          name: "og:description",
          property: "og:description",
          content: description,
          key: "ogdescription",
        },
        {
          name: "description",
          property: "description",
          content: description,
          key: "description",
        },
        {
          name: "image",
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
          key: "ognameimage",
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
          content: "https://ohack.dev/community-champions",
          key: "url",
        },
        {
          name: "og:url",
          property: "og:url",
          content: "https://ohack.dev/community-champions",
          key: "ogurl",
        },
        {
          name: "og:type",
          property: "og:type",
          content: "website",
          key: "ogtype",
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard",
        },
        {
          name: "twitter:site",
          property: "twitter:site",
          content: "@opportunityhack",
          key: "twittersite",
        },
        {
          name: "twitter:title",
          property: "twitter:title",
          content: title,
          key: "twittertitle",
        },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: description,
          key: "twitterdesc",
        },
        {
          name: "twitter:image",
          property: "twitter:image",
          content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
          key: "twitterimage",
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content:
            "Opportunity Hack community champions volunteering at a hackathon for nonprofits",
          key: "twitterimagealt",
        },
        {
          name: "twitter:creator",
          property: "twitter:creator",
          content: "@opportunityhack",
          key: "twittercreator",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://ohack.dev/#organization",
            name: "Opportunity Hack",
            url: "https://ohack.dev",
            logo: {
              "@type": "ImageObject",
              url: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
            },
            sameAs: [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack",
              "https://www.instagram.com/opportunityhack/",
              "https://www.linkedin.com/company/opportunity-hack/",
            ],
          },
          {
            "@type": "WebPage",
            "@id": "https://ohack.dev/community-champions#webpage",
            url: "https://ohack.dev/community-champions",
            name: title,
            description: description,
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://ohack.dev/#website",
            },
            about: {
              "@type": "Organization",
              name: "Opportunity Hack Community Champions",
              description:
                "Volunteers, mentors, judges, and hackers who lead Opportunity Hack's mission to connect technology professionals with nonprofits in need.",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://ohack.dev",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Community Champions",
                item: "https://ohack.dev/community-champions",
              },
            ],
          },
        ],
      },
    },
  };
};
