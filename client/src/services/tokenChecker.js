import axios from 'axios';
import { store } from '../redux/store';
import { signOutExpired } from './tokenService';
import { isTokenExpired } from './tokenService';

const setupTokenChecker = () => {
  const instance = axios.create({
    baseURL: '/',
    withCredentials: true
  });

  instance.interceptors.request.use(
    (config) => {
      const { currentUser } = store.getState().user;
      
      // Check if token exists and is expired
      if (currentUser?.token && isTokenExpired(currentUser.token)) {
        console.log('Token expired, signing out user');
        signOutExpired();
        return Promise.reject(new Error('Token expired'));
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  return instance;
};

// Create the token checker instance
const tokenChecker = setupTokenChecker();


 // Validates the current user's token. 
 // This is called when returning to the site after being away.
export const validateToken = async () => {
  try {
    const { currentUser } = store.getState().user;
    if (!currentUser?.token) return;
    // This will trigger the interceptor which checks token expiration
    await tokenChecker.head('/api/user/validate-token');
  } catch (error) {
    console.log('Token validation failed:', error.message);
  }
};


//Set up page visibility detection to validate token when returning to the site
export const setupVisibilityTracking = () => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('Page became visible, validating token');
      validateToken();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

export default tokenChecker; 