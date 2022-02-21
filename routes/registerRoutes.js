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

router.post("/", async (req, res, next) => {

    const firstName = req.body.firstName.trim()
    const lastName = req.body.lastName.trim()
    const username = req.body.username.trim()
    const email = req.body.email.trim()
    const password = req.body.password

    const payload = req.body

    if(firstName && lastName && username && email && password) {
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((err) => {
            console.log(err)
            payload.errorMessage = "Something went wrong."
            res.status(200).render("register", payload)
        })

        if(user == null) {
            // No user found //

            const data = req.body
            
            User.create(data)
            .then((user) => {
                console.log(user)
            })
        } else {
            // User found //
            if(email == user.email) {
                payload.errorMessage = "Email already in use."
            } else {
                payload.errorMessage = "Username already in use."
            }
            res.status(200).render("register", payload)
        }

    } else {
        payload.errorMessage = "Oops! You seem to have missed something."
        res.status(200).render("register", payload)
    }

})

module.exports = router