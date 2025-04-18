import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

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
            await newUser.save();
            res.json({message: "User created successfully"});
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

        res.status(200).cookie("access_token", token, {httpOnly: true}).json({...rest, token});
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