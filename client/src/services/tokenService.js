import { store } from '../redux/store';
import { signoutSuccess } from '../redux/user/userSlice';
import { disconnectSocket } from './socketService';

/**
 * Decodes a JWT token to check expiration
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get payload from JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is actually expired according to its expiration time - no buffer
    const isActuallyExpired = payload.exp <= currentTime;
    
    return isActuallyExpired;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Signs out the user when token is expired
 */
export const signOutExpired = () => {
  // Set session expired flag in localStorage for notification
  localStorage.setItem('sessionExpired', 'true');
  
  // Sign out user from Redux
  store.dispatch(signoutSuccess());
  
  // Disconnect socket
  disconnectSocket();
  
  // Clear cookie
  document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  // Redirect to sign-in page
  if (window.location.pathname !== '/sign-in') {
    window.location.href = '/sign-in';
  }
};

/**
 * Sets up periodic token validation
 */
export const setupTokenValidation = () => {
  // Perform an immediate check
  const checkTokenValidity = () => {
    const { currentUser } = store.getState().user;
    
    if (currentUser?.token && isTokenExpired(currentUser.token)) {
      console.log('Token expired during periodic check, signing out');
      signOutExpired();
    }
  };
  
  // Run once on setup
  checkTokenValidity();
  
  // Check token validity less frequently (15 minutes)
  const intervalId = setInterval(checkTokenValidity, 900000);
  
  return () => clearInterval(intervalId);
}; 