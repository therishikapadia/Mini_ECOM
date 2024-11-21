const DeliveryDetails = require('../../models/delivery');
const { getIO } = require('../../services/socketService');
const { cacheDeliveryLocation, getDeliveryLocation } = require('../../services/redis');
const { calculateRoute } = require('../../services/googleMaps');

const DELIVERY_STATUSES = {
    ASSIGNED: 'assigned',
    IN_TRANSIT: 'in_transit',
    NEAR_DESTINATION: 'near_destination',
    DELIVERED: 'delivered'
};

// Update delivery agent's current location
async function updateLocation(req, res) {
    try {
        const { deliveryId, latitude, longitude, status } = req.body;
        const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
            last_updated: new Date()
        };

        // Validate status if provided
        if (status && !Object.values(DELIVERY_STATUSES).includes(status)) {
            return res.status(400).json({ error: 'Invalid delivery status' });
        }

        // Update location and status in MongoDB
        const updateDatad = {
            current_location: location
        };
        if (status) {
            updateDatad.status = status;
        }

        const delivery = await DeliveryDetails.findByIdAndUpdate(
            deliveryId,
            updateData,
            { new: true }
        );

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // Cache location in Redis
        await cacheDeliveryLocation(deliveryId, location);

        // Emit location update through Socket.io
        const io = getIO();
        const updateData = {
            deliveryId,
            location,
            status: delivery.status,
            estimatedArrival: delivery.estimated_arrival_time
        };

        io.to(`delivery:${deliveryId}`).emit('location-update', updateData);
        io.to('admin-dashboard').emit('delivery-update', updateData);

        res.status(200).json({ 
            message: 'Location updated successfully',
            delivery: updateData
        });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
}

// Get current location and route for a delivery
async function getDeliveryTracking(req, res) {
    try {
        const { deliveryId } = req.params;
        
        // Get cached location from Redis first
        let location = await getDeliveryLocation(deliveryId);
        
        // If not in cache, get from MongoDB
        if (!location) {
            const delivery = await DeliveryDetails.findById(deliveryId);
            location = delivery.current_location;
            if (location) {
                await cacheDeliveryLocation(deliveryId, location);
            }
        }

        res.status(200).json({
            location,
            route: req.delivery.route
        });
    } catch (error) {
        console.error('Tracking fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch tracking information' });
    }
}

// Calculate and update delivery route
async function updateDeliveryRoute(req, res) {
    try {
        const { deliveryId } = req.params;
        const delivery = await DeliveryDetails.findById(deliveryId);

        const route = await calculateRoute(
            delivery.order_details.pickup_address,
            delivery.order_details.delivery_address
        );

        delivery.route = route;
        await delivery.save();

        res.status(200).json({ message: 'Route updated successfully', route });
    } catch (error) {
        console.error('Route update error:', error);
        res.status(500).json({ error: 'Failed to update route' });
    }
}

module.exports = {
    updateLocation,
    getDeliveryTracking,
    updateDeliveryRoute
};