import React from "react";

import ProblemStatement from "../../components/ProblemStatement/ProblemStatement";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import { Puff } from "react-loading-icons";
import useProblemstatements from "../../hooks/use-problem-statements";


import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import {
  LayoutContainer,
  ProjectsContainer,
  ProjectsGrid
} from "../../styles/nonprofit/styles";
import { Link } from "@mui/material";


const JOIN_SLACK_LINK =
  "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
const createSlackAccount = () => {
  window.open(JOIN_SLACK_LINK, "_blank", "noopener noreferrer");
};

export default function ProjectPage() {
  const { user } = useAuth0();
  const router = useRouter();
  const { project_id } = router.query;
  const { loginWithRedirect } = useAuth0();
  const { problem_statement } = useProblemstatements(project_id);
  console.log("project_id", project_id);
  console.log("problem_statement", problem_statement);
  
  if( problem_statement == null || problem_statement.title === "" || problem_statement.description === "")
  {
    return(<LayoutContainer key="ham" container>           
    <ProjectsContainer>   
    <ProjectsGrid container>
        Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" />
    </ProjectsGrid>
    </ProjectsContainer>
    </LayoutContainer>
    );
  }

  var loginCallToAction = (
    <Stack alignItems="center" paddingTop={5}>
      <Alert variant="outlined" severity="warning">
        <AlertTitle>
          Whoa there - you need to login or create an account first.
        </AlertTitle>

        <Stack alignItems="center" spacing={2}>
          <Stack direction="column" spacing={1}>
            <button
              className="button button--primary button--compact"
              onClick={() =>
                loginWithRedirect({
                  appState: {
                    returnTo: window.location.pathname,
                    redirectUri: window.location.pathname,
                  },
                })
              }
            >
              Log In
            </button>

            <Typography>
              We use Slack to collaborate, if you already have an account, login
              with Slack
            </Typography>
          </Stack>

          <Stack direction="column" spacing={1}>
            <button
              onClick={createSlackAccount}
              className="button button--primary"
            >
              Create a Slack account
            </button>

            <Typography>
              If you don't have an account, you will need to create an account
            </Typography>
          </Stack>
        </Stack>
      </Alert>
    </Stack>
  );


  return(<LayoutContainer key="ham" container>           
  <ProjectsContainer>        
    {!user && loginCallToAction}
    <div>This project is just one of many! Head over to <Link href="/nonprofits">projects</Link> to see them all</div>
    <ProjectsGrid container>
      <ProblemStatement
      key={problem_statement.id}
      problem_statement={problem_statement}
      user={user}              
      />
      </ProjectsGrid>
  </ProjectsContainer>
</LayoutContainer>
  );
}




export async function getServerSideProps({ params = {} } = {}) {
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