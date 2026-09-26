const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const User = require("../models/user.js");
const { cloudinary } = require("../cloudConfig.js");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
// GMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Check Gmail connection
transporter.verify((error) => {
    if (error) {
        console.log(
            "❌ Gmail transporter error:",
            error.message
        );
    } else {
        console.log(
            "✅ Gmail transporter is ready!"
        );
    }
});
// SIGNUP
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};
module.exports.signup = async (req, res, next) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        const normalizedEmail =
            email?.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [
                {
                    username: username
                },
                {
                    email: normalizedEmail
                }
            ]
        });
        if (existingUser) {
            req.flash(
                "error",
                "Username or email already exists!"
            );
            return res.redirect("/signup");
        }
        const newUser = new User({
            username,
            email: normalizedEmail,
        });
        const registeredUser =
            await User.register(
                newUser,
                password
            );
        req.login(
            registeredUser,
            (err) => {
                if (err) {
                    return next(err);
                }
                req.flash(
                    "success",
                    "Welcome to Wanderlust!"
                );
                res.redirect("/listings");
            }
        );
    } catch (err) {
        req.flash(
            "error",
            err.message
        );

        res.redirect("/signup");
    }
};
// LOGIN
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};
// Login success handler
module.exports.loginDone = (req, res) => {
    req.flash(
        "success",
        "Welcome back to Wanderlust!"
    );

    // Redirect to saved page if middleware stored one
    const redirectUrl =
        req.session.redirectUrl ||
        "/listings";

    // Clear saved redirect URL
    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
};

// LOGOUT

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash(
            "success",
            "You have been logged out successfully."
        );

        res.redirect("/listings");
    });
};
// PROFILE

module.exports.profile = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(req.user._id);

        if (!user) {
            req.flash(
                "error",
                "User not found."
            );

            return res.redirect("/listings");
        }

        const listings =
            await Listing.find({
                owner: user._id
            });

        const bookings =
            await Booking.find({
                user: user._id
            })
                .populate("listing")
                .sort({
                    createdAt: -1
                });

        res.render(
            "users/profile.ejs",
            {
                user,
                listings,
                bookings
            }
        );

    } catch (err) {
        next(err);
    }
};
// EDIT PROFILE PAGE
module.exports.renderEditProfile = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(req.user._id);

        if (!user) {
            req.flash(
                "error",
                "User not found."
            );

            return res.redirect("/profile");
        }

        res.render(
            "users/edit-profile.ejs",
            {
                user
            }
        );

    } catch (err) {
        next(err);
    }
};
// UPDATE PROFILE
module.exports.updateProfile = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(req.user._id);

        if (!user) {
            req.flash(
                "error",
                "User not found."
            );

            return res.redirect("/profile");
        }

        const {
            username,
            email
        } = req.body;
        // Update username
        if (username?.trim()) {
            user.username =
                username.trim();
        }
        // Update email

        if (email?.trim()) {
            user.email =
                email.trim().toLowerCase();
        }
        // Update profile image
        if (req.file) {
            if (
                user.profileImage &&
                user.profileImage.filename
            ) {
                try {
                    await cloudinary.uploader.destroy(
                        user.profileImage.filename
                    );
                } catch (cloudinaryError) {
                    console.log(
                        "⚠️ Old profile image could not be deleted:",
                        cloudinaryError.message
                    );
                }
            }
            user.profileImage = {
                url: req.file.path,
                filename: req.file.filename
            };
        }


        await user.save();

        req.flash(
            "success",
            "Profile updated successfully!"
        );

        res.redirect("/profile");

    } catch (err) {

        if (err.code === 11000) {
            req.flash(
                "error",
                "Username or email is already in use."
            );

            return res.redirect(
                "/profile/edit"
            );
        }

        next(err);
    }
};
// REMOVE PROFILE IMAGE

module.exports.removeProfileImage = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(req.user._id);

        if (!user) {
            req.flash(
                "error",
                "User not found."
            );

            return res.redirect("/profile");
        }
        if (
            user.profileImage &&
            user.profileImage.filename
        ) {
            try {
                await cloudinary.uploader.destroy(
                    user.profileImage.filename
                );
            } catch (cloudinaryError) {
                console.log(
                    "⚠️ Cloudinary image deletion error:",
                    cloudinaryError.message
                );
            }
        }
        user.profileImage = undefined;

        await user.save();

        req.flash(
            "success",
            "Profile picture removed successfully!"
        );

        res.redirect("/profile");

    } catch (err) {
        next(err);
    }
};
// FORGOT PASSWORD PAGE
module.exports.forgotPasswordPage = (
    req,
    res
) => {
    res.render(
        "users/forgot-password.ejs"
    );
};
// FORGOT PASSWORD
module.exports.forgotPassword = async (
    req,
    res,
    next
) => {
    try {

        const email =
            req.body.email
                ?.trim()
                .toLowerCase();
        // Validate email
        if (!email) {
            req.flash(
                "error",
                "Please enter your email address."
            );
            return res.redirect(
                "/forgot-password"
            );
        }
        // Find user
        const user =
            await User.findOne({
                email
            });
        // Don't reveal whether account exists
        if (!user) {
            req.flash(
                "success",
                "If an account exists with that email, a password reset link has been sent."
            );
            return res.redirect(
                "/forgot-password"
            );
        }
        // Generate reset token
        const resetToken =
            crypto.randomBytes(32).toString("hex");
        // Hash token before saving
        const hashedToken =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        user.resetPasswordToken =
            hashedToken;


        // Token expires in 15 minutes
        user.resetPasswordExpires =
            Date.now() +
            15 * 60 * 1000;


        await user.save();
        // Reset URL

        const baseUrl =
            process.env.BASE_URL ||
            "http://localhost:8080";

        const resetUrl =
            `${baseUrl}/reset-password/${resetToken}`;
        // EMAIL
        const mailOptions = {
            from:
                `"Wanderlust" <${process.env.EMAIL_USER}>`,
            to:
                user.email,
            subject:
                "Reset Your Wanderlust Password",
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 40px 25px;
                    background: #f7f7f7;
                ">
                    <div style="
                        background: white;
                        padding: 35px;
                        border-radius: 16px;
                        box-shadow:
                            0 5px 20px
                            rgba(0,0,0,0.08);
                    ">

                        <h1 style="
                            color: #ff385c;
                            text-align: center;
                            margin-bottom: 25px;
                        ">
                            Wanderlust
                        </h1>


                        <h2 style="
                            color: #222;
                            margin-bottom: 15px;
                        ">
                            Reset Your Password
                        </h2>


                        <p style="
                            color: #555;
                            line-height: 1.6;
                        ">
                            We received a request to reset
                            your Wanderlust account password.
                        </p>


                        <p style="
                            color: #555;
                            line-height: 1.6;
                        ">
                            Click the button below to create
                            a new password.
                        </p>


                        <div style="
                            text-align: center;
                            margin: 30px 0;
                        ">

                            <a
                                href="${resetUrl}"
                                style="
                                    display: inline-block;
                                    background: #ff385c;
                                    color: white;
                                    text-decoration: none;
                                    padding: 14px 28px;
                                    border-radius: 10px;
                                    font-weight: bold;
                                    font-size: 16px;
                                "
                            >
                                Reset My Password
                            </a>

                        </div>


                        <p style="
                            color: #777;
                            font-size: 14px;
                            line-height: 1.6;
                        ">
                            This link will expire in
                            <strong>15 minutes</strong>.
                        </p>


                        <p style="
                            color: #777;
                            font-size: 14px;
                            line-height: 1.6;
                        ">
                            If you did not request a password
                            reset, you can safely ignore this
                            email.
                        </p>


                        <hr style="
                            border: none;
                            border-top: 1px solid #eee;
                            margin: 30px 0;
                        ">


                        <p style="
                            color: #999;
                            font-size: 12px;
                            text-align: center;
                        ">
                            © ${new Date().getFullYear()}
                            Wanderlust
                        </p>

                    </div>

                </div>
            `
        };
        // SEND EMAIL
        try {
            await transporter.sendMail(
                mailOptions
            );
            console.log(
                `✅ Password reset email sent to ${user.email}`
            );

        } catch (emailError) {

            console.error(
                "❌ PASSWORD RESET EMAIL ERROR:",
                emailError.message
            );


            // Remove reset token if email fails
            user.resetPasswordToken =
                undefined;

            user.resetPasswordExpires =
                undefined;

            await user.save();


            req.flash(
                "error",
                "We couldn't send the password reset email. Please try again later."
            );

            return res.redirect(
                "/forgot-password"
            );
        }
        // Success

        req.flash(
            "success",
            "If an account exists with that email, a password reset link has been sent."
        );

        res.redirect(
            "/forgot-password"
        );

    } catch (err) {
        next(err);
    }
};
// RESET PASSWORD PAGE

module.exports.resetPasswordPage = async (
    req,
    res,
    next
) => {
    try {

        const {
            token
        } = req.params;


        // Hash URL token
        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // Find valid reset token
        const user =
            await User.findOne({

                resetPasswordToken:
                    hashedToken,

                resetPasswordExpires: {
                    $gt: Date.now()
                }

            });


        if (!user) {

            req.flash(
                "error",
                "Password reset link is invalid or has expired."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        res.render(
            "users/reset-password.ejs",
            {
                token
            }
        );

    } catch (err) {
        next(err);
    }
};
// RESET PASSWORD

module.exports.resetPassword = async (
    req,
    res,
    next
) => {
    try {

        const {
            token
        } = req.params;


        const {
            password,
            confirmPassword
        } = req.body;
        // Check fields

        if (
            !password ||
            !confirmPassword
        ) {

            req.flash(
                "error",
                "Please fill in both password fields."
            );

            return res.redirect(
                `/reset-password/${token}`
            );
        }
        // Minimum password length
        if (password.length < 6) {

            req.flash(
                "error",
                "Password must be at least 6 characters long."
            );

            return res.redirect(
                `/reset-password/${token}`
            );
        }
                // Confirm password

        if (
            password !== confirmPassword
        ) {

            req.flash(
                "error",
                "Passwords do not match."
            );

            return res.redirect(
                `/reset-password/${token}`
            );
        }
        // Hash reset token

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        // Find valid user
        const user =
            await User.findOne({

                resetPasswordToken:
                    hashedToken,

                resetPasswordExpires: {
                    $gt: Date.now()
                }

            });


        if (!user) {

            req.flash(
                "error",
                "Password reset link is invalid or has expired."
            );

            return res.redirect(
                "/forgot-password"
            );
        }
                // Set new password

        await user.setPassword(
            password
        );
        // Clear reset token
        user.resetPasswordToken =
            undefined;

        user.resetPasswordExpires =
            undefined;


        await user.save();
        // Success
        req.flash(
            "success",
            "Your password has been reset successfully. Please log in."
        );

        res.redirect(
            "/login"
        );

    } catch (err) {
        next(err);
    }
};