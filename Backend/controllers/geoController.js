const { haversineDistance } = require('../utils/routeOptimization');

const processNearbyUsers = (req, res) => {
    const { users } = req.body;
  
    const adminLocation = {
      longitude: 72.59696188230406,
      latitude: 23.03965552350363,
    };
  
    if (!users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users provided',
      });
    }
  
    // Process each user and calculate distance
    const processedUsers = users.map((user) => {
      const email = user.email || user;
  
      if (!user.latitude || !user.longitude) {
        return {
          email,
          distance: null,
          error: 'Invalid coordinates',
        };
      }
  
      const distance = haversineDistance(
        adminLocation.latitude,
        adminLocation.longitude,
        user.latitude,
        user.longitude
      );
  
      return {
        email,
        distance: Number(distance.toFixed(2)), // Round to 2 decimal places
        coordinates: {
          latitude: user.latitude,
          longitude: user.longitude,
        },
      };
    });
  
    // Sort processed users by distance in ascending order
    const sortedUsers = processedUsers.sort((a, b) => {
      // Handle invalid coordinates (null distances) by pushing them to the end
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  
    // Send response after processing and sorting all users
    res.status(200).json({
      success: true,
      message: 'Nearby users fetched successfully',
      data: sortedUsers,
    });
  };
  

module.exports = { processNearbyUsers };
