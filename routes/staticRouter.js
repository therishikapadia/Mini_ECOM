const express = require('express');
const router = express.Router();

// Static router can be used for serving static files or other non-view routes
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

module.exports = router;