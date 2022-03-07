const mongoose = require("mongoose")

const Schema = mongoose.Schema

const PostSchema = new Schema({
    content: {
        type: String,
        trim: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    shareUsers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    shareData: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    pinned: Boolean

}, { timestamps: true })

const Post = mongoose.model("Post", PostSchema)
module.exports = Post