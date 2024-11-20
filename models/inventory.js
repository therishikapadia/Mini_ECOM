const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  attributes: {
    type: Object,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
