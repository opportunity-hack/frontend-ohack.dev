import React from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

const FIELD_LABELS = {
  role: 'Role',
  github: 'GitHub',
  company: 'Company',
  why: 'Why you\'re here',
  education: 'Education',
  expertise: 'Expertise',
  linkedin_url: 'LinkedIn',
  instagram_url: 'Instagram',
  badges: 'Badges',
  hackathon_history: 'Hackathons',
  feedback: 'Feedback',
  what: 'What (completed work)',
  how: 'How (approach)',
};

export default function PrivacyToggle({
  field,
  isPrivate,
  onToggle,
  label = null,
  disabled = false,
  size = "medium"
}) {
  const fieldLabel = label || FIELD_LABELS[field] || field;
  const stateLabel = isPrivate ? 'Private' : 'Public';
  const tooltipText = isPrivate
    ? `Only you can see your ${fieldLabel.toLowerCase()} — click to make it visible to others`
    : `Anyone can see your ${fieldLabel.toLowerCase()} — click to hide it`;

  const handleClick = () => {
    if (!disabled && onToggle) {
      onToggle(field);
    }
  };

  const chipSize = size === 'small' ? 'small' : 'medium';

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Chip
        icon={isPrivate
          ? <LockOutlinedIcon sx={{ fontSize: '1rem' }} />
          : <LockOpenOutlinedIcon sx={{ fontSize: '1rem' }} />
        }
        label={`${fieldLabel}: ${stateLabel}`}
        onClick={disabled ? undefined : handleClick}
        size={chipSize}
        variant={isPrivate ? 'filled' : 'outlined'}
        color={isPrivate ? 'default' : 'success'}
        disabled={disabled}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderWidth: isPrivate ? 0 : 2,
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    </Tooltip>
  );
}
