const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

async function calculateRoute(origin, destination) {
    try {
        const response = await client.directions({
            params: {
                origin: origin,
                destination: destination,
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        if (response.data.status === 'OK') {
            const route = response.data.routes[0];
            const path = route.overview_path.map(point => [point.lng(), point.lat()]);
            
            return {
                path,
                distance: route.legs[0].distance.value,
                duration: route.legs[0].duration.value
            };
        }
        throw new Error('Failed to calculate route');
    } catch (error) {
        console.error('Error calculating route:', error);
        throw error;
    }
}

module.exports = {
    calculateRoute
};
