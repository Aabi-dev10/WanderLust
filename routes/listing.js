const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");

const listingController = require("../controllers/listing");

const {
    isloggedin,
    isOwner,
    validateListing
} = require("../middleware");

const { storage } = require("../cloudConfig");
const multer = require("multer");

const upload = multer({ storage });


// 📋 ALL LISTINGS

router
    .route("/")
    .get(
        wrapAsync(listingController.index)
    )
    .post(
        isloggedin,
        upload.fields([
            {
                name: "listing[images]",
                maxCount: 10
            },
            {
                name: "listing[image]",
                maxCount: 1
            }
        ]),
        validateListing,
        wrapAsync(listingController.createNewListing)
    );


// 📝 NEW LISTING FORM

router.get(
    "/new",
    isloggedin,
    listingController.newFormRender
);


// 🔍 SHOW / UPDATE / DELETE

router
    .route("/:id")
    .get(
        wrapAsync(listingController.showAllListing)
    )
    .put(
        isloggedin,
        isOwner,
        upload.fields([
            {
                name: "listing[images]",
                maxCount: 10
            },
            {
                name: "listing[image]",
                maxCount: 1
            }
        ]),
        validateListing,
        wrapAsync(listingController.UpdateListing)
    )
    .delete(
        isloggedin,
        isOwner,
        wrapAsync(listingController.destoryListing)
    );


// 🛠️ EDIT LISTING FORM

router.get(
    "/:id/edit",
    isloggedin,
    isOwner,
    wrapAsync(listingController.editListing)
);


module.exports = router;