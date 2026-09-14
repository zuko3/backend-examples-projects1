const mongoose = require("mongoose");

module.exports = mongoose.model("users", new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    }
}));