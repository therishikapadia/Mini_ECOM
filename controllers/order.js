const Inventory = require("../models/inventory");
const Order = require("../models/order");

//admin
const handleUpdateOrder = async (req, res) => {
  const { orderId, orderStatus } = req.body;

  const validStatuses = ["Approved", "Shipped", "Delivered", "Cancelled"];

  if (!orderId || !orderStatus || !validStatuses.includes(orderStatus)) {
    return res.status(400).json({ error: "Invalid order ID or status" });
  }

  try {
    // Find the order
    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Handle cancellation (restore inventory)
    if (orderStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
      const product = await Product.findById(order.product._id);
      product.attributes.quantity += order.quantity;
      await product.save();
    }

    // Update the order status
    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

//admin
const handleGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("product")
      .populate("customer"); // Assuming customer is referenced in the order

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const handleDeleteOrder = async (req, res) => {
    const { orderId } = req.body;
  
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
  
    try {
      // Find the order by ID
      const order = await Order.findById(orderId).populate('product');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // If the order was not canceled, restore the product's stock quantity
      if (order.orderStatus !== 'Cancelled') {
        const product = await Product.findById(order.product._id);
        product.attributes.quantity += order.quantity; // Restore the stock
        await product.save();
      }
  
      // Delete the order
      await order.remove();
  
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  };

//customer
const handleAddOrder = async (req, res) => {
  const { product, quantity } = req.body;

  const customer = req.user?._id; // Retrieve the authenticated user ID

  if (!product || !quantity) {
    return res.status(400).json({ error: "Product and quantity are required" });
  }

  try {
    // Find the product in inventory
    const productData = await Inventory.findById(product);
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if enough stock is available
    if (productData.attributes.quantity < quantity) {
      return res
        .status(400)
        .json({ error: "Insufficient stock for this product" });
    }

    // Deduct the quantity from inventory
    productData.attributes.quantity -= quantity;
    await productData.save();

    // Create the order
    const newOrder = new Order({
      product,
      quantity,
      customer,
      orderStatus: "Pending",
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to place order" });
  }
};

const handleGetCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user._id; // Customer ID from authenticated user

    const orders = await Order.find({ customer: customerId })
      .populate("product")
      .populate("customer");

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  handleAddOrder,
  handleGetAllOrders,
  handleGetCustomerOrders,
  handleUpdateOrder,
  handleDeleteOrder
};
