//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store, persistor } from './redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import ThemeProvider from './components/ThemeProvider.jsx'
import AuthMiddleware from './components/AuthMiddleware.jsx'
import { isTokenExpired, signOutExpired } from './services/tokenService'

// Add debugging helper for token expiration
const debugTokenExpiration = () => {
  const { currentUser } = store.getState().user;
  if (currentUser?.token) {
    try {
      const payload = JSON.parse(atob(currentUser.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = new Date(payload.exp * 1000);
      
      console.log('JWT Token information:');
      console.log('Current time:', new Date().toISOString());
      console.log('Token expires:', expiryTime.toISOString());
      console.log('Time until expiration:', Math.round((payload.exp - currentTime) / 60), 'minutes');
    } catch (error) {
      console.error('Error debugging token:', error);
    }
  }
};

const validateTokenOnLoad = () => {
  const { currentUser } = store.getState().user;
  if (currentUser?.token) {
    // Log token debug info
    debugTokenExpiration();
    
    if (isTokenExpired(currentUser.token)) {
      console.log('Token expired on application load, signing out');
      signOutExpired();
    }
  }
};

validateTokenOnLoad();

createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <AuthMiddleware>
          <App/>
        </AuthMiddleware>
      </ThemeProvider>
    </Provider>
  </PersistGate>,
)
