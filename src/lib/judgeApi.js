import axios from 'axios';

/**
 * Judge API Service Layer
 * Handles all API calls for judge-facing functionality
 */
class JudgeApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_SERVER_URL;
  }

  /**
   * Get judge's hackathon assignments
   * @param {string} judgeId - Judge user ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} List of hackathons judge is assigned to
   */
  async getJudgeAssignments(judgeId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/assignments/${judgeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching judge assignments:', error);
      // Stub data for development - empty so it doesn't suggest a specific event
      return {
        hackathons: []
      };
    }
  }

  /**
   * Get teams assigned to judge for specific hackathon
   * @param {string} judgeId - Judge user ID
   * @param {string} eventId - Hackathon event ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} List of teams to judge
   */
  async getJudgeTeams(judgeId, eventId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/teams/${judgeId}/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching judge teams:', error);
      // Stub data for development
      return {
        round1_teams: [
          // {
          //   id: 'team_1',
          //   name: 'EcoTracker Solutions',
          //   problem_statement: {
          //     title: 'Environmental Impact Tracking for Nonprofits',
          //     nonprofit: 'GreenEarth Foundation'
          //   },
          //   members: [
          //     { name: 'Sarah Chen', role: 'Frontend Developer' },
          //     { name: 'Mike Rodriguez', role: 'Backend Developer' },
          //     { name: 'Emily Watson', role: 'UI/UX Designer' }
          //   ],
          //   github_url: 'https://github.com/team-ecotracker/nonprofit-tracker',
          //   devpost_url: 'https://devpost.com/software/ecotracker-solutions',
          //   video_url: 'https://youtube.com/watch?v=example1',
          //   demo_time: null,
          //   judged: false,
          //   score: null
          // },
          // {
          //   id: 'team_2', 
          //   name: 'HealthBridge Connect',
          //   problem_statement: {
          //     title: 'Patient Communication Platform',
          //     nonprofit: 'Community Health Network'
          //   },
          //   members: [
          //     { name: 'David Park', role: 'Full Stack Developer' },
          //     { name: 'Lisa Thompson', role: 'Data Scientist' }
          //   ],
          //   github_url: 'https://github.com/healthbridge/connect-platform',
          //   devpost_url: 'https://devpost.com/software/healthbridge-connect', 
          //   video_url: 'https://youtube.com/watch?v=example2',
          //   demo_time: null,
          //   judged: true,
          //   score: {
          //     scopeImpact: 4,
          //     scopeComplexity: 3,
          //     documentationCode: 4,
          //     documentationEase: 4,
          //     polishWorkRemaining: 3,
          //     polishCanUseToday: 2,
          //     securityData: 3,
          //     securityRole: 3,
          //     total: 26,
          //     submitted_at: '2025-01-24T14:30:00Z'
          //   }
          // }
        ],
        round2_teams: [
          // {
          //   id: 'team_1',
          //   name: 'EcoTracker Solutions',
          //   problem_statement: {
          //     title: 'Environmental Impact Tracking for Nonprofits',
          //     nonprofit: 'GreenEarth Foundation'
          //   },
          //   members: [
          //     { name: 'Sarah Chen', role: 'Frontend Developer' },
          //     { name: 'Mike Rodriguez', role: 'Backend Developer' },
          //     { name: 'Emily Watson', role: 'UI/UX Designer' }
          //   ],
          //   github_url: 'https://github.com/team-ecotracker/nonprofit-tracker',
          //   devpost_url: 'https://devpost.com/software/ecotracker-solutions',
          //   demo_time: '2025-06-17T10:00:00Z',
          //   room: 'Main Hall',
          //   judged: false,
          //   score: null
          // }
        ]
      };
    }
  }

  /**
   * Get detailed team information for judging
   * @param {string} teamId - Team ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Detailed team information
   */
  async getTeamDetails(teamId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/team/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching team details:', error);
      // Stub data for development
      return {
        // team: {
        //   id: teamId,
        //   name: 'EcoTracker Solutions',
        //   description: 'A comprehensive environmental impact tracking solution for nonprofits to monitor and report their sustainability initiatives.',
        //   problem_statement: {
        //     title: 'Environmental Impact Tracking for Nonprofits',
        //     description: 'Many nonprofits struggle to track and quantify their environmental impact across various initiatives. They need a user-friendly platform to log activities, measure carbon footprint, and generate reports for stakeholders.',
        //     nonprofit: 'GreenEarth Foundation',
        //     nonprofit_contact: 'contact@greenearth.org'
        //   },
        //   members: [
        //     { 
        //       name: 'Sarah Chen', 
        //       role: 'Frontend Developer', 
        //       email: 'sarah.chen@example.com',
        //       github: 'https://github.com/sarahchen'
        //     },
        //     { 
        //       name: 'Mike Rodriguez', 
        //       role: 'Backend Developer', 
        //       email: 'mike.rodriguez@example.com',
        //       github: 'https://github.com/mikerodriguez'
        //     },
        //     { 
        //       name: 'Emily Watson', 
        //       role: 'UI/UX Designer', 
        //       email: 'emily.watson@example.com',
        //       portfolio: 'https://emilywatson.design'
        //     }
        //   ],
        //   github_url: 'https://github.com/team-ecotracker/nonprofit-tracker',
        //   devpost_url: 'https://devpost.com/software/ecotracker-solutions',
        //   video_url: 'https://youtube.com/watch?v=example1',
        //   demo_url: 'https://ecotracker-demo.herokuapp.com',
        //   technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        //   features: [
        //     'Activity logging with carbon footprint calculation',
        //     'Interactive dashboard with data visualizations', 
        //     'Automated report generation',
        //     'Multi-user role management',
        //     'API integration with external carbon databases'
        //   ]
        // }
      };
    }
  }

  /**
   * Submit or update team score
   * @param {string} judgeId - Judge user ID
   * @param {string} teamId - Team ID
   * @param {string} eventId - Event ID
   * @param {Object} scores - Score object
   * @param {string} round - 'round1' or 'round2'
   * @param {string} accessToken - Auth token
   * @param {Object} feedback - Feedback object (optional)
   * @returns {Promise} Submission result
   */
  async submitScore(judgeId, teamId, eventId, scores, round, accessToken, feedback = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/judge/score`,
        {
          judge_id: judgeId,
          team_id: teamId,
          event_id: eventId,
          round: round,
          scores: scores,
          feedback: feedback,
          submitted_at: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting score:', error);
      // Stub success response for development
      return {
        success: true,
        message: 'Score submitted successfully',
        score_id: `score_${Date.now()}`
      };
    }
  }

  /**
   * Get judge's existing scores for a hackathon
   * @param {string} judgeId - Judge user ID  
   * @param {string} eventId - Event ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Judge's scores
   */
  async getJudgeScores(judgeId, eventId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/scores/${judgeId}/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching judge scores:', error);
      // Stub data for development
      return {
        scores: [
          // {
          //   team_id: 'team_2',
          //   round: 'round1',
          //   scores: {
          //     scopeImpact: 4,
          //     scopeComplexity: 3,
          //     documentationCode: 4,
          //     documentationEase: 4,
          //     polishWorkRemaining: 3,
          //     polishCanUseToday: 2,
          //     securityData: 3,
          //     securityRole: 3,
          //     total: 26
          //   },
          //   submitted_at: '2025-01-24T14:30:00Z'
          // }
        ]
      };
    }
  }

  /**
   * Save draft score (auto-save functionality)
   * @param {string} judgeId - Judge user ID
   * @param {string} teamId - Team ID
   * @param {string} eventId - Event ID
   * @param {Object} scores - Score object
   * @param {string} round - 'round1' or 'round2'
   * @param {string} accessToken - Auth token
   * @param {Object} feedback - Feedback object (optional)
   * @returns {Promise} Save result
   */
  async saveDraft(judgeId, teamId, eventId, scores, round, accessToken, feedback = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/judge/draft`,
        {
          judge_id: judgeId,
          team_id: teamId,
          event_id: eventId,
          round: round,
          scores: scores,
          feedback: feedback,
          updated_at: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving draft:', error);
      // Stub success for development
      return { success: true };
    }
  }

  /**
   * Get draft score for a specific team/judge/event/round combination
   * @param {string} judgeId - Judge user ID
   * @param {string} teamId - Team ID
   * @param {string} eventId - Event ID
   * @param {string} round - 'round1' or 'round2'
   * @param {string} accessToken - Auth token
   * @returns {Promise} Draft data or null if no draft exists
   */
  async getDraft(judgeId, teamId, eventId, round, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/draft/${judgeId}/${teamId}/${eventId}/${round}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching draft:', error);
      // Return null if no draft exists (common case)
      return null;
    }
  }

  /**
   * Admin: Create judge panel
   * @param {string} eventId - Event ID
   * @param {string} panelName - Panel name
   * @param {string} room - Room assignment (optional)
   * @param {string} accessToken - Auth token
   * @returns {Promise} Panel creation result
   */
  async createPanel(eventId, panelName, room, accessToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/judge/panels`,
        {
          event_id: eventId,
          panel_name: panelName,
          room: room || null
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating panel:', error);
      throw error;
    }
  }

  /**
   * Admin: Create judge assignment
   * @param {Object} assignment - Assignment details
   * @param {string} accessToken - Auth token
   * @returns {Promise} Assignment creation result
   */
  async createAssignment(assignment, accessToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/judge/assignments`,
        assignment,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Admin: Get panels for event
   * @param {string} eventId - Event ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Event panels
   */
  async getEventPanels(eventId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/panels/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching event panels:', error);
      // Return empty panels for development
      return { panels: [] };
    }
  }

  /**
   * Admin: Get all judges for an event
   * @param {string} eventId - Event ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} List of judges
   */
  async getEventJudges(eventId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/users/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching event judges:', error);
      // Return empty judges list for development
      return { judges: [] };
    }
  }

  /**
   * Admin: Get judge details
   * @param {string} judgeId - Judge user ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Judge details
   */
  async getJudgeDetails(judgeId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/user/${judgeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching judge details:', error);
      // Stub data for development
      return {
        // judge: {
        //   id: judgeId,
        //   name: 'John Doe',
        //   email: 'john.doe@example.com',
        //   role: 'Judge',
        //   events: [
        //     { event_id: '2025_summer', title: '2025 Summer Global Hackathon' }
        //   ],
        //   panels: [
        //     { panel_id: 'panel_1', name: 'Sustainability Innovations' }
        //   ]
        // }
      };
    }
  }

  /**
   * Admin: Update judge details
   * @param {string} judgeId - Judge user ID
   * @param {Object} details - Judge details to update
   * @param {string} accessToken - Auth token
   * @returns {Promise} Update result
   */
  async updateJudge(judgeId, details, accessToken) {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/judge/user/${judgeId}`,
        details,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating judge details:', error);
      throw error;
    }
  }

  /**
   * Admin: Delete judge
   * @param {string} judgeId - Judge user ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Delete result
   */
  async deleteJudge(judgeId, accessToken) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/api/judge/user/${judgeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting judge:', error);
      throw error;
    }
  }

  /**
   * Admin: Get all assignments for an event
   * @param {string} eventId - Event ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} List of assignments
   */
  async getEventAssignments(eventId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/assignments/event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching event assignments:', error);
      // Return empty assignments list for development
      return { assignments: [] };
    }
  }

  /**
   * Admin: Get assignment details
   * @param {string} assignmentId - Assignment ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Assignment details
   */
  async getAssignmentDetails(assignmentId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/judge/assignment/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      // Stub data for development
      return {
        // assignment: {
        //   id: assignmentId,
        //   event_id: '2025_summer',
        //   judge_id: 'judge_1',
        //   panel_id: 'panel_1',
        //   round: 'round1',
        //   teams: [
        //     { team_id: 'team_1', name: 'EcoTracker Solutions' },
        //     { team_id: 'team_2', name: 'HealthBridge Connect' }
        //   ],
        //   created_at: '2025-01-01T10:00:00Z',
        //   updated_at: '2025-01-10T10:00:00Z'
        // }
      };
    }
  }

  /**
   * Admin: Update assignment details
   * @param {string} assignmentId - Assignment ID
   * @param {Object} details - Assignment details to update
   * @param {string} accessToken - Auth token
   * @returns {Promise} Update result
   */
  async updateAssignment(assignmentId, details, accessToken) {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/judge/assignment/${assignmentId}`,
        details,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating assignment details:', error);
      throw error;
    }
  }

  /**
   * Admin: Delete assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} accessToken - Auth token
   * @returns {Promise} Delete result
   */
  async deleteAssignment(assignmentId, accessToken) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/api/judge/assignment/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }
}

export default new JudgeApiService();