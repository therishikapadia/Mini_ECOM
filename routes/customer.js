const express=require('express')
const router=express.Router()
const {handlePlaceOrder} = require('../controllers/customer/placeOrderController')

router.post('/placeOrder',handlePlaceOrder)


module.exports=router