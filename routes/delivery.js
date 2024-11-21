const express = require('express');
const router = express.Router();
const { validateLocationUpdate, canAccessDeliveryTracking, isAdmin } = require('../middlewares');
const { 
    updateLocation, 
    getDeliveryTracking, 
    updateDeliveryRoute 
} = require('../controllers/delivery/trackingController');


// Update delivery agent's location
router.post('/location', validateLocationUpdate, updateLocation);

// Get delivery tracking information
router.get('/track/:deliveryId', canAccessDeliveryTracking, getDeliveryTracking);

// Update delivery route
router.post('/route/:deliveryId', canAccessDeliveryTracking, updateDeliveryRoute);

// Admin dashboard view
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/delivery-dashboard');
});

// Get active deliveries
router.get('/active', isAdmin, async (req, res) => {
    try {
        const activeDeliveries = await DeliveryDetails.find({
            status: { $nin: ['delivered', 'cancelled'] }
        }).populate('delivery_agent');
        res.json(activeDeliveries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active deliveries' });
    }
});

module.exports = router;