const express = require('express');
const router = express.Router();
const { generateAlt } = require('../controllers/altController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateAlt);

module.exports = router;
