import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as ga from '../lib/ga';

/**
 * JourneyTracker component
 * 
 * Tracks user progress through defined conversion funnels.
 * This enables analysis of drop-off points and optimization opportunities.
 * 
 * Usage:
 * <JourneyTracker journey="volunteer" step="view_projects" metadata={{ projectId: "123" }} />
 */
const JourneyTracker = ({ 
  journey, 
  step, 
  metadata = {}
}) => {
  const router = useRouter();
  
  useEffect(() => {
    const trackStep = () => {
      // Add page context for better journey analysis
      const enhancedMetadata = {
        ...metadata,
        current_page: router.pathname,
        journey_timestamp: new Date().toISOString()
      };
      
      // Track the journey step
      ga.trackJourneyStep(journey, step, enhancedMetadata);
    };
    
    trackStep();
  }, [journey, step, metadata, router.pathname]);
  
  // This component doesn't render anything visible
  return null;
};

/**
 * Predefined journey types and steps for consistent tracking
 */
export const JourneyTypes = {
  VOLUNTEER: {
    name: 'volunteer',
    steps: {
      VIEW_OPPORTUNITIES: 'view_opportunities',
      SELECT_PROJECT: 'select_project',
      JOIN_SLACK: 'join_slack',
      CREATE_PROFILE: 'create_profile',
      JOIN_TEAM: 'join_team',
      CONTRIBUTE: 'contribute'
    }
  },
  
  NONPROFIT: {
    name: 'nonprofit',
    steps: {
      VIEW_APPLY: 'view_apply',
      START_APPLICATION: 'start_application',
      COMPLETE_FORM: 'complete_form',
      SUBMIT_APPLICATION: 'submit_application',
      APPLICATION_APPROVED: 'application_approved',
      PROJECT_PUBLISHED: 'project_published'
    }
  },
  
  HACKATHON: {
    name: 'hackathon',
    steps: {
      VIEW_INFO: 'view_info',
      START_REQUEST: 'start_request',
      COMPLETE_FORM: 'complete_form',
      SUBMIT_REQUEST: 'submit_request',
      REQUEST_APPROVED: 'request_approved'
    }
  },
  
  DONATION: {
    name: 'donation',
    steps: {
      VIEW_DONATE: 'view_donate',
      START_DONATION: 'start_donation',
      ADD_PAYMENT_INFO: 'add_payment_info',
      COMPLETE_DONATION: 'complete_donation'
    }
  }
};

export default JourneyTracker;