const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
bookingSchema.pre("save", async function (next) {
    const booking = this;
    if (booking.checkIn >= booking.checkOut) {
        const dateError = new Error("Validation Failed: Check-out date must be securely structured after your check-in selection.");
        dateError.name = "ValidationError";
        return next(dateError);
    }
    try {
        const conflictingBooking = await mongoose.model("Booking").findOne({
            listing: booking.listing,
            _id: { $ne: booking._id }, 
            $or: [
                { checkIn: { $lte: booking.checkIn }, checkOut: { $gte: booking.checkIn } },
                { checkIn: { $lte: booking.checkOut }, checkOut: { $gte: booking.checkOut } },
                { checkIn: { $gte: booking.checkIn }, checkOut: { $lte: booking.checkOut } }
            ]
        });

        if (conflictingBooking) {
            const overlapError = new Error("Booking Conflict: The requested dates overlap with an existing finalized reservation window.");
            overlapError.name = "ValidationError";
            return next(overlapError);
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
