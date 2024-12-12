const express = require('express');
const { addGeoData,getGeoData,setSelectedCustomers,getOptimizedRoute } = require('../controllers/geoController'); // Adjust the path
const { get } = require('mongoose');

const router = express.Router();

// Define the route
router.post('/geoData', addGeoData);
router.post('/geoData1', getGeoData);
router.get('/optimized_route',getOptimizedRoute)
router.post('/set_customers',setSelectedCustomers)

module.exports = router;
