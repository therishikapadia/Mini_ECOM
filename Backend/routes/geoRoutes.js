const express = require('express');
const { addGeoData,getGeoData } = require('../controllers/geoController'); // Adjust the path

const router = express.Router();

// Define the route
router.post('/geoData', addGeoData);
router.get('/geoData', getGeoData);
module.exports = router;
