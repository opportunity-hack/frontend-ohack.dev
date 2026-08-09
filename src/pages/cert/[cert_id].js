import dynamic from 'next/dynamic';
import { normalizeImageUrl } from '../../lib/imageUtils';

const CertInfoIndex = dynamic(() => import('../../components/Certificate/CertInfoIndex'), {
    ssr: false
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ohack.dev";

/**
 * Certificate detail page — ISR (praise/[id].js pattern) so the signed
 * certificate PNG unfurls as the og:image when people share their cert on
 * LinkedIn/Slack. The interactive body stays client-rendered.
 */
export default function CertInfoPage() {
    return (
        <CertInfoIndex />
    );
}

export async function getStaticPaths() {
    // Certs are generated continuously — build nothing up front, ISR on demand
    return { paths: [], fallback: true };
}

export async function getStaticProps({ params }) {
    const certId = params?.cert_id || "";
    let cert = null;
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (apiBase && certId) {
            const res = await fetch(`${apiBase}/api/certificates/${encodeURIComponent(certId)}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.certificate_url) cert = data;
            }
        }
    } catch (err) {
        cert = null;
    }

    if (!cert) {
        // Unknown id → real 404 (revalidated so a just-generated cert appears)
        return { notFound: true, revalidate: 300 };
    }

    const repoName = (cert.repository_url || "").split("/").slice(-1)[0];
    const title = `${cert.author_name || "Contributor"}${repoName ? ` — ${repoName}` : ""} contribution certificate | Opportunity Hack`;
    const stats = cert.stats || {};
    const description = `Verified open-source contribution for nonprofits: ${stats.commits || 0} commits, ${stats.lines_of_code || 0} lines of code, ~${stats.hours || 0} hours.`;
    const image = normalizeImageUrl(cert.certificate_url);
    const canonical = `${SITE_URL}/cert/${certId}`;

    return {
        props: {
            title,
            canonical,
            openGraphData: [
                { name: "description", content: description, key: "desc" },
                { name: "robots", content: "index, follow", key: "robots" },
                { property: "og:type", content: "article", key: "ogtype" },
                { property: "og:title", content: title, key: "ogtitle" },
                { property: "og:description", content: description, key: "ogdesc" },
                { property: "og:image", content: image, key: "ogimage" },
                { property: "og:url", content: canonical, key: "ogurl" },
                { property: "og:site_name", content: "Opportunity Hack Developer Portal", key: "ogsitename" },
                // Cert PNGs are square 1024×1024 — summary renders them crisp
                { name: "twitter:card", content: "summary", key: "twcard" },
                { name: "twitter:title", content: title, key: "twtitle" },
                { name: "twitter:description", content: description, key: "twdesc" },
                { name: "twitter:image", content: image, key: "twimage" },
                { name: "twitter:domain", content: "ohack.dev", key: "twdomain" },
            ],
        },
        revalidate: 3600,
    };
}
