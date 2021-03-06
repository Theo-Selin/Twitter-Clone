const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const upload = multer({ dest: "uploads/" })
const User = require("../../schemas/UserSchema")
const Post = require("../../schemas/PostSchema")

app.use(bodyParser.urlencoded({extended: false}))

// Routing //
router.get("/", async (req, res, next) => {
    let searchObject = req.query

    if(req.query.search !== undefined) {
        searchObject = {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" }},
                { lastName: { $regex: req.query.search, $options: "i" }},
                { username: { $regex: req.query.search, $options: "i" }},
                { email: { $regex: req.query.search, $options: "i" }}
            ]
        }
    }

    User.find(searchObject)
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

router.put("/:userId/follow", async (req, res, next) => {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if(user == null) return res.sendStatus(404)

    const isFollowing = user.followers && user.followers.includes(req.session.user._id)
    const option = isFollowing ? "$pull" : "$addToSet"

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    res.status(200).send(req.session.user)
})

// Counter route //
router.get("/:userId/following", async (req, res, next) => {
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
        res.status(200).send(results)
    })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

// Counter route //
router.get("/:userId/followers", async (req, res, next) => {
    User.findById(req.params.userId)
    .populate("followers")
    .then(results => {
        res.status(200).send(results)
    })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file) {
        console.log("No file found")
        return res.sendStatus(400)
    }

    const filePath = `/uploads/images/${req.file.filename}.png`
    const tempPath = req.file.path
    const targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async error => {
        if(error != null) {
            console.log("error")
            return res.sendStatus(400)
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePicture: filePath }, { new: true })
        res.sendStatus(204)
    })

})

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file) {
        console.log("No file found")
        return res.sendStatus(400)
    }

    const filePath = `/uploads/images/${req.file.filename}.png`
    const tempPath = req.file.path
    const targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async error => {
        if(error != null) {
            console.log("error")
            return res.sendStatus(400)
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })
        res.sendStatus(204)
    })

})

router.put("/:profileUserId", async (req, res, next) => {
    User.findByIdAndUpdate(req.params.profileUserId, req.body)
    .then(results => res.sendStatus(204))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

module.exports = router