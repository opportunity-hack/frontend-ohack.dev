import React from "react";
import Head from "next/head";
import {
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Grid,
} from "@mui/material";
import {
  Star,
  Timeline,
  Assessment,
  EmojiEvents,
  School,
  Visibility,
  Send,
} from "@mui/icons-material";
import { useAuthInfo } from "@propelauth/react";
import LoginOrRegister from "../../components/LoginOrRegister/LoginOrRegister";

export default function FeedbackPage() {
  const { user } = useAuthInfo();

  const feedbackAreas = [
    {
      icon: <Star />,
      text: "Role-specific skills (e.g., coding, design, project management)",
    },
    { icon: <Timeline />, text: "Soft skills like communication and teamwork" },
    { icon: <Assessment />, text: "Overall performance and impact" },
    { icon: <EmojiEvents />, text: "Areas of excellence and improvement" },
    { icon: <School />, text: "Personalized growth recommendations" },
  ];

  return (
    <div>
      <Head>
        <title>Opportunity Hack Feedback System | Grow Your Tech Skills</title>
        <meta
          name="description"
          content="Discover how Opportunity Hack's unique feedback system helps developers, designers, and project managers grow their skills and advance their careers in tech."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, feedback system, skill development, tech careers, software engineering, product management"
        />
        <meta
          property="og:title"
          content="Opportunity Hack Feedback System | Grow Your Tech Skills"
        />
        <meta
          property="og:description"
          content="Get personalized feedback on your tech skills and grow your career with Opportunity Hack's unique feedback system."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/feedback" />
        <meta
          property="og:image"
          content="https://ohack.dev/images/feedback-system.jpg"
        />
        <link rel="canonical" href="https://ohack.dev/feedback" />
      </Head>

      <Box sx={{ maxWidth: 800, margin: "auto", padding: 3, marginTop: 10 }}>
        <Typography variant="h1" gutterBottom>
          Opportunity Hack Feedback System
        </Typography>

        <Typography variant="h2" gutterBottom>
          Grow Your Tech Skills with Personalized Insights
        </Typography>

        <Typography paragraph>
          At Opportunity Hack, we believe in the power of feedback to drive
          personal and professional growth. Our unique feedback system sets us
          apart from other hackathons by providing participants with detailed,
          actionable insights to help them excel in their tech careers.
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              What Makes Our Feedback Special?
            </Typography>
            <List>
              {feedbackAreas.map((area, index) => (
                <ListItem key={index}>
                  <ListItemIcon>{area.icon}</ListItemIcon>
                  <ListItemText primary={area.text} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Typography variant="h3" gutterBottom>
          How It Works
        </Typography>
        <Typography paragraph>
          1. Participate in an Opportunity Hack event
        </Typography>
        <Typography paragraph>
          2. Receive feedback from mentors, peers, and nonprofit partners
        </Typography>
        <Typography paragraph>
          3. Access your personalized feedback dashboard
        </Typography>
        <Typography paragraph>
          4. Review insights and set goals for improvement
        </Typography>
        <Typography paragraph>
          5. Track your progress over time across multiple events
        </Typography>

        <Card sx={{ mb: 4, mt: 4 }}>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              Accessing and Providing Feedback
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h4" gutterBottom>
                  <Visibility sx={{ verticalAlign: "middle", mr: 1 }} />
                  View Your Feedback
                </Typography>
                <Typography paragraph>
                  To view your personalized feedback, visit your feedback
                  dashboard at:
                </Typography>
                <Button variant="outlined" href="/myfeedback">
                  Your Feedback
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h4" gutterBottom>
                  <Send sx={{ verticalAlign: "middle", mr: 1 }} />
                  Send Feedback
                </Typography>
                <Typography paragraph>
                  To provide feedback for others, find your personal feedback
                  link in your profile page:
                </Typography>
                <Button variant="outlined" href="/profile">
                  Your Profile
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h3" gutterBottom>
          Why Our Feedback Matters
        </Typography>
        <Typography paragraph>
          In the fast-paced world of technology, continuous learning is key to
          success. Opportunity Hack's feedback system provides:
        </Typography>
        <Typography component="ul" sx={{ pl: 4 }}>
          <li>Real-world insights from industry professionals</li>
          <li>A holistic view of your technical and soft skills</li>
          <li>Actionable advice for career advancement</li>
          <li>A unique differentiator for your resume and portfolio</li>
        </Typography>

        {user ? (
          <Button
            variant="contained"
            color="primary"
            href="/myfeedback"
            sx={{ mt: 4 }}
          >
            View Your Feedback Dashboard
          </Button>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h3" gutterBottom>
              Ready to Start Your Growth Journey?
            </Typography>
            <LoginOrRegister introText="Sign up or log in to access your personalized feedback and accelerate your tech career." />
          </Box>
        )}

        <Typography variant="h3" gutterBottom sx={{ mt: 6 }}>
          Join Opportunity Hack Today
        </Typography>
        <Typography paragraph>
          Experience the power of our feedback system firsthand. Participate in
          an Opportunity Hack event, contribute to meaningful projects, and
          receive invaluable insights to propel your tech career forward.
        </Typography>
        <Button variant="contained" color="secondary" href="/hack">
          Find Upcoming Events
        </Button>
      </Box>
    </div>
  );
}
