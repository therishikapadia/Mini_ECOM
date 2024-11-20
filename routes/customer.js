const express = require("express");
const router = express.Router();

const { restrictTo } = require("../middlewares/auth");

const {
  handleAddOrder,
  handleGetCustomerOrders,
  handleUpdateCustomerOrder,
} = require("../controllers/order");

//Manage orders
router.route("/order")
    .post(handleAddOrder)
    .get(handleGetCustomerOrders)
    .patch(handleUpdateCustomerOrder);

module.exports = router;