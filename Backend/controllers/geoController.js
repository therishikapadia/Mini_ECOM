const redis = require('redis');
const { optimizeRoute } = require('../utils/routeOptimization');


// Create a Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379', // Adjust the URL if your Redis server is hosted elsewhere
});

const connectToRedis = async () => {
    try {
      await redisClient.connect();
      
      // Perform a simple test command to verify actual connection
      await redisClient.ping();
      console.log('Successfully connected to Redis');
    } catch (err) {
      console.error('Failed to connect to Redis:', err.message);
      
      // Optional: Implement reconnection logic
      setTimeout(connectToRedis, 5000); // Try to reconnect after 5 seconds
    }
  };
  
  connectToRedis();

// Controller function
const addGeoData = async (req, res) => {
    try {
        const { longitude, latitude, email ,name } = req.body;

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
            console.log('Latitude:', latitude, 'Longitude:', longitude);
            return res.status(400).json({ error: 'Longitude and latitude are required' });
        }

        const geoKey = 'customer_locations'; // The key for the geospatial set

        // Fetch all locations
        const allLocations = await redisClient.zRange(geoKey, 0, -1, 'WITHSCORES');

        // Manual distance calculation (Haversine formula)
        const calculateDistance = (lon1, lat1, lon2, lat2) => {
            const R = 6371; // Radius of the Earth in kilometers
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        // Filter and calculate distances
        const nearbyLocations = allLocations.reduce((acc, location, index) => {
            if (index % 2 === 0) { // Even indices are locations
                const [lon, lat] = JSON.parse(location);
                const distance = calculateDistance(
                    parseFloat(longitude), 
                    parseFloat(latitude), 
                    lon, 
                    lat
                );

                if (distance <= 100) { // Within 100 km
                    acc.push({
                        location,
                        distance: distance.toFixed(2)
                    });
                }
            }
            return acc;
        }, []);

        // Sort by distance
        nearbyLocations.sort((a, b) => a.distance - b.distance);

        res.status(200).json({ 
            message: 'Locations fetched successfully', 
            data: nearbyLocations 
        });

    } catch (error) {
        console.error('Error fetching geo data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
const setSelectedCustomers = async (req, res) => {
    try {
        const { customerEmails } = req.body;

        if (!customerEmails || !Array.isArray(customerEmails) || customerEmails.length === 0) {
            return res.status(400).json({ error: 'A list of customer emails is required' });
        }

        // Store selected customers in a Redis set
        const selectedKey = 'selected_customers';
        await redisClient.del(selectedKey); // Clear any previous selection
        await redisClient.sAdd(selectedKey, customerEmails);

        res.status(200).json({
            message: 'Selected customers saved successfully',
            data: customerEmails,
        });
    } catch (error) {
        console.error('Error setting selected customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOptimizedRoute = async (req, res) => {
    try {
        const { longitude, latitude } = req.query;

        if (!longitude || !latitude) {
            return res.status(400).json({ error: 'longitude and latitude are required' });
        }

        const geoKey = 'customer_locations';
        const selectedKey = 'selected_customers';

        // Fetch selected customer emails
        const selectedEmails = await redisClient.sMembers(selectedKey);

        if (!selectedEmails || selectedEmails.length === 0) {
            return res.status(404).json({ error: 'No selected customers for delivery' });
        }

        // Get locations of selected customers
        const locations = await Promise.all(
            selectedEmails.map(async (email) => {
                const [lon, lat] = await redisClient.geoPos(geoKey, email);
                if (!lon || !lat) return null;
                return { email, longitude: parseFloat(lon), latitude: parseFloat(lat) };
            })
        );

        // Filter out invalid or missing locations
        const validLocations = locations.filter((loc) => loc !== null);

        if (validLocations.length === 0) {
            return res.status(404).json({ error: 'No valid locations found for selected customers' });
        }

        // Optimize route
        const currentLocation = { longitude: parseFloat(longitude), latitude: parseFloat(latitude) };
        const optimizedRoute = optimizeRoute(currentLocation, validLocations);

        res.status(200).json({
            message: 'Optimized delivery route calculated successfully',
            route: optimizedRoute,
        });
    } catch (error) {
        console.error('Error fetching optimized route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// Close the Redis connection when the server shuts down
process.on('SIGINT', async () => {
    await redisClient.quit();
    console.log('Redis connection closed');
    process.exit(0);
});

module.exports = { addGeoData,getGeoData,getOptimizedRoute,setSelectedCustomers};
