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

/**
 * OnboardingFAQ component
 * Comprehensive FAQ section addressing common questions for new members
 */
const OnboardingFAQ = () => {
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
          <Typography paragraph>
            Welcome to Opportunity Hack! Here's a quick guide to get you started:
          </Typography>
          <ol>
            <li>
              <Typography paragraph>
                <strong>Join our Slack community</strong> - This is where most of our communication happens.
                <a href={slackSignupUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 5 }}>
                  Join here!
                </a>
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Introduce yourself</strong> - Post an introduction in the #introductions channel to connect with other members.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Find a buddy</strong> - Request a buddy through this onboarding flow or in the #buddy-matching channel.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Explore projects</strong> - Browse current projects in the #project-matching channel or on our website.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Attend events</strong> - Join our next hackathon, workshop, or virtual meetup announced in #events.
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
        <Typography paragraph>
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
        <Typography paragraph>
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
          <Typography paragraph>
            There are several ways to connect with other Opportunity Hack members:
          </Typography>
          <ul>
            <li>
              <Typography paragraph>
                <strong>Slack channels</strong> - Join discussions in our topic-based channels.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Virtual events</strong> - Attend our regular community calls, workshops, and social events.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Project teams</strong> - Join a project team to collaborate closely with other members.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Buddy system</strong> - Get paired with an experienced member who can introduce you around.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>In-person hackathons</strong> - When available, our in-person events are a great way to network.
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
        <Typography paragraph>
          Yes, we have a comprehensive Code of Conduct that all members are required to follow. It emphasizes respect, 
          inclusivity, and professional behavior. We're committed to providing a harassment-free, welcoming environment 
          for everyone regardless of gender, sexual orientation, disability, physical appearance, body size, race, or religion. 
          You can find the full Code of Conduct on our website or in the #rules channel on Slack. If you experience any issues, 
          please contact a community moderator immediately.
        </Typography>
      ),
      icon: "📜"
    },
    {
      question: "Who runs Opportunity Hack?",
      answer: (
        <Typography paragraph>
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
          <Typography paragraph>
            To join an existing project:
          </Typography>
          <ol>
            <li>
              <Typography paragraph>
                <strong>Browse current projects</strong> - Check the #project-matching channel on Slack or the Projects section on our website.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Express interest</strong> - Comment on the project post or message the project lead.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Attend an onboarding meeting</strong> - Most teams have a process to bring new members up to speed.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Start small</strong> - Begin with smaller tasks or issues labeled "good for beginners."
              </Typography>
            </li>
          </ol>
          <Typography paragraph>
            We encourage teams to be open to new members, but some projects may have specific skill requirements or be in a phase where onboarding is challenging. Don't be discouraged if one project isn't a good fit—there are always new opportunities emerging.
          </Typography>
        </>
      ),
      icon: "🤝"
    },
    {
      question: "Can I propose a new project idea?",
      answer: (
        <Typography paragraph>
          Absolutely! We encourage members to propose new project ideas, especially those addressing nonprofit needs. 
          To propose a new project, share your idea in the #project-ideas channel on Slack with details about the problem 
          it addresses, potential solution, and technologies involved. Community members will provide feedback, and if there's 
          sufficient interest, you can form a team to work on it. If you already have a nonprofit partner in mind, that's great! 
          If not, our nonprofit outreach team can potentially help connect you with organizations that might benefit from your solution.
        </Typography>
      ),
      icon: "💡"
    },
    {
      question: "What technologies/skills are most needed?",
      answer: (
        <>
          <Typography paragraph>
            We need a wide range of skills and technologies to support various nonprofit needs. Currently, some of the most requested skills include:
          </Typography>
          <ul>
            <li>
              <Typography paragraph>
                <strong>Web development</strong> - Frontend (React, Vue) and backend (Node.js, Python/Django)
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Mobile development</strong> - React Native, Flutter, or native iOS/Android
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Data science and analytics</strong> - For helping nonprofits make sense of their data
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>UX/UI design</strong> - Creating accessible, user-friendly interfaces
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>DevOps</strong> - Setting up deployment pipelines and maintaining infrastructure
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Project management</strong> - Coordinating team efforts and communicating with nonprofits
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Technical writing</strong> - Creating documentation for users and future maintainers
              </Typography>
            </li>
          </ul>
          <Typography paragraph>
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
        <Typography paragraph>
          We typically organize multiple hackathons throughout the year, both virtual and in-person (when possible). 
          Our flagship events usually occur in the spring and fall. For the most up-to-date information on upcoming 
          hackathons, check the #events channel on Slack, subscribe to our newsletter, or visit the Events page on our website. 
          Hackathons are announced at least 4-8 weeks in advance to give participants time to prepare. Between major hackathons, 
          we also organize smaller coding sprints and workshops that you're welcome to join!
        </Typography>
      ),
      icon: "📅"
    },
    {
      question: "How do virtual hackathons work?",
      answer: (
        <>
          <Typography paragraph>
            Our virtual hackathons follow this general structure:
          </Typography>
          <ol>
            <li>
              <Typography paragraph>
                <strong>Kickoff</strong> - Nonprofit representatives present their challenges
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Team formation</strong> - Participants organize into teams based on interests and skills
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Hacking period</strong> - Teams work on solutions (typically 24-72 hours)
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Check-ins</strong> - Regular virtual sessions for teams to share progress and get help
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Presentations</strong> - Teams demonstrate their solutions
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Next steps</strong> - Planning for continued development after the event
              </Typography>
            </li>
          </ol>
          <Typography paragraph>
            We use Slack, Zoom, and collaborative tools to facilitate communication and coordination during the event. Technical mentors are available to provide guidance throughout the hackathon.
          </Typography>
        </>
      ),
      icon: "🏠"
    },
    {
      question: "Are hackathons beginner-friendly?",
      answer: (
        <Typography paragraph>
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
        <Typography paragraph>
          We typically host projects on GitHub under the Opportunity Hack organization, which provides version control and collaboration tools. 
          For deployment, we use a variety of platforms depending on the project's needs. Many web applications are deployed on Heroku, Vercel, 
          or Netlify, which offer free tiers for nonprofit projects. For more complex applications requiring custom infrastructure, we work with 
          cloud providers like AWS, GCP, or Azure, often utilizing their nonprofit credits programs. Our DevOps team helps set up deployment 
          pipelines and monitors application health. We prioritize sustainable, low-maintenance hosting solutions that nonprofits can manage 
          long-term with minimal technical expertise.
        </Typography>
      ),
      icon: "☁️"
    },
    {
      question: "Who owns the intellectual property of projects?",
      answer: (
        <Typography paragraph>
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
        <Typography paragraph>
          Unlike traditional hackathons, we emphasize long-term project development and sustainability. After a hackathon ends, 
          projects typically enter our "continued development" phase. Teams often continue working on their solutions, refining 
          features, addressing bugs, and ensuring the project meets the nonprofit's needs. We have a dedicated project maintenance 
          team that helps ensure projects remain active and supported. For projects that have reached a stable state, we provide 
          documentation and training to nonprofits on how to use and maintain their solutions. Some projects may evolve over multiple 
          hackathons, with new teams building upon previous work. Our goal is to create lasting impact, not just weekend prototypes.
        </Typography>
      ),
      icon: "🔄"
    },

    // Miscellaneous questions
    {
      question: "Can I include my Opportunity Hack contributions on my resume?",
      answer: (
        <Typography paragraph>
          Absolutely! We encourage members to showcase their Opportunity Hack contributions on resumes, portfolios, and LinkedIn profiles. 
          These projects demonstrate real-world experience, teamwork, and a commitment to social impact—qualities that many employers value. 
          When listing your contributions, include specific technical skills utilized, your role in the team, and the impact of the project on 
          the nonprofit. We can provide verification of your participation upon request, and many of our corporate partners recognize Opportunity 
          Hack experience favorably during hiring processes. Additionally, your GitHub contributions through our organization are public and can 
          serve as concrete examples of your coding abilities.
        </Typography>
      ),
      icon: "📄"
    },
    {
      question: "How can I become more involved in the community?",
      answer: (
        <>
          <Typography paragraph>
            There are many ways to deepen your involvement in Opportunity Hack:
          </Typography>
          <ul>
            <li>
              <Typography paragraph>
                <strong>Become a project lead</strong> - Coordinate a team working on a nonprofit solution
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Volunteer as a mentor</strong> - Help guide newer members and share your expertise
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Join the organizing team</strong> - Help plan events and community initiatives
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Lead workshops</strong> - Share your knowledge through educational sessions
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Become a buddy</strong> - Help onboard and support new community members
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Help with outreach</strong> - Connect with nonprofits and identify potential projects
              </Typography>
            </li>
          </ul>
          <Typography paragraph>
            Express your interest in taking on these roles in the #community-involvement channel on Slack, or reach out to one of our community managers.
          </Typography>
        </>
      ),
      icon: "🌟"
    },
    {
      question: "How is Opportunity Hack funded?",
      answer: (
        <Typography paragraph>
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
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Everything you need to know about Opportunity Hack
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Search bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search the FAQ..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Still have questions notice */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FeedIcon color="primary" />
        <Typography variant="body1">
          Don't see your question? Ask in the <strong>#help</strong> channel on our Slack workspace!
        </Typography>
      </Box>

      {/* Interactive FAQ component */}
      <InteractiveFAQ 
        faqData={faqData} 
        title="Common Questions"
        searchTerm={searchTerm}
      />
    </Box>
  );
};

export default OnboardingFAQ;