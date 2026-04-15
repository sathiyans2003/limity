const express = require('express');
const router = express.Router();
const { getOverview, getLinkAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, getOverview);
router.get('/link/:id', protect, getLinkAnalytics);

module.exports = router;
