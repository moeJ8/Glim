import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { signoutSuccess } from '../redux/user/userSlice';

let socket = null;
let reconnectAttempts = 0;
const API_URL = '/'; // Adjust if needed to match server setup

export const initSocket = () => {
    if (socket && socket.connected) {
        return socket;
    }
    
    if (socket) {
        socket.connect();
        return socket;
    }
    
    socket = io(API_URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,     // Increased from 5 to 10
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,   // Max delay of 5 seconds
        randomizationFactor: 0.5,     // Add randomization to prevent connection storms
        timeout: 20000,               // Increased timeout
        transports: ['websocket', 'polling'], // Allow fallback to polling if websocket fails
    });

    socket.on('connect', () => {
        reconnectAttempts = 0; // Reset counter on successful connection
    });

    socket.on('connect_error', (err) => {
        reconnectAttempts++;
        console.error(`Socket connection error (attempt ${reconnectAttempts}):`, err.message);
        
        // Only consider authentication errors for sign-out after multiple attempts
        if (reconnectAttempts >= 8 && ( // Increased from 5 to 8 attempts
            err.message && (
                err.message.includes('Authentication error: Session expired') || 
                err.message.includes('TokenExpiredError')
            )
        )) {
            // Only sign out for clear token expiration errors
            localStorage.setItem('sessionExpired', 'true');
            
            store.dispatch(signoutSuccess());
            document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/sign-in';
        }
    });
    
    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            // The server has forcefully disconnected the socket
            socket.connect();
        }
    });
    
    // Listen for token expired event
    socket.on('token_expired', () => {
        // Set flag in localStorage
        localStorage.setItem('sessionExpired', 'true');
        
        // Force immediate sign-out
        store.dispatch(signoutSuccess());
        disconnectSocket();
        document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        setTimeout(() => {
            window.location.href = '/sign-in';
        }, 100);
    });

    return socket;
};

export const authenticateSocket = (token) => {
    if (!token) {
        console.error('No token provided for socket authentication');
        return;
    }
    
    if (!socket) {
        socket = initSocket();
    }
    
    // Set auth token for all future connections
    socket.auth = { token };
    
    // If we're already connected, reconnect to apply the auth token
    if (socket.connected) {
        socket.disconnect().connect();
    } else {
        socket.connect();
    }
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    
    if (!socket.connected) {
        socket.connect();
    }
    
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}; 