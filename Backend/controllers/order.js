const Inventory = require("../models/inventory");
const Order = require("../models/order");

//admin
//pass quantity only if need to change
const handleUpdateOrder = async (req, res) => {
  const { orderId, orderStatus, quantity } = req.body;
  console.log(orderId, orderStatus, quantity)

  const validStatuses = ["Approved", "Shipped", "Delivered", "Cancelled"];

  // Validate orderId and orderStatus
  if (!orderId || !orderStatus || !validStatuses.includes(orderStatus)) {
    return res.status(400).json({ error: "Invalid order ID or status" });
  }

  // Validate quantity only if it's provided
  if (quantity !== undefined && (isNaN(quantity) || quantity < 1)) {
    return res.status(400).json({ error: "Invalid quantity provided" });
  }

  try {
    // Find the order and populate the product reference
    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // console.log("Current Order Quantity:", order.quantity);
    // console.log("New Quantity:", quantity);

    // Update inventory and order only if quantity is provided and different
    if (quantity !== undefined && quantity !== order.quantity) {
      // Calculate the difference in quantity
      const quantityDifference = quantity - order.quantity;

      // console.log("Quantity Difference:", quantityDifference);

      // Ensure stock is sufficient before updating
      const updatedProduct = await Inventory.findByIdAndUpdate(
        order.product._id,
        {
          $inc: { quantity: -quantityDifference }, // Adjust stock
        },
        { new: true } // Return the updated document
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found in inventory" });
      }

      // Check if stock went negative
      if (updatedProduct.quantity < 0) {
        // Rollback the stock update
        await Inventory.findByIdAndUpdate(order.product._id, {
          $inc: { quantity: quantityDifference }
        });

        return res.status(400).json({ error: "Insufficient stock" });
      }

      // console.log("Updated Product Stock:", updatedProduct.quantity);

      // Update the order quantity
      order.quantity = quantity;
    }

    // Update the order status
    order.orderStatus = orderStatus;

    // Save the updated order
    await order.save();

    // console.log("Final Order Quantity:", order.quantity);

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

//admin
const handleGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          isDeleted: false, // Only fetch non-deleted orders
        },
      },
      {
        $lookup: {
          from: "inventories", // Collection name for Inventory
          localField: "product", 
          foreignField: "_id", 
          as: "productDetails", 
        },
      },
      {
        $unwind: "$productDetails", // Unwind the productDetails array
      },
      {
        $lookup: {
          from: "categories", // Collection name for Category
          localField: "productDetails.attributeId",
          foreignField: "attributes._id", 
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails", // Unwind categoryDetails array
      },
      {
        $addFields: {
          productAttributes: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$categoryDetails.attributes",
                  as: "attr",
                  cond: {
                    $eq: ["$$attr._id", "$productDetails.attributeId"], 
                  },
                },
              },
              0,
            ],
          },
        },
      },
      // Lookup for customer details
      {
        $lookup: {
          from: "users", // Collection name for Users (customers)
          localField: "customer", // Join field from orders
          foreignField: "_id", // Join field from users
          as: "customerDetails", // The alias for customer data
        },
      },
      {
        $unwind: "$customerDetails", // Unwind the customerDetails array
      },
      {
        $project: {
          _id: 1,
          customer: 1,
          customerDetails: {
            _id: 1,
            name: 1,
            email: 1,
            delivery_address: 1,
            createdAt: 1,
          },
          quantity: 1,
          orderStatus: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          product: {
            _id: "$productDetails._id",
            category: "$productDetails.category",
            quantity: "$productDetails.quantity",
            attributes: "$productAttributes",
          },
        },
      },
    ]);

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//admin
const handleDeleteOrder = async (req, res) => {
  const { orderId } = req.body;

  // Validate orderId
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Find the order by ID and populate the product reference
    const order = await Order.findById(orderId).populate('product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Restore the product's stock quantity if the order was not already canceled
    if (order.orderStatus !== 'Cancelled') {
      const product = await Inventory.findById(order.product._id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found in inventory' });
      }

      // Increment the inventory quantity
      product.quantity += order.quantity;
      await product.save();
    }

    // Soft delete the order by setting isDeleted to true
    order.isDeleted = true;
    await order.save();

    res.status(200).json({ message: 'Order marked as deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to mark order as deleted' });
  }
};

//customer
const handleAddOrder = async (req, res) => {
  const { product, quantity , notes} = req.body;
  
  const customer = req.user?._id; // Retrieve the authenticated user ID
//   console.log("Authenticated user:", req.user);
//   console.log("Authorization header:", req.headers.authorization);

  if (!product || !quantity) {
    return res.status(400).json({ error: "Product and quantity are required" });
  }

  try {
    // Find the product in inventory
    const productData = await Inventory.findById(product);
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create the order
    const newOrder = new Order({
      product,
      quantity,
      customer,
      notes,
      orderStatus: "Pending",
      isDeleted:false,
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
      // Ensure the user is authenticated
      if (!req.user) {

        console.log('User not authenticated:', req.user);

        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
      }
      // const customerId=req.params.id
  
      const customerId = req.user._id; // Get the customer's ID from the authenticated user
  
      // Find all orders for the authenticated customer
      const orders = await Order.find({ customer: customerId ,isDeleted:false})
        .populate('product') // Populate product details
        .sort({ createdAt: -1 }); // Sort orders by the latest first
  
      if (!orders.length) {
        return res.status(404).json({ message: 'No orders found for this customer.' });
      }
      // console.log(orders)
      res.status(200).json({orders});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
  };
  
const handleUpdateCustomerOrder = async (req, res) => {
    const { orderId, quantity,notes } = req.body;
  
    // Validate input
    if (!orderId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Order ID and a valid quantity are required.' });
    }
  
    try {
      // Ensure the user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
      }
  
      // Find the order by ID and ensure it belongs to the customer
      const order = await Order.findOne({ _id: orderId, customer: req.user._id,isDeleted:false,notes}).populate('product');
      if (!order) {
        return res.status(404).json({ error: 'Order not found or does not belong to the user.' });
      }
  
      // Ensure the order is still in Pending state
      if (order.orderStatus !== 'Pending') {
        return res.status(400).json({ error: 'Only orders in Pending state can be updated.' });
      }
  
      // Update the order quantity only
      order.quantity = quantity;
      await order.save();
  
      res.status(200).json({ message: 'Order updated successfully.', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update the order.' });
    }
  };
  

module.exports = {
  handleAddOrder,
  handleGetAllOrders,
  handleGetCustomerOrders,
  handleUpdateOrder,
  handleDeleteOrder,
  handleUpdateCustomerOrder
};