const express = require("express")
const app = express()
const PORT = 3000

const server = app.listen(PORT, () => console.log("Server listening on port " + PORT))

app.set("view engine", "pug")
app.set("views", "views")

app.get("/", (req, res, next) => {

    const payload = {
        pageTitle: "Home"
    }

    res.status(200).render("home", payload)
})