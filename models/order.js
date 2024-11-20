const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model in the Inventory
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["POF shrink film", "BOPP Self Adhesive Tape", "Box strapping Role"], // List all possible categories
  },
  attributes: {
    type: Object,
    required: true,
    
        },
  orderedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
  },
  orderStatus: {
    type: String,
    enum: ["Approved", "Shipped", "Delivered", "Cancelled", "Pending"],
    default: "Pending",
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
