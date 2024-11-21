const socketIO = require('socket.io');
const { getDeliveryLocation, cacheDeliveryLocation } = require('./redis');

let io;
let activeDeliveries = new Map(); // Track active deliveries

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    return io;
}

function initializeSocketEvents(io) {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Admin dashboard connection
        socket.on('admin-connect', () => {
            socket.join('admin-dashboard');
            socket.emit('active-deliveries', Array.from(activeDeliveries.values()));
        });

        // Delivery tracking room
        socket.on('track-delivery', async (deliveryId) => {
            socket.join(`delivery:${deliveryId}`);
            const location = await getDeliveryLocation(deliveryId);
            if (location) {
                socket.emit('location-update', { deliveryId, location });
            }
        });

        // Real-time location updates
        socket.on('update-location', async (data) => {
            const { deliveryId, location, status } = data;
            const deliveryData = {
                deliveryId,
                location,
                status,
                lastUpdate: new Date()
            };
            
            await cacheDeliveryLocation(deliveryId, location);
            activeDeliveries.set(deliveryId, deliveryData);

            // Emit to specific delivery room
            io.to(`delivery:${deliveryId}`).emit('location-update', deliveryData);
            
            // Emit to admin dashboard
            io.to('admin-dashboard').emit('delivery-update', deliveryData);
        });

        // Delivery status updates
        socket.on('status-update', async (data) => {
            const { deliveryId, status } = data;
            const deliveryData = activeDeliveries.get(deliveryId);
            if (deliveryData) {
                deliveryData.status = status;
                deliveryData.lastUpdate = new Date();
                io.to(`delivery:${deliveryId}`).emit('status-update', deliveryData);
                io.to('admin-dashboard').emit('delivery-update', deliveryData);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}

module.exports = {
    initializeSocket,
    initializeSocketEvents,
    getIO
};