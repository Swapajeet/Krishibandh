const express = require("express");
const route = express.Router();
const order = require("../models/order.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const{validateListing} = require("../middlware.js");
const transporter = require("../utils/mail");
const orderControllers = require("../controllers/order.js");
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  next();
}


route.get("/",wrapAsync(orderControllers.renderorder));


route.get("/new",orderControllers.neworder);

//show route
route.get("/:id", orderControllers.showroute);


route.post(
  "/",
  validateListing,
  wrapAsync(orderControllers.showroder)
);

//update route

route.get("/:id/edit",wrapAsync(orderControllers.renderupdate));

route.put("/:id",
    validateListing,wrapAsync(orderControllers.update));

//delete route
route.delete("/:id",wrapAsync(orderControllers.destroyorder));


 
module.exports = route;