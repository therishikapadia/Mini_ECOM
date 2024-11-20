const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  attributes: {
    type: Object,
    required: true,
    default: {
      quantity: 0, // Add quantity as part of attributes
    },
  },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
