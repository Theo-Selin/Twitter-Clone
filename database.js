// Creates a connection by simply calling: const mongoose = require("mongoose") //

const mongoose = require("mongoose")

class Database {

    constructor() {
        this.connect()
    }

    connect() {
        mongoose.connect("mongodb+srv://Theo-Selin:Ek6v3FsabNyyMDqH@spotifancluster.dfk6l.mongodb.net/SpotifanDB?retryWrites=true&w=majority")
        .then(() => {
            console.log("Successful")
        })
        .catch(() => {
            console.log("Error" + err)
        })
    }
}

module.exports = new Database()