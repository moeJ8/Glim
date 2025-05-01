import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import Token from '../models/token.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';


export const signup = async (req, res, next) => {
    const {username, email, password, dateOfBirth } = req.body;
    if (!username || !email || !password || !dateOfBirth || username === "" || email === "" || password === "") {
        return next(errorHandler(400, "Please provide all the required fields"));
    }
    
    // Validate age - ensure user is at least 13 years old
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 13) {
        return next(errorHandler(400, "You must be at least 13 years old to register"));
    }

    const hashedPassword =  bcryptjs.hashSync(password, 10);

    const newUser = new User({
         username,
         email,
         password: hashedPassword,
         dateOfBirth: birthDate,
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

        if (validUser.isBanned) {
            const now = new Date();

            if (validUser.banExpiresAt && validUser.banExpiresAt < now) {
                validUser.isBanned = false;
                validUser.banExpiresAt = null;
                validUser.banReason = null;
                await validUser.save();
            } else {
                // Ban is still active
                let banMessage = "Your account has been temporarily suspended.";  
                if (validUser.banReason) {
                    banMessage += ` Reason: ${validUser.banReason}`;
                }
                
                if (validUser.banExpiresAt) {
                    const expireDate = new Date(validUser.banExpiresAt).toLocaleString();
                    banMessage += ` Your ban will expire on ${expireDate}.`;
                }
                
                return next(errorHandler(403, banMessage));
            }
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
        
        let verificationMessage = null;
        if (!validUser.verified) {
            let verificationToken = await Token.findOne({userId: validUser._id});
            if (!verificationToken) {
                verificationToken = await new Token({
                    userId: validUser._id,
                    token: crypto.randomBytes(32).toString("hex")
                }).save();
                
                const url = `${process.env.BASE_URL}/users/${validUser._id}/verify/${verificationToken.token}`;
                
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
            .cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
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
            
            // Set mobile-friendly cookie
            res.status(200)
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                })
                .json({...rest, token});
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcryptjs.hashSync(generatedPassword, 10);
            
            // Set a default dateOfBirth (13 years ago from today)
            const defaultDateOfBirth = new Date();
            defaultDateOfBirth.setFullYear(defaultDateOfBirth.getFullYear() - 13);
            
            const newUser = new User({
                username: name.toLowerCase().split(" ").join("") + Math.random().toString(9).slice(-4),
                email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl,
                dateOfBirth: defaultDateOfBirth,
                verified: true,
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
            
            // Set mobile-friendly cookie
            res.status(200)
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                })
                .json({...rest, token});
        }
    } catch(err) {
        next(err);
    }
};

export const facebook = async (req, res, next) => {
    const {email, name, facebookPhotoUrl} = req.body;
    try{
        if (!email) {
            return next(errorHandler(400, "Email is required from Facebook authentication"));
        }
        
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
            
            // Set mobile-friendly cookie
            return res.status(200)
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                })
                .json({...rest, token});
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcryptjs.hashSync(generatedPassword, 10);
            
            // Set a default dateOfBirth (13 years ago from today)
            const defaultDateOfBirth = new Date();
            defaultDateOfBirth.setFullYear(defaultDateOfBirth.getFullYear() - 13);
            
            const newUser = new User({
                username: name.toLowerCase().split(" ").join("") + Math.random().toString(9).slice(-4),
                email,
                password: hashedPassword,
                profilePicture: facebookPhotoUrl,
                dateOfBirth: defaultDateOfBirth,
                verified: true, // Auto-verify Facebook users since their email is verified by Facebook
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
            
            // Set mobile-friendly cookie
            return res.status(200)
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                })
                .json({...rest, token});
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

export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(errorHandler(400, "Email is required"));
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return next(errorHandler(404, "User with this email does not exist"));
        }

        // Delete any existing token for this user
        let token = await Token.findOne({ userId: user._id });
        if (token) {
            await token.deleteOne();
        }

        // Create a new token
        const resetToken = crypto.randomBytes(32).toString("hex");
        token = await new Token({
            userId: user._id,
            token: resetToken
        }).save();

        // Create password reset URL
        const resetUrl = `${process.env.BASE_URL}/reset-password/${user._id}/${token.token}`;
        
        // Send password reset email
        await sendEmail(
            user.email,
            "Password Reset",
            `Please click the link to reset your password: ${resetUrl}. This link will expire in 1 hour.`
        );

        res.status(200).json({ message: "Password reset link has been sent to your email" });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { userId, token } = req.params;
        const { newPassword } = req.body;

        if (!userId || !token || !newPassword) {
            return next(errorHandler(400, "All fields are required"));
        }

        // Validate password
        if (newPassword.length < 6) {
            return next(errorHandler(400, "Password must be at least 6 characters long"));
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(400, "Invalid link"));
        }

        // Find token
        const resetToken = await Token.findOne({ userId: user._id, token });
        if (!resetToken) {
            return next(errorHandler(400, "Invalid or expired password reset link"));
        }

        // Hash the new password
        const hashedPassword = bcryptjs.hashSync(newPassword, 10);
        
        // Update user password
        await User.updateOne({ _id: userId }, { password: hashedPassword });
        
        // Delete the used token
        await resetToken.deleteOne();

        // Send confirmation email
        await sendEmail(
            user.email,
            "Password Reset Successful",
            "Your password has been successfully reset."
        );

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        next(err);
    }
};