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

// Global code implementation //
app.use(express.static(path.join(__dirname, "public")))

// Start session //
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
const searchRoute = require("./routes/searchRoutes")
const messagesRoute = require("./routes/messagesRoutes")
const logoutRoute = require("./routes/logoutRoutes")

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/posts", middleware.requireLogin, postRoute)
app.use("/profile", middleware.requireLogin, profileRoute)
app.use("/uploads", uploadRoute)
app.use("/search", middleware.requireLogin, searchRoute)
app.use("/messages", middleware.requireLogin, messagesRoute)
app.use("/logout", logoutRoute)

// Api Routes //
const postsApiRoute = require("./routes/api/posts")
const usersApiRoute = require("./routes/api/users")
const chatsApiRoute = require("./routes/api/chats")
const messagesApiRoute = require("./routes/api/messages")

app.use("/api/posts", postsApiRoute)
app.use("/api/users", usersApiRoute)
app.use("/api/chats", chatsApiRoute)
app.use("/api/messages", messagesApiRoute)


// Render home page //
app.get("/", middleware.requireLogin, (req, res, next) => {

    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render("home", payload)
})

