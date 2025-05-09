import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authenticateSocket, disconnectSocket } from '../services/socketService';
import { isTokenExpired, setupTokenValidation, signOutExpired } from '../services/tokenService';
import { updateSuccess } from '../redux/user/userSlice';

export default function AuthMiddleware({ children }) {
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  // Auto refresh user data and token on page load if the user is logged in
  useEffect(() => {
    if (!currentUser) return;
    
    const refreshUserData = async () => {
      try {
        const res = await fetch('/api/user/refresh-token/data', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const userData = await res.json();
          // Update Redux store with fresh data including the new token
          dispatch(updateSuccess(userData));
          console.log('User data and token refreshed on page load');
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };
    refreshUserData();
  }, [dispatch]); 

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