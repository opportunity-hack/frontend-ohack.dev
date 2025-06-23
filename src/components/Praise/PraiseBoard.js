import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, TextField, InputAdornment, Chip, Pagination, Skeleton, Stack, Button } from '@mui/material';
import { SearchRounded, FilterListRounded, EmojiEmotions, SendRounded, RefreshRounded } from '@mui/icons-material';
import PraiseCard from './PraiseCard';
import PraiseStats from './PraiseStats';
import { styled, keyframes } from '@mui/material/styles';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(6),
}));

const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 8 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
            </Box>
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="text" width="40%" />
        </Box>
      </Grid>
    ))}
  </Grid>
);

const EmptyState = ({ onRefresh }) => (
  <Box sx={{ 
    textAlign: 'center', 
    py: 8,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: 4,
    border: '2px dashed #e0e7ff'
  }}>
    <EmojiEmotions 
      sx={{ 
        fontSize: '4rem', 
        color: '#667eea', 
        mb: 2,
        animation: `${bounce} 2s infinite`
      }} 
    />
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#667eea' }}>
      No praises found! 🤔
    </Typography>
    <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
      Looks like it's quiet here. Be the first to spread some love and recognition in our community!
    </Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
      <Button
        variant="contained"
        startIcon={<SendRounded />}
        sx={{ 
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          borderRadius: 25
        }}
        onClick={() => window.open('https://app.slack.com/client/T1Q7936BH', '_blank')}
      >
        Send First Praise
      </Button>
      <Button
        variant="outlined"
        startIcon={<RefreshRounded />}
        onClick={onRefresh}
        sx={{ borderRadius: 25 }}
      >
        Refresh
      </Button>
    </Stack>
  </Box>
);

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
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#667eea',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#667eea',
      borderWidth: '2px',
    },
  },
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
        const praisesData = data.text || [];
        
        // Sort praises by timestamp (newest first)
        const sortedPraises = praisesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPraises(sortedPraises);
        
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
      <StyledContainer maxWidth="xl">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#667eea' }}>
            Loading amazing praises... 🎆
          </Typography>
          <CircularProgress sx={{ color: '#667eea' }} />
        </Box>
        <LoadingSkeleton />
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer maxWidth="xl">
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          borderRadius: 4,
          border: '2px dashed #f48fb1'
        }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#e91e63' }}>
            Oops! Something went wrong 😢
          </Typography>
          <Typography color="error" variant="body1" sx={{ mb: 3 }}>
            Error loading praises: {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshRounded />}
            onClick={() => window.location.reload()}
            sx={{ 
              background: 'linear-gradient(45deg, #e91e63 30%, #ad1457 90%)',
              borderRadius: 25
            }}
          >
            Try Again
          </Button>
        </Box>
      </StyledContainer>
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
          placeholder="Search by message or name... 🔍"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ color: '#667eea' }} />
              </InputAdornment>
            ),
          }}
        />
        
        <FilterContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <FilterListRounded fontSize="small" sx={{ mr: 0.5, color: '#667eea' }} />
            <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
              Filter by person:
            </Typography>
          </Box>
          
          <Chip 
            label="🎆 All" 
            onClick={() => handlePeopleFilterChange('all')}
            color={peopleFilter === 'all' ? 'primary' : 'default'}
            sx={{ 
              fontWeight: peopleFilter === 'all' ? 'bold' : 'normal',
              background: peopleFilter === 'all' ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' : undefined,
              color: peopleFilter === 'all' ? 'white' : undefined
            }}
          />
          
          {uniquePeople.slice(0, 10).map((person) => (
            <Chip 
              key={person}
              label={`👤 ${person}`}
              onClick={() => handlePeopleFilterChange(person)}
              color={peopleFilter === person ? 'primary' : 'default'}
              sx={{ 
                fontWeight: peopleFilter === person ? 'bold' : 'normal',
                background: peopleFilter === person ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' : undefined,
                color: peopleFilter === person ? 'white' : undefined
              }}
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
            <EmptyState onRefresh={() => window.location.reload()} />
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