const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const User = require("../../schemas/UserSchema")
const Post = require("../../schemas/PostSchema")
const { send } = require("express/lib/response")

app.use(bodyParser.urlencoded({extended: false}))

// Render posts //
router.get("/", async (req, res, next) => {
    const results = await getPosts({})
    res.status(200).send(results)
})

router.get("/:id", async (req, res, next) => {
    const postId = req.params.id
    let postData = await getPosts({_id: postId})
    postData = postData[0]

    let results = {
        postData: postData
    }

    if(postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo
    }

    results.replies = await getPosts({ replyTo: postId })
    res.status(200).send(results)
})

router.post("/", async (req, res, next) => {
    if(!req.body.content) {
        console.log("message param not sent with request")
        return res.sendStatus(400)
    }

    const postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo) {
        postData.replyTo = req.body.replyTo
    }

    // Return confirmation //
    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: "postedBy" })
        res.status(201).send(newPost)
    })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

router.put("/:id/like", async (req, res, next) => {

    const postId = req.params.id
    const userId = req.session.user._id

    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId)

    // insert user like with conditional option
    const option = isLiked ? "$pull" : "$addToSet"
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })


    // insert post like
    const post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    res.status(200).send(post)
})

router.post("/:id/share", async (req, res, next) => {
    const postId = req.params.id
    const userId = req.session.user._id

    // Delete share //
    const deletedPost = await Post.findOneAndDelete({ postedBy: userId, shareData: postId })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    const option = deletedPost != null ? "$pull" : "$addToSet"

    let repost = deletedPost

    if(repost == null) {
        repost = await Post.create({ postedBy: userId, shareData: postId })
        .catch(error => {
            console.log(error)
            res.sendStatus(400)
        })
    }

    // insert user like with conditional option
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { shares: repost._id } }, { new: true })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })


    // insert post like
    const post = await Post.findByIdAndUpdate(postId, { [option]: { shareUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    res.status(200).send(post)
})

async function getPosts(filter) {
    let results = await Post.find(filter)
    .populate("postedBy")
    .populate("shareData")
    .populate("replyTo")
    .sort({ "createdAt": -1})
    .catch(error => console.log(error))

    results = await User.populate(results, { path: "replyTo.postedBy" })
    return await User.populate(results, { path: "shareData.postedBy" })
}

module.exports = router