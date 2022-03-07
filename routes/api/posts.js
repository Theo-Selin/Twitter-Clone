const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const User = require("../../schemas/UserSchema")
const Post = require("../../schemas/PostSchema")
const { send } = require("express/lib/response")

app.use(bodyParser.urlencoded({extended: false}))

// Routes //
router.get("/", async (req, res, next) => {

    const searchObject = req.query

    if(searchObject.isReply !== undefined) {
        let isReply = searchObject.isReply == "true"
        searchObject.replyTo = { $exists: isReply }
        delete searchObject.isReply
    }

    if(searchObject.search !== undefined) {
        searchObject.content = { $regex: searchObject.search, $options: "i" }
        delete searchObject.search
    }

    if(searchObject.followingOnly !== undefined) {
        let followingOnly = searchObject.followingOnly == "true"

        if(followingOnly) {
            const objectIds = []

            if(!req.session.user.following) {
                req.session.user.following = []
            }

            req.session.user.following.forEach(user => {
                objectIds.push(user)
            })

            objectIds.push(req.session.user._id)
            searchObject.postedBy = { $in: objectIds }
        }

        delete searchObject.followingOnly
    }

    const results = await getPosts(searchObject)
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

router.delete("/:id", (req, res, next) => {
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

router.put("/:id", async (req, res, next) => {

    if(req.body.pinned !== undefined) {
        await Post.updateMany({postedBy: req.session.user}, {pinned: false})
        .catch(error => {
            console.log(error)
            res.sendStatus(400)
        })
    }

    Post.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.sendStatus(204))
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
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