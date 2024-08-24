import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CodeRounded,
  AssignmentRounded,
  BrushRounded,
  BarChartRounded,
  AccountTreeRounded,
  PeopleRounded,
  EngineeringRounded,
  SchoolRounded,
  EmojiEventsRounded,
  WorkRounded,
} from "@mui/icons-material";

const VolunteerPage = () => {
  const roles = [
    {
      title: "Software Engineering",
      icon: <CodeRounded />,
      description:
        "Develop solutions for nonprofits, full-stack development, mobile apps",
    },
    {
      title: "Product Management",
      icon: <AssignmentRounded />,
      description:
        "Define project scope, prioritize features, ensure product-market fit",
    },
    {
      title: "UX/UI Design",
      icon: <BrushRounded />,
      description:
        "Create user-friendly interfaces, improve user experience for nonprofit solutions",
    },
    {
      title: "Data Science",
      icon: <BarChartRounded />,
      description:
        "Analyze nonprofit data, create visualizations, develop predictive models",
    },
    {
      title: "Project Management",
      icon: <AccountTreeRounded />,
      description: "Coordinate hackathon teams, ensure timely project delivery",
    },   
    {
      title: "Engineering Management",
      icon: <EngineeringRounded />,
      description:
        "Lead tech teams, make architectural decisions, ensure project scalability",
    },
  ];

  const benefits = [
    { text: "Learn New Skills", icon: <SchoolRounded /> },
    { text: "Make a Difference", icon: <EmojiEventsRounded /> },
    { text: "Expand Your Network", icon: <PeopleRounded /> },
    { text: "Enhance Your Resume", icon: <WorkRounded /> },
  ];

  const linkStyle = {
    color: "blue",
    textDecoration: "none",
    fontWeight: "bold",
  };

  return (
    <>
      <Head>
        <title>Volunteer Opportunities for All Skills | Opportunity Hack</title>
        <meta
          name="description"
          content="Make a difference with your unique skills. Opportunity Hack offers diverse volunteer roles in technology, business, creative arts, skilled trades, and more. Join us in creating positive change!"
        />
        <meta
          name="keywords"
          content="volunteer opportunities, skills-based volunteering, tech for good, nonprofit support, community service, professional development"
        />
      </Head>
      <div style={{ padding: "2rem", fontSize: "1em" }}>
        <Typography
          variant="h2"
          mt={10}
          gutterBottom
          style={{ fontSize: "2.5em" }}
        >
          Volunteer Your Skills for Good
        </Typography>
        <Typography variant="body1" paragraph style={{ fontSize: "1.1em" }}>
          At Opportunity Hack, we believe everyone has valuable skills to
          contribute to making the world a better place. Whether you're a tech
          wizard, a business guru, a creative genius, or have any other talent,
          we have meaningful volunteer opportunities for you to make a real
          impact.
        </Typography>

        <Typography
          variant="h2"
          gutterBottom
          style={{ fontSize: "2em", marginTop: "1.5rem" }}
        >
          Ways to Contribute Your Skills
        </Typography>
        <Grid container spacing={3}>
          {roles.map((role, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  {role.icon}
                  <Typography variant="h3" style={{ fontSize: "1.5em" }}>
                    {role.title}
                  </Typography>
                  <Typography variant="body1" style={{ fontSize: "1em" }}>
                    {role.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography
          variant="h2"
          gutterBottom
          style={{ fontSize: "2em", marginTop: "2rem" }}
        >
          Benefits of Volunteering with Opportunity Hack
        </Typography>
        <List>
          {benefits.map((benefit, index) => (
            <ListItem key={index}>
              <ListItemIcon>{benefit.icon}</ListItemIcon>
              <ListItemText
                primary={benefit.text}
                primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
              />
            </ListItem>
          ))}
        </List>

        <Typography
          variant="h2"
          gutterBottom
          style={{ fontSize: "2em", marginTop: "2rem" }}
        >
          How to Get Started
        </Typography>
        <List style={{ padding: 0 }}>
          <ListItem>
            <ListItemText
              primary="1. Explore our current projects and find one that matches your skills"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Join our community on Slack at ohack.dev"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Attend an orientation session to learn more about our work"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Start contributing and see the impact of your work!"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
            />
          </ListItem>
        </List>

        <Typography
          variant="body1"
          paragraph
          style={{ fontSize: "1.1em", marginTop: "2rem" }}
        >
          Want to learn more about our programs and how your skills can make a
          difference? Visit our{" "}
          <Link
            href="https://www.ohack.org/about/programs"
            target="_blank"
            passHref
          >
            <span style={linkStyle}>About page</span>
          </Link>
          .
        </Typography>

        <Typography
          variant="h2"
          gutterBottom
          style={{ fontSize: "2em", marginTop: "2rem" }}
        >
          Other Ways to Get Involved
        </Typography>
        <Typography variant="body1" paragraph style={{ fontSize: "1.1em" }}>
          Besides volunteering, there are many other ways to support Opportunity
          Hack:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <Link href="/sponsor" passHref>
                  <span style={linkStyle}>Become a Sponsor</span>
                </Link>
              }
              secondary="Support our mission financially and gain visibility"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
              secondaryTypographyProps={{ style: { fontSize: "1em" } }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Link href="/about/judges" passHref>
                  <span style={linkStyle}>Be a Judge</span>
                </Link>
              }
              secondary="Evaluate projects and provide valuable feedback"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
              secondaryTypographyProps={{ style: { fontSize: "1em" } }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Link href="/about/mentors" passHref>
                  <span style={linkStyle}>Become a Mentor</span>
                </Link>
              }
              secondary="Guide teams and share your expertise"
              primaryTypographyProps={{ style: { fontSize: "1.1em" } }}
              secondaryTypographyProps={{ style: { fontSize: "1em" } }}
            />
          </ListItem>
        </List>

        <Typography
          variant="h2"
          gutterBottom
          style={{ fontSize: "2em", marginTop: "2rem" }}
        >
          Success Stories
        </Typography>
        <Typography variant="body1" paragraph style={{ fontSize: "1.1em" }}>
          See the impact of our volunteers' work! Check out our{" "}
          <Link href="/about/success-stories" passHref>
            <span style={linkStyle}>Success Stories</span>
          </Link>{" "}
          to learn how Opportunity Hack has made a difference in communities
          around the world.
        </Typography>

        <Typography
          variant="h2"
          gutterBottom
          style={{ fontSize: "2em", marginTop: "2rem" }}
        >
          Ready to Use Your Skills for Good?
        </Typography>
        <Typography variant="body1" paragraph style={{ fontSize: "1.1em" }}>
          Join Opportunity Hack today and be part of a community that's
          leveraging diverse talents to create positive change in the world!
        </Typography>

        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              href="/nonprofits"
              style={{ fontSize: "1.1em" }}
            >
              Explore Opportunities
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              href="/profile"
              style={{ fontSize: "1.1em" }}
            >
              Update Your Profile
            </Button>
          </Grid>
        </Grid>

        <Typography
          variant="body1"
          paragraph
          style={{ fontSize: "1.1em", marginTop: "2rem" }}
        >
          Don't forget to update your profile to help us match you with the
          perfect opportunity!{" "}
          <Link href="/profile" passHref>
            <span style={linkStyle}>Update your profile now</span>
          </Link>
          .
        </Typography>
      </div>
    </>
  );
};

export default VolunteerPage;
