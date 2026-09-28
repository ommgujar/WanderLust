const { listingSchema,reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");
const Listing = require("./models/listing");
const Review = require("./models/review");
module.exports.isLoggedIn = (req,res,next) =>{
     if(!req.isAuthenticated()){
        //redirectUrl save 
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must Login to Create listings!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req,res,next)=>{
    let { id } = req.params;
   let listing = await Listing.findById(id);
   if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","Don't have permission to Edit or Update");
    return res.redirect(`/listings/${id}`);
   }
   next();
}
// VALIDATE LISTING
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(400, errMsg);
    }

    next();
};

module.exports.validateReview= (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(400, errMsg);
    }

    next();
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let { id,reviewId } = req.params;
   let review = await Review.findById(reviewId);
   if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error","You Have no Access to Delete this Review");
    return res.redirect(`/listings/${id}`);
   }
   next();
}