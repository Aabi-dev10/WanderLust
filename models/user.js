const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },

    profileImage: {
        url: String,
        filename: String,
    },

    // Password reset fields
    resetPasswordToken: {
        type: String,
    },

    resetPasswordExpires: {
        type: Date,
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);