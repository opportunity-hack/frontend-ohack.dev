import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import EventFeatureExtended from "../HackathonList/EventFeatureExtended";

import {
  TitleContainer,
  LayoutContainer,
  ProjectsContainer,
} from "../../styles/nonprofit/styles";
import { Typography } from "@mui/material";
import Moment from "moment";
import { EventText } from "../HackathonList/styles";
import { EventGreyText } from "./styles";
import Skeleton from "@mui/material/Skeleton";
import InteractiveFAQ from "../Hackathon/InteractiveFAQ";
import Button from "@mui/material/Button";

function SingleHackathonEvent({ event_id }) {
  const { handle_get_hackathon } = useHackathonEvents();
  const [event, setEvent] = useState(null);

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

  useEffect(() => {
    handle_get_hackathon(event_id, (data) => {
      setEvent(data);
    });
  }, []);

  const style = { fontSize: "15px" };

  return (
    <LayoutContainer key="hackathons" container>
      {event ? (
        <div>
          <TitleContainer
            style={{ paddingBottom: "8px", paddingTop: "10px" }}
            container
          >
            <Typography variant="h3" component="h1">
              {event.title}
            </Typography>
            {Moment(new Date()).format("YYYY") ===
              Moment(event.start_date).format("YYYY") && (
              <EventText variant="h3">
                {Moment(event.start_date).format("MMM Do")} -{" "}
                {Moment(event.end_date).format("MMM Do")}
              </EventText>
            )}

            {Moment(new Date()).format("YYYY") !==
              Moment(event.start_date).format("YYYY") && (
              <EventText variant="h3">
                {Moment(event.start_date).format("MMM Do YYYY")} -{" "}
                {Moment(event.end_date).format("MMM Do YYYY")}
              </EventText>
            )}
            <EventGreyText variant="button">{event.location}</EventGreyText>

            <Typography variant="body1" style={style} paragraph>
              {event.description}
            </Typography>
          </TitleContainer>

          <ProjectsContainer style={{ marginTop: 20, width: "100%" }}>
            <EventFeatureExtended
              title={event.title}
              event_id={event_id}
              description={event.description}
              key={event.title}
              type={event.type}
              nonprofits={event.nonprofits}
              teams={event.teams}
              start_date={event.start_date}
              end_date={event.end_date}
              countdowns={event.countdowns}
              location={event.location}
              devpostUrl={event.devpost_url}
              rawEventLinks={event.links}
              icon={event.image_url}
              donationUrl={event.donation_url}
              donationGoals={event.donation_goals}
              donationCurrent={event.donation_current}
              constraints={event.constraints}
            />

            <InteractiveFAQ
              faqData={faqData}
              title={`${event.title} FAQ`}
              id="faq"
            />
          </ProjectsContainer>
        </div>
      ) : (
        <div>
          <Skeleton animation="wave" variant="text" width={310} height={250} />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={310}
            height={118}
          />

          <Skeleton animation="wave" variant="text" width={310} height={250} />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={310}
            height={318}
          />
        </div>
      )}
    </LayoutContainer>
  );
}

export default SingleHackathonEvent;
