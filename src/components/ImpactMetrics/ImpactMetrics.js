import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  LinearProgress, 
  Skeleton,
  useTheme
} from '@mui/material';
import Moment from 'moment';
import { useAuthInfo } from '@propelauth/react';

const ImpactMetrics = ({ event_id, eventData, compact = false, minimal = false }) => {
  const theme = useTheme();
  const { accessToken } = useAuthInfo();
  const [metrics, setMetrics] = useState({
    loading: true,
    error: null,
    volunteers: { total: 0, mentors: 0, judges: 0, volunteers: 0 },
    teams: { total: 0, active: 0 },
    nonprofits: { total: 0 },
    github: { commits: 0, issues: 0, contributors: 0 },
    hackers: { total: 0, returning: 0 }
  });

  // Fetch all metrics data
  const fetchMetrics = useCallback(async () => {
    if (!event_id) return;

    try {
      setMetrics(prev => ({ ...prev, loading: true, error: null }));

      // Fetch multiple data sources in parallel
      const promises = [];

      // 1. Fetch volunteers (mentors, judges, volunteers)
      const volunteerTypes = ['mentor', 'judge', 'volunteer'];
      volunteerTypes.forEach(type => {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/${type}`)
            .then(res => res.ok ? res.json() : { data: [] })
            .then(data => ({ type, data: data.data || [] }))
            .catch(() => ({ type, data: [] }))
        );
      });

      // 2. Fetch GitHub leaderboard data
      promises.push(
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/leaderboard/${event_id}`)
          .then(res => res.ok ? res.json() : {})
          .then(data => ({ type: 'github', data }))
          .catch(() => ({ type: 'github', data: {} }))
      );

      // 3. Fetch teams data (only if user is logged in)
      if (accessToken) {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${eventData.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
            .then(res => res.ok ? res.json() : { teams: [] })
            .then(data => ({ type: 'teams', data: data.teams || [] }))
            .catch(() => ({ type: 'teams', data: [] }))
        );
      }

      // 4. Fetch nonprofits data
      promises.push(
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos/hackathon/${eventData.id}`)
          .then(res => res.ok ? res.json() : { nonprofits: [] })
          .then(data => ({ type: 'nonprofits', data: data.nonprofits || [] }))
          .catch(() => ({ type: 'nonprofits', data: [] }))
      );

      const results = await Promise.all(promises);
      
      // Process results
      const newMetrics = {
        loading: false,
        error: null,
        volunteers: { total: 0, mentors: 0, judges: 0, volunteers: 0 },
        teams: { total: 0, active: 0 },
        nonprofits: { total: 0 },
        github: { commits: 0, issues: 0, contributors: 0 },
        hackers: { total: 0, returning: 0 }
      };

      results.forEach(result => {
        if (result.type === 'mentor' || result.type === 'judge' || result.type === 'volunteer') {
          const selectedVolunteers = result.data.filter(v => v.isSelected);
          newMetrics.volunteers[result.type + 's'] = selectedVolunteers.length;
          newMetrics.volunteers.total += selectedVolunteers.length;
        } else if (result.type === 'github') {
          const githubData = result.data;
          // Calculate GitHub metrics from general stats
          if (githubData.generalStats) {
            githubData.generalStats.forEach(stat => {
              if (stat.stat?.toLowerCase().includes('commit')) {
                newMetrics.github.commits += stat.value || 0;
              } else if (stat.stat?.toLowerCase().includes('issue')) {
                newMetrics.github.issues += stat.value || 0;
              } else if (stat.stat?.toLowerCase().includes('contributor')) {
                newMetrics.github.contributors += stat.value || 0;
              }
            });
          }
        } else if (result.type === 'teams') {
          newMetrics.teams.total = result.data.length;
          newMetrics.teams.active = result.data.filter(team => 
            team.active === "True" || team.active === true
          ).length;
          // Count unique team members as hackers
          const uniqueHackers = new Set();
          result.data.forEach(team => {
            if (Array.isArray(team.users)) {
              team.users.forEach(user => {
                const userId = typeof user === 'string' ? user : user.id || user.user_id;
                if (userId) uniqueHackers.add(userId);
              });
            }
          });
          newMetrics.hackers.total = uniqueHackers.size;
        } else if (result.type === 'nonprofits') {
          newMetrics.nonprofits.total = result.data.length;
        }
      });

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error fetching impact metrics:', error);
      setMetrics(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load impact metrics'
      }));
    }
  }, [event_id, accessToken, eventData.id]);

  useEffect(() => {
    // Debounce the fetch to avoid rapid API calls
    const timeoutId = setTimeout(fetchMetrics, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchMetrics]);

  if (!event_id || !eventData) return null;

  // Don't show metrics for future events that haven't started yet
  const eventStarted = eventData.start_date && Moment().isAfter(Moment(eventData.start_date));
  const hasAnyMetrics = metrics.volunteers.total > 0 || 
                       metrics.teams.total > 0 || 
                       metrics.github.commits > 0 ||
                       metrics.nonprofits.total > 0;

  if (!eventStarted && !hasAnyMetrics) return null;

  // Minimal inline format for previous events
  if (minimal) {
    if (metrics.loading) {
      return (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.9rem' }}>
          Loading impact data...
        </Typography>
      );
    }

    if (metrics.error || (!hasAnyMetrics && !metrics.loading)) {
      return null; // Don't show anything if no data
    }

    const metricItems = [];
    
    if (metrics.volunteers.total > 0) {
      metricItems.push(`👥 ${metrics.volunteers.total} volunteer${metrics.volunteers.total === 1 ? '' : 's'}`);
    }
    if (metrics.teams.active > 0 || metrics.teams.total > 0) {
      const teamCount = metrics.teams.active || metrics.teams.total;
      metricItems.push(`🚀 ${teamCount} team${teamCount === 1 ? '' : 's'}`);
    }
    if (metrics.nonprofits.total > 0) {
      metricItems.push(`❤️ ${metrics.nonprofits.total} nonprofit${metrics.nonprofits.total === 1 ? '' : 's'}`);
    }
    if (metrics.github.commits > 0) {
      metricItems.push(`💻 ${metrics.github.commits} commit${metrics.github.commits === 1 ? '' : 's'}`);
    }

    return metricItems.length > 0 ? (
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          display: 'block', 
          mt: 1, 
          fontSize: '0.9rem',
          lineHeight: 1.2
        }}
      >
        {metricItems.join(' • ')}
      </Typography>
    ) : null;
  }

  const MetricCard = ({ title, value, icon, description, isLoading, color = "primary" }) => (
    <Card sx={{ 
      height: '100%', 
      transition: 'transform 0.2s', 
      '&:hover': { transform: 'translateY(-2px)' },
      minHeight: compact ? 50 : 120
    }}>
      <CardContent sx={{ 
        textAlign: 'center', 
        p: compact ? 0.75 : 2,
        '&:last-child': { pb: compact ? 0.75 : 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: compact ? 0.25 : 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: compact ? '0.65rem' : '0.75rem' }}>
            {icon} {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width="60%" sx={{ margin: '0 auto', height: compact ? 18 : 32 }} />
        ) : (
          <Typography variant={compact ? "body2" : "h6"} color={`${color}.main`} sx={{ 
            fontWeight: 'bold', 
            fontSize: compact ? '0.9rem' : '1.25rem' 
          }}>
            {value.toLocaleString()}
          </Typography>
        )}
        {description && !compact && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: compact ? 1 : 3, mb: compact ? 0.5 : 2 }}>
      {!compact && (
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'text.primary' }}>
          🌟 Impact at a Glance
        </Typography>
      )}
      
      {metrics.loading && (
        <Box sx={{ mb: compact ? 1 : 2 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      <Grid container spacing={compact ? 0.5 : 1.5}>
        {/* Volunteers Metric */}
        <Grid item xs={6} sm={compact ? 6 : 3}>
          <MetricCard
            title="Volunteers"
            value={metrics.volunteers.total}
            icon="👥"
            description={compact ? null : "Mentors, judges & volunteers"}
            isLoading={metrics.loading}
            color="info"
          />
        </Grid>

        {/* Teams Metric */}
        <Grid item xs={6} sm={compact ? 6 : 3}>
          <MetricCard
            title="Teams"
            value={metrics.teams.active || metrics.teams.total}
            icon="🚀"
            description={compact ? null : "Competing teams"}
            isLoading={metrics.loading}
            color="success"
          />
        </Grid>

        {/* GitHub Activity Metric - Only show on larger screens or if not compact */}
        {!compact && (
          <Grid item xs={6} sm={3}>
            <MetricCard
              title="Commits"
              value={metrics.github.commits}
              icon="💻"
              description="Commits made"
              isLoading={metrics.loading}
              color="warning"
            />
          </Grid>
        )}

        {/* Nonprofits Metric */}
        <Grid item xs={6} sm={compact ? 6 : 3}>
          <MetricCard
            title="Nonprofits"
            value={metrics.nonprofits.total}
            icon="❤️"
            description={compact ? null : "Organizations helped"}
            isLoading={metrics.loading}
            color="error"
          />
        </Grid>

        {/* Show commits in compact mode on a second row */}
        {compact && metrics.github.commits > 0 && (
          <Grid item xs={6} sm={6}>
            <MetricCard
              title="Commits"
              value={metrics.github.commits}
              icon="💻"
              isLoading={metrics.loading}
              color="warning"
            />
          </Grid>
        )}
      </Grid>

      {/* Additional metrics for larger screens - only in non-compact mode */}
      {!compact && (metrics.github.issues > 0 || metrics.github.contributors > 0) && (
        <Grid container spacing={1.5} sx={{ mt: 1, display: { xs: 'none', md: 'flex' } }}>
          {metrics.github.issues > 0 && (
            <Grid item md={4}>
              <MetricCard
                title="Issues"
                value={metrics.github.issues}
                icon="🐛"
                description="Issues opened/closed"
                isLoading={metrics.loading}
                color="secondary"
              />
            </Grid>
          )}
          {metrics.github.contributors > 0 && (
            <Grid item md={4}>
              <MetricCard
                title="Contributors"
                value={metrics.github.contributors}
                icon="👨‍💻"
                description="Active contributors"
                isLoading={metrics.loading}
                color="primary"
              />
            </Grid>
          )}
          {metrics.hackers.total > 0 && (
            <Grid item md={4}>
              <MetricCard
                title="Hackers"
                value={metrics.hackers.total}
                icon="⚡"
                description="Registered participants"
                isLoading={metrics.loading}
                color="info"
              />
            </Grid>
          )}
        </Grid>
      )}

      {metrics.error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          {metrics.error}
        </Typography>
      )}
    </Box>
  );
};

export default ImpactMetrics;