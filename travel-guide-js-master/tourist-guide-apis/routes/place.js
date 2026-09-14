const express = require("express");
const placeController = require("../controllers/place");
const tagController = require("../controllers/tags");
const router = express.Router();

router.get("/all-place", placeController.getAllPlaces);
router.get("/tags", tagController.getTags);
router.get("/popular", placeController.getPopularPlace);
router.get("/place/:id", placeController.getPlaceById);
router.get("/alltagsplace/:tag", placeController.getPlacesByTag);
router.get("/prefrence", placeController.getPlacesByPrefrence);

module.exports = router;
