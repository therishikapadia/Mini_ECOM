const Redis = require('redis');

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to redis
(async () => {
    await redisClient.connect();
})();

// Cache delivery location for 5 minutes
async function cacheDeliveryLocation(deliveryId, location) {
    await redisClient.set(
        `delivery:${deliveryId}:location`,
        JSON.stringify(location),
        {
            EX: 300 // 5 minutes
        }
    );
}

async function getDeliveryLocation(deliveryId) {
    const location = await redisClient.get(`delivery:${deliveryId}:location`);
    return location ? JSON.parse(location) : null;
}

module.exports = {
    redisClient,
    cacheDeliveryLocation,
    getDeliveryLocation
};
