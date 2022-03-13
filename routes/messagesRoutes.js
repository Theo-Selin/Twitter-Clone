const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("../schemas/UserSchema")
const Chat = require("../schemas/ChatSchema")

// Render messages page //
router.get("/", (req, res, next) => {
    res.status(200).render("inboxPage", {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    })
})

router.get("/new", (req, res, next) => {
    res.status(200).render("newMessage", {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    })
})

router.get("/:chatId", async (req, res, next) => {

    const userId = req.session.user._id
    const chatId = req.params.chatId
    const isValidId = mongoose.isValidObjectId(chatId)

    const payload = {
        pageTitle: "Messages",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }

    if(!isValidId) {
        payload.errorMessage = "Chat does not exist or you do not have permission"
        return res.status(200).render("messagesPage", payload)
    }

    let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId }}})
    .populate("users")

    if(chat == null) {
        // Check if chat id is really matching user Id
        const userFound = await User.findById(chatId)

        if(userFound != null) {
            // get chat using userId
            chat = await getChatByUserId(userFound._id, userId)
        }
    }

    if(chat == null) {
        payload.errorMessage = "Chat does not exist or you do not have permission"
    } else {
        payload.chat = chat
    }

    res.status(200).render("messagesPage", payload)
})

function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({

        // filtering data to match set conditions
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }}
            ]
        }
    },
    // set values if the data doesn't match
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    },
    // if the data matches, create a new chat
    {
        new: true,
        upsert: true
    })
    .populate("users")
}

module.exports = router