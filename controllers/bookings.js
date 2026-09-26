const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.renderBookingForm = async (req, res, next) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        res.render("bookings/booking.ejs", {
            listing
        });

    } catch (error) {
        next(error);
    }
};
module.exports.createBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { checkIn, checkOut } = req.body.booking;

        // Find listing
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Convert dates
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        // Validate dates
        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())
        ) {
            req.flash("error", "Please select valid booking dates.");
            return res.redirect(`/listings/${id}/bookings`);
        }

        if (startDate >= endDate) {
            req.flash(
                "error",
                "Check-out date must be after check-in date."
            );

            return res.redirect(`/listings/${id}/bookings`);
        }

        // Calculate number of nights
        const millisecondsPerDay = 1000 * 60 * 60 * 24;

        const nights = Math.ceil(
            (endDate - startDate) / millisecondsPerDay
        );

        // Calculate total price on SERVER
        const totalPrice = nights * listing.price;

        // Create booking
        const booking = new Booking({
            listing: listing._id,
            guest: req.user._id,
            checkIn: startDate,
            checkOut: endDate,
            totalPrice
        });

        await booking.save();

        req.flash(
            "success",
            "Your booking has been confirmed successfully!"
        );

        res.redirect(`/listings/${id}`);

    } catch (error) {
        if (error.name === "ValidationError") {

            req.flash(
                "error",
                error.message
            );

            return res.redirect(
                `/listings/${req.params.id}/bookings`
            );
        }

        next(error);
    }
};