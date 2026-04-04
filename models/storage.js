const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const preserveSchema =  new Schema({
    cropName:{
        type:String,
        required:true,
    },

    category:{
        type:String,
        required:true,
    },
   
     preserveCount:{
       type:Number,
       defualt:0,
     },
     cropImages:{
      filename:String,
      url:String,
    },
     description:{
       type:String,
     },
     instructions:{
        type:String,
     },
        temperature:{
        type:Number,
        },

     auther:{
         type:Schema.Types.ObjectId,
          ref:"User",
     },
     status:{
        type:String,
         enum: ["pending", "deal"],
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

module.exports = mongoose.model("preseve",preserveSchema);