# 🏡 WanderLust

A full-stack **Airbnb-inspired vacation rental web application** built with **Node.js, Express.js, MongoDB, EJS, Passport.js, Cloudinary, and Mapbox**.

WanderLust allows users to explore accommodation listings, create their own listings, leave reviews, manage accounts, and book stays through a clean Airbnb-inspired interface.

## 🌐 Live Demo

**Live Website:**
https://wanderlust-tphz.onrender.com

## 📸 Features

* 🏠 Browse available property listings
* 🔍 Search and explore listings
* 🏷️ Filter listings by categories
* ➕ Create new listings
* ✏️ Edit existing listings
* 🗑️ Delete listings
* 🖼️ Upload listing images using Cloudinary
* 📍 Display listing locations using Mapbox
* ⭐ Add and delete reviews
* 👤 User registration and login
* 🔐 Secure authentication using Passport.js
* 🔑 Forgot-password and password-reset functionality
* 📧 Password reset emails using Nodemailer and Gmail
* 📅 Booking system with check-in and check-out dates
* 💰 Automatic booking price calculation
* 🔒 Session management using MongoDB
* ⚡ Flash messages for success and error notifications
* 📱 Responsive Airbnb-inspired UI

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* EJS
* EJS-Mate
* Bootstrap

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* Passport.js
* Passport Local
* Passport Local Mongoose
* Express Session
* Connect Mongo

### Services & APIs

* Cloudinary — Image storage
* Mapbox — Maps and location data
* Nodemailer — Password reset emails

### Deployment

* Git
* GitHub
* Render

## 📂 Project Structure

```text
WanderLust/
│
├── controllers/
│   ├── bookings.js
│   ├── listings.js
│   ├── reviews.js
│   └── user.js
│
├── models/
│   ├── booking.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── routes/
│   ├── booking.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── views/
│   ├── layouts/
│   ├── listings/
│   ├── users/
│   ├── bookings/
│   └── pages/
│
├── public/
│   ├── css/
│   └── js/
│
├── init/
│   └── data.js
│
├── utils/
│   └── ExpressError.js
│
├── app.js
├── middleware.js
├── schema.js
├── cloudConfig.js
├── package.json
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file in the root directory and add the required environment variables:

**Never upload your `.env` file to GitHub.**

## 🚀 Installation

Clone the repository:
Move into the project directory:
Install dependencies:
```bash
npm install
```
Create your `.env` file and configure the required environment variables.

Start the application:

```bash
node app.js
```

The application will run at:

```text
http://localhost:8080
```

## 👤 Authentication

WanderLust uses Passport.js for local authentication.

Users can:

1. Create an account
2. Log in
3. Create listings
4. Edit their listings
5. Delete their listings
6. Add reviews
7. Delete their reviews
8. Make bookings
9. Reset forgotten passwords

Password reset emails are sent through Nodemailer using a Gmail App Password.

## 🖼️ Image Uploads

Listing images are uploaded to **Cloudinary** instead of being stored directly inside the project.

This keeps the application lightweight and allows images to be served through Cloudinary's CDN.

## 🗺️ Maps

WanderLust uses **Mapbox** to display listing locations.

Each listing stores geographic information using GeoJSON:

```text
{
  type: "Point",
  coordinates: [longitude, latitude]
}
```

The location is displayed on the listing details page using an interactive Mapbox map.

## ⭐ Reviews

Authenticated users can leave reviews on listings.

Each review contains:

* Rating
* Comment
* User information

Users can also delete their own reviews.

## 📅 Booking System

Users can select:

* Check-in date
* Check-out date

The application calculates the total booking price based on the listing price and number of nights.

Bookings are associated with both the user and the selected listing.

## ☁️ Deployment

The application is deployed using **Render**.

Production URL:

```text
https://wanderlust-tphz.onrender.com
```

GitHub repository:

```text
https://github.com/Aabi-dev10/WanderLust
```

## 🔒 Security

Sensitive credentials are stored in environment variables rather than inside the source code.

The project uses:

* Environment variables
* Secure sessions
* MongoDB session storage
* Passport authentication
* Password hashing
* HTTP-only cookies
* Authentication and authorization middleware

## 🎯 Project Goal

The goal of WanderLust was to build a complete full-stack web application inspired by modern vacation rental platforms while learning and applying:

* RESTful routing
* MVC architecture
* Authentication
* Authorization
* CRUD operations
* Database relationships
* Image uploading
* API integration
* Session management
* Email functionality
* Booking systems
* Git and GitHub
* Cloud deployment

## 👨‍💻 Author

**Aabi-dev10**

Built as a full-stack web development project while learning modern backend and web application development.

## 📄 License

This project is created for educational and portfolio purposes.
