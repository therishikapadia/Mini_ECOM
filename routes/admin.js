const express = require('express');
const router = express.Router();

const { restrictTo } = require('../middlewares/auth');
const {
    handleGetAllOrders,
    handleUpdateOrder,
    handleDeleteOrder
} = require('../controllers/order');

const {
    handleAddCustomer,
    handleDeleteCustomer,
    handleGetAllCustomers,
    handleUpdateCustomer
} = require('../controllers/admin/customerController');

const {
    handleAddNewProduct,
    handleDeleteNewProduct,
    handleUpdateNewProduct,
    handleGetNewProduct
} = require('../controllers/admin/categoryController');

const {
    handleAddInventory,
    handleDeleteInventory,
    handleGetInventory,
    handleUpdateInventory
} = require('../controllers/admin/inventoryController');

const {
    handleAddDeliveryAgent,
    handleDeleteDeliveryAgent,
    handleGetAllDeliveryAgents,
    handleUpdateDeliveryAgent
} = require('../controllers/admin/deliveryController');

// Inventory routes
router.route('/inventory')
    .post(handleAddInventory)
    .get(handleGetInventory)
    .patch(handleUpdateInventory)
    .delete(handleDeleteInventory);

// Categories routes
router.route('/categories')
    .post(handleAddNewProduct)
    .delete(handleDeleteNewProduct)
    .patch(handleUpdateNewProduct)
    .get(handleGetNewProduct);

// Customer routes
router.route('/customer')
    .post(handleAddCustomer)
    .patch(handleUpdateCustomer)
    .delete(handleDeleteCustomer)
    .get(handleGetAllCustomers);

// Delivery Agent routes
router.route('/delivery-agent')
    .post(handleAddDeliveryAgent)
    .patch(handleUpdateDeliveryAgent)
    .delete(handleDeleteDeliveryAgent)
    .get(handleGetAllDeliveryAgents);

// Orders routes
router.route('/orders')
    .get(handleGetAllOrders)
    .patch(handleUpdateOrder)
    .delete(handleDeleteOrder);

module.exports = router;