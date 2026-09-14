const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require('multer');
const app = express();
const path = require('path');
const adminRoutes = require("./routes/admin");
const placeRoutes = require("./routes/place");
const userRoutes = require("./routes/user")

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage }).array('files', 5));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/admin", adminRoutes);
app.use("/place", placeRoutes);
app.use("/user", userRoutes);




mongoose.connect("mongodbatlas_url")
  .then(result => { console.log("Database server stared ...."); })
  .catch(err => {
    console.log("[Error]:", err);
  });

module.exports = app;
