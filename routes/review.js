const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync= require("../utils/wrapAsync.js");
const {validateReview,isloggedin,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

//create Reviews
router.post("/",isloggedin,validateReview, wrapAsync (reviewController.createReviews));

//delete reviews
router.delete("/:reviewsId",isloggedin,isReviewAuthor,wrapAsync(reviewController.destroyreview));
module.exports = router;
