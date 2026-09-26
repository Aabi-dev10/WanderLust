const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//Create Route
module.exports.createReviews = async(req,res)=>{
  let listing= await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review); 
  listing.review.push(newReview);
  newReview.author = req.user._id;
  await newReview.save();
    await listing.save();
       req.flash("success","review created");
res.redirect(`/listings/${listing._id}`);
};
//Destroy Route
module.exports.destroyreview = async(req,res)=>{
    let {id,reviewsId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {review:reviewsId} });
    await Review.findByIdAndDelete(reviewsId);
      req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
 };