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
router.get('/', restrictTo(["CUSTOMER"]), async (req, res) => {
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

module.exports = router;