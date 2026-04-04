const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  companyName: String,
  cropName: String,

 
  quantity: Number,   // order create quantity


  originalQuantity: {
    type: Number
  },

  remainingQuantity: {
    type: Number
  },


  price: Number, // company price (per unit)

  description: String,
  address: String,

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  cotation: [{
    type: Schema.Types.ObjectId,
    ref: "cotation"
  }],
   geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      
    },
    coordinates: {
      type: [Number],

    }
 },
});

module.exports = mongoose.model("Order", orderSchema);
