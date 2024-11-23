const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const path = require('path');
const { restrictTo } = require("../middlewares/auth");

// Public routes
router.get('/signup', (req, res) => {
    return res.render('signup');
});

router.get('/login', (req, res) => {
    return res.render('login');
});

// Customer routes
router.get('/', restrictTo(["CUSTOMER","ADMIN"]), async (req, res) => {
    try {
        const allOrders = await Order.find({ customer: req.user._id });
        return res.render("home", { order: allOrders });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return res.status(500).render("error", { 
            message: "Failed to load orders. Please try again later." 
        });
    }
});



// Admin routes
router.get('/admin/orders', restrictTo(["ADMIN"]), async (req, res) => {
    try {
        const allOrders = await Order.find({})
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        return res.render("home", { order: allOrders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return res.status(500).render("error", { 
            message: "Failed to load orders. Please try again later." 
        });
    }
});

router.get('/categories/new', restrictTo(["ADMIN"]), (req, res) => {
    return res.render('add-category');
});

module.exports = router;