const express = require("express");
const router = express.Router();

// About page
router.get("/about", (req, res) => {
  res.render("pages/about");
});

// Contact page
router.get("/contact", (req, res) => {
  res.render("pages/contact");
});

// Contact form POST
router.post("/contact", (req, res) => {
  // nodemailer / DB save logic येईल पुढे
  req.flash("success", "Message sent successfully!");
  res.redirect("/contact");
});

module.exports = router;
