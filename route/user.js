const express = require("express");
const router =  express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const{isLoggedIn } = require("../middlware.js");
const passport = require("passport");
const userControllers = require("../controllers/user.js");
const transporter = require("../utils/mail.js");

// Auth routes
router
 .route("/signup")
.get(userControllers.renderSingup)
.post(wrapAsync(userControllers.Singup));

router
 .route("/login")
 .get(userControllers.renderlogin)
.post(
  passport.authenticate("local", { failureRedirect: "/login" }),
  userControllers.login
);

// Dashboards
router.get("/compny/dashbord", isLoggedIn,userControllers.compnydash);

router.get("/farmer/dashbord", isLoggedIn,userControllers.farmerdash);
router.get("/branch/Dashbord", isLoggedIn,userControllers.branchdash);
router.get("/Storage/Dashboard", isLoggedIn,userControllers.storagedash);

router.get("/logout",userControllers.logout);  

module.exports = router;