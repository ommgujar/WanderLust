const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        }).populate("owner");
    if (!listing) {
        req.flash("error", "Does Not Found!");
        res.redirect("/listings");
    }

    else {
        res.render("listings/show.ejs", { listing });
    }
};

module.exports.createListing = async (req, res) => {

    let response = await geocodingClient
        .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send();
    let url = req.file.path;
    let filename = req.file.filename;

    const newList = new Listing(req.body.listing);
    newList.owner = req.user._id;
    newList.image = { url, filename };
    newList.geometry = response.body.features[0].geometry;

    let savedListing = await newList.save();
    console.log(savedListing);
    req.flash("success", "Created Successfully!");

    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Does Not Found!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });

};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true }
    );
    if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Updated Successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    let delList = await Listing.findByIdAndDelete(id);

    console.log(delList);
    req.flash("success", "Deleted Successfully!");

    res.redirect("/listings");
};