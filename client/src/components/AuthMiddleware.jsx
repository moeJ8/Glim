import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { authenticateSocket, disconnectSocket } from '../services/socketService';
import { isTokenExpired, setupTokenValidation, signOutExpired } from '../services/tokenService';

export default function AuthMiddleware({ children }) {
  const { currentUser } = useSelector(state => state.user);

  // Single useEffect for all token validation scenarios
  useEffect(() => {
    if (!currentUser?.token) {
      disconnectSocket();
      return;
    }

    // Initial token validation
    if (isTokenExpired(currentUser.token)) {
      signOutExpired();
      return;
    }

    // Authenticate socket if token is valid
    authenticateSocket(currentUser.token);
    
    // Setup periodic token validation
    const cleanup = setupTokenValidation();
    
    // Check token when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const { currentUser } = window.store.getState().user;
        if (currentUser?.token && isTokenExpired(currentUser.token)) {
          signOutExpired();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser?.token]);

  return children;
} 