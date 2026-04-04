if(process.env.NODE_ENV!="production"){
    require('dotenv').config();

}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const order = require("./models/order.js");
const User = require("./models/user.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");


// const compnyRout = require("./route/compny.js");
const  orderRoute = require("./route/order.js");
const userRoute = require("./route/user.js");
const cotationRoute = require("./route/cotation.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const{validateListing} = require("./middlware.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const pageroute = require("./route/page.js");
const weatherRoute = require("./route/wheather");
const mandiRoutes = require('./route/mandi');
const StoragRoutes = require('./route/storage');
const branchRoutes = require('./route/branch.js');
const scannerRoute = require('./route/info.js');
const multer = require("multer");
const {stor} = require("./cloudConfig.js");
const upload = multer({stor});

const db_url = process.env.ATLAS_URI;
 main()
 .then(()=>{
        console.log("mongodb is connected");    
 })
 .catch((err)=>{
        console.log(err);``
 });
 async function main(){
    await mongoose.connect(db_url);
 }

// app.get("/",(req,res)=>{
//     res.send("i redyto go")
// });



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("SESSION STORE ERROR");
});

const sessionOption = {
       store,
       secret: process.env.SESSION_SECRET,
       saveUninitialized: true,
       cookie:{
              expires:Date.now()+7*24*60*60*1000,
              maxAge:7*24*60*60*1000,
              httpOnly:true,
       },
   };

   
    
   app.use(session(sessionOption));
   app.use(flash());

   app.use(passport.initialize());
   app.use(passport.session());
   passport.use(new LocalStrategy(User.authenticate()));
   passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
   app.use((req,res,next)=>{
       res.locals.success = req.flash("success");
       res.locals.error = req.flash("error");
       res.locals.currUser = req.user;
       next();
   });

 app.use(express.static(path.join(__dirname,"/public")));
app.use("/uploads", express.static("uploads"));

//    app.get("/demouser",async(req,res)=>{
//     let fakecompny = new Compny({
//         email:"ms@gmail.com",
//         username:"MS group of industres",
//         address:"A/p tasgon dist sangli",
//     });
//     let registercom = await Compny.register(fakecompny,"helloword");
//     res.send(registercom);
//    });
    ///compny dash 

// app.get("/compny",(req,res)=>{
//     res.render("compny/compnybord.ejs")
// });

// user
//  app.get("/farmer",(req,res)=>{
//     res.render("farmer/user.ejs");
//  });


 app.use("/orders",orderRoute);
 app.use("/",userRoute);
 app.use("/",cotationRoute);
 app.use("/",pageroute);
 app.use("/", weatherRoute);
 app.use("/", mandiRoutes);
 app.use("/",StoragRoutes);
 app.use("/",branchRoutes);
 app.use("/",scannerRoute);

//  app.use("/farmer",userRoute)
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "company") return res.redirect("/compny/dashbord");
         else if(req.user.role === "farmer") return res.redirect("/farmer/dashbord");
         else if(req.user.role === "branch") return res.redirect("/branch/Dashbord");
          else return res.redirect("/Storage/Dashbord")
        
    }
    // user login 
    res.render("listing/home.ejs");
});

// payment 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  try {

    const amount = Number(req.body.amount);

    console.log("Received Amount:", amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // paise madhe
      currency: "INR",
      receipt: "receipt_order_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {
    console.log("Razorpay Error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.send("Payment Successful ✅");
  } else {
    res.send("Payment Failed ❌");
  }
});


app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});


app.use((err,req,res,next)=>{
      let {statusCode=500,message="some this ging wrong"} = err;
       res.render("error.ejs",{message});
});


app.listen(8080, "0.0.0.0",()=>{
    console.log("server is listening on port 8080");

});

