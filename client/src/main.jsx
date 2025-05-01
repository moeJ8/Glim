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

const validateTokenOnLoad = () => {
  const { currentUser } = store.getState().user;
  if (currentUser?.token && isTokenExpired(currentUser.token)) {
    signOutExpired();
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
