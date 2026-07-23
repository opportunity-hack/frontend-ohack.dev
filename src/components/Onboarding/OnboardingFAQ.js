import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HelpIcon from '@mui/icons-material/Help';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LaptopIcon from '@mui/icons-material/Laptop';
import FeedIcon from '@mui/icons-material/Feed';
import { useEnv } from '../../context/env.context';
import InteractiveFAQ from '../Hackathon/InteractiveFAQ';
import StepHeader from './StepHeader';

/**
 * OnboardingFAQ component
 * Comprehensive FAQ section addressing common questions for new members
 */
const OnboardingFAQ = () => {
  const answerFontSize = '1.1rem';
  const { slackSignupUrl } = useEnv();
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search term changes
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // FAQ data organized by categories
  const faqData = [
    // Getting Started questions
    {
      question: "How do I get started with Opportunity Hack?",
      answer: (
        <>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            Welcome to Opportunity Hack! Here's a quick guide to get you started:
          </Typography>
          <ol>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Join our Slack community</strong> - This is where most of our communication happens.
                <a href={slackSignupUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 5 }}>
                  Join here!
                </a>
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Introduce yourself</strong> - Post an introduction in the #introductions channel to connect with other members.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Log in on ohack.dev</strong> - Use the Log In button (most people sign in with Google) to get a profile,
                submit applications, and track volunteer hours. Note this is <em>separate</em> from your Slack account — you'll
                want both; see the <a href="/signup">signup guide</a> if you're not on our Slack yet.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Join a hackathon</strong> - Find the next event at{' '}
                <a href="/hack">ohack.dev/hack</a> and apply as a hacker, mentor, judge, or volunteer right on the event page.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Explore projects</strong> - Browse all projects at{' '}
                <a href="/projects">ohack.dev/projects</a> — each project page links to its own Slack channel where the work happens.
              </Typography>
            </li>
          </ol>
        </>
      ),
      icon: "🚀"
    },
    {
      question: "Do I need to be an experienced developer to join?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Not at all! We welcome members of all skill levels, from beginners to seasoned professionals. 
          Many of our projects have tasks suitable for various experience levels, and it's a great place to learn. 
          We encourage a collaborative, mentorship-driven environment where everyone can contribute and grow.
          If you're new to coding, just let us know, and we can help find appropriate ways for you to contribute and learn.
        </Typography>
      ),
      icon: "👩‍💻"
    },
    {
      question: "How much time am I expected to commit?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Opportunity Hack is flexible and designed to accommodate various levels of availability. 
          You can contribute as much or as little time as you have available. Some members participate 
          only during hackathon events, while others contribute to ongoing projects a few hours per week. 
          When joining a project team, it's good to communicate your availability upfront so the team can plan accordingly.
        </Typography>
      ),
      icon: "⏰"
    },

    // Community questions
    {
      question: "How can I connect with other members?",
      answer: (
        <>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            There are several ways to connect with other Opportunity Hack members:
          </Typography>
          <ul>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Slack channels</strong> - Join discussions in our topic-based channels.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Office hours</strong> - Drop into our weekly{' '}
                <a href="/office-hours">office hours</a> to meet organizers and other members live.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Project teams</strong> - Join a project&apos;s Slack channel to collaborate closely with other members.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>In-person hackathons</strong> - Our in-person events are the best way to meet the community face-to-face.
              </Typography>
            </li>
          </ul>
        </>
      ),
      icon: "👥"
    },
    {
      question: "Is there a code of conduct?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Yes, we have a comprehensive Code of Conduct that all members are required to follow. It emphasizes respect,
          inclusivity, and professional behavior. We're committed to providing a harassment-free, welcoming environment
          for everyone regardless of gender, sexual orientation, disability, physical appearance, body size, race, or religion.
          You can read the full <a href="/hack/code-of-conduct">Code of Conduct here</a>. If you experience any issues,
          please contact an organizer immediately.
        </Typography>
      ),
      icon: "📜"
    },
    {
      question: "Who runs Opportunity Hack?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Opportunity Hack is managed by a dedicated team of volunteers with support from corporate sponsors. 
          Our core organizers include experienced developers, nonprofit professionals, and community builders 
          who coordinate events, maintain infrastructure, and ensure the community runs smoothly. We also have 
          community moderators who help maintain our Code of Conduct and create a welcoming environment. 
          Many of our long-term members take on leadership roles in specific projects or initiatives. 
          All of us are united by a passion for using technology to support nonprofit organizations.
        </Typography>
      ),
      icon: "👨‍👩‍👧‍👦"
    },

    // Projects questions
    {
      question: "How do I join an existing project?",
      answer: (
        <>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            To join an existing project:
          </Typography>
          <ol>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Browse projects</strong> - Go to <a href="/projects">ohack.dev/projects</a> and look for projects
                tagged "Needs Help" — those are actively looking for contributors. Projects tagged "Live" are already in
                production and generally don't need new volunteers.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Flip the "Want to help?" switch</strong> - On the project page, sign in and slide the
                "Want to help?" toggle to raise your hand as a helper — it tells us and the community you're on board.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Join the project's Slack channel</strong> - Every project page has a "Join #channel" button.
                Say hello in the channel and ask where you can help — that's where the people working on it coordinate.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Check the GitHub repo</strong> - Every project page has a "Code &amp; Tasks" section right
                below the description, listing each repository — including repos built by teams at past hackathons —
                with open-issue counts and the top open tickets shown right on the page. Reading the README and open
                issues is the fastest way to find something concrete to pick up.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>No issues yet? Create them</strong> - Pull the code down, run it, and think like a product
                manager: write GitHub Issues for the work you find. We document all work as Issues because closed
                tickets give you public credit for your contributions — and writing good tickets is itself a
                contribution.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Join it at a hackathon</strong> - Most project work happens with a team during an event, so the
                biggest on-ramp is applying to the next hackathon at <a href="/hack">ohack.dev/hack</a> and picking that
                project with your team.
              </Typography>
            </li>
          </ol>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            Activity varies between events — if a channel is quiet, don't be discouraged. Ask in #general or come to
            office hours and we'll point you at a project that needs what you bring.
          </Typography>
        </>
      ),
      icon: "🤝"
    },
    {
      question: "Can I propose a new project idea?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Absolutely — with one important note: our projects start from a real nonprofit's need, not from a solution
          looking for a user. If you know a nonprofit that could use technical help, point them to{' '}
          <a href="/nonprofits">ohack.dev/nonprofits</a> to submit their challenge — that's how new projects are born.
          If you have an idea but no nonprofit partner yet, share it in Slack or bring it to{' '}
          <a href="/office-hours">office hours</a> and we can help figure out whether there's an organization it would serve.
        </Typography>
      ),
      icon: "💡"
    },
    {
      question: "What technologies/skills are most needed?",
      answer: (
        <>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            We need a wide range of skills and technologies to support various nonprofit needs. Currently, some of the most requested skills include:
          </Typography>
          <ul>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Web development</strong> - Frontend (React, Vue) and backend (Node.js, Python/Django)
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Mobile development</strong> - React Native, Flutter, or native iOS/Android
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Data science and analytics</strong> - For helping nonprofits make sense of their data
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>UX/UI design</strong> - Creating accessible, user-friendly interfaces
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>DevOps</strong> - Setting up deployment pipelines and maintaining infrastructure
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Project management</strong> - Coordinating team efforts and communicating with nonprofits
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Technical writing</strong> - Creating documentation for users and future maintainers
              </Typography>
            </li>
          </ul>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            However, don't worry if your skills aren't on this list. We value diverse perspectives and there's almost always a way to contribute regardless of your background.
          </Typography>
        </>
      ),
      icon: "🛠️"
    },

    // Events questions
    {
      question: "When is your next hackathon?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          The single source of truth for upcoming events is <a href="/hack">ohack.dev/hack</a> — every upcoming and past
          hackathon is listed there, and each event page has the dates, location, schedule, and application forms.
          Our flagship in-person event happens in the fall in Arizona, with other events through the year. New events
          are also announced in Slack and on the <a href="/blog">blog</a>, typically several weeks in advance so you
          have time to apply and form a team.
        </Typography>
      ),
      icon: "📅"
    },
    {
      question: "How do virtual hackathons work?",
      answer: (
        <>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            Our virtual hackathons follow this general structure:
          </Typography>
          <ol>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Kickoff</strong> - Nonprofit representatives present their challenges
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Team formation</strong> - Participants organize into teams based on interests and skills
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Hacking period</strong> - Teams work on solutions (typically 24-72 hours)
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Check-ins</strong> - Regular virtual sessions for teams to share progress and get help
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Presentations</strong> - Teams demonstrate their solutions
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Next steps</strong> - Planning for continued development after the event
              </Typography>
            </li>
          </ol>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            We use Slack, Zoom, and collaborative tools to facilitate communication and coordination during the event. Technical mentors are available to provide guidance throughout the hackathon.
          </Typography>
        </>
      ),
      icon: "🏠"
    },
    {
      question: "Are hackathons beginner-friendly?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Yes, our hackathons are designed to be inclusive for participants of all skill levels, including beginners. 
          We provide mentorship, technical support, and plenty of guidance throughout the event. Before each hackathon, 
          we host preparatory workshops to help newcomers get familiar with relevant technologies and concepts. 
          We also encourage team formation that balances experience levels, so beginners can learn from more seasoned developers. 
          If you're new to coding or hackathons, just let us know when you register, and we'll ensure you're placed in a supportive team 
          with appropriate tasks. Remember, hackathons are as much about learning as they are about building!
        </Typography>
      ),
      icon: "🌱"
    },

    // Technical questions
    {
      question: "How do you handle project hosting and deployment?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Projects are hosted on GitHub under the Opportunity Hack organization, which provides version control and
          collaboration tools — each project page links to its repository. For deployment, teams use cloud platforms
          like AWS, fly.io, and Google Cloud depending on the project's needs; Opportunity Hack covers initial hosting
          costs (up to $15/month plus up to $250 in one-time costs), and nonprofits can take over as a project grows.
          We prioritize sustainable, low-maintenance hosting that nonprofits can manage long-term with minimal
          technical expertise.
        </Typography>
      ),
      icon: "☁️"
    },
    {
      question: "Who owns the intellectual property of projects?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          All code created within Opportunity Hack is typically open source and licensed under permissive licenses like MIT or Apache 2.0. 
          This approach ensures that nonprofits have full access to their solutions while contributors can showcase their work. 
          The nonprofit partners receive the rights to use and modify the software for their needs, while the code remains publicly 
          available for others to learn from and potentially adapt for similar use cases. In special cases where nonprofits have specific 
          IP requirements, we can work with them to establish appropriate licensing terms, but our default is open source to maximize 
          community benefit and project sustainability.
        </Typography>
      ),
      icon: "©️"
    },
    {
      question: "What happens to projects after hackathons end?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Unlike traditional hackathons, the event is the beginning, not the end. Winning teams are invited to keep
          building for roughly three months after the event, turning their prototype into production software with
          regular check-ins along the way. A project counts as finished when it meets our{' '}
          <a href="/about/completion">Definition of Done</a>: deployed to production, signed off by the nonprofit,
          documented, secured, and open-sourced. After that, the project shows as "Live" on the website, we check in
          with the nonprofit quarterly, and maintenance needs are picked up by volunteers from the community. Some
          projects also evolve over multiple hackathons, with new teams building on previous work. Our goal is lasting
          impact, not weekend prototypes.
        </Typography>
      ),
      icon: "🔄"
    },

    // Miscellaneous questions
    {
      question: "Can I include my Opportunity Hack contributions on my resume?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Absolutely! We encourage members to showcase their Opportunity Hack contributions on resumes, portfolios, and LinkedIn profiles. 
          These projects demonstrate real-world experience, teamwork, and a commitment to social impact—qualities that many employers value. 
          When listing your contributions, include specific technical skills utilized, your role in the team, and the impact of the project on
          the nonprofit. Because all our work happens in the open, a recruiter can review your entire portfolio: your GitHub commits and the
          issue tickets you wrote and closed, your communication in public Slack channels, your team's demo videos, and your public
          ohack.dev profile page. Volunteers can also request a signed verification letter directly through the website (find the letters link
          on the event page you participated in), and many of our corporate partners recognize Opportunity Hack experience favorably during
          hiring processes.
        </Typography>
      ),
      icon: "📄"
    },
    {
      question: "How can I become more involved in the community?",
      answer: (
        <>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            There are many ways to deepen your involvement in Opportunity Hack:
          </Typography>
          <ul>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Mentor at a hackathon</strong> - Guide teams through scoping, architecture, and getting unstuck. Apply on any event page.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Judge an event</strong> - Evaluate final projects and help decide the winners. Apply on any event page.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Help run events</strong> - Volunteer for check-in, logistics, photography, and more — no coding required.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Help with nonprofit outreach</strong> - Connect us with organizations that could use free software.
              </Typography>
            </li>
            <li>
              <Typography paragraph sx={{ fontSize: answerFontSize }}>
                <strong>Sponsor or recruit</strong> - Introduce your company to <a href="/sponsor">sponsorship</a> opportunities.
              </Typography>
            </li>
          </ul>
          <Typography paragraph sx={{ fontSize: answerFontSize }}>
            Reach out in Slack or come to <a href="/office-hours">office hours</a> and tell us what you'd like to take on.
          </Typography>
        </>
      ),
      icon: "🌟"
    },
    {
      question: "How is Opportunity Hack funded?",
      answer: (
        <Typography paragraph sx={{ fontSize: answerFontSize }}>
          Opportunity Hack operates through a combination of corporate sponsorships, individual donations, and in-kind support. 
          Our corporate partners provide financial resources, volunteer time from their employees, and often technical infrastructure. 
          We maintain a lean operation with minimal overhead costs, as most of our work is done by volunteers. Funds are primarily used 
          for hackathon expenses, technical infrastructure, and occasionally small stipends for long-term project maintenance. We're 
          committed to transparency in our finances, and information about our sponsors and how funds are used is available upon request. 
          As a nonprofit initiative ourselves, we're focused on maximizing impact rather than generating revenue.
        </Typography>
      ),
      icon: "💰"
    }
  ];

  // Organize FAQ by categories with icons
  const categories = [
    { name: "Getting Started", icon: <EmojiObjectsIcon /> },
    { name: "Community", icon: <GroupsIcon /> },
    { name: "Projects", icon: <CodeIcon /> },
    { name: "Events", icon: <CalendarMonthIcon /> },
    { name: "Technical", icon: <LaptopIcon /> },
    { name: "Volunteering", icon: <VolunteerActivismIcon /> },
    { name: "General", icon: <HelpIcon /> }
  ];

  return (
    <Box>
      <StepHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about getting involved"
      />

      {/* FAQ List */}
      <InteractiveFAQ faqData={faqData} searchTerm={searchTerm} answerFontSize={answerFontSize} questionFontSize="1.4rem"/>
    </Box>
  );
};

export default OnboardingFAQ;