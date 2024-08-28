import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import { CircularProgress, Container, Grid } from "@mui/material";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import HackathonHeader from "../../components/Hackathon/HackathonHeader";
import { Typography, Button } from "@mui/material";
import VolunteerList from '../../components/Hackathon/VolunteerList';

// Dynamically import components for better code splitting
const DonationProgress = dynamic(
  () => import("../../components/Hackathon/DonationProgress"),
  { ssr: false }
);
const EventLinks = dynamic(
  () => import("../../components/Hackathon/EventLinks"),
  { ssr: false }
);
const NonprofitList = dynamic(
  () => import("../../components/Hackathon/NonprofitList"),
  { ssr: false }
);
const EventCountdown = dynamic(
  () => import("../../components/Hackathon/EventCountdown"),
  { ssr: false }
);
const EventConstraints = dynamic(
  () => import("../../components/Hackathon/EventConstraints"),
  { ssr: false }
);
const InteractiveFAQ = dynamic(
  () => import("../../components/Hackathon/InteractiveFAQ"),
  { ssr: false }
);

const mentors = [
  {
    "Timestamp": "8/19/2024 6:25:41",
    "Email Address": "momo@marcusengineering.com",
    "Your Name": "Mark Omo",
    "Your pronouns (Optional)": "He/Him",
    "What company are you working for?": "Marcus Engineering",
    "Short bio (Optional)": "Leads the Engineering team at Marcus Engineering, Background in regulated device design in the Medical, Industrial, Aerospace, and Consumer market segments, Former System Engineering Lead at Google, may have won a few Hackathons in the past.",
    "Can you send us a picture of you? (Optional)": "https://drive.google.com/open?id=1jGdXSav2DBfc6Aetmicvo52-isgcFW4m",
    "LinkedIn Profile (Optional)": "https://www.linkedin.com/in/markomo/",
    "Joining us in-person at ASU Tempe?": "No",
    "What kind of brain power can you help supply us with?": "Software engineering",
    "How many times have you participated in Opportunity Hack?": "This will be the 3rd time ☘️",
    "Software Engineering Specifics": "Back-end (Java, Python, Ruby, etc), Data Science & Machine Learning, Data Analysis, AWS, Google Cloud, Heroku, GitHub ninja",
    "Which days will be you available?": "Oct 13th: Sunday Early Morning (7am - 9am), Sunday Morning (9am - 12pm PST), Sunday Afternoon (1p - 3p PST)",
    "Which country are you in?": "USA",
    "Which state are you in?": "AZ",
    "Do you agree to our code of conduct? https://www.ohack.dev/hack/code-of-conduct": "Yes",
    "Any questions or comments for us?": "",
    "Shirt Size?": "4XL"
  },
  {
    "Timestamp": "8/21/2024 1:46:05",
    "Email Address": "hparanjape@meta.com",
    "Your Name": "Hrishikesh Paranjape",
    "Your pronouns (Optional)": "",
    "What company are you working for?": "Meta Platforms Inc",
    "Short bio (Optional)": "I am a software engineer and a computer science researcher with industry experience of 12 years.",
    "Can you send us a picture of you? (Optional)": "https://drive.google.com/open?id=1OAKGAXXNPqPGPH8DQKVuE0jcEu79nlwc",
    "LinkedIn Profile (Optional)": "https://www.linkedin.com/in/hrishikeshparanjape",
    "Joining us in-person at ASU Tempe?": "Yes!",
    "What kind of brain power can you help supply us with?": "Software engineering",
    "How many times have you participated in Opportunity Hack?": "This is my first year! 👆",
    "Software Engineering Specifics": "Front-end (CSS/JS, Node, Angular, React, etc), Back-end (Java, Python, Ruby, etc), Data Science & Machine Learning, AWS, Google Cloud, Heroku",
    "Which days will be you available?": "Saturday Evening (4p - 7p PST), Sunday Morning (9am - 12pm PST)",
    "Which country are you in?": "United States of America",
    "Which state are you in?": "California",
    "Do you agree to our code of conduct? https://www.ohack.dev/hack/code-of-conduct": "Yes",
    "Any questions or comments for us?": "",
    "Shirt Size?": "L"
  },
  {
    "Timestamp": "8/18/2024 9:57:22",
    "Email Address": "sage7alvarez@gmail.com",
    "Your Name": "Zachary Alvarez",
    "Your pronouns (Optional)": "He/Him",
    "What company are you working for?": "Commonwealth Casualty Company",
    "Short bio (Optional)": "I'm a software engineer with a passion for reducing dev time by focusing on automated solutions such as SQLc that allows a developer to spend more time designing rather than wasting time on creating objects and other tasks. Outside of software engineering, I like to write fantasy and sci-fiction novels. And my current plans is to release a short story fantasy collection this fall and a free tool for designing stories in a visual manner.",
    "Can you send us a picture of you? (Optional)": "",
    "LinkedIn Profile (Optional)": "www.linkedin.com/in/zachary-alvarez-8021b765",
    "Joining us in-person at ASU Tempe?": "Yes!",
    "What kind of brain power can you help supply us with?": "Software engineering",
    "How many times have you participated in Opportunity Hack?": "This will be the 2nd time ✌️",
    "Software Engineering Specifics": "Front-end (CSS/JS, Node, Angular, React, etc), Back-end (Java, Python, Ruby, etc), AWS, Google Cloud, Heroku",
    "Which days will be you available?": "Oct 12th: Saturday Morning (9am - 12pm PST), Saturday Afternoon (1p - 3p PST), Saturday Evening (4p - 7p PST), Saturday Night (8p - 11p PST), Oct 13th: Sunday Early Morning (7am - 9am), Sunday Morning (9am - 12pm PST), Sunday Afternoon (1p - 3p PST)",
    "Which country are you in?": "United States of America",
    "Which state are you in?": "Arizona",
    "Do you agree to our code of conduct? https://www.ohack.dev/hack/code-of-conduct": "Yes",
    "Any questions or comments for us?": "",
    "Shirt Size?": "L"
  }
];


const judges = [
  {
    "Timestamp": "8/19/2024 10:30:28",
    "Email Address": "mwolfson@gmail.com",
    "Selected?": "",
    "Joining us in-person at ASU Tempe?": "Yes!",
    "Have you helped us before?": "Yes, I was a judge",
    "Your Name": "Mike Wolfson",
    "Your title": "Software Architect",
    "A (short) biography - aim for 200 words": "Product focused software leader with a decade of Android and 20 years of software experience. Author of a successful Android programming book and recognized by Google as one of the first 15 Android Developer Experts in the world. Excellent communicator, with a comprehensive knowledge of development process and design. Enthusiastic team-mate, with an eye for simplicity, and passion for helping teams deliver great products.",
    "A photo of you we can use on the DevPost site": "https://drive.google.com/open?id=1QQRlE5JiQGmfRwL1LjK5q6UQCs13Z69Q",
    "Why do you want to be a judge for Opportunity Hack?": "It was a great fun last time and was neat to help engineers.",
    "Availability": "I have time to be a judge",
    "Are you joining us in-person at ASU in Tempe, Arizona?": "Yes - I'll be judging in-person",
    "(Optional) Anything else to share?": "I also would like to volunteer to be a mentor, please let me know how I can participate throughout the weekend.",
    "Company Name": "Able Android",
    "Do you agree to our code of conduct?": "Yes",
    "Which areas best describe your background?": "Software Engineering, Product Management, Design, UI or UX"
  },
  {
    "Timestamp": "8/19/2024 10:32:54",
    "Email Address": "ajghadge@expediagroup.com",
    "Selected?": "",
    "Joining us in-person at ASU Tempe?": "Yes!",
    "Have you helped us before?": "No, I haven't helped with Opportunity Hack before",
    "Your Name": "Ajinkya Ghadge",
    "Your title": "Software Engineering Lead",
    "A (short) biography - aim for 200 words": "Ajinkya is one of the lead engineers at Expedia. Prior to this, he was one of the core members to develop an AI marketing platform for KPI-driven marketing company called Amplero, Inc (now Curinos). While at Amplero, Ajinkya leveraged multi-armed bandit experimentation to optimize customer lifetime value at scale for B2C marketers of global brands. In addition, he also has a strong background in leading research initiatives in robotics which were funded by the National Science Foundation.",
    "A photo of you we can use on the DevPost site": "https://drive.google.com/open?id=1QCuuLjpH3yRovZlEeTo_JCi0DCLBI6jm",
    "Why do you want to be a judge for Opportunity Hack?": "I currently lead engineering teams and have extensive experience guiding and evaluating top technological solutions when I see one. I have judged several hackathons in the Seattle area in the past, and I would love to participate in this event.",
    "Availability": "I have time to be a judge",
    "Are you joining us in-person at ASU in Tempe, Arizona?": "Yes - I'll be judging in-person",
    "(Optional) Anything else to share?": "LinkedIn: https://www.linkedin.com/in/ajinkya-ghadge/\nSome of my articles, as seen on InformationWeek, TechStrong.AI, Dzone\nPress coverage: TechBullion, MSN\n\nLooking forward to participating in this event.",
    "Company Name": "Expedia Group",
    "Do you agree to our code of conduct?": "Yes",
    "Which areas best describe your background?": "Software Engineering"
  }
];


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
      question: "What should I bring?",
      answer:
        "For in-person events, bring your laptop, charger, and any other devices you might need. For virtual events, ensure you have a stable internet connection.",
      icon: "🎒",
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
      answer:
        "Yes, we have a code of conduct that all participants must adhere to, ensuring a safe and inclusive environment for everyone.",
      icon: "📜",
    },
    {
      question: "How can I stay updated about future events?",
      answer:
        "Follow us on social media and join our Slack community for the latest updates and announcements.",
      icon: "📢",
    },
  ];

export default function HackathonEvent({ initialData }) {
  const router = useRouter();
  const { event_id } = router.query;
  const { handle_get_hackathon } = useHackathonEvents();
  const [event, setEvent] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  console.log("Countdowns: ", event?.countdowns);

  useEffect(() => {
    if (!initialData && event_id) {
      setLoading(true);
      handle_get_hackathon(event_id, (data) => {
        setEvent(data);
        setLoading(false);
      });
    }
  }, [event_id, initialData]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <>
      <Head>
        <title>{`Hackathon: ${event.title}`}</title>
        <meta
          name="description"
          content={`${event.location} | ${event.start_date} to ${event.end_date} | ${event.description}`}
        />
        {/* Add more meta tags for SEO here */}
      </Head>

      <Container maxWidth="lg">
        <HackathonHeader         
          title={event.title}
          startDate={event.start_date}
          endDate={event.end_date}
          location={event.location}
          description={event.description}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DonationProgress
              donationGoals={event.donation_goals}
              donationCurrent={event.donation_current}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <EventLinks links={event.links} />
          </Grid>
          <Grid item xs={12}>
            <EventConstraints constraints={event.constraints} />
          </Grid>
          <Grid item xs={12}>
            <NonprofitList
              nonprofits={event.nonprofits}
              teams={event.teams}
              eventId={event_id}
            />
          </Grid>
          <Grid item xs={12}>
            <VolunteerList volunteers={mentors} type="mentor" />
            <VolunteerList volunteers={judges} type="judge" />
          </Grid>          
          <Grid item xs={12}>
            <EventCountdown countdowns={event.countdowns} />
          </Grid>
          <Grid item xs={12}>
            <InteractiveFAQ
              faqData={faqData}
              title={`${event.title} FAQ`}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getStaticPaths() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons?current=true`
  );
  const data = await res.json();

  const paths = data.hackathons.map((hackathon) => ({
    params: { event_id: hackathon.event_id },
  }));

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`
    );
    const data = await res.json();

    return {
      props: {
        initialData: data,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error fetching hackathon data:", error);
    return {
      props: {
        initialData: null,
      },
      revalidate: 60,
    };
  }
}
