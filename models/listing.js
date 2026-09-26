const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Review = require("./review.js");

const listingSchema = new Schema({

    title: {
        type: String,
        required: true,
    },

    description: String,
    image: {
        url: String,
        filename: String,
    },
    // NEW MULTIPLE IMAGES
    images: [
        {
            url: String,
            filename: String,
        }
    ],

    price: Number,

    location: String,

    country: String,
    // REVIEWS
    review: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],

    // OWNER
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // MAPBOX GEOMETRY
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        },
    },
    // CATEGORY
    category: {
        type: String,

        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Castles",
            "Amazing Pools",
            "Camping",
            "Farms",
            "Arctic",
            "Domes",
            "Boats"
        ],

        required: true
    }

});
// DELETE ASSOCIATED REVIEWS

listingSchema.post("findOneAndDelete", async (listing) => {

    if (listing && listing.review && listing.review.length > 0) {

        await Review.deleteMany({
            _id: {
                $in: listing.review
            }
        });

        console.log(
            "Associated reviews cleared successfully from database storage."
        );

    }

});


const Listing = mongoose.model(
    "Listing",
    listingSchema
);

module.exports = Listing;