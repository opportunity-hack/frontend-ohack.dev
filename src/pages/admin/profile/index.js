import React, { useState, useEffect } from 'react';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import {
  Typography,
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
  TextField,
  TableSortLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Head from 'next/head';
import { styled } from '@mui/system';

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

const AdminProfilePage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderBy, setOrderBy] = useState('email');
  const [order, setOrder] = useState('asc');
  const [filter, setFilter] = useState('');

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasAllPermissions(["profile.admin"]);
  // const orgId = org.orgId; PropelAuth likes you to pass this in as a req param, but we hardcoded this on the backend because we only have 1 organization

  const fetchProfiles = async () => {
    setLoading(true);
    try {        
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/admin/profiles`, {
        method: 'GET',        
        headers: {
          "authorization": `Bearer ${accessToken}`,
          "content-type": "application/json",
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profiles: ", data.profiles);
        setProfiles(data.profiles);
      } else {
        throw new Error('Failed to fetch user profiles');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch user profiles. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin, accessToken]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProfiles = profiles.sort((a, b) => {    

    if (orderBy === 'email') {
        // Handle null or undefined values for email_address
        if( a.email_address === null || a.email_address === undefined ) {
            a.email_address = "";
        }
        if( b.email_address === null || b.email_address === undefined ) {
            b.email_address = "";
        }
      return order === 'asc' ? (a.email_address || '').localeCompare(b.email_address || '') : (b.email_address || '').localeCompare(a.email_address || '');
    } else if (orderBy === 'name') {
      return order === 'asc' ? (a.name || '').localeCompare(b.name || '') : (b.name || '').localeCompare(a.name || '');
    } else if (orderBy === 'lastName') {
      return order === 'asc' ? (a.lastName || '').localeCompare(b.lastName || '') : (b.lastName || '').localeCompare(a.lastName || '');
    } else if (orderBy === 'last_login') {
      return order === 'asc' ? (a.last_login || '').localeCompare(b.last_login || '') : (b.last_login || '').localeCompare(a.last_login || '');
    }
    return 0;
  }).filter(profile => 
    profile.email_address?.toLowerCase().includes(filter.toLowerCase()) ||
    profile.name?.toLowerCase().includes(filter.toLowerCase()) ||
    profile.last_login?.toLowerCase().includes(filter.toLowerCase())    
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
        <title>Admin - User Profiles</title>
      </Head>
      <TitleContainer>
        <Typography variant="h4" gutterBottom>User Profiles</Typography>
      </TitleContainer>
      <StyledProjectsContainer>
        <Box sx={{ mb: 3, width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button onClick={fetchProfiles} variant="outlined">
                Refresh Data
              </Button>
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                label="Filter by Email, Last Login, or Name"
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
                      active={orderBy === 'email'}
                      direction={orderBy === 'email' ? order : 'asc'}
                      onClick={() => handleRequestSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={orderBy === 'last_login'}
                      direction={orderBy === 'last_login' ? order : 'asc'}
                      onClick={() => handleRequestSort('last_login')}
                    >
                        Last Login
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </StyledTableCell>
                  
                  <StyledTableCell>Details</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProfiles.map((profile) => (
                  <StyledTableRow key={profile.email}>
                    <StyledTableCell data-label="Email">{profile.email_address}</StyledTableCell>
                    <StyledTableCell data-label="Email">{profile.last_login}</StyledTableCell>
                    <StyledTableCell data-label="Name">{profile.name}</StyledTableCell>
                    
                    <StyledTableCell data-label="Details">
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>View Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="subtitle1">Role: {profile.role}</Typography>
                          <Typography variant="subtitle1">Expertise: {profile.expertise?.join(', ')}</Typography>
                          <Typography variant="subtitle1">Education: {profile.education}</Typography>
                          <Typography variant="subtitle1">Shirt Size: {profile.shirtSize}</Typography>
                          <Typography variant="subtitle1">GitHub: {profile.github}</Typography>
                          <Typography variant="subtitle1">Company: {profile.company}</Typography>
                          <Typography variant="subtitle1">Why: {profile.why}</Typography>
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

export default AdminProfilePage;