// Team status constants - centralized definition
export const TEAM_STATUS_OPTIONS = [
  { value: 'IN_REVIEW', label: 'In Review', color: 'default' },
  { value: 'NONPROFIT_SELECTED', label: 'Nonprofit Selected', color: 'primary' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'info' },
  { value: 'SWAG_RECEIVED', label: 'Swag Received', color: 'success' },
  { value: 'PROJECT_SUBMITTED', label: 'Project Submitted', color: 'success' },
  { value: 'COMPLETED_DEMO', label: 'Completed Demo', color: 'success' },
  { value: 'COMPLETED_HACKATHON', label: 'Completed Hackathon', color: 'success' },
  { value: 'FOUNDING_ENGINEERS', label: 'Founding Engineers - 1st Place', color: 'warning' },
  { value: 'COMPLETION_SUPPORT', label: 'Completion Support - 2nd Place', color: 'info' },
  { value: 'CATEGORY_WINNER', label: 'Category Winner', color: 'secondary' },
  { value: 'DEPLOYED', label: 'Deployed', color: 'success' },
  { value: 'NONPROFIT_SIGNOFF', label: 'Nonprofit Signoff', color: 'success' },
  { value: 'INACTIVE', label: 'Inactive', color: 'error' }
];

// Statuses that prevent new members from joining
export const JOINING_DISABLED_STATUSES = [
  'ONBOARDED',
  'SWAG_RECEIVED',
  'PROJECT_SUBMITTED',
  'COMPLETED_DEMO',
  'COMPLETED_HACKATHON',
  'FOUNDING_ENGINEERS',
  'COMPLETION_SUPPORT',
  'CATEGORY_WINNER',
  'DEPLOYED',
  'NONPROFIT_SIGNOFF',
  'INACTIVE'
];

// Helper function to get status option by value
export const getStatusOption = (status) => {
  return TEAM_STATUS_OPTIONS.find((opt) => opt.value === status) || TEAM_STATUS_OPTIONS[0];
};

// Helper function to check if team status prevents joining
export const isJoiningDisabled = (status) => {
  return JOINING_DISABLED_STATUSES.includes(status);
};

// Winning statuses with rank ordering
export const WINNING_STATUSES = [
  { value: 'FOUNDING_ENGINEERS', label: '1st Place', rank: 1 },
  { value: 'COMPLETION_SUPPORT', label: '2nd Place', rank: 2 },
  { value: 'CATEGORY_WINNER', label: 'Category Winner', rank: 3 },
];

export const isWinningStatus = (status) => {
  return WINNING_STATUSES.some(ws => ws.value === status);
};

export const getWinningStatus = (status) => {
  return WINNING_STATUSES.find(ws => ws.value === status);
};
