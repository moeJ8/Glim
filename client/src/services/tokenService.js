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
    // Check if expiration time is past current time
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Signs out the user when token is expired
 */
export const signOutExpired = () => {
  localStorage.setItem('sessionExpired', 'true');
  
  // Sign out user from Redux
  store.dispatch(signoutSuccess());
  
  disconnectSocket();
  
  // Clear cookie
  document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  window.location.href = '/sign-in';
};

/**
 * Sets up periodic token validation
 */
export const setupTokenValidation = () => {
  // Check token validity every minute
  const intervalId = setInterval(() => {
    const { currentUser } = store.getState().user;
    
    if (currentUser?.token && isTokenExpired(currentUser.token)) {
      signOutExpired();
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(intervalId);
}; 