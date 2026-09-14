const mongoose = require("mongoose");

module.exports = mongoose.model("alltags", new mongoose.Schema({
    tag: {
        type: String,
        required: true
    }
}));
