
import { Stack, Chip, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import DoneIcon from '@mui/icons-material/Done';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

export default function FilterBar({ filters, onChange }) {
  const statusOptions = [
    { value: 'concept', label: 'Concept', icon: <BuildIcon /> },
    { value: 'hackathon', label: 'Hackathon', icon: <RocketLaunchIcon /> },
    { value: 'post-hackathon', label: 'Post-Hackathon', icon: <BuildIcon /> },
    { value: 'production', label: 'Production', icon: <DoneIcon /> },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rank', label: 'Highest Ranked' },
    { value: 'title', label: 'Alphabetical' },
    { value: 'needHelp', label: 'Needs Help First' },
  ];

  const handleStatusClick = (status) => {
    onChange({
      ...filters,
      status: filters.status === status ? null : status,
    });
  };

  const handleHelpersClick = () => {
    onChange({
      ...filters,
      hasHelpers: !filters.hasHelpers,
    });
  };

  const handleBeginnerFriendlyClick = () => {
    onChange({
      ...filters,
      beginnerFriendly: !filters.beginnerFriendly,
    });
  };

  const handleSocialImpactClick = () => {
    onChange({
      ...filters,
      highImpact: !filters.highImpact,
    });
  };

  const handleFeaturedClick = () => {
    onChange({
      ...filters,
      featured: !filters.featured,
    });
  };

  const handleSortChange = (event) => {
    onChange({
      ...filters,
      sortBy: event.target.value,
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <FilterListIcon color="primary" />
        <Typography variant="subtitle1" fontWeight="bold">Filters</Typography>
        
        <FormControl size="small" sx={{ minWidth: 200, ml: 'auto' }}>
          <InputLabel id="sort-select-label">Sort Projects</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={filters.sortBy || 'rank'}
            label="Sort Projects"
            onChange={handleSortChange}
            IconComponent={SortIcon}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Status</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {statusOptions.map((option) => (
            <Chip
              key={option.value}
              icon={option.icon}
              label={option.label}
              onClick={() => handleStatusClick(option.value)}
              color={filters.status === option.value ? 'primary' : 'default'}
              variant={filters.status === option.value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>
      
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          icon={<GroupIcon />}
          label="Has Helpers"
          onClick={handleHelpersClick}
          color={filters.hasHelpers ? 'secondary' : 'default'}
          variant={filters.hasHelpers ? 'filled' : 'outlined'}
        />
        <Chip
          icon={<SchoolIcon />}
          label="Beginner Friendly"
          onClick={handleBeginnerFriendlyClick}
          color={filters.beginnerFriendly ? 'secondary' : 'default'}
          variant={filters.beginnerFriendly ? 'filled' : 'outlined'}
        />
        <Chip
          icon={<VolunteerActivismIcon />}
          label="High Social Impact"
          onClick={handleSocialImpactClick}
          color={filters.highImpact ? 'success' : 'default'}
          variant={filters.highImpact ? 'filled' : 'outlined'}
        />
        <Chip
          icon={<StarIcon />}
          label="Featured"
          onClick={handleFeaturedClick}
          color={filters.featured ? 'warning' : 'default'}
          variant={filters.featured ? 'filled' : 'outlined'}
        />
      </Stack>
    </Box>
  );
}