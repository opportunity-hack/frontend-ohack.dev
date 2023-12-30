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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": problem_statement.title,
    "description": metaDescription,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "courseCode": problem_statement.id,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": "PT22H",
      "instructor": {
        "@type": "VirtualLocation",
        "name": "Opportunity Hack"
      }
    },
    "instuctor": [
      {
        "@type": "Person",
        "name": "Opportunity Hack",
        "sameAs": "https://www.ohack.dev/about"
      }
    ],    
    "provider": {
      "@type": "Organization",
      "name": "Opportunity Hack",
      "sameAs": "https://www.ohack.dev"
    }
  };

  return(
    <LayoutContainer key="ham" container>           
    <Head>
      <title>{title}</title>
        <script
          key="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    </Head>

    <ProjectsContainer>        
    {!user && loginCallToAction}
    <div>This project is just one of many! Head over to <Link href="/nonprofits">projects</Link> to see them all</div>
    <ProjectsGrid container>
      <ProblemStatement
      key={problem_statement.id}
      problem_statement_id={problem_statement.id}
      user={user}              
      />
      </ProjectsGrid>
  </ProjectsContainer>
</LayoutContainer>
  );
}