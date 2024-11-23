import { Card, CardContent, Chip, Stack, Typography, Link, Tooltip, Box, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DevpostIcon from '@mui/icons-material/Code';
import ReactMarkdown from 'react-markdown';
import NextLink from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';
import TagIcon from '@mui/icons-material/Tag';
import LaunchIcon from '@mui/icons-material/Launch';
import BuildIcon from '@mui/icons-material/Build';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function ProjectCard({ project, hackathons }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    'concept': 'info',
    'hackathon': 'warning',
    'post-hackathon': 'secondary',
    'production': 'success'
  };

  const getGithubUrl = () => {
    if (!project.github) return null;
    if (typeof project.github === 'string') return project.github;
    if (Array.isArray(project.github)) return project.github[0]?.link;
    return project.github.link;
  };

  const getRelatedHackathons = () => {
    if (!project.events || !hackathons) return [];
    return hackathons.filter(h => project.events.includes(h.id));
  };

  const getHelperTooltip = () => {
    if (!project.helping?.length) return '';
    const roleCounts = project.helping.reduce((acc, helper) => {
        const type = helper.type || 'Person';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    return (
      <span style={{ fontSize: "14px" }}>
        {`Helpers: ${Object.entries(roleCounts)
          .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
          .join(", ")}`}
      </span>
    );
  };

  const projectHackathons = getRelatedHackathons();

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease'
    }}>
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        height: '100%'
      }}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <NextLink href={`/project/${project.id}`} passHref>
              <Link 
                underline="none" 
                sx={{ 
                  maxWidth: '80%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    '& .title-text': {
                      color: 'primary.main',
                    },
                    '& .launch-icon': {
                      transform: 'translate(2px, -2px)',
                      color: 'primary.main',
                    }
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  className="title-text"
                  sx={{ 
                    transition: 'color 0.2s ease',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {project.title}
                  <LaunchIcon 
                    className="launch-icon"
                    sx={{ 
                      fontSize: '0.9em',
                      transition: 'transform 0.2s ease, color 0.2s ease',
                      color: 'text.secondary'
                    }} 
                  />
                </Typography>
              </Link>
            </NextLink>
            <Chip 
              label={project.status} 
              color={statusColors[project.status] || 'default'} 
              size="small"
              sx={{ flexShrink: 0 }}
            />
          </Stack>

          {/* Description */}
          <Box sx={{ 
            position: 'relative',
            minHeight: '80px',
            maxHeight: expanded ? 'none' : '80px',
            overflow: 'hidden'
          }}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              component="div"
              sx={{ 
                mb: expanded ? 0 : 3 // Space for fade when collapsed
              }}
            >
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </Typography>
            {!expanded && (
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'linear-gradient(transparent, white)',
                pointerEvents: 'none'
              }} />
            )}
          </Box>
          
          {project.description.length > 150 && (
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ alignSelf: 'center', mt: -1 }}
            >
              {expanded ? 'Show Less' : 'Read More'}
            </Button>
          )}

          {/* Action Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ my: 'auto' }}>
            {getGithubUrl() && (
              <Chip
                icon={<GitHubIcon />}
                label="GitHub"
                component={Link}
                href={getGithubUrl()}
                clickable
                size="small"
              />
            )}
            {project.helping?.length > 0 && (
              <Tooltip title={getHelperTooltip()}>
                <Chip
                  icon={<GroupIcon />}
                  label={`${project.helping.length} Helpers`}
                  size="small"
                />
              </Tooltip>
            )}
            {project.slack_channel && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<TagIcon />}
                component={Link}
                href={`https://opportunity-hack.slack.com/app_redirect?channel=${project.slack_channel}`}
                sx={{ 
                  fontFamily: 'Courier, monospace',
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  minHeight: '24px',
                  padding: '0px 8px',
                  borderRadius: '16px'
                }}
              >
                {project.slack_channel}
              </Button>
            )}
          </Stack>

          {/* Skills Section */}
          {project.skills && project.skills.length > 0 && (
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              backgroundColor: 'background.paper'
            }}>
              <Typography 
                variant="subtitle2" 
                color="primary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1
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
                  '& .MuiChip-root': {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                    }
                  }
                }}
              >
                {project.skills.map(skill => (
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

          {/* Hackathon Info Section */}
          {projectHackathons.length > 0 && (
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              backgroundColor: 'background.paper'
            }}>
              <Typography 
                variant="subtitle2" 
                color="primary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1
                }}
              >
                <EmojiEventsIcon fontSize="small" />
                Hackathon History
              </Typography>
              <Stack spacing={2}>
                {projectHackathons.map(hackathon => (
                  <Box 
                    key={hackathon.id}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {hackathon.title || `${hackathon.type.charAt(0).toUpperCase() + hackathon.type.slice(1)}`}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {hackathon.location && (
                        <Chip
                          icon={<LocationOnIcon sx={{ fontSize: '1rem' }} />}
                          label={hackathon.location}
                          size="small"
                          variant="outlined"
                          sx={{ bgcolor: 'background.paper' }}
                        />
                      )}
                      {hackathon.devpost_url && (
                        <Chip
                          icon={<DevpostIcon />}
                          label="DevPost"
                          component={Link}
                          href={hackathon.devpost_url}
                          clickable
                          size="small"
                          sx={{ bgcolor: 'background.paper' }}
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}