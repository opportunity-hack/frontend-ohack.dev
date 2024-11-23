
import { Stack, Chip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import DoneIcon from '@mui/icons-material/Done';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function FilterBar({ filters, onChange }) {
  const statusOptions = [
    { value: 'concept', label: 'Concept', icon: <BuildIcon /> },
    { value: 'hackathon', label: 'Hackathon', icon: <RocketLaunchIcon /> },
    { value: 'post-hackathon', label: 'Post-Hackathon', icon: <BuildIcon /> },
    { value: 'production', label: 'Production', icon: <DoneIcon /> },
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

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
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
      <Chip
        icon={<GroupIcon />}
        label="Has Helpers"
        onClick={handleHelpersClick}
        color={filters.hasHelpers ? 'secondary' : 'default'}
        variant={filters.hasHelpers ? 'filled' : 'outlined'}
      />
    </Stack>
  );
}