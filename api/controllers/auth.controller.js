import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import Token from '../models/token.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';


export const signup = async (req, res, next) => {
    const {username, email, password } = req.body;
    if (!username || !email || !password || username === "" || email === "" || password === "") {
        next(errorHandler(400, "Please provide all the required fields"))
    }

    const hashedPassword =  bcryptjs.hashSync(password, 10);

    const newUser = new User({
         username,
         email,
         password: hashedPassword,
        });

        try {
            const savedUser = await newUser.save();
            
            // Create verification token
            const token = await new Token({
                userId: savedUser._id,
                token: crypto.randomBytes(32).toString("hex")
            }).save();
            
            // Create verification URL
            const url = `${process.env.BASE_URL}/users/${savedUser._id}/verify/${token.token}`;
            
            // Send verification email
            await sendEmail(
                savedUser.email,
                "Verify Your Email",
                `Please click the link to verify your email: ${url}`
            );
            
            res.json({
                message: "User created successfully. Please check your email to verify your account."
            });
        } catch (err) {
            next(err);
        }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
        next(errorHandler(400, "All fields are required"))
    }
    try {
        // Try to find user by email or username
        const validUser = await User.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        });
        
        if (!validUser) {
            return next(errorHandler(404, "Invalid credentials"))
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
           return next(errorHandler(400, "Invalid credentials"))
        }
        const token = jwt.sign(
            {
                id: validUser._id, 
                isAdmin: validUser.isAdmin, 
                isPublisher: validUser.isPublisher
            }, 
            process.env.JWT_SECRET, 
            {expiresIn: "1d"}
        );

        const { password: pass, ...rest} = validUser._doc;
        
        // Check if email is verified and send verification if needed
        let verificationMessage = null;
        if (!validUser.verified) {
            let verificationToken = await Token.findOne({userId: validUser._id});
            if (!verificationToken) {
                verificationToken = await new Token({
                    userId: validUser._id,
                    token: crypto.randomBytes(32).toString("hex")
                }).save();
                
                // Create verification URL
                const url = `${process.env.BASE_URL}/users/${validUser._id}/verify/${verificationToken.token}`;
                
                // Send verification email
                await sendEmail(
                    validUser.email,
                    "Verify Your Email",
                    `Please click the link to verify your email: ${url}`
                );
            }
            verificationMessage = "Your email is not verified. A verification link has been sent to your email.";
        }
        
        // Allow login but include verification message if present
        return res.status(200)
            .cookie("access_token", token, {httpOnly: true})
            .json({
                ...rest, 
                token, 
                verificationStatus: validUser.verified,
                verificationMessage
            });
    } catch(err){
        next(err)
    }
};


export const google = async (req, res, next) => {
    const {email, name, googlePhotoUrl} = req.body;
    try{
        const user = await User.findOne({email});
        if (user) {
            const token = jwt.sign(
                {
                    id: user._id, 
                    isAdmin: user.isAdmin, 
                    isPublisher: user.isPublisher
                }, 
                process.env.JWT_SECRET, 
                {expiresIn: "1d"}
            );
            const { password: pass, ...rest} = user._doc;
            res.status(200).cookie("access_token", token, {httpOnly: true}).json({...rest, token});
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split(" ").join("") + Math.random().toString(9).slice(-4),
                email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl,
            });
            await newUser.save();
            const token = jwt.sign(
                {
                    id: newUser._id, 
                    isAdmin: newUser.isAdmin, 
                    isPublisher: newUser.isPublisher
                }, 
                process.env.JWT_SECRET, 
                {expiresIn: "1d"}
            );
            const {password, ...rest} = newUser._doc;
            res.status(200).cookie("access_token", token, {httpOnly: true}).json({...rest, token});
            
        }
    } catch(err) {
        next(err);
    }
};

export const facebook = async (req, res, next) => {
    const {email, name, facebookPhotoUrl} = req.body;
    try{
        const user = await User.findOne({email});
        if (user) {
            const token = jwt.sign(
                {
                    id: user._id, 
                    isAdmin: user.isAdmin, 
                    isPublisher: user.isPublisher
                }, 
                process.env.JWT_SECRET, 
                {expiresIn: "1d"}
            );
            const { password: pass, ...rest} = user._doc;
            res.status(200).cookie("access_token", token, {httpOnly: true}).json({...rest, token});
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split(" ").join("") + Math.random().toString(9).slice(-4),
                email,
                password: hashedPassword,
                profilePicture: facebookPhotoUrl,
            });
            await newUser.save();
            const token = jwt.sign(
                {
                    id: newUser._id, 
                    isAdmin: newUser.isAdmin, 
                    isPublisher: newUser.isPublisher
                }, 
                process.env.JWT_SECRET, 
                {expiresIn: "1d"}
            );
            const {password, ...rest} = newUser._doc;
            res.status(200).cookie("access_token", token, {httpOnly: true}).json({...rest, token});
            
        }
    } catch(err) {
        next(err);
    }
}

export const verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({_id: req.params.userId});
        if (!user) return next(errorHandler(400, "Invalid link"));

        // If the user is already verified, return a success message
        if (user.verified) {
            return res.status(200).json({message: "Email is verified", alreadyVerified: true});
        }

        const token = await Token.findOne({userId: user._id, token: req.params.token});
        if (!token) return next(errorHandler(400, "Invalid or expired link"));

        await User.updateOne({_id: user._id}, {verified: true});
        await token.deleteOne();

        res.status(200).json({message: "Email verified successfully"});

    } catch (err) {
        next(err);
    }
}