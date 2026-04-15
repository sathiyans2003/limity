const express = require('express');
const router = express.Router();
const { createLink, getLinks, editLink, deleteLink, toggleLink, checkSlug } = require('../controllers/linkController');
const { protect, checkFreePlanLimit } = require('../middleware/auth');

router.get('/check-slug', protect, checkSlug);
router.post('/create', protect, checkFreePlanLimit, createLink);
router.get('/', protect, getLinks);
router.put('/:id', protect, editLink);
router.delete('/:id', protect, deleteLink);
router.put('/:id/toggle', protect, toggleLink);

module.exports = router;
