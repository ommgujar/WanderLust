const express = require("express");
const app = express();
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const mongoose = require("mongoose");
const methodOverride = require("method-override")
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs',ejsMate);
main().then(() =>{
    console.log("Connected to DB");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
app.get("/",(req,res)=>{
    res.send("Active");
});

const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) =>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
//index route
app.get("/listings",wrapAsync(async(req,res)=>{
const allListings = await Listing.find({});
res.render("./listings/index.ejs",{allListings});

}));

// new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
//create route
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
  
const newList = new Listing(req.body.listing);


await newList.save();
res.redirect("/listings");
}));

// edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    
    
 let {id} = req.params;
 await Listing.findByIdAndUpdate(id,{...req.body.listing});
 res.redirect(`/listings/${id}`);
}));
//destroy route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
let {id} = req.params;
let delList = await Listing.findByIdAndDelete(id);
console.log(delList);
res.redirect("/listings");
}));

// show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
 const listing =  await Listing.findById(id);
 res.render("listings/show.ejs",{listing});
}));

// app.get("/testListing",async(req,res)=>{
//  let sampleListing = new Listing({
//     title : "My New Villa",
//     description:"By the beach",
//     price : 1200,
//     location:"Calangute,Goa",
//     country : "India",

//  });

//  await sampleListing.save();
//  console.log("Sample was saved");
//  res.send("Successful");
// })
app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found !"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
// res.status(statusCode).send(message);
});
app.listen(8080,()=>{
    console.log("Listening to port 8080");
});