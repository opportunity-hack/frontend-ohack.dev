import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import throttle from 'lodash/throttle';
import * as ga from '../lib/ga';

/**
 * ScrollTracker component
 * 
 * Tracks user scroll depth on content pages to measure engagement.
 * Reports scroll milestones (25%, 50%, 75%, 100%) to Google Analytics.
 * 
 * Usage:
 * <ScrollTracker pageType="nonprofit_detail" contentId="nonprofit-123" />
 */
const ScrollTracker = ({ pageType, contentId = null }) => {
  const router = useRouter();
  // Use a ref instead of state to prevent re-renders and loops
  const trackedScrollDepthsRef = useRef(new Set());
  
  useEffect(() => {
    // Reset tracked depths when page changes
    trackedScrollDepthsRef.current = new Set();
    
    const calculateScrollPercentage = () => {
      // Calculate how far the user has scrolled
      const scrollTop = window.scrollY;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight) * 100;
      return Math.min(100, Math.floor(scrollPercent));
    };
    
    const checkScrollDepth = throttle(() => {
      const scrollPercentage = calculateScrollPercentage();
      
      // Track standard scroll depth milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !trackedScrollDepthsRef.current.has(milestone)) {
          // Track this milestone
          ga.trackScrollDepth(
            pageType || router.pathname,
            milestone
          );
          
          // Update tracked depths using the ref directly
          trackedScrollDepthsRef.current.add(milestone);
        }
      });
    }, 500);
    
    // Attach scroll listener
    window.addEventListener('scroll', checkScrollDepth);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', checkScrollDepth);
    };
  }, [pageType, contentId, router.pathname]); // Removed trackedScrollDepths from dependencies
  
  // This component doesn't render anything
  return null;
};

export default ScrollTracker;