const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cotationSchema =  new Schema({
     productName:String,
   image:{
      filename:String,
      url:String,
    },
     quantity:{
       type:Number,
       defualt:0,
     },
     price:{
       type:Number,
     },
     auther:{
         type:Schema.Types.ObjectId,
          ref:"User",
     },
     status:{
        type:String,
         enum: ["pending", "Accepted","visting"],
         default:"pending",
     },
     createdAt:{
        type:Date,
        default:Date.now(),
     },

    //  auther:{
    //    type:Schema.Types.ObjectId,
    //    ref:"User",
    //  },

});

module.exports = mongoose.model("cotation",cotationSchema);