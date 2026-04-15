const express = require('express');
const router = express.Router();
const { createForm, getForms, getResponses, deleteForm, updateForm } = require('../controllers/formController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createForm);
router.get('/', protect, getForms);
router.get('/:id/responses', protect, getResponses);
router.put('/:id', protect, updateForm);
router.delete('/:id', protect, deleteForm);

module.exports = router;
