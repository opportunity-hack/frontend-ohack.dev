import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for managing nonprofit data, selection, and ranking
 * 
 * @param {string} eventId - The event ID to fetch nonprofits for
 * @returns {Object} - Nonprofit data and management functions
 */
export const useNonprofitManager = (eventId) => {
  const [nonprofits, setNonprofits] = useState([]);
  const [filteredNonprofits, setFilteredNonprofits] = useState([]);
  const [selectedNonprofits, setSelectedNonprofits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rankingMode, setRankingMode] = useState('select'); // 'select' or 'rank'

  // Fetch nonprofit details
  const fetchNonprofitDetails = useCallback(async (nonprofitIds) => {
    if (!nonprofitIds || nonprofitIds.length === 0) return;
    
    console.log("Fetching nonprofit details for IDs:", nonprofitIds);
    setLoading(true);
    
    try {
      const nonprofitPromises = nonprofitIds.map((nonprofitId) =>
        axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofitId.id}`
        )
      );

      const nonprofitResponses = await Promise.all(nonprofitPromises);
      console.log("Nonprofit details responses:", nonprofitResponses);
      const detailedNonprofits = nonprofitResponses.map(
        (response) => response.data.nonprofits
      );

      // Format problem statements for better display
      const formattedNonprofits = detailedNonprofits.map(nonprofit => {
        if (nonprofit.problem_statements && nonprofit.problem_statements.length > 0) {
          // Format each problem statement to ensure we have a good display title
          nonprofit.problem_statements = nonprofit.problem_statements.map((problem, idx) => {
            // Check for title or name first, if not try to extract from description
            const displayTitle = problem.title || problem.name || 
              (problem.description && problem.description.length > 30 ? 
                `${problem.description.substring(0, 30)}...` : 
                problem.description) || 
              `Need ${idx+1}`;
            
            return {
              ...problem,
              displayTitle
            };
          });
        }
        return nonprofit;
      });

      setNonprofits(formattedNonprofits);
      setFilteredNonprofits(formattedNonprofits);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching nonprofit details:", err);
      setError("Failed to fetch nonprofit information. Please try again later.");
      setLoading(false);
    }
  }, []);
  
  // Filter nonprofits based on search term
  const filterNonprofits = useCallback((term) => {
    if (!term.trim()) {
      setFilteredNonprofits(nonprofits);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = nonprofits.filter(nonprofit => 
      nonprofit.name.toLowerCase().includes(lowerTerm) || 
      (nonprofit.description && nonprofit.description.toLowerCase().includes(lowerTerm)) ||
      (nonprofit.problem_statements && nonprofit.problem_statements.some(p => 
        p.displayTitle.toLowerCase().includes(lowerTerm) || 
        (p.description && p.description.toLowerCase().includes(lowerTerm))
      ))
    );
    
    setFilteredNonprofits(filtered);
  }, [nonprofits]);
  
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterNonprofits(term);
  }, [filterNonprofits]);
  
  // Toggle nonprofit selection
  const toggleNonprofitSelection = useCallback((nonprofit) => {
    setSelectedNonprofits(prev => {
      // Check if already selected
      const isSelected = prev.some(np => np.id === nonprofit.id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(np => np.id !== nonprofit.id);
      } else {
        // Add to selection
        return [...prev, nonprofit];
      }
    });
  }, []);
  
  // Handle dragging and dropping nonprofits to rank them
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedNonprofits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedNonprofits(items);
  }, [selectedNonprofits]);
  
  // Move from selection mode to ranking mode
  const proceedToRanking = useCallback(() => {
    if (selectedNonprofits.length === 0) {
      setError("Please select at least one nonprofit before proceeding to ranking.");
      return;
    }
    
    setRankingMode('rank');
  }, [selectedNonprofits.length]);
  
  // Go back to selection mode
  const backToSelection = useCallback(() => {
    setRankingMode('select');
  }, []);

  // Clear search term
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilteredNonprofits(nonprofits);
  }, [nonprofits]);

  return {
    nonprofits,
    filteredNonprofits,
    selectedNonprofits,
    searchTerm,
    loading,
    error,
    rankingMode,
    fetchNonprofitDetails,
    filterNonprofits,
    handleSearchChange,
    toggleNonprofitSelection,
    handleDragEnd,
    proceedToRanking,
    backToSelection,
    clearSearch,
    setSelectedNonprofits,
    setError
  };
};

export default useNonprofitManager;