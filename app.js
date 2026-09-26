if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./expressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    methodOverride("_method")
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

mongoose.set(
    "strictPopulate",
    false
);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on(
    "error",
    (err) => {
        console.log(
            "Error in Mongo session store:",
            err
        );
    }
);

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:
            7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure:
            process.env.NODE_ENV === "production"
    }
};

app.use(
    session(sessionOptions)
);

app.use(
    flash()
);

app.use(
    passport.initialize()
);

app.use(
    passport.session()
);

passport.use(
    new LocalStrategy(
        User.authenticate()
    )
);

passport.serializeUser(
    User.serializeUser()
);

passport.deserializeUser(
    User.deserializeUser()
);

app.use(
    (req, res, next) => {

        res.locals.success =
            req.flash("success");

        res.locals.error =
            req.flash("error");

        res.locals.currUser =
            req.user || null;

        next();
    }
);

app.get(
    "/",
    (req, res) => {
        res.redirect("/listings");
    }
);

app.use(
    "/listings",
    listingsRouter
);

app.use(
    "/listings/:id/reviews",
    reviewsRouter
);

app.use(
    "/",
    userRouter
);

app.use(
    "/listings",
    bookingRouter
);

app.get(
    "/privacy",
    (req, res) => {

        res.render(
            "pages/privacy"
        );

    }
);

app.get(
    "/terms",
    (req, res) => {

        res.render(
            "pages/terms"
        );

    }
);

app.get(
    "/sitemaps",
    (req, res) => {

        res.render(
            "pages/sitemaps"
        );

    }
);

app.all(
    "/{*splat}",
    (req, res, next) => {

        next(
            new ExpressError(
                404,
                "Page not Found!"
            )
        );

    }
);

app.use(
    (err, req, res, next) => {

        let {
            statusCode = 500,
            message = "Something went wrong"
        } = err;

        if (!statusCode) {
            statusCode = 500;
        }

        res
            .status(statusCode)
            .render(
                "error.ejs",
                {
                    message
                }
            );

    }
);

const PORT = process.env.PORT || 8080;

app.listen(
    PORT,
    () => {

        console.log(
            `port is listening on ${PORT}`
        );

    }
);