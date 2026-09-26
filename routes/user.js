const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const multer = require("multer");
const { profileStorage } = require("../cloudConfig.js");

const profileUpload = multer({
    storage: profileStorage
});

const passport = require("passport");

const {
    saveRedirectUrl,
    isloggedin
} = require("../middleware.js");

const userController = require("../controllers/user.js");

// SIGNUP

router.route("/signup")

.get(
    userController.renderSignupForm
)

.post(
    wrapAsync(userController.signup)
);
// LOGIN

router.route("/login")

.get(
    userController.renderLoginForm
)

.post(
    saveRedirectUrl,

    passport.authenticate(
        "local",
        {
            failureRedirect: "/login",
            failureFlash: true
        }
    ),

    userController.loginDone
);
// LOGOUT

router.get(
    "/logout",
    userController.logout
);
// PROFILE

router.get(
    "/profile",
    isloggedin,
    wrapAsync(userController.profile)
);
// EDIT PROFILE

router.get(
    "/profile/edit",
    isloggedin,
    wrapAsync(userController.renderEditProfile)
);
// UPDATE PROFILE

router.put(
    "/profile",
    isloggedin,
    profileUpload.single("profileImage"),
    wrapAsync(userController.updateProfile)
);
// REMOVE PROFILE IMAGE

router.delete(
    "/profile/image",
    isloggedin,
    wrapAsync(userController.removeProfileImage)
);
// FORGOT PASSWORD

// Show forgot password page
router.get(
    "/forgot-password",
    userController.forgotPasswordPage
);


// Process forgot password request
router.post(
    "/forgot-password",
    wrapAsync(userController.forgotPassword)
);

// RESET PASSWORD
// Show reset password page
router.get(
    "/reset-password/:token",
    wrapAsync(userController.resetPasswordPage)
);

// Process new password
router.post(
    "/reset-password/:token",
    wrapAsync(userController.resetPassword)
);
module.exports = router;