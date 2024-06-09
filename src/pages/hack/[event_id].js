import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Head from 'next/head';


const SingleHackathonEvent = dynamic(() => import('../../components/Hackathon/SingleHackathonEvent'), {
    ssr: false
});

export default function NonProfitProfile({ title, openGraphData, structuredData }) {
    const router = useRouter();
    const { event_id } = router.query;
  
    return (
        <>
        <Head>
            <title>{title}</title>
            {openGraphData.map((tag) => (
                <meta key={tag.key} property={tag.property || tag.name} content={tag.content} />
            ))}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Head>
        
        <SingleHackathonEvent
          event_id={event_id}
        />
        </>
    );
}

export async function getStaticPaths(event_id) {

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons?current=true`
    );
    const data = await res.json();

    const hackathons = data.hackathons;

    const paths = hackathons.map((hackathon) => ({
        params: { event_id: hackathon.event_id },
    }))

    return {
        paths: paths,
        fallback: true
    }
}

export const getStaticProps = async ({ params = {} } = {}) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`
    );
    const data = await res.json();
    

    var title = "Hackathon: " + data.title;
    var metaDescription = data.location + " | " + data.start_date + " to " + data.end_date + " | " + data.description;
    var countOfNonProfits = data.nonprofits?.length ? data.nonprofits.length : 0;
    var startDate = data.start_date;
    var endDate = data.end_date;
    var eventImage = data.image_url ? data.image_url : 'https://i.imgur.com/Ff801O6.png';
    var eventUrl = 'https://ohack.dev/hack/' + data.event_id;

    // If data.description is empty use ""
    var eventDescription = data.description ? data.description : "";


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
                    content: 'https://i.imgur.com/Ff801O6.png',
                    key: 'ogimage',
                },
                {
                    property: 'twitter:image',
                    content: 'https://i.imgur.com/Ff801O6.png',
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
                    value: 'Nonprofits',
                    key: 'twitterlabel1',
                },
                {
                    property: 'twitter:data1',
                    value: countOfNonProfits,
                    key: 'twitterdata1',
                },
                {
                    property: 'twitter:label2',
                    value: 'Dates',
                    key: 'twitterlabel2',
                },
                {
                    property: 'twitter:data2',
                    value: startDate + ' to ' + endDate,
                    key: 'twitterdata2',
                },
                
                // Geo-specific meta tags -- need to update this to by dynamic using the database
                {
                    name: 'geo.region',
                    content: 'US-AZ',
                    key: 'georegion',
                },
                {
                    name: 'geo.placename',
                    content: 'Tempe',
                    key: 'geoplacename',
                },
                {
                    name: 'geo.position',
                    content: '33.424564;-111.928001',
                    key: 'geoposition',
                },
                {
                    name: 'ICBM',
                    content: '33.424564, -111.928001',
                    key: 'icbm',
                }
            ],
            structuredData: {
                "@context": "http://schema.org",
                "@type": "Event",
                "name": title,
                "description": eventDescription,
                "startDate": startDate,
                "endDate": endDate,
                "location": {
                    "@type": "Place",
                    "name": "Arizona State University",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "1151 S Forest Ave",
                        "addressLocality": "Tempe",
                        "addressRegion": "AZ",
                        "postalCode": "85281",
                        "addressCountry": "US"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 33.424564,
                        "longitude": -111.928001
                    }
                },
                "image": [
                    eventImage
                ],
                "organizer": {
                    "@type": "Organization",
                    "name": "Opportunity Hack Arizona",
                    "url": eventUrl
                }
            }
        },
    };
};