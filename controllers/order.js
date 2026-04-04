const order = require("../models/order.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const{validateListing} = require("../middlware.js");
const transporter = require("../utils/mail");
// const order = require("../models/order.js");

module.exports.renderorder = async(req,res)=>{
    const Allorders = await order.find({}).populate("owner");;

    res.render("listing/index.ejs",{Allorders});
};

module.exports.neworder = (req,res)=>{
    res.render("listing/new.ejs");
};

module.exports.showroute = async (req, res) => {
  const Order = await order.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "cotation",
      populate: { path: "auther" }
    });

  let remainingQuantity = Order.quantity;
  if (Order.cotation && Order.cotation.length > 0) {
    const dealCotations = Order.cotation.filter(
      (c) => c.status === "visting"
    );
    const totalDealQuantity = dealCotations.reduce(
      (sum, c) => sum + Number(c.quantity),
      0
    );
    remainingQuantity = Order.quantity - totalDealQuantity;
    if (remainingQuantity < 0) {
      remainingQuantity = 0;
     
    }
   
  }

  res.render("listing/show.ejs", {
    Order,
    remainingQuantity,
    
  });
};


module.exports.showroder = module.exports.showroder = async (req, res) => {
  try {
    //  Create order object
    const newOrder = new order(req.body.order);

    const query = req.body.order.address;
    // console.log("Address received:", query);

    let coordinates = [0, 0]; // default fallback

    // 2 Call Nominatim ONLY if address exists
    if (query && query.trim().length > 0) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "KrishibandhApp/1.0 (contact@krishibandh.com)"
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        coordinates = [
          Number(data[0].lon), // longitude
          Number(data[0].lat)  // latitude
        ];
      } else {
        console.log("⚠ Location not found for address:", query);
      }
    } else {
      console.log("Address is empty or undefined");
    }

    // 3️ Save geometry safely
    newOrder.geometry = {
      type: "Point",
      coordinates
    };

    // 4️ Save owner
    newOrder.owner = req.user._id;
    await newOrder.save();

    // 5️ Destructure order details
    const {
      companyName,
      cropName,
      quantity,
      price,
      description,
      address
    } = req.body.order;

    // 6️ Notify farmers
    const farmers = await User.find({ role: "farmer" });
    console.log("Farmers found:", farmers.length);

    for (let farmer of farmers) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: farmer.email,
          subject: `New Order from ${companyName} 🌾`,
          html: `
            <h2>New Order Available</h2>
            <p>Hello ${farmer.username},</p>
            <ul>
              <li><strong>Crop:</strong> ${cropName}</li>
              <li><strong>Quantity:</strong> ${quantity}</li>
              <li><strong>Price:</strong> ₹${price}</li>
              <li><strong>Description:</strong> ${description}</li>
              <li><strong>Address:</strong> ${address}</li>
            </ul>
            <p>कृपया login करून order पाहा 🌱</p>
          `
        });
      } catch (mailErr) {
        console.log("Mail error:", mailErr.message);
      }
    }

    // 7️Redirect success
    res.redirect("/orders");

  } catch (err) {
    console.error("Order creation error:", err);
    req.flash("error", "Order create problem");
    res.redirect("back");
  }
};



  module.exports.renderupdate = async(req,res)=>{
      let { id} = req.params;
      const Order = await order.findById(id);
      res.render("listing/edit.ejs",{Order});
  };

  module.exports.update = async(req,res)=>{
      let { id } = req.params;
      const Order = await order.findByIdAndUpdate(id,{...req.body.order});
      // console.log(Order);
      res.redirect(`/orders/${id}`);
  };

  module.exports.destroyorder = async(req,res)=>{
    let { id } = req.params;
    let delorder = await order.findByIdAndDelete(id);
    console.log(delorder);
    res.redirect("/orders");
};

