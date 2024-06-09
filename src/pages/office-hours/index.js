import dynamic from 'next/dynamic';

const OfficeHours = dynamic(() => import('../../components/OfficeHours/OfficeHours'), {
    ssr: false,
});

export default function OfficeHour() {    
    
    return (
        <OfficeHours/>
    );
}


export const getStaticProps = async ({ params = {} } = {}) => {
    
  var title = "Office Hours: Opportunity Hack Developer Portal";
  var metaDescription = 'We provide weekly office hours using a Slack huddle in #general for anyone volunteering to write code for any nonprofit we support at Opportunity Hack. We know that it\'s hard to find time to volunteer, so we\'re here to help you get started and make the most of your time.';
  var image = "https://cdn.ohack.dev/ohack.dev/officehours.webp";

  return {
    props: {
      title: title,
      openGraphData: [
        {
          name: 'title',
          content: title,
          key: 'title',
        },
        {
          property: 'og:title',
          content: title,
          key: 'ogtitle',
        },
        {
          name: 'description',
          content: metaDescription,
          key: 'desc',
        },
        {
          property: 'og:description',
          content: metaDescription,
          key: 'ogdesc',
        },
        {
          property: 'og:type',
          content: 'website',
          key: 'website',
        },
        {
          property: 'og:image',
          content: image,
          key: 'ogimage',
        },
        {
          property: 'twitter:image',
          content: image,
          key: 'twitterimage',
        },
        {
          property: 'og:site_name',
          content: 'Opportunity Hack Developer Portal',
          key: 'ogsitename',
        },
        {
          property: 'twitter:card',
          content: 'summary_large_image',
          key: 'twittercard',
        },
        {
          property: 'twitter:domain',
          content: 'ohack.dev',
          key: 'twitterdomain',
        },
        {
          property: 'twitter:label1',
          value: 'Office Hours',
          key: 'twitterlabel1',
        },
        {
          property: 'twitter:data1',
          value: "Every Friday at 10am and 2pm PST",
          key: 'twitterdata1',
        }
      ],
    },
  };
};