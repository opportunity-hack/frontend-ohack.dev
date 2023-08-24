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

const fetchNonProfit = async (nonprofit_id) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofit_id}`
    );
    const data = await res.json();
    const nonprofit = data.nonprofits;

    return nonprofit;
}

const fetchProblemStatement = async (problem_statement_id) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${problem_statement_id}`
    );
    const data = await res.json();
    const problemStatement = data;

    return problemStatement;
}

export const getStaticProps = async ({ params = {} } = {}) => {
    
    const nonprofit = await fetchNonProfit(params.nonprofit_id);

    // Gather all of the problem statements
    var problemStatements = [];
    if (nonprofit.problem_statements != null) {
        for (const psId of nonprofit.problem_statements) {
            const problemStatement = await fetchProblemStatement(psId);
            problemStatements.push(problemStatement);
        }
    }

    console.log("problemStatements", problemStatements);

    var title = "Nonprofit: " + nonprofit.name;
    var metaDescription = '';

    var countOfhelpingMentors = 0;
    var countOfhelpingHackers = 0;
    var countOfProjects = 0;
    var statusList = [];


    if (
        problemStatements != null &&
        problemStatements.length > 0
    ) {
        problemStatements.forEach((ps) => {                        
            console.log("----->", ps) ;

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