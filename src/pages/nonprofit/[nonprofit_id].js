import React from "react";
import { useState } from "react";

import useNonprofit from "../../hooks/use-nonprofit";
import useAdmin from "../../hooks/use-admin-check";

// import ProblemStatement from "../../components/problem-statement";
import ProblemStatement from "../../components/ProblemStatement/ProblemStatement";
import AdminProblemStatementList from "../../components/admin/problemstatement-list";

import TagIcon from "@mui/icons-material/Tag";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";

import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import { Puff } from "react-loading-icons";
import { Parallax } from "react-parallax";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import { red } from "@mui/material/colors";
import ShareIcon from "@mui/icons-material/Share";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { Chip } from "@mui/material";

import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import {
  CardContainer,
  ChannelChip,
  ContentContainer,
  DescriptionStyled,
  DetailsContainer,
  LayoutContainer,
  LinkStyled,
  ProjectsChip,
  ProjectsContainer,
  ProjectsGrid,
  SlackTooltip,
  TitleBanner,
  TitleChipContainer,
  TitleContainer,
  TitleStyled,
} from "./styles";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const JOIN_SLACK_LINK =
  "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
const createSlackAccount = () => {
  window.open(JOIN_SLACK_LINK, "_blank", "noopener noreferrer");
};

export default function NonProfitProfile() {
  const { user } = useAuth0();
  const router = useRouter();
  const { nonprofit_id } = router.query;
  const { loginWithRedirect } = useAuth0();

  const { isAdmin } = useAdmin();
  const [checked, setChecked] = useState([]);
  const [message, setMessage] = useState("");

  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const { handle_npo_problem_statement_edit, nonprofit } =
    useNonprofit(nonprofit_id);

  var slack_details,
    slack_details_plain = "";

  if (nonprofit.slack_channel !== "") {
    slack_details_plain = nonprofit.slack_channel;
    slack_details = (
      <Typography>
        <Tooltip title="This is their dedicated channel in Slack">
          <IconButton>
            <TagIcon />
          </IconButton>
        </Tooltip>
        {nonprofit.slack_channel}
      </Typography>
    );
  } else {
    slack_details = "";
  }

  const onComplete = (amessage) => {
    setMessage(amessage);
  };

  const handleSubmit = async () => {
    handle_npo_problem_statement_edit(nonprofit_id, checked, onComplete);
  };

  const problemStatements = () => {
    if (nonprofit.problem_statements == null) {
      return (
        <div>
          <p>
            Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" />
          </p>
        </div>
      );
    } else {
      if (nonprofit.problem_statements.length === 0) {
        return <div>Working on it!</div>;
      } else {
        console.log("NPO Rendering Problem Statement");
        return nonprofit.problem_statements.map((ps) => {
          return (
            <ProblemStatement
              key={ps.id}
              problem_statement={ps}
              user={user}
              npo_id={nonprofit_id}
            />
          );
        });
      }
    }
  };

  var description = "";

  function getTwoLetters(str) {
    if (str != null && str != "") {
      if (str.includes(" ")) {
        const strArr = str.split(" ");
        return strArr[0].charAt(0) + strArr[1].charAt(0);
      } else {
        return str.charAt(0);
      }
    }
  }

  function getWordStr(str) {
    return str.split(/\s+/).slice(0, 50).join(" ");
  }

  if (nonprofit.description != null) {
    description = nonprofit.description;
  }

  const renderAdminProblemStatements = () => {
    if (isAdmin && nonprofit.problem_statements != null) {
      const default_selected = nonprofit.problem_statements.map((ps) => {
        return ps.id;
      });
      return (
        <div>
          <AdminProblemStatementList
            selected={checked}
            onSelected={setChecked}
            default_selected={default_selected}
          />
          <Button
            onClick={handleSubmit}
            variant="contained"
            endIcon={<SaveIcon />}
          >
            Save
          </Button>
          {message}
        </div>
      );
    } else {
      return "";
    }
  };

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

  // More on meta tags
  // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
  console.log("Nonprofit Page Render");
  console.log(slack_details);
  return (
    <LayoutContainer key={nonprofit_id} container>
      <TitleBanner>
        <Parallax bgImage="/npo_placeholder.png" strength={300}></Parallax>
      </TitleBanner>
      <TitleContainer container>
        <TitleChipContainer>
          <TitleStyled variant="h2">
            <Avatar
              sx={{ bgcolor: red[500] }}
              aria-label="npo-avatar"
              style={{ marginRight: "1.5rem" }}
            >
              {getTwoLetters(nonprofit.name)}
            </Avatar>
            {nonprofit.name}
          </TitleStyled>
          <ProjectsChip
            color="default"
            icon={<AccountTreeIcon />}
            label={`
             ${nonprofit.problem_statements?.length} project${
              nonprofit.problem_statements?.length !== 1 ? "s" : ""
            } available`}
          />
        </TitleChipContainer>
        <DescriptionStyled>{description}</DescriptionStyled>
        <DescriptionStyled>
          Looking to get involved? Join the{" "}
          <Tooltip
            title={
              <p style={{ fontSize: "1rem", margin: "0" }}>
                This is their dedicated channel in Slack
              </p>
            }
            arrow
          >
            <ChannelChip
              label={`#${nonprofit.slack_channel}`}
              variant="outlined"
            />
          </Tooltip>{" "}
          channel on <LinkStyled href="https://slack.com/">Slack</LinkStyled> to
          join in on the discussion!
        </DescriptionStyled>
      </TitleContainer>

      <ProjectsContainer>
        {renderAdminProblemStatements()}

        {!user && loginCallToAction}
        <h3>Projects</h3>
        <ProjectsGrid container>{problemStatements()}</ProjectsGrid>
      </ProjectsContainer>
    </LayoutContainer>
  );
}

export async function getServerSideProps({ params = {} } = {}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${params.nonprofit_id}`
  );
  const data = await res.json();
  const nonprofit = data.nonprofits;

  var metaDescription = "";

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
        ps.title + " | " + ps.status + ": " + ps.description + " ";
      countOfProjects++;
      statusList.push(ps.status);

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
    });
  }

  if (nonprofit.slack_channel != null && nonprofit.slack_channel !== "") {
    metaDescription += " [Slack Channel: #" + nonprofit.slack_channel + "] ";
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
          name: "title",
          content: data.nonprofits.name,
          key: "title",
        },
        {
          property: "og:title",
          content: data.nonprofits.name,
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
          value: "Projects/Status",
          key: "twitterlabel1",
        },
        {
          property: "twitter:data1",
          value: countOfProjects + "/" + statusList,
          key: "twitterdata1",
        },
        {
          property: "twitter:label2",
          value: "🙌 Hackers/Mentors",
          key: "twitterlabel2",
        },
        {
          property: "twitter:data2",
          value: countOfhelpingHackers + "/" + countOfhelpingMentors,
          key: "twitterdata2",
        },
      ],
    },
  };
}
