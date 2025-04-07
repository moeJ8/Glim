import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import PublisherRequest from '../models/publisherRequest.model.js';
import jwt from "jsonwebtoken";

export const test = (req, res) => {
  res.json({ message: "API is working" });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not authorized to update this user"));
  }

  try {
    const existingUser = await User.findById(req.params.userId);
    if (!existingUser) {
      return next(errorHandler(404, "User not found"));
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return next(errorHandler(400, "Password must be at least 6 characters long"));
      }

      // Check if new password matches the current one
      const isSamePassword = await bcryptjs.compare(req.body.password, existingUser.password);
      if (isSamePassword) {
        return next(errorHandler(400, "The new password cannot be the same as the current one"));
      }

      req.body.password = await bcryptjs.hash(req.body.password, 10);
    }

    if (req.body.username) {
      if (req.body.username.length < 3 || req.body.username.length > 20) {
        return next(errorHandler(400, "Username must be between 3 and 20 characters long"));
      }
      if (req.body.username.includes(" ")) {
        return next(errorHandler(400, "Username cannot contain spaces"));
      }
      if (req.body.username !== req.body.username.toLowerCase()) {
        return next(errorHandler(400, "Username must be lowercase"));
      }
      if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
        return next(errorHandler(400, "Username can only contain letters and numbers"));
      }

      const existingUsername = await User.findOne({ username: req.body.username });
      if (existingUsername && existingUsername._id.toString() !== req.params.userId) {
        return next(errorHandler(400, "Username is already taken"));
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (err) {
    next(err);
  } 
  
  
};

export const deleteUser = async (req, res, next) => {
  if(!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not authorized to delete this user"));
  }
  try{
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User has been signed out");
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  if(!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to view all users"));
  }
  try{
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
    .sort({ createdAt: sortDirection })
    .skip(startIndex)
    .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
  );

  const lastMonthUsers = await User.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  res.status(200).json({
    users: usersWithoutPassword,
    totalUsers,
    lastMonthUsers,
  })

  } catch(err) {
    next(err);
  }
}

export const getUser = async (req, res, next) => {
  try{
    const user = await User.findById(req.params.userId);
    if(!user) return next(errorHandler(404, "User not found"));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch(err) {
    next(err);
  }
}

export const updateUserRole = async (req, res, next) => {
  const { userId, isPublisher } = req.body;
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const user = await User.findById(userId);
    if(!user) return next(errorHandler(404, "User not found"));

    user.isPublisher = isPublisher;
    await user.save();
    
    // Generate a new token with updated role
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        isPublisher: user.isPublisher
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // Set the new token in a cookie
    res.cookie("access_token", token, { httpOnly: true });
    
    res.status(200).json({ 
      message: "User updated successfully.",
      user: {
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        isPublisher: user.isPublisher
      }
    });
  }catch(err) {
    next(err);
  }
}

export const requestPublisher = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const existingRequest = await PublisherRequest.findOne({ userId, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request." });
    }
    await PublisherRequest.create({ userId });
    res.status(200).json({ message: "Request sent successfully." });
  }catch(err) {
    next(err);
  }
}

export const getPublisherRequests = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to view publisher requests"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const status = req.query.status || 'pending';

    const requests = await PublisherRequest.find({ status })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate('userId', 'username email profilePicture');

    const totalRequests = await PublisherRequest.countDocuments({ status });

    res.status(200).json({
      requests,
      totalRequests,
    });
  } catch (err) {
    next(err);
  }
}

export const updatePublisherRequest = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to update publisher requests"));
  }
  const { requestId, status } = req.body;
  try {
    const request = await PublisherRequest.findById(requestId);
    if (!request) {
      return next(errorHandler(404, "Request not found"));
    }

    request.status = status;
    await request.save();

    // If request is approved, update user to be a publisher
    if (status === 'approved') {
      const updatedUser = await User.findByIdAndUpdate(
        request.userId, 
        { isPublisher: true },
        { new: true }
      );
      
      // Generate a new token that includes the updated isPublisher status
      if (updatedUser) {
        const token = jwt.sign(
          {
            id: updatedUser._id,
            isAdmin: updatedUser.isAdmin,
            isPublisher: true  // explicitly set to true since we just approved
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        
        // Set the new token in a cookie
        res.cookie("access_token", token, { httpOnly: true });
      }
    }

    res.status(200).json({ message: "Request updated successfully" });
  } catch (err) {
    next(err);
  }
}