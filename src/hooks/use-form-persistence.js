import { useState, useEffect, useCallback, useRef } from 'react';

export function useFormPersistence({
  formType, // 'judge', 'mentor', or 'sponsor'
  eventId,
  userId,
  initialFormData,
  apiServerUrl,
  accessToken
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [previouslySubmitted, setPreviouslySubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '' });
  
  // Prevent UI jump on form input
  const formRef = useRef(null);
  const scrollPositionRef = useRef(null);
  
  // Storage key based on form type, event, and user
  const getStorageKey = useCallback(() => {
    return `ohack_${formType}_application_${eventId}_${userId || 'anonymous'}`;
  }, [formType, eventId, userId]);

  // Load form data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const key = getStorageKey();
      const savedData = localStorage.getItem(key);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Check if data is recent (less than 24 hours old)
        const timestamp = new Date(parsedData.savedAt);
        const now = new Date();
        const hoursSinceSaved = (now - timestamp) / (1000 * 60 * 60);
        
        if (hoursSinceSaved < 24) {
          // Save scroll position before updating state
          if (formRef.current) {
            scrollPositionRef.current = {
              top: window.pageYOffset,
              left: window.pageXOffset
            };
          }
          
          setFormData(prevData => ({
            ...prevData,
            ...parsedData.formData
          }));
          
          showNotification('Form data loaded from your previous session');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading saved form data:', error);
      return false;
    }
  }, [getStorageKey]);

  // Save to localStorage with debounce
  const saveTimerRef = useRef(null);
  const saveToLocalStorage = useCallback((data = formData, showNotify = false) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    saveTimerRef.current = setTimeout(() => {
      try {
        const key = getStorageKey();
        const dataToSave = {
          formData: data,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(dataToSave));
        
        if (showNotify) {
          showNotification('Form data saved successfully');
        }
      } catch (error) {
        console.error('Error saving form data:', error);
        if (showNotify) {
          showNotification('Failed to save form data');
        }
      }
    }, 500); // Debounce for 500ms to prevent too many writes
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [formData, getStorageKey]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
      showNotification('Saved form data cleared');
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  }, [getStorageKey]);

  // Load previously submitted application from backend
  const loadPreviousSubmission = useCallback(async () => {
    if (!userId || !eventId || !apiServerUrl) return null;
    
    setIsLoading(true);
    try {
      const endpoint = `${apiServerUrl}/api/${formType}/application/${eventId}?userId=${userId}`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.application) {
          setPreviouslySubmitted(true);
          return data.application;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching previous ${formType} application:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, eventId, apiServerUrl, accessToken, formType]);

  // Handle form changes without causing scroll jump
  const handleFormChange = useCallback((e) => {
    // Save scroll position
    if (formRef.current) {
      scrollPositionRef.current = {
        top: window.pageYOffset,
        left: window.pageXOffset
      };
    }
    
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Trigger save to localStorage
      saveToLocalStorage(newData, false);
      
      return newData;
    });
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      if (scrollPositionRef.current) {
        window.scrollTo(
          scrollPositionRef.current.left,
          scrollPositionRef.current.top
        );
      }
    });
  }, [saveToLocalStorage]);

  // Handle multi-select fields
  const handleMultiSelectChange = useCallback((event, fieldName) => {
    // Save scroll position
    if (formRef.current) {
      scrollPositionRef.current = {
        top: window.pageYOffset,
        left: window.pageXOffset
      };
    }
    
    const { value } = event.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: typeof value === 'string' ? value.split(',') : value
      };
      
      // Trigger save to localStorage
      saveToLocalStorage(newData, false);
      
      return newData;
    });
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      if (scrollPositionRef.current) {
        window.scrollTo(
          scrollPositionRef.current.left,
          scrollPositionRef.current.top
        );
      }
    });
  }, [saveToLocalStorage]);

  // Show notification helper
  const showNotification = (message) => {
    setNotification({
      open: true,
      message
    });
  };

  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  // Auto-save effect
  useEffect(() => {
    // Don't save if form is empty or still loading
    if (isLoading || !eventId || !formData) return;
    
    const cleanup = saveToLocalStorage();
    return cleanup;
  }, [formData, eventId, isLoading, saveToLocalStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    setFormData,
    formRef,
    handleFormChange,
    handleMultiSelectChange,
    loadFromLocalStorage,
    saveToLocalStorage: () => saveToLocalStorage(formData, true),
    clearSavedData,
    loadPreviousSubmission,
    previouslySubmitted,
    setPreviouslySubmitted,
    notification,
    closeNotification,
    isLoading,
    setIsLoading
  };
}