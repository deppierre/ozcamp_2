const env = require('dotenv').config()
const mongoose = require("mongoose")

mySchema = new mongoose.Schema({
    name: String,
    url: String,
    campings: [{
            name: String,
            url: String
        }]
})

module.exports = mongoose.model("nationalpark", mySchema)