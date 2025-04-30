import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { signoutSuccess } from '../redux/user/userSlice';

let socket = null;
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
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        // Connection success log removed
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        
        // Check if error is authentication-related
        if (err.message && err.message.includes('Authentication error')) {
            // Set flag in localStorage
            localStorage.setItem('sessionExpired', 'true');
            
            store.dispatch(signoutSuccess());
            document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/sign-in';
        }
    });
    
    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            socket.connect();
        }
    });
    
    // Listen for token expired event
    socket.on('token_expired', () => {
        // Set flag in localStorage
        localStorage.setItem('sessionExpired', 'true');
        
        store.dispatch(signoutSuccess());
        disconnectSocket();
        document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/sign-in';
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