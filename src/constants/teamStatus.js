// Team status constants - centralized definition
export const TEAM_STATUS_OPTIONS = [
  { value: 'IN_REVIEW', label: 'In Review', color: 'default' },
  { value: 'NONPROFIT_SELECTED', label: 'Nonprofit Selected', color: 'primary' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'info' },
  { value: 'SWAG_RECEIVED', label: 'Swag Received', color: 'success' },
  { value: 'PROJECT_SUBMITTED', label: 'Project Submitted', color: 'success' },
  { value: 'COMPLETED_DEMO', label: 'Completed Demo', color: 'success' },
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
