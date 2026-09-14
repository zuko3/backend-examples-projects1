const Tags = require("../models/tags");

exports.addTags = function (req, res, next) {
    const { tags } = req.body;
    const tagDoc = tags.map(tag => ({ tag }))

    Tags.insertMany(tagDoc).
        then(() => res.status(200).json({ message: "tags added" }))
        .catch(err => res.status(500).json(err))
}

exports.getTags = function (req, res, next) {
    Tags.find().
        then(tags => res.status(200).json(tags))
        .catch(err => res.status(500).json(err))
}