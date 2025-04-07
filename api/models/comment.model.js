import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: {
        type: Array,
        default: [],
    },
    numberOfLikes: {
        type: Number,
        default: 0
    },
    
},{timestamps: true})

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;