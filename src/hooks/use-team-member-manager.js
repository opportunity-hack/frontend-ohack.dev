import { useState, useCallback } from 'react';

/**
 * Custom hook for managing team members
 * 
 * @returns {Object} Team member management functions and state
 */
export const useTeamMemberManager = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberInput, setMemberInput] = useState('');
  const [teamLeadConfirmed, setTeamLeadConfirmed] = useState(false);
  const [error, setError] = useState('');

  // Add a team member
  const handleAddTeamMember = useCallback(() => {
    if (memberInput.trim() === '') return;
    
    // Check for duplicates
    if (teamMembers.includes(memberInput.trim())) {
      setError('This team member has already been added');
      return;
    }
    
    setTeamMembers(prev => [...prev, memberInput.trim()]);
    setMemberInput('');
    setError('');
  }, [memberInput, teamMembers]);

  // Remove a team member
  const handleRemoveTeamMember = useCallback((index) => {
    setTeamMembers(prev => {
      const newMembers = [...prev];
      newMembers.splice(index, 1);
      return newMembers;
    });
  }, []);

  // Toggle team lead confirmation
  const toggleTeamLeadConfirmation = useCallback((event) => {
    setTeamLeadConfirmed(event.target.checked);
  }, []);

  return {
    teamMembers,
    memberInput,
    teamLeadConfirmed,
    error,
    setMemberInput,
    setTeamLeadConfirmed,
    handleAddTeamMember,
    handleRemoveTeamMember,
    toggleTeamLeadConfirmation,
    setError
  };
};

export default useTeamMemberManager;