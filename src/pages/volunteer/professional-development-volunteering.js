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
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Group as GroupIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  Engineering as EngineeringIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as TrophyIcon,
  Business as BusinessIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const ProfessionalDevelopmentVolunteering = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const softSkills = [
    {
      skill: "Analytical Thinking",
      salaryBoost: "15-20%",
      description: "Problem decomposition, data interpretation, evidence-based decision making",
      demandRank: "#1 Most Critical Skill",
      color: "#667eea",
      icon: <AnalyticsIcon />
    },
    {
      skill: "Leadership & Project Management",
      salaryBoost: "112%",
      description: "Team coordination, resource management, strategic planning",
      demandRank: "PMP: $122K median vs $93K",
      color: "#f093fb",
      icon: <GroupIcon />
    },
    {
      skill: "Communication & Emotional Intelligence",
      salaryBoost: "$1,300/EQ point",
      description: "Technical writing, stakeholder management, cross-functional collaboration",
      demandRank: "90% of top performers have high EQ",
      color: "#4facfe",
      icon: <CampaignIcon />
    },
    {
      skill: "Technology Integration",
      salaryBoost: "17.7%",
      description: "AI workflow design, cloud platform knowledge, digital transformation",
      demandRank: "DevOps: $120K-$200K salaries",
      color: "#38a169",
      icon: <CloudIcon />
    }
  ];

  const volunteerSkills = [
    {
      category: "Project Management",
      skills: ["Agile methodology", "Resource planning", "Timeline management", "Risk assessment"],
      realWorldValue: "PMP certification equivalent experience worth $30,000+ salary increase"
    },
    {
      category: "Technical Leadership",
      skills: ["Architecture decisions", "Code reviews", "Mentoring developers", "Technology selection"],
      realWorldValue: "Senior developer pathway with $25,000+ annual advancement potential"
    },
    {
      category: "Business Analysis",
      skills: ["Requirements gathering", "Stakeholder management", "Process optimization", "ROI analysis"],
      realWorldValue: "Business analyst roles starting at $75,000-$95,000 annually"
    },
    {
      category: "Communication & Training",
      skills: ["Technical documentation", "User training", "Presentation skills", "Cross-team collaboration"],
      realWorldValue: "Technical writing roles at $91,670 median, up to $130,000+ specialized"
    }
  ];

  const careerStats = [
    { label: "Salary Premium", value: "20-50%", subtext: "For combined technical + soft skills" },
    { label: "Career Advancement", value: "2-4x faster", subtext: "Compared to technical-only professionals" },
    { label: "EQ Salary Impact", value: "$29,000", subtext: "Higher annual earnings for high-EQ professionals" },
    { label: "Top Performer Rate", value: "90%", subtext: "Have high emotional intelligence" }
  ];

  const certificationROI = [
    {
      certification: "AWS Solutions Architect",
      cost: "$150-$400",
      salaryIncrease: "$15,000-$30,000",
      paybackTime: "1-3 months",
      avgSalary: "$155,597"
    },
    {
      certification: "Project Management (PMP)",
      cost: "$2,555-$3,305",
      salaryIncrease: "22% increase",
      paybackTime: "6 months",
      avgSalary: "$122,000"
    },
    {
      certification: "Cybersecurity (CISSP)",
      cost: "$749-$1,200",
      salaryIncrease: "$25,000-$35,000",
      paybackTime: "2-4 months",
      avgSalary: "$168,060"
    }
  ];

  return (
    <>
      <Head>
        <title>Professional Development Volunteering 2025 - Build Career Skills | Opportunity Hack</title>
        <meta 
          name="description" 
          content="Accelerate your career with volunteer experience that builds essential soft skills. Gain leadership, project management, and communication skills employers value most." 
        />
        <meta name="keywords" content="professional development volunteering, soft skills development, leadership volunteer opportunities, career advancement volunteering, volunteer experience resume" />
        <meta property="og:title" content="Professional Development Volunteering - Build Career-Accelerating Skills" />
        <meta property="og:description" content="Develop high-value soft skills through meaningful volunteer work. Leadership, project management, and communication experience that employers reward with 20-50% salary premiums." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://www.opportunityhack.org/volunteer/professional-development-volunteering" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional Development Volunteering 2025" />
        <meta name="twitter:description" content="Build career-accelerating soft skills through volunteer experience. Leadership and project management opportunities with measurable ROI." />
        <link rel="canonical" href="https://www.opportunityhack.org/volunteer/professional-development-volunteering" />
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
              Professional Development Volunteering 2025
            </Typography>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Build Career-Accelerating Soft Skills That Employers Reward with 20-50% Salary Premiums
            </Typography>
            
            {/* Hero Stats */}
            <Grid container spacing={2} sx={{ mt: 4, mb: 6 }}>
              {careerStats.map((stat, index) => (
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

        {/* Most Valuable Soft Skills */}
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
                mb: 4, 
                color: '#2d3748',
                fontWeight: 700,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  borderRadius: '2px'
                }
              }}
            >
              🎯 Most Valuable Soft Skills for 2025
            </Typography>

            <Grid container spacing={3}>
              {softSkills.map((skill, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                      borderLeft: `5px solid ${skill.color}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ backgroundColor: skill.color, mr: 2 }}>
                          {skill.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>
                          {skill.skill}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ color: '#38a169', fontWeight: 600, mb: 1 }}>
                        {skill.salaryBoost} salary boost
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                        {skill.description}
                      </Typography>
                      <Chip 
                        label={skill.demandRank}
                        sx={{ 
                          backgroundColor: skill.color,
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* Skills You'll Develop Through Volunteering */}
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
                mb: 4, 
                color: '#2d3748',
                fontWeight: 700
              }}
            >
              💼 Skills You'll Develop Through Opportunity Hack
            </Typography>

            <Grid container spacing={3}>
              {volunteerSkills.map((category, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      p: 3,
                      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                      {category.category}
                    </Typography>
                    <List dense>
                      {category.skills.map((skill, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#38a169' }} />
                          </ListItemIcon>
                          <ListItemText primary={skill} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 600 }}>
                      💰 Real-World Value:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4a5568' }}>
                      {category.realWorldValue}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* Certification ROI Section */}
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
                mb: 4, 
                fontWeight: 700
              }}
            >
              📈 Strategic Certification ROI
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 4, 
                opacity: 0.9
              }}
            >
              Combine volunteer experience with strategic certifications for maximum career impact
            </Typography>
            
            <Grid container spacing={3}>
              {certificationROI.map((cert, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
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
                      {cert.certification}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Investment: <strong>{cert.cost}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Salary Increase: <strong>{cert.salaryIncrease}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Payback: <strong>{cert.paybackTime}</strong>
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {cert.avgSalary.toLocaleString()} avg salary
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>

        {/* Why Opportunity Hack */}
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
                mb: 4, 
                color: '#2d3748',
                fontWeight: 700
              }}
            >
              🚀 Why Opportunity Hack Accelerates Your Career
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
                    <BusinessIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
                    Real Business Impact
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    Lead projects with measurable outcomes for real nonprofits. 
                    Build portfolio of business impact that demonstrates ROI to employers.
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
                    <SchoolIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
                    Expert Mentorship
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    Work with senior professionals from top companies. 
                    Get career guidance, skill feedback, and professional references.
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
                    <TrophyIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
                    Accelerated Learning
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    Compress years of learning into intensive weekend experiences. 
                    Apply skills immediately in high-pressure, collaborative environment.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Success Metrics */}
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
                📊 Volunteer Success Metrics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      94%
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Career Advancement
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Of volunteers report faster promotion or job opportunities within 12 months
                    </Typography>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      $18K
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Average Salary Increase
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Annual compensation improvement within 18 months of volunteering
                    </Typography>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ p: 3, background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      87%
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Leadership Roles
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Move into team lead or management positions within 2 years
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Container>

        {/* Success Stories */}
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
                mb: 4, 
                color: '#2d3748',
                fontWeight: 700
              }}
            >
              🌟 Volunteer Success Stories
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Alex, Project Manager
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    "Led 4 hackathon projects as volunteer PM. Earned PMP certification and promoted to Senior PM within 8 months."
                  </Typography>                  
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Non-profit → Tech company PM
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Maria, Business Analyst
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    "Mentored teams in requirements gathering. Transitioned from customer service to BA role at Fortune 500 company."
                  </Typography>                  
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Customer service → Business Analyst
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ p: 3, background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    David, Team Lead
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    "Coordinated cross-functional teams in 6 hackathons. Promoted to Engineering Team Lead with 8 direct reports."
                  </Typography>                  
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Developer → Engineering Team Lead
                  </Typography>
                </Card>
              </Grid>
            </Grid>
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
              Ready to Accelerate Your Career?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
              Join professionals who are building career-defining skills through meaningful volunteer work. 
              Develop leadership, project management, and communication abilities that employers reward.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/hackathon" passHref>
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
                  Volunteer at Next Event
                </Button>
              </Link>
              
              <Link href="/about/hackers/software-engineering-career-path" passHref>
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
                  AI-Proof Career Skills
                </Button>
              </Link>

              <Link href="/about" passHref>
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
                  Learn More About Us
                </Button>
              </Link>
            </Box>
                        
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProfessionalDevelopmentVolunteering;