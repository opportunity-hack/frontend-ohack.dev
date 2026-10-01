import dynamic from "next/dynamic";
import { PROJECT_STATUS_LABELS } from "../../lib/projectStatus";
import { fetchForStaticProps, NOT_FOUND_REVALIDATE } from "../../lib/ssgFetch";

const Project = dynamic(() => import("../../components/Project/Project"), {
  ssr: false
});

export default function ProjectPage() {
  return (
    <Project />
  );
}

// No build-time prerender. This page is `noindex` and its body is
// client-rendered (ssr:false), so prerendering every project had zero SEO
// value but cost one backend fetch per project (~330 across this page and
// /nonprofit) on every deploy — and a throw from getStaticProps during
// `next build` fails the whole Vercel build. "blocking" renders on first
// request instead.
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking"
  };
}

export async function getStaticProps({ params = {} } = {}) {
  // Unknown ids come back as 200 {} -> 404 (retried after 60s). Non-404
  // upstream errors THROW (request-time only, so ISR keeps the last good copy).
  const result = await fetchForStaticProps(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${params.project_id}`,
    { isEmpty: (d) => !d || typeof d !== "object" || Object.keys(d).length === 0 }
  );
  if (result.kind === "not_found") {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE };
  }
  const ps = result.data;

  // Fetch parent nonprofit(s) for SEO context — a project can belong to multiple nonprofits
  let nonprofitNames = "";
  try {
    const npoRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${params.project_id}/nonprofit`
    );
    const npoData = await npoRes.json();
    if (npoData?.nonprofits?.length > 0) {
      nonprofitNames = npoData.nonprofits.map((n) => n.name).filter(Boolean).join(", ");
    }
  } catch (e) {
    // Non-critical — continue without nonprofit names
  }

  var title = nonprofitNames
    ? `Project: ${ps.title} — ${nonprofitNames}`
    : "Project: " + ps.title;
  const statusLabel = PROJECT_STATUS_LABELS[ps.status] || ps.status || "Project";
  var metaDescription = (nonprofitNames ? `For ${nonprofitNames}. ` : "") + statusLabel + ": " + ps.description + " ";
  var countOfhelpingMentors = 0;
  var countOfhelpingHackers = 0;

  if (ps.helping) {
    ps.helping.forEach((help) => {
      if (help.type === "hacker") {
        countOfhelpingHackers++;
      } else if (help.type === "mentor") {
        countOfhelpingMentors++;
      } else {
        // Nada
      }
    });
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
          name: "title",
          content: title,
          key: "title",
        },
        {
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "description",
          content: metaDescription,
          key: "desc",
        },
        {
          property: "og:description",
          content: metaDescription,
          key: "ogdesc",
        },
        {
          property: "og:type",
          content: "website",
          key: "website",
        },
        {
          property: "og:image",
          content: "https://i.imgur.com/Ff801O6.png",
          key: "ogimage",
        },
        {
          property: "twitter:image",
          content: "https://i.imgur.com/Ff801O6.png",
          key: "twitterimage",
        },
        {
          property: "og:site_name",
          content: "Opportunity Hack Developer Portal",
          key: "ogsitename",
        },
        {
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard",
        },
        {
          property: "twitter:domain",
          content: "ohack.dev",
          key: "twitterdomain",
        },
        {
          property: "twitter:label1",
          content: "Project Status",
          key: "twitterlabel1",
        },
        {
          property: "twitter:data1",
          content: statusLabel,
          key: "twitterdata1",
        },
        {
          property: "twitter:label2",
          content: "💻 Hackers",
          key: "twitterlabel2",
        },
        {
          property: "twitter:data2",
          content: countOfhelpingHackers,
          key: "twitterdata2",
        },
        {
          property: "twitter:label3",
          content: "🛟 Mentors",
          key: "twitterlabel3",
        },
        {
          property: "twitter:data3",
          content: countOfhelpingMentors,
          key: "twitterdata3",
        },
        {
          name: "robots",
          content: "noindex,follow",
          key: "robots",
        }
      ],
    },
    revalidate: 3600,
  };
}