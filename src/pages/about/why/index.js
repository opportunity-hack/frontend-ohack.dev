import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
} from "@mui/material";
import {
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  CloudQueue as CloudIcon,
  Groups as TeamsIcon,
  TrendingUp as CareerIcon,
  Lightbulb as ImpactIcon,
  Search as FindProjectIcon,
} from "@mui/icons-material";

import { whyPages } from "../../../data/why-content";
import {
  TitleContainer,
  LayoutContainer,
  ProjectsContainer,
} from "../../../styles/nonprofit/styles";
import Head from "next/head";

const LoginOrRegister = dynamic(
  () => import("../../../components/LoginOrRegister/LoginOrRegister"),
  { ssr: false }
);

const style = { fontSize: 13 };

// Organized content by career stage/goal
const careerPathContent = [
  {
    title: "Early Career",
    icon: SchoolIcon,
    description: "Build your foundation in tech through real-world experience",
    links: [
      {
        slug: "internship-success-build-portfolio-through-nonprofit-projects",
        title: "Stand Out for Summer Internships",
      },
      {
        slug: "bootcamp-projects-real-world-experience",
        title: "Bootcamp Success: Build Real Projects",
      },
    ],
  },
  {
    title: "Career Transition",
    icon: CareerIcon,
    description: "Make your move into tech meaningful and impactful",
    links: [
      {
        slug: "career-transition-tech-nonprofit",
        title: "Transition to Tech Through Nonprofit Projects",
      },
      {
        slug: "remote-work-experience-nonprofit",
        title: "Gain Remote Work Experience",
      },
    ],
  },
  {
    title: "Leadership Growth",
    icon: TeamsIcon,
    description: "Develop leadership skills while making a difference",
    links: [
      {
        slug: "team-leadership-nonprofit-projects",
        title: "Lead Technical Teams for Nonprofits",
      },
      {
        slug: "senior-developer-impact",
        title: "Senior Developers: Create Lasting Impact",
      },
    ],
  },
];

// Additional pathways utilizing our complete content
const impactPathways = [
  {
    slug: "coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world",
    title: "Code for Social Impact",
    icon: ImpactIcon,
    description:
      "Use your programming skills to create positive change in communities",
  },
  {
    slug: "how-to-find-and-work-on-nonprofit-projects-that-match-your-coding-interests-and-expertise",
    title: "Find Your Perfect Project",
    icon: FindProjectIcon,
    description:
      "Match your skills and interests with impactful nonprofit projects",
  },
  {
    slug: "open-source-contribution",
    title: "Contribute to Open Source",
    icon: CodeIcon,
    description:
      "Make meaningful open source contributions that help nonprofits",
  },
  {
    slug: "remote-work-experience-nonprofit",
    title: "Master Remote Collaboration",
    icon: CloudIcon,
    description:
      "Build essential remote work skills through nonprofit projects",
  },
];

const CareerPathCard = ({ title, icon: Icon, description, links }) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 3,
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Icon sx={{ mr: 1, color: "primary.main", fontSize: 32 }} />
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        style={style}
        gutterBottom
        color="text.secondary"
      >
        {description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {links.map((link) => (
          <Button
            key={link.slug}
            variant="outlined"
            fullWidth
            sx={{
              mb: 1,
              justifyContent: "flex-start",
              textAlign: "left",
              py: 1.5,
            }}
            component={Link}
            href={`/about/why/${link.slug}`}
          >
            {link.title}
            {whyPages[link.slug]?.highlights && (
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {whyPages[link.slug].highlights
                  .slice(0, 2)
                  .map((highlight, i) => (
                    <Chip
                      key={i}
                      label={highlight}
                      size="small"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
              </Box>
            )}
          </Button>
        ))}
      </Box>
    </CardContent>
  </Card>
);

const ImpactPathwayCard = ({ slug, title, icon: Icon, description }) => (
  <Card
    sx={{
      mb: 2,
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateX(4px)",
        boxShadow: 2,
      },
    }}
  >
    <CardContent>
      <Button
        variant="text"
        size="large"
        fullWidth
        startIcon={<Icon sx={{ fontSize: 28 }} />}
        component={Link}
        href={`/about/why/${slug}`}
        sx={{
          justifyContent: "flex-start",
          textAlign: "left",
          flexDirection: "column",
          alignItems: "flex-start",
          py: 2,
        }}
      >
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" style={style}>
          {description}
        </Typography>
        {whyPages[slug]?.highlights && (
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {whyPages[slug].highlights.slice(0, 2).map((highlight, i) => (
              <Chip
                key={i}
                label={highlight}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
          </Box>
        )}
      </Button>
    </CardContent>
  </Card>
);

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: careerPathContent.map((path) => ({
    "@type": "Question",
    name: `Why choose Opportunity Hack for ${path.title.toLowerCase()}?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: path.description,
    },
  })),
};

export default function WhyIndex() {
  return (
    <>
      <Head>
        <title>
          Why Code with Opportunity Hack? | Build Skills, Make Impact
        </title>
        <meta
          name="description"
          content="Join Opportunity Hack to build real-world experience, transition careers, or grow leadership skills while creating technology that matters. Perfect for students, career changers, and tech leaders."
        />
        <meta
          name="keywords"
          content="tech volunteering, coding bootcamp projects, remote work experience, tech leadership, career transition, nonprofit technology, social impact coding"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <LayoutContainer key="why" container>
        <TitleContainer container>
          <Typography variant="h2" gutterBottom>
            Why Code with Opportunity Hack?
          </Typography>

          <Typography variant="body1" style={style} paragraph>
            Whether you're starting your journey in tech, making a career
            transition, or looking to grow as a leader - Opportunity Hack
            provides real-world experience building technology that makes a
            difference. Work on meaningful projects, learn from experienced
            mentors, and build a portfolio that stands out.
          </Typography>
        </TitleContainer>

        <ProjectsContainer>
          <Grid container spacing={4} mb={6}>
            {careerPathContent.map((content, index) => (
              <Grid item xs={12} md={4} key={index}>
                <CareerPathCard {...content} />
              </Grid>
            ))}
          </Grid>

          <Typography variant="h4" gutterBottom>
            Make an Impact
          </Typography>

          <Box mb={4}>
            {impactPathways.map((pathway, index) => (
              <ImpactPathwayCard key={index} {...pathway} />
            ))}
          </Box>

          <LoginOrRegister
            introText="Ready to start building technology that matters?"
            previousPage="/about/why"
          />
        </ProjectsContainer>
      </LayoutContainer>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      openGraphData: [
        {
          property: "og:title",
          content:
            "Why Code with Opportunity Hack? | Build Skills, Make Impact",
          key: "ogtitle",
        },
        {
          property: "og:description",
          content:
            "Join Opportunity Hack to build real-world experience, transition careers, or grow leadership skills while creating technology that matters. Perfect for students, career changers, and tech leaders.",
          key: "ogdesc",
        },
        {
          property: "og:type",
          content: "website",
          key: "ogtype",
        },
        {
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
          key: "ogimage",
        },
      ],
    },
    revalidate: 3600,
  };
}
