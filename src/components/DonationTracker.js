import React, { useEffect } from 'react';
import * as ga from '../lib/ga';

/**
 * DonationTracker component
 * 
 * Implements enhanced e-commerce style tracking for donation flows.
 * This allows for proper funnel analysis and attribution of donation conversions.
 * 
 * Usage:
 * - At start of donation flow: <DonationTracker step="begin" />
 * - When payment info added: <DonationTracker step="add_payment_info" amount={25} />
 * - On donation completion: <DonationTracker step="complete" amount={25} transactionId="tx_123" />
 */
const DonationTracker = ({ 
  step, 
  amount = null, 
  currency = 'USD',
  transactionId = null,
  campaignId = null,
  donationType = 'one_time'
}) => {
  useEffect(() => {
    const trackDonationStep = () => {
      const additionalParams = {
        donation_type: donationType
      };
      
      if (campaignId) {
        additionalParams.campaign_id = campaignId;
      }
      
      if (transactionId) {
        additionalParams.transaction_id = transactionId;
      }
      
      // Track the donation step
      ga.trackDonation(
        step,
        amount,
        currency,
        additionalParams
      );
      
      // Also track as a journey step for funnel analysis
      ga.trackJourneyStep(
        'donation',
        step,
        {
          amount: amount,
          currency: currency,
          ...additionalParams
        }
      );
    };
    
    trackDonationStep();
  }, [step, amount, currency, transactionId, campaignId, donationType]);
  
  // This component doesn't render anything visible
  return null;
};

export default DonationTracker;