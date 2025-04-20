import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { authenticateSocket, disconnectSocket } from '../services/socketService';

export default function AuthMiddleware({ children }) {
  const { currentUser } = useSelector(state => state.user);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize socket connection if user is logged in
    if (currentUser?.token) {
      authenticateSocket(currentUser.token);
      setInitialized(true);
    } else if (initialized) {
      // Disconnect socket if user logs out and was previously connected
      disconnectSocket();
    }
  }, [currentUser, initialized]);

  return children;
} 