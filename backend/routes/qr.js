const express = require('express');
const router = express.Router();
const { createQR, getQRs, updateQR, getQRAnalytics, deleteQR } = require('../controllers/qrController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createQR);
router.get('/', protect, getQRs);
router.put('/:id', protect, updateQR);
router.get('/:id/analytics', protect, getQRAnalytics);
router.delete('/:id', protect, deleteQR);

module.exports = router;
