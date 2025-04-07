import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { create, getposts, deletepost, updatepost, increaseView, getMostReadPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", verifyToken, create);
router.get("/getposts", getposts);
router.delete("/deletepost/:postId/:userId", verifyToken, deletepost);
router.put("/updatepost/:postId/:userId", verifyToken, updatepost);
router.put("/view/:postId", increaseView);
router.get("/most-read", getMostReadPosts);

export default router;