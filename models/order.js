const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderStatus: {
    type: String,
    enum: ["Approved", "Shipped", "Delivered", "Cancelled", "Pending"],
    default: "Pending",
  },
},{timestamps:true});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
