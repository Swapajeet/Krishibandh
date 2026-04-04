const express = require("express");
const route = express.Router();
const Order = require("../models/order.js");
const Cotation = require("../models/cotation.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isCompany,isLoggedIn} = require("../middlware");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const generateInvoice = require("../utils/generateInvoice");
const transporter = require("../utils/mail.js");
const QRCode = require("qrcode");




route.get("/farmer/dashbord/cotation/:id",async(req,res)=>{
    
 const order = await Cotation.findById(req.params.id).populate("auther");
      
     
  // Generate URL that user will visit after scanning
  const scanUrl = `http://localhost:8080/farmer/dashbord/cotation/${req.params.id}`;

  // Generate QR code image as data URL
  const qrImage = await QRCode.toDataURL(scanUrl);

  // Render QR page
 

     res.render("listing/info.ejs" ,{order,qrImage, scanUrl});
     
});

module.exports = route;