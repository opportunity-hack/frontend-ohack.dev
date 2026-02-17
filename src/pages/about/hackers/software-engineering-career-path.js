import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  LinearProgress,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  WorkOutline as WorkIcon,
  Psychology as PsychologyIcon,
  Groups as GroupsIcon,
  Rocket as RocketIcon,
  AttachMoney as MoneyIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as LightbulbIcon,
  PeopleAlt as PeopleIcon
} from '@mui/icons-material';

const SoftwareEngineeringCareerPath = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const careerPaths = [
    {
      title: "Solution Architect",
      salary: "$120,000 - $220,000",
      skills: ["System Design", "Business Analysis", "Technical Strategy", "Stakeholder Management"],
      demand: 96,
      color: "#667eea",
      aiResistant: "High - Requires deep understanding of business context and complex problem-solving"
    },
    {
      title: "Product Engineer",
      salary: "$110,000 - $200,000", 
      skills: ["User Research", "Technical Vision", "Cross-functional Collaboration", "Data Analysis"],
      demand: 93,
      color: "#f093fb",
      aiResistant: "High - Combines technical skills with human empathy and market insight"
    },
    {
      title: "Technical Lead",
      salary: "$130,000 - $250,000",
      skills: ["Team Leadership", "Architecture", "Mentoring", "Strategic Planning"],
      demand: 89,
      color: "#4facfe",
      aiResistant: "Very High - Leadership and complex decision-making cannot be automated"
    },
    {
      title: "DevOps/Platform Engineer",
      salary: "$115,000 - $210,000",
      skills: ["Infrastructure", "Automation", "Security", "Performance Optimization"],
      demand: 91,
      color: "#38a169",
      aiResistant: "High - Requires understanding complex, unique organizational needs"
    }
  ];

  const learningPath = [
    {
      phase: "Foundation + Analytics (4-6 months)",
      skills: ["Programming Fundamentals", "Data Analysis", "SQL", "Problem Decomposition"],
      description: "Build coding skills while developing analytical thinking that AI cannot replace",
      icon: <AnalyticsIcon />
    },
    {
      phase: "User-Centered Development (4-6 months)",
      skills: ["User Research", "Design Thinking", "A/B Testing", "Stakeholder Interviews"],
      description: "Learn to understand human needs and translate them into technical solutions",
      icon: <PeopleIcon />
    },
    {
      phase: "Systems Thinking (4-6 months)",
      skills: ["Architecture", "Business Logic", "Integration", "Performance Analysis"],
      description: "Develop ability to see the big picture and design complex, interconnected systems",
      icon: <PsychologyIcon />
    },
    {
      phase: "Leadership & Innovation (Ongoing)",
      skills: ["Team Collaboration", "Technical Communication", "Creative Problem Solving", "Mentoring"],
      description: "Build uniquely human skills that make you irreplaceable in any tech organization",
      icon: <LightbulbIcon />
    }
  ];

  const techStats = [
    { label: "Jobs Requiring Human Judgment", value: "2.1M+", subtext: "Roles AI cannot fully replace" },
    { label: "Analytical Thinking Demand", value: "69%", subtext: "Of employers rank this as #1 skill" },
    { label: "Leadership Salary Premium", value: "112%", subtext: "Above average compensation" },
    { label: "High-EQ Annual Bonus", value: "$29,000", subtext: "Compared to low-EQ professionals" }
  ];

  const aiProofSkills = [
    {
      title: "🧠 Deep Analytical Thinking",
      description: "Master problem decomposition, data interpretation, and evidence-based decision making. Ranked #1 by 69% of employers and commands 15-20% salary premiums.",
      examples: ["User behavior analysis", "Performance bottleneck identification", "ROI calculations", "Pattern recognition"]
    },
    {
      title: "🎯 Creative Problem Solving",
      description: "Develop ability to find novel solutions to unprecedented challenges. Essential for AI/ML workflow design and human-AI collaboration roles earning 17.7% premiums.",
      examples: ["Innovative feature design", "Novel algorithmic approaches", "Resource optimization", "Cross-functional solutions"]
    },
    {
      title: "👥 Cross-Functional Communication",
      description: "Master technical writing and stakeholder management. Technical writers earn $91,670-$130,000+ annually, while high-EQ professionals earn $29,000 more per year.",
      examples: ["Technical presentations", "Requirement gathering", "Risk communication", "Executive reporting"]
    },
    {
      title: "🔍 Systems Architecture",
      description: "Learn to design complex systems balancing technical constraints and business needs. Cloud architects earn $155,597-$190,204 average salaries.",
      examples: ["Database design decisions", "Microservices architecture", "Integration planning", "Scalability assessment"]
    }
  ];

  return (
    <>
      <Head>
        <title>Software Engineering Career Path 2025 - AI-Proof Skills Guide | Opportunity Hack</title>
        <meta 
          name="description" 
          content="Build AI-resistant software engineering skills through hands-on hackathons. Develop analytical thinking, creative problem-solving, and leadership abilities that make you irreplaceable." 
        />
        <meta name="keywords" content="AI-proof software engineering, analytical thinking, creative problem solving, tech leadership, software engineering career, programming skills" />
        <meta property="og:title" content="Software Engineering Career Path 2025 - Build AI-Proof Skills" />
        <meta property="og:description" content="Develop uniquely human skills that AI cannot replace. Learn analytical thinking, creative problem-solving, and technical leadership through real-world hackathon projects." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://www.opportunityhack.org/about/hackers/software-engineering-career-path" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Software Engineering Career Path 2025" />
        <meta name="twitter:description" content="Complete guide to becoming a software engineer. Learn programming, build projects, launch your career." />
        <link rel="canonical" href="https://www.opportunityhack.org/about/hackers/software-engineering-career-path" />
      </Head>

      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          color: 'white',
          mt: 10
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }}>
            <Typography 
              variant={isMobile ? "h3" : "h1"} 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Build AI-Proof Software Engineering Skills
            </Typography>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                mb: 2, 
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Yes, AI is changing the job market. But humans with deep analytical thinking, 
              creative problem-solving, and leadership skills are more valuable than ever.
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.8,
                maxWidth: 600,
                mx: 'auto',
                fontStyle: 'italic'
              }}
            >
              Learn the uniquely human skills that make you irreplaceable in 2025 and beyond.
            </Typography>
            
            {/* Stats Grid */}
            <Grid container spacing={2} sx={{ mt: 4, mb: 6 }}>
              {techStats.map((stat, index) => (
                <Grid size={{ xs: 6, md: 3 }} key={index}>
                  <Card 
                    sx={{ 
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textAlign: 'center',
                      py: 2
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                      {stat.subtext}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

        {/* AI-Proof Skills Section */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '20px',
              p: { xs: 3, md: 5 },
              mb: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                mb: 2, 
                color: '#2d3748',
                fontWeight: 700
              }}
            >
              🛡️ AI-Resistant Skills You'll Develop
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                color: '#4a5568',
                maxWidth: 800,
                mx: 'auto'
              }}
            >
              While AI can generate code, it cannot replicate human judgment, creativity, 
              and the ability to understand complex business and social contexts.
            </Typography>

            <Grid container spacing={4}>
              {aiProofSkills.map((skill, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      p: 3,
                      background: 'white',
                      borderLeft: `5px solid ${careerPaths[index]?.color || '#667eea'}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                      {skill.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: '#4a5568', lineHeight: 1.6 }}>
                      {skill.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
                      You'll practice through:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {skill.examples.map((example, idx) => (
                        <Chip 
                          key={idx}
                          label={example}
                          size="small"
                          sx={{ 
                            backgroundColor: '#e2e8f0',
                            color: '#2d3748',
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* Career Paths Section */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '20px',
              p: { xs: 3, md: 5 },
              mb: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                mb: 2, 
                color: '#2d3748',
                fontWeight: 700
              }}
            >
              🚀 High-Value Career Paths
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                color: '#4a5568',
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Focus on roles that require human judgment, creativity, and deep understanding 
              of business context - skills that AI cannot replicate.
            </Typography>

            <Grid container spacing={3}>
              {careerPaths.map((path, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                      borderLeft: `5px solid ${path.color}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                        {path.title}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#38a169', fontWeight: 600, mb: 2 }}>
                        {path.salary}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: '#e53e3e', fontWeight: 600 }}>
                        🛡️ AI Resistance: {path.aiResistant}
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#4a5568' }}>
                          Market Demand
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={path.demand}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: path.color
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {path.demand}% market demand
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {path.skills.map((skill, idx) => (
                          <Chip 
                            key={idx}
                            label={skill}
                            size="small"
                            sx={{ 
                              backgroundColor: path.color,
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* Learning Path Section */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
              borderRadius: '20px',
              p: { xs: 3, md: 5 },
              mb: 4,
              color: 'white'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                mb: 2, 
                fontWeight: 700
              }}
            >
              🎯 Strategic Learning Path
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Build technical skills alongside uniquely human capabilities that make you indispensable.
            </Typography>
            
            <Grid container spacing={3}>
              {learningPath.map((phase, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '15px',
                      p: 3,
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          color: 'white',
                          mr: 2,
                          width: 50,
                          height: 50
                        }}
                      >
                        {phase.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {phase.phase}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                      {phase.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {phase.skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* Why Hackathons Section */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '20px',
              p: { xs: 3, md: 5 },
              mb: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                mb: 2, 
                color: '#2d3748',
                fontWeight: 700
              }}
            >
              💡 Why Hackathons Build AI-Proof Skills
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                color: '#4a5568',
                maxWidth: 800,
                mx: 'auto'
              }}
            >
              Unlike coding tutorials or AI-assisted development, hackathons force you to develop 
              the human skills that make senior engineers irreplaceable.
            </Typography>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      backgroundColor: '#667eea'
                    }}
                  >
                    <AnalyticsIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
                    Deep Problem Analysis
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    Understand real nonprofit challenges, analyze user needs, and make 
                    data-driven decisions about technical solutions.
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      backgroundColor: '#f093fb'
                    }}
                  >
                    <LightbulbIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
                    Creative Solution Design
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    Develop innovative approaches to unique challenges that require human 
                    creativity and understanding of context.
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      backgroundColor: '#4facfe'
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
                    Leadership & Communication
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    Lead diverse teams, present technical solutions to stakeholders, 
                    and build consensus around complex decisions.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Success Stories */}
            <Box sx={{ mt: 6 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 4, 
                  color: '#2d3748',
                  fontWeight: 700
                }}
              >
                📈 Data-Driven Success Stories
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Sarah, Technical Product Manager
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      "Hackathons taught me analytical thinking and stakeholder management. Earned PMP + AWS certs for 112% leadership premium."
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      $140,000 → $185,000
                    </Typography>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Marcus, Solutions Architect
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      "Led 6 hackathon teams, mastered system design thinking. AWS certification + EQ development = rapid advancement."
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      $95,000 → $165,000
                    </Typography>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ p: 3, background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Jessica, Engineering Lead
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      "Developed high EQ through mentoring teams. Each EQ point = $1,300 salary increase. Now leading 12-person engineering team."
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      $110,000 → $180,000
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Container>

        {/* Strategic Certification Section */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #38a169 0%, #2d3748 100%)',
              borderRadius: '20px',
              p: { xs: 3, md: 5 },
              mb: 4,
              color: 'white'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                mb: 2, 
                fontWeight: 700
              }}
            >
              💎 Strategic Certifications for Maximum ROI
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              93% of IT professionals hold certifications. Combine hackathon experience with strategic credentials for 25-50% salary increases.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '15px',
                    p: 3,
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    AWS Solutions Architect
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Cost: $150-$400 • ROI: 1-3 months
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    $155,597 avg salary
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Cloud expertise + hackathon portfolio = unbeatable combination
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '15px',
                    p: 3,
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Project Management (PMP)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Cost: $2,555-$3,305 • ROI: 6 months
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    $122K vs $93K median
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    29% salary increase + leadership pathway
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '15px',
                    p: 3,
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Cybersecurity (CISSP)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Cost: $749-$1,200 • ROI: 2-4 months
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    $168,060 avg salary
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    3.5M unfilled positions by 2025
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🚀 Emerging High-Value Skills
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid size="auto">
                  <Chip 
                    label="MLOps Engineering (9.8x growth)" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </Grid>
                <Grid size="auto">
                  <Chip 
                    label="AI Workflow Design (+17.7% salary)" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </Grid>
                <Grid size="auto">
                  <Chip 
                    label="Human-AI Collaboration" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Container>

        {/* CTA Section */}
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Box 
            sx={{ 
              textAlign: 'center',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              p: { xs: 4, md: 6 },
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Don't Compete with AI. Complement It.
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
              While AI generates code, you'll solve complex problems, lead teams, 
              and make strategic decisions that shape the future of technology.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/hack" passHref>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    backgroundColor: 'white',
                    color: '#667eea',
                    fontWeight: 700,
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: '#f7fafc',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Build AI-Proof Skills
                </Button>
              </Link>
              
              <Link href="/volunteer/professional-development-volunteering" passHref>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Volunteer for Career Growth
                </Button>
              </Link>

              <Link href="/projects" passHref>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  See Real Projects
                </Button>
              </Link>
            </Box>                        
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default SoftwareEngineeringCareerPath;