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

route.post(
  "/orders/:id/cotation",
  isLoggedIn, 
  upload.single("cotation[image]"),
  wrapAsync(async (req, res) => {

    const order = await Order.findById(req.params.id);

    const newcotation = new Cotation(req.body.cotation);

    newcotation.auther = req.user._id; 
     console.log(newcotation.auther);
    if (req.file) {
      newcotation.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    order.cotation.push(newcotation._id);

    await newcotation.save();
    await order.save();

    req.flash("success", "New cotation is created!");
    res.redirect(`/orders/${order._id}`);
  })
);


route.delete("/orders/:id/cotation/:cotationId", async (req, res) => {
  let { id, cotationId } = req.params;


  await Order.findByIdAndUpdate(id, {
    $pull: { cotation: cotationId },
  });
  await Cotation.findByIdAndDelete(cotationId);

  res.redirect(`/orders/${id}`);
});

route.get("/orders/:id/cotation/:cotationId/update",async(req,res)=>{
    let{id,cotationId} = req.params;
    const order = await Order.findById(id);
    const cotation = await Cotation.findById(cotationId);
    console.log(cotation);
    res.render("listing/update.ejs",{cotation,order});

});

route.put("/orders/:id/cotation/:cotationId",async(req,res)=>{
    let {id,cotationId} = req.params;
    //  const order = await Order.findByIdAndUpdate(id,{...req.body.order});
     const cotation = await Cotation.findByIdAndUpdate(cotationId,{...req.body.cotation});
    console.log(cotation);
    res.redirect(`/orders/${id}`);
})

route.put(
  "/orders/:orderId/cotation/:cotationId/status",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    const { orderId, cotationId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId)
      .populate("owner");

    const cotation = await Cotation.findById(cotationId)
      .populate("auther");

    //  only company can update
   if (!req.user) {
  req.flash("error", "Login required");
  return res.redirect("/login");
}

//  If user is company → must be order owner
if (req.user.role === "company") {
  if (!order.owner || order.owner.toString() !== req.user._id.toString()) {
    req.flash("error", "Not allowed");
    return res.redirect("back");
  }
}

//  If user is branch → allow
else if (req.user.role === "branch") {
  // allowed
}

// Others not allowed
else {
  req.flash("error", "Not allowed");
  return res.redirect("back");
}

    cotation.status = status;
    await cotation.save();

    // ✅ ONLY when DEAL
    if (status === "visting") {

      const pdfPath = await generateInvoice({
        order,
        cotation,
        farmer: cotation.auther,
        company: order.owner
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: cotation.auther.email,
        subject: "🎉 Deal Confirmed - Invoice Attached",
        html: `
          <p>Hello ${cotation.auther.username},</p>
          <p>Your cotation has been <strong>ACCEPTED</strong>.</p>
          <p>Please find the invoice attached.</p>
        `,
        attachments: [
          {
            filename: "invoice.pdf",
            path: pdfPath
          }
        ]
      });
    }

    req.flash("success", `Cotation ${status} successfully`);
    res.redirect(`/orders/${orderId}`);
  })
);




module.exports = route;
