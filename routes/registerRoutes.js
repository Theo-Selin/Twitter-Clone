const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const User = require("../schemas/UserSchema")

app.set("view engine", "pug")
app.set("views", "views")

app.use(bodyParser.urlencoded({extended: false}))

// Render login-page //
router.get("/", (req, res, next) => {
    res.status(200).render("register")
})

router.post("/", (req, res, next) => {

    const firstName = req.body.firstName.trim()
    const lastName = req.body.lastName.trim()
    const username = req.body.username.trim()
    const email = req.body.email.trim()
    const password = req.body.password

    const payload = req.body

    if(firstName && lastName && username && email && password) {
        User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .then((user) => {
            console.log(user)
        })
    } else {
        payload.errorMessage = "Oops! You seem to have missed something."
        res.status(200).render("register", payload)
    }

})

module.exports = router