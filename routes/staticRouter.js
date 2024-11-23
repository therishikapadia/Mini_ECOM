const express = require('express');
const router = express.Router();

// Static router can be used for serving static files or other non-view routes
// const express=require('express')
const Order = require('../models/order')
const {restrictTo}=require("../middlewares/auth")


// router.get('/',restrictTo(["CUSTOMER","ADMIN"]),async(req,res)=>{
//     const allOrders= await Order.find({orderedBy:req.user._id})
//     return res.render("home",{order:allOrders})
// })

// router.get('/user/all',restrictTo(["ADMIN"]),async(req,res)=>{
//     const allOrders= await Order.find({})
//     return res.render("home",{order:allOrders})
// })
// router.get('/signup',async (req,res) => {
//     return res.render('signup')
// })
// router.get('/login',async (req,res) => {
//     return res.render('login')
// })
// router.get('/add-category',async (req,res) => {
//     return res.render('add-category')
// })
// module
module.exports = router;