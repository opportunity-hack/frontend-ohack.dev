import React from "react";

import ProblemStatement from "../../components/ProblemStatement/ProblemStatement";
import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import { Puff } from "react-loading-icons";
import useProblemstatements from "../../hooks/use-problem-statements";
import Head from 'next/head';
import LoginOrRegister from "../../components/LoginOrRegister/LoginOrRegister";


import {
  LayoutContainer,
  ProjectsContainer,
  ProjectsGrid
} from "../../styles/nonprofit/styles";
import { Link } from "@mui/material";


export default function Project() {
  const { user } = useAuth0();
  const router = useRouter();
  const { project_id } = router.query;
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

  var loginCallToAction = <LoginOrRegister
    introText={"Whoa there - you need to login or create an account first."}
    previousPage={`/project/${project_id}`}/>;

    

  var metaDescription = problem_statement.status + ": " + problem_statement.description + " ";
  var title = "Project: " + problem_statement.title;

  return(
    <LayoutContainer key="ham" container>           
    <Head>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={problem_statement.image_url} />
      <meta property="og:url" content={problem_statement.url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@opportunityhack" />
      <meta name="twitter:creator" content="@opportunityhack" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={problem_statement.image_url} />
      <meta property='twitter:domain' content='ohack.dev' />
    </Head>

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