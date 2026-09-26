const express = require("express");

const router = express.Router({
    mergeParams: true
});

const wrapAsync = require("../utils/wrapAsync.js");

const {
    isloggedin
} = require("../middleware.js");

const bookingController = require("../controllers/bookings.js");

router.get(
    "/:id/bookings",
    isloggedin,
    wrapAsync(bookingController.renderBookingForm)
);

router.post(
    "/:id/bookings",
    isloggedin,
    wrapAsync(bookingController.createBooking)
);


module.exports = router;