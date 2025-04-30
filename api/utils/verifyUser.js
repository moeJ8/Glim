import jwt from "jsonwebtoken";
import {errorHandler} from "./error.js";

export const verifyToken = (req, res, next) => {
    // First check cookies
    const cookieToken = req.cookies.access_token;
    
    // Then check authorization header
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : null;
    
    // Use token from either source
    const token = cookieToken || headerToken;
    
    if(!token) return next(errorHandler(401, "You are not authorized"));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            if(err.name === 'TokenExpiredError') {
                return next(errorHandler(401, "Session expired. Please sign in again."));
            }
            return next(errorHandler(403, "Unauthorized"));
        }
        req.user = user;
        next();
    });
};