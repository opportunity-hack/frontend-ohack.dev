import React, { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Grid, Card, CardContent, TextField,
  InputAdornment, Button, Divider, useMediaQuery, Chip, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import UpdateIcon from '@mui/icons-material/Update';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import grantsData from '../../data/nonprofit_grants.json';
import reportData from '../../data/nonprofit_grants_report.json';

// Data contract (Grant Finder v2, nonprofit-grant-web-crawler repo):
// every record comes from a structured source (Grants.gov API, ProPublica
// Nonprofit Explorer / IRS Form 990 data, or a hand-verified curated list)
// and carries source + verification provenance. Amounts are only present
// when the source provides them as structured fields.

const todayIso = () => new Date().toISOString().slice(0, 10);

// A grant whose deadline has passed is never shown, even if the data
// file ages between refreshes.
const isOpen = (grant) => !grant.deadline_iso || grant.deadline_iso >= todayIso();

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatVerified = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const daysUntil = (isoDate) => {
  if (!isoDate) return null;
  const ms = new Date(`${isoDate}T00:00:00`) - new Date(`${todayIso()}T00:00:00`);
  return Math.round(ms / 86400000);
};

const closingChip = (grant) => {
  const days = daysUntil(grant.deadline_iso);
  if (days == null || days < 0) return null;
  const label = days === 0 ? 'Closes today' : days === 1 ? 'Closes tomorrow' : `${days} days left`;
  const color = days <= 14 ? 'error' : days <= 45 ? 'warning' : 'success';
  return <Chip label={label} color={color} size="small" sx={{ ml: 1 }} />;
};

const NonprofitGrants = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');

  const openGrants = grantsData.filter(isOpen);
  const curatedGrants = openGrants.filter((g) => g.source_api === 'curated');
  const federalGrants = openGrants.filter((g) => g.source_api !== 'curated');
  const funders = reportData.funders || [];
  const summary = reportData.summary || {};
  const salaryBenchmarks = reportData.salary_benchmarks || [];
  const salaryMethodology = reportData.salary_methodology || {};

  const closingSoon = federalGrants
    .filter((g) => {
      const days = daysUntil(g.deadline_iso);
      return days != null && days >= 0 && days <= 60;
    })
    .sort((a, b) => a.deadline_iso.localeCompare(b.deadline_iso));
  const edBenchmark = salaryBenchmarks.find(
    (b) => b.revenue_band === 'All sizes' && b.role.startsWith('Executive Director'),
  );

  const matchesSearch = (grant) => {
    const term = searchTerm.toLowerCase();
    return (
      searchTerm === '' ||
      grant.title?.toLowerCase().includes(term) ||
      grant.description?.toLowerCase().includes(term) ||
      grant.source_name?.toLowerCase().includes(term)
    );
  };
  const visibleCurated = curatedGrants.filter(matchesSearch);
  const visibleFederal = federalGrants.filter(matchesSearch);

  const renderGrantCard = (grant) => (
    <Grid size={{ xs: 12 }} key={grant.source_id || grant.title}>
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        }
      }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h3">
            {grant.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mr: 1 }}>
              {grant.source_name}
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            {grant.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {grant.funding_amount && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    <strong>Amount:</strong> {formatMoney(grant.funding_amount.amount)}
                    {grant.funding_amount.range_max && ` - ${formatMoney(grant.funding_amount.range_max)}`}
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Deadline:</strong> {grant.deadline || 'Rolling - no fixed deadline'}
                  {closingChip(grant)}
                </Typography>
              </Box>
            </Grid>

            {grant.application_url && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<LinkIcon />}
                  href={grant.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth={isMobile}
                >
                  View Opportunity
                </Button>
              </Grid>
            )}
          </Grid>

          {grant.eligibility && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                <strong>Eligibility:</strong> {grant.eligibility}
              </Typography>
            </>
          )}

          {grant.verified_at && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Source: {grant.source_name} · Verified {formatVerified(grant.verified_at)}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <>
      <Head>
        <title>Nonprofit Grants Directory: Open Grants & Funding for Nonprofits | Opportunity Hack</title>
        <meta name="description" content="A free directory of open grants for nonprofits: federal opportunities from Grants.gov with real deadlines, technology programs open year-round, and Arizona foundations researched from IRS Form 990 filings. No paywall, no fees." />
        <meta name="keywords" content="nonprofit grants, grants for nonprofits, nonprofit funding, technology grants, Grants.gov nonprofit opportunities, foundation grants, Opportunity Hack" />
        <meta property="og:title" content="Nonprofit Grants Directory: Open Grants & Funding for Nonprofits" />
        <meta property="og:description" content="Open federal grants with real deadlines, year-round technology programs, and foundations researched from Form 990 data. Free, no paywall." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/nonprofit-grants" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nonprofit Grants Directory: Open Grants & Funding for Nonprofits" />
        <meta name="twitter:description" content="Open federal grants with real deadlines, year-round technology programs, and foundations researched from Form 990 data. Free, no paywall." />
        <link rel="canonical" href="https://www.ohack.dev/nonprofit-grants" />
      </Head>

      <Navbar />

      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          pt: 8,
          pb: 4
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" align="center" gutterBottom>
            Nonprofit Technology Grants Directory
          </Typography>

          <Typography variant="h5" component="h2" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
            Free access to technology grant opportunities for nonprofits - no paywall, no fees
          </Typography>

          {/* Report Summary Stats */}
          <Box sx={{ mb: 6 }}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Grants Report Summary
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Last updated: {formatVerified(summary.timestamp)}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ bgcolor: 'primary.light', p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="black">Open Opportunities</Typography>
                      </Box>
                      <Typography variant="h4">{openGrants.length}</Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ bgcolor: 'success.light', p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventAvailableIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="black">Closing in Next 60 Days</Typography>
                      </Box>
                      <Typography variant="h4">{closingSoon.length}</Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ bgcolor: 'warning.light', p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="black">Arizona Funders (990 Data)</Typography>
                      </Box>
                      <Typography variant="h4">{funders.length}</Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ bgcolor: 'info.light', p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <UpdateIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="black">Data Sources</Typography>
                      </Box>
                      <Typography variant="body1">Grants.gov · IRS Form 990 (ProPublica) · hand-verified programs</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            <Typography paragraph>
              At Opportunity Hack, we believe in empowering nonprofits with the technology resources they need to succeed.
              This directory is built from official, structured sources: open federal opportunities from Grants.gov,
              Arizona grantmaking foundations from IRS Form 990 filings, and a short list of recurring programs we
              verify by hand. Deadlines are real dates checked when the data is refreshed, and every listing shows
              its source.
            </Typography>
            <Typography paragraph>
              Unlike many grant directories that charge subscription fees, we're committed to providing this information at no cost
              to help your organization leverage technology and make a greater impact in the communities you serve.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search grants by keyword, source, or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {visibleCurated.length > 0 && (
            <>
              <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 2 }}>
                Start Here: Programs Open Year-Round
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Recurring programs for nonprofit technology that accept applications on a rolling basis,
                run an annual cycle, or fund by invitation. Each one is verified by hand; the status is in its description.
              </Typography>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {visibleCurated.map(renderGrantCard)}
              </Grid>
            </>
          )}

          {closingSoon.length > 0 && searchTerm === '' && (
            <>
              <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 2 }}>
                Closing Soon
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Federal deadlines land whether the application is ready or not. These close in the
                next 60 days, soonest first; the bar drains as the deadline approaches.
              </Typography>
              <Card sx={{ mb: 6 }}>
                <CardContent>
                  {closingSoon.map((grant) => {
                    const days = daysUntil(grant.deadline_iso);
                    return (
                      <Box
                        key={grant.source_id || grant.title}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.25,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ width: { xs: 130, sm: 300 }, flexShrink: 0, pr: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {grant.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {grant.source_name} · {grant.deadline}
                          </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.max(2, (days / 60) * 100)}
                            color={days <= 14 ? 'error' : days <= 30 ? 'warning' : 'success'}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ width: { xs: 76, sm: 110 }, flexShrink: 0, pl: 2, textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {days === 0 ? 'Today' : `${days}d left`}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}

          <Typography variant="h4" component="h2" gutterBottom>
            Open Federal Opportunities
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Currently posted federal opportunities open to nonprofit organizations, sorted by deadline.
            Award amounts and full eligibility rules are on each official Grants.gov listing.
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom>
            Showing {visibleFederal.length} of {federalGrants.length} opportunities
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {visibleFederal.map(renderGrantCard)}
          </Grid>

          {visibleCurated.length === 0 && visibleFederal.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No grants found matching your criteria</Typography>
              <Typography variant="body1" color="textSecondary">Try adjusting your search</Typography>
            </Box>
          )}

          {funders.length > 0 && (
            <>
              <Typography variant="h4" component="h2" gutterBottom>
                Arizona Foundations to Research
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: '800px' }}>
                These Arizona foundations file IRS Form 990s as grantmaking organizations. A foundation's
                990-PF lists the grants it actually made, which is the best way to see whether it funds work
                like yours before you reach out. Open a foundation to see its filing record on ProPublica
                Nonprofit Explorer.
              </Typography>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {funders.map((funder) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={funder.ein}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {funder.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {funder.city}, {funder.state} · EIN {funder.ein}
                        </Typography>
                        {funder.latest_filing_year && (
                          <Typography variant="body2" color="text.secondary">
                            Latest 990 filing: {funder.latest_filing_year}
                          </Typography>
                        )}
                        {funder.total_assets != null && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Total assets: {formatMoney(funder.total_assets)}
                          </Typography>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          href={funder.propublica_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View 990 Filings
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}


          {salaryBenchmarks.length > 0 && (
            <Card sx={{ mb: 6, bgcolor: 'primary.light' }}>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom>
                  What Do Nonprofits Pay?
                </Typography>
                <Typography variant="body1" paragraph sx={{ maxWidth: '800px' }}>
                  The same Form 990 filings behind this directory also disclose what nonprofits pay
                  their leaders. We turned them into salary benchmarks by role and organization size
                  {edBenchmark && (
                    <>: the typical executive director or CEO earns <strong>{formatMoney(edBenchmark.median)}</strong> in
                    total compensation (median, n={edBenchmark.count})</>
                  )}
                  {salaryMethodology.people_counted && (
                    <>, from {salaryMethodology.people_counted} people at {salaryMethodology.organizations_used} organizations</>
                  )}.
                </Typography>
                <Button variant="contained" color="primary" size="large" href="/nonprofit-salaries">
                  See the Salary Benchmarks
                </Button>
              </CardContent>
            </Card>
          )}

          <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              How Opportunity Hack Helps Nonprofits
            </Typography>
            <Typography paragraph>
              Beyond this grants directory, Opportunity Hack connects nonprofit organizations with volunteer technologists
              who build software solutions to help you increase your impact. Our hackathons and ongoing projects help nonprofits
              leverage technology to solve their most pressing challenges.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="/nonprofits"
            >
              Learn How We Can Help Your Nonprofit
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default NonprofitGrants;
