const mongoose = require("mongoose");

module.exports = mongoose.model("place", new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    areas: {
        type: String,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    lon: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        required: true
    }
}));
