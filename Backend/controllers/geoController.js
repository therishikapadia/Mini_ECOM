const redis = require('redis');

// Create a Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379', // Adjust the URL if your Redis server is hosted elsewhere
});

// Connect to Redis
redisClient.connect()
    .then(() => console.log('Connected to Redis'))
    .catch((err) => console.error('Redis connection error:', err));

// Controller function
const addGeoData = async (req, res) => {
    try {
        const { longitude, latitude, email } = req.body;

        // Validate input
        if (!longitude || !latitude || !name) {
            return res.status(400).json({ error: 'longitude, latitude, and name are required' });
        }

        // Add data to Redis geospatial set
        const geoKey = 'customer_locations'; // The key for the geospatial set
        await redisClient.geoAdd(geoKey, {
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            member: email,
        });

        res.status(201).json({ message: 'Location added successfully', data: { longitude, latitude, email } });
    } catch (error) {
        console.error('Error adding geo data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getGeoData = async (req, res) => {
    try {
        const { longitude, latitude } = req.query;

        // Validate input
        if (!longitude || !latitude) {
            return res.status(400).json({ error: 'longitude and latitude are required' });
        }

        const geoKey = 'customer_locations'; // The key for the geospatial set

        // Fetch all members sorted by proximity to the provided longitude/latitude
        const results = await redisClient.geoSearch(geoKey, {
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            radius: 10000, // Arbitrary large radius (in meters) to include all points
            unit: 'km', // Unit of distance (meters)
            sort: 'ASC', // Sort in ascending order
        });

        res.status(200).json({ message: 'Locations fetched successfully', data: results });
    } catch (error) {
        console.error('Error fetching geo data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Close the Redis connection when the server shuts down
process.on('SIGINT', async () => {
    await redisClient.quit();
    console.log('Redis connection closed');
    process.exit(0);
});

module.exports = { addGeoData,getGeoData };
