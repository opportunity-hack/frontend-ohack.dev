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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ExpandMore as ExpandMoreIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import ApplicationReviewCard from './ApplicationReviewCard';
import { normalizeEmail } from '../../hooks/use-judge-training-status';

const getLinkedInUrl = (app) => {
  const raw = app.linkedin || app.linkedinProfile || app.linkedinUrl || '';
  return raw ? (raw.startsWith('http') ? raw : `https://${raw}`) : null;
};

const ApplicationReviewList = ({
  applications = [],
  applicationType,
  onApprove,
  onReject,
  onEdit,
  onBatchApprove,
  onBatchReject,
  isLoading = false,
  eventId,
  // Judge training/video review (judge tab only; see useJudgeTrainingStatus)
  trainingStatusByEmail,
  trainingLmsAccess,
  onPlayVideo,
  // Filter state props
  filter,
  statusFilter,
  inPersonFilter,
  checkedInFilter,
  sortBy,
  sortOrder,
  showBatchActions,
  // Filter change callbacks
  onFilterChange,
  onStatusFilterChange,
  onInPersonFilterChange,
  onCheckedInFilterChange,
  onSortByChange,
  onSortOrderChange,
  onShowBatchActionsChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedApplications, setSelectedApplications] = useState(new Set());
  const [linkedInFilter, setLinkedInFilter] = useState('all'); // 'all' | 'has' | 'missing'

  // Use controlled props if provided, otherwise fall back to local state
  const [localFilter, setLocalFilter] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState('all');
  const [localInPersonFilter, setLocalInPersonFilter] = useState('all');
  const [localCheckedInFilter, setLocalCheckedInFilter] = useState('all');
  const [localSortBy, setLocalSortBy] = useState('timestamp');
  const [localSortOrder, setLocalSortOrder] = useState('desc');
  const [localShowBatchActions, setLocalShowBatchActions] = useState(false);

  // Use controlled values if provided, otherwise use local state
  const currentFilter = filter !== undefined ? filter : localFilter;
  const currentStatusFilter = statusFilter !== undefined ? statusFilter : localStatusFilter;
  const currentInPersonFilter = inPersonFilter !== undefined ? inPersonFilter : localInPersonFilter;
  const currentCheckedInFilter = checkedInFilter !== undefined ? checkedInFilter : localCheckedInFilter;
  const currentSortBy = sortBy !== undefined ? sortBy : localSortBy;
  const currentSortOrder = sortOrder !== undefined ? sortOrder : localSortOrder;
  const currentShowBatchActions = showBatchActions !== undefined ? showBatchActions : localShowBatchActions;
  
  // Handlers that call parent callbacks or use local state
  const handleFilterChange = (value) => {
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      setLocalFilter(value);
    }
  };
  
  const handleStatusFilterChange = (value) => {
    if (onStatusFilterChange) {
      onStatusFilterChange(value);
    } else {
      setLocalStatusFilter(value);
    }
  };
  
  const handleInPersonFilterChange = (value) => {
    if (onInPersonFilterChange) {
      onInPersonFilterChange(value);
    } else {
      setLocalInPersonFilter(value);
    }
  };

  const handleCheckedInFilterChange = (value) => {
    if (onCheckedInFilterChange) {
      onCheckedInFilterChange(value);
    } else {
      setLocalCheckedInFilter(value);
    }
  };

  const handleSortByChange = (value) => {
    if (onSortByChange) {
      onSortByChange(value);
    } else {
      setLocalSortBy(value);
    }
  };
  
  const handleSortOrderChange = (value) => {
    if (onSortOrderChange) {
      onSortOrderChange(value);
    } else {
      setLocalSortOrder(value);
    }
  };
  
  const handleShowBatchActionsChange = (value) => {
    if (onShowBatchActionsChange) {
      onShowBatchActionsChange(value);
    } else {
      setLocalShowBatchActions(value);
    }
  };

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
    if (currentFilter) {
      const searchLower = currentFilter.toLowerCase();
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
    if (currentStatusFilter !== 'all') {
      if (currentStatusFilter === 'approved') {
        filtered = filtered.filter(app => app.isSelected);
      } else if (currentStatusFilter === 'pending') {
        filtered = filtered.filter(app => !app.isSelected);
      } else if (applicationType === 'judge') {
        // For judges, also support filtering by specific status values
        filtered = filtered.filter(app => app.status === currentStatusFilter);
      }
    }

    // Apply in-person filter (for judges)
    if (currentInPersonFilter !== 'all' && applicationType === 'judge') {
      if (currentInPersonFilter === 'yes') {
        filtered = filtered.filter(app => app.inPerson === 'Yes' || app.inPerson === true);
      } else if (currentInPersonFilter === 'no') {
        filtered = filtered.filter(app => app.inPerson === 'No' || app.inPerson === false || !app.inPerson);
      }
    }

    // Apply checked-in filter (for all volunteer types)
    if (currentCheckedInFilter !== 'all') {
      if (currentCheckedInFilter === 'yes') {
        filtered = filtered.filter(app => app.checkedIn === true);
      } else if (currentCheckedInFilter === 'no') {
        filtered = filtered.filter(app => app.checkedIn === false || app.checkedIn === null || app.checkedIn === undefined);
      }
    }

    // Apply LinkedIn filter
    if (linkedInFilter !== 'all') {
      if (linkedInFilter === 'has') {
        filtered = filtered.filter(app => !!getLinkedInUrl(app));
      } else if (linkedInFilter === 'missing') {
        filtered = filtered.filter(app => !getLinkedInUrl(app));
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[currentSortBy];
      let bValue = b[currentSortBy];

      // Handle different data types
      if (currentSortBy === 'timestamp') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) return currentSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return currentSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, currentFilter, currentStatusFilter, currentInPersonFilter, currentCheckedInFilter, linkedInFilter, currentSortBy, currentSortOrder, applicationType]);

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
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
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

      {/* Filters and Controls — collapsed accordion on mobile, plain Paper on desktop */}
      {(() => {
        const filterGridItems = (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Search applications"
                variant="outlined"
                value={currentFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                placeholder="Name, email, organization..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentStatusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  {applicationType === 'judge' && [
                    <MenuItem key="denied" value="denied">Denied</MenuItem>,
                    <MenuItem key="verified_travel" value="verified_travel">Verified Travel</MenuItem>,
                    <MenuItem key="confirmed" value="confirmed">Confirmed</MenuItem>,
                    <MenuItem key="withdrew" value="withdrew">Withdrew</MenuItem>,
                    <MenuItem key="no_show" value="no_show">No Show</MenuItem>
                  ]}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Checked In</InputLabel>
                <Select
                  value={currentCheckedInFilter}
                  onChange={(e) => handleCheckedInFilterChange(e.target.value)}
                  label="Checked In"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="yes">Checked In</MenuItem>
                  <MenuItem value="no">Not Checked In</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {applicationType === 'judge' && (
              <Grid size={{ xs: 12, sm: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>In Person</InputLabel>
                  <Select
                    value={currentInPersonFilter}
                    onChange={(e) => handleInPersonFilterChange(e.target.value)}
                    label="In Person"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="yes">In Person</MenuItem>
                    <MenuItem value="no">Remote</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>LinkedIn</InputLabel>
                <Select
                  value={linkedInFilter}
                  onChange={(e) => setLinkedInFilter(e.target.value)}
                  label="LinkedIn"
                  startAdornment={<LinkedInIcon sx={{ mr: 0.5, color: '#0077b5', fontSize: '1rem' }} />}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="has">Has LinkedIn</MenuItem>
                  <MenuItem value="missing">No LinkedIn</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={currentSortBy}
                  onChange={(e) => handleSortByChange(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="timestamp">Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="experienceLevel">Experience</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <ButtonGroup size="small" fullWidth>
                <Button
                  variant={currentSortOrder === 'asc' ? 'contained' : 'outlined'}
                  onClick={() => handleSortOrderChange('asc')}
                >
                  A-Z
                </Button>
                <Button
                  variant={currentSortOrder === 'desc' ? 'contained' : 'outlined'}
                  onClick={() => handleSortOrderChange('desc')}
                >
                  Z-A
                </Button>
              </ButtonGroup>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentShowBatchActions}
                    onChange={(e) => handleShowBatchActionsChange(e.target.checked)}
                  />
                }
                label="Batch Actions"
              />
            </Grid>
          </>
        );

        const batchActionsBlock = currentShowBatchActions && (
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
        );

        if (isMobile) {
          const hasActiveFilters = !!(currentFilter || currentStatusFilter !== 'all' || currentCheckedInFilter !== 'all' || linkedInFilter !== 'all');
          return (
            <Accordion sx={{ mb: 3 }} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize="small" />
                  <Typography variant="body2">Filters &amp; Sort</Typography>
                  {hasActiveFilters && <Chip label="Active" size="small" color="primary" />}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} alignItems="center">
                  {filterGridItems}
                </Grid>
                {batchActionsBlock}
              </AccordionDetails>
            </Accordion>
          );
        }
        return (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              {filterGridItems}
            </Grid>
            {batchActionsBlock}
          </Paper>
        );
      })()}

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body1">
          Showing {processedApplications.length} of {applications.length} applications
        </Typography>
        
        {currentFilter && (
          <Chip
            label={`Search: "${currentFilter}"`}
            onDelete={() => handleFilterChange('')}
            size="small"
            variant="outlined"
          />
        )}
        
        {currentStatusFilter !== 'all' && (
          <Chip
            label={`Status: ${currentStatusFilter}`}
            onDelete={() => handleStatusFilterChange('all')}
            size="small"
            variant="outlined"
          />
        )}

        {currentCheckedInFilter !== 'all' && (
          <Chip
            label={`Checked In: ${currentCheckedInFilter === 'yes' ? 'Yes' : 'No'}`}
            onDelete={() => handleCheckedInFilterChange('all')}
            size="small"
            variant="outlined"
          />
        )}

        {currentInPersonFilter !== 'all' && applicationType === 'judge' && (
          <Chip
            label={`In Person: ${currentInPersonFilter === 'yes' ? 'Yes' : 'No'}`}
            onDelete={() => handleInPersonFilterChange('all')}
            size="small"
            variant="outlined"
          />
        )}

        {linkedInFilter !== 'all' && (
          <Chip
            icon={<LinkedInIcon sx={{ fontSize: '0.9rem !important', color: '#0077b5 !important' }} />}
            label={linkedInFilter === 'has' ? 'Has LinkedIn' : 'No LinkedIn'}
            onDelete={() => setLinkedInFilter('all')}
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
          {currentFilter || currentStatusFilter !== 'all' || currentInPersonFilter !== 'all' || currentCheckedInFilter !== 'all' || linkedInFilter !== 'all' ? (
            <Button
              variant="outlined"
              onClick={() => {
                handleFilterChange('');
                handleStatusFilterChange('all');
                handleInPersonFilterChange('all');
                handleCheckedInFilterChange('all');
                setLinkedInFilter('all');
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
              {currentShowBatchActions && (
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
                onEdit={onEdit}
                isLoading={isLoading}
                trainingStatus={
                  trainingStatusByEmail?.[normalizeEmail(application.email)]
                }
                lmsAccess={trainingLmsAccess}
                onPlayVideo={onPlayVideo}
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