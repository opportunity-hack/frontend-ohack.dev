import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Divider,
  InputAdornment,
  CircularProgress,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Check as CheckIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  GitHub as GitHubIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack'; // Add this import

/**
 * A dialog component for searching and selecting users to add to a team
 */
const UserSearchDialog = ({ 
  open, 
  onClose, 
  onUserSelect, 
  teamId, 
  hackathonId, 
  orgId,
  onAddSuccess 
}) => {
  const theme = useTheme();
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar(); // Add this line to use the snackbar
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all users once when dialog opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/admin/profiles`,
          {
            method: "GET",
            headers: {
              authorization: `Bearer ${accessToken}`,
              "content-type": "application/json",
              "X-Org-Id": orgId, // Add the orgId header that was missing
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched users:', data);
        if (data && data.profiles) {
          setAllUsers(data.profiles);
          setFilteredUsers(data.profiles);
          setTotalUsers(data.profiles.length);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, accessToken, orgId]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers);
      setTotalUsers(allUsers.length);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = allUsers.filter((user) => {
      return (
        (user.name && user.name.toLowerCase().includes(normalizedSearchTerm)) ||
        (user.email_address && user.email_address.toLowerCase().includes(normalizedSearchTerm)) ||
        (user.github && user.github.toLowerCase().includes(normalizedSearchTerm)) ||
        (user.role && user.role.toLowerCase().includes(normalizedSearchTerm))
      );
    });

    setFilteredUsers(filtered);
    setTotalUsers(filtered.length);
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, allUsers]);

  // Handle select/deselect user
  const handleToggleUser = (user) => {
    setSelectedUser(user);
  };

  // Handle select button click for a user
  const handleSelectUser = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        // Make the API call directly from the dialog to add the user to the team
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${teamId}/member`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Org-Id': orgId,
            },
            body: JSON.stringify({
              id: selectedUser.id,
            }),
          }
        );

        const data = await response.json();
        
        if (response.ok && data.success) {
          // Display success toast with the message from the API (if available)
          enqueueSnackbar(data.message || `${selectedUser.name || 'User'} added to team successfully`, {
            variant: 'success',
            autoHideDuration: 5000,
          });
          
          // Call the success callback before closing the dialog
          if (onAddSuccess) {
            onAddSuccess(selectedUser);
          }
          
          // Return the selected user to the parent component after callback completed
          onUserSelect(selectedUser);
          
          // Close the dialog
          onClose();
        } else {
          // If the API returns an error message, display it
          throw new Error(data.message || 'Failed to add team member');
        }
      } catch (error) {
        console.error('Error adding team member:', error);
        // Display error toast with the error message
        enqueueSnackbar(error.message || 'Failed to add team member', {
          variant: 'error',
          autoHideDuration: 6000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate profile completeness percentage to help admins select users with more complete profiles
  const calculateProfileCompleteness = (profile) => {
    const fields = [
      "role",
      "expertise",
      "education",
      "shirt_size",
      "github",
      "company",
      "why",
    ];
    
    const filledFields = fields.filter(
      (field) => {
        if (field === "expertise") {
          return profile[field] && Array.isArray(profile[field]) && profile[field].length > 0;
        }
        return profile[field] && profile[field] !== "";
      }
    );
    
    return (filledFields.length / fields.length) * 100;
  };

  // Render expertise chips
  const renderExpertiseChips = (expertise) => {
    if (!expertise || !Array.isArray(expertise) || expertise.length === 0) {
      return <Typography variant="body2" color="text.secondary">No expertise listed</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {expertise.map((skill, index) => (
          <Chip 
            key={`${skill}-${index}`}
            size="small"
            label={skill}
            icon={<CodeIcon fontSize="small" />}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="user-search-dialog-title"
      // Prevent closing on backdrop click while loading
      disableEscapeKeyDown={loading}
      disableBackdropClick={loading}
    >
      <DialogTitle id="user-search-dialog-title">
        Add Team Member
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or email"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : searchTerm ? (
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  ) : null}
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Paper variant="outlined" sx={{ mt: 2 }}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Expertise</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2">No users found matching your search criteria</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => {
                      const completeness = calculateProfileCompleteness(user);
                      const isSelected = selectedUser && selectedUser.id === user.id;
                      
                      return (
                        <TableRow 
                          key={user.id} 
                          hover 
                          onClick={() => handleToggleUser(user)}
                          selected={isSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  mr: 2,
                                  border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                                  bgcolor: isSelected ? theme.palette.primary.light : undefined,
                                  position: 'relative'
                                }}
                              >
                                {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                                {isSelected && (
                                  <CheckIcon 
                                    sx={{
                                      position: 'absolute',
                                      width: '100%',
                                      height: '100%',
                                      color: theme.palette.primary.contrastText,
                                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  />
                                )}
                              </Avatar>
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: isSelected ? 'bold' : 'regular',
                                    color: isSelected ? theme.palette.primary.main : undefined
                                  }}
                                >
                                  {user.name || 'Unnamed User'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  {user.github && (
                                    <Tooltip title="GitHub Username">
                                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                        <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        <Typography variant="caption">{user.github}</Typography>
                                      </Box>
                                    </Tooltip>
                                  )}
                                  <Tooltip title={`Profile ${Math.round(completeness)}% complete`}>
                                    <Chip 
                                      size="small" 
                                      label={`${Math.round(completeness)}%`}
                                      color={
                                        completeness > 75 ? 'success' : 
                                        completeness > 50 ? 'primary' : 
                                        completeness > 25 ? 'warning' : 
                                        'error'
                                      }
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email_address}</TableCell>
                          <TableCell>{renderExpertiseChips(user.expertise)}</TableCell>
                          <TableCell>{user.last_login || 'Never'}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              color={isSelected ? "primary" : "default"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleUser(user);
                              }}
                              size="small"
                            >
                              {isSelected ? <CheckIcon /> : <AddIcon />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        
        {selectedUser && (
          <Paper sx={{ mt: 2, p: 2, bgcolor: theme.palette.background.default }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected User: {selectedUser.name || selectedUser.email_address}
            </Typography>
            <Grid container spacing={2}>
              {selectedUser.role && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Role:</Typography>
                  <Typography variant="body1">{selectedUser.role}</Typography>
                </Grid>
              )}
              {selectedUser.company && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Company:</Typography>
                  <Typography variant="body1">{selectedUser.company}</Typography>
                </Grid>
              )}
              {selectedUser.education && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Education:</Typography>
                  <Typography variant="body1">{selectedUser.education}</Typography>
                </Grid>
              )}
              {selectedUser.expertise && selectedUser.expertise.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Expertise:</Typography>
                  {renderExpertiseChips(selectedUser.expertise)}
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
        
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSelectUser}
          color="primary" 
          variant="contained"
          disabled={!selectedUser || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonIcon />}
        >
          {loading ? 'Adding...' : 'Add to Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSearchDialog;