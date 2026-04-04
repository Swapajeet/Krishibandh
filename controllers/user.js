const User = require("../models/user.js");
const Order = require("../models/order.js");
const cotation = require("../models/cotation.js");
const transporter = require("../utils/mail.js");
const{remainingQuantity} = require("./order.js");

module.exports.renderSingup = (req, res) => res.render("auth/singup.ejs");

module.exports.Singup = async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = new User({ username, email, role });
  const saveuser = await User.register(user, password);
   await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Krishibandh 🌾",
      html: `
        <h2>Welcome to Krishibandh</h2>
        <p>Hello ${username},</p>
        <p>तुमचं Krishibandh मध्ये स्वागत आहे.</p>
        <p>आमच्यासोबत जोडल्याबद्दल धन्यवाद 🌱</p>               
      `
    });
  // console.log(saveuser);
  res.redirect("/login");
};

module.exports.renderlogin = (req, res) => res.render("auth/login.ejs");

module.exports.login = (req, res) => {
    if (req.user.role === "company") res.redirect("/compny/dashbord");
    else if(req.user.role === "farmer") res.redirect("/farmer/dashbord");
    else if(req.user.role === "branch") res.redirect("/branch/Dashbord");
    else res.redirect("/Storage/Dashbord");
  };

module.exports.compnydash = async(req, res) => {
  if (req.user.role !== "company") return res.redirect("/login");
    try {
      const currUser = req.user;

      // Fetch orders created by current user
      const orders = await Order.find({ owner: currUser._id }).populate('cotation');

      let totalIncome = 0;
      let totalOrders = orders.length;

      let outOfStockCount = 0; // counter

      const ordersWithStatus = orders.map(order => {
          totalIncome += (order.quantity || 0) * (order.price || 0);

          let totalDealQuantity = 0;
          if(order.cotation && order.cotation.length > 0){
              totalDealQuantity = order.cotation
                  .filter(c => c.status === "deal")
                  .reduce((sum, c) => sum + Number(c.quantity), 0);
          }

          const remainingQuantity = (order.quantity || 0) - totalDealQuantity;
          const outOfStock = remainingQuantity <= 0 && totalDealQuantity > 0;

          if(outOfStock){
              outOfStockCount++; // increment counter
          }

          return { ...order.toObject(), remainingQuantity, outOfStock };
      });

      console.log("Out of stock orders count:", outOfStockCount);

      res.render("compny/dashbord.ejs", {
          orders: ordersWithStatus,
          totalIncome,
          totalOrders,
          outOfStockCount // pass to EJS
      });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }

  
  
    
};  

module.exports.farmerdash = async (req, res) => {
  if (req.user.role !== "farmer") return res.redirect("/login");
  
   try {
        const currUser = req.user;

        // Fetch all cotations by this farmer
        const cotations = await cotation.find({ auther: currUser._id });

        //  Get all Order IDs related to these cotations
        const cotationIds = cotations.map(c => c._id);

        // Fetch Orders that include any of these cotations
        const orders = await Order.find({ cotation: { $in: cotationIds } }).populate('cotation');

        //  Map cotations → include order info, calculate income, remainingQuantity, outOfStock
        const cotationsWithOrder = cotations.map(c => {
            // Find parent order
            const order = orders.find(o => o.cotation.some(id => id.equals(c._id)));

            // Income for this cotation
            const income = (c.quantity || 0) * (order ? order.price : 0);

            // Total dealt quantity in order
            let totalDealQuantity = order ? order.cotation
                .filter(d => d.status === "Accepted")
                .reduce((sum, d) => sum + Number(d.quantity), 0) : 0;

            // Remaining quantity of order
            const remainingQuantity = order ? order.quantity - totalDealQuantity : 0;

            // Out of stock flag
            const outOfStock = remainingQuantity <= 0 && totalDealQuantity > 0;

            return { ...c.toObject(), order, income, remainingQuantity, outOfStock };
        });

        // 5️ Calculate totals
        const totalCotationCount = cotationsWithOrder.length;
        const totalOrderedQuantity = cotationsWithOrder.reduce((sum, c) => sum + Number(c.quantity || 0), 0);
        const totalIncome = cotationsWithOrder.reduce((sum, c) => sum + c.income, 0);

        res.render("farmer/dashbord.ejs", {
            cotations: cotationsWithOrder,
            totalCotationCount,
            totalOrderedQuantity,
            totalIncome
        });

    } catch(err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};
module.exports.branchdash = async (req, res) => {
  if (req.user.role !== "branch") return res.redirect("/login");

  res.render("branch/Dashbord.ejs", {
      });
}
module.exports.storagedash = async (req, res) => {
  if (req.user.role !== "Storage") return res.redirect("/login");

  res.render("storage/Dashbord.ejs", {
      });
}

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
      if(err){
       return next(err);
      }
       req.flash("success","you are logged out");
       res.redirect("/");
     });
   
};