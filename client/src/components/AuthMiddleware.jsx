import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { authenticateSocket, disconnectSocket } from '../services/socketService';
import { isTokenExpired, setupTokenValidation, signOutExpired } from '../services/tokenService';

export default function AuthMiddleware({ children }) {
  const { currentUser } = useSelector(state => state.user);
  const [initialized, setInitialized] = useState(false);

  // Setup token validation and auto sign-out
  useEffect(() => {
    // Setup periodic token validation
    const cleanup = setupTokenValidation();
    return cleanup;
  }, []);

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