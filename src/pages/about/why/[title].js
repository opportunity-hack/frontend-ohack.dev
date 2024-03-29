import { useRouter } from 'next/router'
import dynamic from "next/dynamic";
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';


import { TitleContainer, LayoutContainer, ProjectsContainer, LinkStyled, MoreNewsStyle} from '../../../styles/nonprofit/styles';
import { Typography } from '@mui/material';

const LoginOrRegister = dynamic(
    () => import("../../../components/LoginOrRegister/LoginOrRegister"),
    {
        ssr: false,
    }
);

const style = {
        fontSize: 14,
    };

const lookup = {
  'coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world': [
    'Coding for Good: How to Use Your Programming Skills to Make a Difference in the World',
    'This article will show you how you can use your coding skills to create solutions for social problems, such as poverty, education, health, and environment. You will learn about the benefits of coding for good, the challenges you might face, and the resources you can use to get started.',
    <div>
    <Typography variant="body1" style={style} paragraph>
        If you are in a coding bootcamp, you might be wondering how to improve
        your coding skills and prepare yourself for the real-world challenges of
        software engineering. One of the best ways to do that is to pick a
        project from Opportunity Hack <LinkStyled href="/nonprofits">as your project</LinkStyled>.
      </Typography>
      <Typography variant="body1" style={style} paragraph>
        Opportunity Hack is a global community of coders who volunteer their
        time and skills to work on nonprofit projects. You can join Opportunity
        Hack and choose from a variety of projects that match your interests and
        expertise. You can also find mentors, collaborators, and feedback from
        other coders who share your passion for social good.
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Why pick a project from Opportunity Hack?
      </Typography>
      <Typography variant="body1" style={style} paragraph>
        Picking a project from Opportunity Hack can help you learn coding in
        many ways, such as:
      </Typography>
    <Typography variant="body1" style={style} component="ul">
        <li>
            You will work on an <strong>ambiguous space</strong>, where the problem and the
            solution are not clearly defined. This will challenge you to think
            creatively, research, and experiment with different approaches. You
            will also learn how to communicate and validate your ideas with the
            nonprofit stakeholders and the end-users.
        </li>
        <li>
            You might <strong>involve coding on an existing code base</strong>, where you have
            to understand, modify, and improve someone else's code. This will
            teach you how to read and write clean, maintainable, and
            well-documented code. You will also learn how to use version control,
            testing, and debugging tools to ensure the quality and reliability of
            your code.
        </li>
        <li>
            You will <strong>help to do good in the world</strong>, by creating solutions that
            address real-world problems faced by nonprofit organizations and their
            beneficiaries. You will learn how to empathize with the users, design
            user-friendly interfaces, and implement features that meet their needs
            and expectations. You will also experience the satisfaction and joy of
            making a positive impact on society.
        </li>
        <li>
            You will <strong>not work on a solved problem that you can copy paste</strong>, but
            rather on a unique and innovative problem that requires your original
            and creative thinking. You will learn how to apply your coding skills
            to new and unfamiliar domains, and how to adapt and learn new
            technologies and frameworks as needed. You will also develop your
            problem-solving and critical thinking skills, which are essential for
            any software engineer.
        </li>
        <li>
            You will <strong>help to find a job</strong>, by building your portfolio, resume,
            and network. You will be able to showcase your work to potential
            employers, demonstrate your skills and abilities, and highlight your
            passion and motivation for coding. You will also be able to connect
            with other professionals, mentors, and recruiters who can help you
            with your career development and opportunities.
        </li>
        <li>
            Since work is done remotely it will <strong>require you to communicate</strong>, collaborate, and coordinate with your team members, mentors, and stakeholders. You will learn how to use different communication and collaboration tools, and how to manage your time, tasks, and expectations effectively. You will also develop your teamwork and leadership skills, which are essential for any software engineer.
        </li>
      </Typography>
      <Typography variant="h4" component="h2" mt={2} gutterBottom>
        How to pick a project from Opportunity Hack?
      </Typography>
      <Typography variant="body1" style={style} paragraph>
        Picking a project from Opportunity Hack is easy and fun. You can follow
        these simple steps:
      </Typography>
      <Typography variant="body1" style={style} component="ol">
        <li>
          <LinkStyled href="/nonprofits">Visit our project page</LinkStyled> and browse through the available
          projects. You can search for keywords that match your interests
          and expertise.
        </li>
        <li>
          Select a project that appeals to you and read the project description,
          requirements, and goals. You can also check the project status,
          progress, and feedback from other coders and mentors.
        </li>
        <li>
          Contact the project owner in the respective slack channel and express your interest and availability
          to join the project. You can also ask any questions or clarifications
          that you might have about the project.
        </li>
        <li>
          Once you are accepted to the project, you can start coding and
          collaborating with the project team. You can use the Opportunity Hack
          platform to communicate, share, and review your code. You can also
          seek help and guidance from the mentors and other coders.
        </li>
        <li>
          When you finish the project, you can submit your work and receive
          feedback and recognition from the project owner, the nonprofit
          organization, and the Opportunity Hack community. You can also add
          your project to your portfolio and resume, and share it with your
          network and potential employers.
        </li>
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Conclusion
      </Typography>
      <Typography variant="body1" style={style} paragraph>
        Picking a project from Opportunity Hack <LinkStyled href="/nonprofits">as your project</LinkStyled> is a great way
        to learn coding and improve your software engineering skills. You will
        not only create solutions for social good, but also challenge yourself,
        have fun, and grow as a coder. So what are you waiting for? Join
        Opportunity Hack today and start coding for a better world!
      </Typography>
    </div>,
    'Leverage your coding skills to tackle social issues like poverty, education, and healthcare. Discover the benefits and challenges of coding for good, along with resources to kickstart your journey.',
    'https://cdn.ohack.dev/ohack.dev/why/coding_for_good.webp'

  ],
  'why-you-should-join-opportunity-hack-and-code-for-social-impact': [
    'Why You Should Join Opportunity Hack and Code for Social Impact',
    'This article will introduce you to Opportunity Hack, a global community of coders who volunteer their time and skills to work on nonprofit projects. You will discover how Opportunity Hack can help you improve your coding skills, build your portfolio, network with other professionals, and make a positive impact on society.',
    <div>
    <Typography variant="body1" style={style}>
        As a college student learning to program and aspiring to become a software engineer, you're likely focused on mastering the fundamentals in class and building your technical skills. While these are crucial, there's another valuable learning experience many students miss out on: <strong>volunteering your coding skills to make a positive impact on the world.</strong> 
        <br/><br/>
        This is where Opportunity Hack comes in. It's a global community that connects passionate tech volunteers with non-profit organizations facing real-world challenges.
        <br/><br/>
        By joining Opportunity Hack, you can:
      </Typography>

      <ul style={{ listStyleType: "disc", paddingLeft: 20, fontSize: '13px' }}>
        <li>
          <Typography variant="body1" style={style}>
            <strong>Gain practical experience beyond the classroom:</strong> Opportunity Hack allows you to apply your coding skills to solve real problems faced by non-profit organizations. This is a unique opportunity to learn and practice beyond theoretical concepts, gaining valuable hands-on experience that most students wouldn't have access to otherwise.
          </Typography>
        </li>
        <li>
          <Typography variant="body1" style={style}>
            <strong>Build a strong portfolio:</strong> Completing a project for a real-world cause adds immense value to your portfolio. It showcases your technical skills, problem-solving abilities, and commitment to social responsibility, making you stand out from other applicants in the competitive job market.
          </Typography>
        </li>
        <li>
          <Typography variant="body1" style={style}>
            <strong>Network with professionals and like-minded individuals:</strong> Opportunity Hack connects you with a vibrant community of coders, mentors, and representatives from non-profit organizations. This opens doors to valuable networking opportunities, allowing you to learn from experienced professionals and build connections that can benefit your career in the long run.
        </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Make a difference in society:</strong> While there might be some initial challenges in completing a project, the satisfaction of using your skills to create a positive impact on a cause you care about is truly rewarding. This experience can shape your professional ethos and inspire you to contribute to social good throughout your career.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Learn valuable tools and technologies:</strong> Opportunity Hack projects often involve using real-world tools and technologies like Git, which may not be covered extensively in your academic curriculum. This gives you the chance to learn and gain practical experience with these essential tools, making you a more well-rounded and desirable candidate in the job market.
                            </Typography>
                        </li>
                    </ul>

                    <Typography variant="body1" style={style}>
                        Joining Opportunity Hack is a fantastic way to enhance your learning, build a strong portfolio, network with professionals, and contribute to a meaningful cause. Don't miss out on this unique opportunity to make a difference while shaping your future as a software engineer!
                    </Typography>
                </div>,
                'Leverage your coding skills for social good! Join Opportunity Hack, a global community connecting coders with nonprofits. Build your portfolio, network, gain real-world experience, and make a positive impact.',
                'https://cdn.ohack.dev/ohack.dev/why/college_students.webp'
            ],

            'how-to-find-and-work-on-nonprofit-projects-that-match-your-coding-interests-and-expertise': [
                'Laid off? How to Find and Work on Nonprofit Projects that Match Your Coding Interests and Expertise',
                'Being laid off is undoubtedly a challenging experience. While you focus on your job search, utilizing your tech skills to contribute to a meaningful cause can be incredibly rewarding. This article guides you through finding and working on impactful nonprofit projects that align with your coding expertise and interests.',
                <div>
                    <Typography variant="h5">Why Consider Nonprofits?</Typography>

                    <ul style={{ listStyleType: "disc", paddingLeft: 20, fontSize: '13px' }}>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Showcase your skills and dedication:</strong> Engaging in a nonprofit project demonstrates initiative and passion to potential employers. It shows you're actively honing your skills while seeking new opportunities, making you a more attractive candidate.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Make a positive impact:</strong> Contribute your expertise to solve real-world challenges faced by non-profit organizations. This allows you to give back to the community and use your skills for a purpose beyond personal gain.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Expand your skillset:</strong> Many non-profit projects involve working with diverse technologies and problem-solving approaches. This offers valuable learning opportunities to broaden your technical knowledge and potentially discover new areas of interest.
                            </Typography>
                        </li>
                    </ul>

                    <Typography variant="h5">Finding the Right Project</Typography>

                    <ul style={{ listStyleType: "disc", paddingLeft: 20, fontSize: '13px' }}>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Identify your strengths and passions:</strong> Reflect on your coding strengths, preferred technologies, and causes you care about. This helps you find projects that align with your technical expertise and personal values.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Explore online platforms:</strong> Utilize platforms like <LinkStyled href="https://www.idealist.org/en">Idea List</LinkStyled>,  <LinkStyled href="https://www.catchafire.org">CatchAFire.org</LinkStyled> or <LinkStyled href="https://www.ohack.dev">Opportunity Hack</LinkStyled> to connect with non-profit organizations seeking technical volunteers. Filter your search based on your location, interests, and skillsets to find suitable projects.  At Opportunity Hack, we're different because we crowd-source volunteers from the complete software engineering lifecycle, from requirements gathering with Product Managers, development with Software Engineers, Data Science, and to go-to-market with Product Marketing Managers (PMMs).
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Reach out directly:</strong> Contact non-profit organizations in your community whose mission resonates with you. Inquire about potential volunteer opportunities or suggest projects you could contribute to based on their needs and your skills.  For OHack, join <LinkStyled href="https://slack.ohack.dev">our Slack</LinkStyled> and say hello!
                            </Typography>
                        </li>
                    </ul>

                    <Typography variant="h5">Delivering Quality Work</Typography>

                    <ul style={{ listStyleType: "disc", paddingLeft: 20, fontSize: '13px' }}>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Communicate effectively:</strong> Clearly understand the project requirements and expectations set by the organization. Maintain clear and consistent communication throughout the development process.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Meet deadlines and deliver results:</strong> Deliver high-quality work on time and within agreed-upon scope. This builds trust and strengthens your professional reputation within the nonprofit community.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" style={style}>
                                <strong>Be open to learning and feedback:</strong> Embrace opportunities to learn new technologies and adapt to specific project needs. Be receptive to feedback from the organization and use it to continuously improve your work.
                            </Typography>
                        </li>
                    </ul>

                    <Typography variant="body1" style={style}>
                        Contributing to a meaningful project during your job search not only benefits society but also demonstrates valuable qualities to potential employers. Remember, even if you haven't coded professionally, platforms like Opportunity Hack can be a starting point to learn and contribute, regardless of your experience level. Embrace this opportunity to showcase your skills, make a positive impact, and stay engaged in the tech field while you search for your next exciting role.
                    </Typography>
                </div>,
                'Leverage your coding skills during your job search! This guide helps you find and work on nonprofit projects that align with your expertise, contribute to society, and showcase your dedication to potential employers.',
                'https://cdn.ohack.dev/ohack.dev/why/work_for_nonprofit.webp'
            ]
        }


        export default function Why() {
                const router = useRouter();
                const { title } = router.query;
            
            let content = "This is the content for the default title";
                if (title && lookup[title]) {
                        content = lookup[title];         
                }  

            return (
                <div>
                <LayoutContainer key="why" container>                
                    <TitleContainer container>

                    <Image src={content[4]} alt="Why Opportunity Hack" width={300} height={300} />
                        <Typography variant="h2">
                            {content[0]}
                        </Typography>      

                        <Link prefetch={false} href="/about/why">        
                        <MoreNewsStyle>        
                        <ArrowBackIcon/>
                        Back to why
                        </MoreNewsStyle>   
                        </Link>
    
                    </TitleContainer>

                    <ProjectsContainer mt={"50px"}>
                        <Typography variant="body1" style={style} mb={1.5}>
                        {content[1]}
                    </Typography>

                    {content[2]}
                    
                    <LoginOrRegister introText="Ready to join us?" previousPage={"/about/mentors"} />

                </ProjectsContainer>
            </LayoutContainer>
                </div>
            )
        }

        export async function getStaticPaths(title) {    

                // Get all keys from lookup object
                const paths = Object.keys(lookup).map((title) => {
                        return {
                                params: {
                                        title: title
                                }
                        }
                });
                
                return {
                        paths: paths,
                        fallback: true
                }
        }

        export async function getStaticProps({ params = {} } = {}) {
                var title = lookup[params.title][0];
                var metaDescription = lookup[params.title][3];
                var image = lookup[params.title][4];
                
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
                            content: image,
                            key: "ogimage",
                        },
                        {
                            property: "twitter:image",
                            content: image,
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
                    ],
                },
            };
        }
