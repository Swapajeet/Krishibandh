const express = require("express");
const route = express.Router();
const Order = require("../models/order.js");
const Cotation = require("../models/cotation.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isCompany,isLoggedIn} = require("../middlware.js");
const multer = require("multer");

const generateInvoice = require("../utils/generateInvoice");
const transporter = require("../utils/mail.js");
const storage = require("../models/storage.js");


route.get("/stroge",(req,res)=>{
    res.render("storage/Dashbord.ejs");
});

route.get("/storage/form",(req,res)=>{
    res.render("listing/storage.ejs");
});
   
// const { isLoggedIn } = require("./middlware");
route.post(
  "/storage",
  isLoggedIn,
  async (req, res) => {
    let storageData = req.body.storage;
    const newStorage = new storage(storageData);
    newStorage.author = req.user._id;
    await newStorage.save();
    console.log("Storage data saved:", newStorage);

    res.redirect("/farmer/dashbord",);
});

// const Preserve = require("./models/storage.js");

route.get("/Storage/Dashbord", isLoggedIn, async (req, res) => {
  const allStorage = await storage.find({});
  res.render("storage/Dashbord.ejs", { allStorage,currUser: req.user});
});

route.get("/Storage/Dashbord/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;

    const storageData = await storage.findById(id).populate("auther");

    console.log("Storage data retrieved:", storageData);

    if (!storageData) {
      return res.status(404).send("Storage data not found");
    }

    res.render("storage/show.ejs", { storageData });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

route.put("/Storage/Dashbord/:id", isLoggedIn, async (req, res) => {{
    try{
        const { id } = req.params;
        const updatedData = req.body.storage;
        const updatedStorage = await storage.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedStorage) {
            return res.status(404).send("Storage data not found");
        }
        res.redirect("/Storage/Dashbord");
    }catch(err){
        console.log(err); 
        res.status(500).send("Server Error"); 

    }
}
});

module.exports = route;
