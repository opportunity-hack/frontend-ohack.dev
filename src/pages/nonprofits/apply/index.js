import dynamic from 'next/dynamic';
import Head from 'next/head';

const NonProfitApply = dynamic(() =>  import('../../../components/NonProfitApply/NonProfitApply'), {
    ssr: false
});

export default function Apply() {
    return (
        <div>
        <Head>
            <title>Nonprofit Application for Opportunity Hack 2023</title>
            <meta
            name="description"
            content="Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem."
            />
            <meta
            property="og:title"
            content="Nonprofit Application for Opportunity Hack 2023"
            />
            <meta
            property="og:description"
            content="Have a problem where you think software could help? Submit your application today! We'll match you with a team of developers to help you solve your problem."
            />
            <meta property="og:image" content="https://i.imgur.com/hE3wm7M.png" />
            <meta property="og:url" content="https://www.ohack.org/nonprofits/apply" />
            <meta name="twitter:card" content="summary_large_image" />   
        </Head>
        <NonProfitApply/>
        </div>
    );
}