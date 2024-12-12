// Function to calculate distance
const calculateDistance = (loc1, loc2) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(loc2.latitude - loc1.latitude);
    const dLon = toRadians(loc2.longitude - loc1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(loc1.latitude)) *
            Math.cos(toRadians(loc2.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Function to optimize the route
const optimizeRoute = (currentLocation, locations) => {
    const route = [];
    let remaining = [...locations];
    let current = currentLocation;

    while (remaining.length) {
        const nearest = remaining.reduce((closest, loc) => {
            const distance = calculateDistance(current, loc);
            return !closest || distance < closest.distance
                ? { ...loc, distance }
                : closest;
        }, null);

        route.push(nearest);
        remaining = remaining.filter((loc) => loc.email !== nearest.email);
        current = { longitude: nearest.longitude, latitude: nearest.latitude };
    }

    return route.map((loc) => loc.email); // Return ordered customer emails
};

module.exports = { calculateDistance, optimizeRoute };
