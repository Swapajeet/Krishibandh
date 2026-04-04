// models/MandiRate.js
const mongoose = require('mongoose');

const mandiRateSchema = new mongoose.Schema({
  crop: String,
  market: String,
  price: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MandiRate', mandiRateSchema);
