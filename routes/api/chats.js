const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const User = require("../../schemas/UserSchema")
const Post = require("../../schemas/PostSchema")
const Chat = require("../../schemas/ChatSchema")

app.use(bodyParser.urlencoded({extended: false}))

// Routing //
router.post("/", async (req, res, next) => {

    if(!req.body.users) {
        console.log("Users param not sent with request")
        return res.sendStatus(400)
    }

    const users = JSON.parse(req.body.users)

    if(users.length == 0) {
        console.log("Users array is empty")
        return res.sendStatus(400)
    }

    users.push(req.session.user)

    const chatData = {
        users: users,
        isGroupChat: true
    }

    Chat.create(chatData)
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

// Find users where the element matches the user ID in array
router.get("/", async (req, res, next) => {
    Chat.find({ users: { $elemMatch: { $eq: req.session.user._id}}})
    .populate("users")
    .sort({ updatedAt: -1 })
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})


router.get("/:chatId", async (req, res, next) => {
    Chat.findOne({_id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id}}})
    .populate("users")
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

router.put("/:chatId", async (req, res, next) => {
    Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then(results => res.sendStatus(204))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

module.exports = router