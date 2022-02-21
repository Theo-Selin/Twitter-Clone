const express = require("express")
const app = express()
const PORT = 3000
const middleware = require("./middleware")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("./database")

const server = app.listen(PORT, () => console.log("Server listening on port " + PORT))

app.set("view engine", "pug")
app.set("views", "views")

app.use(bodyParser.urlencoded({extended: false}))

// CSS implementation //
app.use(express.static(path.join(__dirname, "public")))

// Routes //
const loginRoute = require("./routes/loginRoutes")
const registerRoute = require("./routes/registerRoutes")

app.use("/login", loginRoute)
app.use("/register", registerRoute)

// Render home-page //
app.get("/", middleware.requireLogin, (req, res, next) => {

    const payload = {
        pageTitle: "Home"
    }

    res.status(200).render("home", payload)
})