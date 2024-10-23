// Helper function to generate meta tags
export const generateMetaTags = (content) => [
  {
    name: "title",
    content: content.title,
    key: "title",
  },
  {
    property: "og:title",
    content: content.title,
    key: "ogtitle",
  },
  {
    name: "description",
    content: content.description,
    key: "desc",
  },
  {
    property: "og:description",
    content: content.description,
    key: "ogdesc",
  },
  {
    property: "og:type",
    content: "website",
    key: "website",
  },
  {
    property: "og:image",
    content: content.image,
    key: "ogimage",
  },
  {
    property: "twitter:image",
    content: content.image,
    key: "twitterimage",
  },
  {
    property: "og:site_name",
    content: "Opportunity Hack Developer Portal",
    key: "ogsitename",
  },
  {
    property: "twitter:card",
    content: "summary_large_image",
    key: "twittercard",
  },
  {
    property: "twitter:domain",
    content: "ohack.dev",
    key: "twitterdomain",
  },
  {
    name: "keywords",
    content: content.keywords.join(", "),
    key: "keywords",
  },
];

// Helper function to generate structured data
export const generateStructuredData = (content) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: content.title,
  description: content.description,
  image: content.image,
  author: {
    "@type": "Organization",
    name: "Opportunity Hack",
    url: "https://ohack.dev",
  },
  publisher: {
    "@type": "Organization",
    name: "Opportunity Hack",
    logo: {
      "@type": "ImageObject",
      url: "https://ohack.dev/logo.png",
    },
  },
  datePublished: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  keywords: content.keywords,
});
