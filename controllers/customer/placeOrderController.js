const Product = require("../../models/inventory");
const Category = require("../../models/category");
const Order = require("../../models/order");
const {validateAttributes}=require('../../utils/validateAttributes')

const handlePlaceOrder = async (req, res) => {
    const { category, attributes, customer, quantity } = req.body;
  
    if (!category || !attributes || !customer || !quantity) {
      return res.status(400).json({ error: "Category, attributes, customer ID, and quantity are required." });
    }
  
    try {
      // Validate category existence
      const categoryData = await Category.findOne({ name: category });
      if (!categoryData) {
        return res.status(400).json({ error: "Invalid category" });
      }
  
      // Validate attributes
      const isValid = validateAttributes(attributes, categoryData.attributes);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid attributes for the given category." });
      }
  
      // Find a matching product in inventory
      const product = await Product.findOne({ category, attributes });
      if (!product) {
        return res.status(404).json({ error: "Product not available in inventory." });
      }
  
      // Create a new order with default status as 'Pending'
      const order = new Order({
        product: product._id,
        customer, // Referencing the customer ObjectId
        quantity,
        orderStatus: "Pending", // Default value
      });
  
      await order.save();
  
      res.status(201).json({
        message: "Order placed successfully.",
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to place order." });
    }
  };
  
// Helper function to validate attributes (reuse the same from admin module)

module.exports = { handlePlaceOrder };
