// Helper function to generate meta tags
export const generateOpenGraphData = (content) => {
  const title = `${content.title} - Opportunity Hack`;
  const description = content.description;
  const image = content.image;
  const keywords = content.keywords.join(", ");

  return [
    {
      name: "title",
      content: title,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      name: "keywords",
      content: keywords,
    },
    {
      property: "og:image",
      content: image,
    },
    {
      property: "twitter:image",
      content: image,
    },
    {
      property: "og:site_name",
      content: "Opportunity Hack",
    },
    {
      property: "twitter:card",
      content: "summary_large_image",
    },
    {
      property: "twitter:domain",
      content: "ohack.dev",
    },
  ];
}

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
      url: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Black_Cropped.png",
    },
  },
  datePublished: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  keywords: content.keywords,
});
