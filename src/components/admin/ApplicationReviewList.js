import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  Grid,
  Paper,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import ApplicationReviewCard from './ApplicationReviewCard';

const ApplicationReviewList = ({
  applications = [],
  applicationType,
  onApprove,
  onReject,
  onBatchApprove,
  onBatchReject,
  isLoading = false,
  eventId
}) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplications, setSelectedApplications] = useState(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(app => app.isSelected).length;
    const pending = total - approved;
    
    return { total, approved, pending };
  }, [applications]);

  // Filtered and sorted applications
  const processedApplications = useMemo(() => {
    let filtered = applications;

    // Apply text filter
    if (filter) {
      const searchLower = filter.toLowerCase();
      filtered = filtered.filter(app => 
        (app.name || '').toLowerCase().includes(searchLower) ||
        (app.email || '').toLowerCase().includes(searchLower) ||
        (app.schoolOrganization || '').toLowerCase().includes(searchLower) ||
        (app.company || '').toLowerCase().includes(searchLower) ||
        (app.skills || '').toLowerCase().includes(searchLower) ||
        (app.expertise || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        filtered = filtered.filter(app => app.isSelected);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(app => !app.isSelected);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, filter, statusFilter, sortBy, sortOrder]);

  // Handle individual application actions
  const handleApprove = useCallback(async (application) => {
    try {
      await onApprove(application);
      setSelectedApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(application.id || application.timestamp);
        return newSet;
      });
    } catch (error) {
      console.error('Error approving application:', error);
    }
  }, [onApprove]);

  const handleReject = useCallback(async (application) => {
    try {
      await onReject(application);
      setSelectedApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(application.id || application.timestamp);
        return newSet;
      });
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  }, [onReject]);

  // Handle batch actions
  const handleSelectApplication = (application, checked) => {
    const appId = application.id || application.timestamp;
    setSelectedApplications(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(appId);
      } else {
        newSet.delete(appId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = processedApplications.map(app => app.id || app.timestamp);
      setSelectedApplications(new Set(allIds));
    } else {
      setSelectedApplications(new Set());
    }
  };

  const handleBatchApprove = async () => {
    const selectedApps = processedApplications.filter(app => 
      selectedApplications.has(app.id || app.timestamp)
    );
    
    if (selectedApps.length === 0) return;
    
    try {
      if (onBatchApprove) {
        await onBatchApprove(selectedApps);
      } else {
        // Fallback to individual approvals
        await Promise.all(selectedApps.map(app => onApprove(app)));
      }
      setSelectedApplications(new Set());
    } catch (error) {
      console.error('Error batch approving applications:', error);
    }
  };

  const handleBatchReject = async () => {
    const selectedApps = processedApplications.filter(app => 
      selectedApplications.has(app.id || app.timestamp)
    );
    
    if (selectedApps.length === 0) return;
    
    try {
      if (onBatchReject) {
        await onBatchReject(selectedApps);
      } else {
        // Fallback to individual rejections
        await Promise.all(selectedApps.map(app => onReject(app)));
      }
      setSelectedApplications(new Set());
    } catch (error) {
      console.error('Error batch rejecting applications:', error);
    }
  };

  const isAllSelected = processedApplications.length > 0 && 
    processedApplications.every(app => selectedApplications.has(app.id || app.timestamp));
  const isIndeterminate = selectedApplications.size > 0 && !isAllSelected;

  return (
    <Box>
      {/* Statistics */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} Applications Overview
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search applications"
              variant="outlined"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Name, email, organization..."
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
              >
                <MenuItem value="timestamp">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="experienceLevel">Experience</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <ButtonGroup size="small" fullWidth>
              <Button
                variant={sortOrder === 'asc' ? 'contained' : 'outlined'}
                onClick={() => setSortOrder('asc')}
              >
                A-Z
              </Button>
              <Button
                variant={sortOrder === 'desc' ? 'contained' : 'outlined'}
                onClick={() => setSortOrder('desc')}
              >
                Z-A
              </Button>
            </ButtonGroup>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showBatchActions}
                  onChange={(e) => setShowBatchActions(e.target.checked)}
                />
              }
              label="Batch Actions"
            />
          </Grid>
        </Grid>

        {/* Batch Actions */}
        {showBatchActions && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                }
                label={`Select All (${selectedApplications.size} selected)`}
              />
              
              {selectedApplications.size > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={handleBatchApprove}
                    disabled={isLoading}
                    size="small"
                  >
                    Approve Selected ({selectedApplications.size})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={handleBatchReject}
                    disabled={isLoading}
                    size="small"
                  >
                    Reject Selected ({selectedApplications.size})
                  </Button>
                </>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body1">
          Showing {processedApplications.length} of {applications.length} applications
        </Typography>
        
        {filter && (
          <Chip
            label={`Search: "${filter}"`}
            onDelete={() => setFilter('')}
            size="small"
            variant="outlined"
          />
        )}
        
        {statusFilter !== 'all' && (
          <Chip
            label={`Status: ${statusFilter}`}
            onDelete={() => setStatusFilter('all')}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Applications List */}
      {processedApplications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {applications.length === 0 
              ? `No ${applicationType} applications found for this event`
              : 'No applications match your current filters'
            }
          </Typography>
          {filter || statusFilter !== 'all' ? (
            <Button
              variant="outlined"
              onClick={() => {
                setFilter('');
                setStatusFilter('all');
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          ) : null}
        </Paper>
      ) : (
        <Box>
          {processedApplications.map((application, index) => (
            <Box key={application.id || application.timestamp || index} sx={{ position: 'relative' }}>
              {showBatchActions && (
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                  <Checkbox
                    checked={selectedApplications.has(application.id || application.timestamp)}
                    onChange={(e) => handleSelectApplication(application, e.target.checked)}
                    sx={{ bgcolor: 'background.paper', borderRadius: '4px' }}
                  />
                </Box>
              )}
              
              <ApplicationReviewCard
                application={application}
                applicationType={applicationType}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={isLoading}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Load more or pagination could go here in the future */}
    </Box>
  );
};

export default ApplicationReviewList;