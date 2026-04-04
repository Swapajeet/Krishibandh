const express = require("express");
const route = express.Router();
const Order = require("../models/order.js");
const Cotation = require("../models/cotation.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middlware.js");
const generateInvoice = require("../utils/generateInvoice");

// ================== UPDATE STATUS (BRANCH) ==================

route.put(
  "/orders/:orderId/cotation/:cotationId/status",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    const { orderId, cotationId } = req.params;
    const { status } = req.body;

       console.log(status);
 
}));

// ================== VERIFICATION PAGE ==================

route.get(
  "/branch/Dashbord/verifiction",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    if (!req.user || req.user.role !== "branch") {
      req.flash("error", "Only branch allowed");
      return res.redirect("/");
    }

    const allorders = await Order.find({})
      .populate("owner")
      .populate({
        path: "cotation",
        populate: { path: "auther" }
      });

    res.render("listing/verfy.ejs", {
      allorders,
      currUser: req.user
    });
  })
);

module.exports = route;