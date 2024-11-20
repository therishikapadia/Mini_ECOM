const express = require('express');
const router = express.Router();

const {restrictTo} = require('../middlewares/auth')

const {handleGetAllOrders,handleUpdateOrder,handleDeleteOrder} = require('../controllers/order')

const {handleAddCustomer, handleDeleteCustomer, handleGetAllCustomers, handleUpdateCustomer } = require('../controllers/admin/customerController');

const { handleAddNewProduct,handleDeleteNewProduct,handleUpdateNewProduct,handleGetNewProduct}=require('../controllers/admin/categoryController')

const {handleAddInventory,handleDeleteInventory,handleGetInventory,handleUpdateInventory} = require('../controllers/admin/inventoryController')

const {handleAddDeliveryAgent,handleDeleteDeliveryAgent,handleGetAllDeliveryAgents,handleUpdateDeliveryAgent}=require('../controllers/admin/deliveryController')

const {}=require('../controllers/admin/orderController')

//add new products to inventory
router.post('/inventory', handleAddInventory);
router.get('/inventory', handleGetInventory);
router.patch('/inventory', handleUpdateInventory);
router.delete('/inventory', handleDeleteInventory);

//add new type of products which you want to manage
router.post('/categories', handleAddNewProduct);
router.delete('/categories', handleDeleteNewProduct)
router.patch('/categories', handleUpdateNewProduct)
router.get('/categories', handleGetNewProduct)

//manage customer
router.post('/customer', handleAddCustomer);
router.patch('/customer', handleUpdateCustomer);
router.delete('/customer', handleDeleteCustomer);
router.get('/customer', handleGetAllCustomers);

//manage delivery agent
router.post('/delivery-agent', handleAddDeliveryAgent);
router.patch('/delivery-agent', handleUpdateDeliveryAgent);
router.delete('/delivery-agent', handleDeleteDeliveryAgent);
router.get('/delivery-agent', handleGetAllDeliveryAgents);

//manage orders
//add restrictTO after API testing
router.get('/orders',handleGetAllOrders);
router.patch('/orders',handleUpdateOrder);
router.delete('/orders', handleDeleteOrder);


module.exports = router;
