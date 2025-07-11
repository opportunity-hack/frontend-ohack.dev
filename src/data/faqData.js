import { Typography, Button } from "@mui/material";

const faqData = [
    {
      question: "What is Opportunity Hack?",
      answer:
        "Opportunity Hack is a hackathon focused on creating technology solutions for social good. We bring together software engineers, product managers, UX designers, and project managers to develop innovative solutions for nonprofits around the world.",
      icon: "💡",
    },
    {
      question: "What makes Opportunity Hack unique?",
      answer: (
        <>
          <Typography variant="body1" paragraph>
            Opportunity Hack stands out in several ways:
          </Typography>
          <Typography component="ol">
            <li>
              <strong>Real-world impact:</strong> We focus on creating lasting
              solutions for nonprofits, not just demo projects.
            </li>
            <li>
              <strong>Open-ended challenges:</strong> Unlike hackathons with
              predefined ideas, we present open-ended problems from nonprofits,
              encouraging truly innovative and tailored solutions.
            </li>
            <li>
              <strong>Code-centric approach:</strong> We minimize workshops to
              maximize coding time, emphasizing hands-on learning and
              development.
            </li>
            <li>
              <strong>Professional leadership:</strong> Our events are run by
              industry professionals passionate about coding for social good,
              not by students.
            </li>
            <li>
              <strong>Long-term support:</strong> We provide resources and
              mentorship for teams to continue development post-event.
            </li>
            <li>
              <strong>Recognition system:</strong> Our 'Hearts' system
              acknowledges ongoing volunteer contributions.
            </li>
            <li>
              <strong>Year-round community:</strong> We foster a strong network
              of socially-conscious technologists through continuous engagement.
            </li>
          </Typography>
          <Typography variant="body1" paragraph>
            This unique approach ensures meaningful projects, practical
            learning, and sustained impact in the nonprofit sector.
          </Typography>
        </>
      ),
      icon: "🌟",
    },
    {
      question: "When and where does Opportunity Hack take place?",
      answer:
        "Opportunity Hack hosts multiple events throughout the year, both in-person and virtually. Check our website for upcoming event dates and locations.",
      icon: "🗓️",
    },
    {
      question: "Who can participate?",
      answer:
        "Anyone passionate about using technology for social good can participate, including students, professionals, and hobbyists. We welcome participants of all skill levels, from beginners to experts.",
      icon: "👥",
    },
    {
      question: "Do I need to be a programmer to participate?",
      answer:
        "No! While coding skills are valuable, we also need designers, project managers, and individuals with domain expertise in various nonprofit sectors.",
      icon: "🖥️",
    },
    {
      question: "How do teams form?",
      answer:
        "Teams usually form at the beginning of the event. You can come with a pre-formed team or join one at the hackathon. We encourage diverse teams with a mix of skills.",
      icon: "🤝",
    },
    {
      question: "Do people sleep?",
      answer:
        "For in-person events, we provide a quiet space for participants to rest. However, many hackers choose to work through the night. For virtual events, you can sleep in your own bed!",
      icon: "💤",
    },
    {
      question: "What should I bring?",
      answer:
        "For in-person events, bring your laptop, charger, and any other devices you might need. If you want to sleep overnight, bring a pillow or something comfortable to wear that will keep you warm. For virtual events, ensure you have a stable internet connection.",
      icon: "🎒",
    },
    {
      question: "What if I'm in high school?",
      answer:
        "High school students are welcome to participate in Opportunity Hack. We encourage you to join a team with other students or professionals to learn and contribute to real-world projects. You must have a parent or guardian's permission to participate. If you win a prize, we will send it to your parent or guardian.",
      icon: "🎓",
    },
    {
      question: "Are there any costs involved?",
      answer: (
        <>
          Participation in Opportunity Hack is typically free for hackers. We
          provide meals, snacks, and drinks (thanks to sponsor funding) during
          in-person events.
          <br />
          <br />
          <Button variant="contained" color="primary" href="/sponsor">
            More about sponsorship
          </Button>
        </>
      ),
      icon: "💰",
    },
    {
      question: "What kind of projects can I work on?",
      answer:
        "Projects are focused on solving real-world problems for nonprofits. These can range from developing new websites or mobile apps to creating data analysis tools or improving existing systems.",
      icon: "🚀",
    },
    {
      question: "How long does the hackathon last?",
      answer:
        "The duration can vary, they are normally over a weekend, but our main events usually start Saturday morning and end Sunday evening.",
      icon: "⏱️",
    },
    {
      question: "What's the most common question mentors receive?",
      answer: (
        <>
          <Typography variant="body1" paragraph>
            One of the most common questions mentors receive is: "How do we
            scope our project to be achievable within the hackathon timeframe?"
          </Typography>
          <Typography variant="body1" paragraph>
            Mentors typically advise teams to:
          </Typography>
          <Typography component="ul">
            <li>Focus on a core, MVP (Minimum Viable Product) feature set</li>
            <li>Break the project into smaller, manageable tasks</li>
            <li>Prioritize functionality over perfect design initially</li>
            <li>
              Consider using existing libraries or APIs to speed up development
            </li>
            <li>
              Plan for a demo-ready product, not a fully polished solution
            </li>
            <li>Build your solution based on the judging criteria</li>
            <li>
              Start your demo pitches early, like Sunday morning to give you 3
              hours to build your video
            </li>
          </Typography>
          <Typography variant="body1">
            Remember, the goal is to create a working prototype that
            demonstrates your solution's potential impact for the nonprofit.
          </Typography>
        </>
      ),
      icon: "🌵",
    },
    {
      question: "What happens after the hackathon?",
      answer: (
        <>
          We encourage teams to continue working with nonprofits to implement
          and maintain their solutions. Opportunity Hack provides ongoing
          support through mentorship and resources. If your team has won a
          prize, we will also send prize money for completion of the project
          after nonprofit signoff.
          <br />
          <br />
          <Button variant="contained" color="primary" href="/about/completion">
            Learn More About Completion
          </Button>
        </>
      ),
      icon: "🌱",
    },
    {
      question: "How can I prepare for Opportunity Hack?",
      answer:
        "Familiarize yourself with common web and mobile development technologies. Review our past projects for inspiration. Come with an open mind and ready to learn!",
      icon: "📚",
    },
    {
      question: "Is there a code of conduct?",      
      answer: (
        <>
          Yes, we have a code of conduct that all participants must adhere to, ensuring a safe and inclusive environment for everyone.
          <br />
          <br />
          <Button variant="contained" color="primary" href="/hack/code-of-conduct">
            Code of Conduct
          </Button>
          <Button variant="contained" color="primary" href="/hack/liability-waiver">
            Liability Waiver
          </Button>          
          <Button variant="contained" color="primary" href="/hack/photo-release">
            Photo Release Agreement
          </Button>
          
        </>
      ),
      icon: "📜",
    },
    {
      question: "How can I stay updated about future events?",
      answer:
        "Follow us on social media and join our Slack community for the latest updates and announcements.",
      icon: "📢",
    },
    {
      question: "Do you offer longer-term opportunities beyond weekend hackathons?",
      answer: (
        <>
          <Typography variant="body1" paragraph>
            Yes! Our Software Engineering & Product Summer Internship Program offers a deeper, longer-term experience that's quite different from our weekend hackathons:
          </Typography>
          <Typography component="ul">
            <li><strong>Duration:</strong> Full summer program vs. weekend events</li>
            <li><strong>Commitment:</strong> 10-15 hours weekly vs. intensive weekend sprints</li>
            <li><strong>Scope:</strong> Complete product development lifecycle vs. rapid prototyping</li>
            <li><strong>Mentorship:</strong> Regular ongoing mentorship vs. event-based guidance</li>
            <li><strong>Portfolio:</strong> Production-ready software with real users vs. demo projects</li>
            <li><strong>Flexibility:</strong> Remote participation with flexible scheduling</li>
          </Typography>
          <Typography variant="body1" paragraph>
            Perfect for students and early career professionals in software engineering, product management, UX/UI design, data science, and DevOps who want to build meaningful experience while creating lasting social impact.
          </Typography>
          <Typography variant="body1">
            The program culminates in a demo day with partner organizations, giving you real-world experience presenting to stakeholders and seeing your work make a tangible difference.
          </Typography>
        </>
      ),
      icon: "🎯",
    },
];

export default faqData;