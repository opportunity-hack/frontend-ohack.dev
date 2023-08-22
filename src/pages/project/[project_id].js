import dynamic from "next/dynamic";

const Project = dynamic(() => import("../../components/Project/Project"), {
  ssr: false
});

export default function ProjectPage() {
  return (
    <Project />
  );
}

export async function getStaticPaths(project_id) {  

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`
  );
  const data = await res.json();
  const problem_statements = data.problem_statements;

  const paths = problem_statements.map((problem_statement) => ({
    params: { project_id: problem_statement.id },
  }))

  return {
    paths: paths,
    fallback: true
  }
}

export async function getStaticProps({ params = {} } = {}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${params.project_id}`
  );
  const ps = await res.json();

  var title = "Project: " + ps.title;
  var metaDescription = ps.status + ": " + ps.description + " ";
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
          value: "Project Status",
          key: "twitterlabel1",
        },
        {
          property: "twitter:data1",
          value: ps.status,
          key: "twitterdata1",
        },
        {
          property: "twitter:label2",
          value: "💻 Hackers",
          key: "twitterlabel2",
        },
        {
          property: "twitter:data2",
          value: countOfhelpingHackers,
          key: "twitterdata2",
        },
        {
          property: "twitter:label3",
          value: "🛟 Mentors",
          key: "twitterlabel3",
        },
        {
          property: "twitter:data3",
          value: countOfhelpingMentors,
          key: "twitterdata3",
        }
      ],
    },
  };
}