import { useEffect, useState } from 'react';

/**
 * Component that shows a persistent notification when session has expired
 * Uses localStorage to detect if session expired
 */
export default function SessionExpiredNotification() {
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    // Check localStorage for session expired flag
    const sessionExpired = localStorage.getItem('sessionExpired') === 'true';
    
    if (sessionExpired) {
      setShowNotification(true);
      
      // Clear the flag after 10 seconds
      const timer = setTimeout(() => {
        localStorage.removeItem('sessionExpired');
        setShowNotification(false);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle manual close
  const handleDismiss = () => {
    localStorage.removeItem('sessionExpired');
    setShowNotification(false);
  };
  
  if (!showNotification) return null;
  
  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto px-4 z-50 w-full sm:max-w-md sm:px-0">
      <div className="bg-red-900 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-bold">🔒</span>
          <span className="text-sm sm:text-base font-medium">
            Your session has expired. Please sign in again.
          </span>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-white hover:text-gray-200 focus:outline-none ml-2 flex-shrink-0"
          aria-label="Close"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  );
} 