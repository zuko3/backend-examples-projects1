const express = require("express");
const adminController = require("../controllers/admin");
const placeController = require("../controllers/place");
const tagController = require("../controllers/tags");
const router = express.Router();

router.post("/login", adminController.doLogin);
router.post("/add-user", adminController.createUser);
router.get("/all-user", adminController.getAllUsers);
router.post("/delete-user", adminController.deleteUser);
router.post("/edit-user", adminController.updateUser);
router.post("/edit-admin", adminController.updateAdmin)

router.post("/add-place", placeController.addPlaces);
router.get("/all-place", placeController.getAllPlaces);
router.post("/delete-place", placeController.deletePlacesController);
router.post("/update-place", placeController.updatePlaceController);
router.get("/place/:id", placeController.getPlaceById);
router.get("/alltagsplace/:tag", placeController.getPlacesByTag);

router.post("/add-tags", tagController.addTags);
router.get("/tags", tagController.getTags);

module.exports = router;
