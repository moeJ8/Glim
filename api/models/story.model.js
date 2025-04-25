import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
        required: true
    },
    country: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "general",
        required: true
    },
    contactPlatform: {
        type: String,
        enum: ["facebook", "whatsapp", "telegram", "discord", "email"],
        required: true
    },
    contactUsername: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Story = mongoose.model("Story", storySchema);

export default Story; 