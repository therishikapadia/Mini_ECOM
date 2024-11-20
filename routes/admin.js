const express = require('express');
const router = express.Router();
const {handleAddCustomer, handleDeleteCustomer, handleGetAllCustomers, handleUpdateCustomer } = require('../controllers/admin/customerController');

const {handleInventory, handleAddNewProduct}=require('../controllers/admin/inventoryController')

const {handleAddDeliveryAgent,handleDeleteDeliveryAgent,handleGetAllDeliveryAgents,handleUpdateDeliveryAgent}=require('../controllers/admin/deliveryController')

//add new products to inventory
router.post('/addNewProduct', handleInventory);

//add new type of products which you want to manage
router.post('/add-categories', handleAddNewProduct);

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
router.get('/orders', handleGetAllOrders);
router.patch('/orders', handleUpdateOrder);
router.delete('/orders', handleDeleteOrder);
router.post('/orders', handleAddOrder);


module.exports = router;
