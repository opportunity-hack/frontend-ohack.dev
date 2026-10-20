import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Divider,
  TextField, InputAdornment, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PublicIcon from '@mui/icons-material/Public';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import DotRangeChart from '../../components/NonprofitData/DotRangeChart';
import reportData from '../../data/nonprofit_grants_report.json';

// Salary benchmarks from IRS Form 990 Part VII (via ProPublica Nonprofit
// Explorer), built by the Grant Finder v2 crawler. Data contract:
// salary_benchmarks = [{ role, revenue_band, count, median, p25, p75 }]
// salary_samples    = the highest-paid individual records in the data
// salary_methodology = { source, universe, filters, organizations_used,
//                        people_counted, generated_at }

const BAND_ORDER = ['Under $1M', '$1M - $10M', '$10M+'];

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const revenueBandOf = (revenue) => {
  if (revenue == null) return 'Unknown';
  if (revenue < 1_000_000) return 'Under $1M';
  if (revenue < 10_000_000) return '$1M - $10M';
  return '$10M+';
};

const niceCeil = (value) => Math.max(50000, Math.ceil(value / 50000) * 50000);

const NonprofitSalaries = () => {
  const theme = useTheme();
  const benchmarks = reportData.salary_benchmarks || [];
  const samples = reportData.salary_samples || [];
  const methodology = reportData.salary_methodology || {};

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [bandFilter, setBandFilter] = useState('All sizes');
  const [stateFilter, setStateFilter] = useState('All states');

  const allSizes = useMemo(
    () => benchmarks.filter((b) => b.revenue_band === 'All sizes')
      .sort((a, b) => b.median - a.median),
    [benchmarks],
  );
  const chartMax = useMemo(
    () => niceCeil(Math.max(0, ...benchmarks.map((b) => b.p75 || 0))),
    [benchmarks],
  );
  const roles = useMemo(() => allSizes.map((b) => b.role), [allSizes]);
  const states = useMemo(
    () => [...new Set(samples.map((s) => s.state).filter(Boolean))].sort(),
    [samples],
  );
  const filingYears = useMemo(
    () => samples.map((s) => s.filing_year).filter(Boolean),
    [samples],
  );

  const edAll = allSizes.find((b) => b.role.startsWith('Executive Director'));
  const edSmall = benchmarks.find((b) => b.role === edAll?.role && b.revenue_band === 'Under $1M');
  const edMid = benchmarks.find((b) => b.role === edAll?.role && b.revenue_band === '$1M - $10M');
  const sizePremium = edSmall && edMid
    ? Math.round(((edMid.median / edSmall.median) - 1) * 100)
    : null;
  const topSample = useMemo(
    () => [...samples].sort((a, b) => b.comp_total - a.comp_total)[0],
    [samples],
  );

  const visibleSamples = useMemo(() => {
    const term = query.toLowerCase();
    return [...samples]
      .sort((a, b) => b.comp_total - a.comp_total)
      .filter((s) => roleFilter === 'All roles' || s.role === roleFilter)
      .filter((s) => bandFilter === 'All sizes' || revenueBandOf(s.revenue) === bandFilter)
      .filter((s) => stateFilter === 'All states' || s.state === stateFilter)
      .filter((s) => term === ''
        || s.org_name?.toLowerCase().includes(term)
        || s.title?.toLowerCase().includes(term)
        || s.city?.toLowerCase().includes(term));
  }, [samples, query, roleFilter, bandFilter, stateFilter]);

  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Nonprofit Salary Benchmarks from IRS Form 990 Filings',
    description: 'Median pay and pay ranges for nonprofit executive directors, finance, operations, development and program leaders, from IRS Form 990 Part VII compensation disclosures.',
    url: 'https://www.ohack.dev/nonprofit-salaries',
    dateModified: methodology.generated_at || undefined,
    creator: { '@type': 'Organization', name: 'Opportunity Hack', url: 'https://www.ohack.dev' },
    keywords: ['nonprofit salaries', 'nonprofit executive director salary', 'Form 990', 'salary benchmarks', 'nonprofit compensation'],
    variableMeasured: ['Total compensation', 'Job role', 'Organization revenue'],
  };

  return (
    <>
      <Head>
        <title>Nonprofit Salary Benchmarks: What Nonprofits Pay Their Leaders (Form 990 Data) | Opportunity Hack</title>
        <meta name="description" content="What do nonprofits actually pay executive directors, CFOs and program leaders? Median pay and ranges from real IRS Form 990 filings, grouped by role and organization size. Free data from Opportunity Hack." />
        <meta name="keywords" content="nonprofit salary benchmarks, nonprofit executive director salary, nonprofit CEO pay, Form 990 compensation, nonprofit pay ranges, charity salary data" />
        <meta property="og:title" content="Nonprofit Salary Benchmarks: What Nonprofits Pay (Form 990 Data)" />
        <meta property="og:description" content="Median pay and pay ranges for nonprofit leaders, from real IRS Form 990 filings. Grouped by role and organization size." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/nonprofit-salaries" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nonprofit Salary Benchmarks: What Nonprofits Pay (Form 990 Data)" />
        <meta name="twitter:description" content="Median pay and pay ranges for nonprofit leaders, from real IRS Form 990 filings." />
        <link rel="canonical" href="https://www.ohack.dev/nonprofit-salaries" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      </Head>

      <Navbar />

      <Box sx={{ bgcolor: theme.palette.background.default, pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" align="center" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '2.75rem', md: '3.75rem' } }}>
            What Do Nonprofits Pay?
          </Typography>
          <Typography variant="h5" component="h2" align="center" color="textSecondary" paragraph sx={{ mb: 4, maxWidth: '820px', mx: 'auto', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            Salary benchmarks from the IRS Form 990 filings nonprofits already make public,
            so your board can set pay that is fair, competitive, and defensible.
          </Typography>

          {benchmarks.length === 0 ? (
            <Card sx={{ mb: 6 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fresh data is on its way</Typography>
                <Typography color="text.secondary">
                  We are rebuilding this dataset from the latest Form 990 filings. Check back shortly,
                  or browse the <a href="/nonprofit-grants">nonprofit grants directory</a> in the meantime.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card elevation={0} sx={{ bgcolor: 'primary.light', p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GroupsIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="black">People Counted</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.35rem', sm: '2.125rem' } }}>{methodology.people_counted ?? samples.length}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card elevation={0} sx={{ bgcolor: 'success.light', p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccountBalanceIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="black">Organizations</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.35rem', sm: '2.125rem' } }}>{methodology.organizations_used ?? 0}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card elevation={0} sx={{ bgcolor: 'warning.light', p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PublicIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="black">States Represented</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.35rem', sm: '2.125rem' } }}>{states.length || 1}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card elevation={0} sx={{ bgcolor: 'info.light', p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="black">Executive Director / CEO Median</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.35rem', sm: '2.125rem' } }}>{edAll ? formatMoney(edAll.median) : '—'}</Typography>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontSize: { xs: '1.55rem', sm: '2.125rem' } }}>The takeaways</Typography>
                {edAll && (
                  <Typography paragraph>
                    The typical nonprofit executive director or CEO in this data earns{' '}
                    <strong>{formatMoney(edAll.median)}</strong> in total compensation
                    (n={edAll.count}), with the middle half between {formatMoney(edAll.p25)} and{' '}
                    {formatMoney(edAll.p75)}.
                  </Typography>
                )}
                {sizePremium != null && (
                  <Typography paragraph>
                    Size is the strongest pay signal we can see: executive directors at organizations
                    with $1M to $10M in revenue earn a median {formatMoney(edMid.median)}, about{' '}
                    <strong>{sizePremium}% more</strong> than the {formatMoney(edSmall.median)} median
                    at organizations under $1M.
                  </Typography>
                )}
                {topSample && (
                  <Typography paragraph>
                    The highest-paid person in the sample is a {topSample.title.toLowerCase()} at{' '}
                    {topSample.org_name} ({topSample.city}{topSample.state ? `, ${topSample.state}` : ''}),
                    at {formatMoney(topSample.comp_total)} total compensation. Outliers like this are
                    why we benchmark with medians, not averages.
                  </Typography>
                )}
              </Box>

              <Typography variant="h4" component="h2" gutterBottom sx={{ fontSize: { xs: '1.55rem', sm: '2.125rem' } }}>
                Median pay by role
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: '800px' }}>
                Every officer, director, and key employee a nonprofit lists in Part VII of its Form 990,
                grouped into roles by job title. Only people averaging at least 20 hours a week and at
                least $20,000 in total pay are counted, so unpaid board members do not drag the numbers down.
              </Typography>
              <Card sx={{ mb: 6 }}>
                <CardContent>
                  <DotRangeChart
                    max={chartMax}
                    rows={allSizes.map((b) => ({
                      label: b.role,
                      sublabel: `${b.count} people`,
                      n: b.count,
                      p25: b.p25,
                      median: b.median,
                      p75: b.p75,
                    }))}
                  />
                </CardContent>
              </Card>

              <Typography variant="h4" component="h2" gutterBottom sx={{ fontSize: { xs: '1.55rem', sm: '2.125rem' } }}>
                Pay by organization size
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: '800px' }}>
                The same roles, split by the organization's annual revenue. Compare against organizations
                your own size: a $400K charity and a $40M health network are not paying from the same market.
              </Typography>
              {roles.map((role) => {
                const bandRows = benchmarks
                  .filter((b) => b.role === role && b.revenue_band !== 'All sizes')
                  .sort((a, b) => BAND_ORDER.indexOf(a.revenue_band) - BAND_ORDER.indexOf(b.revenue_band));
                if (bandRows.length === 0) return null;
                return (
                  <Card key={role} sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>{role}</Typography>
                      <DotRangeChart
                        max={chartMax}
                        rows={bandRows.map((b) => ({
                          label: b.revenue_band,
                          sublabel: `${b.count} people`,
                          n: b.count,
                          p25: b.p25,
                          median: b.median,
                          p75: b.p75,
                        }))}
                      />
                    </CardContent>
                  </Card>
                );
              })}

              <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, fontSize: { xs: '1.55rem', sm: '2.125rem' } }}>
                Look up pay at organizations like yours
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: '800px' }}>
                The individual records below are the highest-paid people in the dataset, shown so you can
                sanity-check the benchmarks against real filings. The charts above are built from everyone
                counted, not just this list.
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search organization, title, or city"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField select fullWidth label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <MenuItem value="All roles">All roles</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <TextField select fullWidth label="Org revenue" value={bandFilter} onChange={(e) => setBandFilter(e.target.value)}>
                    <MenuItem value="All sizes">All sizes</MenuItem>
                    {BAND_ORDER.map((band) => (
                      <MenuItem key={band} value={band}>{band}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                  <TextField select fullWidth label="State" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                    <MenuItem value="All states">All states</MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Showing {visibleSamples.length} of {samples.length} records
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 6 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Organization / Title</strong></TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Location</strong></TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><strong>Role</strong></TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Org revenue</strong></TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}><strong>Hours/wk</strong></TableCell>
                      <TableCell align="right"><strong>Total comp</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleSamples.map((s) => (
                      <TableRow key={`${s.ein}-${s.title}-${s.comp_total}`}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.org_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.title} · filed {s.filing_year}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{s.city}{s.state ? `, ${s.state}` : ''}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{s.role}</TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{s.revenue != null ? formatMoney(s.revenue) : '—'}</TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{s.hours ?? '—'}</TableCell>
                        <TableCell align="right"><strong>{formatMoney(s.comp_total)}</strong></TableCell>
                      </TableRow>
                    ))}
                    {visibleSamples.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No records match those filters</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>How boards use this</Typography>
                      <Typography paragraph>
                        <strong>Before a salary decision:</strong> find your role above, pick the revenue
                        band closest to your organization's, and use the median and middle 50% as the
                        range to discuss, not a single magic number.
                      </Typography>
                      <Typography paragraph>
                        <strong>In your records:</strong> the IRS expects boards to document how pay was
                        set using comparable data. These figures come from the same Form 990 data the IRS
                        itself publishes, and the methodology below is written to be cited in minutes.
                      </Typography>
                      <Typography>
                        <strong>When hiring:</strong> if your offer sits below the 25th percentile for
                        your size band, expect a harder search, and budget for it openly.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>Methodology and limits</Typography>
                      {methodology.universe && (
                        <Typography paragraph>
                          <strong>Universe:</strong> {methodology.universe}.
                        </Typography>
                      )}
                      {methodology.filters && (
                        <Typography paragraph>
                          <strong>Filters:</strong> {methodology.filters}.
                        </Typography>
                      )}
                      <Typography paragraph>
                        <strong>Source:</strong> {methodology.source || 'IRS Form 990 Part VII via ProPublica Nonprofit Explorer'}.
                        Total compensation is reportable pay from the organization plus related
                        organizations and other compensation, exactly as filed.
                      </Typography>
                      <Typography color="text.secondary">
                        Limits: Form 990s lag real life, most filings here are for fiscal years ending
                        {filingYears.length ? ` ${Math.min(...filingYears)} to ${Math.max(...filingYears)}` : ''}.
                        Job titles are grouped by keyword, so an unusual title can land in a neighboring
                        bucket. Small groups are never published: a benchmark needs at least 4 people.
                      </Typography>
                      {methodology.generated_at && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                          Data generated {formatDate(methodology.generated_at)} ·{' '}
                          {methodology.people_counted} people at {methodology.organizations_used} organizations
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Pay is only half the budget picture
            </Typography>
            <Typography paragraph sx={{ maxWidth: '720px', mx: 'auto' }}>
              See what funding is open right now in the nonprofit grants directory, and learn how
              Opportunity Hack's volunteer developers can build your next tool for free.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary" size="large" href="/nonprofit-grants">
                Browse Open Grants
              </Button>
              <Button variant="outlined" color="primary" size="large" href="/nonprofits">
                How Opportunity Hack Helps
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default NonprofitSalaries;
