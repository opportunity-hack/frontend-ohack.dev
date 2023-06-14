import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const NonProfit = dynamic(() => import('../../components/NonProfit/NonProfit'), {
    ssr: false
});

export default function NonProfitProfile() {
    const router = useRouter();
    const { nonprofit_id } = router.query;
  
    return (
        <NonProfit
          nonprofit_id={nonprofit_id}
        />
    );
}

export async function getStaticPaths(nonprofit_id) {
    console.log("nonprofit_id", nonprofit_id);

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`
    );
    const data = await res.json();
    const nonprofits = data.nonprofits;

    const paths = nonprofits.map((npo) => ({
        params: { nonprofit_id: npo.id },
    }))

    return {
        paths: paths,
        fallback: true
    }
}

export const getStaticProps = async ({ params = {} } = {}) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${params.nonprofit_id}`
    );
    const data = await res.json();
    const nonprofit = data.nonprofits;

    var metaDescription = '';

    var countOfhelpingMentors = 0;
    var countOfhelpingHackers = 0;
    var countOfProjects = 0;
    var statusList = [];
    if (
        nonprofit.problem_statements != null &&
        nonprofit.problem_statements.length > 0
    ) {
        nonprofit.problem_statements.forEach((ps) => {
            metaDescription +=
                ps.title + ' | ' + ps.status + ': ' + ps.description + ' ';
            countOfProjects++;
            statusList.push(ps.status);

            if (ps.helping) {
                ps.helping.forEach((help) => {
                    if (help.type === 'hacker') {
                        countOfhelpingHackers++;
                    } else if (help.type === 'mentor') {
                        countOfhelpingMentors++;
                    } else {
                        // Nada
                    }
                });
            }
        });
    }

    if (nonprofit.slack_channel != null && nonprofit.slack_channel !== '') {
        metaDescription += ' [Slack Channel: #' + nonprofit.slack_channel + '] ';
    }

    // Helpful Docs:
    // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
    // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
    // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
    return {
        props: {
            title: data.nonprofits.name,
            openGraphData: [
                {
                    name: 'title',
                    content: data.nonprofits.name,
                    key: 'title',
                },
                {
                    property: 'og:title',
                    content: data.nonprofits.name,
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
                    value: 'Projects/Status',
                    key: 'twitterlabel1',
                },
                {
                    property: 'twitter:data1',
                    value: countOfProjects + '/' + statusList,
                    key: 'twitterdata1',
                },
                {
                    property: 'twitter:label2',
                    value: '🙌 Hackers/Mentors',
                    key: 'twitterlabel2',
                },
                {
                    property: 'twitter:data2',
                    value: countOfhelpingHackers + '/' + countOfhelpingMentors,
                    key: 'twitterdata2',
                },
            ],
        },
    };
};