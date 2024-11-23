import { Box, Card, CardContent, CardMedia, Grid, Typography, Chip, Stack, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import GroupIcon from '@mui/icons-material/Group';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Tooltip from '@mui/material/Tooltip';
import ReactMarkdown from 'react-markdown';
import NextLink from 'next/link';
import LaunchIcon from '@mui/icons-material/Launch';
import BuildIcon from '@mui/icons-material/Build';

export default function FeaturedProjects({ projects }) {
  const FEATURED_IMAGES = [
    'https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp',
    'https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp',
    'https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp',
    'https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp',
    'https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp',
    'https://cdn.ohack.dev/ohack.dev/2023_hackathon_6.webp',
    'https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp',
    'https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp',
    'https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp',
    'https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp',
    'https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp',
    'https://cdn.ohack.dev/ohack.dev/2024_hackathon_6.webp',
  ];

  const getFeaturedImage = (project) => {
    // Use project id to consistently select the same image for each project
    const index = Math.abs(hashCode(project.id)) % FEATURED_IMAGES.length;
    return FEATURED_IMAGES[index];
  };

  // Simple string hash function
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  };

  if (!projects?.length) return null;

  const getGithubUrl = (project) => {
    if (!project.github) return null;
    if (typeof project.github === 'string') return project.github;
    if (Array.isArray(project.github)) return project.github[0]?.link;
    return project.github.link;
  };

  const getHelperTooltip = (project) => {
    if (!project.helping?.length) return "";
    const roleCounts = project.helping.reduce((acc, helper) => {
      const type = helper.type || "Person";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return <span style={{ fontSize: '14px' }}>
        {`Helpers: ${Object.entries(roleCounts)
            .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
            .join(", ")}`}
    </span>;
  };

  return (
    <Grid container spacing={3}>
      {projects.map((project) => (
        <Grid item xs={12} md={4} key={project.id}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardMedia
              component="img"
              height="140"
              image={getFeaturedImage(project)}
              alt={project.title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack spacing={2}>
                <NextLink href={`/project/${project.id}`} passHref>
                  <Link
                    underline="none"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      p: 1,
                      borderRadius: 1,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                        "& .title-text": {
                          color: "primary.main",
                        },
                        "& .launch-icon": {
                          transform: "translate(2px, -2px)",
                          color: "primary.main",
                        },
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      className="title-text"
                      sx={{
                        transition: "color 0.2s ease",
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {project.title}
                      <LaunchIcon
                        className="launch-icon"
                        sx={{
                          fontSize: "0.9em",
                          transition: "transform 0.2s ease, color 0.2s ease",
                          color: "text.secondary",
                        }}
                      />
                    </Typography>
                  </Link>
                </NextLink>

                {project.status && (
                <NextLink href={`/project/${project.id}`} passHref>
                  <Chip label={project.status} size="small" color="success" />
                </NextLink>
                )}

                <Typography
                  variant="body1"
                  color="text.secondary"
                  component="div"
                  sx={{
                    minHeight: "4.5em",
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      left: 0,
                      height: "2em",
                      background: "linear-gradient(transparent, white)",
                    },
                  }}
                >
                  <ReactMarkdown>{project.description}</ReactMarkdown>
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {getGithubUrl(project) && (
                    <Chip
                      icon={<GitHubIcon />}
                      label="GitHub"
                      component={Link}
                      href={getGithubUrl(project)}
                      clickable
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}

                  {project.helping?.length > 0 && (
                    <Tooltip title={getHelperTooltip(project)}>
                      <Chip
                        icon={<GroupIcon />}
                        label={`${project.helping.length} Helpers`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Stack>

                {project.skills && project.skills.length > 0 && (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1.5,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <BuildIcon fontSize="small" />
                      Skills Used
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{
                        "& .MuiChip-root": {
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                          },
                        },
                      }}
                    >
                      {project.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
