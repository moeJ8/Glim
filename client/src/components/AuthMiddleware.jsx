import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { authenticateSocket, disconnectSocket } from '../services/socketService';
import { isTokenExpired, setupTokenValidation, signOutExpired } from '../services/tokenService';

export default function AuthMiddleware({ children }) {
  const { currentUser } = useSelector(state => state.user);
  const [initialized, setInitialized] = useState(false);

  // Perform immediate token validation on component mount or when user returns to the tab
  useEffect(() => {
    // Immediately validate token on mount
    if (currentUser?.token && isTokenExpired(currentUser.token)) {
      signOutExpired();
      return;
    }

    // Setup periodic token validation
    const cleanup = setupTokenValidation();
    
    // Also check when page becomes visible again (tab switching/browser reopening)
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

  // Handle socket connection based on auth state
  useEffect(() => {
    // Don't do anything if user state hasn't been initialized yet
    if (!currentUser && !initialized) {
      return;
    }
    // Check if current token is valid before initializing socket
    if (currentUser?.token) {
      try {
        if (isTokenExpired(currentUser.token)) {
          // Token is expired, sign out
          signOutExpired();
        } else {
          // Token is valid, connect socket
          authenticateSocket(currentUser.token);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error validating token in AuthMiddleware:', error);
      }
    } else if (initialized) {
      disconnectSocket();
    }
  }, [currentUser, initialized]);

  return children;
} 