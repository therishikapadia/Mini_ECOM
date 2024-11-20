const Order = require('../models/order')

 const handlePlaceOrder =async (req,res)=>{
    const body=req.body
    if (!body.category || !body.attributes || !body.productId || !body.orderStatus || 
        !body.orderedBy){
        return res.status(400).json({err:"please enter all data"})
    }
    const order = await Order.create({
        category:body.category,
        attributes:body.attributes,
        productId:body.productId,
        orderStatus:body.orderStatus,
        orderedBy:body.orderedBy
    })
    res.status(201).json(order)
    }

module.exports={handlePlaceOrder}

