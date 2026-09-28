const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schema.js");
const {isLoggedIn,isReviewAuthor,isOwner,validateListing} = require("../middleware.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const {validateReview} = require("../middleware.js");
const { createReview } = require("../controllers/reviews.js");
const reviewController = require("../controllers/reviews.js");

// Reviews POST Route

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//Delete Review      Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));


module.exports = router;