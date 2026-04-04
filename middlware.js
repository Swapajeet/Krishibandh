 const order = require("./models/order.js");
 const ExpressError = require("./utils/ExpressError.js");
const{orderSchema} = require("./schema.js");

 module.exports.validateListing = (req, res, next) => {
   let { error } = orderSchema.validate(req.body);
 
   if (error) {
     let errMsg = error.details.map(el => el.message).join(",");
     throw new ExpressError(400, errMsg);
   }
   next();
 };

 module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
         req.session.redirectUrl = req.originalUrl;
      req.flash("error","you must be signed in first");
      return res.redirect("/login");
    }
    next();
};


 module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isCompany = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  if (req.user.role !== "company") {
    return res.status(403).send("Access denied");
  }

  next();
};


