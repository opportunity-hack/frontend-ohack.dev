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
import { isAfter, parseISO } from 'date-fns';
import { useAuthInfo } from '@propelauth/react';

const ImpactMetrics = ({ event_id, eventData, compact = false, minimal = false }) => {
  const theme = useTheme();
  const { accessToken } = useAuthInfo();
  const [metrics, setMetrics] = useState({
    loading: false, // Overall loading state
    error: null,
    volunteers: { total: 0, mentors: 0, judges: 0, volunteers: 0, loading: true },
    teams: { total: 0, active: 0, loading: true, requiresAuth: false },
    nonprofits: { total: 0, loading: true },
    github: { commits: 0, issues: 0, contributors: 0, loading: true },
    hackers: { total: 0, returning: 0, loading: true, requiresAuth: false }
  });

  // Fetch volunteers data
  const fetchVolunteers = useCallback(async () => {
    if (!event_id) return;

    try {
      const volunteerTypes = ['mentor', 'judge', 'volunteer', 'hacker'];
      const volunteerPromises = volunteerTypes.map(type =>
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/${type}`)
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => ({ type, data: data.data || [] }))
          .catch(() => ({ type, data: [] }))
      );

      const volunteerResults = await Promise.all(volunteerPromises);
      const volunteerMetrics = { total: 0, mentors: 0, judges: 0, volunteers: 0, loading: false };

      volunteerResults.forEach(result => {
        const selectedVolunteers = result.data.filter(v => v.isSelected);
        volunteerMetrics[result.type + 's'] = selectedVolunteers.length;
        volunteerMetrics.total += selectedVolunteers.length;
      });

      setMetrics(prev => ({
        ...prev,
        volunteers: volunteerMetrics
      }));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setMetrics(prev => ({
        ...prev,
        volunteers: { ...prev.volunteers, loading: false }
      }));
    }
  }, [event_id]);

  // Fetch GitHub data
  const fetchGitHub = useCallback(async () => {
    if (!event_id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/leaderboard/${event_id}`);
      const githubData = response.ok ? await response.json() : {};
      
      const githubMetrics = { commits: 0, issues: 0, contributors: 0, loading: false };

      if (githubData.generalStats) {
        githubData.generalStats.forEach(stat => {
          if (stat.stat?.toLowerCase().includes('commit')) {
            githubMetrics.commits += stat.value || 0;
          } else if (stat.stat?.toLowerCase().includes('issue')) {
            githubMetrics.issues += stat.value || 0;
          } else if (stat.stat?.toLowerCase().includes('contributor')) {
            githubMetrics.contributors += stat.value || 0;
          }
        });
      }

      setMetrics(prev => ({
        ...prev,
        github: githubMetrics
      }));
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      setMetrics(prev => ({
        ...prev,
        github: { ...prev.github, loading: false }
      }));
    }
  }, [event_id]);

  // Fetch teams data
  const fetchTeams = useCallback(async () => {
    if (!event_id) return;

    // If no access token, indicate auth is required
    if (!accessToken) {
      setMetrics(prev => ({
        ...prev,
        teams: { total: 0, active: 0, loading: false, requiresAuth: true },
        hackers: { total: 0, returning: 0, loading: false, requiresAuth: true }
      }));
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${eventData.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = response.ok ? await response.json() : { teams: [] };
      const teams = data.teams || [];

      const teamMetrics = {
        total: teams.length,
        active: teams.filter(team => team.active === "True" || team.active === true).length,
        loading: false,
        requiresAuth: false
      };

      // Count unique team members as hackers
      const uniqueHackers = new Set();
      teams.forEach(team => {
        if (Array.isArray(team.users)) {
          team.users.forEach(user => {
            const userId = typeof user === 'string' ? user : user.id || user.user_id;
            if (userId) uniqueHackers.add(userId);
          });
        }
      });

      const hackerMetrics = {
        total: uniqueHackers.size,
        returning: 0, // This would need additional logic to calculate
        loading: false,
        requiresAuth: false
      };

      setMetrics(prev => ({
        ...prev,
        teams: teamMetrics,
        hackers: hackerMetrics
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      setMetrics(prev => ({
        ...prev,
        teams: { ...prev.teams, loading: false },
        hackers: { ...prev.hackers, loading: false }
      }));
    }
  }, [event_id, accessToken, eventData.id]);

  // Fetch nonprofits data
  const fetchNonprofits = useCallback(async () => {
    if (!eventData.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos/hackathon/${eventData.id}`);
      const data = response.ok ? await response.json() : { nonprofits: [] };
      
      setMetrics(prev => ({
        ...prev,
        nonprofits: {
          total: (data.nonprofits || []).length,
          loading: false
        }
      }));
    } catch (error) {
      console.error('Error fetching nonprofits:', error);
      setMetrics(prev => ({
        ...prev,
        nonprofits: { ...prev.nonprofits, loading: false }
      }));
    }
  }, [eventData.id]);

  // Fetch all metrics data
  const fetchMetrics = useCallback(async () => {
    if (!event_id) return;

    // Reset loading states
    setMetrics(prev => ({
      ...prev,
      error: null,
      volunteers: { ...prev.volunteers, loading: true },
      teams: { ...prev.teams, loading: true },
      nonprofits: { ...prev.nonprofits, loading: true },
      github: { ...prev.github, loading: true },
      hackers: { ...prev.hackers, loading: true }
    }));

    // Fetch all metrics independently
    fetchVolunteers();
    fetchGitHub();
    fetchTeams();
    fetchNonprofits();
  }, [event_id, fetchVolunteers, fetchGitHub, fetchTeams, fetchNonprofits]);

  useEffect(() => {
    // Debounce the fetch to avoid rapid API calls
    const timeoutId = setTimeout(fetchMetrics, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchMetrics]);

  if (!event_id || !eventData) return null;

  // Don't show metrics for future events that haven't started yet
  const eventStarted = eventData.start_date && isAfter(new Date(), parseISO(eventData.start_date));
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

  const MetricCard = ({ title, value, icon, description, isLoading, color = "primary", requiresAuth = false }) => (
    <Card elevation={0} sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      backgroundColor: 'var(--surface-2, #F4F1E9)',
      border: '1px solid var(--line, #E7E1D4)',
      boxShadow: 'none',
      borderRadius: '10px',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 26px -22px rgba(22,24,29,0.5)' },
      minHeight: compact ? 50 : 120,
      opacity: requiresAuth ? 0.7 : 1
    }}>
      <CardContent sx={{ 
        textAlign: 'center', 
        p: compact ? 0.75 : 2,
        '&:last-child': { pb: compact ? 0.75 : 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: compact ? 0.25 : 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: compact ? '0.65rem' : '0.75rem' }}>
            {requiresAuth ? '🔒' : icon} {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width="60%" sx={{ margin: '0 auto', height: compact ? 18 : 32 }} />
        ) : requiresAuth ? (
          <Typography variant={compact ? "caption" : "body2"} color="text.secondary" sx={{ 
            fontSize: compact ? '0.7rem' : '0.9rem',
            fontStyle: 'italic'
          }}>
            {compact ? 'Login req.' : 'Login required'}
          </Typography>
        ) : (
          <Typography variant={compact ? "body2" : "h6"} sx={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 500,
            color: 'var(--brand, #1B3A6B)',
            fontSize: compact ? '1rem' : '1.45rem'
          }}>
            {value.toLocaleString()}
          </Typography>
        )}
        {description && !compact && !requiresAuth && (
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
        <Typography component="p" sx={{ mb: 2, textAlign: 'center', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted, #5B6270)' }}>
          Impact at a glance
        </Typography>
      )}

      <Grid container spacing={compact ? 0.5 : 1.5}>
        {/* Volunteers Metric */}
        <Grid size={{ xs: 6, sm: compact ? 6 : 3 }}>
          <MetricCard
            title="Volunteers"
            value={metrics.volunteers.total}
            icon="👥"
            description={compact ? null : "Hackers, mentors, judges & volunteers"}
            isLoading={metrics.volunteers.loading}
            color="info"
          />
        </Grid>

        {/* Teams Metric */}
        <Grid size={{ xs: 6, sm: compact ? 6 : 3 }}>
          <MetricCard
            title="Teams"
            value={metrics.teams.active || metrics.teams.total}
            icon="🚀"
            description={compact ? null : "Competing teams"}
            isLoading={metrics.teams.loading}
            color="success"
            requiresAuth={metrics.teams.requiresAuth}
          />
        </Grid>

        {/* GitHub Activity Metric - Only show on larger screens or if not compact */}
        {!compact && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricCard
              title="Commits"
              value={metrics.github.commits}
              icon="💻"
              description="Commits made"
              isLoading={metrics.github.loading}
              color="warning"
            />
          </Grid>
        )}

        {/* Nonprofits Metric */}
        <Grid size={{ xs: 6, sm: compact ? 6 : 3 }}>
          <MetricCard
            title="Nonprofits"
            value={metrics.nonprofits.total}
            icon="❤️"
            description={compact ? null : "Organizations helped"}
            isLoading={metrics.nonprofits.loading}
            color="error"
          />
        </Grid>

        {/* Show commits in compact mode on a second row */}
        {compact && metrics.github.commits > 0 && (
          <Grid size={{ xs: 6, sm: 6 }}>
            <MetricCard
              title="Commits"
              value={metrics.github.commits}
              icon="💻"
              isLoading={metrics.github.loading}
              color="warning"
            />
          </Grid>
        )}
      </Grid>

      {/* Additional metrics for larger screens - only in non-compact mode */}
      {!compact && (metrics.github.issues > 0 || metrics.github.contributors > 0) && (
        <Grid container spacing={1.5} sx={{ mt: 1, display: { xs: 'none', md: 'flex' } }}>
          {metrics.github.issues > 0 && (
            <Grid size={{ md: 4 }}>
              <MetricCard
                title="Issues"
                value={metrics.github.issues}
                icon="🐛"
                description="Issues opened/closed"
                isLoading={metrics.github.loading}
                color="secondary"
              />
            </Grid>
          )}
          {metrics.github.contributors > 0 && (
            <Grid size={{ md: 4 }}>
              <MetricCard
                title="Contributors"
                value={metrics.github.contributors}
                icon="👨‍💻"
                description="Active contributors"
                isLoading={metrics.github.loading}
                color="primary"
              />
            </Grid>
          )}
          {metrics.hackers.total > 0 && (
            <Grid size={{ md: 4 }}>
              <MetricCard
                title="Hackers"
                value={metrics.hackers.total}
                icon="⚡"
                description="Registered participants"
                isLoading={metrics.hackers.loading}
                color="info"
                requiresAuth={metrics.hackers.requiresAuth}
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