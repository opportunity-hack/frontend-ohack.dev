import dynamic from "next/dynamic";
import Link from 'next/link';
import { Button } from '@mui/material';

import { TitleContainer, LayoutContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import { Typography } from '@mui/material';

const LoginOrRegister = dynamic(
    () => import("../../../components/LoginOrRegister/LoginOrRegister"),
    {
        ssr: false,
    }
);

const style = {
        fontSize: 13,
    };

const links = [
  [ 'coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world', 'Coding for Good: How to Use Your Programming Skills to Make a Difference in the World' ],
  [ 'why-you-should-join-opportunity-hack-and-code-for-social-impact', 'Why You Should Join Opportunity Hack and Code for Social Impact' ],
  [ 'how-to-find-and-work-on-nonprofit-projects-that-match-your-coding-interests-and-expertise', 'How to Find and Work on Nonprofit Projects that Match Your Coding Interests and Expertise' ],

]

export default function WhyIndex() {

  return (
    <div>
      <LayoutContainer key="mentorship" container>
    
    <TitleContainer container>
    
      <Typography variant="h2">
        Why Hack with Us?
      </Typography>      
    </TitleContainer>

    <ProjectsContainer mt={"50px"}>
    <Typography variant="body1" style={style} mb={2}>
      We'll give you some reasons...
    </Typography>

    { links.map((link, index) => {
      return (
        <Typography mt={2} key={index} variant="body1" style={style}>
          <Button variant="outlined" size="large"><Link href={`/about/why/${link[0]}`}>{link[1]}</Link></Button>
        </Typography>
      )
    }
    )}


    
    
      
      <LoginOrRegister introText="Ready to join us as a mentor?" previousPage={"/about/mentors"} />

    </ProjectsContainer>
  </LayoutContainer>
    </div>
  )
}


