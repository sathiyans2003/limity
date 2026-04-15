const express = require('express');
const router = express.Router();
const { createVcard, getVcards, deleteVcard } = require('../controllers/vcardController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createVcard);
router.get('/', protect, getVcards);
router.delete('/:id', protect, deleteVcard);

module.exports = router;
