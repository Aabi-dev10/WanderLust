const Listing = require("../models/listing.js");

const mbxGeocoding =
    require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken =
    process.env.MAP_TOKEN;

const geocodingClient =
    mbxGeocoding({
        accessToken: mapToken
    });


// 📋 INDEX ROUTE

module.exports.index = async (req, res) => {

    const {
        category,
        search
    } = req.query;

    let query = {};
    // CATEGORY FILTER

    if (category) {

        query.category = {
            $regex: new RegExp(
                `^${category}$`,
                "i"
            )
        };

    }
        // SEARCH FILTER

    if (
        search &&
        search.trim() !== ""
    ) {

        const searchRegex =
            new RegExp(
                search.trim(),
                "i"
            );

        query.$or = [

            {
                title: searchRegex
            },

            {
                location: searchRegex
            },

            {
                country: searchRegex
            }

        ];

    }


    const allListings =
        await Listing.find(query);


    res.render(
        "listings/index.ejs",
        {
            allListings
        }
    );

};


// 📝 NEW FORM

module.exports.newFormRender = (
    req,
    res
) => {

    res.render(
        "listings/new.ejs"
    );

};
// 🔍 SHOW ROUTE

module.exports.showAllListing = async (
    req,
    res
) => {

    const {
        id
    } = req.params;
    // FIND LISTING

    const listing =
        await Listing.findById(id)
            .populate({
                path: "review",
                populate: {
                    path: "author"
                }
            })
            .populate("owner");
    // LISTING NOT FOUND

    if (!listing) {

        req.flash(
            "error",
            "Listing you requested does not exist!"
        );

        return res.redirect(
            "/listings"
        );

    }
    // RELATED LISTINGS

    const relatedListings =
        await Listing.find({

            country:
                listing.country,

            _id: {
                $ne: listing._id
            }

        }).sort({
            _id: 1
        });
    // RENDER SHOW PAGE

    res.render(
        "listings/show",
        {
            listing,
            relatedListings
        }
    );

};
// 🚀 CREATE LISTING
module.exports.createNewListing = async (
    req,
    res,
    next
) => {

    try {

        const location =
            req.body.listing.location;
        // GEOCODING
        const response =
            await geocodingClient
                .forwardGeocode({

                    query: location,

                    limit: 1

                })
                .send();
        // CREATE LISTING
        const newListing =
            new Listing(
                req.body.listing
            );
        newListing.owner =
            req.user._id;
        // MULTIPLE IMAGES
        const uploadedImages =
            req.files &&
            req.files["listing[images]"]
                ? req.files["listing[images]"]
                : [];
        const oldSingleImage =
            req.files &&
            req.files["listing[image]"]
                ? req.files["listing[image]"][0]
                : null;


        if (uploadedImages.length > 0) {

            newListing.images =
                uploadedImages.map(file => ({

                    url:
                        file.path,

                    filename:
                        file.filename

                }));

            newListing.image = {

                url:
                    uploadedImages[0].path,

                filename:
                    uploadedImages[0].filename

            };

        }

        else if (oldSingleImage) {

            newListing.image = {

                url:
                    oldSingleImage.path,

                filename:
                    oldSingleImage.filename

            };


            newListing.images = [

                {

                    url:
                        oldSingleImage.path,

                    filename:
                        oldSingleImage.filename

                }

            ];

        }
        // MAPBOX GEOMETRY
        if (
            response.body &&
            response.body.features &&
            response.body.features.length > 0
        ) {

            newListing.geometry =
                response
                    .body
                    .features[0]
                    .geometry;


            console.log(
                "NEW LISTING GEOMETRY:",
                newListing.geometry
            );

        }

        else {

            console.log(
                "Mapbox could not find location:",
                location
            );

        }
        // SAVE
        const savedListing =
            await newListing.save();


        console.log(
            "SUCCESSFULLY SAVED LISTING:",
            savedListing._id
        );


        console.log(
            "NUMBER OF IMAGES:",
            savedListing.images
                ? savedListing.images.length
                : 0
        );


        console.log(
            "SAVED GEOMETRY:",
            savedListing.geometry
        );


        req.flash(
            "success",
            "New Listing Added Successfully"
        );


        res.redirect(
            "/listings"
        );


    } catch (error) {

        next(error);

    }

};

// 🛠️ EDIT ROUTE
module.exports.editListing = async (
    req,
    res
) => {

    const {
        id
    } = req.params;


    const listing =
        await Listing.findById(id);


    if (!listing) {

        req.flash(
            "error",
            "The requested listing could not be found!"
        );

        return res.redirect(
            "/listings"
        );

    };
        // PREPARE IMAGE PREVIEWS

    let previewImages = [];


    if (
        listing.images &&
        listing.images.length > 0
    ) {

        previewImages =
            listing.images;

    }

    else if (
        listing.image &&
        listing.image.url
    ) {

        previewImages = [
            listing.image
        ];

    }
    // OLD PREVIEW VARIABLE
    let originalImageUrl = "";

    if (
        listing.image &&
        listing.image.url
    ) {

        originalImageUrl =
            listing.image.url.replace(
                "/upload",
                "/upload/w_250,c_fill"
            );

    }


    return res.render(
        "listings/edit.ejs",
        {
            listing,
            originalImageUrl,
            previewImages
        }
    );

};
// 🔄 UPDATE LISTING
module.exports.UpdateListing = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const oldListing =
            await Listing.findById(id);


        if (!oldListing) {

            req.flash(
                "error",
                "The requested listing could not be found!"
            );

            return res.redirect(
                "/listings"
            );

        }


        const newLocation =
            req.body.listing.location;


        const locationChanged =
            oldListing.location !==
            newLocation;
        // UPDATE NORMAL FIELDS

        let listing =
            await Listing.findByIdAndUpdate(

                id,

                {
                    ...req.body.listing
                },

                {
                    new: true,

                    runValidators: true
                }

            );
        // RE-GEOCODE
        if (
            locationChanged &&
            newLocation &&
            newLocation.trim() !== ""
        ) {

            console.log(
                `Re-geocoding listing: ${newLocation}`
            );


            const response =
                await geocodingClient
                    .forwardGeocode({

                        query:
                            `${newLocation}, ${listing.country || ""}`,

                        limit: 1

                    })
                    .send();


            if (
                response.body &&
                response.body.features &&
                response.body.features.length > 0
            ) {

                listing.geometry =
                    response
                        .body
                        .features[0]
                        .geometry;


                console.log(
                    "UPDATED LISTING GEOMETRY:",
                    listing.geometry
                );

            }

            else {

                console.log(
                    "Could not geocode new location:",
                    newLocation
                );

            }

        }
        // MULTIPLE NEW IMAGES
        const uploadedImages =
            req.files &&
            req.files["listing[images]"]
                ? req.files["listing[images]"]
                : [];
        // OLD SINGLE IMAGE SUPPORT
        const oldSingleImage =
            req.files &&
            req.files["listing[image]"]
                ? req.files["listing[image]"][0]
                : null;
        // ADD NEW IMAGES
        if (uploadedImages.length > 0) {

            const newImages =
                uploadedImages.map(file => ({

                    url:
                        file.path,

                    filename:
                        file.filename

                }));


            // Existing images
            const existingImages =
                listing.images &&
                listing.images.length > 0
                    ? listing.images
                    : (
                        listing.image &&
                        listing.image.url
                            ? [
                                listing.image
                            ]
                            : []
                    );


            // Add new photos
            listing.images = [
                ...existingImages,
                ...newImages
            ].slice(0, 10);


            // Keep first image compatible
            if (
                listing.images.length > 0
            ) {

                listing.image =
                    listing.images[0];

            }

        }
        // LEGACY SINGLE IMAGE

        else if (oldSingleImage) {

            const newImage = {

                url:
                    oldSingleImage.path,

                filename:
                    oldSingleImage.filename

            };


            listing.images = [
                newImage
            ];


            listing.image =
                newImage;

        }
        // SAVE
        await listing.save();
        console.log(
            "UPDATED LISTING IMAGES:",
            listing.images
                ? listing.images.length
                : 0
        );


        req.flash(
            "success",
            "Listing updated successfully"
        );


        return res.redirect(
            `/listings/${id}`
        );

    } catch (error) {

        next(error);

    }

};
// 🗑️ DELETE LISTING
module.exports.destoryListing = async (
    req,
    res,
    next
) => {

    try {

        const { id } = req.params;
        const result =
            await Listing.deleteOne({
                _id: id
            });

        console.log(
            "DELETE RESULT:",
            result
        );

        if (result.deletedCount === 0) {

            req.flash(
                "error",
                "Listing not found!"
            );

            return res.redirect(
                "/listings"
            );

        }

        req.flash(
            "success",
            "Listing deleted Successfully"
        );

        return res.redirect(
            "/listings"
        );

    } catch (error) {

        next(error);

    }

};