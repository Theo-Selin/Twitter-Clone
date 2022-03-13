const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: "/images/profilePicture.png"
    },
    coverPhoto: {
        type: String
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    shares: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    aboutMe: {
        type: String,
        required: false,
    }
}, { timestamps: true })

const User = mongoose.model("User", UserSchema)
module.exports = User