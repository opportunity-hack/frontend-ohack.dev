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
  Stack,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Sort as SortIcon,
  ExpandMore as ExpandMoreIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ApplicationReviewCard from './ApplicationReviewCard';
import { normalizeEmail } from '../../hooks/use-judge-training-status';
import {
  APPLICATION_STATUSES,
  isKnownStatus,
  normalizeStatus,
  rosterConflict,
  rosterReady,
  statusLabel,
  statusSortIndex,
} from '../../lib/applicationStatus';
import { DECISION_PRESETS, filterByDecision, linkedinUrlOf } from './volunteer/applicationSchema';
import { StatusChip, StatusPicker } from './volunteer/StatusControls';
import { RosterChip } from './volunteer/RosterControls';

const ApplicationReviewList = ({
  applications = [],
  applicationType,
  // Review axis (status) + roster axis (isSelected) — separate callbacks,
  // separate transports in the workbench. Bulk roster goes through the
  // parent's confirm dialog.
  onStatusChange,
  onRosterChange,
  onEdit,
  onBatchStatus,
  onBatchRoster,
  pendingIds,
  isLoading = false,
  eventId,
  // Judge training/video review (judge tab only; see useJudgeTrainingStatus)
  trainingStatusByEmail,
  trainingLmsAccess,
  onPlayVideo,
  // Filter state props
  filter,
  statusFilter,
  selectedFilter,
  preset,
  inPersonFilter,
  checkedInFilter,
  sortBy,
  sortOrder,
  showBatchActions,
  // Filter change callbacks
  onFilterChange,
  onStatusFilterChange,
  onSelectedFilterChange,
  onPresetChange,
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
  const [localSelectedFilter, setLocalSelectedFilter] = useState('all');
  const [localPreset, setLocalPreset] = useState('none');
  const [localInPersonFilter, setLocalInPersonFilter] = useState('all');
  const [localCheckedInFilter, setLocalCheckedInFilter] = useState('all');
  const [localSortBy, setLocalSortBy] = useState('timestamp');
  const [localSortOrder, setLocalSortOrder] = useState('desc');
  const [localShowBatchActions, setLocalShowBatchActions] = useState(false);

  // Use controlled values if provided, otherwise use local state
  const currentFilter = filter !== undefined ? filter : localFilter;
  const currentStatusFilter = statusFilter !== undefined ? statusFilter : localStatusFilter;
  const currentSelectedFilter = selectedFilter !== undefined ? selectedFilter : localSelectedFilter;
  const currentPreset = preset !== undefined ? preset : localPreset;
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
  
  const handleSelectedFilterChange = (value) => {
    if (onSelectedFilterChange) {
      onSelectedFilterChange(value);
    } else {
      setLocalSelectedFilter(value);
    }
  };

  const handlePresetChange = (value) => {
    if (onPresetChange) {
      onPresetChange(value);
    } else {
      setLocalPreset(value);
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

  // Statistics — two axes. Review = status counts; Roster = isSelected + the
  // two mismatch presets that bridge them.
  const stats = useMemo(() => {
    const total = applications.length;
    const statusCounts = {};
    applications.forEach((app) => {
      const v = normalizeStatus(app?.status);
      statusCounts[v] = (statusCounts[v] || 0) + 1;
    });
    const statusEntries = Object.entries(statusCounts).sort(
      (a, b) => statusSortIndex(a[0]) - statusSortIndex(b[0]) || a[0].localeCompare(b[0])
    );
    const onRoster = applications.filter((app) => Boolean(app?.isSelected)).length;
    return {
      total,
      statusEntries,
      onRoster,
      offRoster: total - onRoster,
      ready: applications.filter(rosterReady).length,
      conflict: applications.filter(rosterConflict).length,
      legacyValues: statusEntries.map(([v]) => v).filter((v) => !isKnownStatus(v)),
    };
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

    // Decision filters: status (review axis), roster (isSelected), presets.
    filtered = filterByDecision(filtered, {
      statusFilter: currentStatusFilter,
      selectedFilter: currentSelectedFilter,
      preset: currentPreset,
    });

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
        filtered = filtered.filter(app => !!linkedinUrlOf(app));
      } else if (linkedInFilter === 'missing') {
        filtered = filtered.filter(app => !linkedinUrlOf(app));
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
      } else if (currentSortBy === 'status') {
        aValue = statusSortIndex(a.status);
        bValue = statusSortIndex(b.status);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) return currentSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return currentSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, currentFilter, currentStatusFilter, currentSelectedFilter, currentPreset, currentInPersonFilter, currentCheckedInFilter, linkedInFilter, currentSortBy, currentSortOrder, applicationType]);

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

  const selectedApps = useMemo(
    () => processedApplications.filter((app) => selectedApplications.has(app.id || app.timestamp)),
    [processedApplications, selectedApplications]
  );
  const readyApps = useMemo(() => applications.filter(rosterReady), [applications]);

  const handleBatchStatusChange = (status) => {
    if (!status || selectedApps.length === 0) return;
    onBatchStatus?.(selectedApps, status);
    setSelectedApplications(new Set());
  };

  // Roster changes are consequential: the parent confirms before writing, so
  // the selection is kept (the admin may cancel).
  const handleBatchRosterChange = (direction) => {
    if (selectedApps.length === 0) return;
    onBatchRoster?.(selectedApps, direction);
  };

  const isAllSelected = processedApplications.length > 0 && 
    processedApplications.every(app => selectedApplications.has(app.id || app.timestamp));
  const isIndeterminate = selectedApplications.size > 0 && !isAllSelected;

  return (
    <Box>
      {/* Statistics — Review row (status) and Roster row (isSelected) */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} Applications Overview
        </Typography>

        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
          Review
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          <Chip label={`Total ${stats.total}`} size="small" variant="outlined" />
          {stats.statusEntries.map(([value, count]) => (
            <StatusChip
              key={value}
              status={value}
              label={`${statusLabel(value)} ${count}`}
              onClick={() => handleStatusFilterChange(currentStatusFilter === value ? 'all' : value)}
              variant={currentStatusFilter === value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
          Roster
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <RosterChip
            on
            count={stats.onRoster}
            selected={currentSelectedFilter === 'yes'}
            onClick={() => handleSelectedFilterChange(currentSelectedFilter === 'yes' ? 'all' : 'yes')}
          />
          <RosterChip
            on={false}
            count={stats.offRoster}
            selected={currentSelectedFilter === 'no'}
            onClick={() => handleSelectedFilterChange(currentSelectedFilter === 'no' ? 'all' : 'no')}
          />
          <Chip
            icon={<PublicIcon />}
            label={`Ready for roster ${stats.ready}`}
            size="small"
            color="primary"
            variant={currentPreset === 'ready' ? 'filled' : 'outlined'}
            onClick={() => handlePresetChange(currentPreset === 'ready' ? 'none' : 'ready')}
          />
          <Chip
            icon={<WarningAmberIcon />}
            label={`Roster conflicts ${stats.conflict}`}
            size="small"
            color="warning"
            variant={currentPreset === 'conflict' ? 'filled' : 'outlined'}
            onClick={() => handlePresetChange(currentPreset === 'conflict' ? 'none' : 'conflict')}
          />
        </Stack>
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
                  {APPLICATION_STATUSES.map((meta) => (
                    <MenuItem key={meta.value} value={meta.value}>{meta.label}</MenuItem>
                  ))}
                  {stats.legacyValues.map((v) => (
                    <MenuItem key={v} value={v}>{`${v} (legacy)`}</MenuItem>
                  ))}
                  {currentStatusFilter !== 'all' &&
                    !isKnownStatus(currentStatusFilter) &&
                    !stats.legacyValues.includes(currentStatusFilter) && (
                      <MenuItem value={currentStatusFilter}>{`${currentStatusFilter} (legacy)`}</MenuItem>
                    )}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Roster</InputLabel>
                <Select
                  value={currentSelectedFilter}
                  onChange={(e) => handleSelectedFilterChange(e.target.value)}
                  label="Roster"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="yes">On roster</MenuItem>
                  <MenuItem value="no">Not on roster</MenuItem>
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
                  <MenuItem value="status">Status</MenuItem>
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
                  {/* Review axis */}
                  <StatusPicker
                    allowEmpty
                    value=""
                    label="Set status"
                    fullWidth={false}
                    disabled={isLoading}
                    sx={{ minWidth: 200 }}
                    onChange={handleBatchStatusChange}
                  />
                  <Divider orientation="vertical" flexItem />
                  {/* Roster axis — confirmed by the parent before writing */}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PublicIcon />}
                    onClick={() => handleBatchRosterChange(true)}
                    disabled={isLoading}
                    size="small"
                  >
                    Add to roster ({selectedApplications.size})
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<PublicOffIcon />}
                    onClick={() => handleBatchRosterChange(false)}
                    disabled={isLoading}
                    size="small"
                  >
                    Remove from roster ({selectedApplications.size})
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PublicIcon />}
                onClick={() => onBatchRoster?.(readyApps, true)}
                disabled={isLoading || readyApps.length === 0}
                size="small"
                sx={{ ml: 'auto' }}
              >
                Add all ready ({readyApps.length})
              </Button>
            </Box>
          </Box>
        );

        if (isMobile) {
          const hasActiveFilters = !!(currentFilter || currentStatusFilter !== 'all' || currentSelectedFilter !== 'all' || currentPreset !== 'none' || currentCheckedInFilter !== 'all' || linkedInFilter !== 'all');
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
            label={`Status: ${statusLabel(currentStatusFilter)}`}
            onDelete={() => handleStatusFilterChange('all')}
            size="small"
            variant="outlined"
          />
        )}

        {currentSelectedFilter !== 'all' && (
          <Chip
            label={`Roster: ${currentSelectedFilter === 'yes' ? 'On roster' : 'Not on roster'}`}
            onDelete={() => handleSelectedFilterChange('all')}
            size="small"
            variant="outlined"
          />
        )}

        {currentPreset !== 'none' && DECISION_PRESETS[currentPreset] && (
          <Chip
            label={DECISION_PRESETS[currentPreset].label}
            onDelete={() => handlePresetChange('none')}
            size="small"
            variant="outlined"
            color={currentPreset === 'ready' ? 'primary' : 'warning'}
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
          {currentFilter || currentStatusFilter !== 'all' || currentSelectedFilter !== 'all' || currentPreset !== 'none' || currentInPersonFilter !== 'all' || currentCheckedInFilter !== 'all' || linkedInFilter !== 'all' ? (
            <Button
              variant="outlined"
              onClick={() => {
                handleFilterChange('');
                handleStatusFilterChange('all');
                handleSelectedFilterChange('all');
                handlePresetChange('none');
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
                onStatusChange={onStatusChange}
                onRosterChange={onRosterChange}
                onEdit={onEdit}
                pending={Boolean(pendingIds?.has?.(application.id))}
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