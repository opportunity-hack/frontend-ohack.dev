import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, TextField, InputAdornment, Chip, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PraiseCard from './PraiseCard';
import PraiseStats from './PraiseStats';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%',
  maxWidth: '600px',
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(4),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const PraiseBoard = () => {
  const [praises, setPraises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [peopleFilter, setPeopleFilter] = useState('all');
  const [uniquePeople, setUniquePeople] = useState([]);
  
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchPraises = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/praises`);        
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setPraises(data.text || []);
        
        // Extract unique people for filtering
        const allPeople = new Set();
        data.text?.forEach(praise => {
          if (praise.praise_sender_details?.real_name) {
            allPeople.add(praise.praise_sender_details.real_name);
          }
          if (praise.praise_receiver_details?.real_name) {
            allPeople.add(praise.praise_receiver_details.real_name);
          }
        });
        setUniquePeople(Array.from(allPeople).sort());
        
      } catch (err) {
        console.error('Error fetching praises:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPraises();
  }, []);

  // Filter praises based on search term and people filter
  const filteredPraises = praises.filter(praise => {
    const matchesSearch = searchTerm === '' || 
      praise.praise_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      praise.praise_sender_details?.real_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      praise.praise_receiver_details?.real_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeopleFilter = 
      peopleFilter === 'all' ||
      praise.praise_sender_details?.real_name === peopleFilter ||
      praise.praise_receiver_details?.real_name === peopleFilter;
    
    return matchesSearch && matchesPeopleFilter;
  });

  // Paginate results
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPraises.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPraises.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePeopleFilterChange = (person) => {
    setPeopleFilter(person);
    setCurrentPage(1); // Reset to first page on new filter
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error" variant="h6">
          Error loading praises: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold" sx={{ mb: 3 }}>
        Community Praise Board
      </Typography>
      
      <Typography variant="body1" align="center" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
        Celebrating the amazing work and support of our community members. Here's where we showcase appreciation and recognition for those making a difference.
      </Typography>
      
      <PraiseStats praises={praises} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <SearchField
          placeholder="Search by message or name..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FilterContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" component="span">
              Filter by person:
            </Typography>
          </Box>
          
          <Chip 
            label="All" 
            onClick={() => handlePeopleFilterChange('all')}
            color={peopleFilter === 'all' ? 'primary' : 'default'}
            sx={{ fontWeight: peopleFilter === 'all' ? 'bold' : 'normal' }}
          />
          
          {uniquePeople.slice(0, 10).map((person) => (
            <Chip 
              key={person}
              label={person}
              onClick={() => handlePeopleFilterChange(person)}
              color={peopleFilter === person ? 'primary' : 'default'}
              sx={{ fontWeight: peopleFilter === person ? 'bold' : 'normal' }}
            />
          ))}
          
          {uniquePeople.length > 10 && (
            <Chip 
              label={`+${uniquePeople.length - 10} more`}
              variant="outlined"
              disabled
            />
          )}
        </FilterContainer>
      </Box>
      
      <StatsContainer>
        <Typography variant="body2" color="textSecondary">
          Showing {currentItems.length} of {filteredPraises.length} praises
          {peopleFilter !== 'all' && ` for ${peopleFilter}`}
        </Typography>
        
        <Typography variant="body2" color="textSecondary">
          Total praises: {praises.length}
        </Typography>
      </StatsContainer>
      
      <Grid container spacing={3}>
        {currentItems.length > 0 ? (
          currentItems.map((praise) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={praise.id}>
              <PraiseCard praise={praise} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No praises found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {totalPages > 1 && (
        <PaginationContainer>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </PaginationContainer>
      )}
    </StyledContainer>
  );
};

export default PraiseBoard;