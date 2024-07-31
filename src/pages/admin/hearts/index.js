import React, { useState, useEffect } from 'react';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import { 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Grid,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  TableSortLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Head from 'next/head';
import { styled } from '@mui/system';

const heartOptions = [
  { value: 'productionalized_projects', label: 'Productionalized Projects' },
  { value: 'requirements_gathering', label: 'Requirements Gathering' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'design_architecture', label: 'Design Architecture' },
  { value: 'code_quality', label: 'Code Quality' },
  { value: 'unit_test_coverage', label: 'Unit Test Coverage' },
  { value: 'unit_test_writing', label: 'Unit Test Writing' },
  { value: 'observability', label: 'Observability' },
  { value: 'standups_completed', label: 'Standups Completed' },
  { value: 'code_reliability', label: 'Code Reliability' },
  { value: 'customer_driven_innovation_and_design_thinking', label: 'Customer Driven Innovation and Design Thinking' },
  { value: 'iterations_of_code_pushed_to_production', label: 'Code Iterations Pushed to Production' },
];

const StyledProjectsContainer = styled(ProjectsContainer)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none',
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  '& .MuiTable-root': {
    minWidth: '100%',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderBottom: 'none',
    padding: '8px 16px',
    '&:before': {
      content: 'attr(data-label)',
      fontWeight: 'bold',
      marginBottom: '4px',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const AdminHeartsPage = withRequiredAuthInfo(({ userClass }) => {
  const { user, accessToken } = useAuthInfo();
  const [slackUsername, setSlackUsername] = useState('');
  const [selectedHearts, setSelectedHearts] = useState([]);
  const [heartCount, setHeartCount] = useState(0.5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usersHearts, setUsersHearts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('totalHearts');
  const [order, setOrder] = useState('desc');
  const [filter, setFilter] = useState('');
  const [awardHeartsButtonDisabled, setAwardHeartsButtonDisabled] = useState(false);
  

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const org = userClass.getOrgByName("Opportunity Hack Org");  
  const orgId = org.orgId;
  const isAdmin = org.hasPermission(["heart.admin"]);
  
  const handleHeartChange = (event) => {
    setSelectedHearts(event.target.value);
  };




  const fetchUsersHearts = async () => {    
    if( user === null ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hearts`, {
        method: 'GET',
          headers: {            
            "authorization": `Bearer ${accessToken}`,
            "content-type": "application/json",
          }        
      });
      
      

      if (response.ok) {
        const data = await response.json();
        setUsersHearts(data.hearts);
      } else {
        throw new Error('Failed to fetch users hearts');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch users hearts. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsersHearts();
    }
  }, [isAdmin]);

  const handleSubmit = async (event) => {
    setAwardHeartsButtonDisabled(true);
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hearts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Org-Id': orgId,
        },
        body: JSON.stringify({
          slackUsername,
          reasons: selectedHearts,
          amount: heartCount,
        }),
      });

      if (response.ok) {
        setAwardHeartsButtonDisabled(false);
        setSnackbar({ open: true, message: 'Hearts awarded successfully!', severity: 'success' });
        setSlackUsername('');
        setSelectedHearts([]);
        setHeartCount(0);
        fetchUsersHearts();
      } else {
        throw new Error('Failed to award hearts');
      }
    } catch (error) {
      setAwardHeartsButtonDisabled(false);
      setSnackbar({ open: true, message: 'Failed to award hearts. Please try again.', severity: 'error' });
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = usersHearts.sort((a, b) => {
    if (orderBy === 'totalHearts') {
      return order === 'asc' ? a.totalHearts - b.totalHearts : b.totalHearts - a.totalHearts;
    } else {
      return order === 'asc'
        ? a.slackUsername.localeCompare(b.slackUsername)
        : b.slackUsername.localeCompare(a.slackUsername);
    }
  }).filter(user => 
    user.slackUsername.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <LayoutContainer>
        <TitleContainer>
          <Typography variant="h4">Access Denied</Typography>
          <Typography>You do not have permission to view this page.</Typography>
        </TitleContainer>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <Head>
        <title>Admin - Award Hearts</title>
      </Head>
      <TitleContainer>
        <Typography variant="h4" gutterBottom>Award Hearts to Users</Typography>
      </TitleContainer>
      <StyledProjectsContainer>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Slack Member ID"
                value={slackUsername}
                onChange={(e) => setSlackUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Heart Types</InputLabel>
                <Select
                  multiple
                  value={selectedHearts}
                  onChange={handleHeartChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {heartOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Heart Count"
                value={heartCount}
                onChange={(e) => setHeartCount(parseFloat(e.target.value))}
                inputProps={{ min: 0.5, step: 0.5 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button type="submit" variant="contained" color="primary"  disabled={ awardHeartsButtonDisabled }  fullWidth>
                Award Hearts
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3, width: '100%' }}>
          <Typography variant="h5" gutterBottom>Users Hearts</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button onClick={fetchUsersHearts} variant="outlined">
                Refresh Data
              </Button>
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                label="Filter by Slack Username"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    <TableSortLabel
                      active={orderBy === 'slackUsername'}
                      direction={orderBy === 'slackUsername' ? order : 'asc'}
                      onClick={() => handleRequestSort('slackUsername')}
                    >
                      Slack Username
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={orderBy === 'totalHearts'}
                      direction={orderBy === 'totalHearts' ? order : 'asc'}
                      onClick={() => handleRequestSort('totalHearts')}
                    >
                      Total Hearts
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>Details</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <StyledTableRow key={user.slackUsername}>
                    <StyledTableCell data-label="Slack Username">{user.slackUsername}</StyledTableCell>
                    <StyledTableCell data-label="Total Hearts">{user.totalHearts}</StyledTableCell>
                    <StyledTableCell data-label="Details">
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>View Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="h6">How</Typography>
                          <Table size="small">
                            <TableBody>
                              {Object.entries(user.history.how).map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell>{key}</TableCell>
                                  <TableCell>{value}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Typography variant="h6" sx={{ mt: 2 }}>What</Typography>
                          <Table size="small">
                            <TableBody>
                              {Object.entries(user.history.what).map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell>{key}</TableCell>
                                  <TableCell>{value}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionDetails>
                      </Accordion>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </StyledProjectsContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutContainer>
  );
});

export default AdminHeartsPage;