const express = require("express")
const app = express()
const PORT = 3000
const middleware = require("./middleware")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("./database")
const session = require("express-session")

const server = app.listen(PORT, () => console.log("Server listening on port " + PORT))

app.set("view engine", "pug")
app.set("views", "views")

app.use(bodyParser.urlencoded({extended: false}))

// CSS implementation //
app.use(express.static(path.join(__dirname, "public")))

app.use(session({
    secret: "Mangoraja",
    resave: true,
    saveUninitialized: false
}))

// Page Routes //
const loginRoute = require("./routes/loginRoutes")
const registerRoute = require("./routes/registerRoutes")
const postRoute = require("./routes/postRoutes")
const profileRoute = require("./routes/profileRoutes")
const uploadRoute = require("./routes/uploadRoutes")
const logoutRoute = require("./routes/logoutRoutes")

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/posts", middleware.requireLogin, postRoute)
app.use("/profile", middleware.requireLogin, profileRoute)
app.use("/uploads", uploadRoute)
app.use("/logout", logoutRoute)

// Api Routes //
const postsRoute = require("./routes/api/posts")
const usersRoute = require("./routes/api/users")

app.use("/api/posts", postsRoute)
app.use("/api/users", usersRoute)


// Render home-page //
app.get("/", middleware.requireLogin, (req, res, next) => {

    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render("home", payload)
})