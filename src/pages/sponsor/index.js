import dynamic from 'next/dynamic';
import Head from 'next/head';

const SponsorIndex = dynamic(() => import('../../components/Hackathon/SponsorIndex'), {
    ssr: false
});

export default function SponsorIndexList() {      
    return (
        <>
            <Head>
                <title>Sponsor Opportunity Hack | Transform Tech Talent and Communities</title>
                <meta name="description" content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology." />
                <meta name="keywords" content="Opportunity Hack, hackathon sponsorship, tech for good, corporate social responsibility, nonprofit tech solutions" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.ohack.dev/sponsor" />
                <meta property="og:title" content="Sponsor Opportunity Hack | Transform Tech Talent and Communities" />
                <meta property="og:description" content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology." />
                <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://www.ohack.dev/sponsor" />
                <meta property="twitter:title" content="Sponsor Opportunity Hack | Transform Tech Talent and Communities" />
                <meta property="twitter:description" content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology." />
                <meta property="twitter:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" />

                {/* Additional SEO tags */}
                <link rel="canonical" href="https://www.ohack.dev/sponsor" />
                <meta name="robots" content="index, follow" />
            </Head>
            <SponsorIndex />
        </>
    );
}


