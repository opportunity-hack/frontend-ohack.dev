import React, { useState, useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import {
  Paper, Typography, Box, Grid, Chip, Link, Button,
  Divider, Skeleton, Avatar
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled, alpha } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import MergeIcon from '@mui/icons-material/Merge';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SchoolIcon from '@mui/icons-material/School';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PendingIcon from '@mui/icons-material/HourglassTop';
import { useAuthInfo } from '@propelauth/react';
import { WINNING_STATUSES, isWinningStatus, getWinningStatus } from '../../constants/teamStatus';
import TeamMember from './TeamMember';
import VideoDisplay from '../VideoDisplay/VideoDisplay';

const RANK_STYLES = {
  1: { gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)', emoji: '\uD83E\uDD47', border: '#FFD700' },
  2: { gradient: 'linear-gradient(135deg, #C0C0C0 0%, #9E9E9E 100%)', emoji: '\uD83E\uDD48', border: '#C0C0C0' },
  3: { gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)', emoji: '\uD83C\uDFC6', border: '#CD7F32' },
};

const ResultsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.15)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
  border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  borderRadius: theme.shape.borderRadius * 2,
}));

const StatCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[3],
  },
}));

const WinnerCard = styled(Paper)(({ theme, bordercolor }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: `2px solid ${bordercolor || theme.palette.divider}`,
  transition: 'transform 0.2s, box-shadow 0.2s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const RankBadge = styled(Avatar)(({ gradient }) => ({
  width: 48,
  height: 48,
  background: gradient,
  fontSize: '1.5rem',
  marginBottom: 8,
}));

const HackathonResults = ({ teams, nonprofitMap, eventId, eventTitle, githubOrg, fullResultsHref }) => {
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [volunteerCounts, setVolunteerCounts] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [memberProfiles, setMemberProfiles] = useState({});
  const { accessToken } = useAuthInfo();

  // Extract winning teams
  const winningTeams = useMemo(() => {
    if (!teams) return [];
    return teams
      .filter(team => isWinningStatus(team?.status))
      .map(team => ({ ...team, winInfo: getWinningStatus(team.status) }))
      .sort((a, b) => a.winInfo.rank - b.winInfo.rank);
  }, [teams]);

  // Compute basic stats from teams prop
  const totalTeams = teams?.length || 0;
  const totalParticipants = useMemo(() => {
    if (!teams) return 0;
    return teams.reduce((sum, t) => sum + (t?.users?.length || 0), 0);
  }, [teams]);

  // Fetch leaderboard stats
  useEffect(() => {
    if (!eventId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/leaderboard/${eventId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.generalStats) setLeaderboardStats(data.generalStats);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [eventId]);

  // Fetch profile details for winning-team members (so we can show avatars + names)
  useEffect(() => {
    if (!accessToken || winningTeams.length === 0) return;

    const userIds = new Set();
    winningTeams.forEach((team) => {
      if (Array.isArray(team.users)) {
        team.users.forEach((u) => {
          const id = typeof u === 'string' ? u : u?.user_id || u?.id;
          if (id) userIds.add(id);
        });
      }
    });
    if (userIds.size === 0) return;

    let cancelled = false;
    Promise.all(
      Array.from(userIds).map((userId) =>
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const profile = data?.text || data;
            if (profile) profile.user_id = userId;
            return [userId, profile];
          })
          .catch(() => [userId, null])
      )
    ).then((entries) => {
      if (cancelled) return;
      const map = {};
      entries.forEach(([id, profile]) => {
        if (profile) map[id] = profile;
      });
      setMemberProfiles(map);
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, winningTeams]);

  // Fetch volunteer/mentor/judge/hacker counts
  useEffect(() => {
    if (!eventId) return;
    const types = ['volunteer', 'mentor', 'judge', 'hacker'];
    Promise.allSettled(
      types.map(type =>
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}/${type}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            const all = data?.data || [];
            // Only count selected volunteers/mentors/judges (matches VolunteerList display)
            const count = type === 'hacker'
              ? all.length
              : all.filter(v => v?.isSelected).length;
            return { type, count };
          })
      )
    ).then(results => {
      const counts = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          counts[r.value.type] = r.value.count;
        }
      });
      setVolunteerCounts(counts);
    });
  }, [eventId]);

  // Extract specific stats from leaderboard
  const getLeaderboardStat = (keyword) => {
    if (!leaderboardStats) return null;
    const stat = leaderboardStats.find(s =>
      s.stat?.toLowerCase().includes(keyword.toLowerCase())
    );
    return stat?.value;
  };

  const commits = getLeaderboardStat('commit');
  const pullRequests = getLeaderboardStat('pull request') || getLeaderboardStat('pr');

  if (!teams || teams.length === 0) return null;

  const statItems = [
    { label: 'Teams', value: totalTeams, icon: <GroupIcon color="primary" /> },
    { label: 'Participants', value: totalParticipants, icon: <PersonIcon color="primary" /> },
    ...(commits ? [{ label: 'Commits', value: commits, icon: <CodeIcon color="primary" /> }] : []),
    ...(pullRequests ? [{ label: 'Pull Requests', value: pullRequests, icon: <MergeIcon color="primary" /> }] : []),
    ...(volunteerCounts.hacker ? [{ label: 'Hackers', value: volunteerCounts.hacker, icon: <PersonIcon color="secondary" /> }] : []),
    ...(volunteerCounts.volunteer ? [{ label: 'Volunteers', value: volunteerCounts.volunteer, icon: <VolunteerActivismIcon color="success" /> }] : []),
    ...(volunteerCounts.mentor ? [{ label: 'Mentors', value: volunteerCounts.mentor, icon: <SchoolIcon color="info" /> }] : []),
    ...(volunteerCounts.judge ? [{ label: 'Judges', value: volunteerCounts.judge, icon: <GavelIcon color="warning" /> }] : []),
  ];

  return (
    <ResultsContainer elevation={3} id="results">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} aria-hidden="true" />
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Hackathon Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {eventTitle}
        </Typography>
      </Box>

      {/* Impact Stats */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} justifyContent="center">
          {statItems.map((item, idx) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 'auto' }} key={idx}>
              <StatCard>
                {item.icon}
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </StatCard>
            </Grid>
          ))}
          {statsLoading && !commits && (
            <>
              {[1, 2].map(i => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`skeleton-${i}`}>
                  <StatCard>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton width={60} height={32} />
                    <Skeleton width={80} height={16} />
                  </StatCard>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Winners Showcase */}
      {winningTeams.length > 0 ? (
        <>
          <Typography variant="h5" component="h3" fontWeight="bold" textAlign="center" gutterBottom>
            Winning Teams
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {winningTeams.map((team) => {
              const rankStyle = RANK_STYLES[team.winInfo.rank] || RANK_STYLES[3];
              const nonprofitName = team.selected_nonprofit_id && nonprofitMap
                ? nonprofitMap[team.selected_nonprofit_id]
                : null;
              const githubLink = team.github_links?.[0]?.link;
              const memberCount = team.users?.length || 0;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
                  <WinnerCard elevation={2} bordercolor={rankStyle.border}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RankBadge gradient={rankStyle.gradient}>
                        {rankStyle.emoji}
                      </RankBadge>
                      <Box sx={{ ml: 2, minWidth: 0 }}>
                        <Chip
                          label={team.winInfo.label}
                          size="small"
                          sx={{
                            background: rankStyle.gradient,
                            color: '#fff',
                            fontWeight: 'bold',
                            mb: 0.5,
                          }}
                        />
                        {eventId && team.id ? (
                          <Link
                            component={NextLink}
                            href={`/hack/${eventId}/team/${team.id}`}
                            underline="none"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 0.75,
                              color: 'primary.main',
                              fontWeight: 'bold',
                              fontSize: '1.25rem',
                              lineHeight: 1.3,
                              maxWidth: '100%',
                              width: 'fit-content',
                              '& .team-name-text': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                borderBottom: '2px solid transparent',
                                transition: 'border-color 150ms ease',
                              },
                              '& .team-name-arrow': {
                                fontSize: '1.1rem',
                                transition: 'transform 150ms ease',
                                flexShrink: 0,
                              },
                              '&:hover .team-name-text': {
                                borderBottomColor: 'primary.main',
                              },
                              '&:hover .team-name-arrow': {
                                transform: 'translateX(3px)',
                              },
                              '&:focus-visible': {
                                outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                                outlineOffset: 2,
                                borderRadius: 1,
                              },
                            }}
                            aria-label={`View ${team.name} team page`}
                          >
                            <span className="team-name-text">{team.name}</span>
                            <ArrowForwardIcon className="team-name-arrow" />
                          </Link>
                        ) : (
                          <Typography variant="h6" fontWeight="bold" noWrap>
                            {team.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {nonprofitName && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Building for: <strong>{nonprofitName}</strong>
                      </Typography>
                    )}

                    {memberCount > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Team Members ({memberCount})
                        </Typography>
                        <Grid container spacing={1}>
                          {team.users.map((u, idx) => {
                            const id = typeof u === 'string' ? u : u?.user_id || u?.id;
                            const enriched = (id && memberProfiles[id]) || u;
                            return (
                              <TeamMember
                                key={id || `member-${idx}`}
                                user={enriched}
                                isCurrentUser={false}
                              />
                            );
                          })}
                        </Grid>
                      </Box>
                    )}

                    {team.demo_video_url && (
                      <Box sx={{ mb: 2 }}>
                        <VideoDisplay
                          url={team.demo_video_url}
                          title={`${team.name} demo`}
                        />
                      </Box>
                    )}

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {eventId && team.id && (
                        <Chip
                          icon={<OpenInNewIcon sx={{ color: 'inherit !important' }} />}
                          label="View team page"
                          component={NextLink}
                          href={`/hack/${eventId}/team/${team.id}`}
                          clickable
                          size="small"
                          color="primary"
                          sx={{
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 1.25 },
                          }}
                        />
                      )}
                      {githubLink && (
                        <Chip
                          icon={<GitHubIcon />}
                          label="GitHub"
                          component="a"
                          href={githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          clickable
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {team.devpost_link && (
                        <Chip
                          icon={<LaunchIcon />}
                          label="DevPost"
                          component="a"
                          href={team.devpost_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          clickable
                          variant="outlined"
                          size="small"
                          color="secondary"
                        />
                      )}
                    </Box>
                  </WinnerCard>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PendingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            Results Pending
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Judging is in progress — winners will be announced soon!
          </Typography>
        </Box>
      )}

      {/* CTA row */}
      <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        {fullResultsHref && (
          <Button
            variant="contained"
            color="primary"
            component="a"
            href={fullResultsHref}
          >
            See full results & hacker funnel →
          </Button>
        )}
        <Button
          variant="outlined"
          endIcon={<ArrowDownwardIcon />}
          href="#teams"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('teams')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          View all {totalTeams} teams
        </Button>
      </Box>
    </ResultsContainer>
  );
};

export default HackathonResults;
