import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';


const SingleHackathonEvent = dynamic(() => import('../../components/Hackathon/SingleHackathonEvent'), {
    ssr: false
});

export default function NonProfitProfile() {
    const router = useRouter();
    const { event_id } = router.query;
  
    return (
        <SingleHackathonEvent
          event_id={event_id}
        />
    );
}

export async function getStaticPaths(event_id) {
    console.log("event_id", event_id);

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons?current=true`
    );
    const data = await res.json();
    console.log("Hackathon Data:",data);

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
    var countOfNonProfits = data.nonprofits.length ? data.nonprofits.length : 0;
    var startDate = data.start_date;
    var endDate = data.end_date;


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
            ],
        },
    };
};