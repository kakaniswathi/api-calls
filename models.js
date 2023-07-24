// models.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  dateOfSale: { type: Date, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  isSold: { type: Boolean, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = { Product };
