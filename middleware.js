const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const {listingSchema,reviewSchema} =require("./schema.js");
const ExpressError=require("./expressErrors.js");


module.exports.isloggedin = (req,res,next)=>{
     if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("error","you must login to create a listing");
   return res.redirect("/login")
  };
  next();
};
module.exports.saveRedirectUrl = (req,res,next)=>{
     if(req.session.redirectUrl){
      res.locals.redirectUrl=req.session.redirectUrl;
  };
  next();
};
module.exports.isOwner =async (req,res,next)=>{
      let {id} = req.params ;
let listing =  await Listing.findById(id);
 if(!listing.owner.equals(res.locals.currUser._id)){
  req.flash("error","you dont have permission for this listing!");
 return  res.redirect(`/listings/${id}`);
 };
 next();
 };
 module.exports.validateListing=(req,res,next)=>{
    let {error}= listingSchema.validate(req.body);
   if(error){
    throw new ExpressError(400,error);
   }else{
    next();
   };
};
module.exports.validateReview=(req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
   if(error){
    throw new ExpressError(400,error);
   }else{
    next();
   };
};

module.exports.isReviewAuthor =async (req,res,next)=>{
      let {id,reviewId} = req.params ;
let review =  await Review.findById(reviewId);
 if(!reviews.author.equals(res.locals.currUser._id)){
  req.flash("error","you dont have permission to delete this review!");
 return  res.redirect(`/listings/${id}`);
 };
 next();
 };