const express = require("express");
const router = express.Router();
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");

const upload = multer({storage });

// NEW
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image][url]'),validateListing, wrapAsync(listingController.createListing));

router.route("/:id")
.put(isLoggedIn,isOwner, upload.single('listing[image][url]'),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,  wrapAsync(listingController.destroyListing))
.get(wrapAsync(listingController.showListing));

// EDIT
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;