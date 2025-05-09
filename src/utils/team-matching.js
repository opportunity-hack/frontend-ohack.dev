/**
 * Team Matching Utilities
 * 
 * A collection of functions for team formation and matching
 */

/**
 * Calculate match score between two users
 * 
 * Uses a combination of:
 * - Shared interests (similarity - higher weight)
 * - Complementary skills (diversity - lower weight)
 * 
 * @param {Object} myProfile - Current user's profile with application data
 * @param {Object} otherUser - Potential teammate's profile with application data
 * @returns {Number} - Match score (0-100)
 */
export const calculateMatchScore = (myProfile, otherUser) => {
  if (!myProfile?.application || !otherUser.application) return 0;
  
  let score = 0;
  const myInterests = myProfile.application.interests || [];
  const mySkills = myProfile.application.skills || [];
  const otherInterests = otherUser.application.interests || [];
  const otherSkills = otherUser.application.skills || [];
  
  // Match interests (higher weight - similarity attraction principle)
  const commonInterests = myInterests.filter(i => otherInterests.includes(i));
  score += (commonInterests.length / Math.max(myInterests.length, 1)) * 60;
  
  // Match complementary skills (diversity principle)
  const myUniqueSkills = mySkills.filter(s => !otherSkills.includes(s));
  const otherUniqueSkills = otherSkills.filter(s => !mySkills.includes(s));
  
  // Skill complementarity (lower weight)
  score += (myUniqueSkills.length + otherUniqueSkills.length) / 
           Math.max(mySkills.length + otherSkills.length, 1) * 40;
  
  // Cap at 100
  return Math.min(Math.round(score), 100);
};

/**
 * Find optimal team groupings based on compatibility
 * 
 * @param {Array} users - Array of user objects with application data
 * @param {Number} teamSize - Target team size (default: 4)
 * @returns {Array} - Array of team groupings
 */
export const findOptimalTeams = (users, teamSize = 4) => {
  // Create a compatibility matrix
  const compatibilityMatrix = [];
  
  // For each pair of users, calculate compatibility score
  for (let i = 0; i < users.length; i++) {
    compatibilityMatrix[i] = [];
    for (let j = 0; j < users.length; j++) {
      if (i === j) {
        compatibilityMatrix[i][j] = 0; // Self-compatibility is 0
      } else {
        compatibilityMatrix[i][j] = calculateMatchScore(users[i], users[j]);
      }
    }
  }
  
  // Greedy algorithm to form teams
  const teams = [];
  const assigned = new Set();
  
  // Start with unassigned user with highest average compatibility
  while (assigned.size < users.length) {
    // Find user with highest average compatibility with unassigned users
    let bestUser = -1;
    let bestAvg = -1;
    
    for (let i = 0; i < users.length; i++) {
      if (assigned.has(i)) continue;
      
      let sum = 0;
      let count = 0;
      
      for (let j = 0; j < users.length; j++) {
        if (i !== j && !assigned.has(j)) {
          sum += compatibilityMatrix[i][j];
          count++;
        }
      }
      
      const avg = count > 0 ? sum / count : 0;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestUser = i;
      }
    }
    
    if (bestUser === -1) break; // No more valid users
    
    // Create new team with this user
    const team = [bestUser];
    assigned.add(bestUser);
    
    // Add most compatible teammates until team size is reached
    while (team.length < teamSize && assigned.size < users.length) {
      let bestTeammate = -1;
      let bestScore = -1;
      
      // For each unassigned user
      for (let i = 0; i < users.length; i++) {
        if (assigned.has(i)) continue;
        
        // Calculate total compatibility with current team
        let totalScore = 0;
        for (const member of team) {
          totalScore += compatibilityMatrix[member][i];
        }
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestTeammate = i;
        }
      }
      
      if (bestTeammate === -1) break; // No more valid teammates
      
      team.push(bestTeammate);
      assigned.add(bestTeammate);
    }
    
    // Convert indices to actual user objects
    teams.push(team.map(index => users[index]));
  }
  
  return teams;
};

/**
 * Filter potential teammates based on search criteria
 * 
 * @param {Array} teammates - Array of potential teammates
 * @param {String} searchValue - Search text
 * @param {Array} selectedInterests - Selected interest filters
 * @param {Array} selectedSkills - Selected skill filters
 * @param {String} currentUserId - Current user ID to exclude from results
 * @returns {Array} - Filtered teammates
 */
export const filterTeammates = (
  teammates,
  searchValue = '',
  selectedInterests = [],
  selectedSkills = [],
  currentUserId
) => {
  if (!teammates.length) return [];
  
  let result = [...teammates];
  
  // Text search
  if (searchValue) {
    const lowerSearch = searchValue.toLowerCase();
    result = result.filter(mate => 
      mate.name?.toLowerCase().includes(lowerSearch) ||
      mate.github?.toLowerCase().includes(lowerSearch) ||
      mate.application?.background?.toLowerCase().includes(lowerSearch) ||
      mate.application?.interests?.some(i => i.toLowerCase().includes(lowerSearch)) ||
      mate.application?.skills?.some(s => s.toLowerCase().includes(lowerSearch))
    );
  }
  
  // Interest filters
  if (selectedInterests.length > 0) {
    result = result.filter(mate => 
      selectedInterests.every(interest => 
        mate.application?.interests?.includes(interest)
      )
    );
  }
  
  // Skill filters
  if (selectedSkills.length > 0) {
    result = result.filter(mate => 
      selectedSkills.some(skill => 
        mate.application?.skills?.includes(skill)
      )
    );
  }
  
  // Only show users who are looking for a team or to be matched
  result = result.filter(mate => 
    mate.application?.team_formation === 'looking_for_members' || 
    mate.application?.team_formation === 'want_to_be_matched'
  );
  
  // Don't show self
  if (currentUserId) {
    result = result.filter(mate => mate.user_id !== currentUserId);
  }
  
  return result;
};

/**
 * Extract all unique interests and skills from a list of users
 * 
 * @param {Array} users - Array of user objects with application data
 * @returns {Object} - Object with arrays of unique interests and skills
 */
export const extractInterestsAndSkills = (users) => {
  const interests = new Set();
  const skills = new Set();
  
  users.forEach(user => {
    if (user.application) {
      user.application.interests?.forEach(interest => interests.add(interest));
      user.application.skills?.forEach(skill => skills.add(skill));
    }
  });
  
  return {
    interests: Array.from(interests),
    skills: Array.from(skills)
  };
};