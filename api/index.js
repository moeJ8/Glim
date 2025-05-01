import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import donationRoutes from './routes/donation.route.js';
import notificationRoutes from './routes/notification.route.js';
import reportRoutes from './routes/report.route.js';
import storyRoutes from './routes/story.route.js';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import path from 'path';
import cors from 'cors';

dotenv.config();

mongoose
.connect(process.env.MONGO)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB', error);
});

const __dirname = path.resolve();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? [process.env.CLIENT_URL, /\.vercel\.app$/] : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    }
});

// Socket.io middleware for authentication
io.use((socket, next) => {
    try {
        console.log('Socket attempting to connect:', socket.id);
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log('Socket connection rejected: No token provided');
            return next(new Error('Authentication error: Token not provided'));
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    console.log('Socket connection rejected: Token expired');
                    
                    // Emit token_expired event immediately
                    // This ensures the client gets notified of expiration
                    socket.emit('token_expired');
                    
                    // Also reject the connection with a clear error
                    return next(new Error('Authentication error: Session expired'));
                }
                
                console.log('Socket connection rejected: Invalid token');
                return next(new Error('Authentication error: Invalid token'));
            }
            
            console.log('Socket authenticated for user:', verified.id);
            socket.userId = verified.id;
            next();
        });
    } catch (error) {
        console.log('Socket authentication error:', error.message);
        next(new Error('Authentication error: ' + error.message));
    }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.userId);
    
    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);
    console.log('Current online users:', onlineUsers.size);
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
        console.log('User disconnected from socket:', socket.userId, 'Reason:', reason);
        onlineUsers.delete(socket.userId);
        console.log('Current online users after disconnect:', onlineUsers.size);
    });
});

// Make io accessible to other modules
app.set('io', io);
app.set('onlineUsers', onlineUsers);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.use('/api/user', userRoutes);
app.use('/api/auth' , authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/story', storyRoutes);

app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
});