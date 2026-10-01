import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';


import ga from '../../lib/ga';
import { fetchForStaticProps, NOT_FOUND_REVALIDATE } from '../../lib/ssgFetch';

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

// No build-time prerender. This page is `noindex` and its body is
// client-rendered (ssr:false off router.query), so prerendering every
// nonprofit had zero SEO value but cost ~one backend fetch per nonprofit plus
// one per problem statement (~330 across this page and /project) on every
// deploy — and a throw from getStaticProps during `next build` fails the
// whole Vercel build. "blocking" renders on first request instead.
export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking'
    };
}

// Unknown ids come back as 200 {"nonprofits": null}. Non-404 upstream errors
// THROW (request-time only, so ISR keeps the last good copy).
const fetchNonProfit = async (nonprofit_id) => {
    const result = await fetchForStaticProps(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofit_id}`,
        { isEmpty: (d) => !d?.nonprofits }
    );
    return result.kind === 'ok' ? result.data.nonprofits : null;
}

// Only feeds meta text: a failed problem-statement fetch skips that entry.
const fetchProblemStatement = async (problem_statement_id) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${problem_statement_id}`,
            { signal: AbortSignal.timeout(15000) }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data && Object.keys(data).length > 0 ? data : null;
    } catch (e) {
        return null;
    }
}

export const getStaticProps = async ({ params = {} } = {}) => {
    
    const nonprofit = await fetchNonProfit(params.nonprofit_id);
    if (!nonprofit) {
        return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
    }

    // Gather all of the problem statements
    var problemStatements = [];
    if (nonprofit.problem_statements != null) {
        for (const psId of nonprofit.problem_statements) {
            const problemStatement = await fetchProblemStatement(psId);
            if (problemStatement) problemStatements.push(problemStatement);
        }
    }

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
                    content: 'Projects/Status',
                    key: 'twitterlabel1',
                },
                {
                    property: 'twitter:data1',
                    content: countOfProjects + '/' + statusList,
                    key: 'twitterdata1',
                },
                {
                    property: 'twitter:label2',
                    content: '🙌 Hackers/Mentors',
                    key: 'twitterlabel2',
                },
                {
                    property: 'twitter:data2',
                    content: countOfhelpingHackers + '/' + countOfhelpingMentors,
                    key: 'twitterdata2',
                },
                {
                    name: 'robots',
                    content: 'noindex,follow',
                    key: 'robots',
                },
            ],
        },
        revalidate: 3600,
    };
};